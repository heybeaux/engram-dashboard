import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Code2, Globe2, Server } from "lucide-react";

export function CodeComingSoon() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Code Search</h1>
        <p className="text-muted-foreground">
          Semantic search across indexed codebases
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Code2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex justify-center">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              Coming soon
            </Badge>
          </div>
          <CardTitle>Cloud code search is coming soon</CardTitle>
          <CardDescription className="max-w-lg mx-auto">
            Engram Code will be enabled after the dedicated Railway service is wired to the
            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">code.openengram.ai</code>
            subdomain through GoDaddy DNS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="mx-auto grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <Server className="mb-2 h-5 w-5 text-muted-foreground" />
              <div className="font-medium">Service setup in progress</div>
              <p className="mt-1 text-sm text-muted-foreground">
                The cloud dashboard will stay quiet until engram-code and its embed service are live.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <Globe2 className="mb-2 h-5 w-5 text-muted-foreground" />
              <div className="font-medium">DNS pending</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Once the subdomain resolves, this page can switch from placeholder to live data.
              </p>
            </div>
          </div>

          <Link href="/dashboard">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
