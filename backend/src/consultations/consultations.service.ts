import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Consultation, ConsultationStatus } from '../../generated/prisma/client';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}
async findPendingReviewForDoctor(doctorId: string): Promise<Consultation[]> {
  return this.prisma.consultation.findMany({
    where: { doctorId, status: 'READY_FOR_REVIEW' },
    include: { patient: true },
    orderBy: { updatedAt: 'asc' },
  });
}
  async create(doctorId: string, dto: CreateConsultationDto): Promise<Consultation> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (patient.doctorId !== doctorId) {
      throw new ForbiddenException('You do not have access to this patient');
    }

    const consultation = await this.prisma.consultation.create({
      data: {
        patientId: dto.patientId,
        doctorId,
        occurredAt: new Date(dto.occurredAt),
        status: ConsultationStatus.UPLOADED,
      },
    });

    await this.auditLog.record('CONSULTATION_CREATED', doctorId, consultation.id);

    return consultation;
  }

  async findAllForPatient(doctorId: string, patientId: string): Promise<Consultation[]> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (patient.doctorId !== doctorId) {
      throw new ForbiddenException('You do not have access to this patient');
    }

    return this.prisma.consultation.findMany({
      where: { patientId },
      orderBy: { occurredAt: 'desc' },
    });
  }

  async findOneForDoctor(doctorId: string, consultationId: string): Promise<Consultation> {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException('You do not have access to this consultation');
    }

    return consultation;
  }
}