import { z } from "zod";

export const toGlossSchema = z.object({
  sentences: z
    .array(
      z.object({
        from: z.string().describe("An English sentence to be glossed"),
        to: z.string().describe("The corresponding BSL gloss for the sentence"),
      })
    )
    .describe(
      "The key-value pairs of sentences and their corresponding BSL glosses"
    ),
});

export const fromGlossSchema = z.object({
  sentences: z.array(
    z.object({
      from: z.string().describe("The BSL gloss to be translated"),
      to: z
        .string()
        .describe("Corresponding English sentence translated from gloss."),
    })
  ),
});

export const toDocumentSchema = z.object({
  paragraphs: z
    .array(
      z.object({
        sentences: z
          .array(
            z.object({
              from: z.string().describe("An English sentence to be glossed"),
              to: z
                .string()
                .describe("The corresponding BSL gloss for the sentence"),
            })
          )
          .describe(
            "The key-value pairs of sentences and their corresponding BSL glosses"
          ),
      })
    )
    .describe(
      "A document containing paragraphs of sentences and their BSL glosses"
    ),
});
