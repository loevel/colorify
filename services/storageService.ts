
import { SavedPage, GeneratedImage, User } from "../types";
import { db, storage } from "./firebaseConfig";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  collectionGroup,
  query,
  limit,
  orderBy
} from "firebase/firestore";
import { 
  ref, 
  uploadString, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";

// Helper: Sanitize theme name to be used as a Document ID
const getThemeId = (theme: string) => {
  return theme.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'default_theme';
};

/**
 * Resizes and compresses an image to WebP format.
 */
const optimizeImage = (dataUrl: string, maxWidth: number, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/webp', quality));
    };
    img.onerror = (err) => reject(err);
  });
};

const uploadImageToStorage = async (userId: string, imageId: string, dataUrl: string, type: 'originals' | 'colored' | 'thumbnails'): Promise<string> => {
  const storageRef = ref(storage, `users/${userId}/${type}/${imageId}.webp`);
  await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(storageRef);
};

export const getLibrary = async (userId: string): Promise<SavedPage[]> => {
  try {
    const themesRef = collection(db, "users", userId, "themes");
    const themesSnapshot = await getDocs(themesRef);
    
    let allPages: SavedPage[] = [];

    const promises = themesSnapshot.docs.map(async (themeDoc) => {
      const pagesRef = collection(db, "users", userId, "themes", themeDoc.id, "pages");
      const pagesSnapshot = await getDocs(pagesRef);
      return pagesSnapshot.docs.map(doc => doc.data() as SavedPage);
    });

    const results = await Promise.all(promises);
    results.forEach(pages => allPages.push(...pages));

    return allPages.sort((a, b) => b.lastModified - a.lastModified);
  } catch (e) {
    console.error("Failed to fetch library from Firestore", e);
    return [];
  }
};

export const saveToLibrary = async (
  userId: string,
  childName: string, 
  theme: string, 
  image: GeneratedImage
): Promise<SavedPage> => {
  const pageId = image.id || Date.now().toString();
  const themeId = getThemeId(theme);
  
  const [optimizedOriginal, thumbnailData] = await Promise.all([
    optimizeImage(image.url, 2048, 0.9),
    optimizeImage(image.url, 300, 0.7)
  ]);

  const [storageUrl, thumbUrl] = await Promise.all([
    uploadImageToStorage(userId, pageId, optimizedOriginal, 'originals'),
    uploadImageToStorage(userId, pageId, thumbnailData, 'thumbnails')
  ]);

  const newPage: SavedPage = {
    id: pageId,
    originalUrl: storageUrl,
    thumbnailUrl: thumbUrl,
    theme,
    childName,
    createdAt: Date.now(),
    lastModified: Date.now(),
    palette: image.palette || []
  };

  try {
    const themeRef = doc(db, "users", userId, "themes", themeId);
    await setDoc(themeRef, { 
      name: theme, 
      lastModified: Date.now() 
    }, { merge: true });

    const pageRef = doc(db, "users", userId, "themes", themeId, "pages", pageId);
    await setDoc(pageRef, newPage);

  } catch (e) {
    console.error("Failed to save to Firestore", e);
    throw e;
  }
  
  return newPage;
};

export const updatePageWork = async (userId: string, theme: string, id: string, coloredDataUrl: string) => {
  try {
    const themeId = getThemeId(theme);

    const [optimizedColored, thumbnailData] = await Promise.all([
      optimizeImage(coloredDataUrl, 2048, 0.85),
      optimizeImage(coloredDataUrl, 300, 0.7)
    ]);

    const [coloredStorageUrl, thumbUrl] = await Promise.all([
      uploadImageToStorage(userId, id, optimizedColored, 'colored'),
      uploadImageToStorage(userId, id, thumbnailData, 'thumbnails')
    ]);

    const pageRef = doc(db, "users", userId, "themes", themeId, "pages", id);
    await updateDoc(pageRef, {
      coloredUrl: coloredStorageUrl,
      thumbnailUrl: thumbUrl,
      lastModified: Date.now()
    });

    const themeRef = doc(db, "users", userId, "themes", themeId);
    await updateDoc(themeRef, { lastModified: Date.now() }).catch(() => {});

  } catch (e) {
    console.error("Failed to update page", e);
    throw e;
  }
};

export const deletePage = async (userId: string, theme: string, id: string) => {
  try {
    const themeId = getThemeId(theme);
    await deleteDoc(doc(db, "users", userId, "themes", themeId, "pages", id));
    
    const originalRef = ref(storage, `users/${userId}/originals/${id}.webp`);
    const coloredRef = ref(storage, `users/${userId}/colored/${id}.webp`);
    const thumbRef = ref(storage, `users/${userId}/thumbnails/${id}.webp`);
    
    deleteObject(originalRef).catch(() => {});
    deleteObject(coloredRef).catch(() => {});
    deleteObject(thumbRef).catch(() => {});

    // Legacy support
    const legacyOriginalRef = ref(storage, `users/${userId}/originals/${id}.png`);
    deleteObject(legacyOriginalRef).catch(() => {});

  } catch (e) {
    console.error("Failed to delete page", e);
    throw e;
  }
};

// --- ADMIN FUNCTIONS ---

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (e) {
    console.error("Admin: Failed to get all users", e);
    return [];
  }
};

export const getRecentGlobalImages = async (limitCount = 20): Promise<SavedPage[]> => {
  try {
    // collectionGroup allows querying across all 'pages' subcollections
    const pagesQuery = query(
      collectionGroup(db, 'pages'), 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    const snapshot = await getDocs(pagesQuery);
    return snapshot.docs.map(doc => doc.data() as SavedPage);
  } catch (e) {
    // Indexing might be required for this query in Firestore
    console.warn("Admin: Index required for collectionGroup query. Check console.", e);
    return [];
  }
};
