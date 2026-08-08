import { z } from 'zod';

const soapSectionSchema = z.object({
  content: z.string(),
  notMentioned: z.array(z.string()),
});

export const soapDraftSchema = z.object({
  subjective: soapSectionSchema,
  objective: soapSectionSchema,
  assessment: soapSectionSchema,
  plan: soapSectionSchema,
});

export type ValidatedSoapDraft = z.infer<typeof soapDraftSchema>;