import { experienceLevels } from "@/drizzle/schema/jobInfo";
import { z } from "zod";

export const jobInfoSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().trim().min(1, "Title is required").nullable(),
  experienceLevel: z.enum(experienceLevels, "Experience level is required"),
  description: z.string().trim().min(1, "Description is required"),
});

export type JobInfoFormValues = z.infer<typeof jobInfoSchema>;
