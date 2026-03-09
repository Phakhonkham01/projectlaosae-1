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
              class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <span class="text-white text-2xl">🚢</span>
            </div>
            <div>
              <h1 class="text-2xl lg:text-3xl font-bold text-gray-800">
                ການຈັດການເຮືອ
              </h1>
              <p class="text-gray-600 mt-1">ຈັດການເຮືອທັງໝົດຂອງທ່ານໃນທີ່ດຽວ</p>
            </div>
          </div>
          <button
            @click="refreshShips"
            :disabled="isLoading"
            class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <svg
              class="w-5 h-5"
              :class="{ 'animate-spin': isLoading }"
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
            <span>{{ isLoading ? "ກຳລັງໂຫຼດ..." : "ໂຫຼດໃໝ່" }}</span>
          </button>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center"
            >
              <span class="text-2xl">🚢</span>
            </div>
            <div>
              <div class="text-3xl font-bold text-gray-800">
                {{ ships.length }}
              </div>
              <div class="text-gray-600 font-medium">ເຮືອທັງໝົດ</div>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center"
            >
              <span class="text-2xl">✅</span>
            </div>
            <div>
              <div class="text-3xl font-bold text-gray-800">
                {{ activeShips }}
              </div>
              <div class="text-gray-600 font-medium">ເຮືອທີ່ໃຊ້ງານຢູ່</div>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center"
            >
              <span class="text-2xl">👥</span>
            </div>
            <div>
              <div class="text-3xl font-bold text-gray-800">
                {{ totalCapacity }}
              </div>
              <div class="text-gray-600 font-medium">ຄວາມຈຸລວມ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="ຄົ້ນຫາເຮືອຕາມຊື່ ຫຼື ລະຫັດ..."
              class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              v-model="statusFilter"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">ສະຖານະທັງໝົດ</option>
              <option value="1">ໃຊ້ງານຢູ່</option>
              <option value="0">ບໍ່ໃຊ້ງານ</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-20"
      >
        <div
          class="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"
        ></div>
        <p class="text-gray-600 font-medium">ກຳລັງໂຫຼດເຮືອ...</p>
      </div>

      <!-- Ships Grid -->
      <div
        v-else-if="filteredShips.length > 0"
        class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <div
          v-for="ship in filteredShips"
          :key="ship.id"
          @click="openEditModal(ship)"
          class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
          :class="{ 'opacity-60': ship.status === 0 }"
        >
          <!-- Ship Image -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="ship.url || '/placeholder-ship.jpg'"
              :alt="ship.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              @error="handleImageError"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
            ></div>

            <!-- Status Badge -->
            <div class="absolute top-4 right-4">
              <span
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md"
                :class="
                  ship.status === 1
                    ? 'bg-green-500/90 text-white'
                    : 'bg-red-500/90 text-white'
                "
              >
                <div
                  class="w-2 h-2 rounded-full"
                  :class="ship.status === 1 ? 'bg-white' : 'bg-white'"
                ></div>
                {{ ship.status === 1 ? "ໃຊ້ງານຢູ່" : "ບໍ່ໃຊ້ງານ" }}
              </span>
            </div>
          </div>

          <!-- Ship Info -->
          <div class="p-6">
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-800 mb-1">
                {{ ship.name }}
              </h3>
              <p class="text-gray-500 text-sm">ລະຫັດ: {{ ship.ship_id }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="flex items-center gap-2 text-gray-600">
                <div
                  class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
                >
                  <span class="text-sm">👥</span>
                </div>
                <span class="font-medium">{{ ship.capacity }} ຄົນ</span>
              </div>

              <div class="flex items-center gap-2 text-gray-600">
                <div
                  class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"
                >
                  <span class="text-sm">💰</span>
                </div>
                <span class="font-medium">${{ ship.price }}</span>
              </div>

              <div class="flex items-center gap-2 text-gray-600">
                <div
                  class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"
                >
                  <span class="text-sm">📦</span>
                </div>
                <span class="font-medium">ມີ {{ ship.quantity }} ລຳ</span>
              </div>

              <div class="flex items-center gap-2 text-gray-600">
                <div
                  class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"
                >
                  <span class="text-sm">🕒</span>
                </div>
                <span class="font-medium text-xs">{{
                  formatDateTime(ship.departure_time)
                }}</span>
              </div>
            </div>

            <button
              class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
            >
              <span class="text-lg">✏️</span>
              ແກ້ໄຂ
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div
          class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span class="text-4xl text-gray-400">🚢</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">ບໍ່ພົບເຮືອ</h3>
        <p class="text-gray-600 max-w-md mx-auto">
          {{
            searchQuery || statusFilter
              ? "ລອງປັບເງື່ອນໄຂການຄົ້ນຫາ ຫຼື ການກັ່ນຕອງ."
              : "ເລີ່ມຕົ້ນໂດຍການເພີ່ມເຮືອລຳທຳອິດ."
          }}
        </p>
      </div>

      <!-- Edit Modal -->
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          <!-- Modal Header -->
          <div
            class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
                >
                  <span class="text-xl">✏️</span>
                </div>
                <h2 class="text-xl lg:text-2xl font-bold">
                  ແກ້ໄຂເຮືອ: {{ selectedShip?.name }}
                </h2>
              </div>
              <button
                @click="closeEditModal"
                class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <span class="text-white font-bold">✕</span>
              </button>
            </div>
          </div>

          <!-- Modal Content -->
          <div class="p-6 lg:p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
            <!-- Progress Bar -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-600"
                  >ຄວາມຄືບໜ້າ</span
                >
                <span class="text-sm font-medium text-gray-600"
                  >{{ filledFields }}/{{ totalFields }} ຊ່ອງ</span
                >
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  :style="`width: ${progressPercentage}%`"
                ></div>
              </div>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitUpdate" class="space-y-8">
              <!-- Basic Information -->
              <div class="bg-gray-50 rounded-2xl p-6">
                <h3
                  class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
                >
                  <span class="text-xl">📋</span>
                  ຂໍ້ມູນພື້ນຖານ
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      ຊື່ເຮືອ <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="editForm.name"
                      required
                      placeholder="ໃສ່ຊື່ເຮືອ"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      ລະຫັດເຮືອ <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="editForm.ship_id"
                      required
                      placeholder="ເຊັ່ນ: SH-001"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <!-- Specifications -->
              <div class="bg-gray-50 rounded-2xl p-6">
                <h3
                  class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
                >
                  <span class="text-xl">⚙️</span>
                  ຂໍ້ມູນຈຳເພາະ
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      ຄວາມຈຸ <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        type="number"
                        v-model.number="editForm.capacity"
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
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      ຈຳນວນທີ່ມີ <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      v-model.number="editForm.quantity"
                      required
                      placeholder="1"
                      min="1"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <!-- Price and Schedule -->
              <div class="bg-gray-50 rounded-2xl p-6">
                <h3
                  class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
                >
                  <span class="text-xl">💰</span>
                  ລາຄາ ແລະ ຕາຕະລາງເວລາ
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      ລາຄາຕໍ່ຄົນ <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <span
                        class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium"
                        >$</span
                      >
                      <input
                        type="number"
                        v-model.number="editForm.price"
                        required
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      ເວລາອອກເດີນທາງ <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      v-model="editForm.departure_time"
                      required
                      :min="minDateTime"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <!-- Status -->
              <div class="bg-gray-50 rounded-2xl p-6">
                <h3
                  class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
                >
                  <span class="text-xl">⚡</span>
                  ສະຖານະ
                </h3>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2"
                    >ສະຖານະເຮືອ</label
                  >
                  <select
                    v-model.number="editForm.status"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option :value="1">ໃຊ້ງານຢູ່</option>
                    <option :value="0">ບໍ່ໃຊ້ງານ</option>
                  </select>
                </div>
              </div>

              <!-- Image Upload -->
              <div class="bg-gray-50 rounded-2xl p-6">
                <h3
                  class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
                >
                  <span class="text-xl">📸</span>
                  ຮູບພາບເຮືອ
                </h3>

                <!-- Current Image -->
                <div
                  v-if="editForm.currentImageUrl && !newPhotoFile"
                  class="mb-6"
                >
                  <p class="text-sm font-medium text-gray-700 mb-3">
                    ຮູບພາບປະຈຸບັນ:
                  </p>
                  <div
                    class="w-48 h-36 rounded-xl overflow-hidden border border-gray-200"
                  >
                    <img
                      :src="editForm.currentImageUrl"
                      :alt="editForm.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <!-- File Upload -->
                <div>
                  <input
                    type="file"
                    @change="handleFileUpload"
                    accept="image/*"
                    class="hidden"
                    id="file-upload"
                  />
                  <label
                    for="file-upload"
                    class="block w-full p-8 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl cursor-pointer transition-colors group"
                    :class="{ 'border-green-400 bg-green-50': newPhotoFile }"
                  >
                    <div v-if="!newPhotoFile" class="text-center">
                      <div
                        class="w-16 h-16 bg-gray-100 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors"
                      >
                        <span
                          class="text-2xl text-gray-400 group-hover:text-blue-500"
                          >📁</span
                        >
                      </div>
                      <div class="text-gray-600 group-hover:text-blue-600">
                        <p class="font-semibold">
                          {{
                            editForm.currentImageUrl
                              ? "ຄລິກເພື່ອປ່ຽນຮູບພາບ"
                              : "ຄລິກເພື່ອອັບໂຫຼດຮູບພາບ"
                          }}
                        </p>
                        <p class="text-sm">ຫຼື ລາກແລ້ວວາງ</p>
                        <p class="text-xs mt-2">PNG, JPG ສູງສຸດ 10MB</p>
                      </div>
                    </div>
                    <div v-else class="text-center">
                      <div
                        class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      >
                        <span class="text-2xl text-green-500">✅</span>
                      </div>
                      <p class="font-semibold text-green-700">
                        {{ newPhotoFile.name }}
                      </p>
                      <p class="text-sm text-green-600">
                        {{ formatFileSize(newPhotoFile.size) }}
                      </p>
                      <button
                        type="button"
                        @click.prevent="removeNewImage"
                        class="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                      >
                        ລຶບ
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Action Buttons -->
              <div
                class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200"
              >
                <button
                  type="button"
                  @click="closeEditModal"
                  class="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span class="text-lg">❌</span>
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  :disabled="isUpdating"
                  class="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span v-if="isUpdating" class="text-lg">⏳</span>
                  <span v-else class="text-lg">💾</span>
                  <span>{{
                    isUpdating ? "ກຳລັງອັບເດດ..." : "ອັບເດດເຮືອ"
                  }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="fixed bottom-4 right-4 z-50">
        <div
          class="px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce"
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
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useFirebase } from "@/composables/useFirebase";

const { db, storage } = useFirebase();

// Data
const ships = ref([]);
const selectedShip = ref(null);
const showEditModal = ref(false);
const isLoading = ref(true);
const isUpdating = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");
const message = ref("");
const messageType = ref("");
const newPhotoFile = ref(null);

// Edit form data
const editForm = ref({
  name: "",
  price: 0,
  ship_id: "",
  capacity: 0,
  departure_time: "",
  quantity: 1,
  status: 1,
  currentImageUrl: "",
});

// Computed properties
const filteredShips = computed(() => {
  let filtered = ships.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (ship) =>
        ship.name.toLowerCase().includes(query) ||
        ship.ship_id.toLowerCase().includes(query)
    );
  }

  if (statusFilter.value !== "") {
    filtered = filtered.filter(
      (ship) => ship.status === parseInt(statusFilter.value)
    );
  }

  return filtered;
});

const activeShips = computed(() => {
  return ships.value.filter((ship) => ship.status === 1).length;
});

const totalCapacity = computed(() => {
  return ships.value.reduce((total, ship) => total + (ship.capacity || 0), 0);
});

const totalFields = 7;
const filledFields = computed(() => {
  let count = 0;
  if (editForm.value.name) count++;
  if (editForm.value.ship_id) count++;
  if (editForm.value.capacity > 0) count++;
  if (editForm.value.quantity > 0) count++;
  if (editForm.value.price > 0) count++;
  if (editForm.value.departure_time) count++;
  if (editForm.value.currentImageUrl || newPhotoFile.value) count++;
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
const loadShips = async () => {
  try {
    isLoading.value = true;
    const querySnapshot = await getDocs(collection(db, "All_ships"));
    ships.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("ຜິດພາດໃນການໂຫຼດເຮືອ:", error);
    showMessage("ໂຫຼດເຮືອບໍ່ສຳເລັດ", "error");
  } finally {
    isLoading.value = false;
  }
};

const refreshShips = () => {
  loadShips();
};

const openEditModal = (ship) => {
  selectedShip.value = ship;

  // Convert Firestore timestamp to datetime-local format
  const departureTime = ship.departure_time?.toDate
    ? ship.departure_time.toDate()
    : new Date(ship.departure_time);
  const formattedDepartureTime = new Date(
    departureTime.getTime() - departureTime.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  editForm.value = {
    name: ship.name || "",
    price: ship.price || 0,
    ship_id: ship.ship_id || "",
    capacity: ship.capacity || 0,
    departure_time: formattedDepartureTime,
    quantity: ship.quantity || 1,
    status: ship.status ?? 1,
    currentImageUrl: ship.url || "",
  };

  newPhotoFile.value = null;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedShip.value = null;
  newPhotoFile.value = null;
  const fileInput = document.getElementById("file-upload");
  if (fileInput) {
    fileInput.value = "";
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      showMessage("ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 10MB", "error");
      event.target.value = "";
      return;
    }
    newPhotoFile.value = file;
  }
};

const removeNewImage = () => {
  newPhotoFile.value = null;
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

const formatDateTime = (timestamp) => {
  if (!timestamp) return "ຍັງບໍ່ໄດ້ຕັ້ງ";

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleString("lo-LA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleImageError = (event) => {
  event.target.src =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='100' y='75' text-anchor='middle' dy='.3em' fill='%23999' font-family='Arial, sans-serif' font-size='14'%3Eບໍ່ມີຮູບພາບ%3C/text%3E%3C/svg%3E";
};

const showMessage = (text, type) => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 5000);
};

const submitUpdate = async () => {
  if (!selectedShip.value) return;

  isUpdating.value = true;

  try {
    let imageUrl = editForm.value.currentImageUrl;

    // Upload new image if selected
    if (newPhotoFile.value) {
      const storagePath = `photos/${editForm.value.name}-${Date.now()}`;
      const photoRef = storageRef(storage, storagePath);
      await uploadBytes(photoRef, newPhotoFile.value);
      imageUrl = await getDownloadURL(photoRef);
    }

    // Update in Firestore
    await updateDoc(doc(db, "All_ships", selectedShip.value.id), {
      name: editForm.value.name,
      price: editForm.value.price,
      url: imageUrl,
      ship_id: editForm.value.ship_id,
      capacity: editForm.value.capacity,
      departure_time: new Date(editForm.value.departure_time),
      quantity: editForm.value.quantity,
      status: editForm.value.status,
      updated_at: new Date(),
    });

    // Update local data
    const shipIndex = ships.value.findIndex(
      (ship) => ship.id === selectedShip.value.id
    );
    if (shipIndex !== -1) {
      ships.value[shipIndex] = {
        ...ships.value[shipIndex],
        ...editForm.value,
        url: imageUrl,
        departure_time: new Date(editForm.value.departure_time),
        updated_at: new Date(),
      };
    }

    closeEditModal();
    showMessage("ອັບເດດເຮືອສຳເລັດແລ້ວ! 🎉", "success");
  } catch (error) {
    console.error("ຜິດພາດໃນການອັບເດດເຮືອ:", error);
    showMessage("ອັບເດດເຮືອບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່", "error");
  } finally {
    isUpdating.value = false;
  }
};

// Initialize
onMounted(() => {
  loadShips();
});
</script>
