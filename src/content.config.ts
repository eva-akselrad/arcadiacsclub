import { defineCollection, z } from 'astro:content';

const officers = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    email: z.string().email().optional(),
    bio: z.string().optional(),
    image: z.string().optional(),
    comingSoon: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const site = defineCollection({
  type: 'data',
  schema: z.object({
    siteUrl: z.string().url(),
    clubName: z.string(),
    tagline: z.string(),
    meetingLocation: z.string(),
    meetingSchedule: z.string(),
    googleFormUrl: z.string().url(),
    githubUrl: z.string().url(),
    social: z.object({
      discord: z.string().optional(),
      instagram: z.string().optional(),
    }),
  }),
});

export const collections = { officers, site };
