<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="dashboard">
    <header>
      <h1>MedScribe AI</h1>
      <div class="user-info">
        <span v-if="authStore.user">
          Dr. {{ authStore.user.firstName }} {{ authStore.user.lastName }}
        </span>
        <button @click="handleLogout">Sign out</button>
      </div>
    </header>

    <main>
      <p>Dashboard content — patient list and consultation history will go here.</p>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e5e5;
}

h1 {
  font-size: 1.25rem;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

button {
  padding: 0.4rem 0.9rem;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

button:hover {
  background: #f5f5f5;
}

main {
  padding: 1.5rem;
  color: #666;
}
</style>