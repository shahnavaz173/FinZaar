import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Box, Typography, TextField, MenuItem, Select, Button, Paper } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { listenToAccounts } from "../services/accountService";
import { addTransaction } from "../services/transactionService";

export default function AddTransactionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    accountId: "",
    type: "debit",
    amount: "",
    note: "",
    extraAccountId: "",
  });

  // Listen to accounts
  useEffect(() => {
    if (!user) return;
    const unsub = listenToAccounts(user.uid, setAccounts);
    return () => unsub && unsub();
  }, [user]);

  // Preselect account once accounts are loaded
  useEffect(() => {
    if (accounts.length === 0) return;

    const preselectedId = location.state?.preselectedAccountId || params.accountId || "";
    if (preselectedId) {
      setForm((prev) => ({ ...prev, accountId: preselectedId }));
    }
  }, [accounts, location.state, params.accountId]);

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

  const handleAdd = async () => {
    if (!form.accountId || !form.amount) return;

    const txnData = {
      ...form,
      amount: parseInt(form.amount),
      createdAt: new Date(),
      accountType: selectedAccount?.type,
      accountName: selectedAccount?.name,
    };

    await addTransaction(user.uid, txnData);
    navigate(-1);
  };

  return (
    <Box sx={{ pb: { xs: 8, sm: 2 } }}>
      <Typography variant="h6" mb={2}>
        Add Transaction
      </Typography>

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

        <Button variant="contained" sx={{ mt: 2 }} onClick={handleAdd}>
          Add Transaction
        </Button>
      </Paper>
    </Box>
  );
}
