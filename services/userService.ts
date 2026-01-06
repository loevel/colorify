
import { doc, updateDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Child, AccountType } from "../types";

export const addChildToUser = async (userId: string, name: string): Promise<Child> => {
  const newChild: Child = {
    id: Date.now().toString(),
    name: name.trim()
  };

  const userRef = doc(db, "users", userId);
  // Use setDoc with merge to ensure children array exists or is created
  await setDoc(userRef, {
    children: arrayUnion(newChild)
  }, { merge: true });

  return newChild;
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
