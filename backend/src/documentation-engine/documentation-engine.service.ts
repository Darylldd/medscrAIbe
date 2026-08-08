import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AiService } from '../ai/ai.service';
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
      // Full transcription + prompt building + SOAP generation + validation
      // arrives across Steps 14-18. This method currently proves the
      // orchestration path end to end using the stub AI provider.
      this.logger.log(`Consultation ${consultationId} processing pipeline invoked (stub)`);

      await this.prisma.consultation.update({
        where: { id: consultationId },
        data: { status: ConsultationStatus.READY_FOR_REVIEW },
      });
    } catch (error) {
      this.logger.error(`Processing failed for consultation ${consultationId}`, error);
      await this.markFailed(consultationId);
    }
  }

  private async markFailed(consultationId: string): Promise<void> {
    await this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: ConsultationStatus.FAILED },
    });
  }
}