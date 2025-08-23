import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";

export const PricingTable = () => {
  return <ClerkPricingTable newSubscriptionRedirectUrl="/app" />;
};
