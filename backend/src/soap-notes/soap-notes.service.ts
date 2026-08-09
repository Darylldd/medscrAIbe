import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SoapNote, SoapNoteStatus } from '../../generated/prisma/client';
import type { SoapDraftResult } from '../ai/interfaces/ai-provider.interface';

@Injectable()
export class SoapNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async createDraft(consultationId: string, draft: SoapDraftResult): Promise<SoapNote> {
    const latest = await this.prisma.soapNote.findFirst({
      where: { consultationId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latest?.version ?? 0) + 1;

    return this.prisma.soapNote.create({
      data: {
        consultationId,
        version: nextVersion,
        subjectiveContent: draft.subjective.content,
        subjectiveNotMentioned: draft.subjective.notMentioned,
        objectiveContent: draft.objective.content,
        objectiveNotMentioned: draft.objective.notMentioned,
        assessmentContent: draft.assessment.content,
        assessmentNotMentioned: draft.assessment.notMentioned,
        planContent: draft.plan.content,
        planNotMentioned: draft.plan.notMentioned,
      },
    });
  }

  async findLatestForConsultation(consultationId: string): Promise<SoapNote | null> {
    return this.prisma.soapNote.findFirst({
      where: { consultationId },
      orderBy: { version: 'desc' },
    });
  }

  async findAllVersionsForConsultation(consultationId: string): Promise<SoapNote[]> {
    return this.prisma.soapNote.findMany({
      where: { consultationId },
      orderBy: { version: 'asc' },
    });
  }
  async approve(id: string, doctorId: string): Promise<SoapNote> {
  return this.prisma.soapNote.update({
    where: { id },
    data: {
      status: SoapNoteStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: doctorId,
    },
  });
}
}
