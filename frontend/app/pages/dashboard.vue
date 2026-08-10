<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const authStore = useAuthStore();
const router = useRouter();
const { fetchPatients, createPatient } = usePatients();
const { fetchPendingReview } = useConsultations();

const patients = ref<Awaited<ReturnType<typeof fetchPatients>>>([]);
const pendingReview = ref<Awaited<ReturnType<typeof fetchPendingReview>>>([]);
const isLoading = ref(true);
const loadError = ref('');

const showNewPatientForm = ref(false);
const newFirstName = ref('');
const newLastName = ref('');
const newDob = ref('');
const isCreating = ref(false);
const createError = ref('');


async function loadPatients() {
  isLoading.value = true;
  try {
    patients.value = await fetchPatients();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Failed to load patients';
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadPatients);
async function loadDashboard() {
  isLoading.value = true;
  try {
    const [patientsResult, pendingResult] = await Promise.all([
      fetchPatients(),
      fetchPendingReview(),
    ]);
    patients.value = patientsResult;
    pendingReview.value = pendingResult;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Failed to load dashboard';
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadDashboard);

async function handleCreatePatient() {
  createError.value = '';
  isCreating.value = true;

  try {
    await createPatient({
      firstName: newFirstName.value,
      lastName: newLastName.value,
      dateOfBirth: newDob.value,
    });

    newFirstName.value = '';
    newLastName.value = '';
    newDob.value = '';
    showNewPatientForm.value = false;

    await loadPatients();
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'Failed to create patient';
  } finally {
    isCreating.value = false;
  }
}

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
   <section v-if="pendingReview.length > 0" class="pending-section">
  <h2>Awaiting Review ({{ pendingReview.length }})</h2>
  <ul class="pending-list">
    <li v-for="item in pendingReview" :key="item.id">
      <NuxtLink :to="`/consultations/${item.id}`">
        <span>{{ item.patient?.lastName }}, {{ item.patient?.firstName }}</span>
        <span class="date">{{ new Date(item.occurredAt).toLocaleDateString() }}</span>
      </NuxtLink>
    </li>
  </ul>
</section>
  <div class="section-header">
    <h2>Patients</h2>
    <button v-if="!showNewPatientForm" @click="showNewPatientForm = true">
      + New Patient
    </button>
  </div>

  <form v-if="showNewPatientForm" class="new-patient-form" @submit.prevent="handleCreatePatient">
    <div class="form-row">
      <div>
        <label for="firstName">First name</label>
        <input id="firstName" v-model="newFirstName" required />
      </div>
      <div>
        <label for="lastName">Last name</label>
        <input id="lastName" v-model="newLastName" required />
      </div>
    </div>
    <label for="dob">Date of birth</label>
    <input id="dob" v-model="newDob" type="date" required />

    <p v-if="createError" class="error" role="alert">{{ createError }}</p>

    <div class="form-actions">
      <button type="button" class="secondary" @click="showNewPatientForm = false">Cancel</button>
      <button type="submit" :disabled="isCreating">
        {{ isCreating ? 'Creating...' : 'Create Patient' }}
      </button>
    </div>
  </form>

  <p v-if="isLoading">Loading patients...</p>

  <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>

  <p v-else-if="patients.length === 0" class="empty">
    No patients yet. Create one to get started.
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
.pending-section {
  margin-bottom: 2rem;
}

.pending-section h2 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.pending-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pending-list a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.1rem;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 6px;
  text-decoration: none;
  color: #111;
}

.pending-list .date {
  font-size: 0.85rem;
  color: #92400e;
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
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
}

.new-patient-form {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row > div {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.new-patient-form label {
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.new-patient-form input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.form-actions button.secondary {
  background: white;
  color: #333;
  border: 1px solid #ccc;
}
</style>