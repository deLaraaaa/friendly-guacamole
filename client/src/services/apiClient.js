const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined in the environment variables.");
}

/**
 * Makes an API request to the specified endpoint.
 * @param {string} endpoint - The API endpoint to call (e.g., "/login").
 * @param {Object} options - The fetch options (e.g., method, headers, body).
 * @returns {Promise<Object>} - The parsed JSON response from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = { "Content-Type": "application/json" };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle non-OK responses
    if (!response) {
      await handleErrorResponse(response);
    }

    // Parse and return JSON response
    return await response.json();
  } catch (error) {
    console.error("API request error:", error.message);
    throw error;
  }
}

/**
 * Handles non-OK HTTP responses.
 * @param {Response} response - The fetch response object.
 * @throws {Error} - Throws an error with a detailed message.
 */
async function handleErrorResponse(response) {
  const errorMessage = await extractErrorMessage(response);
  if (response.status === 401) {
    console.error("Unauthorized access - please log in.");
  }
  throw new Error(`Error ${response.status}: ${errorMessage}`);
}

/**
 * Extracts a detailed error message from the response.
 * @param {Response} response - The fetch response object.
 * @returns {Promise<string>} - The extracted error message.
 */
async function extractErrorMessage(response) {
  try {
    const errorData = await response.json();
    return errorData.error || response.statusText || "Unknown error occurred";
  } catch {
    return response.statusText || "Unknown error occurred";
  }
}
