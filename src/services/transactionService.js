// transactionService.js
import {
   doc, updateDoc, getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";


export async function addTransaction(userId, txn) {
  const col = collection(db, "users", userId, "transactions");
  const payload = {
    ...txn,
    createdAt: txn.createdAt || serverTimestamp(),
  };
  const docRef = await addDoc(col, payload);

  // Update the account balance
  const accountRef = doc(db, "users", userId, "accounts", txn.accountId);
  const accountSnap = await getDoc(accountRef);
  if (accountSnap.exists()) {
    const account = accountSnap.data();
    let newBalance = account.balance ?? 0;

    // Add or subtract based on transaction type
    if (txn.type === "credit") newBalance += txn.amount;
    else if (txn.type === "debit") newBalance -= txn.amount;

    await updateDoc(accountRef, { balance: newBalance });
  }

  return docRef.id;
}


export function listenToTransactions(userId, setTransactions) {
  if (!userId) return () => {};
  const col = collection(db, "users", userId, "transactions");
  const q = query(col, orderBy("createdAt", "desc"));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTransactions(items);
    },
    (err) => {
      console.error("listenToTransactions error:", err);
    }
  );
  return unsub;
}
