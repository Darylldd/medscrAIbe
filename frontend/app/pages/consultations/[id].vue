<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const consultationId = route.params.id as string;
const config = useRuntimeConfig();
const authStore = useAuthStore();

const { fetchConsultation } = useConsultations();
const { fetchLatestSoapNote, fetchAllSoapNoteVersions, approveSoapNote } = useSoapNotes();


const consultation = ref<Awaited<ReturnType<typeof fetchConsultation>> | null>(null);
const soapNote = ref<Awaited<ReturnType<typeof fetchLatestSoapNote>> | null>(null);
const isLoading = ref(true);
const loadError = ref('');

const selectedFile = ref<File | null>(null);
const isUploading = ref(false);
const uploadError = ref('');

let pollInterval: ReturnType<typeof setInterval> | null = null;

async function loadConsultation() {
  try {
    consultation.value = await fetchConsultation(consultationId);

    if (consultation.value.status === 'READY_FOR_REVIEW' || consultation.value.status === 'APPROVED') {
      soapNote.value = await fetchLatestSoapNote(consultationId);
      allVersions.value = await fetchAllSoapNoteVersions(consultationId);
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Failed to load consultation';
  } finally {
    isLoading.value = false;
  }
}

const isApproving = ref(false);
const showApproveConfirm = ref(false);

async function handleApprove() {
  isApproving.value = true;
  try {
    await approveSoapNote(consultationId);
    showApproveConfirm.value = false;
    await loadConsultation();
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : 'Failed to approve note';
  } finally {
    isApproving.value = false;
  }
}

const allVersions = ref<Awaited<ReturnType<typeof fetchAllSoapNoteVersions>>>([]);
const selectedVersionId = ref<string | null>(null);

const displayedNote = computed(() => {
  if (!selectedVersionId.value) return soapNote.value;
  return allVersions.value.find((v) => v.id === selectedVersionId.value) ?? soapNote.value;
});

onMounted(async () => {
  await loadConsultation();

  if (consultation.value?.status === 'PROCESSING') {
    startPolling();
  }
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

function startPolling() {
  pollInterval = setInterval(async () => {
    await loadConsultation();
    if (consultation.value?.status !== 'PROCESSING') {
      if (pollInterval) clearInterval(pollInterval);
    }
  }, 3000);
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  selectedFile.value = target.files?.[0] ?? null;
}

async function handleUpload() {
  if (!selectedFile.value) return;

  uploadError.value = '';
  isUploading.value = true;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    const response = await fetch(
      `${config.public.apiBaseUrl}/consultations/${consultationId}/audio`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${authStore.accessToken}` },
        body: formData,
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(body.message ?? 'Upload failed');
    }

    await triggerProcessing();
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : 'Upload failed';
  } finally {
    isUploading.value = false;
  }
}

async function triggerProcessing() {
  await fetch(`${config.public.apiBaseUrl}/documentation-engine/process/${consultationId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authStore.accessToken}` },
  });

  await loadConsultation();
  startPolling();
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
    <NuxtLink v-if="consultation" :to="`/patients/${consultation.patientId}`" class="back-link">
      &larr; Back to patient
    </NuxtLink>

    <div v-if="isLoading">Loading...</div>

    <div v-else-if="loadError" class="error" role="alert">{{ loadError }}</div>

    <template v-else-if="consultation">
      <h1>Consultation</h1>
      <p class="status-line">Status: {{ statusLabel(consultation.status) }}</p>

      <div v-if="consultation.status === 'UPLOADED'" class="upload-section">
        <h2>Upload consultation audio</h2>
        <input type="file" accept="audio/*" @change="handleFileSelect" />
        <p v-if="uploadError" class="error" role="alert">{{ uploadError }}</p>
        <button :disabled="!selectedFile || isUploading" @click="handleUpload">
          {{ isUploading ? 'Uploading...' : 'Upload & Process' }}
        </button>
      </div>

      <div v-else-if="consultation.status === 'PROCESSING'" class="processing">
        <p>Processing recording — this usually takes a moment.</p>
      </div>

      <div v-else-if="consultation.status === 'FAILED'" class="error-section">
        <p role="alert">Processing failed for this consultation. Please contact support or try again with a new recording.</p>
      </div>

      <div v-else-if="soapNote" class="soap-review">
        <p class="draft-notice">
          Draft — generated by AI, version {{ soapNote.version }}. Review carefully before relying on this note.
        </p>
<div v-if="consultation.status === 'READY_FOR_REVIEW'" class="approve-section">
  <button v-if="!showApproveConfirm" class="approve-btn" @click="showApproveConfirm = true">
    Approve Note
  </button>

  <div v-else class="confirm-approve">
    <p>Approving finalizes this note as the medical record. This action cannot be undone.</p>
    <button class="secondary" @click="showApproveConfirm = false">Cancel</button>
    <button class="approve-btn" :disabled="isApproving" @click="handleApprove">
      {{ isApproving ? 'Approving...' : 'Confirm Approval' }}
    </button>
  </div>
</div>

<p v-if="consultation.status === 'APPROVED'" class="approved-notice">
  ✓ This note has been approved and is now the final medical record.
</p>
<div v-if="allVersions.length > 1" class="version-selector">
  <label for="version">Viewing version:</label>
  <select id="version" v-model="selectedVersionId">
    <option :value="null">Latest (v{{ soapNote?.version }})</option>
    <option v-for="v in allVersions" :key="v.id" :value="v.id">
      Version {{ v.version }} — {{ new Date(v.createdAt).toLocaleString() }}
    </option>
  </select>
</div>
       <section>
  <h3>Subjective</h3>
  <p>{{ displayedNote?.subjectiveContent || '(No content generated)' }}</p>
  <p v-if="displayedNote?.subjectiveNotMentioned.length" class="not-mentioned">
    Not mentioned: {{ displayedNote.subjectiveNotMentioned.join(', ') }}
  </p>
</section>

<section>
  <h3>Objective</h3>
  <p>{{ displayedNote?.objectiveContent || '(No content generated)' }}</p>
  <p v-if="displayedNote?.objectiveNotMentioned.length" class="not-mentioned">
    Not mentioned: {{ displayedNote.objectiveNotMentioned.join(', ') }}
  </p>
</section>

<section>
  <h3>Assessment</h3>
  <p>{{ displayedNote?.assessmentContent || '(No content generated)' }}</p>
  <p v-if="displayedNote?.assessmentNotMentioned.length" class="not-mentioned">
    Not mentioned: {{ displayedNote.assessmentNotMentioned.join(', ') }}
  </p>
</section>

<section>
  <h3>Plan</h3>
  <p>{{ displayedNote?.planContent || '(No content generated)' }}</p>
  <p v-if="displayedNote?.planNotMentioned.length" class="not-mentioned">
    Not mentioned: {{ displayedNote.planNotMentioned.join(', ') }}
  </p>
</section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 700px;
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

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.4rem;
}

.status-line {
  color: #666;
  margin: 0 0 1.5rem;
}

.upload-section,
.processing,
.error-section {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 1.5rem;
}

.upload-section h2 {
  margin-top: 0;
  font-size: 1.05rem;
}

.upload-section input {
  display: block;
  margin: 1rem 0;
}

.upload-section button {
  padding: 0.6rem 1.2rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-section button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
}

.draft-notice {
  background: #fef9c3;
  color: #713f12;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.soap-review section {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.soap-review h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #1e40af;
}

.soap-review p {
  margin: 0.25rem 0;
  line-height: 1.5;
}

.not-mentioned {
  font-size: 0.85rem;
  color: #92400e;
  font-style: italic;
}

.approve-section {
  margin-bottom: 1.25rem;
}

.approve-btn {
  padding: 0.6rem 1.2rem;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.approve-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-approve {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 1rem;
}

.confirm-approve p {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #991b1b;
}

.confirm-approve button {
  margin-right: 0.5rem;
}

.approved-notice {
  background: #dcfce7;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.25rem;
}
.version-selector {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.version-selector select {
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>