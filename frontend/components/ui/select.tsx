'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const Select: React.FC<SelectProps> = ({
  value,
  defaultValue = '',
  onValueChange,
  children,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [isOpen, setIsOpen] = useState(false)
  const currentValue = value ?? internalValue

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: onValueChange || setInternalValue,
        isOpen,
        setIsOpen,
      }}
    >
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectTrigger must be used within Select')

  return (
    <button
      ref={ref}
      onClick={() => context.setIsOpen(!context.isOpen)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500',
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder = 'Select...' }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectValue must be used within Select')

  return context.value ? <span>{context.value}</span> : <span className="text-slate-500">{placeholder}</span>
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error('SelectContent must be used within Select')

    return context.isOpen ? (
      <div
        ref={ref}
        className={cn(
          'absolute top-full left-0 right-0 z-50 mt-2 rounded-md border border-slate-700 bg-slate-800 shadow-md',
          className
        )}
        {...props}
      >
        {children}
      </div>
    ) : null
  }
)
SelectContent.displayName = 'SelectContent'

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, onClick, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error('SelectItem must be used within Select')

    return (
      <div
        ref={ref}
        onClick={(e) => {
          context.onValueChange(value)
          context.setIsOpen(false)
          onClick?.(e)
        }}
        className={cn(
          'cursor-pointer px-3 py-2 text-sm hover:bg-slate-700 transition-colors',
          context.value === value ? 'bg-cyan-600/20 text-cyan-300' : 'text-slate-300'
        )}
        {...props}
      />
    )
  }
)
SelectItem.displayName = 'SelectItem'

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
