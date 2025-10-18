import React, { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, Paper, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listenToTransactions } from "../services/transactionService";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsub = listenToTransactions(user.uid, setTransactions);
    return () => unsub && unsub();
  }, [user]);

  return (
    <Box sx={{ pb: { xs: 8, sm: 2 }, position: "relative" }}>
      <Typography variant="h6" mb={2}>
        Transactions
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <List>
          {transactions.map((t) => (
            <ListItem key={t.id} divider>
              <ListItemText
                primary={`${t.type === "credit" ? "+ " : "- "}₹${t.amount}`}
                secondary={`${t.note || "—"} • ${t.accountName || t.accountId}${
                  t.extraAccountId ? ` • ${t.extraAccountId}` : ""
                }`}
              />
            </ListItem>
          ))}
          {transactions.length === 0 && (
            <Typography variant="body2">No transactions yet.</Typography>
          )}
        </List>
      </Paper>

      {/* Floating Add Transaction Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
        }}
        onClick={() => navigate("/dashboard/transactions/add")}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
