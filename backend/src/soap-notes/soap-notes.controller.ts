import { Controller, Get, Param, Req, UseGuards, ParseUUIDPipe, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SoapNotesService } from './soap-notes.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class SoapNotesController {
  constructor(
    private readonly soapNotesService: SoapNotesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':id/soap-note')
  async getLatestSoapNote(@Req() req: any, @Param('id', ParseUUIDPipe) consultationId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (consultation.doctorId !== req.user.id) {
      throw new ForbiddenException('You do not have access to this consultation');
    }

    const note = await this.soapNotesService.findLatestForConsultation(consultationId);

    if (!note) {
      throw new NotFoundException('No SOAP note found for this consultation');
    }

    return note;
  }
}