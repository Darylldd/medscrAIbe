import { Injectable, Inject } from '@nestjs/common';
import type { AIProvider, TranscriptionResult, SoapDraftInput, SoapDraftResult } from './interfaces/ai-provider.interface';
import { AI_PROVIDER } from './ai.constants';

@Injectable()
export class AiService {
  constructor(@Inject(AI_PROVIDER) private readonly provider: AIProvider) {}

  async transcribe(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult> {
    return this.provider.transcribe(audioBuffer, mimeType);
  }

  async generateSoapDraft(input: SoapDraftInput): Promise<SoapDraftResult> {
    return this.provider.generateSoapDraft(input);
  }
}