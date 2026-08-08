export interface TranscriptionResult {
  text: string;
  durationSeconds: number;
}

export interface SoapDraftInput {
  transcript: string;
  patientContext?: string;
}

export interface SoapDraftSection {
  content: string;
  notMentioned: string[];
}

export interface SoapDraftResult {
  subjective: SoapDraftSection;
  objective: SoapDraftSection;
  assessment: SoapDraftSection;
  plan: SoapDraftSection;
}

export interface AIProvider {
  transcribe(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult>;
  generateSoapDraft(input: SoapDraftInput): Promise<SoapDraftResult>;
}