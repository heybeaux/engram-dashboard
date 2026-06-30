export type AuditRoute = {
  path: string;
  name: string;
  kind: "public" | "auth" | "dashboard";
  viewport?: "desktop" | "mobile" | "both";
};

export const PUBLIC_ROUTES: AuditRoute[] = [
  { path: "/docs", name: "Docs Home", kind: "public" },
  { path: "/docs/introduction", name: "Docs Introduction", kind: "public" },
  { path: "/docs/quickstart", name: "Docs Quickstart", kind: "public" },
  { path: "/docs/api", name: "Docs API", kind: "public" },
  { path: "/docs/sdk", name: "Docs SDK", kind: "public" },
  { path: "/docs/architecture", name: "Docs Architecture", kind: "public" },
  { path: "/docs/concepts/awareness", name: "Docs Awareness", kind: "public" },
  { path: "/docs/concepts/delegation", name: "Docs Delegation", kind: "public" },
  { path: "/docs/concepts/extraction", name: "Docs Extraction", kind: "public" },
  { path: "/docs/concepts/identity", name: "Docs Identity", kind: "public" },
  { path: "/docs/concepts/layers", name: "Docs Layers", kind: "public" },
  { path: "/docs/concepts/trust", name: "Docs Trust", kind: "public" },
  { path: "/docs/concepts/types", name: "Docs Types", kind: "public" },
  { path: "/docs/integration/openclaw", name: "Docs OpenClaw Integration", kind: "public" },
  { path: "/docs/intelligence/consolidation", name: "Docs Consolidation", kind: "public" },
  { path: "/docs/intelligence/effective-score", name: "Docs Effective Score", kind: "public" },
  { path: "/docs/intelligence/safety", name: "Docs Safety", kind: "public" },
  { path: "/docs/operations/configuration", name: "Docs Configuration", kind: "public" },
  { path: "/docs/operations/health", name: "Docs Health", kind: "public" },
  { path: "/docs/operations/migration", name: "Docs Migration", kind: "public" },
  { path: "/docs/operations/self-hosting", name: "Docs Self Hosting", kind: "public" },
  { path: "/docs/operations/sync", name: "Docs Sync", kind: "public" },
];

export const AUTH_ROUTES: AuditRoute[] = [
  { path: "/login", name: "Login", kind: "auth" },
  { path: "/signup", name: "Signup", kind: "auth" },
  { path: "/forgot-password", name: "Forgot Password", kind: "auth" },
  { path: "/reset-password", name: "Reset Password", kind: "auth" },
  { path: "/setup", name: "Setup", kind: "auth" },
];

export const DASHBOARD_ROUTES: AuditRoute[] = [
  { path: "/dashboard", name: "Dashboard", kind: "dashboard", viewport: "both" },
  { path: "/memories", name: "Memories", kind: "dashboard", viewport: "both" },
  { path: "/memories/merge-review", name: "Merge Review", kind: "dashboard" },
  { path: "/sessions", name: "Sessions", kind: "dashboard" },
  { path: "/graph", name: "Graph", kind: "dashboard", viewport: "both" },
  { path: "/consolidation", name: "Consolidation", kind: "dashboard" },
  { path: "/sources", name: "Sources", kind: "dashboard" },
  { path: "/pools", name: "Pools", kind: "dashboard" },
  { path: "/analytics", name: "Analytics", kind: "dashboard" },
  { path: "/api-keys", name: "API Keys", kind: "dashboard" },
  { path: "/settings", name: "Settings", kind: "dashboard" },
  { path: "/settings/cloud", name: "Settings Cloud", kind: "dashboard" },
  { path: "/settings/sync", name: "Settings Sync", kind: "dashboard" },
  { path: "/settings/sync/reconcile", name: "Settings Sync Reconcile", kind: "dashboard" },
  { path: "/settings/reconcile", name: "Settings Reconcile", kind: "dashboard" },
  { path: "/identity", name: "Identity", kind: "dashboard", viewport: "both" },
  { path: "/identity/contracts", name: "Identity Contracts", kind: "dashboard" },
  { path: "/identity/teams", name: "Identity Teams", kind: "dashboard" },
  { path: "/identity/trust", name: "Identity Trust", kind: "dashboard" },
  { path: "/identity/recall", name: "Identity Recall", kind: "dashboard" },
  { path: "/identity/export", name: "Identity Export", kind: "dashboard" },
  { path: "/identity/challenges", name: "Identity Challenges", kind: "dashboard" },
  { path: "/agents", name: "Agents", kind: "dashboard" },
  { path: "/delegation", name: "Delegation", kind: "dashboard" },
  { path: "/delegation/recall", name: "Delegation Recall", kind: "dashboard" },
  { path: "/teams", name: "Teams", kind: "dashboard" },
  { path: "/challenges", name: "Challenges", kind: "dashboard" },
  { path: "/insights", name: "Insights", kind: "dashboard" },
  { path: "/insights/notifications", name: "Insights Notifications", kind: "dashboard" },
  { path: "/code", name: "Code", kind: "dashboard" },
  { path: "/code/projects", name: "Code Projects", kind: "dashboard" },
  { path: "/ensemble", name: "Ensemble", kind: "dashboard" },
  { path: "/ensemble/drift", name: "Ensemble Drift", kind: "dashboard" },
  { path: "/billing", name: "Billing", kind: "dashboard" },
  { path: "/billing/success", name: "Billing Success", kind: "dashboard" },
  { path: "/billing/cancel", name: "Billing Cancel", kind: "dashboard" },
  { path: "/onboarding", name: "Onboarding", kind: "dashboard" },
  { path: "/status", name: "Status", kind: "dashboard" },
  { path: "/users", name: "Users", kind: "dashboard" },
  { path: "/admin/users", name: "Admin Users", kind: "dashboard" },
];

export const AUDIT_ROUTES: AuditRoute[] = [
  ...AUTH_ROUTES,
  ...PUBLIC_ROUTES,
  ...DASHBOARD_ROUTES,
];
