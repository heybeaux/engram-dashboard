import type { Meta, StoryObj } from "@storybook/react";
import { TrustGauge } from "./TrustGauge";

const meta: Meta<typeof TrustGauge> = {
  title: "Identity/TrustGauge",
  component: TrustGauge,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof TrustGauge>;

export const HighTrust: Story = { args: { score: 0.9 } };
export const MediumTrust: Story = { args: { score: 0.55 } };
export const LowTrust: Story = { args: { score: 0.15 } };
export const Perfect: Story = { args: { score: 1.0, label: "Perfect" } };
export const Zero: Story = { args: { score: 0 } };
export const Small: Story = { args: { score: 0.7, size: 60 } };
export const Large: Story = { args: { score: 0.7, size: 200 } };
