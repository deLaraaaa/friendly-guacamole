import { apiRequest } from "./apiClient";

/**
 * Registers a new user.
 * @param {Object} userData - The user data to register.
 * @param {string} userData.username - The username of the user.
 * @param {string} userData.password - The password of the user.
 * @param {string} userData.namespace - The namespace of the user.
 * @param {string} userData.email - The email address of the user.
 * @param {string} userData.role - The role of the user.
 * @returns {Promise<Object>} - The registered user data.
 */
export async function register(userData) {
  const endpoint = "/register";
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Logs in a user with the provided credentials.
 * @param {string} login - The login string in the format "username@namespace".
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - The user data and token.
 */
export async function login(login, password) {
  const endpoint = "/login";
  const body = { login, password };
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Sends a reset code to the user's email.
 * @param {string} email - The email address of the user.
 * @returns {Promise<Object>} - A success message.
 */
export async function sendResetCode(email) {
  const endpoint = "/send_reset_code";
  const body = { email };
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Resets the user's password using a reset token.
 * @param {string} email - The email address of the user.
 * @param {string} resetToken - The reset token sent to the user's email.
 * @param {string} newPassword - The new password to set.
 * @returns {Promise<Object>} - A success message.
 */
export async function resetPassword(email, resetToken, newPassword) {
  const endpoint = "/reset_password";
  const body = {
    email, resetToken, newPassword
  };
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Changes the role of a user.
 * @param {string} userId - The ID of the user whose role is to be changed.
 * @param {string} newRole - The new role to assign to the user.
 * @returns {Promise<Object>} - A success message.
 */
export async function changeUserRole(userId, newRole) {
  const endpoint = "/change_user_role";
  const body = { userId, newRole };
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
