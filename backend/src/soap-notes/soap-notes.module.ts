import { Module } from '@nestjs/common';
import { SoapNotesService } from './soap-notes.service';
import { SoapNotesController } from './soap-notes.controller';
import { PdfExportModule } from '../pdf-export/pdf-export.module';

@Module({
  imports: [PdfExportModule],
  controllers: [SoapNotesController],
  providers: [SoapNotesService],
  exports: [SoapNotesService],
})
export class SoapNotesModule {}