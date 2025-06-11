import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { sendResetCode, resetPassword } from "../services/accessService";

function ForgotPasswordModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("info");

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSendResetCode = async () => {
    setLoading(true);
    try {
      await sendResetCode(resetEmail);
      setToastMessage("Código de reset enviado com sucesso!");
      setToastSeverity("success");
      setToastOpen(true);
      setStep(2);
    } catch (err) {
      setToastMessage("Falha ao enviar o código de reset. Verifique o e-mail.");
      setToastSeverity("error");
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword) {
      setToastMessage("Código de reset e nova senha são obrigatórios.");
      setToastSeverity("error");
      setToastOpen(true);
      return;
    }

    if (newPassword === resetEmail) {
      setToastMessage("A nova senha não pode ser igual ao e-mail.");
      setToastSeverity("error");
      setToastOpen(true);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetEmail, resetCode, newPassword);
      setToastMessage("Senha resetada com sucesso!");
      setToastSeverity("success");
      setToastOpen(true);
      onClose();
    } catch (err) {
      setToastMessage("Código de reset ou senha inválidos. Tente novamente.");
      setToastSeverity("error");
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setLoading(false);
    onClose();
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogContentText>
              Insira seu E-Mail para receber o código de reset.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="resetEmail"
              label="Email"
              type="email"
              fullWidth
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
          </>
        );
      case 2:
        return (
          <>
            <DialogContentText>
              Insira o código enviado por E-Mail para resetar sua senha.
            </DialogContentText>
            <TextField
              margin="dense"
              id="resetCode"
              label="Código de Reset"
              type="text"
              fullWidth
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
            />
            <TextField
              margin="dense"
              id="newPassword"
              label="Nova Senha"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        PaperProps={{
          sx: {
            width: "460px",
            height: "auto",
          },
        }}
      >
        <DialogTitle>
          {step === 1 ? "Esqueceu sua Senha?" : "Resetar Senha"}
        </DialogTitle>
        <DialogContent>{renderStepContent()}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Cancelar
          </Button>
          {step === 1 && (
            <Button
              onClick={handleSendResetCode}
              color="primary"
              disabled={loading || !resetEmail.trim()}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          )}
          {step === 2 && (
            <Button
              onClick={handleResetPassword}
              color="primary"
              disabled={loading || !resetCode.trim() || !newPassword.trim()}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Resetando..." : "Resetar"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastSeverity}
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ForgotPasswordModal;
