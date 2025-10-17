import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { addAccount } from "../services/accountService";
import { useNavigate } from "react-router-dom";

export default function AddAccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState("Asset");
  const [balance, setBalance] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;

    await addAccount(user.uid, {
      name,
      type,
      balance: balance ? parseFloat(balance) : 0,
      createdAt: new Date(),
    });

    // Clear form and go back to accounts page
    setName("");
    setType("Asset");
    setBalance("");
    navigate("/dashboard/accounts");
  };

  return (
    <Box sx={{ pb: { xs: 8, sm: 2 }, px: { xs: 2, sm: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Add Account</Typography>
        <Button variant="outlined" onClick={() => navigate("/dashboard/accounts")}>
          Back
        </Button>
      </Stack>

      <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 500, mx: "auto" }}>
        <Stack spacing={3}>
          <TextField
            label="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Account Type</InputLabel>
            <Select value={type} onChange={(e) => setType(e.target.value)} label="Account Type">
              <MenuItem value="Asset">Asset</MenuItem>
              <MenuItem value="Party">Party</MenuItem>
              <MenuItem value="Fund">Fund</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Initial Balance (optional)"
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            fullWidth
          />

          <Button variant="contained" onClick={handleAdd}>
            Add Account
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
