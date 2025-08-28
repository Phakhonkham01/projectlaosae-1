<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"
  >
    <!-- Header -->
    <header
      class="bg-white shadow-xl border-b border-gray-200 sticky top-0 z-10"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Left Side -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p class="text-sm text-gray-500">ລະບົບຈັດການແອັດມິນ</p>
              </div>
            </div>
          </div>

          <!-- Right Side -->
          <div class="flex items-center space-x-4">
            <!-- Current Time -->
            <div
              class="hidden md:flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg"
            >
              <svg
                class="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span class="text-sm font-medium text-gray-700">{{
                new Date().toLocaleTimeString("lo-LA")
              }}</span>
            </div>

            <!-- User Info -->
            <div
              class="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200"
            >
              <div
                class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm"
              >
                {{ (adminName || userEmail || "A").charAt(0).toUpperCase() }}
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-semibold text-gray-800">
                  {{ userEmail }}
                </p>
                <p class="text-xs text-blue-600">{{ userRole }}</p>
              </div>
            </div>

            <!-- Logout Button -->
            <button
              @click="logout"
              class="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg
                class="w-4 h-4"
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
              <span class="hidden sm:inline text-sm font-medium"
                >ອອກຈາກລະບົບ</span
              >
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <section class="mb-8">
        <div
          class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden"
        >
          <!-- Background Pattern -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
          ></div>
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"
          ></div>
          <div
            class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"
          ></div>

          <div class="relative z-10">
            <div
              class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-4">
                  <div
                    class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <span class="text-2xl">👋</span>
                  </div>
                  <div>
                    <h2 class="text-2xl lg:text-3xl font-bold">
                      ຍິນດີຕ້ອນຮັບ, {{ adminName || "Admin" }}
                    </h2>
                    <p class="text-blue-100 opacity-90">ລະບົບຈັດການແອັດມິນ</p>
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div class="flex items-center space-x-2">
                    <svg
                      class="w-4 h-4 text-blue-200"
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
                    <span class="text-blue-100">{{ userEmail }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg
                      class="w-4 h-4 text-blue-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      ></path>
                    </svg>
                    <span class="text-blue-100">ສິດ: {{ userRole }}</span>
                  </div>
                </div>
              </div>
              <div class="lg:text-right">
                <div
                  class="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20"
                >
                  <p class="text-blue-100 text-sm mb-1">ເຂົ້າລະບົບເມື່ອ:</p>
                  <p class="text-lg font-bold">{{ loginTime }}</p>
                  <div
                    class="flex items-center justify-center lg:justify-end space-x-2 mt-2"
                  >
                    <div
                      class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                    ></div>
                    <span class="text-sm text-green-200">ອອນລາຍ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-16"
      >
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p class="mt-4 text-lg font-medium text-gray-600">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        <p class="text-sm text-gray-500">ກະລຸນາລໍຖ້າ...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-2xl p-6"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-red-800">ເກີດຂໍ້ຜິດພາດ</h3>
            <p class="text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <section v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Card -->
        <div
          class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-center space-x-4 mb-6">
            <div
              class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
            >
              {{ (adminName || userEmail || "A").charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">ຂໍ້ມູນແອັດມິນ</h3>
              <p class="text-sm text-gray-500">ລາຍລະອຽດບັນຊີ</p>
            </div>
          </div>
          <div class="space-y-4">
            <div
              class="flex items-center justify-between py-2 border-b border-gray-100"
            >
              <span class="text-sm font-medium text-gray-600">ຊື່:</span>
              <span class="text-sm font-semibold text-gray-800">{{
                adminName || "Admin"
              }}</span>
            </div>
            <div
              class="flex items-center justify-between py-2 border-b border-gray-100"
            >
              <span class="text-sm font-medium text-gray-600">ອີເມວ:</span>
              <span class="text-sm font-semibold text-gray-800 truncate">{{
                userEmail
              }}</span>
            </div>
            <div
              class="flex items-center justify-between py-2 border-b border-gray-100"
            >
              <span class="text-sm font-medium text-gray-600">ສິດ:</span>
              <span class="text-sm font-semibold text-indigo-600">{{
                userRole
              }}</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm font-medium text-gray-600">ສະຖານະ:</span>
              <div class="flex items-center space-x-2">
                <div
                  class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                ></div>
                <span class="text-sm font-semibold text-green-600">ອອນລາຍ</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Card -->
        <div
          class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-center space-x-4 mb-6">
            <div
              class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">ສະຖິຕິດ່ວນ</h3>
              <p class="text-sm text-gray-500">ຂໍ້ມູນການໃຊ້ງານ</p>
            </div>
          </div>
          <div class="space-y-4">
            <div
              class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-green-700"
                  >ເຂົ້າລະບົບມື້ນີ້:</span
                >
                <span class="text-lg font-bold text-green-800">1</span>
              </div>
            </div>
            <div
              class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-blue-700"
                  >ເວລາອອນລາຍ:</span
                >
                <span class="text-lg font-bold text-blue-800 font-mono">{{
                  onlineTime
                }}</span>
              </div>
            </div>
            <div
              class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200"
            >
              <div class="flex flex-col">
                <span class="text-sm font-medium text-purple-700 mb-1"
                  >ເຂົ້าຫຼ້າສຸດ:</span
                >
                <span class="text-sm font-semibold text-purple-800">{{
                  loginTime
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Card -->
        <div
          class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-center space-x-4 mb-6">
            <div
              class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">ດຳເນີນການດ່ວນ</h3>
              <p class="text-sm text-gray-500">ເຄື່ອງມືຈັດການ</p>
            </div>
          </div>
          <div class="space-y-3">
            <NuxtLink to="/login_users/userList">
              <button
                class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <div class="flex items-center space-x-3">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    ></path>
                  </svg>
                  <span class="font-semibold">ຈັດການຜູ້ໃຊ້</span>
                </div>
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
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            </NuxtLink>

            <button
              class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              <div class="flex items-center space-x-3">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <span class="font-semibold">ຈັດການການຈອງ</span>
              </div>
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
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>

            <button
              class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
            >
              <div class="flex items-center space-x-3">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
                <span class="font-semibold">ລາຍງານ</span>
              </div>
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
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>

            <button
              class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              <div class="flex items-center space-x-3">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                <span class="font-semibold">ຕັ້ງຄ່າ</span>
              </div>
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
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Additional Stats Section -->
      <section
        class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <!-- Total Users -->
        <div
          class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium">ຜູ້ໃຊ້ທັງໝົດ</p>
              <p class="text-2xl font-bold">ຍັງບໍທັນສ້າງ</p>
            </div>
            <div
              class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Bookings -->
        <div
          class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">ການຈອງທັງໝົດ</p>
              <p class="text-2xl font-bold">ຍັງບໍທັນສ້າງ</p>
            </div>
            <div
              class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Revenue -->
        <div
          class="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm font-medium">ລາຍຮັບ</p>
              <p class="text-2xl font-bold">ຍັງບໍທັນສ້າງ</p>
            </div>
            <div
              class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Active Sessions -->
        <div
          class="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium">ເຊດຊັນຍາມນີ້</p>
              <p class="text-2xl font-bold">ຍັງບໍທັນສ້າງ</p>
            </div>
            <div
              class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- System Status -->
      <section class="mt-8">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-800">ສະຖານະລະບົບ</h3>
            <div class="flex items-center space-x-2">
              <div
                class="w-3 h-3 bg-green-500 rounded-full animate-pulse"
              ></div>
              <span class="text-sm font-medium text-green-600"
                >ລະບົບເຮັດວຽກປົກກະຕິ</span
              >
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              class="text-center p-4 bg-green-50 rounded-xl border border-green-200"
            >
              <div
                class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 12l5 5L20 7"
                  ></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-800">Database</h4>
              <p class="text-sm text-green-600 font-medium">ເຊື່ອມຕໍ່ແລ້ວ</p>
            </div>
            <div
              class="text-center p-4 bg-green-50 rounded-xl border border-green-200"
            >
              <div
                class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-800">Security</h4>
              <p class="text-sm text-green-600 font-medium">ປອດໄພ</p>
            </div>
            <div
              class="text-center p-4 bg-green-50 rounded-xl border border-green-200"
            >
              <div
                class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7"
                  ></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-800">Performance</h4>
              <p class="text-sm text-green-600 font-medium">ເລັ່ງ</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div class="mb-4 md:mb-0">
            <p class="text-sm text-gray-600">
              &copy; 2024
              <span class="font-semibold text-gray-800">ທະເລລາວ Admin</span> -
              ລະບົບຈັດການແອັດມິນ
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 text-xs text-gray-500">
              <div
                class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              ></div>
              <span>ລະບົບເຮັດວຽກປົກກະຕິ</span>
            </div>
            <div class="flex items-center space-x-2 text-xs text-gray-500">
              <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>ເວີຊັ່ນ 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "empty",
  prerender: false, // ⛔ Don't try to prerender this dynamic login page
});

import { ref, computed, onMounted, onUnmounted } from "vue";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "@/composables/useFirebase";

const { auth, db } = useFirebase();

const adminName = ref("");
const userEmail = ref("");
const userRole = ref("");
const loginTime = ref("");
const loading = ref(true);
const error = ref("");
const startTime = ref(Date.now());

const onlineTime = computed(() => {
  const now = Date.now();
  const diff = now - startTime.value;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

const logout = async () => {
  try {
    // Clear cookies
    const emailCookie = useCookie("userEmail");
    const rememberCookie = useCookie("rememberMe");

    emailCookie.value = null;
    rememberCookie.value = null;

    // Sign out from Firebase
    await signOut(auth);

    // Redirect to login page
    await navigateTo("/");
  } catch (error) {
    console.error("Logout error:", error);
    alert("ເກີດຂໍ້ຜິດພາດໃນການອອກຈາກລະບົບ");
  }
};

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsub = auth.onAuthStateChanged((user) => {
      unsub();
      resolve(user);
    }, reject);
  });
};

const checkUser = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return navigateTo("/");

    userEmail.value = user.email;
    loginTime.value = new Date().toLocaleString("lo-LA");

    const docRef = await getDoc(doc(db, "Users", user.uid));
    if (!docRef.exists()) return navigateTo("/");

    const data = docRef.data();
    adminName.value = data.name || "Admin";
    userRole.value = data.role || "admin";

    if (data.role !== "admin") {
      return navigateTo(`/booking/Choose_a_booking/?user=${user.email}`);
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

let interval = null;

onMounted(() => {
  checkUser();
  interval = setInterval(() => {
    // Force reactivity update for onlineTime
    startTime.value = startTime.value;
  }, 1000);
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>
