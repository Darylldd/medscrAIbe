import { IsString, IsDateString, IsUUID } from 'class-validator';

export class CreateConsultationDto {
  @IsUUID()
  patientId!: string;

  @IsDateString()
  occurredAt!: string;
}