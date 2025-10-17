import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { listenToAccounts, addAccount } from "../services/accountService";
import { useNavigate } from "react-router-dom"; // ✅ add this

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Asset");
  const navigate = useNavigate(); // ✅ initialize navigation

  useEffect(() => {
    if (!user) return;
    const unsub = listenToAccounts(user.uid, setAccounts);
    return () => unsub && unsub();
  }, [user]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addAccount(user.uid, { name, balance: 0, type, createdAt: new Date() });
    setName("");
    setType("Asset");
  };

  return (
    <Box sx={{
      pb: { xs: 8, sm: 2 }, // Add padding-bottom on mobile so buttons don't get hidden
    }}>
      <Typography variant="h6" mb={2}>Accounts</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          label="New account name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Account Type</InputLabel>
          <Select value={type} onChange={(e) => setType(e.target.value)} label="Account Type">
            <MenuItem value="Asset">Asset</MenuItem>
            <MenuItem value="Party">Party</MenuItem>
            <MenuItem value="Fund">Fund</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" sx={{ mt: 2 }} onClick={handleAdd}>
          Add Account
        </Button>
      </Paper>

      <List>
        {accounts.map((a) => (
          <ListItem
            key={a.id}
            divider
            button // ✅ makes it clickable
            onClick={() => navigate(`/dashboard/accounts/${a.id}`)} // ✅ go to detail page
          >
            <ListItemText
              primary={a.name}
              secondary={`Type: ${a.type} | Balance: ₹ ${a.balance ?? 0}`}
            />
          </ListItem>
        ))}
        {accounts.length === 0 && <Typography variant="body2">No accounts yet.</Typography>}
      </List>
    </Box>
  );
}
