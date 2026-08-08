import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type {
  AIProvider,
  TranscriptionResult,
  SoapDraftInput,
  SoapDraftResult,
} from '../interfaces/ai-provider.interface';
import { PromptBuilderService } from '../prompt-builder.service';
import { SoapValidationService } from '../soap-validation.service';

@Injectable()
export class GroqProvider implements AIProvider {
  private readonly client: Groq;
  private readonly transcriptionModel: string;
  private readonly soapModel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly soapValidation: SoapValidationService,
  ) {
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
        { role: 'system', content: this.promptBuilder.buildSoapSystemPrompt() },
        { role: 'user', content: this.promptBuilder.buildSoapUserPrompt(input) },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error('Groq returned an empty response');
    }

    const parsed: unknown = JSON.parse(raw);
    return this.soapValidation.validate(parsed);
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