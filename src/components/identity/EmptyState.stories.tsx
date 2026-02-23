import type { Meta, StoryObj } from "@storybook/nextjs";
import { EmptyState } from "./EmptyState";
import { Search, AlertTriangle } from "lucide-react";

const meta: Meta<typeof EmptyState> = {
  title: "Identity/EmptyState",
  component: EmptyState,
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: { title: "No items found", description: "Try adjusting your filters." },
};
export const WithCustomIcon: Story = {
  args: { title: "No results", description: "Your search returned nothing.", icon: Search },
};
export const Error: Story = {
  args: { title: "Something went wrong", description: "Please try again later.", icon: AlertTriangle },
};
export const Minimal: Story = {
  args: { title: "Empty" },
};
