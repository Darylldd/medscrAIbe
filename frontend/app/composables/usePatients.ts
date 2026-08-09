interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  notes: string | null;
  isArchived: boolean;
}

interface CreatePatientInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  notes?: string;
}

export function usePatients() {
  const { request } = useApi();
  const authStore = useAuthStore();

  async function fetchPatients(): Promise<Patient[]> {
    return request<Patient[]>('/patients', {
      token: authStore.accessToken!,
    });
  }

  async function fetchPatient(id: string): Promise<Patient> {
    return request<Patient>(`/patients/${id}`, {
      token: authStore.accessToken!,
    });
  }

  async function createPatient(input: CreatePatientInput): Promise<Patient> {
    return request<Patient>('/patients', {
      method: 'POST',
      body: input,
      token: authStore.accessToken!,
    });
  }

  return { fetchPatients, fetchPatient, createPatient };
}