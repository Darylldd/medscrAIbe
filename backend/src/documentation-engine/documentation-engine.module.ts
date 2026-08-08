import { Module } from '@nestjs/common';
import { DocumentationEngineService } from './documentation-engine.service';
import { StorageModule } from '../storage/storage.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [StorageModule, AiModule],
  providers: [DocumentationEngineService],
  exports: [DocumentationEngineService],
})
export class DocumentationEngineModule {}