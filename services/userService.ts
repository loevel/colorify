
import { doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Child, AccountType } from "../types";

export const addChildToUser = async (userId: string, name: string): Promise<Child> => {
  const userRef = doc(db, "users", userId);
  
  // Enforce limit of 4 children for margin safety
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    const userData = snapshot.data();
    const currentChildren = userData.children || [];
    if (currentChildren.length >= 4) {
      throw new Error("Maximum limit of 4 child profiles reached.");
    }
  }

  const newChild: Child = {
    id: Date.now().toString(),
    name: name.trim()
  };

  // Use setDoc with merge to ensure children array exists or is created
  await setDoc(userRef, {
    children: arrayUnion(newChild)
  }, { merge: true });

  return newChild;
};

export const updateChild = async (userId: string, childId: string, newName: string): Promise<void> => {
  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);
  
  if (snapshot.exists()) {
    const userData = snapshot.data();
    const children: Child[] = userData.children || [];
    
    // Find and update the specific child
    const updatedChildren = children.map(child => {
      if (child.id === childId) {
        return { ...child, name: newName.trim() };
      }
      return child;
    });

    await updateDoc(userRef, {
      children: updatedChildren
    });
  }
};

export const removeChildFromUser = async (userId: string, child: Child): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    children: arrayRemove(child)
  });
};

export const updateAccountType = async (userId: string, type: AccountType): Promise<void> => {
  const userRef = doc(db, "users", userId);
  // Using setDoc with merge=true is safer than updateDoc as it handles cases 
  // where the document might be missing fields or partially initialized.
  await setDoc(userRef, {
    accountType: type
  }, { merge: true });
};
