import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    color?: "purple" | "cyan" | "green" | "orange"
  }
>(({ className, value = 0, color = "purple", ...props }, ref) => {
  const colorMap = {
    purple: "bg-primary",
    cyan: "bg-secondary",
    green: "bg-[#00ff88]",
    orange: "bg-[#ff6b00]",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-secondary/20",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-in-out",
          colorMap[color]
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }

