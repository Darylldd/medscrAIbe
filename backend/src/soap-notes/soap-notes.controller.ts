import { Controller, Get, Post, Param, Req, Res, UseGuards, ParseUUIDPipe, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { SoapNotesService } from './soap-notes.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PdfExportService } from '../pdf-export/pdf-export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class SoapNotesController {
constructor(
  private readonly soapNotesService: SoapNotesService,
  private readonly prisma: PrismaService,
  private readonly auditLog: AuditLogService,
  private readonly pdfExport: PdfExportService,
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
@Get(':id/soap-note/pdf')
async downloadPdf(
  @Req() req: any,
  @Res() res: Response,
  @Param('id', ParseUUIDPipe) consultationId: string,
) {
  const consultation = await this.prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { patient: true },
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

  if (note.status !== 'APPROVED') {
    throw new BadRequestException('Only approved SOAP notes can be exported as PDF');
  }

  const pdfBuffer = await this.pdfExport.generateSoapNotePdf({
    soapNote: note,
    patient: consultation.patient,
    consultation,
    doctorName: `${req.user.firstName} ${req.user.lastName}`,
  });

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="soap-note-${consultation.patient.lastName}-${consultation.occurredAt.toISOString().split('T')[0]}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
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