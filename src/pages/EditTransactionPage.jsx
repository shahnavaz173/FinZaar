import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, TextField, MenuItem, Select, Button, Paper } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { listenToAccounts } from "../services/accountService";
import { getTransactionById, updateTransaction } from "../services/transactionService";

export default function EditTransactionPage() {
  const { user } = useAuth();
  const { txnId } = useParams();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    accountId: "",
    type: "debit",
    amount: "",
    note: "",
    extraAccountId: "",
  });

  useEffect(() => {
    if (!user) return;
    const unsub = listenToAccounts(user.uid, setAccounts);
    return () => unsub && unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !txnId) return;
    getTransactionById(user.uid, txnId).then((txn) => {
      if (!txn) return;
      setForm({
        accountId: txn.accountId,
        type: txn.type,
        amount: txn.amount,
        note: txn.note || "",
        extraAccountId: txn.extraAccountId || "",
      });
    });
  }, [user, txnId]);

  const selectedAccount = accounts.find((a) => a.id === form.accountId);

  // Determine if extra field should be shown
  let showExtraField = false;
  let extraFieldLabel = "";
  if (selectedAccount) {
    const type = selectedAccount.type?.toLowerCase();
    const accName = selectedAccount.name?.toLowerCase();
    const txnType = form.type;
    if ((accName === "investment" && txnType === "credit") ||
        (type === "party" && txnType === "debit") ||
        (type === "fund" && txnType === "credit")) {
      showExtraField = true;
      extraFieldLabel = "Debit from account";
    } else if ((accName === "investment" && txnType === "debit") ||
               (type === "party" && txnType === "credit")) {
      showExtraField = true;
      extraFieldLabel = "Credit to account";
    }
  }

  const handleUpdate = async () => {
    if (!form.accountId || !form.amount) return;

    await updateTransaction(user.uid, txnId, {
      ...form,
      amount: parseInt(form.amount),
      accountType: selectedAccount?.type,
      accountName: selectedAccount?.name,
    });

    navigate(-1); // go back to previous page
  };

  return (
    <Box sx={{ pb: { xs: 8, sm: 2 } }}>
      <Typography variant="h6" mb={2}>Edit Transaction</Typography>

      <Paper sx={{ p: 2 }}>
        <TextField
          select
          fullWidth
          label="Account"
          value={form.accountId}
          onChange={(e) => setForm({ ...form, accountId: e.target.value })}
          sx={{ mb: 1 }}
        >
          <MenuItem value="">Select account</MenuItem>
          {accounts.map((a) => (
            <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
          ))}
        </TextField>

        <Select
          fullWidth
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          sx={{ mt: 1 }}
        >
          <MenuItem value="debit">Debit</MenuItem>
          <MenuItem value="credit">Credit</MenuItem>
        </Select>

        <TextField
          label="Amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          fullWidth
          sx={{ mt: 1 }}
        />

        <TextField
          label="Note"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          fullWidth
          sx={{ mt: 1 }}
        />

        {showExtraField && (
          <TextField
            select
            fullWidth
            label={extraFieldLabel}
            value={form.extraAccountId || ""}
            onChange={(e) => setForm({ ...form, extraAccountId: e.target.value })}
            sx={{ mt: 1 }}
          >
            <MenuItem value="">None</MenuItem>
            {accounts.map((a) => (
              <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
            ))}
          </TextField>
        )}

        <Button variant="contained" sx={{ mt: 2 }} onClick={handleUpdate}>Update Transaction</Button>
      </Paper>
    </Box>
  );
}
