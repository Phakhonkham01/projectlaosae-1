<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center"
    style="background-image: url('/images/view.jpg')"
  >
    <!-- Background overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-blue-600/300 to-indigo-800/30"
    ></div>

    <!-- Background decorative elements -->
    <div
      class="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"
    ></div>
    <div
      class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
      style="animation-delay: 1000ms"
    ></div>

    <div class="w-full max-w-md relative z-10">
      <div
        class="bg-white/7 backdrop-blur-xl shadow-2xl overflow-hidden border border-white/20 animate-[slideUp_0.6s_ease-out]"
      >
        <!-- Header -->
        <NuxtLink to="/">
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
              <span>ໜ້າແລກ</span>
            </div>
          </button>
        </NuxtLink>
        <div
          class="text-center p-8 pb-6 bg-gradient-to-r relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
          ></div>
          <div class="relative z-10">
            <div
              class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30 animate-pulse"
              style="animation-duration: 2s"
            >
              <svg
                width="36"
                height="36"
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
            <h1 class="text-2xl font-bold mb-2 text-white">🚢 ທ່ຽວທະເລລ</h1>
            <p class="text-blue-100 text-sm opacity-90">
              ຍິນດີຕ້ອນຮັບສູ່ການຜະຈົນໄພຂອງທ່ານ
            </p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="login" class="p-8 space-y-6">
          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-white mb-2"
              >ທີ່ຢູ່ອີເມວ</label
            >
            <div
              :class="[
                'relative flex items-center bg-gray-50 border-2 rounded-xl transition-all duration-300 focus-within:bg-white group',
                emailFocused
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-white'
                  : 'border-gray-200',
                emailError ? 'border-red-500 bg-red-50' : '',
              ]"
            >
              <svg
                :class="[
                  'ml-4 transition-colors duration-300',
                  emailFocused ? 'text-blue-500' : 'text-gray-400',
                  emailError ? 'text-red-500' : '',
                ]"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <polyline
                  points="22,6 12,13 2,6"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <input
                type="email"
                id="email"
                v-model="email"
                @focus="emailFocused = true"
                @blur="
                  emailFocused = false;
                  validateEmail();
                "
                @input="emailError = false"
                placeholder="ໃສ່ອີເມວຂອງທ່ານ"
                required
                autocomplete="email"
                class="flex-1 px-4 py-3 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm"
              />
            </div>
            <span
              v-if="emailError"
              class="text-red-500 text-xs mt-1 block animate-[shake_0.5s_ease-in-out]"
            >
              ກະລຸນາໃສ່ທີ່ຢູ່ອີເມວທີ່ຖືກຕ້ອງ
            </span>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label
              for="password"
              class="block text-sm font-medium text-white mb-2"
              >ລະຫັດຜ່ານ</label
            >
            <div
              :class="[
                'relative flex items-center bg-gray-50 border-2 rounded-xl transition-all duration-300 focus-within:bg-white group',
                passwordFocused
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-white'
                  : 'border-gray-200',
              ]"
            >
              <svg
                :class="[
                  'ml-4 transition-colors duration-300',
                  passwordFocused ? 'text-blue-500' : 'text-gray-400',
                ]"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
                <path
                  d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                @focus="passwordFocused = true"
                @blur="passwordFocused = false"
                placeholder="ໃສ່ລະຫັດຜ່ານຂອງທ່ານ"
                required
                autocomplete="current-password"
                class="flex-1 px-4 py-3 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                :aria-label="
                  showPassword ? 'ເຊື່ອງລະຫັດຜ່ານ' : 'ສະແດງລະຫັດຜ່ານ'
                "
                class="mr-3 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
              >
                <svg
                  v-if="!showPassword"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                <svg
                  v-else
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 4.028 7.66607 6.17 6.17M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4282 14.7056 10.0887 14.481 9.80385 14.1962C9.51897 13.9113 9.29439 13.5718 9.14351 13.1984C8.99262 12.8251 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path d="M1 1L23 23" stroke="currentColor" stroke-width="2" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center cursor-pointer group">
              <div class="relative">
                <input type="checkbox" v-model="rememberMe" class="sr-only" />
                <div
                  :class="
                    rememberMe
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-gray-200 border-gray-300'
                  "
                  class="w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center"
                >
                  <svg
                    v-if="rememberMe"
                    class="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
              <span
                class="ml-2 text-sm text-white group-hover:text-gray-900 transition-colors duration-200"
                >ຈື່ຂ້ອຍໄວ້</span
              >
            </label>
            <!-- Forgot Password Link - Commented out as in original -->
            <!-- <a
              href="#"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline"
              @click.prevent="$emit('forgot-password')"
            >
              ລືມລະຫັດຜ່ານ?
            </a> -->
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-[shake_0.5s_ease-in-out]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="text-red-500 flex-shrink-0"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="15"
                y1="9"
                x2="9"
                y2="15"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="9"
                y1="9"
                x2="15"
                y2="15"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            <span class="text-sm">{{ errorMessage }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            :class="
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
            "
            class="w-full py-4 px-6 text-white font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="!loading" class="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H15"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <polyline
                  points="10,17 15,12 10,7"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <line
                  x1="15"
                  y1="12"
                  x2="21"
                  y2="12"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              ເຂົ້າສູ່ລະບົບ
            </span>
            <span v-else class="flex items-center gap-2">
              <div
                class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              ກຳລັງເຂົ້າສູ່ລະບົບ...
            </span>
          </button>
        </form>

        <!-- Footer -->
        <div class="px-8 pb-8 text-center space-y-4">
          <p class="text-white text-sm">
            ໃໝ່ກັບທຽວທະເລລາວ?
            <NuxtLink
              to="registers/register_user"
              class="text-blue-100 hover:text-blue-800 font-medium hover:underline transition-colors duration-200"
              >ສ້າງບັນຊີ
            </NuxtLink>
          </p>
          <div class="text-center">
            <small class="text-white text-xs block leading-relaxed">
              🌊 ຄົ້ນພົບຄວາມງາມຂອງທະເລລາວດ້ວຍເຮືອນຳທ່ຽວ
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "empty1",
  prerender: false, // ⛔ ບໍ່ພະຍາຍາມ prerender ຫນ້າເຂົ້າສູ່ລະບົບທີ່ມີການປ່ຽນແປງນີ້
});

import { ref, onMounted } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "@/composables/useFirebase";

const { auth, db } = useFirebase();

// ✅ ສະຖານະຂໍ້ມູນການປ້ອນ
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const errorMessage = ref("");
const loading = ref(false);

// ✅ ສະຖານະ UI
const emailFocused = ref(false);
const passwordFocused = ref(false);
const showPassword = ref(false);
const emailError = ref(false);

// ✅ Cookies - ໃຊ້ຊື່ທີ່ສອດຄ່ອງກັນ
const cookieEmail = useCookie("userEmail", {
  maxAge: 60 * 60 * 24 * 7,
  default: () => "",
});

const cookieRemember = useCookie("rememberMe", {
  maxAge: 60 * 60 * 24 * 7,
  default: () => false,
});

// ✅ ການກວດສອບອີເມວ
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailError.value = email.value && !emailRegex.test(email.value);
  return !emailError.value;
};

// ✅ ລຶບຂໍ້ຄວາມຜິດພາດ
const clearErrors = () => {
  errorMessage.value = "";
  emailError.value = false;
};

// ✅ ໄດ້ຮັບບົດບາດຜູ້ໃຊ້ຈາກ Firestore
const getUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "Users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || "user"; // ຄ່າເລີ່ມຕົ້ນເປັນ "user" ຖ້າບໍ່ມີການລະບຸບົດບາດ
    }
    return "user"; // ບົດບາດເລີ່ມຕົ້ນຖ້າເອກະສານບໍ່ມີຢູ່
  } catch (error) {
    console.error("ຜິດພາດໃນການດຶງບົດບາດຜູ້ໃຊ້:", error);
    return "user"; // ບົດບາດເລີ່ມຕົ້ນເມື່ອເກີດຜິດພາດ
  }
};

// ✅ ຟັງຊັນເຂົ້າສູ່ລະບົບຫຼັກ
const login = async () => {
  console.log("🔍 ເລີ່ມຂະບວນການເຂົ້າສູ່ລະບົບ...");

  // ລຶບຄວາມຜິດພາດທີ່ຜ່ານມາ
  clearErrors();

  // ກວດສອບຮູບແບບອີເມວ
  if (!validateEmail()) {
    errorMessage.value = "ກະລຸນາໃສ່ອີເມວທີ່ຖືກຕ້ອງ";
    return;
  }

  // ກວດສອບວ່າມີລະຫັດຜ່ານຫຼືບໍ່
  if (!password.value || password.value.trim() === "") {
    errorMessage.value = "ກະລຸນາໃສ່ລະຫັດຜ່ານ";
    return;
  }

  loading.value = true;

  try {
    // ເຂົ້າສູ່ລະບົບດ້ວຍ Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );

    const user = userCredential.user;
    console.log("✅ ເຂົ້າສູ່ລະບົບສຳເລັດສຳລັບ:", user.email);

    // ✅ ໄດ້ຮັບບົດບາດຜູ້ໃຊ້ຈາກ Firestore
    const userRole = await getUserRole(user.uid);
    console.log("✅ ບົດບາດຜູ້ໃຊ້:", userRole);

    // ✅ ຕັ້ງ cookie ອີເມວຜູ້ໃຊ້ສຳລັບເຊດຊັນປະຈຸບັນສະເໝີ
    cookieEmail.value = user.email;

    // ✅ ຕັ້ງຄ່າການຈື່ຂ້ອຍໄວ້
    cookieRemember.value = rememberMe.value;

    // ✅ ຖ້າຈື່ຂ້ອຍໄວ້ບໍ່ໄດ້ເລືອກ, ຕັ້ງເວລາໝົດອາຍຸສັ້ນ
    if (!rememberMe.value) {
      // ຕັ້ງ cookie ໃຫ້ໝົດອາຍຸເມື່ອເຊດຊັນ browser ສິ້ນສຸດ
      const sessionCookie = useCookie("userEmail", {
        maxAge: undefined, // Session cookie
      });
      sessionCookie.value = user.email;
    }

    console.log("✅ ຕັ້ງ cookies ສຳເລັດແລ້ວ");
    console.log("- Email cookie:", cookieEmail.value);
    console.log("- ຈື່ຂ້ອຍໄວ້:", cookieRemember.value);

    // ✅ ນຳທາງໂດຍອີງຕາມບົດບາດຜູ້ໃຊ້
    if (userRole === "admin") {
      console.log("✅ ກຳລັງເປີດໄປຫາ dashboard ແອດມິນ...");
      await navigateTo("/admin/dashboard/");
    } else {
      console.log("✅ ກຳລັງເປີດໄປຫາຫນ້າຈອງ...");
      await navigateTo(
        `/booking/Choose_a_booking`
        // `/booking/Choose_a_booking/?user=${encodeURIComponent(user.email)}`
      );
    }
  } catch (error) {
    console.error("❌ ຜິດພາດການເຂົ້າສູ່ລະບົບ:", error);

    // ຈັດການປະເພດຄວາມຜິດພາດທີ່ແຕກຕ່າງກັນ
    let friendlyMessage = "ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ ກະລຸນາກວດສອບຂໍ້ມູນ";

    switch (error.code) {
      case "auth/user-not-found":
        friendlyMessage = "ບໍ່ພົບບັນຊີທີ່ມີອີເມວນີ້";
        break;
      case "auth/wrong-password":
        friendlyMessage = "ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ";
        break;
      case "auth/invalid-email":
        friendlyMessage = "ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ";
        break;
      case "auth/too-many-requests":
        friendlyMessage =
          "ພະຍາຍາມເຂົ້າສູ່ລະບົບຫຼາຍເທື່ອເກີນໄປ ກະລຸນາລອງໃໝ່ພາຍຫຼັງ";
        break;
      case "auth/network-request-failed":
        friendlyMessage = "ເກີດຂໍ້ຜິດພາດເຄືອຂ່າຍ ກະລຸນາກວດສອບການເຊື່ອມຕໍ່";
        break;
      case "auth/user-disabled":
        friendlyMessage = "ບັນຊີນີ້ຖືກປິດການນຳໃຊ້";
        break;
      case "auth/invalid-credential":
        friendlyMessage = "ຂໍ້ມູນການເຂົ້າສູ່ລະບົບບໍ່ຖືກຕ້ອງ";
        break;
    }

    errorMessage.value = friendlyMessage;
  } finally {
    loading.value = false;
  }
};

// ✅ ຈັດການການສົ່ງແບບຟອມ
const handleSubmit = (event) => {
  event.preventDefault();
  login();
};

// ✅ ໂຫຼດຂໍ້ມູນປະຈຳຕົວທີ່ບັນທຶກໄວ້ເມື່ອ mount
onMounted(() => {
  console.log("🔍 ຫນ້າເຂົ້າສູ່ລະບົບໄດ້ mount ແລ້ວ");

  // ໂຫຼດອີເມວທີ່ບັນທຶກໄວ້ຖ້າມີການເລືອກຈື່ຂ້ອຍໄວ້
  if (cookieRemember.value && cookieEmail.value) {
    email.value = cookieEmail.value;
    rememberMe.value = true;
    console.log("✅ ໂຫຼດອີເມວທີ່ບັນທຶກໄວ້:", email.value);
  }

  // ເປົ້າໃສ່ຊ່ອງອີເມວ
  setTimeout(() => {
    const emailInput = document.getElementById("email");
    if (emailInput) {
      emailInput.focus();
    }
  }, 100);
});

// ✅ ຈັດການການປ່ຽນແປງ input
const handleEmailInput = () => {
  emailError.value = false;
  if (errorMessage.value) {
    errorMessage.value = "";
  }
};

const handlePasswordInput = () => {
  if (errorMessage.value) {
    errorMessage.value = "";
  }
};

// ✅ ສະຫຼັບການເບິ່ງເຫັນລະຫັດຜ່ານ
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// ✅ ຈັດການລືມລະຫັດຜ່ານ
const handleForgotPassword = () => {
  // ທ່ານສາມາດຈັດການ password reset ໄດ້ທີ່ນີ້
  alert("ການຣີເຊັດລະຫັດຜ່ານຈະມີໃນເວີຊັນຕໍ່ໄປ");
};

// ✅ ຈັດການສະໝັກສະມາຊິກ
const handleSignUp = () => {
  // ນຳທາງໄປຫນ້າສະໝັກສະມາຊິກ
  navigateTo("/register");
};

// ✅ ຟັງຊັນ debug
const debugLogin = () => {
  console.log("🔍 ຂໍ້ມູນ debug ການເຂົ້າສູ່ລະບົບ:");
  console.log("- ອີເມວ:", email.value);
  console.log("- ຄວາມຍາວລະຫັດຜ່ານ:", password.value.length);
  console.log("- ຈື່ຂ້ອຍໄວ້:", rememberMe.value);
  console.log("- Cookie ອີເມວ:", cookieEmail.value);
  console.log("- Cookie ຈື່ໄວ້:", cookieRemember.value);
};

// ✅ ເປີດເຜີຍຟັງຊັນສຳລັບການໃຊ້ໃນ template
defineExpose({
  login,
  handleSubmit,
  handleForgotPassword,
  handleSignUp,
  debugLogin,
});
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
</style>
