import { z } from "zod";

export const preferenceOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

const questionBaseSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_-]*$/),
  label: z.string().min(1),
});

export const preferenceQuestionSchema = z.discriminatedUnion("type", [
  questionBaseSchema.extend({
    type: z.literal("input"),
    placeholder: z.string().optional(),
  }),
  questionBaseSchema.extend({
    type: z.literal("multi-select"),
    options: z.array(preferenceOptionSchema).min(1),
  }),
  questionBaseSchema.extend({
    type: z.literal("single-select"),
    options: z.array(preferenceOptionSchema).min(1),
  }),
]);

export const preferenceQuestionsSchema = z.object({
  questions: z.array(preferenceQuestionSchema).min(1),
});

export const brunchSchema = z.object({
  metadata: z.object({
    title: z.string().min(1),
  }),
  access: z.object({
    pin: z.string().regex(/^\d{4}$/, "The brunch PIN must contain exactly four digits"),
  }),
  navigation: z.object({
    homeLabel: z.string().min(1),
    homeHref: z.string().min(1),
  }),
  invitation: z.object({
    label: z.string().min(1),
    title: z.object({
      before: z.string().min(1),
      connector: z.string().min(1),
      after: z.string().min(1),
    }),
    description: z.string().min(1),
  }),
  event: z.object({
    when: z.object({
      label: z.string().min(1),
      value: z.string().min(1),
    }),
    where: z.object({
      label: z.string().min(1),
      value: z.string().min(1),
    }),
  }),
  menu: z.object({
    label: z.string().min(1),
    description: z.string().min(1),
  }),
  preferences: z.object({
    submitLabel: z.string().min(1),
    submitIcon: z.string().min(1),
  }),
  response: z.object({
    greeting: z.string().min(1),
    confirmation: z.string().min(1),
    thankYou: z.string().min(1).default("Thank you for responding!"),
    inviter: z.string().min(1).default("Tanmoy"),
  }),
  footer: z.string().min(1),
});

type BrunchShell = z.infer<typeof brunchSchema>;
export type BrunchContent = Omit<BrunchShell, "preferences"> & {
  preferences: BrunchShell["preferences"] & {
    questions: z.infer<typeof preferenceQuestionsSchema>["questions"];
  };
};
export type PreferenceQuestion = BrunchContent["preferences"]["questions"][number];

export const inviteesSchema = z.object({
  invitees: z
    .array(
      z.object({
        accessCode: z.string().regex(/^\d{4}$/, "The invitee access code must contain exactly four digits"),
        name: z.string().min(1),
      }),
    )
    .min(1),
});

export type Invitee = z.infer<typeof inviteesSchema>["invitees"][number];
export type InviteeContent = z.infer<typeof inviteesSchema>;

export const quizAccessSchema = z.object({
  users: z.array(
    z.object({
      name: z.string().min(1),
      accessCode: z.string().regex(/^\d{4}$/),
    }),
  ).min(1),
});

export type QuizUser = z.infer<typeof quizAccessSchema>["users"][number];
export type QuizAccessContent = z.infer<typeof quizAccessSchema>;

export const quizRoundsSchema = z.object({
  rounds: z.array(z.string().trim().min(1)).min(1),
});

export type QuizRoundsContent = z.infer<typeof quizRoundsSchema>;
