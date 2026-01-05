import { SavedPage, GeneratedImage } from "../types";
import { db, storage } from "./firebaseConfig";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc
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

// Helper: Upload Base64 Data URL to Firebase Storage
const uploadImageToStorage = async (userId: string, imageId: string, dataUrl: string, type: 'originals' | 'colored'): Promise<string> => {
  const storageRef = ref(storage, `users/${userId}/${type}/${imageId}.png`);
  await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(storageRef);
};

export const getLibrary = async (userId: string): Promise<SavedPage[]> => {
  try {
    // 1. Get all Themes first
    const themesRef = collection(db, "users", userId, "themes");
    const themesSnapshot = await getDocs(themesRef);
    
    let allPages: SavedPage[] = [];

    // 2. For each theme, get the pages from the subcollection
    // Note: In a production app with huge data, a Collection Group query would be better,
    // but this is efficient enough for personal libraries.
    const promises = themesSnapshot.docs.map(async (themeDoc) => {
      const pagesRef = collection(db, "users", userId, "themes", themeDoc.id, "pages");
      const pagesSnapshot = await getDocs(pagesRef);
      return pagesSnapshot.docs.map(doc => doc.data() as SavedPage);
    });

    const results = await Promise.all(promises);
    results.forEach(pages => allPages.push(...pages));

    // Sort by date descending (newest first)
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
  
  // 1. Upload the generated image to Firebase Storage
  const storageUrl = await uploadImageToStorage(userId, pageId, image.url, 'originals');

  const newPage: SavedPage = {
    id: pageId,
    originalUrl: storageUrl,
    thumbnailUrl: storageUrl,
    theme,
    childName,
    createdAt: Date.now(),
    lastModified: Date.now(),
    palette: image.palette || []
  };

  try {
    // 2. Ensure the Theme Collection/Document exists
    const themeRef = doc(db, "users", userId, "themes", themeId);
    await setDoc(themeRef, { 
      name: theme, 
      lastModified: Date.now() 
    }, { merge: true });

    // 3. Save the Page into the Theme's subcollection
    // Path: users/{userId}/themes/{themeId}/pages/{pageId}
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

    // 1. Upload the colored work to Storage
    const coloredStorageUrl = await uploadImageToStorage(userId, id, coloredDataUrl, 'colored');

    // 2. Update Firestore document inside the specific theme subcollection
    const pageRef = doc(db, "users", userId, "themes", themeId, "pages", id);
    await updateDoc(pageRef, {
      coloredUrl: coloredStorageUrl,
      thumbnailUrl: coloredStorageUrl,
      lastModified: Date.now()
    });

    // Update theme last modified too
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

    // 1. Delete Firestore entry from the theme subcollection
    await deleteDoc(doc(db, "users", userId, "themes", themeId, "pages", id));
    
    // 2. Try to delete images from Storage
    const originalRef = ref(storage, `users/${userId}/originals/${id}.png`);
    const coloredRef = ref(storage, `users/${userId}/colored/${id}.png`);
    
    deleteObject(originalRef).catch(() => {});
    deleteObject(coloredRef).catch(() => {});
    
  } catch (e) {
    console.error("Failed to delete page", e);
    throw e;
  }
};