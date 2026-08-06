import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Req() req: any, @Query('includeArchived') includeArchived?: string) {
    return this.patientsService.findAllForDoctor(req.user.id, includeArchived === 'true');
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.patientsService.findOneForDoctor(req.user.id, id);
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  async archive(@Req() req: any, @Param('id') id: string) {
    return this.patientsService.archive(req.user.id, id);
  }

  @Patch(':id/unarchive')
  async unarchive(@Req() req: any, @Param('id') id: string) {
    return this.patientsService.unarchive(req.user.id, id);
  }
}