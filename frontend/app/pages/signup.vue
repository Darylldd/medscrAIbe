<script setup lang="ts">
const firstName = ref('');
const lastName = ref('');
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
    const { request } = useApi();
    await request('/auth/signup', {
      method: 'POST',
      body: {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
      },
    });

    await authStore.login(email.value, password.value);
    await router.push('/dashboard');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Signup failed';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="signup-page">
    <form class="signup-form" @submit.prevent="handleSubmit">
      <h1>MedScribe AI</h1>
      <p class="subtitle">Create your account</p>

      <div class="name-row">
        <div>
          <label for="firstName">First name</label>
          <input id="firstName" v-model="firstName" required autocomplete="given-name" />
        </div>
        <div>
          <label for="lastName">Last name</label>
          <input id="lastName" v-model="lastName" required autocomplete="family-name" />
        </div>
      </div>

      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" required autocomplete="email" />

      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        minlength="10"
        autocomplete="new-password"
      />
      <p class="hint">At least 10 characters</p>

      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating account...' : 'Create account' }}
      </button>

      <p class="login-link">
        Already have an account? <NuxtLink to="/login">Sign in</NuxtLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
.signup-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 1.5rem;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 400px;
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

.name-row {
  display: flex;
  gap: 1rem;
}

.name-row > div {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.hint {
  font-size: 0.8rem;
  color: #888;
  margin: -0.25rem 0 0.5rem;
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

.login-link {
  text-align: center;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: #666;
}

.login-link a {
  color: #2563eb;
  text-decoration: none;
}
</style>