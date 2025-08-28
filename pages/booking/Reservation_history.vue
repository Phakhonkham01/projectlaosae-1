<script setup>
import { ref, onMounted, computed } from "vue";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

// ✅ ใช้ useFirebase() เพื่อดึง db และ storage อย่างถูกต้อง
import { useFirebase } from "@/composables/useFirebase";
const { db } = useFirebase(); // ✅ correct

const route = useRoute();
const userEmail = ref(route.query.user);
const historyList = ref([]);
const loading = ref(true);
const selectedFilter = ref("all");
const deletingItems = ref(new Set()); // Track which items are being deleted

// Format price to Lao Kip
const formatPrice = (price) => {
  return new Intl.NumberFormat("lo-LA").format(price) + " ₭";
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("lo-LA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Get payment status - handles both string and legacy boolean values
const getPaymentStatus = (item) => {
  // If paymentConfirmed is a string, use it directly
  if (typeof item.paymentConfirmed === "string") {
    return item.paymentConfirmed; // 'pending', 'confirmed', or 'invalid'
  }

  // Legacy support for boolean values
  if (item.paymentConfirmed === true) {
    return "confirmed";
  } else if (item.paymentInvalid === true) {
    return "invalid";
  } else {
    return "pending";
  }
};

// Get status color and text based on the 3-status system
const getStatusInfo = (item) => {
  const status = getPaymentStatus(item);

  switch (status) {
    case "confirmed":
      return {
        color: "text-green-800 bg-green-100 border border-green-200",
        text: "ຢືນຢັນແລ້ວ",
        icon: "✅",
      };
    case "invalid":
      return {
        color: "text-red-800 bg-red-100 border border-red-200",
        text: "ການຊຳລະບໍ່ຖືກຕ້ອງ",
        icon: "❌",
      };
    case "pending":
    default:
      return {
        color: "text-orange-800 bg-orange-100 border border-orange-200",
        text: "ລໍຖ້າການອະນຸມັດ",
        icon: "⏳",
      };
  }
};

// Delete reservation function
const deleteReservation = async (itemId, shipName) => {
  // Show confirmation dialog
  const confirmed = confirm(`ທ່ານຕ້ອງການລຶບການຈອງເຮືອ "${shipName}" ແທ້ບໍ?`);

  if (!confirmed) return;

  try {
    // Add item to deleting set to show loading state
    deletingItems.value.add(itemId);

    // Delete from Firebase
    await deleteDoc(doc(db, "FoodBookings", itemId));

    // Remove from local array
    historyList.value = historyList.value.filter((item) => item.id !== itemId);

    // Show success message (you can replace with a toast notification)
  } catch (error) {
    console.error("Error deleting reservation:", error);
    alert("ເກີດຂໍ້ຜິດພາດໃນການລຶບ. ກະລຸນາລອງໃໝ່.");
  } finally {
    // Remove from deleting set
    deletingItems.value.delete(itemId);
  }
};

// Filter reservations based on the 3-status system
const filteredHistory = computed(() => {
  if (selectedFilter.value === "all") return historyList.value;

  return historyList.value.filter((item) => {
    const status = getPaymentStatus(item);

    if (selectedFilter.value === "confirmed") {
      return status === "confirmed";
    } else if (selectedFilter.value === "pending") {
      return status === "pending";
    } else if (selectedFilter.value === "invalid") {
      return status === "invalid";
    }

    return true;
  });
});

// Count items by status
const getStatusCount = (statusType) => {
  return historyList.value.filter((item) => {
    const status = getPaymentStatus(item);
    return status === statusType;
  }).length;
};

onMounted(async () => {
  if (!userEmail.value) {
    loading.value = false;
    return;
  }

  try {
    const foodBookingsRef = collection(db, "FoodBookings");
    // Try with orderBy first, if it fails, use simple query like your original code
    let q;
    try {
      q = query(
        foodBookingsRef,
        where("user", "==", userEmail.value),
        orderBy("createdAt", "desc")
      );
    } catch (orderError) {
      // Fallback to simple query without orderBy
      q = query(foodBookingsRef, where("user", "==", userEmail.value));
    }

    const querySnapshot = await getDocs(q);
    let results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort in JavaScript if orderBy didn't work
    if (results.length > 0) {
      results.sort((a, b) => {
        const dateA = a.createdAt
          ? a.createdAt.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt)
          : new Date(0);
        const dateB = b.createdAt
          ? b.createdAt.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt)
          : new Date(0);
        return dateB - dateA; // Newest first
      });
    }

    historyList.value = results;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    // If all else fails, try the exact same query as your original code
    try {
      const foodBookingsRef = collection(db, "FoodBookings");
      const q = query(foodBookingsRef, where("user", "==", userEmail.value));
      const querySnapshot = await getDocs(q);
      historyList.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError);
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6"
  >
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div
        class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8"
      >
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div class="text-white">
            <h1 class="text-2xl sm:text-3xl font-bold mb-2">
              🧾 ປະຫວັດການຈອງເຮືອ
            </h1>
            <p class="text-blue-100 text-sm sm:text-base opacity-90">
              ເບິ່ງປະຫວັດການຈອງເຮືອທັງໝົດຂອງທ່ານ
            </p>
          </div>
          <div
            class="bg-white bg-opacity-20 rounded-xl p-4 text-center backdrop-blur-sm"
          >
            <p class="text-blue-100 text-sm opacity-90">ທັງໝົດ</p>
            <p class="text-white text-2xl sm:text-3xl font-bold">
              {{ historyList.length }}
            </p>
          </div>
        </div>
      </div>

      <!-- Filter Tabs with 4 options -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            @click="selectedFilter = 'all'"
            :class="
              selectedFilter === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            "
            class="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            ທັງໝົດ ({{ historyList.length }})
          </button>
          <button
            @click="selectedFilter = 'confirmed'"
            :class="
              selectedFilter === 'confirmed'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            "
            class="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            ຢືນຢັນແລ້ວ ({{ getStatusCount("confirmed") }})
          </button>
          <button
            @click="selectedFilter = 'pending'"
            :class="
              selectedFilter === 'pending'
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            "
            class="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            ລໍຖ້າການອະນຸມັດ ({{ getStatusCount("pending") }})
          </button>
          <button
            @click="selectedFilter = 'invalid'"
            :class="
              selectedFilter === 'invalid'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            "
            class="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            ການຊຳລະບໍ່ຖືກຕ້ອງ ({{ getStatusCount("invalid") }})
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg"
      >
        <div
          class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"
        ></div>
        <p class="text-gray-600 text-lg">ກໍາລັງໂຫລດຂໍ້ມູນ...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!filteredHistory.length"
        class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg text-center"
      >
        <div class="text-6xl mb-4 opacity-50">🚢</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">ບໍ່ມີຂໍ້ມູນປະຫວັດ</h3>
        <p class="text-gray-600">
          {{
            historyList.length === 0
              ? "ທ່ານຍັງບໍ່ໄດ້ຈອງເຮືອເທື່ອ"
              : "ບໍ່ພົບການຈອງທີ່ຕົງຕາມເງື່ອນໄຂ"
          }}
        </p>
      </div>

      <!-- Reservation Cards -->
      <div v-else class="space-y-6">
        <div
          v-for="item in filteredHistory"
          :key="item.id"
          class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
          <!-- Card Header -->
          <div
            class="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between gap-4"
          >
            <div class="flex-1 flex flex-col sm:flex-row justify-between gap-4">
              <div class="flex-1">
                <div
                  class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2"
                >
                  <h3 class="text-lg font-bold text-gray-800">
                    ໃບບິນທີ : {{ item.bookingNumber }}
                  </h3>
                  <h3 class="text-lg font-bold text-gray-800">
                    🚢 {{ item.shipName }}
                  </h3>
                  <span
                    :class="getStatusInfo(item).color"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit"
                  >
                    {{ getStatusInfo(item).icon }}
                    {{ getStatusInfo(item).text }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">
                  {{ formatDate(item.createdAt) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600 mb-1">ລາຄາລວມ</p>
                <p class="text-xl font-bold text-indigo-600">
                  {{ formatPrice(item.grandTotal) }}
                </p>
              </div>
            </div>

            <!-- Delete Button - Hide for pending and invalid status -->
            <div
              v-if="getPaymentStatus(item) === 'confirmed'"
              class="flex items-center"
            >
              <button
                @click="deleteReservation(item.id, item.shipName)"
                :disabled="deletingItems.has(item.id)"
                :class="
                  deletingItems.has(item.id)
                    ? 'bg-red-100 cursor-wait opacity-50'
                    : 'hover:bg-red-100 hover:border-red-300'
                "
                class="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:cursor-not-allowed"
              >
                <span
                  v-if="deletingItems.has(item.id)"
                  class="flex items-center gap-1"
                >
                  ⏳ ກໍາລັງລຶບ...
                </span>
                <span v-else class="flex items-center gap-1"> 🗑️ ລຶບ </span>
              </button>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Booking Details -->
              <div class="space-y-4">
                <h4
                  class="text-lg font-bold text-gray-800 pb-2 border-b border-gray-200"
                >
                  📅 ລາຍລະອຽດການຈອງ
                </h4>
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-gray-600 font-medium"
                      >ວັນທີ່:</span
                    >
                    <span class="text-sm font-semibold text-gray-800">{{
                      item.date
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-gray-600 font-medium"
                      >ຊົ່ວໂມງ:</span
                    >
                    <span class="text-sm font-semibold text-gray-800"
                      >{{ item.hour }} ຊົ່ວໂມງ</span
                    >
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-gray-600 font-medium"
                      >ຈໍານວນຄົນ:</span
                    >
                    <span class="text-sm font-semibold text-gray-800"
                      >{{ item.people }} ຄົນ</span
                    >
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-gray-600 font-medium"
                      >ວິທີຈ່າຍ:</span
                    >
                    <span class="text-sm font-semibold text-gray-800">{{
                      item.paymentMethod
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div class="space-y-4">
                <h4
                  class="text-lg font-bold text-gray-800 pb-2 border-b border-gray-200"
                >
                  💰 ລາຍລະອຽດລາຄາ
                </h4>
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-gray-600 font-medium"
                      >ລາຄາເຮືອ:</span
                    >
                    <span class="text-sm font-semibold text-gray-800">{{
                      formatPrice(item.shipPrice)
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-gray-600 font-medium"
                      >ລາຄາອາຫານ:</span
                    >
                    <span class="text-sm font-semibold text-gray-800">{{
                      formatPrice(item.foodTotalPrice)
                    }}</span>
                  </div>
                  <div class="border-t-2 border-gray-200 pt-3 mt-3">
                    <div class="flex justify-between items-center">
                      <span class="text-base font-bold text-gray-800"
                        >ລວມທັງໝົດ:</span
                      >
                      <span class="text-lg font-bold text-indigo-600">{{
                        formatPrice(item.grandTotal)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Food Items -->
            <div
              v-if="item.items && item.items.length"
              class="border-t border-gray-200 pt-6"
            >
              <h4
                class="text-lg font-bold text-gray-800 pb-2 border-b border-gray-200 mb-4"
              >
                🍽️ ລາຍການອາຫານ
              </h4>
              <div class="space-y-3">
                <div
                  v-for="foodItem in item.items"
                  :key="foodItem.id"
                  class="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                >
                  <div class="flex-1">
                    <p class="font-semibold text-gray-800 text-sm">
                      {{ foodItem.name }}
                    </p>
                    <p class="text-xs text-gray-600 mt-1">
                      {{ formatPrice(foodItem.price) }} ×
                      {{ foodItem.quantity }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-indigo-600 text-sm">
                      {{ formatPrice(foodItem.price * foodItem.quantity) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status-specific messages -->
            <div
              v-if="getPaymentStatus(item) === 'invalid'"
              class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div class="flex items-center gap-2">
                <span class="text-xl">❌</span>
                <div>
                  <h5 class="font-bold text-red-800">ການຊຳລະບໍ່ຖືກຕ້ອງ</h5>
                  <p class="text-sm text-red-700">
                    ກະລຸນາຕິດຕໍ່ພະນັກງານເບີ: 02076712549 ເພື່ອແກ້ໄຂບັນຫາ ຫຼື
                    ທຳການຊຳລະໃໝ່
                  </p>
                  <p class="text-sm text-red-700">
                    whatsapp: 02076712549 ພ້ອມທັງແຄ໊ບໃບບິນແຈ້ງໄປ
                  </p>
                </div>
              </div>
            </div>

            <div
              v-else-if="getPaymentStatus(item) === 'pending'"
              class="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl"
            >
              <div class="flex items-center gap-2">
                <span class="text-xl">⏳</span>
                <div>
                  <h5 class="font-bold text-orange-800">ລໍຖ້າການອະນຸມັດ</h5>
                  <p class="text-sm text-orange-700">
                    ການຈອງຂອງທ່ານກຳລັງຖືກກວດສອບ ກະລຸນາລໍຖ້າ
                  </p>
                </div>
              </div>
            </div>

            <div
              v-else-if="getPaymentStatus(item) === 'confirmed'"
              class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl"
            >
              <div class="flex items-center gap-2">
                <span class="text-xl">✅</span>
                <div>
                  <h5 class="font-bold text-green-800">ການຈອງສຳເລັດ</h5>
                  <p class="text-sm text-green-700">
                    ການຊຳລະຂອງທ່ານໄດ້ຮັບການຢືນຢັນແລ້ວ ພ້ອມໃຊ້ບໍລິການ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
