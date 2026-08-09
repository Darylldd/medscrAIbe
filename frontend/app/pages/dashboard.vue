<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const authStore = useAuthStore();
const router = useRouter();
const { fetchPatients } = usePatients();

const patients = ref<Awaited<ReturnType<typeof fetchPatients>>>([]);
const isLoading = ref(true);
const loadError = ref('');

onMounted(async () => {
  try {
    patients.value = await fetchPatients();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Failed to load patients';
  } finally {
    isLoading.value = false;
  }
});

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

function formatDob(dob: string): string {
  return new Date(dob).toLocaleDateString();
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
      <h2>Patients</h2>

      <p v-if="isLoading">Loading patients...</p>

      <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>

      <p v-else-if="patients.length === 0" class="empty">
        No patients yet.
      </p>

      <ul v-else class="patient-list">
        <li v-for="patient in patients" :key="patient.id">
          <NuxtLink :to="`/patients/${patient.id}`">
            {{ patient.lastName }}, {{ patient.firstName }}
            <span class="dob">DOB: {{ formatDob(patient.dateOfBirth) }}</span>
          </NuxtLink>
        </li>
      </ul>
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
  max-width: 640px;
  margin: 0 auto;
}

h2 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.empty,
.error {
  color: #666;
}

.error {
  color: #dc2626;
}

.patient-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.patient-list a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.1rem;
  background: white;
  border-radius: 6px;
  text-decoration: none;
  color: #111;
  border: 1px solid #e5e5e5;
}

.patient-list a:hover {
  border-color: #2563eb;
}

.dob {
  font-size: 0.85rem;
  color: #666;
}
</style>