import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Collapse,
  TextField,
  MenuItem,
  Fab,
} from "@mui/material";
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

  // Filters
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Load transactions
  useEffect(() => {
    if (!user) return;
    const unsub = listenToTransactions(user.uid, setTransactions);
    return () => unsub && unsub();
  }, [user]);

  // Load accounts for filter dropdown
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

    if (fromDate)
      filtered = filtered.filter(
        (t) => t.createdAt?.toDate() >= new Date(fromDate)
      );

    if (toDate)
      filtered = filtered.filter(
        (t) => t.createdAt?.toDate() <= new Date(toDate)
      );

    if (month)
      filtered = filtered.filter(
        (t) => t.createdAt?.toDate().getMonth() + 1 === parseInt(month)
      );

    if (year)
      filtered = filtered.filter(
        (t) => t.createdAt?.toDate().getFullYear() === parseInt(year)
      );

    setFilteredTransactions(filtered);
  }, [transactions, selectedTypes, selectedAccounts, fromDate, toDate, month, year]);

  const accountTypes = ["Asset", "Party", "Fund"];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(
    new Set(transactions.map((t) => t.createdAt?.toDate().getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <Box sx={{ p: 3, position: "relative", minHeight: "100vh" }}>
      <Typography variant="h5" mb={2}>
        Transactions
      </Typography>

      {/* Filter Collapse */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Filters</Typography>
          <Button onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Hide" : "Show"}
          </Button>
        </Box>
        <Collapse in={showFilters}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2} flexWrap="wrap">
            <TextField
              select
              label="Account Type"
              value={selectedTypes}
              onChange={(e) => setSelectedTypes([e.target.value])}
              size="small"
              sx={{ flex: 1, minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              {accountTypes.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Account Name"
              value={selectedAccounts}
              onChange={(e) => setSelectedAccounts([e.target.value])}
              size="small"
              sx={{ flex: 1, minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              {accounts.map((a) => (
                <MenuItem key={a.id} value={a.name}>{a.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="From Date"
              type="date"
              size="small"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, minWidth: 120 }}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, minWidth: 120 }}
            />
            <TextField
              select
              label="Month"
              size="small"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              sx={{ flex: 1, minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              {months.map((m) => (
                <MenuItem key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Year"
              size="small"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              sx={{ flex: 1, minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              {years.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Collapse>
      </Paper>

      {/* Transaction Cards */}
      {filteredTransactions.length === 0 ? (
        <Typography>No transactions found.</Typography>
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
              {/* Amount + Type + Account Name + Account Type */}
              <Typography variant="subtitle1" fontWeight="bold">
                ₹{t.amount} ({t.type}) — {t.accountName || "Unknown"}
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

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => navigate("/dashboard/transactions/add")}
        sx={{
          position: "fixed",
          bottom: 70,
          right: 24,
          boxShadow: "0 6px 10px rgba(0,0,0,0.3)",
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
