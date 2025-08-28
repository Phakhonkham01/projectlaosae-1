<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8"
  >
    <div class="max-w-4xl mx-auto">
      <!-- Header Section -->
      <div
        class="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-8 text-center border border-gray-100"
      >
        <div
          class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <span class="text-white text-3xl">🚢</span>
        </div>
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
          ເພີ່ມເຮືອໃໝ່
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          ໃສ່ລາຍລະອຽດເພື່ອລົງທະບຽນເຮືອໃໝ່ເຂົ້າໃນລະບົບ
        </p>
      </div>

      <!-- Progress Bar -->
      <div
        class="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-semibold text-gray-600">ຄວາມຄືບໜ້າ</span>
          <span class="text-sm font-semibold text-gray-600"
            >{{ filledFields }}/{{ totalFields }} ຊ່ອງ</span
          >
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
            :style="`width: ${progressPercentage}%`"
          ></div>
        </div>
        <div class="mt-2 text-center">
          <span class="text-sm text-gray-500">
            {{ progressPercentage.toFixed(0) }}% ສຳເລັດແລ້ວ
          </span>
        </div>
      </div>

      <!-- Main Form -->
      <form @submit.prevent="submitForm" class="space-y-8">
        <!-- Basic Information Section -->
        <div
          class="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
        >
          <h3
            class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"
            >
              <span class="text-xl">📋</span>
            </div>
            ຂໍ້ມູນພື້ນຖານ
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                ຊື່ເຮືອ <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="form.name"
                required
                placeholder="ໃສ່ຊື່ເຮືອ"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                ລະຫັດເຮືອ <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="form.ship_id"
                required
                placeholder="ເຊັ່ນ: SH-001"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Specifications Section -->
        <div
          class="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
        >
          <h3
            class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"
            >
              <span class="text-xl">⚙️</span>
            </div>
            ຂໍ້ມູນຈຳເພາະ
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                ຄວາມຈຸ <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  type="number"
                  v-model.number="form.capacity"
                  required
                  placeholder="0"
                  min="1"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <span
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium"
                  >ຄົນ</span
                >
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                ຈຳນວນທີ່ມີ <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                v-model.number="form.quantity"
                required
                placeholder="1"
                min="1"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Price and Schedule Section -->
        <div
          class="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
        >
          <h3
            class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"
            >
              <span class="text-xl">💰</span>
            </div>
            ລາຄາ ແລະ ຕາຕະລາງເວລາ
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                ລາຄາຕໍ່ຊົ່ວໂມງ <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span
                  class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium"
                  >$</span
                >
                <input
                  type="number"
                  v-model.number="form.price"
                  required
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                ເວລາອອກເດີນທາງ <span class="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                v-model="form.departure_time"
                required
                :min="minDateTime"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Image Upload Section -->
        <div
          class="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
        >
          <h3
            class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"
            >
              <span class="text-xl">📸</span>
            </div>
            ຮູບພາບເຮືອ
          </h3>

          <div>
            <input
              type="file"
              @change="handleFileUpload"
              required
              accept="image/*"
              class="hidden"
              id="file-upload"
            />
            <label
              for="file-upload"
              class="block w-full p-8 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl cursor-pointer transition-colors group"
              :class="{ 'border-green-400 bg-green-50': photoFile }"
            >
              <div v-if="!photoFile" class="text-center">
                <div
                  class="w-16 h-16 bg-gray-100 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors"
                >
                  <span class="text-2xl text-gray-400 group-hover:text-blue-500"
                    >📁</span
                  >
                </div>
                <div class="text-gray-600 group-hover:text-blue-600">
                  <p class="text-lg font-semibold mb-2">
                    ຄລິກເພື່ອອັບໂຫຼດຮູບພາບເຮືອ
                  </p>
                  <p class="text-sm">ຫຼື ລາກແລ້ວວາງ</p>
                  <p class="text-xs text-gray-500 mt-3">PNG, JPG ສູງສຸດ 10MB</p>
                </div>
              </div>
              <div v-else class="text-center">
                <div
                  class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <span class="text-2xl text-green-500">✅</span>
                </div>
                <p class="text-lg font-semibold text-green-700 mb-1">
                  {{ photoFile.name }}
                </p>
                <p class="text-sm text-green-600">
                  {{ formatFileSize(photoFile.size) }}
                </p>
                <button
                  type="button"
                  @click.prevent="removeFile"
                  class="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
                >
                  ລຶບ
                </button>
              </div>
            </label>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
        >
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              @click="resetForm"
              class="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              <span>ລີເຊັດແບບຟອມ</span>
            </button>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-2 py-4 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <div
                v-if="isSubmitting"
                class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
              <span>{{
                isSubmitting ? "ກຳລັງເພີ່ມເຮືອ..." : "ເພີ່ມເຮືອ"
              }}</span>
            </button>
          </div>
        </div>
      </form>

      <!-- Success/Error Messages -->
      <div v-if="message" class="fixed bottom-4 right-4 z-50">
        <div
          class="px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce max-w-md"
          :class="
            messageType === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          "
        >
          <span class="text-2xl">{{
            messageType === "success" ? "✅" : "❌"
          }}</span>
          <span class="font-semibold">{{ message }}</span>
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
import { collection, addDoc } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useFirebase } from "@/composables/useFirebase";

const { db, storage } = useFirebase();

// Form data
const form = ref({
  name: "",
  price: 0,
  ship_id: "",
  capacity: 0,
  departure_time: "",
  quantity: 1,
});

// UI state
const photoFile = ref(null);
const isSubmitting = ref(false);
const message = ref("");
const messageType = ref("");

// Computed properties
const totalFields = 7;
const filledFields = computed(() => {
  let count = 0;
  if (form.value.name) count++;
  if (form.value.ship_id) count++;
  if (form.value.capacity > 0) count++;
  if (form.value.quantity > 0) count++;
  if (form.value.price > 0) count++;
  if (form.value.departure_time) count++;
  if (photoFile.value) count++;
  return count;
});

const progressPercentage = computed(() => {
  return (filledFields.value / totalFields) * 100;
});

const minDateTime = computed(() => {
  const now = new Date();
  return now.toISOString().slice(0, 16);
});

// Methods
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Check file size (limit 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showMessage("ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 10MB", "error");
      event.target.value = "";
      return;
    }
    photoFile.value = file;
  }
};

const removeFile = () => {
  photoFile.value = null;
  const fileInput = document.getElementById("file-upload");
  if (fileInput) {
    fileInput.value = "";
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const showMessage = (text, type) => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 5000);
};

const resetForm = () => {
  form.value = {
    name: "",
    price: 0,
    ship_id: "",
    capacity: 0,
    departure_time: "",
    quantity: 1,
  };
  photoFile.value = null;
  const fileInput = document.getElementById("file-upload");
  if (fileInput) {
    fileInput.value = "";
  }
  showMessage("ລີເຊັດແບບຟອມແລ້ວ", "success");
};

const submitForm = async () => {
  if (!photoFile.value) {
    showMessage("ກະລຸນາອັບໂຫຼດຮູບພາບເຮືອ", "error");
    return;
  }

  isSubmitting.value = true;

  try {
    // Upload image
    const storagePath = `photos/${form.value.name}-${Date.now()}`;
    const photoRef = storageRef(storage, storagePath);
    await uploadBytes(photoRef, photoFile.value);
    const url = await getDownloadURL(photoRef);

    // Add to Firestore
    await addDoc(collection(db, "All_ships"), {
      name: form.value.name,
      price: form.value.price,
      url: url,
      status: 1,
      ship_id: form.value.ship_id,
      capacity: form.value.capacity,
      departure_time: new Date(form.value.departure_time),
      quantity: form.value.quantity,
      created_at: new Date(),
    });

    // Reset form
    resetForm();
    showMessage("ເພີ່ມເຮືອສຳເລັດແລ້ວ! 🎉", "success");
  } catch (error) {
    console.error("ຜິດພາດໃນການເພີ່ມເຮືອ:", error);
    showMessage("ເພີ່ມເຮືອບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່", "error");
  } finally {
    isSubmitting.value = false;
  }
};

// Set default departure time on mount
onMounted(() => {
  // Set default departure time to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  form.value.departure_time = tomorrow.toISOString().slice(0, 16);
});
</script>
