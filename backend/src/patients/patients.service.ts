import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Patient } from '../../generated/prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class PatientsService {
constructor(
  private readonly prisma: PrismaService,
  private readonly auditLog: AuditLogService,
) {}

async create(doctorId: string, dto: CreatePatientDto): Promise<Patient> {
  const patient = await this.prisma.patient.create({
    data: { ...dto, dateOfBirth: new Date(dto.dateOfBirth), doctorId },
  });

  await this.auditLog.record('PATIENT_CREATED', doctorId, patient.id);

  return patient;
}

  async findAllForDoctor(doctorId: string, includeArchived = false): Promise<Patient[]> {
    return this.prisma.patient.findMany({
      where: {
        doctorId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async findOneForDoctor(doctorId: string, patientId: string): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (patient.doctorId !== doctorId) {
      throw new ForbiddenException('You do not have access to this patient');
    }

    return patient;
  }

  async update(doctorId: string, patientId: string, dto: UpdatePatientDto): Promise<Patient> {
    await this.findOneForDoctor(doctorId, patientId);

    return this.prisma.patient.update({
      where: { id: patientId },
      data: {
        ...dto,
        ...(dto.dateOfBirth ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
      },
    });
  }

  async archive(doctorId: string, patientId: string): Promise<Patient> {
    await this.findOneForDoctor(doctorId, patientId);

    return this.prisma.patient.update({
      where: { id: patientId },
      data: { isArchived: true },
    });
  }

  async unarchive(doctorId: string, patientId: string): Promise<Patient> {
    await this.findOneForDoctor(doctorId, patientId);

    return this.prisma.patient.update({
      where: { id: patientId },
      data: { isArchived: false },
    });
  }
}