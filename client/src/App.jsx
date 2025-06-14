import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { Routes, Route, Navigate } from "react-router-dom"; // Adicione o Navigate aqui
import MainLayout from "./pages/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import RegisteredProducts from "./pages/RegisteredProducts";

const token =
  localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={token ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/registered-products" element={<RegisteredProducts />} />
          {/* <Route path="/relatorio" element={<Relatorio />} />
          <Route path="/configuracoes" element={<Configuracoes />} /> */}
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
