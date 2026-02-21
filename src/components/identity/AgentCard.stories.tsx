import type { Meta, StoryObj } from "@storybook/react";
import { AgentCard } from "./AgentCard";

const meta: Meta<typeof AgentCard> = {
  title: "Identity/AgentCard",
  component: AgentCard,
};
export default meta;
type Story = StoryObj<typeof AgentCard>;

export const Default: Story = {
  args: {
    name: "claude-3-opus",
    fingerprint: "fp_abc123def456",
    trustScore: 0.92,
    status: "active",
    domains: ["Code", "Analysis"],
  },
};
export const NoTrust: Story = {
  args: { name: "new-agent", status: "pending" },
};
export const Expired: Story = {
  args: {
    name: "old-agent",
    fingerprint: "fp_old789",
    trustScore: 0.3,
    status: "expired",
    domains: ["Legacy"],
  },
};
export const Minimal: Story = {
  args: { name: "unnamed" },
};
