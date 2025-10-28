import { apiRequest } from "./apiClient";

/**
 * Fetches the list of users.
 * @returns {Promise<Array>} - List of users.
 */
export async function getUsers() {
  const endpoint = "/api/users";
  return await apiRequest(endpoint, { method: "GET" });
}

/**
 * Creates a new user.
 * @param {Object} userData - Data for the new user.
 * @param {string} userData.username - Username of the new user.
 * @param {string} userData.email - Email of the new user.
 * @returns {Promise<Object>} - The created user.
 */
export async function createUser(userData) {
  const endpoint = "/api/create_user";
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Toggles the activation status of a user.
 * @param {string} userId - ID of the user.
 * @param {boolean} active - New activation status.
 * @returns {Promise<Object>} - The updated user.
 */
export async function toggleUserActivation(userId, active) {
  const endpoint = "/api/toggle_user_activation";
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify({ userId, active }),
  });
}

/**
 * Changes the user's password.
 * @param {Object} data - Password change data.
 * @param {string} data.currentPassword - Current password.
 * @param {string} data.newPassword - New password.
 * @returns {Promise<Object>} - Response message.
 */
export async function changePassword(data) {
  const endpoint = "/api/change_password";
  return await apiRequest(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${data.token}` },
    body: JSON.stringify(data),
  });
}

/**
 * Fetches the current user's details.
 * @returns {Promise<Object>} - Current user's details.
 */
export async function getCurrentUser() {
  const endpoint = "/api/validate_token";
  return await apiRequest(endpoint, { method: "GET" });
}

/**
 * Deletes a user by setting delete = true.
 * @param {string} userId - ID of the user to delete.
 * @returns {Promise<Object>} - The updated user.
 */
export async function deleteUser(userId) {
  const endpoint = "/api/delete_user";
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

const userService = {
  getUsers,
  createUser,
  toggleUserActivation,
  changePassword,
  getCurrentUser,
  deleteUser,
};

export default userService;
