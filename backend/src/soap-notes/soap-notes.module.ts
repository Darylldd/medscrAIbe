import { Module } from '@nestjs/common';
import { SoapNotesService } from './soap-notes.service';
import { SoapNotesController } from './soap-notes.controller';

@Module({
  controllers: [SoapNotesController],
  providers: [SoapNotesService],
  exports: [SoapNotesService],
})
export class SoapNotesModule {}