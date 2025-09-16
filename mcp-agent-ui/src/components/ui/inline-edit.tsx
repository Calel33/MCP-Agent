import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { InlineEditProps } from "@/types/chat"

// Based on multiple chat applications pattern with click-to-edit functionality
export function InlineEdit({
  value,
  onSave,
  onCancel,
  placeholder = "Enter name...",
  maxLength = 100,
  className,
  disabled = false,
  autoFocus = true
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(value)
  }, [value])

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing, autoFocus])

  const handleSave = async () => {
    const trimmedValue = editValue.trim()
    
    // Validation
    if (!trimmedValue) {
      setError("Name cannot be empty")
      return
    }
    
    if (trimmedValue === value) {
      // No change, just exit edit mode
      setIsEditing(false)
      setError(null)
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      await onSave(trimmedValue)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value) // Reset to original value
    setIsEditing(false)
    setError(null)
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= maxLength) {
      setEditValue(newValue)
      setError(null) // Clear error on change
    }
  }

  const handleBlur = () => {
    // Only save on blur if not cancelled via Escape
    if (isEditing) {
      handleSave()
    }
  }

  const handleClick = () => {
    if (!disabled && !isEditing) {
      setIsEditing(true)
    }
  }

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          className={cn(
            "flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          maxLength={maxLength}
        />
        
        {/* Character count indicator */}
        {maxLength && editValue.length > maxLength * 0.8 && (
          <div className="absolute -bottom-5 right-0 text-xs text-muted-foreground">
            {editValue.length}/{maxLength}
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="absolute -bottom-5 left-0 text-xs text-destructive">
            {error}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    )
  }

  return (
    <span
      onClick={handleClick}
      className={cn(
        "inline-block cursor-pointer rounded px-1 py-0.5 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
        className
      )}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Edit ${value}. Click to edit, or press Enter.`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {value || placeholder}
    </span>
  )
}
