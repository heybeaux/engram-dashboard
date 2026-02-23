import type { Meta, StoryObj } from "@storybook/nextjs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with some text.</p>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">Footer text</p>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-80 p-6">
      <p>Simple card with just content.</p>
    </Card>
  ),
};

export const WithStats: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardDescription>Total Memories</CardDescription>
        <CardTitle className="text-3xl">1,234</CardTitle>
      </CardHeader>
    </Card>
  ),
};
