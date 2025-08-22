import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export const BackLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3", className)}
      asChild
    >
      <Link
        href={href}
        className="flex gap-2 items-center text-sm text-muted-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        {children}
      </Link>
    </Button>
  );
};
