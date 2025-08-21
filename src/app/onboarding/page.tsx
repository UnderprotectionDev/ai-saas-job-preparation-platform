import { getCurrentUser } from "@/services/clerk/lib/get-current-user";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./_client";

export default async function OnboardingPage() {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  if (user != null) return redirect("/app");

  return (
    <div className="container flex flex-col items-center justify-center h-screen gap-4">
      <OnboardingClient userId={userId} />
    </div>
  );
}
