import { z } from "zod";

export const preferenceOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

const preferenceGroupSchema = z
  .object({
    label: z.string().min(1),
    options: z.array(preferenceOptionSchema).min(1),
    default: z.string().min(1),
  })
  .refine((value) => value.options.some((option) => option.value === value.default), {
    message: "The preference default must match an option",
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
    coffee: preferenceGroupSchema,
    food: preferenceGroupSchema,
    notes: z.object({
      label: z.string().min(1),
      placeholder: z.string().min(1),
    }),
    submitLabel: z.string().min(1),
    submitIcon: z.string().min(1),
  }),
  response: z.object({
    greeting: z.string().min(1),
    confirmation: z.string().min(1),
    thankYou: z.string().min(1).default("Thank you for responding!"),
    inviter: z.string().min(1).default("Tanmoy"),
    fields: z.object({
      coffee: z.string().min(1),
      food: z.string().min(1),
      notes: z.string().min(1),
      emptyNotes: z.string().min(1),
    }),
  }),
  footer: z.string().min(1),
});

export type BrunchContent = z.infer<typeof brunchSchema>;

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
