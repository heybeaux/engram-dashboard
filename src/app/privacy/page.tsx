import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to signup
        </Link>
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Engram</p>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Engram is designed for agent memory. That can include sensitive operational context,
            so privacy and access boundaries matter.
          </p>
        </div>
        <section className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            We process account, API, telemetry, and memory data to provide the service, debug
            issues, secure accounts, and improve reliability. Access is limited to authorized
            systems and operators.
          </p>
          <p>
            Do not store secrets or third-party personal data in Engram unless you have the right
            to do so. Use account isolation, API-key rotation, and deletion controls where
            appropriate.
          </p>
          <p>
            This policy is a product placeholder while the formal privacy policy is finalized. For
            data-processing or deletion requests, contact the Engram team directly.
          </p>
        </section>
      </div>
    </main>
  );
}
