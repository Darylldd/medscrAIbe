interface Consultation {
  id: string;
  status: string;
  occurredAt: string;
  patientId: string;
}

interface CreateConsultationInput {
  patientId: string;
  occurredAt: string;
}

export function useConsultations() {
  const { request } = useApi();
  const authStore = useAuthStore();

  async function fetchConsultationsForPatient(patientId: string): Promise<Consultation[]> {
    return request<Consultation[]>(`/consultations?patientId=${patientId}`, {
      token: authStore.accessToken!,
    });
  }

  async function fetchConsultation(id: string): Promise<Consultation> {
    return request<Consultation>(`/consultations/${id}`, {
      token: authStore.accessToken!,
    });
  }

  async function createConsultation(input: CreateConsultationInput): Promise<Consultation> {
    return request<Consultation>('/consultations', {
      method: 'POST',
      body: input,
      token: authStore.accessToken!,
    });
  }

  return { fetchConsultationsForPatient, fetchConsultation, createConsultation };
}