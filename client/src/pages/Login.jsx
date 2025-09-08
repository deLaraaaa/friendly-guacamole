import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/accessService";
import userService from "../services/userService";
import { UserContext } from "../contexts/UserContext";
import {
  Button,
  TextField,
  Typography,
  Alert,
  Grid,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Box,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

function Login() {
  const { user, setUser, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    login: "",
    password: "",
    newPassword: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [firstLogin, setFirstLogin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (!userLoading && user) {
      navigate("/inventory", { replace: true });
    }
  }, [user, userLoading, navigate]);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(loginData.login, loginData.password);

      if (response.user.firstLogin) {
        setFirstLogin(true);
        if (loginData.newPassword) {
          await userService.changePassword({
            currentPassword: loginData.password,
            newPassword: loginData.newPassword,
            token: response.token,
          });
          setLoginData((prev) => ({
            ...prev,
            password: loginData.newPassword,
            newPassword: "",
          }));
          setFirstLogin(false);
        }
        return;
      }

      const token = response.token;
      if (rememberMe) {
        localStorage.setItem("authToken", token);
      } else {
        sessionStorage.setItem("authToken", token);
      }
      console.log(response.user);
      setUser(response.user);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid login credentials");
    }
  };

  if (userLoading) {
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
    <div style={{ display: "flex" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "50vw",
        }}
      >
        <img style={{ width: "70%" }} src="client/src/assets/logo.svg" />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "50vw",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "30vw",
          }}
        >
          <p style={{ fontSize: "2.9vw", fontWeight: 600 }}>
            Faça login na sua conta
          </p>
          <TextField
            margin="normal"
            required
            id="login"
            label="Insira seu usuário"
            name="login"
            autoComplete="login"
            autoFocus
            value={loginData.login}
            onChange={handleChange}
            sx={{ width: "30vw" }}
          />
          <TextField
            margin="normal"
            required
            name="password"
            label="Senha"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={loginData.password}
            onChange={handleChange}
            sx={{ width: "30vw" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {firstLogin && (
            <TextField
              margin="normal"
              name="newPassword"
              label="Nova Senha"
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              value={loginData.newPassword}
              onChange={handleChange}
              sx={{ width: "30vw" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleNewPasswordVisibility}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Lembrar de mim"
              sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.9rem" } }}
            />
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer" }}
              onClick={handleOpenModal}
            >
              Esqueci minha senha
            </Typography>
          </div>
          <ForgotPasswordModal open={modalOpen} onClose={handleCloseModal} />
          <Button
            style={{ marginTop: "2vw", width: "30vw" }}
            type="submit"
            color="primary"
            variant="contained"
            onClick={handleSubmit}
          >
            Entrar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
