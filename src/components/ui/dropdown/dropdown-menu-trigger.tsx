
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"

/**
 * Component for triggering dropdown menus
 */
export const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, children, asChild = false, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn("outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 data-[state=open]:bg-purple-600/30", className)}
    asChild={asChild}
    {...props}
  >
    {asChild ? children : <button>{children}</button>}
  </DropdownMenuPrimitive.Trigger>
))
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName
