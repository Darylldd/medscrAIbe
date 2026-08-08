import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AI_PROVIDER } from './ai.constants';
import { StubProvider } from './providers/stub.provider';

@Module({
  providers: [
    AiService,
    {
      provide: AI_PROVIDER,
      useClass: StubProvider,
    },
  ],
  exports: [AiService],
})
export class AiModule {}