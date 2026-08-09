interface SoapNote {
  id: string;
  version: number;
  status: string;
  subjectiveContent: string;
  subjectiveNotMentioned: string[];
  objectiveContent: string;
  objectiveNotMentioned: string[];
  assessmentContent: string;
  assessmentNotMentioned: string[];
  planContent: string;
  planNotMentioned: string[];
  createdAt: string;
}

export function useSoapNotes() {
  const { request } = useApi();
  const authStore = useAuthStore();

  async function fetchLatestSoapNote(consultationId: string): Promise<SoapNote> {
    return request<SoapNote>(`/consultations/${consultationId}/soap-note`, {
      token: authStore.accessToken!,
    });
  }

  async function fetchAllSoapNoteVersions(consultationId: string): Promise<SoapNote[]> {
    return request<SoapNote[]>(`/consultations/${consultationId}/soap-notes`, {
      token: authStore.accessToken!,
    });
  }

  async function approveSoapNote(consultationId: string): Promise<SoapNote> {
    return request<SoapNote>(`/consultations/${consultationId}/soap-note/approve`, {
      method: 'POST',
      token: authStore.accessToken!,
    });
  }

  return { fetchLatestSoapNote, fetchAllSoapNoteVersions, approveSoapNote };
}