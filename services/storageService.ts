import { SavedPage, GeneratedImage } from "../types";
import { db, storage } from "./firebaseConfig";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  updateDoc
} from "firebase/firestore";
import { 
  ref, 
  uploadString, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";

// Helper: Upload Base64 Data URL to Firebase Storage
const uploadImageToStorage = async (userId: string, imageId: string, dataUrl: string, type: 'originals' | 'colored'): Promise<string> => {
  const storageRef = ref(storage, `users/${userId}/${type}/${imageId}.png`);
  await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(storageRef);
};

export const getLibrary = async (userId: string): Promise<SavedPage[]> => {
  try {
    const q = query(collection(db, "users", userId, "library"), orderBy("lastModified", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as SavedPage);
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
  
  // 1. Upload the generated image to Firebase Storage
  // (We store the high-res original separately so we can layer color on it later)
  const storageUrl = await uploadImageToStorage(userId, pageId, image.url, 'originals');

  const newPage: SavedPage = {
    id: pageId,
    originalUrl: storageUrl, // Points to Firebase Storage URL
    thumbnailUrl: storageUrl,
    theme,
    childName,
    createdAt: Date.now(),
    lastModified: Date.now(),
    palette: image.palette || []
  };

  // 2. Save metadata to Firestore
  try {
    await setDoc(doc(db, "users", userId, "library", pageId), newPage);
  } catch (e) {
    console.error("Failed to save to Firestore", e);
    throw e;
  }
  
  return newPage;
};

export const updatePageWork = async (userId: string, id: string, coloredDataUrl: string) => {
  try {
    // 1. Upload the colored work to Storage
    const coloredStorageUrl = await uploadImageToStorage(userId, id, coloredDataUrl, 'colored');

    // 2. Update Firestore document
    const pageRef = doc(db, "users", userId, "library", id);
    await updateDoc(pageRef, {
      coloredUrl: coloredStorageUrl,
      thumbnailUrl: coloredStorageUrl,
      lastModified: Date.now()
    });
  } catch (e) {
    console.error("Failed to update page", e);
    throw e;
  }
};

export const deletePage = async (userId: string, id: string) => {
  try {
    // 1. Delete Firestore entry
    await deleteDoc(doc(db, "users", userId, "library", id));
    
    // 2. Try to delete images from Storage (Best effort, ignore if not found)
    const originalRef = ref(storage, `users/${userId}/originals/${id}.png`);
    const coloredRef = ref(storage, `users/${userId}/colored/${id}.png`);
    
    deleteObject(originalRef).catch(() => {}); // Ignore error if it doesn't exist
    deleteObject(coloredRef).catch(() => {});
    
  } catch (e) {
    console.error("Failed to delete page", e);
    throw e;
  }
};
