"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Mobile-friendly data list that replaces tables on small screens

interface DataListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DataList = React.forwardRef<HTMLDivElement, DataListProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-3", className)} {...props}>
      {children}
    </div>
  )
);
DataList.displayName = "DataList";

interface DataListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DataListItem = React.forwardRef<HTMLDivElement, DataListItemProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card p-4 space-y-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DataListItem.displayName = "DataListItem";

interface DataListRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  children: React.ReactNode;
}

const DataListRow = React.forwardRef<HTMLDivElement, DataListRowProps>(
  ({ className, label, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-2", className)}
      {...props}
    >
      {label && (
        <span className="text-sm font-medium text-muted-foreground shrink-0">
          {label}
        </span>
      )}
      <div className="text-sm text-right">{children}</div>
    </div>
  )
);
DataListRow.displayName = "DataListRow";

interface DataListHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DataListHeader = React.forwardRef<HTMLDivElement, DataListHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-medium", className)}
      {...props}
    >
      {children}
    </div>
  )
);
DataListHeader.displayName = "DataListHeader";

interface DataListActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DataListActions = React.forwardRef<HTMLDivElement, DataListActionsProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 pt-2 border-t",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DataListActions.displayName = "DataListActions";

export {
  DataList,
  DataListItem,
  DataListRow,
  DataListHeader,
  DataListActions,
};
