import { Controller, Get, Post, Param, Req, UseGuards, ParseUUIDPipe, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SoapNotesService } from './soap-notes.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class SoapNotesController {
  constructor(
    private readonly soapNotesService: SoapNotesService,
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
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

  @Get(':id/soap-notes')
  async getAllVersions(@Req() req: any, @Param('id', ParseUUIDPipe) consultationId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (consultation.doctorId !== req.user.id) {
      throw new ForbiddenException('You do not have access to this consultation');
    }

    return this.soapNotesService.findAllVersionsForConsultation(consultationId);
  }

  @Post(':id/soap-note/approve')
  async approveSoapNote(@Req() req: any, @Param('id', ParseUUIDPipe) consultationId: string) {
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

    const approved = await this.soapNotesService.approve(note.id, req.user.id);

    await this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'APPROVED' },
    });

    await this.auditLog.record('SOAP_NOTE_APPROVED', req.user.id, consultationId, {
      version: approved.version,
    });

    return approved;
  }
}