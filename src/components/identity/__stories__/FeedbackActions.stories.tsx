import type { Meta, StoryObj } from "@storybook/react";
import { FeedbackActions } from "../feedback-actions";
import { fn } from "@storybook/test";

const meta: Meta<typeof FeedbackActions> = {
  title: "Identity/FeedbackActions",
  component: FeedbackActions,
  args: { onHelpful: fn(), onNotHelpful: fn(), onFlag: fn() },
};
export default meta;
type Story = StoryObj<typeof FeedbackActions>;

export const Default: Story = {};
export const NoFlag: Story = { args: { onFlag: undefined } };
