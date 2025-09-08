import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./contexts/UserContext";
import { Box, CircularProgress } from "@mui/material";
import MainLayout from "./pages/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import RegisteredProducts from "./pages/RegisteredProducts";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import AccountsPage from "./pages/AccountsPage";

const App = () => {
  const { user, loading } = useContext(UserContext);

  // Mostrar loading enquanto valida o token
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={user ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/registered-products" element={<RegisteredProducts />} />
          <Route
            path="/registered-products/:productId"
            element={<ProductDetailsPage />}
          />
          <Route path="/users" element={<AccountsPage />} />
          {/* <Route path="/relatorio" element={<Relatorio />} />
          <Route path="/configuracoes" element={<Configuracoes />} /> */}
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default App;
