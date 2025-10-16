import React, { useEffect } from "react";
import { Button, Paper, Typography, Box } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard"); // redirect automatically if already logged in
    }
  }, [user, navigate]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      p={2}
      sx={{
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      }}
    >
      <Paper
        sx={{
          width: 320,
          p: 3,
          textAlign: "center",
          borderRadius: 3,
          boxShadow: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Welcome to FinZaar
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sign in to continue managing your finances
        </Typography>

        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          fullWidth
          sx={{
            py: 1.2,
            backgroundColor: "#4285F4",
            "&:hover": { backgroundColor: "#357ae8" },
          }}
          onClick={loginWithGoogle}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Box>
  );
}
