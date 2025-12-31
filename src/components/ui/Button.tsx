import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-display font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-glow-purple hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
        primary:
          "bg-primary text-primary-foreground shadow-glow-purple hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary/20 text-secondary border border-secondary/50 hover:bg-secondary/30 hover:border-secondary",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "bg-primary text-primary-foreground shadow-glow-purple animate-glow-pulse hover:scale-[1.02]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-sm",
        lg: "h-12 rounded-lg px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  glow?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, glow = false, loading = false, icon, iconPosition = 'left', children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const renderContent = () => {
      if (loading) {
        return (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        )
      }
      
      if (icon) {
        return iconPosition === 'left' ? (
          <>
            {icon}
            {children}
          </>
        ) : (
          <>
            {children}
            {icon}
          </>
        )
      }
      
      return children
    }
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          glow && 'shadow-glow-purple animate-glow-pulse',
          loading && 'cursor-wait'
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {renderContent()}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
