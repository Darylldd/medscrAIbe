import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { UploadsModule } from './uploads/uploads.module';
import { StorageModule } from './storage/storage.module';
import { AiModule } from './ai/ai.module';
import { DocumentationEngineModule } from './documentation-engine/documentation-engine.module';
import { SoapNotesModule } from './soap-notes/soap-notes.module';
import { AuditLogModule } from './audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    PatientsModule,
    ConsultationsModule,
    UploadsModule,
    StorageModule,
    AiModule,
    DocumentationEngineModule,
    SoapNotesModule,
    AuditLogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}