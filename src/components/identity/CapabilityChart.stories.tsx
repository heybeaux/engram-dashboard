import type { Meta, StoryObj } from "@storybook/react";
import { CapabilityChart } from "./CapabilityChart";

const meta: Meta<typeof CapabilityChart> = {
  title: "Identity/CapabilityChart",
  component: CapabilityChart,
};
export default meta;
type Story = StoryObj<typeof CapabilityChart>;

export const Populated: Story = {
  args: {
    capabilities: [
      { domain: "Code Generation", score: 0.92 },
      { domain: "Summarization", score: 0.78 },
      { domain: "Data Analysis", score: 0.65 },
      { domain: "Translation", score: 0.4 },
    ],
  },
};
export const Single: Story = {
  args: { capabilities: [{ domain: "Reasoning", score: 0.85 }] },
};
export const Empty: Story = {
  args: { capabilities: [] },
};
export const AllLow: Story = {
  args: {
    capabilities: [
      { domain: "A", score: 0.1 },
      { domain: "B", score: 0.15 },
      { domain: "C", score: 0.05 },
    ],
  },
};
