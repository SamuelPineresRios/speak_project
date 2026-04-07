import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-4 w-full overflow-hidden rounded-full bg-slate-700', className)}
      {...props}
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
)
Progress.displayName = 'Progress'

export { Progress }
