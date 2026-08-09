import { Controller, Post, Param, Req, UseGuards, ParseUUIDPipe, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DocumentationEngineService } from './documentation-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('documentation-engine')
@UseGuards(JwtAuthGuard)
export class DocumentationEngineController {
  constructor(
    private readonly documentationEngineService: DocumentationEngineService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('process/:consultationId')
  async triggerProcessing(@Req() req: any, @Param('consultationId', ParseUUIDPipe) consultationId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (consultation.doctorId !== req.user.id) {
      throw new ForbiddenException('You do not have access to this consultation');
    }

    this.documentationEngineService.processConsultation(consultationId);

    return { message: 'Processing started' };
  }
}