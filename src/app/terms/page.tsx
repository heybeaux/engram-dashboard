import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to signup
        </Link>
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Engram</p>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">
            Engram stores and retrieves memory infrastructure for AI agents. By using Engram,
            you agree to use the service lawfully, protect your credentials, and avoid submitting
            data you are not authorized to process.
          </p>
        </div>
        <section className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            This dashboard is provided for authorized users and teams. Access may be suspended
            for abuse, attempted unauthorized access, or activity that risks platform integrity.
          </p>
          <p>
            API keys and agent credentials are your responsibility. Rotate credentials if they are
            exposed and avoid embedding them in public repositories, logs, or client-side code.
          </p>
          <p>
            These terms are a product placeholder while the formal legal terms are finalized. If
            you need a signed commercial agreement, contact the Engram team directly.
          </p>
        </section>
      </div>
    </main>
  );
}
