import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AudioRecording } from '../../generated/prisma/client';
import { ALLOWED_AUDIO_MIME_TYPES } from './constants/audio-upload.constants';

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async attachAudio(
    doctorId: string,
    consultationId: string,
    file: Express.Multer.File,
  ): Promise<AudioRecording> {
    if (!ALLOWED_AUDIO_MIME_TYPES.includes(file.mimetype as any)) {
      throw new BadRequestException(
        `Unsupported audio format: ${file.mimetype}`,
      );
    }

    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { audioRecording: true },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException('You do not have access to this consultation');
    }

    if (consultation.audioRecording) {
      throw new BadRequestException('This consultation already has an audio recording');
    }

    const storageKey = `consultations/${consultationId}/audio-${Date.now()}`;

    await this.storageService.uploadBuffer(storageKey, file.buffer, file.mimetype);

    return this.prisma.audioRecording.create({
      data: {
        consultationId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey,
      },
    });
  }

  async getDownloadUrl(doctorId: string, consultationId: string): Promise<string> {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { audioRecording: true },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException('You do not have access to this consultation');
    }

    if (!consultation.audioRecording) {
      throw new NotFoundException('No audio recording found for this consultation');
    }

    return this.storageService.getSignedDownloadUrl(consultation.audioRecording.storageKey);
  }
}