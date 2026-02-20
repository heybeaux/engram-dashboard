"use client";

import { EditionGuard } from "@/components/edition-guard";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Brain,
  Zap,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  getAccount,
  createCheckout,
  getBillingPortal,
  type Account,
} from "@/lib/account-api";
import { trackEvent } from "@/lib/posthog";
import { useInstance } from "@/context/instance-context";
import { toast } from "sonner";

// ── Plan definitions ──────────────────────────────────────────────────────────

interface PlanDef {
  id: string;
  name: string;
  price: string;
  priceNote?: string;
  features: string[];
  limits: { memories: number; apiCalls: number; agents: number };
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNote: "forever",
    features: [
      "1,000 memories",
      "100 API calls/day",
      "1 agent",
      "Community support",
    ],
    limits: { memories: 1_000, apiCalls: 100, agents: 1 },
  },
  {
    id: "starter",
    name: "Starter",
    price: "$9",
    priceNote: "/month",
    features: [
      "10,000 memories",
      "1,000 API calls/day",
      "3 agents",
      "Email support",
      "Webhooks",
    ],
    limits: { memories: 10_000, apiCalls: 1_000, agents: 3 },
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39",
    priceNote: "/month",
    features: [
      "100,000 memories",
      "10,000 API calls/day",
      "10 agents",
      "Priority support",
      "Webhooks",
      "Ensemble drift detection",
      "Advanced analytics",
    ],
    limits: { memories: 100_000, apiCalls: 10_000, agents: 10 },
  },
  {
    id: "scale",
    name: "Scale",
    price: "$99",
    priceNote: "/month",
    features: [
      "1,000,000 memories",
      "100,000 API calls/day",
      "Unlimited agents",
      "Dedicated support",
      "SSO / SAML",
      "Custom retention policies",
      "SLA guarantee",
    ],
    limits: { memories: 1_000_000, apiCalls: 100_000, agents: Infinity },
  },
];

function getPlanLimits(planId: string) {
  return PLANS.find((p) => p.id === planId)?.limits ?? PLANS[0].limits;
}

// ── Progress bar component ────────────────────────────────────────────────────

function UsageMeter({
  label,
  used,
  limit,
  icon: Icon,
}: {
  label: string;
  used: number;
  limit: number;
  icon: React.ElementType;
}) {
  const isUnlimited = !isFinite(limit);
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isHigh = pct > 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </span>
        <span className="text-muted-foreground">
          {used.toLocaleString()} /{" "}
          {isUnlimited ? "∞" : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            isHigh ? "bg-destructive" : "bg-primary"
          }`}
          style={{ width: isUnlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  return (
    <EditionGuard edition="cloud">
      <BillingPageContent />
    </EditionGuard>
  );
}

function BillingPageContent() {
  const { mode } = useInstance();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAccount();
      setAccount(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpgrade = async (planId: string) => {
    setCheckoutLoading(planId);
    trackEvent('plan_upgraded', { plan: planId, from: currentPlan });
    try {
      const { url } = await createCheckout(planId.toUpperCase());
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { url } = await getBillingPortal();
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Billing</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Billing</h1>
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={load}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Self-hosted mode: don't show Stripe checkout, point to cloud
  if (mode === "self-hosted") {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Billing</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              You&apos;re running a self-hosted instance. Billing is managed through OpenEngram Cloud.
            </p>
            <a
              href="https://app.openengram.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary underline hover:text-primary/80"
            >
              Manage your cloud subscription at app.openengram.ai
              <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlan = account?.plan ?? "free";
  const limits = getPlanLimits(currentPlan);
  const currentPlanDef = PLANS.find((p) => p.id === currentPlan);
  const isFreeTier = currentPlan === "free";

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Billing</h1>
        {!isFreeTier && (
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="h-11 w-full sm:w-auto"
          >
            {portalLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Manage Subscription
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Free tier upgrade CTA */}
      {isFreeTier && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
            <div>
              <h3 className="font-semibold text-lg">
                Upgrade to unlock more
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Get more memories, API calls, and agents with a paid plan.
              </p>
            </div>
            <Button
              onClick={() => handleUpgrade("pro")}
              disabled={checkoutLoading === "pro"}
              className="shrink-0"
            >
              {checkoutLoading === "pro" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current plan & usage */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              Current Plan
              <Badge variant="outline" className="ml-1">
                {currentPlanDef?.name ?? currentPlan}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(currentPlanDef?.features ?? []).map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg">Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <UsageMeter
              label="Memories"
              used={account?.memoriesUsed ?? 0}
              limit={limits.memories}
              icon={Brain}
            />
            <UsageMeter
              label="API Calls Today"
              used={account?.apiCallsToday ?? 0}
              limit={limits.apiCalls}
              icon={Zap}
            />
            <UsageMeter
              label="Agents"
              used={account?.agents?.length ?? 0}
              limit={limits.agents}
              icon={Users}
            />
          </CardContent>
        </Card>
      </div>

      {/* Plan comparison */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Compare Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              const isDowngrade =
                PLANS.findIndex((p) => p.id === plan.id) <
                PLANS.findIndex((p) => p.id === currentPlan);

              return (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 flex flex-col ${
                    isCurrent
                      ? "border-primary ring-1 ring-primary bg-muted/50"
                      : ""
                  }`}
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{plan.name}</h4>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      {plan.priceNote && (
                        <span className="text-sm text-muted-foreground">
                          {plan.priceNote}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-1.5 flex-1 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" disabled className="h-10 w-full">
                      Current Plan
                    </Button>
                  ) : isDowngrade ? (
                    <Button
                      variant="outline"
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                      className="h-10 w-full"
                    >
                      Downgrade
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={checkoutLoading === plan.id}
                      className="h-10 w-full"
                    >
                      {checkoutLoading === plan.id && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Upgrade
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
