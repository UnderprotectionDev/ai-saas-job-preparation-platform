import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <SignIn />
    </div>
  );
}
