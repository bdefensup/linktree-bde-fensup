"use client"

import { forwardRef, useCallback, useState } from "react"
import { Sigma } from "lucide-react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"

// --- Components ---
import { MathEditCard } from "./math-edit-card"

export interface MathPopoverProps extends Omit<ButtonProps, "type"> {
  editor?: any
}

export const MathPopover = forwardRef<HTMLButtonElement, MathPopoverProps>(
  ({ editor: providedEditor, className, ...props }, ref) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isOpen, setIsOpen] = useState(false)
    const [formula, setFormula] = useState("")

    const handleApply = useCallback(() => {
      if (formula && editor) {
        editor.chain().focus().insertInlineMath({ latex: formula }).run()
        setFormula("")
        setIsOpen(false)
      }
    }, [editor, formula])

    if (!editor) {
      return null
    }

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className={className}
            data-style="ghost"
            tooltip="Mathématiques"
            ref={ref}
            {...props}
          >
            <Sigma className="tiptap-button-icon" />
          </Button>
        </PopoverTrigger>

        <PopoverContent>
          <MathEditCard
            formula={formula}
            setFormula={setFormula}
            onApply={handleApply}
            onCancel={() => setIsOpen(false)}
          />
        </PopoverContent>
      </Popover>
    )
  }
)

MathPopover.displayName = "MathPopover"
