import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "../status-dot";

const meta: Meta<typeof StatusDot> = {
  title: "Identity/StatusDot",
  component: StatusDot,
  argTypes: {
    status: { control: "radio", options: ["active", "idle", "offline", "error"] },
    pulse: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Active: Story = { args: { status: "active" } };
export const ActivePulsing: Story = { args: { status: "active", pulse: true } };
export const Idle: Story = { args: { status: "idle" } };
export const Offline: Story = { args: { status: "offline" } };
export const Error: Story = { args: { status: "error" } };
export const ErrorPulsing: Story = { args: { status: "error", pulse: true } };
