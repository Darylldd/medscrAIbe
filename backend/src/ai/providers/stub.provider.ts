import { Injectable } from '@nestjs/common';
import { AIProvider, TranscriptionResult, SoapDraftInput, SoapDraftResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class StubProvider implements AIProvider {
  async transcribe(): Promise<TranscriptionResult> {
    return {
      text: '[Stub transcription — Groq provider not yet connected]',
      durationSeconds: 0,
    };
  }

  async generateSoapDraft(input: SoapDraftInput): Promise<SoapDraftResult> {
    const empty = { content: '', notMentioned: ['Real AI provider not yet connected'] };
    return {
      subjective: { ...empty },
      objective: { ...empty },
      assessment: { ...empty },
      plan: { ...empty },
    };
  }
}