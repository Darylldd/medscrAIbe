<script setup lang="ts">
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);

const authStore = useAuthStore();
const router = useRouter();

async function handleSubmit() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    await authStore.login(email.value, password.value);
    await router.push('/dashboard');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Login failed';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-form" @submit.prevent="handleSubmit">
      <h1>MedScribe AI</h1>
      <p class="subtitle">Sign in to your account</p>

      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
      />

      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        autocomplete="current-password"
      />

      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0 0 1rem;
  color: #666;
  font-size: 0.9rem;
}

label {
  font-size: 0.85rem;
  font-weight: 500;
}

input {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

input:focus {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
}

.error {
  color: #dc2626;
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

button {
  margin-top: 0.5rem;
  padding: 0.7rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>