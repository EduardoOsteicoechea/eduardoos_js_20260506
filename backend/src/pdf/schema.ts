import { z } from 'zod';

const marginsMmSchema = z
  .object({
    top: z.number().min(0).max(80).optional(),
    right: z.number().min(0).max(80).optional(),
    bottom: z.number().min(0).max(80).optional(),
    left: z.number().min(0).max(80).optional(),
  })
  .optional();

const optionsSchema = z
  .object({
    marginsMm: marginsMmSchema,
    paragraphGapMm: z.number().min(0).max(40).optional(),
    lineGapMm: z.number().min(0).max(20).optional(),
    columnGapMm: z.number().min(0).max(40).optional(),
    fontSizePt: z.number().min(6).max(48).optional(),
  })
  .optional();

const columnsSchema = z.object({
  left: z.array(z.string()).optional(),
  right: z.array(z.string()).optional(),
});

export const pdfGenerateBodySchema = z
  .object({
    paperSize: z.literal('letter').default('letter'),
    layout: z.enum(['single-row', 'two-row']),
    title: z.string().max(500).optional(),
    paragraphs: z.array(z.string()).optional(),
    columns: columnsSchema.optional(),
    options: optionsSchema,
  })
  .superRefine((body, ctx) => {
    if (body.layout === 'single-row') {
      if (!body.paragraphs?.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'single-row requiere al menos un párrafo en "paragraphs"',
          path: ['paragraphs'],
        });
      }
      return;
    }

    const left = body.columns?.left ?? [];
    const right = body.columns?.right ?? [];
    if (!left.length && !right.length) {
      ctx.addIssue({
        code: 'custom',
        message:
          'two-row requiere "columns.left" y/o "columns.right" con al menos un párrafo',
        path: ['columns'],
      });
    }
  });

export type PdfGenerateBody = z.infer<typeof pdfGenerateBodySchema>;
