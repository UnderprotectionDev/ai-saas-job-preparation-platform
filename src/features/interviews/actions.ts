"use server";

import { db } from "@/drizzle/db";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobInfoIdTag } from "../job-infos/db-cache";
import { InterviewTable, JobInfoTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { insertInterview, updateInterview as updateInterviewDb } from "./db";
import { getInterviewIdTag } from "./db-cache";

export async function createInterview({
  jobInfoId,
}: {
  jobInfoId: string;
}): Promise<{ error: true; message: string } | { error: false; id: string }> {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return {
      error: true,
      message: "You don't have permission to create an interview",
    };
  }

  // TODO: Permissions
  // TODO: Rate limit

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (!jobInfo) {
    return {
      error: true,
      message: "Job info not found",
    };
  }

  const interview = await insertInterview({
    jobInfoId,
    duration: "00:00:00",
  });

  return { error: false, id: interview.id };
}

export async function updateInterview(
  id: string,
  data: {
    humeChatId?: string;
    duration?: string;
  }
) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(id, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  await updateInterviewDb(id, data);

  return { error: false };
}

async function getJobInfo(jobInfoId: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(jobInfoId));

  const jobInfo = await db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, jobInfoId), eq(JobInfoTable.userId, userId)),
  });

  return jobInfo;
}

async function getInterview(id: string, userId: string) {
  "use cache";
  cacheTag(getInterviewIdTag(id));

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
          description: true,
          title: true,
          experienceLevel: true,
        },
      },
    },
  });

  if (interview == null) return null;

  cacheTag(getJobInfoIdTag(interview.jobInfo.id));
  if (interview.jobInfo.userId !== userId) return null;

  return interview;
}
