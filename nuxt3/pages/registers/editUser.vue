<template>
  <div class="user-management-container">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M23 21V19C23 18.1332 22.6044 17.3076 21.9142 16.7176C21.2239 16.1276 20.2949 15.8172 19.34 15.8537"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 3.13C16.9549 3.16645 17.8839 3.47688 18.5742 4.06684C19.2644 4.65681 19.66 5.48238 19.66 6.34925C19.66 7.21611 19.2644 8.04169 18.5742 8.63166C17.8839 9.22162 16.9549 9.53205 16 9.56849"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="header-text">
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">Manage and edit user information</p>
        </div>
      </div>
      <div class="user-stats">
        <div class="stat-card">
          <div class="stat-number">{{ users.length }}</div>
          <div class="stat-label">Total Users</div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="controls-section">
      <div class="search-box">
        <div class="search-input-wrapper">
          <svg
            class="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users by name, email, or phone..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="clear-search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </button>
        </div>
      </div>
      <button class="refresh-btn" @click="loadUsers" :disabled="isLoading">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points="23,4 23,10 17,10"
            stroke="currentColor"
            stroke-width="2"
          />
          <polyline
            points="1,20 1,14 7,14"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Users Table -->
    <div class="table-container">
      <div class="table-header">
        <h3>All Users ({{ filteredUsers.length }})</h3>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading users...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="empty-state">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21"
            stroke="currentColor"
            stroke-width="2"
          />
          <circle cx="12" cy="7" r="3" stroke="currentColor" stroke-width="2" />
        </svg>
        <h3>No users found</h3>
        <p>
          {{
            searchQuery
              ? "Try adjusting your search terms"
              : "No users have been registered yet"
          }}
        </p>
      </div>

      <div v-else class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>
                <div class="th-content">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  Name
                </div>
              </th>
              <th>
                <div class="th-content">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  Last Name
                </div>
              </th>
              <th>
                <div class="th-content">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 16.92V19.92C22 20.42 21.58 20.83 21.08 20.83C10.11 20.83 3.17 13.89 3.17 2.92C3.17 2.42 3.58 2 4.08 2H7.08C7.58 2 8 2.42 8 2.92C8 4.58 8.33 6.17 8.92 7.63C9.08 8 8.92 8.42 8.58 8.67L6.67 10.17C8.17 13.33 10.67 15.83 13.83 17.33L15.33 15.42C15.58 15.08 16 14.92 16.37 15.08C17.83 15.67 19.42 16 21.08 16C21.58 16 22 16.42 22 16.92Z"
                      fill="currentColor"
                    />
                  </svg>
                  Phone
                </div>
              </th>
              <th>
                <div class="th-content">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <polyline
                      points="22,6 12,13 2,6"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  Email
                </div>
              </th>
              <th>
                <div class="th-content">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path
                      d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.uid" class="user-row">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">
                    {{ getInitials(user.name, user.lastname) }}
                  </div>
                  <span class="user-name">{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.lastname }}</td>
              <td>
                <a :href="`tel:${user.phone_number}`" class="phone-link">
                  {{ user.phone_number }}
                </a>
              </td>
              <td>
                <a :href="`mailto:${user.email}`" class="email-link">
                  {{ user.email }}
                </a>
              </td>
              <td>
                <button @click="editUser(user)" class="edit-btn">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path
                      d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="selectedUser" class="modal-overlay" @click="handleModalClick">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="modal-user-avatar">
              {{ getInitials(selectedUser.name, selectedUser.lastname) }}
            </div>
            <div>
              <h3 class="modal-title">Edit User</h3>
              <p class="modal-subtitle">
                {{ selectedUser.name }} {{ selectedUser.lastname }}
              </p>
            </div>
          </div>
          <button @click="cancelEdit" class="close-btn">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveChanges" class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <div class="input-wrapper">
                <svg
                  class="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                <input
                  v-model="selectedUser.name"
                  type="text"
                  class="form-input"
                  placeholder="Enter first name"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Last Name</label>
              <div class="input-wrapper">
                <svg
                  class="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                <input
                  v-model="selectedUser.lastname"
                  type="text"
                  class="form-input"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 16.92V19.92C22 20.42 21.58 20.83 21.08 20.83C10.11 20.83 3.17 13.89 3.17 2.92C3.17 2.42 3.58 2 4.08 2H7.08C7.58 2 8 2.42 8 2.92C8 4.58 8.33 6.17 8.92 7.63C9.08 8 8.92 8.42 8.58 8.67L6.67 10.17C8.17 13.33 10.67 15.83 13.83 17.33L15.33 15.42C15.58 15.08 16 14.92 16.37 15.08C17.83 15.67 19.42 16 21.08 16C21.58 16 22 16.42 22 16.92Z"
                  fill="currentColor"
                />
              </svg>
              <input
                v-model="selectedUser.phone_number"
                type="tel"
                class="form-input"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="cancelEdit" class="cancel-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              Cancel
            </button>
            <button type="submit" class="save-btn" :disabled="isSaving">
              <span v-if="!isSaving" class="button-content">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <polyline
                    points="17,21 17,13 7,13 7,21"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <polyline
                    points="7,3 7,8 15,8"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                Save Changes
              </span>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
        </form>

        <!-- Messages -->
        <div v-if="errorMessage" class="message error-message">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
            />
            <line
              x1="15"
              y1="9"
              x2="9"
              y2="15"
              stroke="currentColor"
              stroke-width="2"
            />
            <line
              x1="9"
              y1="9"
              x2="15"
              y2="15"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="message success-message">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4905 2.02168 11.3363C2.16356 9.18206 2.99721 7.13214 4.39828 5.49688C5.79935 3.86162 7.69279 2.72851 9.79619 2.24974C11.8996 1.77098 14.1003 1.96382 16.07 2.8"
              stroke="currentColor"
              stroke-width="2"
            />
            <polyline
              points="22,4 12,14.01 9,11.01"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "empty",
  prerender: false, // ⛔ Don't try to prerender this dynamic login page
});
import { ref, onMounted, computed } from "vue";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useFirebase } from "~/composables/useFirebase";

// Initialize Firebase
const { db } = useFirebase();
const auth = getAuth();
const users = ref([]);
const selectedUser = ref(null);
const successMessage = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const isSaving = ref(false);
const searchQuery = ref("");

// Computed property for filtered users
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;

  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.name?.toLowerCase().includes(query) ||
      user.lastname?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone_number?.toLowerCase().includes(query)
  );
});

// Generate user initials
const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return first + last || "U";
};

// Load all users from Firestore
const loadUsers = async () => {
  isLoading.value = true;
  try {
    const querySnapshot = await getDocs(collection(db, "Users"));
    users.value = querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    errorMessage.value = "Error loading users. Please try again.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// Select user to edit
const editUser = (user) => {
  selectedUser.value = { ...user }; // shallow copy to edit
  successMessage.value = "";
  errorMessage.value = "";
};

// Handle modal background click
const handleModalClick = (event) => {
  if (event.target === event.currentTarget) {
    cancelEdit();
  }
};

// Cancel edit
const cancelEdit = () => {
  selectedUser.value = null;
  successMessage.value = "";
  errorMessage.value = "";
};

// Save updated user data
const saveChanges = async () => {
  isSaving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { uid, name, lastname, phone_number } = selectedUser.value;

    // Validation
    if (!name.trim() || !lastname.trim() || !phone_number.trim()) {
      throw new Error("All fields are required");
    }

    await updateDoc(doc(db, "Users", uid), {
      name: name.trim(),
      lastname: lastname.trim(),
      phone_number: phone_number.trim(),
      updated_at: new Date().toISOString(),
    });

    successMessage.value = "User updated successfully!";
    loadUsers(); // reload list

    // Auto-close modal after success
    setTimeout(() => {
      cancelEdit();
    }, 1500);
  } catch (err) {
    errorMessage.value =
      err.message || "Error updating user. Please try again.";
    console.error(err);
  } finally {
    isSaving.value = false;
  }
};

// Load on mount
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-management-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  padding: 40px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.header-text h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-text p {
  margin: 4px 0 0 0;
  opacity: 0.9;
  font-size: 16px;
}

.user-stats {
  display: flex;
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
  min-width: 120px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.controls-section {
  padding: 32px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  flex: 1;
  max-width: 500px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-management-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  padding: 40px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.header-text h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-text p {
  margin: 4px 0 0 0;
  opacity: 0.9;
  font-size: 16px;
}

.user-stats {
  display: flex;
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
  min-width: 120px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.controls-section {
  padding: 32px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  flex: 1;
  max-width: 500px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  background: #f3f4f6;
  color: #374151;
}

.refresh-btn {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #f8faff;
  border-color: #4f46e5;
  color: #4f46e5;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-container {
  margin: 0 32px 32px 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8faff;
}

.table-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.loading-state {
  text-align: center;
  padding: 60px 32px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 32px;
  color: #6b7280;
}

.empty-state svg {
  margin-bottom: 20px;
  color: #9ca3af;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #f8faff;
}

.users-table th {
  padding: 16px 24px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.th-content svg {
  color: #6b7280;
}

.users-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.user-row:hover {
  background: #f8faff;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-weight: 500;
}

.phone-link,
.email-link {
  color: #4f46e5;
  text-decoration: none;
  transition: color 0.2s ease;
}

.phone-link:hover,
.email-link:hover {
  color: #3730a3;
  text-decoration: underline;
}

.edit-btn {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  color: #0ea5e9;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #0ea5e9;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 32px 32px 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.modal-title {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.modal-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.edit-form {
  padding: 0 32px 32px 32px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.save-btn {
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338ca, #2563eb);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-btn .loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  margin: 0;
}

.message {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.success-message {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 32px 20px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .header-text h1 {
    font-size: 24px;
  }

  .controls-section {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
  }

  .search-box {
    max-width: none;
  }

  .table-container {
    margin: 0 20px 20px 20px;
  }

  .table-header {
    padding: 20px;
  }

  .users-table th,
  .users-table td {
    padding: 12px 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 20px;
    max-width: calc(100% - 40px);
  }

  .modal-header {
    padding: 24px 24px 0 24px;
  }

  .edit-form {
    padding: 0 24px 24px 24px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .users-table {
    font-size: 12px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .edit-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .modal-user-avatar {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }

  .modal-title {
    font-size: 20px;
  }
}
</style>
