<template>
  <div class="min-h-screen bg-gray-50 p-4 lg:p-8">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header Section -->
      <div
        class="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <span class="text-white text-2xl">📋</span>
            </div>
            <div>
              <h1 class="text-2xl lg:text-3xl font-bold text-gray-800">
                ການຈອງທັງໝົດ
              </h1>
              <p class="text-gray-600 mt-1">ຄຸ້ມຄອງ ແລະ ຢືນຢັນການຈອງທັງໝົດ</p>
            </div>
          </div>
          <button
            @click="refreshBookings"
            :disabled="loading"
            class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <svg
              class="w-5 h-5"
              :class="{ 'animate-spin': loading }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            <span>ໂຫຼດຂໍ້ມູນໃໝ່</span>
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3
          class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
        >
          <span class="text-xl">🔍</span>
          ການກັ່ນຕອງ ແລະ ຄົ້ນຫາ
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >ສະຖານະການຊຳລະ</label
            >
            <select
              v-model="paymentFilter"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="">ທັງໝົດ</option>
              <option value="confirmed">ຢືນຢັນແລ້ວ</option>
              <option value="pending">ລໍຖ້າຢືນຢັນ</option>
              <option value="invalid">ການຊຳລະບໍ່ຖືກຕ້ອງ</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >ວິທີການຊຳລະ</label
            >
            <select
              v-model="paymentMethodFilter"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="">ທັງໝົດ</option>
              <option value="Cash">ເງິນສົດ</option>
              <option value="Transfer">ໂອນເງິນ</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >ຄົ້ນຫາ</label
            >
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ຄົ້ນຫາຊື່ເຮືອ ຫຼື ຜູ້ຈອງ..."
                class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <svg
                class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center"
            >
              <span class="text-xl">📋</span>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-800">
                {{ bookings.length }}
              </div>
              <div class="text-gray-600 text-sm font-medium">ການຈອງທັງໝົດ</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center"
            >
              <span class="text-xl">✅</span>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-800">
                {{ confirmedBookings }}
              </div>
              <div class="text-gray-600 text-sm font-medium">ຢືນຢັນແລ້ວ</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center"
            >
              <span class="text-xl">⏳</span>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-800">
                {{ pendingBookings }}
              </div>
              <div class="text-gray-600 text-sm font-medium">ລໍຖ້າຢືນຢັນ</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center"
            >
              <span class="text-xl">❌</span>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-800">
                {{ invalidBookings }}
              </div>
              <div class="text-gray-600 text-sm font-medium">
                ການຊຳລະບໍ່ຖືກຕ້ອງ
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center"
            >
              <span class="text-xl">💰</span>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-800">
                {{ formatPrice(totalRevenue) }}
              </div>
              <div class="text-gray-600 text-sm font-medium">
                ລາຍຮັບລວມ (ກີບ)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20"
      >
        <div
          class="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-4"
        ></div>
        <p class="text-gray-600 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
      >
        <span class="text-red-500 text-xl">❌</span>
        <span class="text-red-700 font-medium">{{ errorMessage }}</span>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
      >
        <span class="text-green-500 text-xl">✅</span>
        <span class="text-green-700 font-medium">{{ successMessage }}</span>
      </div>

      <!-- Bookings Grid -->
      <div
        v-if="!loading && filteredBookings.length > 0"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div
          v-for="booking in filteredBookings"
          :key="booking.id"
          class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200"
        >
          <!-- Booking Header -->
          <div
            class="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold text-gray-800 mb-1">
                  {{ booking.shipName }}
                </h3>
                <p class="text-gray-600">{{ formatDate(booking.date) }}</p>
              </div>
              <span
                class="px-4 py-2 rounded-full text-sm font-semibold"
                :class="getPaymentStatusClass(booking)"
              >
                {{ getPaymentStatusText(booking) }}
              </span>
            </div>
          </div>

          <!-- Booking Content -->
          <div class="p-6 space-y-6">
            <!-- Basic Details -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-50 rounded-xl p-4">
                <p class="text-blue-700 text-sm font-medium mb-1">ຜູ້ຈອງ</p>
                <p class="text-blue-900 font-semibold">{{ booking.user }}</p>
              </div>
              <div class="bg-purple-50 rounded-xl p-4">
                <p class="text-purple-700 text-sm font-medium mb-1">
                  ວັນທີ່ຈອງ
                </p>
                <p class="text-purple-900 font-semibold">
                  {{ formatDateTime(booking.createdAt) }}
                </p>
              </div>
              <div class="bg-green-50 rounded-xl p-4">
                <p class="text-green-700 text-sm font-medium mb-1">ຈຳນວນຄົນ</p>
                <p class="text-green-900 font-semibold">
                  {{ booking.people }} ຄົນ
                </p>
              </div>
              <div class="bg-orange-50 rounded-xl p-4">
                <p class="text-orange-700 text-sm font-medium mb-1">
                  ຈຳນວນຊົ່ວໂມງ
                </p>
                <p class="text-orange-900 font-semibold">
                  {{ booking.hour }} ຊົ່ວໂມງ
                </p>
              </div>
            </div>

            <!-- Food Items -->
            <div
              v-if="booking.items && booking.items.length > 0"
              class="bg-gray-50 rounded-xl p-4"
            >
              <h4
                class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"
              >
                <span class="text-xl">🍽</span>
                ອາຫານທີ່ສັ່ງ
              </h4>
              <div class="space-y-2">
                <div
                  v-for="item in booking.items"
                  :key="item.id"
                  class="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <span class="font-medium text-gray-800"
                    >{{ item.name }} ×{{ item.quantity }}</span
                  >
                  <span class="font-bold text-indigo-600"
                    >{{ formatPrice(item.price * item.quantity) }} ກີບ</span
                  >
                </div>
              </div>
            </div>

            <!-- Pricing -->
            <div
              class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4"
            >
              <h4
                class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"
              >
                <span class="text-xl">💰</span>
                ລາຄາລວມ
              </h4>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">ລາຄາເຮືອ:</span>
                  <span class="font-semibold text-gray-800"
                    >{{ formatPrice(booking.shipPrice) }} ກີບ</span
                  >
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">ລາຄາອາຫານ:</span>
                  <span class="font-semibold text-gray-800"
                    >{{ formatPrice(booking.foodTotalPrice) }} ກີບ</span
                  >
                </div>
                <div class="border-t border-indigo-200 pt-2">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-bold text-indigo-800"
                      >ລາຄາລວມ:</span
                    >
                    <span class="text-xl font-bold text-indigo-800"
                      >{{ formatPrice(booking.grandTotal) }} ກີບ</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4
                class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"
              >
                <span class="text-xl">💳</span>
                ຂໍ້ມູນການຊຳລະ
              </h4>
              <div class="grid grid-cols-1 gap-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">ວິທີການຊຳລະ:</span>
                  <span
                    class="font-semibold px-3 py-1 rounded-full text-sm"
                    :class="
                      booking.paymentMethod === 'Cash'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    "
                  >
                    {{
                      booking.paymentMethod === "Cash" ? "ເງິນສົດ" : "ໂອນເງິນ"
                    }}
                  </span>
                </div>
                <div
                  v-if="booking.bookingNumber"
                  class="flex justify-between items-center"
                >
                  <span class="text-gray-600">ເລກທີ່ຈອງ:</span>
                  <span
                    class="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded"
                    >{{ booking.bookingNumber }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Payment Proof -->
            <div
              v-if="
                booking.paymentMethod === 'Transfer' && booking.paymentProofUrl
              "
              class="bg-blue-50 rounded-xl p-4"
            >
              <p
                class="text-blue-800 font-semibold mb-3 flex items-center gap-2"
              >
                <span class="text-xl">📸</span>
                ຫຼັກຖານການຊຳລະ
              </p>
              <img
                :src="booking.paymentProofUrl"
                alt="Payment Proof"
                class="w-32 h-32 object-cover rounded-xl border border-blue-200 cursor-pointer hover:scale-105 transition-transform duration-200"
                @click="viewPaymentProof(booking.paymentProofUrl)"
              />
            </div>

            <!-- Action Buttons -->
            <div
              class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200"
            >
              <!-- Confirm Payment Button -->
              <button
                v-if="getPaymentStatus(booking) === 'pending'"
                @click="confirmPayment(booking)"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span class="text-lg">✅</span>
                ຢືນຢັນການຊຳລະ
              </button>

              <!-- Mark as Invalid Button -->
              <button
                v-if="getPaymentStatus(booking) === 'pending'"
                @click="markPaymentInvalid(booking)"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span class="text-lg">❌</span>
                ການຊຳລະບໍ່ຖືກຕ້ອງ
              </button>

              <!-- Cancel Confirmation Button -->
              <button
                v-if="getPaymentStatus(booking) === 'confirmed'"
                @click="cancelPaymentConfirmation(booking)"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span class="text-lg">🔄</span>
                ຍົກເລີກການຢືນຢັນ
              </button>

              <!-- Reset Invalid Status Button -->
              <button
                v-if="getPaymentStatus(booking) === 'invalid'"
                @click="resetPaymentStatus(booking)"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span class="text-lg">🔄</span>
                ຣີເຊັດສະຖານະ
              </button>

              <!-- View Details Button -->
              <button
                @click="viewBookingDetails(booking)"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span class="text-lg">👁️</span>
                ລາຍລະອຽດ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Bookings State -->
      <div
        v-if="!loading && filteredBookings.length === 0"
        class="text-center py-20"
      >
        <div
          class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span class="text-4xl text-gray-400">📋</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">ບໍ່ມີການຈອງ</h3>
        <p class="text-gray-600 max-w-md mx-auto">
          {{
            bookings.length === 0
              ? "ຍັງບໍ່ມີການຈອງໃດໆ"
              : "ບໍ່ພົບການຈອງທີ່ຕົງຕາມເງື່ອນໄຂ"
          }}
        </p>
      </div>
    </div>

    <!-- Payment Proof Modal -->
    <div
      v-if="showPaymentProof"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div
          class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <span class="text-2xl">📸</span>
              ຫຼັກຖານການຊຳລະ
            </h3>
            <button
              @click="showPaymentProof = false"
              class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <span class="text-white font-bold">✕</span>
            </button>
          </div>
        </div>
        <div class="p-6 text-center">
          <img
            :src="selectedPaymentProof"
            alt="Payment Proof"
            class="max-w-full max-h-96 mx-auto rounded-xl shadow-lg"
          />
        </div>
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
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { getApp } from "firebase/app";

// Firebase setup
const db = getFirestore(getApp());

// State variables
const bookings = ref([]);
const loading = ref(true);
const errorMessage = ref("");
const successMessage = ref("");

// Filter variables
const paymentFilter = ref("");
const paymentMethodFilter = ref("");
const searchQuery = ref("");

// Modal state
const showPaymentProof = ref(false);
const selectedPaymentProof = ref("");

// Computed properties
const confirmedBookings = computed(() => {
  return bookings.value.filter(
    (booking) => getPaymentStatus(booking) === "confirmed"
  ).length;
});

const pendingBookings = computed(() => {
  return bookings.value.filter(
    (booking) => getPaymentStatus(booking) === "pending"
  ).length;
});

const invalidBookings = computed(() => {
  return bookings.value.filter(
    (booking) => getPaymentStatus(booking) === "invalid"
  ).length;
});

const totalRevenue = computed(() => {
  return bookings.value
    .filter((booking) => getPaymentStatus(booking) === "confirmed")
    .reduce((total, booking) => total + (booking.grandTotal || 0), 0);
});

// Get payment status - single source of truth
const getPaymentStatus = (booking) => {
  // Priority: paymentStatus field > legacy paymentConfirmed field
  if (booking.paymentStatus) {
    return booking.paymentStatus; // 'pending', 'confirmed', or 'invalid'
  }

  // Legacy support for existing data
  if (booking.paymentConfirmed === true) {
    return "confirmed";
  } else if (booking.paymentInvalid === true) {
    return "invalid";
  } else {
    return "pending";
  }
};

// Filtered bookings computed property
const filteredBookings = computed(() => {
  let filtered = bookings.value;

  // Filter by payment status
  if (paymentFilter.value) {
    filtered = filtered.filter(
      (booking) => getPaymentStatus(booking) === paymentFilter.value
    );
  }

  // Filter by payment method
  if (paymentMethodFilter.value) {
    filtered = filtered.filter(
      (booking) => booking.paymentMethod === paymentMethodFilter.value
    );
  }

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(
      (booking) =>
        booking.shipName
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        booking.user.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return filtered;
});

// Get payment status class for styling
const getPaymentStatusClass = (booking) => {
  const status = getPaymentStatus(booking);
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "invalid":
      return "bg-red-100 text-red-800";
    case "pending":
    default:
      return "bg-orange-100 text-orange-800";
  }
};

// Get payment status text
const getPaymentStatusText = (booking) => {
  const status = getPaymentStatus(booking);
  switch (status) {
    case "confirmed":
      return "ຢືນຢັນແລ້ວ";
    case "invalid":
      return "ການຊຳລະບໍ່ຖືກຕ້ອງ";
    case "pending":
    default:
      return "ລໍຖ້າຢືນຢັນ";
  }
};

// Load bookings from Firebase
const loadBookings = async () => {
  try {
    loading.value = true;
    errorMessage.value = "";

    const q = query(
      collection(db, "FoodBookings"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    bookings.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Error loading bookings:", err);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນການຈອງ";
  } finally {
    loading.value = false;
  }
};

// Refresh bookings
const refreshBookings = async () => {
  await loadBookings();
  successMessage.value = "ໂຫຼດຂໍ້ມູນໃໝ່ສຳເລັດ";
  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
};

// Confirm payment
const confirmPayment = async (booking) => {
  try {
    const bookingRef = doc(db, "FoodBookings", booking.id);
    await updateDoc(bookingRef, {
      paymentStatus: "confirmed",
      // Keep legacy fields for backward compatibility
      paymentConfirmed: true,
      paymentInvalid: false,
    });

    // Update local state
    booking.paymentStatus = "confirmed";
    booking.paymentConfirmed = true;
    booking.paymentInvalid = false;

    successMessage.value = `ຢືນຢັນການຊຳລະສຳລັບການຈອງ ${booking.shipName} ສຳເລັດ`;
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error confirming payment:", err);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການຢືນຢັນການຊຳລະ";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  }
};

// Mark payment as invalid
const markPaymentInvalid = async (booking) => {
  try {
    const bookingRef = doc(db, "FoodBookings", booking.id);
    await updateDoc(bookingRef, {
      paymentStatus: "invalid",
      // Keep legacy fields for backward compatibility
      paymentInvalid: true,
      paymentConfirmed: false,
    });

    // Update local state
    booking.paymentStatus = "invalid";
    booking.paymentInvalid = true;
    booking.paymentConfirmed = false;

    successMessage.value = `ໝາຍການຊຳລະບໍ່ຖືກຕ້ອງສຳລັບການຈອງ ${booking.shipName} ສຳເລັດ`;
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error marking payment invalid:", err);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການໝາຍການຊຳລະບໍ່ຖືກຕ້ອງ";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  }
};

// Cancel payment confirmation
const cancelPaymentConfirmation = async (booking) => {
  try {
    const bookingRef = doc(db, "FoodBookings", booking.id);
    await updateDoc(bookingRef, {
      paymentStatus: "pending",
      // Keep legacy fields for backward compatibility
      paymentConfirmed: false,
      paymentInvalid: false,
    });

    // Update local state
    booking.paymentStatus = "pending";
    booking.paymentConfirmed = false;
    booking.paymentInvalid = false;

    successMessage.value = `ຍົກເລີກການຢືນຢັນການຊຳລະສຳລັບການຈອງ ${booking.shipName} ສຳເລັດ`;
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error canceling payment confirmation:", err);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການຍົກເລີກການຢືນຢັນ";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  }
};

// Reset payment status (from invalid back to pending)
const resetPaymentStatus = async (booking) => {
  try {
    const bookingRef = doc(db, "FoodBookings", booking.id);
    await updateDoc(bookingRef, {
      paymentStatus: "pending",
      // Keep legacy fields for backward compatibility
      paymentInvalid: false,
      paymentConfirmed: false,
    });

    // Update local state
    booking.paymentStatus = "pending";
    booking.paymentInvalid = false;
    booking.paymentConfirmed = false;

    successMessage.value = `ຣີເຊັດສະຖານະການຊຳລະສຳລັບການຈອງ ${booking.shipName} ສຳເລັດ`;
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error resetting payment status:", err);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການຣີເຊັດສະຖານະ";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  }
};

// View payment proof
const viewPaymentProof = (imageUrl) => {
  selectedPaymentProof.value = imageUrl;
  showPaymentProof.value = true;
};

// View booking details
const viewBookingDetails = (booking) => {
  console.log("View details for booking:", booking);
  const statusText = getPaymentStatusText(booking);
  alert(
    `ລາຍລະອຽດການຈອງ: ${booking.shipName}\nເລກທີ່ຈອງ: ${
      booking.bookingNumber || "N/A"
    }\nສະຖານະ: ${statusText}\nຜູ້ຈອງ: ${booking.user}\nລາຄາລວມ: ${formatPrice(
      booking.grandTotal
    )} ກີບ`
  );
};

// Helper functions
const formatPrice = (price) => {
  return new Intl.NumberFormat("lo-LA").format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("lo-LA");
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return "";
  let date;
  if (timestamp.seconds) {
    // Firebase timestamp
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  return date.toLocaleString("lo-LA");
};

// Load bookings on component mount
onMounted(async () => {
  await loadBookings();
});
</script>
