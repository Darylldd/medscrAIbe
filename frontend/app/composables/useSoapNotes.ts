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
}

export function useSoapNotes() {
  const { request } = useApi();
  const authStore = useAuthStore();

  async function fetchLatestSoapNote(consultationId: string): Promise<SoapNote> {
    return request<SoapNote>(`/consultations/${consultationId}/soap-note`, {
      token: authStore.accessToken!,
    });
  }

  return { fetchLatestSoapNote };
}