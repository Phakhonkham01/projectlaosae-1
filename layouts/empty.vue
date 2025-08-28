<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar Overlay for Mobile -->
    <div
      v-if="showSidebar && isMobile"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed lg:static inset-y-0 left-0 z-50 w-80 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-500 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
      :class="{
        'translate-x-0': showSidebar,
        '-translate-x-full lg:translate-x-0': !showSidebar,
      }"
    >
      <!-- Sidebar Header -->
      <div class="p-6 border-b border-blue-700/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg transform rotate-3"
            >
              🚢
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">ທະເລລາວ</h1>
              <p class="text-sm text-blue-200">Admin Dashboard</p>
            </div>
          </div>
          <button
            v-if="isMobile"
            @click="closeSidebar"
            class="lg:hidden p-2 text-blue-200 hover:text-white hover:bg-blue-700/50 rounded-lg transition-colors"
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
      </div>

      <!-- User Info -->
      <div class="p-6 border-b border-blue-700/50">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <div
              class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
            >
              {{ userDisplayName.charAt(0).toUpperCase() }}
            </div>
            <div
              class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-blue-900 rounded-full"
            ></div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-lg font-bold text-white truncate">
              {{ userDisplayName }}
            </p>
            <p class="text-sm text-blue-200 truncate">
              {{ userEmail || "ແຂກ" }}
            </p>
            <div class="flex items-center mt-2">
              <div
                class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"
              ></div>
              <span
                class="text-xs text-green-300 font-semibold uppercase tracking-wide"
                >Admin</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-2">
          <li v-for="(item, index) in navigationItems" :key="item.path">
            <NuxtLink
              :to="
                item.needsUserParam
                  ? { path: item.path, query: { user: userEmail } }
                  : item.path
              "
              class="group flex items-center p-4 text-blue-100 rounded-xl hover:bg-blue-700/50 hover:text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
              @click="isMobile && closeSidebar()"
            >
              <div
                class="w-12 h-12 bg-blue-700/30 group-hover:bg-blue-600/50 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 group-hover:shadow-lg"
              >
                <span
                  class="text-2xl group-hover:scale-110 transition-transform duration-300"
                  >{{ item.icon }}</span
                >
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="font-semibold text-base truncate group-hover:text-white"
                >
                  {{ item.label }}
                </p>
              </div>
              <svg
                class="w-5 h-5 text-blue-300 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300"
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

      <!-- Sidebar Footer -->
      <div class="p-6 border-t border-blue-700/50">
        <div class="text-center">
          <div class="mb-3">
            <p class="text-sm font-bold text-blue-200">© 2024 ທະເລລາວ</p>
            <p class="text-xs text-blue-300 mt-1">Admin Panel v2.0</p>
          </div>
          <div
            class="flex items-center justify-center space-x-2 p-3 bg-blue-700/30 rounded-xl"
          >
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-xs text-green-300 font-semibold"
              >ລະບົບເຮັດວຽກປົກກະຕິ</span
            >
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
        <div class="flex items-center justify-between h-20 px-4 lg:px-8">
          <!-- Left Side -->
          <div class="flex items-center space-x-4">
            <button
              @click="toggleSidebar"
              class="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 lg:hidden"
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
              class="hidden lg:flex p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
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

            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <span class="text-white text-lg">⚡</span>
              </div>
              <div class="hidden sm:block">
                <p class="text-lg font-bold text-gray-800">Admin Dashboard</p>
                <p class="text-sm text-gray-500">ລະບົບຄຸ້ມຄອງທະເລລາວ</p>
              </div>
            </div>
          </div>

          <!-- Right Side -->
          <div class="flex items-center space-x-4">
            <!-- Quick Stats -->
            <div class="hidden md:flex items-center space-x-4">
              <div
                class="bg-green-50 px-4 py-2 rounded-xl border border-green-200"
              >
                <div class="flex items-center space-x-2">
                  <div
                    class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                  ></div>
                  <span class="text-sm font-semibold text-green-700"
                    >ລະບົບພ້ອມໃຊ້ງານ</span
                  >
                </div>
              </div>
            </div>

            <!-- Admin Greeting -->
            <div
              class="hidden md:flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-2xl border border-blue-200"
            >
              <span class="text-sm text-gray-600 font-medium">ສະບາຍດີ,</span>
              <span class="text-sm font-bold text-blue-700">{{
                userDisplayName
              }}</span>
            </div>

            <!-- Quick Actions -->
            <div class="flex items-center space-x-2">
              <!-- Notifications -->
              <div class="relative">
                <button
                  class="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
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
                    class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce"
                    >5</span
                  >
                </button>
              </div>

              <!-- Settings -->
              <button
                class="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title="ການຕັ້ງຄ່າ"
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </button>

              <!-- User Menu -->
              <div class="relative">
                <button
                  class="flex items-center space-x-2 p-2 rounded-2xl hover:bg-gray-100 transition-all duration-200"
                >
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                  >
                    {{ userDisplayName.charAt(0).toUpperCase() }}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <div class="min-h-full p-6 lg:p-8">
          <!-- Page Header -->
          <div class="mb-8">
            <div
              class="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                    ຍິນດີຕ້ອນຮັບສູ່ລະບົບຄຸ້ມຄອງ
                  </h1>
                  <p class="text-gray-600">
                    ຄຸ້ມຄອງການຈອງເຮືອ ແລະ ບໍລິການຕ່າງໆ ຂອງທະເລລາວ
                  </p>
                </div>
                <div class="hidden lg:block">
                  <div
                    class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <span class="text-white text-3xl">🚢</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Content Slot -->
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
                <span class="font-bold text-gray-800">ທະເລລາວ Admin Panel</span>
                - ລະບົບຄຸ້ມຄອງທີ່ທັນສະໄໝ
              </p>
            </div>
            <div class="flex flex-wrap gap-6 text-sm">
              <a
                href="#"
                class="text-gray-500 hover:text-blue-600 transition-colors font-medium"
                >ຄູ່ມືການໃຊ້ງານ</a
              >
              <a
                href="#"
                class="text-gray-500 hover:text-blue-600 transition-colors font-medium"
                >ສະໜັບສະໜູນ</a
              >
              <a
                href="#"
                class="text-gray-500 hover:text-blue-600 transition-colors font-medium"
                >ຕິດຕໍ່ເຮົາ</a
              >
            </div>
          </div>

          <!-- Status Indicator -->
          <div
            class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center md:justify-start"
          >
            <div class="flex items-center space-x-4 text-xs text-gray-500">
              <div class="flex items-center space-x-2">
                <div
                  class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                ></div>
                <span class="font-medium">ເຊີເວີເຮັດວຽກປົກກະຕິ</span>
              </div>
              <span class="mx-2">•</span>
              <div class="flex items-center space-x-2">
                <span class="font-medium">ຂໍ້ມູນອັບເດດ</span>
                <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <span class="mx-2">•</span>
              <div class="flex items-center space-x-2">
                <span class="font-medium">{{
                  new Date().toLocaleDateString("lo-LA")
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useFirebase } from "@/composables/useFirebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRoute } from "vue-router";

const { auth } = useFirebase();
const showSidebar = ref(false);
const userEmail = ref("");
const currentUser = ref(null);
const isMobile = ref(false);

const toggleSidebar = () => (showSidebar.value = !showSidebar.value);
const closeSidebar = () => (showSidebar.value = false);
const userDisplayName = computed(() => userEmail.value?.split("@")[0] || "ແຂກ");

const navigationItems = [
  {
    path: "/admin/dashboard/",
    icon: "🏠",
    label: "ໜ້າຫຼັກ",
    needsUserParam: false,
  },
  {
    path: "/admin/show_all_booking/",
    icon: "📊",
    label: "ກວດສອບການຈອງທັງໝົດ",
    needsUserParam: false,
  },
  {
    path: "/add_ship/add_ships",
    icon: "➕",
    label: "ເພີ່ມເຮືອລຳໃໝ່",
    needsUserParam: false,
  },
  {
    path: "/add_ship/edit_ship",
    icon: "🛠️",
    label: "ກວດສອບເຮືອ / ແກ້ໄຂເຮືອ",
    needsUserParam: false,
  },
  {
    path: "/products/insert_food",
    icon: "🍜",
    label: "ເພີ່ມອາຫານ",
    needsUserParam: false,
  },
  {
    path: "/products/edit_product",
    icon: "✏️",
    label: "ແກ້ໄຂອາຫານ",
    needsUserParam: false,
  },
  {
    path: "/registers/add_employee",
    icon: "👥",
    label: "ເພີ່ມພະນັກງານ",
    needsUserParam: false,
  },
  {
    path: "/login_users/userList",
    icon: "👥",
    label: "ຜູ້ໃຊ້ທັງໝົດ",
    needsUserParam: false,
  },
  {
    path: "/admin/Choose_a_booking",
    icon: "👥",
    label: "SELL",
    needsUserParam: false,
  },
];

onMounted(() => {
  isMobile.value = window.innerWidth < 768;
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth < 768;
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser.value = user;
      userEmail.value = user.email;
    }
  });

  const route = useRoute();
  if (route.query.user) userEmail.value = route.query.user;
});
</script>

<style scoped>
/* Add your custom styles here */
</style>
