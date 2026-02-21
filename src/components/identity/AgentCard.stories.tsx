import type { Meta, StoryObj } from "@storybook/nextjs";
import { AgentCard } from "./AgentCard";

const meta: Meta<typeof AgentCard> = {
  title: "Identity/AgentCard",
  component: AgentCard,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof AgentCard>;

export const Default: Story = {
  args: {
    name: "claude-3-opus",
    fingerprint: "fp_abc123def456",
    trustScore: 0.85,
    status: "active",
    domains: ["memory", "reasoning", "code"],
  },
};

export const LowTrust: Story = {
  args: {
    name: "untrusted-agent",
    fingerprint: "fp_xyz789",
    trustScore: 0.2,
    status: "pending",
    domains: ["general"],
  },
};

export const NoData: Story = {
  args: {
    name: "minimal-agent",
  },
};

export const Expired: Story = {
  args: {
    name: "old-agent",
    fingerprint: "fp_old000",
    trustScore: 0.5,
    status: "expired",
    domains: [],
  },
};
