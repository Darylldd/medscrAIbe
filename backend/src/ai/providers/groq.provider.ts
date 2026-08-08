import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type {
  AIProvider,
  TranscriptionResult,
  SoapDraftInput,
  SoapDraftResult,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class GroqProvider implements AIProvider {
  private readonly client: Groq;
  private readonly transcriptionModel: string;
  private readonly soapModel: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
    this.transcriptionModel = this.configService.get<string>('GROQ_TRANSCRIPTION_MODEL')!;
    this.soapModel = this.configService.get<string>('GROQ_SOAP_MODEL')!;
  }

  async transcribe(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult> {
    const extension = this.mimeTypeToExtension(mimeType);
   const file = new File([new Uint8Array(audioBuffer)], `audio.${extension}`, { type: mimeType });

    const response = await this.client.audio.transcriptions.create({
      file,
      model: this.transcriptionModel,
      response_format: 'verbose_json',
    });

    return {
      text: response.text,
      durationSeconds: (response as any).duration ?? 0,
    };
  }

  async generateSoapDraft(input: SoapDraftInput): Promise<SoapDraftResult> {
    const completion = await this.client.chat.completions.create({
      model: this.soapModel,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: this.buildSystemPrompt(),
        },
        {
          role: 'user',
          content: this.buildUserPrompt(input),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error('Groq returned an empty response');
    }

    return JSON.parse(raw) as SoapDraftResult;
  }

  private buildSystemPrompt(): string {
    return `You are a clinical documentation assistant. You convert consultation transcripts into structured SOAP note drafts.

Rules you must follow strictly:
- Only include information explicitly present in the transcript. Never infer, assume, or invent symptoms, findings, or clinical details.
- If a standard SOAP element is not discussed in the transcript, note that explicitly rather than leaving it blank or guessing.
- This is a draft for a licensed clinician to review. You are not diagnosing the patient.

Respond ONLY with valid JSON matching exactly this shape, no other text:
{
  "subjective": { "content": string, "notMentioned": string[] },
  "objective": { "content": string, "notMentioned": string[] },
  "assessment": { "content": string, "notMentioned": string[] },
  "plan": { "content": string, "notMentioned": string[] }
}`;
  }

  private buildUserPrompt(input: SoapDraftInput): string {
    const contextSection = input.patientContext
      ? `\n\nAdditional patient context:\n${input.patientContext}`
      : '';
    return `Consultation transcript:\n${input.transcript}${contextSection}`;
  }

  private mimeTypeToExtension(mimeType: string): string {
    const map: Record<string, string> = {
      'audio/mpeg': 'mp3',
      'audio/mp4': 'm4a',
      'audio/wav': 'wav',
      'audio/x-wav': 'wav',
      'audio/webm': 'webm',
      'audio/ogg': 'ogg',
    };
    return map[mimeType] ?? 'mp3';
  }
}