import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  Collapse,
  IconButton,
  Paper,
  Fab,
} from "@mui/material";
import { ExpandMore, ExpandLess, Add as AddIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { listenToAccounts } from "../services/accountService";
import { useNavigate } from "react-router-dom";

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsub = listenToAccounts(user.uid, setAccounts);
    return () => unsub && unsub();
  }, [user]);

  // Apply filters
  const filteredAccounts = accounts.filter((a) => {
    const matchesName = a.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesType = filterType ? a.type === filterType : true;
    return matchesName && matchesType;
  });

  return (
    <Box sx={{ pb: { xs: 10, sm: 2 }, px: { xs: 2, sm: 4 }, position: "relative" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Accounts</Typography>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Filters</Typography>
          <IconButton onClick={() => setShowFilters((prev) => !prev)}>
            {showFilters ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Stack>
        <Collapse in={showFilters}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
            <TextField
              label="Search by name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Account Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Asset">Asset</MenuItem>
                <MenuItem value="Party">Party</MenuItem>
                <MenuItem value="Fund">Fund</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Collapse>
      </Paper>

      {/* Account Cards */}
      <Stack spacing={2}>
        {filteredAccounts.length === 0 && (
          <Typography variant="body2">No accounts found.</Typography>
        )}
        {filteredAccounts.map((a) => (
          <Card
            key={a.id}
            sx={{ cursor: "pointer", transition: "0.2s", "&:hover": { boxShadow: 6 } }}
            onClick={() => navigate(`/dashboard/accounts/${a.id}`)}
          >
            <CardContent>
              <Typography variant="h6">{a.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Type: {a.type} | Balance: ₹ {a.balance ?? 0}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={() => navigate("/dashboard/accounts/add")}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
