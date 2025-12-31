import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-display",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary/20 text-secondary border-secondary/50",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/50",
        warning:
          "border-transparent bg-[#ff6b00]/20 text-[#ff6b00] border-[#ff6b00]/50",
        info:
          "border-transparent bg-secondary/20 text-secondary border-secondary/50",
        purple:
          "border-transparent bg-primary/20 text-primary border-primary/50 shadow-sm",
        cyan:
          "border-transparent bg-secondary/20 text-secondary border-secondary/50 shadow-sm",
        pink:
          "border-transparent bg-accent/20 text-accent border-accent/50 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
