import { Brain } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Engram</span>
          </Link>
          <p className="text-sm text-muted-foreground">Memory infrastructure for AI agents</p>
        </div>
        {children}
      </div>
    </div>
  );
}
