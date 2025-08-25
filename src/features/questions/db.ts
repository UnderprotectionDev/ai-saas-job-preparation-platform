import { db } from "@/drizzle/db";
import { QuestionTable } from "@/drizzle/schema";
import { revalidateQuestionCache } from "./db-cache";

export async function insertQuestion(
  question: typeof QuestionTable.$inferInsert
) {
  const [newQuestion] = await db
    .insert(QuestionTable)
    .values(question)
    .returning({
      id: QuestionTable.id,
      jobInfoId: QuestionTable.jobInfoId,
    });

  revalidateQuestionCache({
    id: newQuestion.id,
    jobInfoId: newQuestion.jobInfoId,
  });

  return newQuestion;
}
