"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
  }
>(
  (
    { className, value, onValueChange, defaultValue, children, ...props },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(
      value || defaultValue || ""
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === SelectTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => setOpen(!open),
              "aria-expanded": open,
              children: React.Children.map(
                child.props.children,
                (triggerChild) => {
                  if (
                    React.isValidElement(triggerChild) &&
                    triggerChild.type === SelectValue
                  ) {
                    // Find the selected option label
                    let selectedLabel = selectedValue;
                    React.Children.forEach(children, (contentChild) => {
                      if (
                        React.isValidElement(contentChild) &&
                        contentChild.type === SelectContent
                      ) {
                        React.Children.forEach(
                          contentChild.props.children,
                          (item) => {
                            if (
                              React.isValidElement(item) &&
                              item.type === SelectItem &&
                              item.props.value === selectedValue
                            ) {
                              selectedLabel = item.props.children;
                            }
                          }
                        );
                      }
                    });
                    return React.cloneElement(
                      triggerChild as React.ReactElement<any>,
                      {
                        children: selectedLabel,
                      }
                    );
                  }
                  return triggerChild;
                }
              ),
            });
          }
          if (React.isValidElement(child) && child.type === SelectContent) {
            return open ? (
              <div className="absolute top-full left-0 z-50 mt-1 w-full">
                {React.cloneElement(child as React.ReactElement<any>, {
                  children: React.Children.map(
                    child.props.children,
                    (contentChild) => {
                      if (
                        React.isValidElement(contentChild) &&
                        contentChild.type === SelectItem
                      ) {
                        return React.cloneElement(
                          contentChild as React.ReactElement<any>,
                          {
                            onClick: () => {
                              setSelectedValue(contentChild.props.value);
                              if (onValueChange) {
                                onValueChange(contentChild.props.value);
                              }
                              setOpen(false);
                            },
                            selected:
                              contentChild.props.value === selectedValue,
                          }
                        );
                      }
                      return contentChild;
                    }
                  ),
                })}
              </div>
            ) : null;
          }
          return child;
        })}
      </div>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("text-sm", className)} {...props} />
));
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-popover text-popover-foreground rounded-md border border-input border-gray-800/70 bg-background shadow-md",
      className
    )}
    {...props}
  >
    <div className="p-1">{children}</div>
  </div>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; selected?: boolean }
>(({ className, children, selected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground hover:bg-gray-800/30",
      selected && "bg-gray-800/40",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      {selected && <Check className="h-4 w-4" />}
    </span>
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
