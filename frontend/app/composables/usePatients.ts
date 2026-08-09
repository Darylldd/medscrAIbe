interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  notes: string | null;
  isArchived: boolean;
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

  return { fetchPatients, fetchPatient };
}