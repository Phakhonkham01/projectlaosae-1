<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
          <div class="flex items-center justify-between relative">
            <!-- Progress Line -->
            <div
              class="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full"
            >
              <div
                class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                :style="{ width: `${((currentStep - 1) / 2) * 100}%` }"
              ></div>
            </div>

            <!-- Step Items -->
            <div
              v-for="(step, index) in [
                { number: 1, title: 'ຂໍ້ມູນການຈອງ' },
                { number: 2, title: 'ເລືອກອາຫານ' },
                { number: 3, title: 'ການຊຳລະເງິນ' },
              ]"
              :key="step.number"
              class="flex flex-col items-center relative z-10"
            >
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 mb-2"
                :class="
                  currentStep >= step.number
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-500'
                "
              >
                <span v-if="currentStep > step.number" class="text-xl">✓</span>
                <span v-else>{{ step.number }}</span>
              </div>
              <span
                class="text-sm font-medium text-center transition-colors duration-300"
                :class="
                  currentStep >= step.number
                    ? 'text-indigo-600'
                    : 'text-gray-500'
                "
              >
                {{ step.title }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: Booking Information -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
          <div class="flex items-center justify-between mb-6">
            <h2
              class="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3"
            >
              <div
                class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"
              >
                <span class="text-xl">📋</span>
              </div>
               ລາຍລະອຽດການຈອງ
            </h2>
            <button
              @click="(editBooking = true), initializeEditData()"
              class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
            >
              <span class="text-lg">✏️</span>
              ແກ້ໄຂ
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <span class="text-gray-600 font-medium flex items-center gap-2">
                  <span class="text-lg">🚢</span>
                  ເຮືອ:
                </span>
                <span class="font-bold text-gray-800">{{ shipName }}</span>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <span class="text-gray-600 font-medium flex items-center gap-2">
                  <span class="text-lg">📅</span>
                  ວັນທີ:
                </span>
                <span class="font-bold text-gray-800">{{ formattedDate }}</span>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <span class="text-gray-600 font-medium flex items-center gap-2">
                  <span class="text-lg">👥</span>
                  ຈຳນວນຄົນ:
                </span>
                <span class="font-bold text-gray-800">{{ people }} ຄົນ</span>
              </div>
            </div>

            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <span class="text-gray-600 font-medium flex items-center gap-2">
                  <span class="text-lg">⏰</span>
                  ຊົ່ວໂມງ:
                </span>
                <span class="font-bold text-gray-800">{{ hour }} ຊົ່ວໂມງ</span>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
              >
                <span class="text-green-700 font-bold flex items-center gap-2">
                  <span class="text-lg">💰</span>
                  ລາຄາເຮືອ:
                </span>
                <span class="font-bold text-green-800 text-lg"
                  >{{ formatPrice(shipPrice) }} KIP</span
                >
              </div>
            </div>
          </div>

          <button
            @click="currentStep = 2"
            class="w-full mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>ດຳເນີນການຕໍ່ - ເລືອກອາຫານ</span>
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Edit Booking Modal -->
      <div
        v-if="editBooking"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3
                class="text-xl font-bold text-gray-800 flex items-center gap-2"
              >
                <span class="text-2xl">✏️</span>
                ແກ້ໄຂຂໍ້ມູນການຈອງ
              </h3>
              <button
                @click="cancelEdit"
                class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <span class="text-gray-600 font-bold">×</span>
              </button>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >🚢 ຊື່ເຮືອ:</label
              >
              <input
                v-model="editData.shipName"
                type="text"
                class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="ໃສ່ຊື່ເຮືອ"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >📅 ວັນທີ:</label
              >
              <input
                v-model="editData.reservationDate"
                type="datetime-local"
                class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >👥 ຈຳນວນຄົນ:</label
                >
                <input
                  v-model.number="editData.people"
                  type="number"
                  min="1"
                  max="50"
                  class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="ຈຳນວນຄົນ"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >⏰ ຊົ່ວໂມງ:</label
                >
                <select
                  v-model.number="editData.hour"
                  class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">ເລືອກຊົ່ວໂມງ</option>
                  <option value="2">2 ຊົ່ວໂມງ</option>
                  <option value="4">4 ຊົ່ວໂມງ</option>
                  <option value="6">6 ຊົ່ວໂມງ</option>
                  <option value="8">8 ຊົ່ວໂມງ</option>
                  <option value="12">12 ຊົ່ວໂມງ</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >💰 ລາຄາເຮືອ (KIP):</label
              >
              <input
                v-model.number="editData.shipPrice"
                type="number"
                min="0"
                class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="ລາຄາເຮືອ"
              />
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex gap-4">
            <button
              @click="cancelEdit"
              class="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span class="text-lg">❌</span>
              ຍົກເລີກ
            </button>
            <button
              @click="saveEdit"
              :disabled="!isEditDataValid"
              class="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span class="text-lg">✅</span>
              ບັນທຶກການແກ້ໄຂ
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Food Selection -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
          <h2
            class="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"
            >
              <span class="text-xl">🍽</span>
            </div>
            ເລືອກອາຫານຂື້ນເຮືອ
          </h2>

          <!-- Category Filters -->
          <div class="flex flex-wrap gap-3 mb-6">
            <button
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              class="px-4 py-2 rounded-full font-medium transition-all duration-200"
              :class="
                selectedCategory === category
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
            >
              {{ category }}
            </button>
          </div>

          <!-- Search -->
          <div class="relative mb-6">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="🔍 ຄົ້ນຫາອາຫານ..."
              class="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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

          <!-- Loading State -->
          <div v-if="products.length === 0" class="text-center py-12">
            <div
              class="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"
            ></div>
            <p class="text-gray-600 font-medium">ກຳລັງໂຫຼດເມນູອາຫານ...</p>
          </div>

          <!-- Products Grid -->
          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
          >
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              :class="{ 'ring-2 ring-indigo-500': product.quantity > 0 }"
            >
              <div class="relative h-48">
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-if="product.quantity > 0"
                  class="absolute top-3 right-3 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm"
                >
                  {{ product.quantity }}
                </div>
              </div>

              <div class="p-4">
                <h3 class="font-bold text-gray-800 mb-2 line-clamp-2">
                  {{ product.name }}
                </h3>
                <div class="text-lg font-bold text-indigo-600 mb-4">
                  {{ formatPrice(product.price) }} ກີບ
                </div>

                <div
                  class="flex items-center justify-between bg-gray-50 rounded-xl p-2"
                >
                  <button
                    @click="decreaseQuantity(product)"
                    :disabled="product.quantity === 0"
                    class="w-8 h-8 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-sm"
                  >
                    <span class="text-gray-600 font-bold">−</span>
                  </button>

                  <span class="font-bold text-gray-800 mx-4">{{
                    product.quantity
                  }}</span>

                  <button
                    @click="increaseQuantity(product)"
                    class="w-8 h-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
                  >
                    <span class="font-bold">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Items Summary -->
          <div
            v-if="selectedItems.length > 0"
            class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6"
          >
            <h3
              class="text-lg font-bold text-green-800 mb-4 flex items-center gap-2"
            >
              <span class="text-xl">📦</span>
              ລາຍການທີ່ເລືອກ ({{ selectedItems.length }})
            </h3>
            <div class="space-y-3">
              <div
                v-for="item in selectedItems"
                :key="item.id"
                class="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm"
              >
                <span class="font-medium text-gray-800"
                  >{{ item.name }} × {{ item.quantity }}</span
                >
                <span class="font-bold text-green-700"
                  >{{ formatPrice(item.price * item.quantity) }} KIP</span
                >
              </div>
            </div>
            <div
              class="mt-4 pt-4 border-t border-green-200 flex justify-between items-center"
            >
              <span class="text-lg font-bold text-green-800"
                >ລວມລາຄາອາຫານ:</span
              >
              <span class="text-xl font-bold text-green-800"
                >{{ formatPrice(foodTotalPrice) }} KIP</span
              >
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="currentStep = 1"
              class="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
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
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                ></path>
              </svg>
              ກັບຄືນ
            </button>
            <button
              @click="proceedToPayment"
              :disabled="selectedItems.length === 0"
              class="flex-2 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>ດຳເນີນການຕໍ່ - ຊຳລະເງິນ</span>
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Payment -->
      <div v-if="currentStep === 3" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
          <h2
            class="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"
            >
              <span class="text-xl">💳</span>
            </div>
            ການຊຳລະເງິນ
          </h2>

          <!-- Final Summary -->
          <div
            class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8"
          >
            <h3 class="text-lg font-bold text-gray-800 mb-4">ສັງລວມລາຄາ</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-600">ລາຄາເຮືອ:</span>
                <span class="font-semibold text-gray-800"
                  >{{ formatPrice(shipPrice) }} KIP</span
                >
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-600">ລາຄາອາຫານ:</span>
                <span class="font-semibold text-gray-800"
                  >{{ formatPrice(foodTotalPrice) }} KIP</span
                >
              </div>
              <div class="border-t border-gray-300 pt-3">
                <div class="flex justify-between items-center">
                  <span class="text-xl font-bold text-gray-800"
                    >💰 ລວມທັງໝົດ:</span
                  >
                  <span class="text-2xl font-bold text-indigo-600"
                    >{{ formatPrice(grandTotal) }} KIP</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Methods -->
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-4">
              ເລືອກວິທີການຊຳລະເງິນ
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- <button
                @click="payCash"
                class="group p-6 border-2 border-gray-200 hover:border-green-300 rounded-2xl transition-all duration-200 hover:shadow-lg"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-16 h-16 bg-green-100 group-hover:bg-green-200 rounded-2xl flex items-center justify-center transition-colors"
                  >
                    <span class="text-3xl">💵</span>
                  </div>
                  <div class="text-left">
                    <div class="font-bold text-gray-800 text-lg">
                      ຈ່າຍດ້ວຍເງິນສົດ
                    </div>
                    <div class="text-sm text-gray-500">
                      ຈ່າຍໃນວັນທີ່ໃຊ້ບໍລິການ
                    </div>
                  </div>
                </div>
              </button> -->

              <button
                @click="payTransfer"
                class="group p-6 border-2 border-gray-200 hover:border-blue-300 rounded-2xl transition-all duration-200 hover:shadow-lg"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-2xl flex items-center justify-center transition-colors"
                  >
                    <span class="text-3xl">📱</span>
                  </div>
                  <div class="text-left">
                    <div class="font-bold text-gray-800 text-lg">ໂອນເງິນ</div>
                    <div class="text-sm text-gray-500">
                      ສະແກນ QR Code ເພື່ອຊຳລະ
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Navigation -->
          <div class="flex">
            <button
              @click="currentStep = 2"
              class="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center gap-2"
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
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                ></path>
              </svg>
              ກັບຄືນ
            </button>
          </div>
        </div>
      </div>

      <!-- Transfer Payment Modal -->
      <div
        v-if="showTransfer && !paymentConfirmed"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3
                class="text-xl font-bold text-gray-800 flex items-center gap-2"
              >
                <span class="text-2xl">📱</span>
                ຊຳລະເງິນດ້ວຍການໂອນ
              </h3>
              <button
                @click="showTransfer = false"
                class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <span class="text-gray-600 font-bold">×</span>
              </button>
            </div>
          </div>

          <div class="p-6 text-center">
            <div class="mb-6">
              <p class="text-lg font-semibold text-gray-800 mb-4">
                ຍອດທີ່ຕ້ອງຈ່າຍ:
                <span class="text-2xl font-bold text-indigo-600"
                  >{{ formatPrice(grandTotal) }} KIP</span
                >
              </p>
              <div class="bg-gray-100 rounded-2xl p-6 mb-4">
                <img
                  src="/images/qr_code.png"
                  alt="QR Code"
                  class="w-48 h-48 mx-auto rounded-xl"
                />
              </div>
              <p class="text-gray-600">ສະແກນ QR Code ນີ້ເພື່ອຊຳລະເງິນ</p>
            </div>

            <div class="border-t border-gray-200 pt-6">
              <h4
                class="text-lg font-bold text-gray-800 mb-4 flex items-center justify-center gap-2"
              >
                <span class="text-xl">📸</span>
                ອັບໂຫຼດຫຼັກຖານການຊຳລະ
              </h4>

              <div class="mb-4">
                <input
                  type="file"
                  @change="handleFileChange"
                  accept="image/*"
                  id="payment-proof"
                  class="hidden"
                />
                <label
                  for="payment-proof"
                  class="block w-full p-6 border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl cursor-pointer transition-colors"
                  :class="{ 'border-green-400 bg-green-50': paymentProofFile }"
                >
                  <div v-if="!paymentProofFile" class="text-center">
                    <div class="text-4xl text-gray-400 mb-2">📷</div>
                    <span class="text-gray-600 font-medium"
                      >ກົດເພື່ອເລືອກຮູບ</span
                    >
                  </div>
                  <div v-else class="text-center">
                    <div class="text-4xl text-green-500 mb-2">✅</div>
                    <span class="text-green-700 font-medium">{{
                      paymentProofFile.name
                    }}</span>
                  </div>
                </label>
              </div>

              <button
                @click="confirmTransfer"
                :disabled="!paymentProofFile"
                class="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span class="text-lg">✅</span>
                ຢືນຢັນການຊຳລະເງິນ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Confirmation Modal -->
      <div
        v-if="showBookingConfirmation"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <!-- Ticket Container -->
          <div id="booking-ticket" class="p-6 lg:p-8">
            <!-- Ticket Header -->
            <div
              class="text-center mb-8 pb-6 border-b-2 border-dashed border-gray-300"
            >
              <h2
                class="text-2xl lg:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3"
              >
                <span class="text-3xl">🎫</span>
                ບັດຢືນຢັນການຈອງ
              </h2>
              <div
                class="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full font-bold text-lg"
              >
                {{ bookingNumber }}
              </div>
            </div>

            <!-- Ticket Content -->
            <div class="space-y-6">
              <!-- Ship Information -->
              <div class="bg-blue-50 rounded-2xl p-6">
                <h3
                  class="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2"
                >
                  <span class="text-xl">🚢</span>
                  ຂໍ້ມູນເຮືອ
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex justify-between">
                    <span class="text-blue-700">ຊື່ເຮືອ:</span>
                    <span class="font-semibold text-blue-900">{{
                      shipName
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-blue-700">ວັນທີ:</span>
                    <span class="font-semibold text-blue-900">{{
                      formattedDate
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-blue-700">ຈຳນວນຄົນ:</span>
                    <span class="font-semibold text-blue-900"
                      >{{ people }} ຄົນ</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-blue-700">ຊົ່ວໂມງ:</span>
                    <span class="font-semibold text-blue-900"
                      >{{ hour }} ຊົ່ວໂມງ</span
                    >
                  </div>
                </div>
              </div>

              <!-- Customer Information -->
              <div class="bg-purple-50 rounded-2xl p-6">
                <h3
                  class="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2"
                >
                  <span class="text-xl">👤</span>
                  ຂໍ້ມູນລູກຄ້າ
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex justify-between">
                    <span class="text-purple-700">ອີເມວ:</span>
                    <span class="font-semibold text-purple-900">{{
                      userEmail
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-purple-700">ວິທີຊຳລະ:</span>
                    <span class="font-semibold text-purple-900">{{
                      finalPaymentMethod === "Cash" ? "ເງິນສົດ" : "ໂອນເງິນ"
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Food Items -->
              <div
                v-if="confirmedItems.length > 0"
                class="bg-orange-50 rounded-2xl p-6"
              >
                <h3
                  class="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2"
                >
                  <span class="text-xl">🍽</span>
                  ລາຍການອາຫານ
                </h3>
                <div class="space-y-3">
                  <div
                    v-for="item in confirmedItems"
                    :key="item.id"
                    class="flex items-center justify-between p-3 bg-white rounded-xl"
                  >
                    <span class="font-medium text-orange-900">{{
                      item.name
                    }}</span>
                    <span class="text-orange-700">× {{ item.quantity }}</span>
                    <span class="font-bold text-orange-800"
                      >{{ formatPrice(item.price * item.quantity) }} KIP</span
                    >
                  </div>
                </div>
              </div>

              <!-- Pricing Summary -->
              <div class="bg-green-50 rounded-2xl p-6">
                <h3
                  class="text-lg font-bold text-green-800 mb-4 flex items-center gap-2"
                >
                  <span class="text-xl">💰</span>
                  ສັງລວມລາຄາ
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-green-700">ລາຄາເຮືອ:</span>
                    <span class="font-semibold text-green-800"
                      >{{ formatPrice(shipPrice) }} KIP</span
                    >
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-green-700">ລາຄາອາຫານ:</span>
                    <span class="font-semibold text-green-800"
                      >{{ formatPrice(confirmedFoodTotal) }} KIP</span
                    >
                  </div>
                  <div class="border-t border-green-200 pt-3">
                    <div class="flex justify-between items-center">
                      <span class="text-xl font-bold text-green-800"
                        >💰 ລວມທັງໝົດ:</span
                      >
                      <span class="text-2xl font-bold text-green-800"
                        >{{ formatPrice(confirmedGrandTotal) }} KIP</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Booking Time -->
              <div class="text-center text-gray-600 text-sm">
                <p>ວັນທີ່ຈອງ: {{ bookingDateTime }}</p>
              </div>
            </div>

            <!-- Ticket Footer -->
            <div
              class="mt-8 pt-6 border-t-2 border-dashed border-gray-300 text-center space-y-2"
            >
              <p
                class="text-gray-700 font-medium flex items-center justify-center gap-2"
              >
                <span class="text-lg">📱</span>
                ກະລຸນາສະແດງບັດນີ້ໃຫ້ພະນັກງານເຄົາເຕີ້
              </p>
              <p
                class="text-gray-700 font-medium flex items-center justify-center gap-2"
              >
                <span class="text-lg">🕐</span>
              
              </p>
            </div>
          </div>

          <!-- Ticket Actions -->
          <div
            class="p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3"
          >
            <button
              @click="downloadTicket"
              class="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span class="text-lg">📥</span>
              ດາວໂຫຼດບັດ
            </button>
            <button
              @click="shareTicket"
              class="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span class="text-lg">📤</span>
              ແບ່ງປັນ
            </button>
            <button
              @click="closeBookingConfirmation"
              class="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span class="text-lg">✅</span>
              ປິດ
            </button>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div
        v-if="successMessage && !showBookingConfirmation"
        class="fixed bottom-4 right-4 z-50"
      >
        <div
          class="bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce"
        >
          <span class="text-2xl">✅</span>
          <span class="font-semibold">{{ successMessage }}</span>
        </div>
      </div>

      <div v-if="errorMessage" class="fixed bottom-4 right-4 z-50">
        <div
          class="bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce"
        >
          <span class="text-2xl">❌</span>
          <span class="font-semibold">{{ errorMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "nuxt/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// Firebase setup
const db = getFirestore(getApp());
const storage = getStorage();

const userEmail = useCookie("userEmail");
// Route data
const route = useRoute();

const shipId = ref("");
const shipName = ref("");
const reservationDate = ref("");
const people = ref("");
const hour = ref("");
const shipPrice = ref(0);

// UI State
const currentStep = ref(1);
const editBooking = ref(false);
const selectedCategory = ref("ທັງໝົດ");
const searchQuery = ref("");

// State variables
const products = ref([]);
const successMessage = ref("");
const errorMessage = ref("");
const showTransfer = ref(false);
const paymentConfirmed = ref(false);
const paymentProofFile = ref(null);
const imageUrl = ref("");

// Booking confirmation modal state
const showBookingConfirmation = ref(false);
const bookingNumber = ref("");
const bookingDateTime = ref("");
const confirmedItems = ref([]);
const confirmedFoodTotal = ref(0);
const confirmedGrandTotal = ref(0);
const finalPaymentMethod = ref("");

// Edit data
const editData = ref({
  shipName: "",
  reservationDate: "",
  people: 0,
  hour: 0,
  shipPrice: 0,
});

// Computed properties
const isEditDataValid = computed(() => {
  return (
    editData.value.shipName.trim() !== "" &&
    editData.value.reservationDate !== "" &&
    editData.value.people > 0 &&
    editData.value.hour > 0 &&
    editData.value.shipPrice >= 0
  );
});

const formattedDate = computed(() => {
  if (reservationDate.value) {
    const date = new Date(reservationDate.value);
    return date.toLocaleString("lo-LA");
  }
  return "";
});

const categories = computed(() => {
  const cats = ["ທັງໝົດ", ...new Set(products.value.map((p) => p.category))];
  return cats;
});

const filteredProducts = computed(() => {
  let filtered = products.value;

  if (selectedCategory.value !== "ທັງໝົດ") {
    filtered = filtered.filter((p) => p.category === selectedCategory.value);
  }

  if (searchQuery.value) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return filtered;
});

const selectedItems = computed(() =>
  products.value.filter((p) => p.quantity > 0)
);

const foodTotalPrice = computed(() =>
  products.value.reduce((sum, p) => sum + p.price * p.quantity, 0)
);

const grandTotal = computed(() => shipPrice.value + foodTotalPrice.value);

// Helper functions
const formatPrice = (price) => {
  return new Intl.NumberFormat("lo-LA").format(price);
};

const generateBookingNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `MILO${timestamp.toString().slice(-6)}${random
    .toString()
    .padStart(3, "0")}`;
};

// Methods
const initializeEditData = () => {
  editData.value = {
    shipName: shipName.value,
    reservationDate: reservationDate.value,
    people: parseInt(people.value),
    hour: parseInt(hour.value),
    shipPrice: shipPrice.value,
  };
};

const cancelEdit = () => {
  editBooking.value = false;
  initializeEditData();
};

const saveEdit = () => {
  if (!isEditDataValid.value) {
    errorMessage.value = "ກະລຸນາໃສ່ຂໍ້ມູນໃຫ້ຄົບຖ້ວນ";
    return;
  }

  shipName.value = editData.value.shipName;
  reservationDate.value = editData.value.reservationDate;
  people.value = editData.value.people.toString();
  hour.value = editData.value.hour.toString();
  shipPrice.value = editData.value.shipPrice;

  editBooking.value = false;
  successMessage.value = "ແກ້ໄຂຂໍ້ມູນສຳເລັດ! ✅";

  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
};

const increaseQuantity = (product) => {
  product.quantity++;
};

const decreaseQuantity = (product) => {
  if (product.quantity > 0) {
    product.quantity--;
  }
};

const proceedToPayment = () => {
  if (selectedItems.value.length === 0) {
    alert("ກະລຸນາເລືອກອາຫານຢ່າງໜ້ອຍ 1 ລາຍການ");
    return;
  }
  currentStep.value = 3;
};

const decreaseShipQuantity = async () => {
  try {
    if (!shipId.value) {
      console.error("Ship ID is missing");
      return false;
    }

    const shipDocRef = doc(db, "All_ships", shipId.value);
    const shipDoc = await getDoc(shipDocRef);

    if (!shipDoc.exists()) {
      console.error("Ship document not found");
      errorMessage.value = "ບໍ່ພົບຂໍ້ມູນເຮືອ";
      return false;
    }

    const shipData = shipDoc.data();
    const currentQuantity = shipData.quantity || 0;

    if (currentQuantity <= 0) {
      console.error("Ship quantity is already 0 or less");
      errorMessage.value = "ເຮືອບໍ່ມີຈຳນວນພຽງພໍ";
      return false;
    }

    await updateDoc(shipDocRef, {
      quantity: increment(-1),
    });

    console.log("Ship quantity decreased successfully");
    return true;
  } catch (err) {
    console.error("Error decreasing ship quantity:", err);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຈຳນວນເຮືອ";
    return false;
  }
};

const showBookingConfirmationModal = (paymentMethod) => {
  confirmedItems.value = [...selectedItems.value];
  confirmedFoodTotal.value = foodTotalPrice.value;
  confirmedGrandTotal.value = grandTotal.value;
  finalPaymentMethod.value = paymentMethod;

  bookingNumber.value = generateBookingNumber();
  bookingDateTime.value = new Date().toLocaleString("lo-LA");

  showBookingConfirmation.value = true;
};

const closeBookingConfirmation = () => {
  showBookingConfirmation.value = false;

  products.value.forEach((p) => (p.quantity = 0));
  showTransfer.value = false;
  paymentConfirmed.value = false;
  paymentProofFile.value = null;
  imageUrl.value = "";
  currentStep.value = 1;

  successMessage.value = "";
  errorMessage.value = "";

  navigateTo(
    `/booking/Choose_a_booking/?user=${encodeURIComponent(userEmail.value)}`
  );
};

const downloadTicket = () => {
  alert("ການດາວໂຫຼດຈະມີໃນເວີຊັນຕໍ່ໄປ");
};

const shareTicket = () => {
  if (navigator.share) {
    navigator.share({
      title: "ບັດຢືນຢັນການຈອງເຮືອ",
      text: `ຈອງເຮືອ ${shipName.value} ສຳລັບວັນທີ ${formattedDate.value}`,
      url: window.location.href,
    });
  } else {
    alert("ການແບ່ງປັນຈະມີໃນເວີຊັນຕໍ່ໄປ");
  }
};

const payCash = async () => {
  await saveBookingData("Cash");
};

const payTransfer = () => {
  showTransfer.value = true;
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    paymentProofFile.value = file;
  }
};

const confirmTransfer = async () => {
  if (!paymentProofFile.value) {
    alert("ກະລຸນາອັບໂຫຼດຫຼັກຖານການຊຳລະເງິນກ່ອນ");
    return;
  }

  try {
    const file = paymentProofFile.value;
    const path = `payment_proofs/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    imageUrl.value = url;
    paymentConfirmed.value = false;

    await saveBookingData("Transfer");
  } catch (err) {
    console.error(err);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫຼດຫຼັກຖານ";
  }
};

const saveBookingData = async (paymentMethod) => {
  const selectedItemsData = selectedItems.value.map(
    ({ id, name, price, quantity }) => ({
      id,
      name,
      price,
      quantity,
    })
  );

  try {
    await addDoc(collection(db, "FoodBookings"), {
      user: userEmail.value,
      ship: shipId.value,
      shipName: shipName.value,
      date: reservationDate.value,
      people: people.value,
      hour: hour.value,
      shipPrice: shipPrice.value,
      items: selectedItemsData,
      foodTotalPrice: foodTotalPrice.value,
      grandTotal: grandTotal.value,
      paymentMethod,
      paymentConfirmed:
        paymentMethod === "Transfer" ? paymentConfirmed.value : false,
      paymentProofUrl: paymentMethod === "Transfer" ? imageUrl.value : "",
      bookingNumber: generateBookingNumber(),
      createdAt: serverTimestamp(),
    });

    const quantityUpdated = await decreaseShipQuantity();

    if (quantityUpdated) {
      successMessage.value = "ຈອງອາຫານສຳເລັດ! 🎉";
      errorMessage.value = "";
      showBookingConfirmationModal(paymentMethod);
    } else {
      successMessage.value =
        "ຈອງອາຫານສຳເລັດ! ⚠️ (ແຕ່ມີບັນຫາໃນການອັບເດດຈຳນວນເຮືອ)";
    }
  } catch (err) {
    console.error(err);
    successMessage.value = "";
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການຈອງອາຫານ";
  }
};

// Load products and route data on page load
onMounted(async () => {
  userEmail.value = route.query.user || "";
  shipId.value = route.query.ship || "";
  shipName.value = decodeURIComponent(route.query.ship_name || "");
  reservationDate.value = decodeURIComponent(route.query.date || "");
  people.value = route.query.people || "";
  hour.value = route.query.hour || "";
  shipPrice.value = parseInt(route.query.ship_price) || 0;

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    products.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      quantity: 0,
      category: doc.data().category || "ອື່ນໆ",
      ...doc.data(),
    }));
  } catch (err) {
    console.error(err);
    errorMessage.value = "ໂຫຼດເມນູອາຫານລ້ມເຫຼວ";
  }

  initializeEditData();
});
</script>
