import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Collapse,
  TextField,
  Grid,
  Chip,
  Autocomplete,
  MenuItem,
} from "@mui/material";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listenToTransactions } from "../services/transactionService";
import { listenToAccounts } from "../services/accountService";

export default function TransactionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const accountTypes = ["Asset", "Party", "Fund"];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(
    new Set(transactions.map((t) => t.createdAt?.toDate().getFullYear()))
  ).sort((a, b) => b - a);

  // Listen to transactions
  useEffect(() => {
    if (!user) return;
    const unsub = listenToTransactions(user.uid, setTransactions);
    return () => unsub && unsub();
  }, [user]);

  // Listen to accounts for filters
  useEffect(() => {
    if (!user) return;
    const unsub = listenToAccounts(user.uid, setAccounts);
    return () => unsub && unsub();
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions];

    if (selectedTypes.length) {
      filtered = filtered.filter((t) => selectedTypes.includes(t.accountType));
    }

    if (selectedAccounts.length) {
      filtered = filtered.filter(
        (t) => selectedAccounts.includes(t.accountName) || selectedAccounts.includes(t.accountId)
      );
    }

    if (dateRange.from) {
      filtered = filtered.filter(
        (t) => t.createdAt && new Date(t.createdAt.toDate()) >= new Date(dateRange.from)
      );
    }

    if (dateRange.to) {
      filtered = filtered.filter(
        (t) => t.createdAt && new Date(t.createdAt.toDate()) <= new Date(dateRange.to)
      );
    }

    if (month) {
      filtered = filtered.filter(
        (t) => t.createdAt && new Date(t.createdAt.toDate()).getMonth() + 1 === parseInt(month, 10)
      );
    }

    if (year) {
      filtered = filtered.filter(
        (t) => t.createdAt && new Date(t.createdAt.toDate()).getFullYear() === parseInt(year, 10)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedTypes, selectedAccounts, dateRange, month, year]);

  return (
    <Box sx={{ p: 3, position: "relative", minHeight: "100vh" }}>
      <Typography variant="h5" mb={2}>
        Transactions
      </Typography>

      {/* Filter Panel */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Filters</Typography>
          <Button onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Hide" : "Show"}
          </Button>
        </Box>
        <Collapse in={showFilters}>
          <Stack spacing={2} mt={2}>
            <Autocomplete
              multiple
              options={accountTypes}
              value={selectedTypes}
              onChange={(e, newVal) => setSelectedTypes(newVal)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => <Chip key={option} label={option} {...getTagProps({ index })} />)
              }
              renderInput={(params) => <TextField {...params} label="Account Type" InputLabelProps={{ shrink: true }} />}
            />
            <Autocomplete
              multiple
              options={accounts.map((a) => a.name)}
              value={selectedAccounts}
              onChange={(e, newVal) => setSelectedAccounts(newVal)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => <Chip key={option} label={option} {...getTagProps({ index })} />)
              }
              renderInput={(params) => <TextField {...params} label="Account Name" InputLabelProps={{ shrink: true }} />}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="From Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="To Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  select
                  label="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  sx={{ flex: 1, minWidth: 120 }}
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value="">All</MenuItem>
                  {months.map((m) => (
                    <MenuItem key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  select
                  label="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  sx={{ flex: 1, minWidth: 120 }}
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value="">All</MenuItem>
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </Collapse>
      </Paper>

      {/* Transactions List */}
      <Stack spacing={1}>
        {filteredTransactions.length === 0 ? (
          <Typography variant="body2">No transactions found.</Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            {filteredTransactions.map((t) => (
              <Paper
                key={t.id}
                sx={{
                  p: 2,
                  borderLeft: `5px solid ${t.type === "credit" ? "green" : "red"}`,
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  ₹{t.amount} ({t.type}) — {t.accountName || t.accountId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.createdAt?.toDate().toLocaleString()}
                </Typography>
                {t.note && (
                  <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }}>
                    📝 {t.note}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => navigate(`/dashboard/transactions/edit/${t.id}`)}
                >
                  Edit
                </Button>
              </Paper>
            ))}
          </Box>
        )}
      </Stack>

      {/* Floating Add Transaction Button */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 70, right: 24 }}
        onClick={() => navigate("/dashboard/transactions/add")}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
