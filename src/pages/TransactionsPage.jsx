import React, { useEffect, useState } from "react";
import { Box, Typography, Select, MenuItem, TextField, Button, List, ListItem, ListItemText, Paper } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { listenToAccounts } from "../services/accountService";
import { listenToTransactions, addTransaction } from "../services/transactionService";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [form, setForm] = useState({ accountId: "", type: "debit", amount: "", note: "", extraAccountId: "" });

  useEffect(() => {
    if (!user) return;
    const unsubAcc = listenToAccounts(user.uid, setAccounts);
    const unsubTxn = listenToTransactions(user.uid, setTransactions);
    return () => {
      unsubAcc && unsubAcc();
      unsubTxn && unsubTxn();
    };
  }, [user]);

  const selectedAccount = accounts.find(a => a.id === form.accountId);

  // Determine if extra field should be shown
  let showExtraField = false;
  let extraFieldLabel = "";
  let defaultExtraAccount = accounts.find(a => a.name.toLowerCase() === "bank");

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
    accountType: selectedAccount?.type,   // <-- pass account type
    accountName: selectedAccount?.name
  };

 

  await addTransaction(user.uid, txnData);

  setForm({ accountId: "", type: "debit", amount: "", note: "", extraAccountId: "" });
};


  return (
    <Box sx={{
      pb: { xs: 8, sm: 2 }, // Add padding-bottom on mobile so buttons don't get hidden
    }}>
      <Typography variant="h6" mb={2}>Transactions</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          select
          fullWidth
          label="Account"  // Label is always visible
          value={form.accountId}
          onChange={(e) => setForm({ ...form, accountId: e.target.value })}
          sx={{ mb: 1 }}
        >
          <MenuItem value="">Select account</MenuItem>
          {accounts.map((a) => (
            <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
          ))}
        </TextField>


        <Select fullWidth value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} sx={{ mt: 1 }}>
          <MenuItem value="debit">Debit</MenuItem>
          <MenuItem value="credit">Credit</MenuItem>
        </Select>

        <TextField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} fullWidth sx={{ mt: 1 }} />
        <TextField label="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} fullWidth sx={{ mt: 1 }} />

        {showExtraField && (
           <TextField
            select
            fullWidth
            label={extraFieldLabel}       // Label stays visible
            value={form.extraAccountId || ""}
            onChange={(e) => setForm({ ...form, extraAccountId: e.target.value })}
            sx={{ mt: 1 }}
          >
            <MenuItem >None</MenuItem>
            {accounts.map((a) => (
              <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
            ))}
          </TextField>
        )}

        <Button variant="contained" sx={{ mt: 2 }} onClick={handleAdd}>Add Transaction</Button>
      </Paper>

      <List>
        {transactions.map((t) => (
          <ListItem key={t.id} divider>
            <ListItemText
              primary={`${t.type === "credit" ? "+ " : "- "}₹${t.amount}`}
              secondary={`${t.note || "—"} • ${t.accountId}${t.extraAccountId ? ` • ${t.extraAccountId}` : ""}`}
            />
          </ListItem>
        ))}
        {transactions.length === 0 && <Typography variant="body2">No transactions yet.</Typography>}
      </List>
    </Box>
  );
}
