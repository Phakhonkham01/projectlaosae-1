<template>
  <div
    class="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4 lg:p-8"
  >
    <div class="max-w-4xl mx-auto">
      <!-- Header Section -->
      <div
        class="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-8 text-center border border-gray-100"
      >
        <div
          class="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <svg
            class="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
          ສ້າງເມນູໃໝ່
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          ເພີ່ມອາຫານອຮ່ອຍໃສ່ເມນູຂອງທ່ານ ແລະ ຂາຍໃຫ້ລູກຄ້າ
        </p>
      </div>

      <!-- Main Form Container -->
      <div
        class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <form @submit.prevent="submitForm" class="p-8 lg:p-12 space-y-8">
          <!-- Image Upload Section -->
          <div class="text-center">
            <h3
              class="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3"
            >
              <div
                class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"
              >
                <span class="text-xl">📷</span>
              </div>
              ຮູບພາບເມນູ
            </h3>

            <div
              class="relative w-full h-64 lg:h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group"
              :class="{
                'border-gray-300 hover:border-orange-400 bg-gray-50 hover:bg-orange-50':
                  !previewUrl && !isDragOver,
                'border-orange-400 bg-orange-50': isDragOver,
                'border-green-400 bg-green-50': previewUrl,
              }"
              @drop="handleDrop"
              @dragover.prevent="isDragOver = true"
              @dragleave="isDragOver = false"
              @click="triggerFileInput"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handlePhotoUpload"
                class="hidden"
              />

              <div
                v-if="!previewUrl"
                class="absolute inset-0 flex flex-col items-center justify-center p-8"
              >
                <div
                  class="w-16 h-16 bg-gray-200 group-hover:bg-orange-200 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300"
                >
                  <svg
                    class="w-8 h-8 text-gray-400 group-hover:text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p
                  class="text-lg font-semibold text-gray-700 group-hover:text-orange-700 mb-2"
                >
                  ຄລິກເພື່ອອັບໂຫຼດ ຫຼື ລາກແລ້ວວາງ
                </p>
                <p class="text-sm text-gray-500">PNG, JPG, GIF ສູງສຸດ 10MB</p>
              </div>

              <div v-else class="relative w-full h-full">
                <img
                  :src="previewUrl"
                  alt="ຕົວຢ່າງ"
                  class="w-full h-full object-cover rounded-2xl"
                />
                <button
                  type="button"
                  @click.stop="removeImage"
                  class="absolute top-3 right-3 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Form Fields Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Menu Name (Full Width) -->
            <div class="lg:col-span-2">
              <label
                class="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                ຊື່ເມນູ <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="ເຊັ່ນ: ຂ້າວໄຟເຜັດ"
                required
                class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-lg"
              />
            </div>

            <!-- Product ID -->
            <div>
              <label
                class="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                ລະຫັດສິນຄ້າ <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.product_id"
                type="text"
                placeholder="ເຊັ່ນ: FD101"
                required
                class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            <!-- Price -->
            <div>
              <label
                class="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                ລາຄາ (ກີບ) <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.price"
                  type="number"
                  placeholder="0"
                  min="0"
                  required
                  class="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
                <span
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg"
                  >₭</span
                >
              </div>
            </div>

            <!-- Category -->
            <div>
              <label
                class="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                ປະເພດ <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.category"
                required
                class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
              >
                <option disabled value="">ເລືອກປະເພດ</option>
                <option value="food">🍽️ ອາຫານ</option>
                <option value="drink">🥤 ເຄື່ອງດື່ມ</option>
              </select>
            </div>

            <!-- Availability Toggle -->
            <div>
              <label
                class="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                ສະຖານະມີຂາຍ
              </label>
              <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="form.availability"
                    class="sr-only peer"
                  />
                  <div
                    class="relative w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-orange-500"
                  ></div>
                </label>
                <span
                  class="font-semibold"
                  :class="form.availability ? 'text-green-600' : 'text-red-600'"
                >
                  {{ form.availability ? "ມີຂາຍ" : "ບໍ່ມີຂາຍ" }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div
            class="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200"
          >
            <button
              type="button"
              @click="resetForm"
              :disabled="isSubmitting"
              class="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
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
                />
              </svg>
              <span>ລີເຊັດ</span>
            </button>

            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="flex-2 py-4 px-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{{
                isSubmitting ? "ກຳລັງສ້າງເມນູ..." : "ສ້າງເມນູໃໝ່"
              }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Form Validation Status -->
      <div
        v-if="!isFormValid"
        class="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-yellow-800">
              ກະລຸນາກໍ່ຂໍ້ມູນໃຫ້ຄົບຖ້ວນ
            </p>
            <p class="text-sm text-yellow-700">
              ຕ້ອງມີ: ຊື່ເມນູ, ລະຫັດສິນຄ້າ, ລາຄາ, ປະເພດ, ແລະ ຮູບພາບ
            </p>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="fixed bottom-4 right-4 z-50">
        <div
          class="bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce"
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span class="font-semibold">{{ successMessage }}</span>
        </div>
      </div>

      <div v-if="errorMessage" class="fixed bottom-4 right-4 z-50">
        <div
          class="bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce"
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
            />
          </svg>
          <span class="font-semibold">{{ errorMessage }}</span>
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

import { ref, computed } from "vue";
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
  product_id: "",
  price: 0,
  category: "",
  availability: true,
});

// File handling
const photoFile = ref(null);
const previewUrl = ref("");
const fileInput = ref(null);
const isDragOver = ref(false);

// UI state
const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Computed properties
const isFormValid = computed(() => {
  return (
    form.value.name &&
    form.value.product_id &&
    form.value.price > 0 &&
    form.value.category &&
    photoFile.value
  );
});

// File handling methods
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handlePhotoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    processFile(file);
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
};

const processFile = (file) => {
  // Check file type
  if (!file.type.startsWith("image/")) {
    showError("ກະລຸນາເລືອກໄຟລ໌ຮູບພາບທີ່ຖືກຕ້ອງ");
    return;
  }

  // Check file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    showError("ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 10MB");
    return;
  }

  photoFile.value = file;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  photoFile.value = null;
  previewUrl.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Form methods
const submitForm = async () => {
  if (!isFormValid.value) {
    showError("ກະລຸນາໃສ່ຂໍ້ມູນທີ່ຈຳເປັນທັງໝົດ ແລະ ອັບໂຫຼດຮູບພາບ");
    return;
  }

  isSubmitting.value = true;
  clearMessages();

  try {
    // Upload image to Firebase Storage
    const fileName = `${form.value.name.replace(/\s+/g, "-")}-${Date.now()}`;
    const path = `photos/${fileName}`;
    const imageRef = storageRef(storage, path);

    await uploadBytes(imageRef, photoFile.value);
    const imageUrl = await getDownloadURL(imageRef);

    // Save to Firestore
    await addDoc(collection(db, "products"), {
      ...form.value,
      image: imageUrl,
      created_at: new Date(),
    });

    showSuccess("🎉 ສ້າງເມນູສຳເລັດແລ້ວ!");
    resetForm();
  } catch (error) {
    console.error("ຜິດພາດໃນການສ້າງເມນູ:", error);
    showError("ສ້າງເມນູບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່");
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  form.value = {
    name: "",
    product_id: "",
    price: 0,
    category: "",
    availability: true,
  };
  removeImage();
  clearMessages();
};

// Message helpers
const showSuccess = (message) => {
  successMessage.value = message;
  setTimeout(() => (successMessage.value = ""), 4000);
};

const showError = (message) => {
  errorMessage.value = message;
  setTimeout(() => (errorMessage.value = ""), 4000);
};

const clearMessages = () => {
  successMessage.value = "";
  errorMessage.value = "";
};
</script>
