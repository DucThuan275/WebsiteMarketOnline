// import axiosInstace from "./axiosConfig";
// const BASE_URL = "http://localhost:8088/api/v1";

// export function GET_USER_INFO(email) {
//   console.log("Getting user info for email:", email);
//   const token = localStorage.getItem("authToken");
//   console.log("Using token:", token);

//   return axiosInstace({
//     method: "GET",
//     url: `${BASE_URL}/users`,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: token ? `Bearer ${token}` : "",
//     },
//   })
//     .then((response) => {
//       console.log("User info response:", response.data);
//       return response.data;
//     })
//     .catch((error) => {
//       console.error("Error fetching user info:", error);
//       throw error;
//     });
// }
import callApi from "./apiService";

const UserService = {
  /**
   * Get the current user's profile
   * @returns {Promise<Object>} Current user profile data
   */
  getCurrentUserProfile: async () => {
    return callApi("/users/profile", "GET");
  },

  /**
   * Get a user by their ID (Admin only)
   * @param {number} id - User ID
   * @returns {Promise<Object>} User profile data
   */
  getUserById: async (id) => {
    return callApi(`/users/${id}`, "GET");
  },

  /**
   * Check if an email address already exists in the system
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists, false otherwise
   */
  checkEmailExists: async (email) => {
    return callApi("/users/check-email", "GET", null, { email });
  },

  /**
   * Update the current user's profile
   * @param {Object} profileData - User profile data to update
   * @param {string} profileData.firstname - User's first name
   * @param {string} profileData.lastname - User's last name
   * @param {string} profileData.address - User's address
   * @param {string} profileData.mobileNumber - User's mobile number
   * @returns {Promise<Object>} Updated user profile data
   */
  updateUserProfile: async (profileData) => {
    return callApi("/users/profile", "PUT", profileData);
  },

  /**
   * Get all users (Admin only)
   * @returns {Promise<Array>} List of all users
   */
  getAllUsers: async () => {
    return callApi("/users", "GET");
  },

  /**
   * Delete a user by ID (Admin only)
   * @param {number} id - User ID to delete
   * @returns {Promise<void>}
   */
  deleteUser: async (id) => {
    return callApi(`/users/${id}`, "DELETE");
  },
};

export default UserService;
