import { hasPermission } from "@/services/clerk/lib/has-permission";

export async function canRunResumeAnalysis() {
  return hasPermission("unlimited_resume_analysis");
}
