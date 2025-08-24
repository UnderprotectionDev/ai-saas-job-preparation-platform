"use server";

import { db } from "@/drizzle/db";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobInfoIdTag } from "../job-infos/db-cache";
import { InterviewTable, JobInfoTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { insertInterview, updateInterview as updateInterviewDb } from "./db";
import { getInterviewIdTag } from "./db-cache";
import { canCreateInterview } from "./permissions";
import { PLAN_LIMIT_MESSAGE, RATE_LIMIT_MESSAGE } from "@/lib/error-toast";
import arcjet, { request, tokenBucket } from "@arcjet/next";
import { env } from "@/data/env/server";
import { generateAiInterviewFeedback } from "@/services/ai/interviews";

const aj = arcjet({
  characteristics: ["userId"],
  key: env.ARCJET_KEY,
  rules: [
    tokenBucket({
      capacity: 12,
      refillRate: 4,
      interval: "1d",
      mode: "LIVE",
    }),
  ],
});

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

  if (!(await canCreateInterview())) {
    return {
      error: true,
      message: PLAN_LIMIT_MESSAGE,
    };
  }

  const decision = await aj.protect(await request(), {
    userId,
    requested: 1,
  });

  if (decision.isDenied()) {
    return {
      error: true,
      message: RATE_LIMIT_MESSAGE,
    };
  }

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

export async function generateInterviewFeedback(interviewId: string) {
  const { userId, user } = await getCurrentUser({ allData: true });
  if (userId == null || user == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(interviewId, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  if (interview.humeChatId == null) {
    return {
      error: true,
      message: "Interview has not been completed yet",
    };
  }

  const feedback = await generateAiInterviewFeedback({
    humeChatId: interview.humeChatId,
    jobInfo: interview.jobInfo,
    userName: user.name,
  });

  if (feedback == null) {
    return {
      error: true,
      message: "Failed to generate feedback",
    };
  }

  await updateInterviewDb(interviewId, { feedback });

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
