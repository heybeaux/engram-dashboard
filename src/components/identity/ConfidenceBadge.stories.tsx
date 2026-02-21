import type { Meta, StoryObj } from "@storybook/react";
import { ConfidenceBadge } from "./confidence-badge";

const meta: Meta<typeof ConfidenceBadge> = {
  title: "Identity/ConfidenceBadge",
  component: ConfidenceBadge,
  argTypes: { score: { control: { type: "range", min: 0, max: 1, step: 0.01 } } },
};
export default meta;
type Story = StoryObj<typeof ConfidenceBadge>;

export const High: Story = { args: { score: 0.95 } };
export const Medium: Story = { args: { score: 0.6 } };
export const Low: Story = { args: { score: 0.3 } };
export const Zero: Story = { args: { score: 0 } };
