import React, { useEffect, useState } from "react";
import { Box, Typography, Select, MenuItem, TextField, Button, List, ListItem, ListItemText, Paper } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { listenToAccounts } from "../services/accountService";
import { listenToTransactions, addTransaction } from "../services/transactionService";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [form, setForm] = useState({ accountId: "", type: "debit", amount: "", note: "" });

  useEffect(() => {
    if (!user) return;
    const unsubAcc = listenToAccounts(user.uid, setAccounts);
    const unsubTxn = listenToTransactions(user.uid, setTransactions);
    return () => {
      unsubAcc && unsubAcc();
      unsubTxn && unsubTxn();
    };
  }, [user]);

  const handleAdd = async () => {
    if (!form.accountId || !form.amount) return;
    await addTransaction(user.uid, { ...form, amount: parseFloat(form.amount), createdAt: new Date() });
    setForm({ accountId: "", type: "expense", amount: "", note: "" });
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>Transactions</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Select fullWidth value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} displayEmpty>
          <MenuItem value="">Select account</MenuItem>
          {accounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
        </Select>

      <Select fullWidth value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} sx={{ mt: 1 }}>
        <MenuItem value="debit">Debit</MenuItem>
        <MenuItem value="credit">Credit</MenuItem>
      </Select>

        <TextField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} fullWidth sx={{ mt: 1 }} />
        <TextField label="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} fullWidth sx={{ mt: 1 }} />

        <Button variant="contained" sx={{ mt: 2 }} onClick={handleAdd}>Add Transaction</Button>
      </Paper>

      <List>
        {transactions.map((t) => (
          <ListItem key={t.id} divider>
            <ListItemText
              primary={`${t.type === "credit" ? "+ " : "- "}₹${t.amount}`}
              secondary={`${t.note || "—"} • ${t.accountId}`}
            />
          </ListItem>
        ))}
        {transactions.length === 0 && <Typography variant="body2">No transactions yet.</Typography>}
      </List>
    </Box>
  );
}
