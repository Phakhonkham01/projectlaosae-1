<template>
  <div class="register-container">
    <div class="register-card">
      <!-- ຫົວ -->
      <div class="register-header">
        <div class="header-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
              fill="currentColor"
            />
            <path
              d="M12 14C7.03125 14 3 18.0312 3 23H21C21 18.0312 16.9688 14 12 14Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2 class="register-title">ສ້າຊີ</h2>
        <p class="register-subtitle">
          ເຂົ້າຮ່ວມກັບພວກເຮົາໃນມື້ນີ້ ແລ
        </p>
      </div>

      <!-- ແບບຟອມ -->
      <form @submit.prevent="register" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">ຊື່ຕົວຈິງ</label>
            <div class="input-wrapper">
              <input
                type="text"
                v-model="name"
                class="form-input"
                :class="{ error: errors.name }"
                placeholder="ໃສ່ຊື່ຕົວຈິງຂອງທ່ານ"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">ນາມສະກຸນ</label>
            <div class="input-wrapper">
              <input
                type="text"
                v-model="lastname"
                class="form-input"
                :class="{ error: errors.lastname }"
                placeholder="ໃສ່ນາມສະກຸນຂອງທ່ານ"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">ເບີໂທລະສັບ</label>
          <div class="input-wrapper">
            <div class="input-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 16.92V19.92C22 20.42 21.58 20.83 21.08 20.83C10.11 20.83 3.17 13.89 3.17 2.92C3.17 2.42 3.58 2 4.08 2H7.08C7.58 2 8 2.42 8 2.92C8 4.58 8.33 6.17 8.92 7.63C9.08 8 8.92 8.42 8.58 8.67L6.67 10.17C8.17 13.33 10.67 15.83 13.83 17.33L15.33 15.42C15.58 15.08 16 14.92 16.37 15.08C17.83 15.67 19.42 16 21.08 16C21.58 16 22 16.42 22 16.92Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <input
              type="tel"
              v-model="phone"
              class="form-input has-icon"
              :class="{ error: errors.phone }"
              placeholder="ໃສ່ເບີໂທລະສັບຂອງທ່ານ"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">ທີ່ຢູ່ອີເມວ</label>
          <div class="input-wrapper">
            <div class="input-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <polyline
                  points="22,6 12,13 2,6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <input
              type="email"
              v-model="email"
              class="form-input has-icon"
              :class="{ error: errors.email }"
              placeholder="ໃສ່ທີ່ຢູ່ອີເມວຂອງທ່ານ"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">ລະຫັດຜ່ານ</label>
          <div class="input-wrapper">
            <div class="input-icon">
              <svg
                width="18"
                height="18"
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
            </div>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              class="form-input has-icon has-toggle"
              :class="{ error: errors.password }"
              placeholder="ສ້າງລະຫັດຜ່ານທີ່ປອດໄພ"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              <svg
                v-if="!showPassword"
                width="18"
                height="18"
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
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 19.42 16.42L9.9 4.24Z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path d="M1 1L23 23" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>
          </div>
          <div class="password-strength">
            <div class="strength-bar">
              <div
                class="strength-fill"
                :class="passwordStrength.class"
                :style="{ width: passwordStrength.width }"
              ></div>
            </div>
            <span class="strength-text" :class="passwordStrength.class">
              {{ passwordStrength.text }}
            </span>
          </div>
        </div>

        <button
          type="submit"
          class="register-button"
          :class="{ loading: isLoading }"
          :disabled="isLoading"
        >
          <span v-if="!isLoading" class="button-content">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                cx="8.5"
                cy="7"
                r="4"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="20"
                y1="8"
                x2="20"
                y2="14"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="23"
                y1="11"
                x2="17"
                y2="11"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            ສ້າງບ
          </span>
          <div v-else class="loading-spinner"></div>
        </button>
      </form>

      <!-- ຂໍ້ຄວາມ -->
      <div v-if="errorMessage" class="message error-message">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="message success-message">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4905 2.02168 11.3363C2.16356 9.18206 2.99721 7.13214 4.39828 5.49688C5.79935 3.86162 7.69279 2.72851 9.79619 2.24974C11.8996 1.77098 14.1003 1.96382 16.07 2.8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <polyline
            points="22,4 12,14.01 9,11.01"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ successMessage }}
      </div>

      <!-- ສ່ວນລຸ່ມ -->
      <div class="register-footer">
        <p>
          ມີບັນຊີແລ້ວ?
          <NuxtLink to="/login" class="login-link">ເຂົ້າສູ່ລະບົບ</NuxtLink>
        </p>
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
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useFirebase } from "~/composables/useFirebase";

// ເລີ່ມຕົ້ນ Firebase
const { db } = useFirebase();
const auth = getAuth();

// ຟີລທີ່ແບບຟອມທີ່ມີປະຕິກິລິຍາ
const name = ref("");
const lastname = ref("");
const phone = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);
const errors = ref({});

// ການຄຳນວນຄວາມແຂງແຮງຂອງລະຫັດຜ່ານ
const passwordStrength = computed(() => {
  const pwd = password.value;
  if (!pwd) return { width: "0%", class: "", text: "" };

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 2) return { width: "33%", class: "weak", text: "ອ່ອນ" };
  if (score <= 3) return { width: "66%", class: "medium", text: "ປານກາງ" };
  return { width: "100%", class: "strong", text: "ແຂງແຮງ" };
});

// ການກວດສອບແບບຟອມ
const validateForm = () => {
  errors.value = {};

  if (!name.value.trim()) errors.value.name = true;
  if (!lastname.value.trim()) errors.value.lastname = true;
  if (!phone.value.trim()) errors.value.phone = true;
  if (!email.value.trim() || !/\S+@\S+\.\S+/.test(email.value))
    errors.value.email = true;
  if (!password.value || password.value.length < 6)
    errors.value.password = true;

  return Object.keys(errors.value).length === 0;
};

// ຟັງຊັນສະໝັກສະມາຊິກ
const register = async () => {
  if (!validateForm()) {
    errorMessage.value = "ກະລຸນາໃສ່ຂໍ້ມູນທັງໝົດໃຫ້ຖືກຕ້ອງ";
    return;
  }

  errorMessage.value = "";
  successMessage.value = "";
  isLoading.value = true;

  try {
    // 1. ສ້າງຜູ້ໃຊ້ໃນ Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const user = userCredential.user;

    // 2. ບັນທຶກຂໍ້ມູນຜູ້ໃຊ້ເພີ່ມເຕີມໄປຫາ Firestore ດ້ວຍບົດບາດທີ່ກຳນົດໃຫ້ອັດຕະໂນມັດ
    await setDoc(doc(db, "Users", user.uid), {
      name: name.value,
      lastname: lastname.value,
      phone_number: phone.value,
      email: email.value,
      uid: user.uid,
      role: "admin", // ກຳນົດບົດບາດເປັນ "user" ໂດຍອັດຕະໂນມັດ
      created_at: new Date().toISOString(),
    });

    successMessage.value = `ຍິນດີຕ້ອນຮັບ ${name.value}! ບັນຊີຂອງທ່ານໄດ້ຖືກສ້າງສຳເລັດແລ້ວ`;

    // ລຶບແບບຟອມ
    name.value = "";
    lastname.value = "";
    phone.value = "";
    email.value = "";
    password.value = "";

    // ທາງເລືອກ: ເປີດໄປຫາການເຂົ້າສູ່ລະບົບ ຫຼື dashboard ຫຼັງຈາກສະໝັກສຳເລັດ
    // await navigateTo('/login');
  } catch (error) {
    console.error("ຜິດພາດການສະໝັກສະມາຊິກ:", error);
    errorMessage.value = getErrorMessage(error.code);
  } finally {
    isLoading.value = false;
  }
};

// ຂໍ້ຄວາມຜິດພາດທີ່ເປັນມິດກັບຜູ້ໃຊ້
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "ອີເມວນີ້ໄດ້ລົງທະບຽນແລ້ວ ກະລຸນາໃຊ້ອີເມວອື່ນ ຫຼື ເຂົ້າສູ່ລະບົບ";
    case "auth/weak-password":
      return "ລະຫັດຜ່ານອ່ອນເກີນໄປ ກະລຸນາໃຊ້ຢ່າງຫນ້ອຍ 6 ຕົວອັກສອນ";
    case "auth/invalid-email":
      return "ກະລຸນາໃສ່ທີ່ຢູ່ອີເມວທີ່ຖືກຕ້ອງ";
    case "auth/network-request-failed":
      return "ຜິດພາດເຄືອຂ່າຍ ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ ແລະ ລອງໃໝ່";
    default:
      return "ເກີດຂໍ້ຜິດພາດໃນລະຫວ່າງການສະໝັກສະມາຊິກ ກະລຸນາລອງໃໝ່";
  }
};
</script>
<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.register-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  animation: slideUp 0.6s ease-out;
}

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

.register-header {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  padding: 40px 32px;
  text-align: center;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  backdrop-filter: blur(10px);
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.register-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.register-form {
  padding: 32px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f9fafb;
  box-sizing: border-box;
}

.form-input.has-icon {
  padding-left: 48px;
}

.form-input.has-toggle {
  padding-right: 48px;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #4f46e5;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.strong {
  background: #10b981;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
}

.strength-text.weak {
  color: #ef4444;
}

.strength-text.medium {
  color: #f59e0b;
}

.strength-text.strong {
  color: #10b981;
}

.register-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
}

.register-button:active {
  transform: translateY(0);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin: 20px 32px 0;
  font-weight: 500;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.success-message {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.register-footer {
  padding: 24px 32px 32px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
}

.register-footer p {
  margin: 0;
  color: #6b7280;
}

.login-link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #3b82f6;
}

@media (max-width: 640px) {
  .register-container {
    padding: 10px;
  }

  .register-header {
    padding: 32px 24px;
  }

  .register-form {
    padding: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .register-title {
    font-size: 24px;
  }

  .message {
    margin: 20px 24px 0;
  }

  .register-footer {
    padding: 20px 24px 24px;
  }
}
</style>
