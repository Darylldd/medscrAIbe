import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MAX_AUDIO_UPLOAD_BYTES } from './constants/audio-upload.constants';

@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post(':id/audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_AUDIO_UPLOAD_BYTES },
    }),
  )
  async uploadAudio(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) consultationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.attachAudio(req.user.id, consultationId, file);
  }

  @Get(':id/audio')
  async getAudioUrl(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) consultationId: string,
  ) {
    const url = await this.uploadsService.getDownloadUrl(req.user.id, consultationId);
    return { url };
  }
}