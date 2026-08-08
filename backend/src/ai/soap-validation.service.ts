import { Injectable, Logger } from '@nestjs/common';
import { soapDraftSchema, ValidatedSoapDraft } from './schemas/soap-draft.schema';

export class InvalidSoapDraftError extends Error {
  constructor(public readonly issues: string[]) {
    super(`AI response failed SOAP draft validation: ${issues.join('; ')}`);
    this.name = 'InvalidSoapDraftError';
  }
}

@Injectable()
export class SoapValidationService {
  private readonly logger = new Logger(SoapValidationService.name);

  validate(rawResponse: unknown): ValidatedSoapDraft {
    const result = soapDraftSchema.safeParse(rawResponse);

    if (!result.success) {
      const issues = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      this.logger.warn(`SOAP draft validation failed: ${issues.join('; ')}`);
      throw new InvalidSoapDraftError(issues);
    }

    return result.data;
  }
}