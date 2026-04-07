import React from 'react'
import { cn } from '@/lib/utils'

const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <div className="overflow-y-auto h-full w-full">
        {children}
      </div>
    </div>
  )
)
ScrollArea.displayName = 'ScrollArea'

export { ScrollArea }
