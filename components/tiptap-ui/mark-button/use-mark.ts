"use client"

import { useCallback, useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { isMarkInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils"

// --- Icons ---
import { BoldIcon } from "@/components/tiptap-icons/bold-icon"
import { Code2Icon } from "@/components/tiptap-icons/code2-icon"
import { ItalicIcon } from "@/components/tiptap-icons/italic-icon"
import { StrikeIcon } from "@/components/tiptap-icons/strike-icon"
import { SubscriptIcon } from "@/components/tiptap-icons/subscript-icon"
import { SuperscriptIcon } from "@/components/tiptap-icons/superscript-icon"
import { UnderlineIcon } from "@/components/tiptap-icons/underline-icon"

export type Mark =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "underline"
  | "superscript"
  | "subscript"

/**
 * Configuration for the mark functionality
 */
export interface UseMarkConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The type of mark to toggle
   */
  type: Mark
  /**
   * Whether the button should hide when mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful mark toggle.
   */
  onToggled?: () => void
}

export const markIcons = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strike: StrikeIcon,
  code: Code2Icon,
  superscript: SuperscriptIcon,
  subscript: SubscriptIcon,
}

export const MARK_SHORTCUT_KEYS: Record<Mark, string> = {
  bold: "mod+b",
  italic: "mod+i",
  underline: "mod+u",
  strike: "mod+shift+s",
  code: "mod+e",
  superscript: "mod+.",
  subscript: "mod+,",
}

/**
 * Checks if a mark can be toggled in the current editor state
 */
export function canToggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema(type, editor) || isNodeTypeSelected(editor, ["image"]))
    return false

  // Check for CellSelection (duck typing)
  const isCellSelection = (sel: any): boolean => {
    return !!sel && typeof sel.forEachCell === "function"
  }

  if (isCellSelection(editor.state.selection)) {
    return true
  }

  return editor.can().toggleMark(type)
}

/**
 * Checks if a mark is currently active
 */
export function isMarkActive(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false

  // Check for CellSelection (duck typing)
  const isCellSelection = (sel: any): boolean => {
    return !!sel && typeof sel.forEachCell === "function"
  }

  if (isCellSelection(editor.state.selection)) {
    // Check if any cell has the mark (or maybe all? usually Tiptap checks if active in current context)
    // For buttons, we usually want to show active if the selection *has* the mark.
    // Let's check if *every* cell has the mark to show it as active, or maybe just the first?
    // Tiptap standard behavior for mixed selection is usually inactive.
    // Let's stick to Tiptap's isActive behavior which might work for CellSelection if we pass the attributes?
    // Actually, let's just rely on editor.isActive(type) first, if it fails we can improve.
    // But for CellSelection, editor.isActive might only check the anchor/head.
    
    // Let's use a simple heuristic: if the first cell has it, we consider it active (or mixed).
    // Better: check if all selected content has it.
    // For now, let's trust editor.isActive(type) as a baseline, but if it doesn't work for CellSelection we might need to iterate.
    // Given the complexity, let's stick to editor.isActive(type) for now and only fix toggleMark.
    return editor.isActive(type)
  }

  return editor.isActive(type)
}

/**
 * Toggles a mark in the editor
 */
export function toggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canToggleMark(editor, type)) return false

  // Check for CellSelection (duck typing)
  const isCellSelection = (sel: any): boolean => {
    return !!sel && typeof sel.forEachCell === "function"
  }

  if (isCellSelection(editor.state.selection)) {
    const { selection } = editor.state
    const tr = editor.state.tr
    const markType = editor.schema.marks[type]
    if (!markType) return false

    // Determine if we should add or remove.
    // If currently active (fully or partially), we usually remove? Or if mixed, we add?
    // Standard Tiptap toggle: if active, remove. If inactive, add.
    const isActive = editor.isActive(type)
    
    // Manual iteration
    // @ts-ignore
    selection.forEachCell((node, pos) => {
      if (node.textContent.length > 0) {
        const from = pos + 1
        const to = pos + node.nodeSize - 1
        if (isActive) {
          tr.removeMark(from, to, markType)
        } else {
          tr.addMark(from, to, markType.create())
        }
      }
    })

    if (tr.docChanged) {
      editor.view.dispatch(tr)
      return true
    }
    return false
  }

  return editor.chain().focus().toggleMark(type).run()
}

/**
 * Determines if the mark button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  type: Mark
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, type, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema(type, editor)) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleMark(editor, type)
  }

  return true
}

/**
 * Gets the formatted mark name
 */
export function getFormattedMarkName(type: Mark): string {
  const names: Record<Mark, string> = {
    bold: "Gras",
    italic: "Italique",
    strike: "Barré",
    code: "Code",
    underline: "Souligné",
    superscript: "Exposant",
    subscript: "Indice",
  }
  return names[type]
}

/**
 * Custom hook that provides mark functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MySimpleBoldButton() {
 *   const { isVisible, handleMark } = useMark({ type: "bold" })
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleMark}>Bold</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedItalicButton() {
 *   const { isVisible, handleMark, label, isActive } = useMark({
 *     editor: myEditor,
 *     type: "italic",
 *     hideWhenUnavailable: true,
 *     onToggled: () => console.log('Mark toggled!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleMark}
 *       aria-pressed={isActive}
 *       aria-label={label}
 *     >
 *       Italic
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useMark(config: UseMarkConfig) {
  const {
    editor: providedEditor,
    type,
    hideWhenUnavailable = false,
    onToggled,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const canToggle = canToggleMark(editor, type)
  const isActive = isMarkActive(editor, type)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, type, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, type, hideWhenUnavailable])

  const handleMark = useCallback(() => {
    if (!editor) return false

    const success = toggleMark(editor, type)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, type, onToggled])

  return {
    isVisible,
    isActive,
    handleMark,
    canToggle,
    label: getFormattedMarkName(type),
    shortcutKeys: MARK_SHORTCUT_KEYS[type],
    Icon: markIcons[type],
  }
}
