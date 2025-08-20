import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  return <OriginalClerkProvider>{children}</OriginalClerkProvider>;
};
