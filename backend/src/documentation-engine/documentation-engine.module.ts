import { Module } from '@nestjs/common';
import { DocumentationEngineService } from './documentation-engine.service';
import { StorageModule } from '../storage/storage.module';
import { AiModule } from '../ai/ai.module';
import { SoapNotesModule } from '../soap-notes/soap-notes.module';

@Module({
  imports: [StorageModule, AiModule, SoapNotesModule],
  providers: [DocumentationEngineService],
  exports: [DocumentationEngineService],
})
export class DocumentationEngineModule {}