import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateConsultationDto) {
    return this.consultationsService.create(req.user.id, dto);
  }

  @Get()
  async findAllForPatient(@Req() req: any, @Query('patientId') patientId: string) {
    return this.consultationsService.findAllForPatient(req.user.id, patientId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.consultationsService.findOneForDoctor(req.user.id, id);
  }
}