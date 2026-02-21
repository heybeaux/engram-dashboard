import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Identity/StatusBadge",
  component: StatusBadge,
};
export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Active: Story = { args: { status: "active" } };
export const Pending: Story = { args: { status: "pending" } };
export const Expired: Story = { args: { status: "expired" } };
export const Failed: Story = { args: { status: "failed" } };
export const Completed: Story = { args: { status: "completed" } };
export const Draft: Story = { args: { status: "draft" } };
export const Unknown: Story = { args: { status: "custom-status" } };
