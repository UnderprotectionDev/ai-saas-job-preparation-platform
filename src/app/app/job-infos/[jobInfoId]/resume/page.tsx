import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { JobInfoBackLink } from "@/features/job-infos/components/job-info-backlink";
import { getJobInfoIdTag } from "@/features/job-infos/db-cache";
import { canCreateQuestion } from "@/features/questions/permissions";
import { canRunResumeAnalysis } from "@/features/resume-analyses/permissions";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";
import { and, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ResumePageClient } from "./_client";

export default async function ResumePage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <Suspense
        fallback={<Loader2Icon className="animate-spin size-24 m-auto" />}
      >
        <SuspendedComponent jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  if (!(await canRunResumeAnalysis())) return redirect("/app/upgrade");

  return <ResumePageClient jobInfoId={jobInfoId} />;
}
