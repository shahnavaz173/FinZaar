import { getDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { createDefaultAccounts } from "./accountService";

export const createUserIfNotExists = async (user) => {
  const userRef = doc(db, "users", user.uid);

  // Force fetch from server
  const userSnap = await getDoc(userRef, { source: "server" });

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      displayName: user.displayName,
      email: user.email,
      createdAt: serverTimestamp(),
    });

    await createDefaultAccounts(user.uid);
  } else {
    // Merge updated info
    await setDoc(
      userRef,
      {
        displayName: user.displayName,
        email: user.email,
      },
      { merge: true }
    );
  }
};
