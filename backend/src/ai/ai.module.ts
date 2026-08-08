import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { PromptBuilderService } from './prompt-builder.service';
import { SoapValidationService } from './soap-validation.service';
import { AI_PROVIDER } from './ai.constants';
import { GroqProvider } from './providers/groq.provider';

@Module({
  providers: [
    AiService,
    PromptBuilderService,
    SoapValidationService,
    {
      provide: AI_PROVIDER,
      useClass: GroqProvider,
    },
  ],
  exports: [AiService],
})
export class AiModule {}