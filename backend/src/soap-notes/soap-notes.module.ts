import { Module } from '@nestjs/common';
import { SoapNotesService } from './soap-notes.service';

@Module({
  providers: [SoapNotesService],
  exports: [SoapNotesService],
})
export class SoapNotesModule {}