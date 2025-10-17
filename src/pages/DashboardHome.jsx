import React, { useEffect, useState } from "react";
import { Paper, Typography, Box, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { listenToAccounts, calculateSummary } from "../services/accountService";
import SavingsIcon from "@mui/icons-material/Savings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoneyIcon from "@mui/icons-material/Money";
import PaidIcon from "@mui/icons-material/Paid";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

export default function DashboardHome() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({
    totalEverything: 0,
    totalExcludingFunds: 0,
    investmentOnly: 0,
    cashBalance: 0,
    totalToTakeFromParties: 0,
    totalToPayToParties: 0,
    totalFunds: 0,
  });

  useEffect(() => {
    if (!user) return;
    const unsub = listenToAccounts(user.uid, setAccounts);
    return () => unsub && unsub();
  }, [user]);

  useEffect(() => {
    setSummary(calculateSummary(accounts));
  }, [accounts]);

  const cards = [
    { title: "Net Assets", value: `₹ ${summary.totalEverything}`, icon: <SavingsIcon />, color: "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)" },
    { title: "Assets (Excl. Reserved Funds)", value: `₹ ${summary.totalExcludingFunds}`, icon: <AccountBalanceIcon />, color: "linear-gradient(135deg, #3f51b5 0%, #7986cb 100%)" },
    { title: "Cash & Bank Balance", value: `₹ ${summary.cashBalance}`, icon: <AttachMoneyIcon />, color: "linear-gradient(135deg, #4caf50 0%, #81c784 100%)" },
    { title: "Investment", value: `₹ ${summary.investmentOnly}`, icon: <MoneyIcon />, color: "linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)" },
    { title: "Reserved Funds", value: `₹ ${summary.totalFunds}`, icon: <PaidIcon />, color: "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)" },
    { title: "Receivables from Parties", value: `₹ ${summary.totalToTakeFromParties}`, icon: <ArrowDownwardIcon />, color: "linear-gradient(135deg, #f44336 0%, #e57373 100%)" },
    { title: "Payables to Parties", value: `₹ ${summary.totalToPayToParties}`, icon: <ArrowUpwardIcon />, color: "linear-gradient(135deg, #ff5722 0%, #ff8a65 100%)" },
  ];

  return (
    <Box sx={{
      pb: { xs: 8, sm: 2 }, // Add padding-bottom on mobile so buttons don't get hidden
    }}>
      <Typography variant="h6" gutterBottom>Dashboard</Typography>

      {/* Flexbox wrapping cards */}
      <Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    justifyContent: { xs: "flex-start", sm: "center" }, // last row centered on desktop
  }}
>
  {cards.map((c) => (
    <Paper
      key={c.title}
      sx={{
        flex: "1 1 100%",        // full width on mobile
        maxWidth: { xs: "100%", sm: 220 }, // max width only on desktop
        p: 2,
        borderRadius: 2,
        background: c.color,
        color: "#fff",
        boxShadow: 3,
        minWidth: 180,
      }}
    >
      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {c.icon} {c.title}
      </Typography>
      <Typography variant="h6" sx={{ mt: 1 }}>{c.value}</Typography>
    </Paper>
  ))}
</Box>


    </Box>
  );
}
