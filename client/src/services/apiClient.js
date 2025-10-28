const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

/**
 * Faz uma requisição à API.
 * @param {string} endpoint - Endpoint da API (ex: "/login").
 * @param {Object} options - Configurações do fetch (method, headers, body etc).
 * @returns {Promise<Object>} - Resposta JSON da API.
 */
export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = { "Content-Type": "application/json" };

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    return await response.json();
  } catch (error) {
    console.error("Falha ao chamar a API:", error);
    throw new Error(`Failed to fetch ${API_BASE_URL}${endpoint}: ${error.message}`);
  }
}

async function handleErrorResponse(response) {
  const errorMessage = await extractErrorMessage(response);
  if (response.status === 401) {
    console.error("Unauthorized – limpando token");
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
  }
  throw new Error(errorMessage);
}

async function extractErrorMessage(response) {
  try {
    const errorData = await response.json();
    return errorData.message || "Erro desconhecido";
  } catch {
    return "Erro ao processar a resposta do servidor";
  }
}
