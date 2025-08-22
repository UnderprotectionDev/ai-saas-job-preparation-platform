import { BackLink } from "@/components/backlink";
import { Card, CardContent } from "@/components/ui/card";
import { JobInfoForm } from "@/features/job-infos/components/job-info-form";

export default function JobInfoNewPage() {
  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <BackLink href="/app">Dashboard</BackLink>
      <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4">
        Create New Job Description
      </h1>
      <Card>
        <CardContent>
          <JobInfoForm />
        </CardContent>
      </Card>
    </div>
  );
}
