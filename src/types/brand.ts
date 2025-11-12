
import { z } from 'zod';

// Define form schema
export const brandIdentitySchema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  brandStory: z.string().min(10, { message: "Brand story must be at least 10 characters" }),
  vision: z.string().min(10, { message: "Vision must be at least 10 characters" }),
  mission: z.string().min(10, { message: "Mission must be at least 10 characters" }),
  coreValues: z.string().min(10, { message: "Core values must be at least 10 characters" }),
  coreServices: z.string().min(10, { message: "Core services must be at least 10 characters" }),
  audience: z.string().min(10, { message: "Audience must be at least 10 characters" }),
  market: z.string().min(10, { message: "Market must be at least 10 characters" }),
  goals: z.string().min(10, { message: "Goals must be at least 10 characters" })
});

export type BrandIdentityFormValues = z.infer<typeof brandIdentitySchema>;
