<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar Overlay for Mobile -->
    <div
      v-if="showSidebar && isMobile"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed lg:static inset-y-0 left-0 z-50 w-80 bg-blue-100 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
      :class="{
        'translate-x-0': showSidebar,
        '-translate-x-full lg:translate-x-0': !showSidebar,
      }"
    >
      <!-- Sidebar Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-100"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
          >
            🚢
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-800">ທະເລລາວ</h3>
            <p class="text-sm text-gray-500">ບໍລິການຈອງເຮືອ</p>
          </div>
        </div>
        <button
          v-if="isMobile"
          @click="closeSidebar"
          class="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- User Info -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center space-x-4">
          <div
            class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            {{ userDisplayName.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-lg font-semibold text-gray-800 truncate">
              {{ userDisplayName }}
            </p>
            <p class="text-sm text-gray-500 truncate">
              {{ userEmail || "ແຂກ" }}
            </p>
            <div class="flex items-center mt-1">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span class="text-xs text-green-600 font-medium">ອອນລາຍ</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-2">
          <li v-for="item in navigationItems" :key="item.path">
            <NuxtLink
              :to="
                item.needsUserParam
                  ? { path: item.path, query: { user: userEmail } }
                  : item.path
              "
              class="group flex items-center p-4 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 transform hover:scale-[1.02]"
              @click="isMobile && closeSidebar()"
            >
              <span
                class="text-2xl mr-4 group-hover:scale-110 transition-transform duration-200"
                >{{ item.icon }}</span
              >
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-base truncate">{{ item.label }}</p>
                <p
                  class="text-sm text-gray-500 group-hover:text-blue-600 truncate"
                >
                  {{ item.description }}
                </p>
              </div>
              <svg
                class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Logout Button -->
      <div class="p-4 border-t border-gray-100">
        <button
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="w-full flex items-center justify-center p-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div v-if="!isLoggingOut" class="flex items-center">
            <svg
              class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            <span class="font-semibold">ອອກຈາກລະບົບ</span>
          </div>
          <div v-else class="flex items-center">
            <div
              class="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-3"
            ></div>
            <span class="font-semibold">ກໍາລັງອອກ...</span>
          </div>
        </button>
      </div>

      <!-- Sidebar Footer -->
      <div class="p-6 border-t border-gray-100 bg-gray-50">
        <div class="text-center">
          <p class="text-sm font-medium text-gray-600">© 2024 ທະເລລາວ</p>
          <p class="text-xs text-gray-400 mt-1">ເວີຊັ່ນ 1.0.0</p>
          <div class="mt-3 flex justify-center space-x-2">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-xs text-gray-500">ລະບົບເຮັດວຽກປົກກະຕິ</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 lg:ml-0">
      <!-- Top Navigation Bar -->
      <header
        class="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-30"
      >
        <div class="flex items-center justify-between h-16 px-4 lg:px-8">
          <!-- Left Side -->
          <div class="flex items-center space-x-4">
            <button
              @click="toggleSidebar"
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>

            <!-- Desktop Menu Toggle -->
            <button
              @click="toggleSidebar"
              class="hidden lg:flex p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>

            <div class="flex items-center space-x-3">
              <div
                class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-sm">📍</span>
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-semibold text-gray-800">
                  ທະເລລາວ ບໍລິການ
                </p>
                <p class="text-xs text-gray-500">ລະບົບຈອງເຮືອອອນລາຍ</p>
              </div>
            </div>
          </div>

          <!-- Right Side -->
          <div class="flex items-center space-x-4">
            <!-- User Greeting -->
            <div
              class="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full"
            >
              <span class="text-sm text-gray-600">ສະບາຍດີ,</span>
              <span class="text-sm font-semibold text-blue-700">{{
                userDisplayName
              }}</span>
            </div>

            <!-- Quick Actions -->
            <div class="flex items-center space-x-2">
              <!-- Notifications -->
              <div class="relative">
                <button
                  class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 17h5l-5-5V9.5a6 6 0 10-12 0V12l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9"
                    ></path>
                  </svg>
                  <span
                    class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse"
                    >3</span
                  >
                </button>
              </div>

              <!-- Help -->
              <button
                class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="ຊ່ວຍເຫຼືອ"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </button>

              <!-- User Menu Dropdown -->
              <div class="relative">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <div
                    class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  >
                    {{ userDisplayName.charAt(0).toUpperCase() }}
                  </div>
                  <svg
                    class="w-4 h-4 text-gray-500 transition-transform duration-200"
                    :class="showUserMenu ? 'rotate-180' : ''"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="showUserMenu"
                  v-click-outside="() => (showUserMenu = false)"
                  class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-[slideUp_0.2s_ease-out]"
                >
                  <!-- User Info in Dropdown -->
                  <div class="px-4 py-3 border-b border-gray-100">
                    <div class="flex items-center space-x-3">
                      <div
                        class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold"
                      >
                        {{ userDisplayName.charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-800 truncate">
                          {{ userDisplayName }}
                        </p>
                        <p class="text-xs text-gray-500 truncate">
                          {{ userEmail }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Menu Items -->
                  <div class="py-2">
                    <button
                      @click="showProfile"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        class="w-4 h-4 mr-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                      ໂປຣໄຟລ์
                    </button>

                    <button
                      @click="showSettings"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        class="w-4 h-4 mr-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      ການຕັ້ງຄ່າ
                    </button>
                  </div>

                  <!-- Logout Button in Dropdown -->
                  <div class="border-t border-gray-100 pt-2">
                    <button
                      @click="handleLogout"
                      :disabled="isLoggingOut"
                      class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div v-if="!isLoggingOut" class="flex items-center">
                        <svg
                          class="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          ></path>
                        </svg>
                        ອອກຈາກລະບົບ
                      </div>
                      <div v-else class="flex items-center">
                        <div
                          class="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-3"
                        ></div>
                        ກໍາລັງອອກ...
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <div class="min-h-full">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-200 py-6">
        <div class="px-4 lg:px-8">
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div class="mb-4 md:mb-0">
              <p class="text-sm text-gray-600">
                &copy; 2024
                <span class="font-semibold text-gray-800">ທະເລລາວ</span> -
                ບໍລິການຈອງເຮືອທີ່ດີທີ່ສຸດ
              </p>
            </div>
            <div class="flex flex-wrap gap-4 text-sm">
              <a
                href="#"
                class="text-gray-500 hover:text-blue-600 transition-colors"
                >ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ</a
              >
              <a
                href="#"
                class="text-gray-500 hover:text-blue-600 transition-colors"
                >ເງື່ອນໄຂການໃຊ້ງານ</a
              >
              <a
                href="#"
                class="text-gray-500 hover:text-blue-600 transition-colors"
                >ຕິດຕໍ່ເຮົາ</a
              >
            </div>
          </div>

          <!-- Status Indicator -->
          <div
            class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center md:justify-start"
          >
            <div class="flex items-center space-x-2 text-xs text-gray-500">
              <div
                class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              ></div>
              <span>ລະບົບເຮັດວຽກປົກກະຕິ</span>
              <span class="mx-2">•</span>
              <span>ເຊື່ອມຕໍ່ປອດໄພ</span>
              <div class="w-2 h-2 bg-blue-400 rounded-full ml-2"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- Logout Confirmation Modal -->
    <div
      v-if="showLogoutModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-[slideUp_0.3s_ease-out]"
      >
        <div class="text-center">
          <div
            class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">ອອກຈາກລະບົບ</h3>
          <p class="text-gray-600 mb-6">ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອອກຈາກລະບົບ?</p>
          <div class="flex gap-3">
            <button
              @click="showLogoutModal = false"
              class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              ຍົກເລີກ
            </button>
            <button
              @click="confirmLogout"
              :disabled="isLoggingOut"
              class="flex-1 px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isLoggingOut">ອອກຈາກລະບົບ</span>
              <span v-else class="flex items-center justify-center">
                <div
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                ></div>
                ກໍາລັງອອກ...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useFirebase } from "@/composables/useFirebase";

const { db, storage, auth } = useFirebase();

const showSidebar = ref(false);
const isMobile = ref(false);
const showUserMenu = ref(false);
const showLogoutModal = ref(false);
const isLoggingOut = ref(false);

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
    path: "#",
    icon: "ℹ️",
    label: "ກ່ຽວກັບຮ້ານ",
    description: "ຂໍ້ມູນຮ້ານ",
    needsUserParam: false,
  },
  {
    path: "#",
    icon: "📋",
    label: "ລາຍລະອຽດຮ້ານ",
    description: "ລາຍລະອຽດບໍລິການ",
    needsUserParam: false,
  },
  {
    path: "#",
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

// Logout functionality
const handleLogout = () => {
  showUserMenu.value = false;
  showLogoutModal.value = true;
};

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Handles the logout process for the user.
 *
 * This function performs the following actions:
 * - Sets the logging out state to true.
 * - Clears user-related cookies, such as `userEmail` and `rememberMe`.
 * - Signs out the user from Firebase authentication.
 * - Clears local state variables for the current user and user email.
 * - Closes the logout confirmation modal.
 * - Redirects the user to the login page.
 *
 * If an error occurs during the process, an error message is logged
 * to the console, and the user is alerted with a failure message.
 * The logging out state is reset to false after the process,
 * regardless of success or failure.
 */

/*******  5fa605a2-f730-48a0-9c4c-6913467ac13c  *******/
const confirmLogout = async () => {
  isLoggingOut.value = true;

  try {
    // Clear cookies
    const emailCookie = useCookie("userEmail");
    const rememberCookie = useCookie("rememberMe");

    emailCookie.value = null;
    rememberCookie.value = null;

    // Sign out from Firebase
    await signOut(auth);

    // Clear local state
    currentUser.value = null;
    userEmail.value = "";

    // Close modal
    showLogoutModal.value = false;

    // Redirect to login page
    await navigateTo("/");
  } catch (error) {
    console.error("Logout error:", error);
    // You could show an error message here
    alert("ເກີດຂໍ້ຜິດພາດໃນການອອກຈາກລະບົບ. ກະລຸນາລອງໃໝ່.");
  } finally {
    isLoggingOut.value = false;
  }
};

// Profile and settings functions
const showProfile = () => {
  showUserMenu.value = false;
  // Navigate to profile page or show profile modal
  console.log("Show profile");
};

const showSettings = () => {
  showUserMenu.value = false;
  // Navigate to settings page or show settings modal
  console.log("Show settings");
};

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
      const sidebar = document.querySelector("aside");
      const toggleBtn = document.querySelector("button");
      if (!sidebar?.contains(e.target) && !toggleBtn?.contains(e.target)) {
        closeSidebar();
      }
    }
  });
});
</script>

<style scoped>
/* Add your custom styles here */
</style>
