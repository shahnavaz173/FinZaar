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
  console.log(txn)
  const col = collection(db, "users", userId, "transactions");
  const payload = {
    ...txn,
    createdAt: txn.createdAt || serverTimestamp(),
  };

  const docRef = await addDoc(col, payload);

  // --- Update main account balance ---
  const accountRef = doc(db, "users", userId, "accounts", txn.accountId);
  const accountSnap = await getDoc(accountRef);

  if (accountSnap.exists()) {
    const account = accountSnap.data();
    let newBalance = account.balance ?? 0;

    if (txn.type === "credit") newBalance += txn.amount;
    else if (txn.type === "debit") newBalance -= txn.amount;

    await updateDoc(accountRef, { balance: newBalance });
  }

  // --- Update extra account if exists ---
  if (txn.extraAccountId) {
    const extraRef = doc(db, "users", userId, "accounts", txn.extraAccountId);
    const extraSnap = await getDoc(extraRef);
    if (extraSnap.exists()) {
      let extraBalance = extraSnap.data().balance ?? 0;

      const accountType = txn.accountType?.toLowerCase();
      const accountName = txn.accountName?.toLowerCase();
      const txnType = txn.type;

      /**
       * ✅ Corrected & Final Logic
       *
       * 1. Investment (by name):
       *    - Credit → extra account DEBITED (money goes out from bank)
       *    - Debit  → extra account CREDITED (money goes into bank)
       *
       * 2. Party (by type):
       *    - Credit → extra account CREDITED
       *    - Debit  → extra account DEBITED
       *
       * 3. Fund (by type):
       *    - Credit → extra account DEBITED
       */

      let updateType = null;

      if (accountName === "investment") {
        if (txnType === "credit") updateType = "debit"; // take from bank
        else if (txnType === "debit") updateType = "credit"; // return to bank
      } else if (accountType === "party") {
        if (txnType === "credit") updateType = "credit";
        else if (txnType === "debit") updateType = "debit";
      } else if (accountType === "fund" && txnType === "credit") {
        updateType = "debit";
      }

      if (updateType === "credit") extraBalance += txn.amount;
      else if (updateType === "debit") extraBalance -= txn.amount;

      await updateDoc(extraRef, { balance: extraBalance });
    }
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
