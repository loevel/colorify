import { SavedPage, GeneratedImage } from "../types";

const getStorageKey = (userId: string) => `colorcraft_library_${userId}`;

export const getLibrary = (userId: string): SavedPage[] => {
  try {
    const data = localStorage.getItem(getStorageKey(userId));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load library", e);
    return [];
  }
};

export const saveToLibrary = (
  userId: string,
  childName: string, 
  theme: string, 
  image: GeneratedImage
): SavedPage => {
  const library = getLibrary(userId);
  
  // Check if already exists to avoid duplicates
  const existing = library.find(p => p.id === image.id);
  if (existing) return existing;

  const newPage: SavedPage = {
    id: image.id || Date.now().toString(),
    originalUrl: image.url,
    thumbnailUrl: image.url, // Using same for now, could resize in real app
    theme,
    childName,
    createdAt: Date.now(),
    lastModified: Date.now(),
    palette: image.palette || []
  };

  const updatedLibrary = [newPage, ...library];
  
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updatedLibrary));
  } catch (e) {
    console.error("Storage quota exceeded", e);
    alert("Local storage is full. Please delete some old drawings.");
  }
  
  return newPage;
};

export const updatePageWork = (userId: string, id: string, coloredDataUrl: string) => {
  const library = getLibrary(userId);
  const index = library.findIndex(p => p.id === id);
  
  if (index !== -1) {
    library[index] = {
      ...library[index],
      coloredUrl: coloredDataUrl,
      thumbnailUrl: coloredDataUrl, // Update thumbnail to show progress
      lastModified: Date.now()
    };
    localStorage.setItem(getStorageKey(userId), JSON.stringify(library));
  }
};

export const deletePage = (userId: string, id: string) => {
  const library = getLibrary(userId);
  const updated = library.filter(p => p.id !== id);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
  return updated;
};
