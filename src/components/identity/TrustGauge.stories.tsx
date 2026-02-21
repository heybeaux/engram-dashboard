import type { Meta, StoryObj } from "@storybook/react";
import { TrustGauge } from "./trust-gauge";

const meta: Meta<typeof TrustGauge> = {
  title: "Identity/TrustGauge",
  component: TrustGauge,
  argTypes: { score: { control: { type: "range", min: 0, max: 1, step: 0.01 } } },
};
export default meta;
type Story = StoryObj<typeof TrustGauge>;

export const High: Story = { args: { score: 0.92 } };
export const Medium: Story = { args: { score: 0.6 } };
export const Low: Story = { args: { score: 0.2 } };
export const Empty: Story = { args: { score: 0 } };
export const Small: Story = { args: { score: 0.75, size: "sm" } };
export const Large: Story = { args: { score: 0.75, size: "lg" } };
