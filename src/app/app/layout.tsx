import { getCurrentUser } from "@/services/clerk/lib/get-current-user";
import { redirect } from "next/navigation";
import { Navbar } from "./_navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  if (user == null) return redirect("/onboarding");

  return (
    <>
      <Navbar user={user} />
      {children}
    </>
  );
}
