<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const router = useRouter();
const patientId = route.params.id as string;

const { fetchPatient } = usePatients();
const { fetchConsultationsForPatient, createConsultation } = useConsultations();

const patient = ref<Awaited<ReturnType<typeof fetchPatient>> | null>(null);
const consultations = ref<Awaited<ReturnType<typeof fetchConsultationsForPatient>>>([]);
const isLoading = ref(true);
const loadError = ref('');

const isCreatingConsultation = ref(false);

async function loadData() {
  isLoading.value = true;
  try {
    patient.value = await fetchPatient(patientId);
    consultations.value = await fetchConsultationsForPatient(patientId);
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Failed to load patient';
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadData);

async function handleNewConsultation() {
  isCreatingConsultation.value = true;
  try {
    const consultation = await createConsultation({
      patientId,
      occurredAt: new Date().toISOString(),
    });
    await router.push(`/consultations/${consultation.id}`);
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Failed to create consultation';
    isCreatingConsultation.value = false;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    UPLOADED: 'Awaiting audio',
    PROCESSING: 'Processing',
    READY_FOR_REVIEW: 'Ready for review',
    APPROVED: 'Approved',
    FAILED: 'Failed',
  };
  return labels[status] ?? status;
}
</script>

<template>
  <div class="page">
    <NuxtLink to="/dashboard" class="back-link">&larr; Back to patients</NuxtLink>

    <div v-if="isLoading">Loading...</div>

    <div v-else-if="loadError" class="error" role="alert">{{ loadError }}</div>

    <template v-else-if="patient">
      <header>
        <h1>{{ patient.lastName }}, {{ patient.firstName }}</h1>
        <p class="dob">DOB: {{ new Date(patient.dateOfBirth).toLocaleDateString() }}</p>
        <p v-if="patient.notes" class="notes">{{ patient.notes }}</p>
      </header>

      <div class="section-header">
        <h2>Consultations</h2>
        <button :disabled="isCreatingConsultation" @click="handleNewConsultation">
          {{ isCreatingConsultation ? 'Creating...' : '+ New Consultation' }}
        </button>
      </div>

      <p v-if="consultations.length === 0" class="empty">
        No consultations yet.
      </p>

      <ul v-else class="consultation-list">
        <li v-for="consultation in consultations" :key="consultation.id">
          <NuxtLink :to="`/consultations/${consultation.id}`">
            <span>{{ formatDate(consultation.occurredAt) }}</span>
            <span class="status" :class="consultation.status.toLowerCase()">
              {{ statusLabel(consultation.status) }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #2563eb;
  text-decoration: none;
  font-size: 0.9rem;
}

header {
  margin-bottom: 1.5rem;
}

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.4rem;
}

.dob {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.notes {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #fafafa;
  border-radius: 4px;
  font-size: 0.9rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

h2 {
  margin: 0;
  font-size: 1.1rem;
}

button {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty,
.error {
  color: #666;
}

.error {
  color: #dc2626;
}

.consultation-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.consultation-list a {
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

.status {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  background: #f0f0f0;
}

.status.ready_for_review {
  background: #dbeafe;
  color: #1e40af;
}

.status.approved {
  background: #dcfce7;
  color: #166534;
}

.status.failed {
  background: #fee2e2;
  color: #991b1b;
}
</style>