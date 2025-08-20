import { SignInButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <SignInButton />
      <UserButton />
    </div>
  );
}
