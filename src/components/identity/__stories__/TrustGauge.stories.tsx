import type { Meta, StoryObj } from "@storybook/react";
import { TrustGauge } from "../trust-gauge";

const meta: Meta<typeof TrustGauge> = {
  title: "Identity/TrustGauge",
  component: TrustGauge,
  argTypes: {
    score: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;
type Story = StoryObj<typeof TrustGauge>;

export const High: Story = { args: { score: 0.92, size: "md" } };
export const Medium: Story = { args: { score: 0.6, size: "md" } };
export const Low: Story = { args: { score: 0.2, size: "md" } };
export const Empty: Story = { args: { score: 0, size: "md" } };
export const Full: Story = { args: { score: 1, size: "md" } };
export const Small: Story = { args: { score: 0.75, size: "sm" } };
export const Large: Story = { args: { score: 0.75, size: "lg" } };
