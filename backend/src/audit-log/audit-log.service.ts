import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, Prisma } from '../../generated/prisma/client';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(
    action: AuditAction,
    actorId: string,
    targetId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          actorId,
          targetId,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log for action ${action}`, error);
    }
  }
}