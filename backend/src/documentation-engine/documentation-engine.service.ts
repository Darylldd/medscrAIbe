import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AiService } from '../ai/ai.service';
import { InvalidSoapDraftError } from '../ai/soap-validation.service';
import { ConsultationStatus } from '../../generated/prisma/client';

@Injectable()
export class DocumentationEngineService {
  private readonly logger = new Logger(DocumentationEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly aiService: AiService,
  ) {}

  async processConsultation(consultationId: string): Promise<void> {
    this.logger.log(`Starting processing for consultation ${consultationId}`);

    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { audioRecording: true },
    });

    if (!consultation) {
      this.logger.error(`Consultation ${consultationId} not found`);
      return;
    }

    if (!consultation.audioRecording) {
      this.logger.error(`Consultation ${consultationId} has no audio recording`);
      await this.markFailed(consultationId);
      return;
    }

    await this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: ConsultationStatus.PROCESSING },
    });

    try {
      const audioResponse = await fetch(
        await this.storageService.getSignedDownloadUrl(consultation.audioRecording.storageKey),
      );
      const audioArrayBuffer = await audioResponse.arrayBuffer();
      const audioBuffer = Buffer.from(audioArrayBuffer);

      const transcription = await this.aiService.transcribe(
        audioBuffer,
        consultation.audioRecording.mimeType,
      );

      this.logger.log(
        `Transcription complete for ${consultationId}: ${transcription.text.length} characters`,
      );

      const soapDraft = await this.generateSoapDraftWithRetry(consultationId, transcription.text);

      this.logger.log(`SOAP draft generated for ${consultationId}`);
      this.logger.debug(JSON.stringify(soapDraft, null, 2));

      await this.prisma.consultation.update({
        where: { id: consultationId },
        data: { status: ConsultationStatus.READY_FOR_REVIEW },
      });
    } catch (error) {
      this.logger.error(`Processing failed for consultation ${consultationId}`, error);
      await this.markFailed(consultationId);
    }
  }

  private async generateSoapDraftWithRetry(consultationId: string, transcript: string) {
    try {
      return await this.aiService.generateSoapDraft({ transcript });
    } catch (error) {
      if (error instanceof InvalidSoapDraftError) {
        this.logger.warn(
          `SOAP draft validation failed for ${consultationId}, retrying once: ${error.message}`,
        );
        return await this.aiService.generateSoapDraft({ transcript });
      }
      throw error;
    }
  }

  private async markFailed(consultationId: string): Promise<void> {
    await this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: ConsultationStatus.FAILED },
    });
  }
}