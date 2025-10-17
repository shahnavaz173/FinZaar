import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Stack,
  Button,
  Collapse,
} from "@mui/material";
import { listenToTransactions } from "../services/transactionService";
import { useAuth } from "../context/AuthContext";

export default function AccountDetailPage() {

  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Collapse toggle for mobile filters
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = listenToTransactions(user.uid, (allTxns) => {
      const filtered = allTxns
        .filter((t) => t.accountId === id)
        .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setTransactions(filtered);
      setFilteredTransactions(filtered);
    });
    return () => unsub && unsub();
  }, [user, id]);

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions];

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
  }, [fromDate, toDate, month, year, transactions]);

  // Helper arrays
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(
    new Set(transactions.map((t) => t.createdAt?.toDate().getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <Box
      sx={{
        pb: { xs: 8, sm: 2 }, // Add padding-bottom on mobile so buttons don't get hidden
      }}
    >
      <Typography variant="h6" gutterBottom>
        Account Transactions
      </Typography>

      {/* Filter Collapse Toggle for Mobile */}
      <Button
        variant="outlined"
        sx={{ mb: 1, display: { xs: "block", sm: "none" } }}
        fullWidth
        onClick={() => setShowFilters((prev) => !prev)}
      >
        {showFilters ? "Hide Filters" : "Show Filters"}
      </Button>

      {/* Filters */}
      <Collapse in={showFilters || window.innerWidth >= 600}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Search Transactions
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
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
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>
      </Collapse>

      {/* Transaction Cards */}
      {filteredTransactions.length === 0 ? (
        <Typography>No transactions found for this account.</Typography>
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
                boxShadow: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                ₹{t.amount} ({t.type})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.createdAt?.toDate().toLocaleString()}
              </Typography>
              {t.note && (
                <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }}>
                  📝 {t.note}
                </Typography>
              )}

              {/* Edit Button */}
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
    </Box>
  );
}
