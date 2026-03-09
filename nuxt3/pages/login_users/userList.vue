<template>
  <div class="page-container">
    <div class="content-wrapper">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">👥 ຈັດການຜູ້ໃຊ້</h1>
            <p class="page-subtitle">ເບິ່ງແລະແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ທັງໝົດ</p>
          </div>
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-number">{{ users.length }}</div>
              <div class="stat-label">ທັງໝົດ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="controls-section">
        <div class="search-container">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ຄົ້ນຫາຼູ້ໃຊ້... (ຊື່, ນາມສະກຸນ, ອີເມວ, ເບີໂທ)"
              class="search-input"
            />
          </div>
        </div>
        <div class="view-toggle">
          <button
            @click="viewMode = 'grid'"
            :class="viewMode === 'grid' ? 'toggle-active' : 'toggle-inactive'"
            class="toggle-button"
          >
            📱 ບັດ
          </button>
          <button
            @click="viewMode = 'table'"
            :class="viewMode === 'table' ? 'toggle-active' : 'toggle-inactive'"
            class="toggle-button"
          >
            📋 ຕາຕະລາງ
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">ກໍາລັງໂຫລດຂໍ້ມູນຜູ້ໃຊ້...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredUsers.length && !loading" class="empty-state">
        <div class="empty-icon">👤</div>
        <h3 class="empty-title">
          {{ searchQuery ? "ບໍ່ພົບຜູ້ໃຊ້" : "ບໍ່ມີຜູ້ໃຊ້" }}
        </h3>
        <p class="empty-subtitle">
          {{ searchQuery ? "ລອງປ່ຽນຄໍາຄົ້ນຫາ" : "ຍັງບໍ່ມີຜູ້ໃຊ້ລົງທະບຽນ" }}
        </p>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid-container">
        <div v-for="user in filteredUsers" :key="user.id" class="user-card">
          <div class="card-header">
            <div class="user-avatar">
              {{ getInitials(user.name, user.lastname) }}
            </div>
            <div class="user-info">
              <h3 class="user-name">{{ user.name }} {{ user.lastname }}</h3>
              <p class="user-email">{{ user.email }}</p>
            </div>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-icon">📞</span>
              <span class="info-text">{{
                user.phone_number || "ບໍ່ລະບຸ"
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">📧</span>
              <span class="info-text">{{ user.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">👤</span>
              <span class="info-text">{{ user.role || "ບໍ່ລະບຸ" }}</span>
            </div>
          </div>
          <div class="card-actions">
            <NuxtLink :to="`/editUser?id=${user.id}`" class="edit-button">
              <span class="button-icon">✏️</span>
              <span class="button-text">ແກ້ໄຂ</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-else class="table-container">
        <div class="table-wrapper">
          <table class="users-table">
            <thead>
              <tr>
                <th class="table-header">
                  <div class="header-content">
                    <span class="header-icon">👤</span>
                    <span class="header-text">ຊື່</span>
                  </div>
                </th>
                <th class="table-header">
                  <div class="header-content">
                    <span class="header-icon">👨‍👩‍👧‍👦</span>
                    <span class="header-text">ນາມສະກຸນ</span>
                  </div>
                </th>
                <th class="table-header">
                  <div class="header-content">
                    <span class="header-icon">📞</span>
                    <span class="header-text">ເບີໂທ</span>
                  </div>
                </th>
                <th class="table-header">
                  <div class="header-content">
                    <span class="header-icon">📧</span>
                    <span class="header-text">ອີເມວ</span>
                  </div>
                </th>
                <th class="table-header">
                  <div class="header-content">
                    <span class="header-icon">🎭</span>
                    <span class="header-text">ບົດບາດ</span>
                  </div>
                </th>
                <th class="table-header">
                  <div class="header-content">
                    <span class="header-icon">⚙️</span>
                    <span class="header-text">ການກະທໍາ</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="table-row"
              >
                <td class="table-cell">
                  <div class="cell-content">
                    <div class="user-avatar-small">
                      {{ getInitials(user.name, user.lastname) }}
                    </div>
                    <span class="cell-text">{{ user.name }}</span>
                  </div>
                </td>
                <td class="table-cell">
                  <span class="cell-text">{{ user.lastname }}</span>
                </td>
                <td class="table-cell">
                  <span class="cell-text">{{
                    user.phone_number || "ບໍ່ລະບຸ"
                  }}</span>
                </td>
                <td class="table-cell">
                  <span class="cell-text">{{ user.email }}</span>
                </td>
                <td class="table-cell">
                  <span class="cell-text">{{ user.role || "ບໍ່ລະບຸ" }}</span>
                </td>
                <td class="table-cell">
                  <NuxtLink
                    :to="`/editUser?id=${user.id}`"
                    class="edit-button-table"
                  >
                    <span class="button-icon">✏️</span>
                    <span class="button-text">ແກ້ໄຂ</span>
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Results Summary -->
      <div v-if="!loading && filteredUsers.length" class="results-summary">
        <p class="summary-text">
          ສະແດງ {{ filteredUsers.length }} ຈາກ {{ users.length }} ຜູ້ໃຊ້
          <span v-if="searchQuery" class="search-highlight">
            ສໍາລັບ "{{ searchQuery }}"
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "empty",
  prerender: false,
});

import { ref, onMounted, computed } from "vue";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useFirebase } from "@/composables/useFirebase";

const { db } = useFirebase();

const users = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const viewMode = ref("grid");

// ✅ Get initials
const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  return first + last || "??";
};

// ✅ Computed for filtered users
const filteredUsers = computed(() => {
  if (!users.value) return [];

  if (!searchQuery.value) return users.value;

  const queryText = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.name?.toLowerCase().includes(queryText) ||
      user.lastname?.toLowerCase().includes(queryText) ||
      user.email?.toLowerCase().includes(queryText) ||
      user.phone_number?.toLowerCase().includes(queryText)
  );
});

// ✅ Fetch users with role="user" only
onMounted(async () => {
  try {
    // Create a query to filter users by role="user"
    const usersQuery = query(
      collection(db, "Users"),
      where("role", "==", "user")
    );

    const querySnapshot = await getDocs(usersQuery);
    users.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Found ${users.value.length} users with role="user"`);
  } catch (error) {
    console.error("Error fetching users:", error);
    users.value = []; // fallback to empty array
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped>
/* Page Layout */
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px 0;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Header Section */
.header-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  padding: 32px;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #718096;
  margin: 0;
  font-size: 1.1rem;
}

.stat-card {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  min-width: 100px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Controls Section */
.controls-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.search-container {
  flex: 1;
}

.search-input-wrapper {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #a0aec0;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  background: transparent;
  outline: none;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.view-toggle {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.toggle-button {
  padding: 12px 16px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.toggle-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.toggle-inactive {
  color: #718096;
}

.toggle-button:hover {
  background-color: #f7fafc;
}

.toggle-active:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Loading State */
.loading-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  padding: 64px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #718096;
  margin: 0;
  font-size: 1.1rem;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  padding: 64px;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.empty-subtitle {
  color: #718096;
  margin: 0;
  font-size: 1.1rem;
}

/* Grid View */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.user-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transition: all 0.3s ease;
  overflow: hidden;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.user-email {
  margin: 0;
  opacity: 0.9;
  font-size: 0.875rem;
}

.card-content {
  padding: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.info-icon {
  font-size: 1.1rem;
  width: 24px;
}

.info-text {
  color: #4a5568;
  flex: 1;
}

.card-actions {
  padding: 0 24px 24px;
}

.edit-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.edit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Table View */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  margin-bottom: 24px;
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 16px;
  text-align: left;
  font-weight: 600;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 1.1rem;
}

.table-row {
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f7fafc;
}

.table-cell {
  padding: 16px;
  vertical-align: middle;
}

.cell-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.cell-text {
  color: #4a5568;
  font-weight: 500;
}

.edit-button-table {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.edit-button-table:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.button-icon {
  font-size: 0.875rem;
}

/* Results Summary */
.results-summary {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 16px 24px;
  text-align: center;
}

.summary-text {
  margin: 0;
  color: #718096;
  font-size: 0.875rem;
}

.search-highlight {
  font-weight: 600;
  color: #667eea;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 12px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .controls-section {
    flex-direction: column;
    align-items: stretch;
  }

  .view-toggle {
    align-self: flex-start;
  }

  .grid-container {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 2rem;
  }
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
