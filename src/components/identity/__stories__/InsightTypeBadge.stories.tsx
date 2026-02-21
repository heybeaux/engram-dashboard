import type { Meta, StoryObj } from "@storybook/react";
import { InsightTypeBadge } from "../insight-type-badge";

const meta: Meta<typeof InsightTypeBadge> = {
  title: "Identity/InsightTypeBadge",
  component: InsightTypeBadge,
  argTypes: { type: { control: "radio", options: ["pattern", "anomaly", "suggestion", "warning"] } },
};
export default meta;
type Story = StoryObj<typeof InsightTypeBadge>;

export const Pattern: Story = { args: { type: "pattern" } };
export const Anomaly: Story = { args: { type: "anomaly" } };
export const Suggestion: Story = { args: { type: "suggestion" } };
export const Warning: Story = { args: { type: "warning" } };
