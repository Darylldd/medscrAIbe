import { Injectable } from '@nestjs/common';
import type { SoapDraftInput } from './interfaces/ai-provider.interface';

const SOAP_JSON_SCHEMA = `{
  "subjective": { "content": string, "notMentioned": string[] },
  "objective": { "content": string, "notMentioned": string[] },
  "assessment": { "content": string, "notMentioned": string[] },
  "plan": { "content": string, "notMentioned": string[] }
}`;

@Injectable()
export class PromptBuilderService {
  buildSoapSystemPrompt(): string {
    return `You are a clinical documentation assistant. You convert consultation transcripts into structured SOAP note drafts.

Rules you must follow strictly:
- Only include information explicitly present in the transcript. Never infer, assume, or invent symptoms, findings, or clinical details not actually stated.
- If a standard SOAP element is not discussed in the transcript, note that explicitly in "notMentioned" rather than leaving content blank or guessing at what might be true.
- Distinguish clearly between Subjective (what the patient reports) and Objective (what the doctor observes or measures) — do not blend these.
- This is a draft for a licensed clinician to review and approve. You are not diagnosing the patient, and your output must not be treated as a diagnosis.
- If the transcript is unclear, contradictory, or too brief to draft a section confidently, say so in "notMentioned" rather than filling the gap with a plausible guess.

Respond ONLY with valid JSON matching exactly this shape, no markdown formatting, no other text before or after:
${SOAP_JSON_SCHEMA}`;
  }

  buildSoapUserPrompt(input: SoapDraftInput): string {
    const contextSection = input.patientContext
      ? `\n\nAdditional patient context provided by the clinician:\n${input.patientContext}`
      : '';

    return `Consultation transcript:\n${input.transcript}${contextSection}`;
  }
}