<template>
  <NuxtLink to="/login">
  gmperim
  </NuxtLink>
  <div class="min-h-screen bg-gray-900 relative overflow-hidden">
    <!-- Image Carousel -->
    <div class="absolute inset-0">
      <div
        v-for="(image, index) in images"
        :key="index"
        :class="[
          'absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out',
          currentImageIndex === index ? 'opacity-100' : 'opacity-0',
        ]"
        :style="{ backgroundImage: `url('${image.url}')` }"
      >
        <!-- Overlay for better text readability -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"
        ></div>
      </div>
    </div>

    <!-- Content Overlay -->
    <div
      class="relative z-10 min-h-screen flex items-center justify-center p-4"
    >
      <div class="max-w-4xl mx-auto text-center">
        <!-- Logo & Brand -->
        <div class="mb-8 animate-[fadeInUp_1s_ease-out]">
          <div
            class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-sm border border-white/20"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="text-white"
            >
              <path
                d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16Z"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path d="M8 3H16L17 8H7L8 3Z" fill="currentColor" />
              <path
                d="M7 8L5 21H19L17 8"
                stroke="currentColor"
                stroke-width="1.5"
                fill="none"
              />
              <circle cx="12" cy="12" r="2" fill="white" />
            </svg>
          </div>
          <h1
            class="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight"
          >
            🚢
            <span
              class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              >ທຽວທະເລລາວ</span
            >
          </h1>
          <p class="text-xl md:text-2xl text-blue-100 font-light mb-2">
            ຍິນດີຕ້ອນຮັບສູ່ການຜະຈົນໄພທີ່ບໍ່ລືມ
          </p>
          <p class="text-lg text-gray-300 max-w-2xl mx-auto">
            ຄົ້ນພົບຄວາມງາມຂອງທະເລລາວດ້ວຍບໍລິການເຮືອນຳທ່ຽວທີ່ມີຄຸນນະພາບສູງ
          </p>
        </div>

        <!-- Current Image Info -->
        <div class="mb-8 animate-[fadeInUp_1s_ease-out_0.3s_both]">
          <div
            class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md mx-auto"
          >
            <h3 class="text-2xl font-bold text-white mb-2">
              {{ images[currentImageIndex].title }}
            </h3>
            <p class="text-blue-100">
              {{ images[currentImageIndex].description }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-[fadeInUp_1s_ease-out_0.6s_both]"
        >
          <NuxtLink to="/registers/register_user">
            <button
              class="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 min-w-[200px]"
            >
              <div
                class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              ></div>
              <div class="relative flex items-center justify-center gap-2">
                <svg
                  class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  ></path>
                </svg>
                <span>ສ້າງບັນຊີໃໝ່</span>
              </div>
            </button>
          </NuxtLink>

          <NuxtLink to="/login">
            <button
              class="group relative px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border-2 border-white/30 hover:border-white/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 min-w-[200px]"
            >
              <div class="relative flex items-center justify-center gap-2">
                <svg
                  class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  ></path>
                </svg>
                <span>ເຂົ້າສູ່ລະບົບ</span>
              </div>
            </button>
          </NuxtLink>
        </div>

        <!-- Features -->
        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-[fadeInUp_1s_ease-out_0.9s_both]"
        >
          <div
            class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto"
            >
              <span class="text-2xl">🏖️</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">ສະຖານທີ່ສວຍງາມ</h3>
            <p class="text-blue-100 text-sm">
              ສຳຫຼວດທະເລສາບແລະແຫຼ່ງທ່ອງທ່ຽວທີ່ງາມທີ່ສຸດ
            </p>
          </div>

          <div
            class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto"
            >
              <span class="text-2xl">⭐</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">ບໍລິການດີເລີດ</h3>
            <p class="text-blue-100 text-sm">
              ທີມງານມືອາຊີບພ້ອມໃຫ້ບໍລິການຕະຫຼອດການເດີນທາງ
            </p>
          </div>

          <div
            class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto"
            >
              <span class="text-2xl">💰</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">ລາຄາສົມເຫດສົມຜົນ</h3>
            <p class="text-blue-100 text-sm">
              ແພັກເກດທ່ອງທ່ຽວຫຼາກຫຼາຍໃນລາຄາທີ່ເໝາະສົມ
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Indicators -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
      <div class="flex space-x-3">
        <button
          v-for="(image, index) in images"
          :key="index"
          @click="goToImage(index)"
          :class="[
            'w-3 h-3 rounded-full transition-all duration-300',
            currentImageIndex === index
              ? 'bg-white scale-125'
              : 'bg-white/50 hover:bg-white/75',
          ]"
        ></button>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <button
      @click="previousImage"
      class="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110"
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
          d="M15 19l-7-7 7-7"
        ></path>
      </svg>
    </button>

    <button
      @click="nextImage"
      class="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110"
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
          d="M9 5l7 7-7 7"
        ></path>
      </svg>
    </button>

    <!-- Floating Elements -->
    <div
      class="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"
    ></div>
    <div
      class="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
      style="animation-delay: 2s"
    ></div>
    <div
      class="absolute top-1/2 left-10 w-24 h-24 bg-green-500/10 rounded-full blur-xl animate-pulse"
      style="animation-delay: 4s"
    ></div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "empty1",
  prerender: false, // ⛔ ບໍ່ພະຍາຍາມ prerender ຫນ້າເຂົ້າສູ່ລະບົບທີ່ມີການປ່ຽນແປງນີ້
});
import { ref, onMounted, onUnmounted } from "vue";

// Image data - Replace with your actual images
const images = ref([
  {
    url: "/images/view.jpg",
    title: "ເຮືອທ່ອງທ່ຽວຫຼູຫຼາ",
    description: "ປະສົບການທ່ອງທ່ຽວທີ່ສະດວກສະບາຍ",
  },
  {
    url: "/images/view1.jpg",
    title: "ທິວທັດທະເລສາບ",
    description: "ຊົມວິວທິວທັດອັນງົດງາມ",
  },
  {
    url: "/images/view2.jpg",
    title: "ການບໍລິການສຸດພິເສດ",
    description: "ທີມງານມືອາຊີບຄອຍດູແລທ່ານ",
  },
  {
    url: "/images/view3.jpg",
    title: "ອາຫານທະເລສົດໃໝ່",
    description: "ລິ້ມລອງອາຫານທ້ອງຖິ່ນແສນອຮ່ອຍ",
  },
]);

const currentImageIndex = ref(0);
let intervalId = null;

// Auto slide functionality
const startAutoSlide = () => {
  intervalId = setInterval(() => {
    nextImage();
  }, 4000); // Change image every 4 seconds
};

const stopAutoSlide = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// Navigation functions
const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.value.length;
};

const previousImage = () => {
  currentImageIndex.value =
    currentImageIndex.value === 0
      ? images.value.length - 1
      : currentImageIndex.value - 1;
};

const goToImage = (index) => {
  currentImageIndex.value = index;
  // Restart auto slide when user manually navigates
  stopAutoSlide();
  setTimeout(startAutoSlide, 2000);
};

// Lifecycle
onMounted(() => {
  startAutoSlide();
});

onUnmounted(() => {
  stopAutoSlide();
});

// Pause auto slide on hover
const handleMouseEnter = () => {
  stopAutoSlide();
};

const handleMouseLeave = () => {
  startAutoSlide();
};
</script>

<style>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
