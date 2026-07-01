"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
};

type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "value" | "defaultValue"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
};

type MarkerProps = {
  children?: React.ReactNode;
  className?: string;
};

function isElementOfType<P>(
  child: React.ReactNode,
  component: React.ComponentType<P>,
): child is React.ReactElement<P> {
  return React.isValidElement(child) && child.type === component;
}

function collectItems(children: React.ReactNode): React.ReactElement<SelectItemProps>[] {
  const items: React.ReactElement<SelectItemProps>[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (isElementOfType(child, SelectItem)) {
      items.push(child);
      return;
    }

    const nested = (child.props as { children?: React.ReactNode }).children;
    if (nested) items.push(...collectItems(nested));
  });

  return items;
}

function findTriggerClassName(children: React.ReactNode): string | undefined {
  let className: string | undefined;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || className) return;
    if (isElementOfType(child, SelectTrigger)) {
      className = child.props.className;
      return;
    }

    const nested = (child.props as { children?: React.ReactNode }).children;
    if (nested) className = findTriggerClassName(nested);
  });

  return className;
}

function optionLabel(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  const parts: string[] = [];
  React.Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      parts.push(String(child));
    }
  });
  return parts.join("").trim();
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className, value, defaultValue, onValueChange, ...props }, ref) => {
    const items = collectItems(children);
    const triggerClassName = findTriggerClassName(children);

    return (
      <select
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => onValueChange?.(event.target.value)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName,
          className,
        )}
        {...props}
      >
        {items.map((item) => (
          <option key={item.props.value} value={item.props.value} disabled={item.props.disabled}>
            {optionLabel(item.props.children) || item.props.value}
          </option>
        ))}
      </select>
    );
  },
);
Select.displayName = "Select";

function SelectGroup({ children }: MarkerProps) {
  return <>{children}</>;
}
SelectGroup.displayName = "SelectGroup";

function SelectValue(_props: MarkerProps) {
  void _props;
  return null;
}
SelectValue.displayName = "SelectValue";

function SelectTrigger({ children: _children }: MarkerProps) {
  void _children;
  return null;
}
SelectTrigger.displayName = "SelectTrigger";

function SelectContent({ children }: MarkerProps) {
  return <>{children}</>;
}
SelectContent.displayName = "SelectContent";

function SelectLabel({ children }: MarkerProps) {
  return <>{children}</>;
}
SelectLabel.displayName = "SelectLabel";

function SelectItem(_props: SelectItemProps) {
  void _props;
  return null;
}
SelectItem.displayName = "SelectItem";

function SelectSeparator() {
  return null;
}
SelectSeparator.displayName = "SelectSeparator";

function SelectScrollUpButton() {
  return null;
}
SelectScrollUpButton.displayName = "SelectScrollUpButton";

function SelectScrollDownButton() {
  return null;
}
SelectScrollDownButton.displayName = "SelectScrollDownButton";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
