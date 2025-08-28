<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 lg:p-8"
  >
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header Section -->
      <div
        class="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100"
      >
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <span class="text-white text-2xl">🛍️</span>
            </div>
            <div>
              <h1 class="text-2xl lg:text-3xl font-bold text-gray-800">
                ການຈັດການສິນຄ້າ
              </h1>
              <p class="text-gray-600 mt-1">ແກ້ໄຂ ແລະ ຄຸ້ມຄອງສິນຄ້າທັງໝົດ</p>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="flex gap-4">
            <div
              class="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 text-center min-w-[120px]"
            >
              <div class="text-2xl font-bold text-blue-600">
                {{ products.length }}
              </div>
              <div class="text-sm text-blue-700 font-medium">ສິນຄ້າທັງໝົດ</div>
            </div>
            <div
              class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center min-w-[120px]"
            >
              <div class="text-2xl font-bold text-green-600">
                {{ availableCount }}
              </div>
              <div class="text-sm text-green-700 font-medium">ມີຂາຍ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ຄົ້ນຫາສິນຄ້າ..."
              class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
          <div class="md:w-64">
            <select
              v-model="filterCategory"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="">ປະເພດທັງໝົດ</option>
              <option
                v-for="category in uniqueCategories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          :class="{ 'opacity-75': !product.availability }"
        >
          <!-- Product Image -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
            ></div>

            <!-- Availability Badge -->
            <div class="absolute top-3 right-3">
              <span
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md"
                :class="
                  product.availability
                    ? 'bg-green-500/90 text-white'
                    : 'bg-red-500/90 text-white'
                "
              >
                <div
                  class="w-2 h-2 rounded-full"
                  :class="product.availability ? 'bg-white' : 'bg-white'"
                ></div>
                {{ product.availability ? "ມີຂາຍ" : "ບໍ່ມີຂາຍ" }}
              </span>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
              {{ product.name }}
            </h3>

            <div class="flex items-center gap-2 mb-3">
              <span
                class="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full"
              >
                {{ product.category }}
              </span>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="text-2xl font-bold text-purple-600">
                ${{ product.price }}
              </div>
              <div class="text-sm text-gray-500">
                ID: {{ product.product_id }}
              </div>
            </div>

            <button
              @click="editProduct(product)"
              class="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              ແກ້ໄຂ
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredProducts.length === 0" class="text-center py-20">
        <div
          class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span class="text-4xl text-gray-400">🛍️</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">ບໍ່ພົບສິນຄ້າ</h3>
        <p class="text-gray-600">ລອງປັບເງື່ອນໄຂການຄົ້ນຫາ ຫຼື ການກັ່ນຕອງ</p>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="selectedProduct"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <!-- Modal Header -->
        <div
          class="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-xl lg:text-2xl font-bold flex items-center gap-3">
              <div
                class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"
              >
                <span class="text-lg">✏️</span>
              </div>
              ແກ້ໄຂສິນຄ້າ
            </h2>
            <button
              @click="cancelEdit"
              class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
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

        <!-- Modal Content -->
        <div class="p-6 lg:p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form @submit.prevent="saveChanges" class="space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2"
                  >ຊື່ສິນຄ້າ</label
                >
                <input
                  v-model="selectedProduct.name"
                  type="text"
                  required
                  placeholder="ໃສ່ຊື່ສິນຄ້າ"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2"
                  >ລາຄາ ($)</label
                >
                <input
                  v-model="selectedProduct.price"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2"
                  >ປະເພດ</label
                >
                <input
                  v-model="selectedProduct.category"
                  type="text"
                  required
                  placeholder="ໃສ່ປະເພດ"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2"
                  >ສະຖານະມີຂາຍ</label
                >
                <select
                  v-model="selectedProduct.availability"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option :value="true">ມີຂາຍ</option>
                  <option :value="false">ບໍ່ມີຂາຍ</option>
                </select>
              </div>
            </div>

            <!-- Image Section -->
            <div class="space-y-4">
              <label class="block text-sm font-bold text-gray-700"
                >ຮູບພາບສິນຄ້າ</label
              >

              <!-- Upload Options -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- File Upload -->
                <div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleFileUpload"
                    class="hidden"
                    id="imageUpload"
                  />
                  <label
                    for="imageUpload"
                    class="block w-full p-4 border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div class="text-center">
                      <div
                        class="w-12 h-12 bg-gray-100 group-hover:bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors"
                      >
                        <svg
                          class="w-6 h-6 text-gray-400 group-hover:text-purple-500"
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
                        class="text-sm font-semibold text-gray-700 group-hover:text-purple-700"
                      >
                        ເລືອກຮູບພາບຈາກຄອມພິວເຕີ
                      </p>
                    </div>
                  </label>
                </div>

                <!-- URL Input -->
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2"
                    >ຫຼື ໃສ່ URL ຮູບພາບ</label
                  >
                  <input
                    v-model="selectedProduct.image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <!-- Upload Progress -->
              <div
                v-if="uploadProgress > 0 && uploadProgress < 100"
                class="space-y-2"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">ກຳລັງອັບໂຫຼດ...</span>
                  <span class="font-semibold text-purple-600"
                    >{{ uploadProgress }}%</span
                  >
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Image Preview -->
              <div
                v-if="selectedProduct.image || previewImage"
                class="relative"
              >
                <label class="block text-sm font-medium text-gray-600 mb-2"
                  >ຕົວຢ່າງ</label
                >
                <div
                  class="relative w-48 h-48 rounded-xl overflow-hidden border border-gray-200"
                >
                  <img
                    :src="previewImage || selectedProduct.image"
                    alt="ຕົວຢ່າງ"
                    class="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    @click="removeImage"
                    class="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div
              class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200"
            >
              <button
                type="button"
                @click="cancelEdit"
                class="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>ຍົກເລີກ</span>
              </button>

              <button
                type="submit"
                :disabled="saving || uploading"
                class="flex-2 py-3 px-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <div
                  v-if="saving || uploading"
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
                <span>
                  {{
                    uploading
                      ? "ກຳລັງອັບໂຫຼດ..."
                      : saving
                      ? "ກຳລັງບັນທຶກ..."
                      : "ບັນທຶກການປ່ຽນແປງ"
                  }}
                </span>
              </button>
            </div>
          </form>
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
</template>

<script setup>
definePageMeta({
  layout: "empty",
  prerender: false,
});

import { ref, onMounted, computed } from "vue";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useFirebase } from "@/composables/useFirebase";

const { db, storage } = useFirebase();

// State
const products = ref([]);
const selectedProduct = ref(null);
const successMessage = ref("");
const errorMessage = ref("");
const saving = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const previewImage = ref("");
const fileInput = ref(null);
const searchQuery = ref("");
const filterCategory = ref("");

// Computed properties
const availableCount = computed(
  () => products.value.filter((p) => p.availability).length
);

const uniqueCategories = computed(() =>
  [...new Set(products.value.map((p) => p.category))].sort()
);

const filteredProducts = computed(() => {
  let filtered = products.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.product_id.toString().includes(query)
    );
  }

  if (filterCategory.value) {
    filtered = filtered.filter((p) => p.category === filterCategory.value);
  }

  return filtered;
});

// Load all products from Firestore
const loadProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    products.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    showError("ຜິດພາດໃນການໂຫຼດສິນຄ້າ");
    console.error(err);
  }
};

// Handle file upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    showError("ກະລຸນາເລືອກໄຟລ໌ຮູບພາບທີ່ຖືກຕ້ອງ");
    return;
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    showError("ຂະໜາດຮູບພາບຕ້ອງນ້ອຍກວ່າ 5MB");
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.value = e.target.result;
  };
  reader.readAsDataURL(file);

  // Start upload
  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // Create unique filename
    const timestamp = Date.now();
    const fileName = `products/${timestamp}_${file.name}`;
    const imageRef = storageRef(storage, fileName);

    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(imageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Track upload progress
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        uploadProgress.value = Math.round(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        showError("ຜິດພາດໃນການອັບໂຫຼດຮູບພາບ");
        uploading.value = false;
        uploadProgress.value = 0;
      },
      async () => {
        // Upload completed
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          selectedProduct.value.image = downloadURL;
          previewImage.value = "";
          uploading.value = false;
          uploadProgress.value = 0;
          showSuccess("ອັບໂຫຼດຮູບພາບສຳເລັດ!");
        } catch (error) {
          console.error("Error getting URL:", error);
          showError("ຜິດພາດໃນການດຶງ URL ຮູບພາບ");
          uploading.value = false;
          uploadProgress.value = 0;
        }
      }
    );
  } catch (error) {
    console.error("Upload error:", error);
    showError("ຜິດພາດໃນການອັບໂຫຼດຮູບພາບ");
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

// Remove image
const removeImage = () => {
  selectedProduct.value.image = "";
  previewImage.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Edit product
const editProduct = (product) => {
  selectedProduct.value = { ...product };
  previewImage.value = "";
  uploadProgress.value = 0;
  clearMessages();
};

// Cancel edit
const cancelEdit = () => {
  selectedProduct.value = null;
  previewImage.value = "";
  uploadProgress.value = 0;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  clearMessages();
};

// Save edited product
const saveChanges = async () => {
  saving.value = true;
  try {
    const { id, name, price, image, category, availability } =
      selectedProduct.value;
    await updateDoc(doc(db, "products", id), {
      name,
      price: parseFloat(price),
      image,
      category,
      availability,
    });

    showSuccess("ອັບເດດສິນຄ້າສຳເລັດ!");
    await loadProducts();
    cancelEdit();
  } catch (err) {
    showError("ຜິດພາດໃນການອັບເດດສິນຄ້າ");
    console.error(err);
  } finally {
    saving.value = false;
  }
};

// Message helpers
const showSuccess = (message) => {
  successMessage.value = message;
  setTimeout(() => (successMessage.value = ""), 3000);
};

const showError = (message) => {
  errorMessage.value = message;
  setTimeout(() => (errorMessage.value = ""), 3000);
};

const clearMessages = () => {
  successMessage.value = "";
  errorMessage.value = "";
};

// Load products on mount
onMounted(() => {
  loadProducts();
});
</script>
