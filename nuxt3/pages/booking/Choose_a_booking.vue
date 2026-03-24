<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 p-4 lg:p-8">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div
          class="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-600 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນເຮືອ...</p>
      </div>
    </div>

    <!-- Header Section -->
    <div class="max-w-6xl mx-auto mb-12">
      <div
        class="bg-white/95 backdrop-blur-lg rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/20 text-center"
      >
        <div
          class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <svg
            class="w-10 h-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="text-3xl lg:text-5xl font-bold text-gray-800 mb-4">
          ເລືອກເຮືອທີ່ຕ້ອງການຈອງ
        </h1>
        <p class="text-xl text-gray-600 max-w-1xl mx-auto leading-relaxed">
          ເລືອກເຮືອທີ່ເໝາະສົມກັບຄວາມຕ້ອງການຂອງທ່ານ ແລະ ສະມາຊິກໃນກຸ່ມ
        </p>
      </div>
    </div>

    <!-- Ships Grid -->
    <div class="max-w-7xl mx-auto mb-12">
      <div
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
      >
        <div
          v-for="ship in ships"
          :key="ship.id"
          class="group bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
          :class="{
            'ring-4 ring-indigo-500 ring-opacity-50 shadow-2xl transform -translate-y-1':
              selectedShipId === ship.id,
            'opacity-60 cursor-not-allowed hover:transform-none hover:shadow-xl':
              ship.quantity <= 0,
          }"
          @click="selectShip(ship)"
        >
          <!-- Ship Image -->
          <div class="relative h-48 lg:h-56 overflow-hidden">
            <img
              :src="ship.url"
              :alt="ship.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
            ></div>

            <!-- Availability Badge -->
            <div class="absolute top-4 right-4">
              <span
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md"
                :class="
                  ship.quantity > 0
                    ? 'bg-green-500/90 text-white'
                    : 'bg-red-500/90 text-white'
                "
              >
                <div
                  class="w-2 h-2 rounded-full"
                  :class="ship.quantity > 0 ? 'bg-white' : 'bg-white'"
                ></div>
                {{ ship.quantity > 0 ? "ວ່າງ" : "ໝົດ" }}
              </span>
            </div>

            <!-- Selected Indicator -->
            <div
              v-if="selectedShipId === ship.id"
              class="absolute top-4 left-4 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse"
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
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Ship Content -->
          <div class="p-6">
            <!-- Ship Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-800 mb-1">
                  {{ ship.name }}
                </h3>
                <span
                  class="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full font-medium"
                >
                  {{ ship.ship_id }}
                </span>
              </div>
            </div>

            <!-- Ship Specs -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div class="flex items-center gap-2 text-gray-600">
                <div
                  class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
                <span class="font-medium">{{ ship.capacity }} ຄົນ</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <div
                  class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    ></path>
                  </svg>
                </div>
                <span class="font-medium">ເຫຼືອ {{ ship.quantity }} ລຳ</span>
              </div>
            </div>

            <!-- Price Section -->
            <div
              class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4"
            >
              <div class="text-center">
                <div class="flex items-baseline justify-center gap-1 mb-1">
                  <span class="text-3xl font-bold text-gray-800">{{
                    formatPrice(ship.price)
                  }}</span>
                  <span class="text-lg font-semibold text-indigo-600">KIP</span>
                </div>
                <span class="text-sm text-gray-600 font-medium"
                  >ຕໍ່ຊົ່ວໂມງ</span
                >
              </div>
            </div>

            <!-- Select Button -->
            <button
              class="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              :class="
                selectedShipId === ship.id
                  ? 'bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transform hover:scale-[1.02]'
                  : ship.quantity > 0
                  ? 'bg-gray-100 text-gray-700 hover:bg-indigo-500 hover:text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              "
              :disabled="ship.quantity <= 0"
            >
              <svg
                v-if="selectedShipId === ship.id"
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              {{
                selectedShipId === ship.id
                  ? "ເລືອກແລ້ວ"
                  : ship.quantity > 0
                  ? "ເລືອກເຮືອນີ້"
                  : "ບໍ່ມີໃຫ້ບໍລິການ"
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Details -->
    <transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="transform translate-y-8 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
    >
      <div v-if="selectedShip" class="max-w-4xl mx-auto" data-booking-details>
        <div
          class="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <!-- Header -->
          <div
            class="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 lg:p-8"
          >
            <div class="flex items-center gap-4 text-white">
              <div
                class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <line
                    x1="16"
                    y1="2"
                    x2="16"
                    y2="6"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <line
                    x1="8"
                    y1="2"
                    x2="8"
                    y2="6"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <line
                    x1="3"
                    y1="10"
                    x2="21"
                    y2="10"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <h2 class="text-2xl lg:text-3xl font-bold">ລາຍລະອຽດການຈອງ</h2>
            </div>
          </div>

          <div class="p-6 lg:p-8">
            <!-- Selected Ship Summary -->
            <div
              class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl mb-8"
            >
              <img
                :src="selectedShip.url"
                :alt="selectedShip.name"
                class="w-24 h-24 lg:w-32 lg:h-32 rounded-xl object-cover shadow-lg"
              />
              <div class="flex-1 text-center sm:text-left">
                <h4 class="text-xl lg:text-2xl font-bold text-gray-800 mb-2">
                  {{ selectedShip.name }}
                </h4>
                <p class="text-gray-600 font-medium">
                  ຄວາມຈຸສູງສຸດ: {{ selectedShip.capacity }} ຄົນ
                </p>
              </div>
              <div class="text-center sm:text-right">
                <div class="text-2xl lg:text-3xl font-bold text-indigo-600">
                  {{ formatPrice(selectedShip.price) }}
                </div>
                <div class="text-sm text-gray-500 font-medium">KIP/ຊົ່ວໂມງ</div>
              </div>
            </div>

            <!-- Booking Form -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Left Column - Form Fields -->
              <div class="space-y-6">
                <!-- Date and Time -->
                <div>
                  <label
                    class="flex items-center gap-3 text-gray-700 font-semibold mb-3"
                  >
                    <div
                      class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"
                    >
                      <svg
                        class="w-4 h-4 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                        <line
                          x1="16"
                          y1="2"
                          x2="16"
                          y2="6"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                        <line
                          x1="8"
                          y1="2"
                          x2="8"
                          y2="6"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                        <line
                          x1="3"
                          y1="10"
                          x2="21"
                          y2="10"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                      </svg>
                    </div>
                    ວັນທີ ແລະ ເວລາ
                  </label>
                  <input
                    type="datetime-local"
                    v-model="reservationDate"
                    class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-700 font-medium"
                    :min="minDateTime"
                  />
                </div>

                <!-- Number of People -->
                <div>
                  <label
                    class="flex items-center gap-3 text-gray-700 font-semibold mb-3"
                  >
                    <div
                      class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"
                    >
                      <svg
                        class="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        ></path>
                      </svg>
                    </div>
                    ຈຳນວນຄົນ
                  </label>
                  <div
                    class="flex items-center border border-gray-300 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      @click="decrementPeople"
                      :disabled="peopleCapacity <= 1"
                      class="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <svg
                        class="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <line
                          x1="5"
                          y1="12"
                          x2="19"
                          y2="12"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      v-model.number="peopleCapacity"
                      min="1"
                      :max="selectedShip.capacity"
                      class="flex-1 p-4 text-center font-semibold text-gray-700 focus:outline-none"
                      readonly
                    />
                    <button
                      type="button"
                      @click="incrementPeople"
                      :disabled="peopleCapacity >= selectedShip.capacity"
                      class="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <svg
                        class="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <line
                          x1="12"
                          y1="5"
                          x2="12"
                          y2="19"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                        <line
                          x1="5"
                          y1="12"
                          x2="19"
                          y2="12"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                      </svg>
                    </button>
                  </div>
                  <p class="text-sm text-gray-500 mt-2">
                    ສູງສຸດ {{ selectedShip.capacity }} ຄົນ
                  </p>
                </div>

                <!-- Hours Selection -->
                <div>
                  <label
                    class="flex items-center gap-3 text-gray-700 font-semibold mb-3"
                  >
                    <div
                      class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
                    >
                      <svg
                        class="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                        <polyline
                          points="12,6 12,12 16,14"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                      </svg>
                    </div>
                    ຈຳນວນຊົ່ວໂມງ
                  </label>
                  <div class="grid grid-cols-4 gap-3">
                    <button
                      v-for="n in 8"
                      :key="n"
                      type="button"
                      @click="hour = n"
                      class="p-3 text-center font-semibold rounded-xl border-2 transition-all duration-200"
                      :class="
                        hour === n
                          ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg'
                          : 'border-gray-300 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                      "
                    >
                      {{ n }}h
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right Column - Price Summary -->
              <div>
                <div
                  class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 lg:p-8 sticky top-8"
                >
                  <h3
                    class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"
                  >
                    <svg
                      class="w-6 h-6 text-green-600"
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
                    ສະຫຼຸບລາຄາ
                  </h3>

                  <div class="space-y-4">
                    <div class="flex justify-between items-center py-2">
                      <span class="text-gray-600">ລາຄາຕໍ່ຊົ່ວໂມງ:</span>
                      <span class="font-semibold text-gray-800"
                        >{{ formatPrice(selectedShip.price) }} KIP</span
                      >
                    </div>
                    <div class="flex justify-between items-center py-2">
                      <span class="text-gray-600">ຈຳນວນຊົ່ວໂມງ:</span>
                      <span class="font-semibold text-gray-800"
                        >{{ hour }} ຊົ່ວໂມງ</span
                      >
                    </div>
                    <div class="flex justify-between items-center py-2">
                      <span class="text-gray-600">ຈຳນວນຄົນ:</span>
                      <span class="font-semibold text-gray-800"
                        >{{ peopleCapacity }} ຄົນ</span
                      >
                    </div>

                    <div class="border-t border-gray-300 pt-4">
                      <div class="flex justify-between items-center">
                        <span class="text-lg font-bold text-gray-800"
                          >💰 ລາຄາລວມ:</span
                        >
                        <span class="text-2xl font-bold text-indigo-600"
                          >{{ formatPrice(totalPrice) }} KIP</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div
              class="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-200"
            >
              <button
                @click="clearSelection"
                class="flex-1 sm:flex-none px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
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
                  ></path>
                </svg>
                ເລືອກໃໝ່
              </button>
              <button
                @click="confirmBooking"
                :disabled="!canProceed"
                class="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>ດຳເນີນການຕໍ່</span>
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <line
                    x1="5"
                    y1="12"
                    x2="19"
                    y2="12"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <polyline
                    points="12,5 19,12 12,19"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Empty State -->
    <div
      v-if="ships.length === 0 && !isLoading"
      class="max-w-md mx-auto text-center"
    >
      <div
        class="bg-white/95 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20"
      >
        <div
          class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            class="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            ></path>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-4">
          ບໍ່ມີເຮືອໃຫ້ບໍລິການ
        </h3>
        <p class="text-gray-600">ກະລຸນາລໍຖ້າ ຫຼື ຕິດຕໍ່ຫາພວກເຮົາ</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCookie, navigateTo } from "nuxt/app";
import { ref, onMounted, computed } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { useFirebase } from "@/composables/useFirebase";

const { db } = useFirebase();

// Cookie handling
const userEmailCookie = useCookie("userEmail");
const userEmail = ref("");

// Computed email for validation
const email = computed(() => {
  return userEmail.value || "";
});

// Ships data
const ships = ref([]);
const selectedShip = ref(null);
const selectedShipId = ref(null);

// Booking form state
const reservationDate = ref("");
const peopleCapacity = ref(1);
const hour = ref(1);

// Loading state
const isLoading = ref(false);

// Total price calculation
const totalPrice = computed(() => {
  return selectedShip.value && hour.value
    ? selectedShip.value.price * hour.value
    : 0;
});

// Minimum booking time (1 hour from now)
const minDateTime = computed(() => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString().slice(0, 16);
});

// Can user continue?
const canProceed = computed(() => {
  return (
    selectedShip.value &&
    reservationDate.value &&
    peopleCapacity.value >= 1 &&
    hour.value >= 1 &&
    peopleCapacity.value <= selectedShip.value.capacity &&
    userEmail.value &&
    userEmail.value.trim() !== ""
  );
});

// Fetch ships from Firebase Firestore
const fetchShips = async () => {
  try {
    isLoading.value = true;
    const querySnapshot = await getDocs(collection(db, "All_ships"));

    ships.value = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((ship) => {
        return ship.status === 1 || ship.status === true;
      });

    console.log("✅ Ships loaded:", ships.value.length);
  } catch (error) {
    console.error("❌ Error fetching ships:", error);
    alert("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນເຮືອ");
  } finally {
    isLoading.value = false;
  }
};

// Select a ship
const selectShip = (ship) => {
  if (ship.quantity <= 0) {
    alert("ເຮືອນີ້ບໍ່ມີຈຳນວນພຽງພໍ");
    return;
  }

  selectedShip.value = ship;
  selectedShipId.value = ship.id;
  peopleCapacity.value = 1;

  // Smooth scroll to booking section
  setTimeout(() => {
    const el = document.querySelector("[data-booking-details]");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 300);

  console.log("✅ Ship selected:", ship.name);
};

// Clear ship selection
const clearSelection = () => {
  selectedShip.value = null;
  selectedShipId.value = null;
  reservationDate.value = "";
  peopleCapacity.value = 1;
  hour.value = 1;
  console.log("✅ Selection cleared");
};

// Increase/Decrease people
const incrementPeople = () => {
  if (
    selectedShip.value &&
    peopleCapacity.value < selectedShip.value.capacity
  ) {
    peopleCapacity.value++;
  }
};

const decrementPeople = () => {
  if (peopleCapacity.value > 1) {
    peopleCapacity.value--;
  }
};

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat("lo-LA").format(price);
};

// Validate user email
const validateUserEmail = () => {
  if (!userEmail.value || userEmail.value.trim() === "") {
    alert("ບໍ່ພົບອີເມວຜູ້ໃຊ້ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail.value.trim())) {
    alert("ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ");
    return false;
  }

  return true;
};

// Validate booking data
const validateBookingData = () => {
  if (!selectedShip.value) {
    alert("ກະລຸນາເລືອກເຮືອ");
    return false;
  }

  if (!reservationDate.value) {
    alert("ກະລຸນາເລືອກວັນທີ່ຈອງ");
    return false;
  }

  if (peopleCapacity.value < 1) {
    alert("ຈຳນວນຄົນຕ້ອງຢ່າງໜ້ອຍ 1 ຄົນ");
    return false;
  }

  if (peopleCapacity.value > selectedShip.value.capacity) {
    alert(
      `ຈຳນວນຄົນເກີນຄວາມຈຸຂອງເຮືອ (ສູງສຸດ ${selectedShip.value.capacity} ຄົນ)`
    );
    return false;
  }

  if (hour.value < 1) {
    alert("ຈຳນວນຊົ່ວໂມງຕ້ອງຢ່າງໜ້ອຍ 1 ຊົ່ວໂມງ");
    return false;
  }

  const bookingDate = new Date(reservationDate.value);
  const now = new Date();
  if (bookingDate < now) {
    alert("ບໍ່ສາມາດຈອງໃນອະດີດໄດ້");
    return false;
  }

  return true;
};

// Main confirm booking function
const confirmBooking = () => {
  console.log("🔍 Starting booking confirmation...");

  if (!validateUserEmail()) {
    console.error("❌ Email validation failed");
    return;
  }

  if (!validateBookingData()) {
    console.error("❌ Booking data validation failed");
    return;
  }

  if (!canProceed.value) {
    alert("ກະລຸນາກວດສອບຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
    return;
  }

  try {
    const bookingData = {
      shipId: selectedShip.value.id,
      shipName: selectedShip.value.name,
      date: reservationDate.value,
      people: peopleCapacity.value,
      hour: hour.value,
      shipPrice: selectedShip.value.price * hour.value,
      userEmail: userEmail.value,
    };

    console.log("✅ Booking data prepared:", bookingData);

    const navigationUrl = `/booking/food_booking?user=${encodeURIComponent(
      userEmail.value
    )}&ship=${bookingData.shipId}&ship_name=${encodeURIComponent(
      bookingData.shipName
    )}&date=${encodeURIComponent(bookingData.date)}&people=${
      bookingData.people
    }&hour=${bookingData.hour}&ship_price=${bookingData.shipPrice}`;

    console.log("🔍 Navigation URL:", navigationUrl);
    navigateTo(navigationUrl);
  } catch (error) {
    console.error("❌ Error in booking confirmation:", error);
    alert("ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່");
  }
};

// Initialize page
onMounted(async () => {
  console.log("🔍 Page mounted, initializing...");

  // ✅ Check if user is logged in
  if (!userEmailCookie.value) {
    console.warn("⚠️ User not logged in, redirecting to login...");
    alert("ກະລຸນາ ເຂົ້າສູ່ລະບົບ ກ່ອນທີ່ຈະດຳເນີນການຈອງ");
    await navigateTo("/login");
    return;
  }

  userEmail.value = userEmailCookie.value;
  console.log("✅ User email loaded from cookie:", userEmail.value);

  if (!reservationDate.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    reservationDate.value = tomorrow.toISOString().slice(0, 16);
    console.log("✅ Default reservation date set:", reservationDate.value);
  }

  await fetchShips();
  console.log("✅ Page initialization complete");
});
</script>
