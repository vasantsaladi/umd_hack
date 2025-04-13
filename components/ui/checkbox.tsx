"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onCheckedChange?: (checked: boolean) => void;
  }
>(({ className, onCheckedChange, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-background",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
      <Check className="absolute h-3 w-3 text-primary opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5 top-0.5" />
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
