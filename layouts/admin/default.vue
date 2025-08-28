<script setup>
import { ref, onMounted, computed } from "vue";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

// ✅ ใช้ useFribase() เพื่อดึง db และ storage อย่างถูกต้อง
import { useFirebase } from "@/composables/useFirebase";
const { db, storage, auth } = useFirebase();

const showSidebar = ref(false);
const isMobile = ref(false);

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

const closeSidebar = () => {
  showSidebar.value = false;
};

// ✅ Use the correct cookie name and also track current user
const userEmail = ref("");
const currentUser = ref(null);

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    showSidebar.value = true; // Show sidebar by default on desktop
  }
};

// Get user display name
const userDisplayName = computed(() => {
  if (!userEmail.value) return "ແຂກ";
  return userEmail.value.split("@")[0] || userEmail.value;
});

// Navigation items
const navigationItems = [
  {
    path: "/booking/Choose_a_booking",
    icon: "🏠",
    label: "ໜ້າຫຼັກ",
    description: "ຈອງເຮືອ",
    needsUserParam: true,
  },
  {
    path: "/add_ship/add_ships",
    icon: "ℹ️",
    label: "ກ່ຽວກັບຮ້ານ",
    description: "ຂໍ້ມູນຮ້ານ",
    needsUserParam: false,
  },
  {
    path: "/add_ship/edit_ship",
    icon: "📋",
    label: "ລາຍລະອຽດຮ້ານ",
    description: "ລາຍລະອຽດບໍລິການ",
    needsUserParam: false,
  },
  {
    path: "/login_users/userList",
    icon: "🛒",
    label: "ສິນຄ້າພາຍໃນຮ້ານ",
    description: "ເມນູອາຫານ",
    needsUserParam: false,
  },
  {
    path: "/products/insert_food",
    icon: "🛒",
    label: "ສິນຄ້າພາຍໃນຮ້ານ",
    description: "ເມນູອາຫານ",
    needsUserParam: false,
  },
  {
    path: "/products/edit_product",
    icon: "🛒",
    label: "ສິນຄ້າພາຍໃນຮ້ານ",
    description: "ເມນູອາຫານ",
    needsUserParam: false,
  },
  {
    path: "/registers/register_user",
    icon: "🛒",
    label: "ສິນຄ້າພາຍໃນຮ້ານ",
    description: "ເມນູອາຫານ",
    needsUserParam: false,
  },
  {
    path: "/booking/Reservation_history",
    icon: "📋",
    label: "ປະຫວັດການຈອງ",
    description: "ເບິ່ງການຈອງທີ່ຜ່ານມາ",
    needsUserParam: true,
  },
];

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);

  // ✅ Listen to Firebase Auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      currentUser.value = user;
      userEmail.value = user.email;
    } else {
      // User is signed out
      currentUser.value = null;
      userEmail.value = "";
    }
  });

  // ✅ Get user email from URL query parameter as fallback
  const route = useRoute();
  if (route.query.user) {
    userEmail.value = route.query.user;
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (isMobile.value && showSidebar.value) {
      const sidebar = document.querySelector(".sidebar");
      const toggleBtn = document.querySelector(".toggle-button");
      if (!sidebar?.contains(e.target) && !toggleBtn?.contains(e.target)) {
        closeSidebar();
      }
    }
  });
});
</script>
<template>
  <div class="layout-container">
    <!-- Sidebar Overlay for Mobile -->
    <div
      v-if="showSidebar && isMobile"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{
        'sidebar-open': showSidebar,
        'sidebar-mobile': isMobile,
      }"
    >
      <!-- Sidebar Header -->
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="logo">🚢</div>
          <div class="brand-info">
            <h3 class="brand-name">ທະເລລາວ</h3>
            <p class="brand-subtitle">ບໍລິການຈອງເຮືອ</p>
          </div>
        </div>
        <button v-if="isMobile" @click="closeSidebar" class="close-sidebar-btn">
          ✕
        </button>
      </div>

      <!-- User Info -->
      <div class="user-info">
        <div class="user-avatar">
          {{ userDisplayName.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <p class="user-name">{{ userDisplayName }}</p>
          <p class="user-status">{{ userEmail ? userEmail : "ແຂກ" }}</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li v-for="item in navigationItems" :key="item.path" class="nav-item">
            <NuxtLink
              :to="
                item.needsUserParam
                  ? {
                      path: item.path,
                      query: { user: userEmail },
                    }
                  : item.path
              "
              class="nav-link"
              @click="isMobile && closeSidebar()"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <div class="nav-content">
                <span class="nav-label">{{ item.label }}</span>
                <span class="nav-description">{{ item.description }}</span>
              </div>
              <span class="nav-arrow">→</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="footer-info">
          <p class="footer-text">© 2024 ທະເລລາວ</p>
          <p class="footer-version">v1.0.0</p>
        </div>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="main-area" :class="{ shifted: showSidebar && !isMobile }">
      <!-- Top Navigation Bar -->
      <header class="top-navbar">
        <div class="navbar-left">
          <button @click="toggleSidebar" class="toggle-button">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>

          <div class="breadcrumb">
            <span class="breadcrumb-icon">📍</span>
            <span class="breadcrumb-text">ທະເລລາວ ບໍລິການ</span>
          </div>
        </div>

        <div class="navbar-right">
          <div class="user-greeting">
            <span class="greeting-text">ສະບາຍດີ</span>
            <span class="user-name-display">{{ userDisplayName }}</span>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <button class="quick-action-btn" title="ການແຈ້ງເຕືອນ">
              🔔
              <span class="notification-badge">3</span>
            </button>
            <button class="quick-action-btn" title="ຊ່ວຍເຫຼືອ">❓</button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <div class="content-wrapper">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer class="main-footer">
        <div class="footer-content">
          <p>&copy; 2024 ທະເລລາວ - ບໍລິການຈອງເຮືອທີ່ດີທີ່ສຸດ</p>
          <div class="footer-links">
            <a href="#" class="footer-link">ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ</a>
            <a href="#" class="footer-link">ເງື່ອນໄຂການໃຊ້ງານ</a>
            <a href="#" class="footer-link">ຕິດຕໍ່ເຮົາ</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.slot {
  overflow-y: auto;
}
/* Global Scrollbar Hiding */
html,
body {
  overflow-x: hidden;
  /* Hide scrollbar for Firefox */
  scrollbar-width: none;
  /* Hide scrollbar for IE/Edge */
  -ms-overflow-style: none;
 
}

/* Hide scrollbar for WebKit browsers (Chrome, Safari, Opera) */
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}

* {
  box-sizing: border-box;
  /* Apply scrollbar hiding to all elements */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

*::-webkit-scrollbar {
  display: none;
}

.layout-container {
  display: flex;
  border-radius: 30px;
  padding: 20px;
  min-height: 100vh;
  font-family: "Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #2b3874 0%, #9193ec 100%);
  color: #c1dada;
  overflow-x: hidden;
  /* Hide horizontal overflow */
  overflow-y: auto;
  /* Allow vertical scrolling but hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.layout-container::-webkit-scrollbar {
  display: none;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 998;
  backdrop-filter: blur(4px);
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #023127 0%, #0977d1 100%);
  color: #fff;
  position: fixed;
  border-radius: 20px;
  top: 0;
  left: 0;
  height: 100vh;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
  box-shadow: 4px 0 20px rgba(255, 206, 206, 0.1);
  display: flex;
  flex-direction: column;
  /* Hide sidebar scrollbar */
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar::-webkit-scrollbar {
  display: none;
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-mobile {
  width: 300px;
}

@media (min-width: 768px) {
  .sidebar {
    position: relative;
    transform: translateX(0);
  }

  .sidebar-open {
    transform: translateX(0);
  }
}

/* Sidebar Header */
.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgb(110, 14, 14);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  font-size: 2rem;
  background: linear-gradient(135deg, #60a5fa, #34d399);
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.brand-info {
  flex: 1;
}

.brand-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.close-sidebar-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-sidebar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* User Info */
.user-info {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
}

.user-status {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  /* Hide navigation scrollbar */
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar-nav::-webkit-scrollbar {
  display: none;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 0 25px 25px 0;
  margin-right: 1rem;
  gap: 1rem;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateX(8px);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #60a5fa, #34d399);
  color: #fff;
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nav-label {
  font-weight: 600;
  font-size: 0.95rem;
}

.nav-description {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.125rem;
}

.nav-arrow {
  font-size: 0.875rem;
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.3s ease;
}

.nav-link:hover .nav-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-info {
  text-align: center;
}

.footer-text,
.footer-version {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Main Area */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* Hide main area scrollbar */
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.main-area::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .main-area.shifted {
    margin-left: 0px;
  }
}

/* Top Navbar */
.top-navbar {
  background: rgba(31, 179, 216, 0.95) linear-gradient(135deg, #60a5fa, #1c5842);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 32px;
  height: 32px;
  justify-content: center;
}

.toggle-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background: #f2f6fd4f;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
}

.breadcrumb-icon {
  font-size: 1rem;
}

.breadcrumb-text {
  font-weight: 600;
  font-size: 1.1rem;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-greeting {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.greeting-text {
  font-size: 1rem;
  color: #ffffff;
}

.user-name-display {
  font-weight: 500;
  color: #fdfeff;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

.quick-action-btn {
  position: relative;
  background: rgba(99, 102, 241, 0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-action-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 0;
  background: transparent;
  /* Hide main content scrollbar */
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.main-content::-webkit-scrollbar {
  display: none;
}

.content-wrapper {
  min-height: calc(100vh - 140px);
  /* Hide content wrapper scrollbar */
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.content-wrapper::-webkit-scrollbar {
  display: none;
}

/* Footer */
.main-footer {
  background: rgba(239, 247, 253, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: -50px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  color: #070202;
}

.footer-content p {
  margin: 0;
  color: #070202;
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-link {
  color: #1d1616;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #ffffff;
}

/* Responsive Design */
@media (max-width: 768px) {
  .top-navbar {
    padding: 1rem;
  }

  .navbar-right {
    gap: 1rem;
  }

  .user-greeting {
    display: none;
  }

  .quick-actions {
    gap: 0.25rem;
  }

  .quick-action-btn {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .breadcrumb-text {
    display: none;
  }

  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sidebar-open {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-overlay {
  animation: fadeIn 0.3s ease;
}
</style>
