"use client"

import { useCallback, useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { type Editor } from "@tiptap/react"
import { NodeSelection } from "@tiptap/pm/state"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

// --- Lib ---
import { isExtensionAvailable } from "@/lib/tiptap-utils"

// --- Icons ---
import { AlignCenterVerticalIcon } from "@/components/tiptap-icons/align-center-vertical-icon"
import { AlignEndVerticalIcon } from "@/components/tiptap-icons/align-end-vertical-icon"
import { AlignStartVerticalIcon } from "@/components/tiptap-icons/align-start-vertical-icon"

export type TableNodeAlign = "left" | "center" | "right"

/**
 * Configuration for the table node align functionality
 */
export interface UseTableNodeAlignConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The alignment to apply.
   */
  align: TableNodeAlign
  /**
   * The name of the table extension to target.
   * @default "table"
   */
  extensionName?: string
  /**
   * The attribute name used for alignment.
   * @default "nodeTextAlign"
   */
  attributeName?: string
  /**
   * Whether the button should hide when alignment is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful alignment change.
   */
  onAligned?: () => void
}

export const TABLE_NODE_ALIGN_SHORTCUT_KEYS: Record<TableNodeAlign, string> = {
  left: "alt+shift+l",
  center: "alt+shift+e",
  right: "alt+shift+r",
}

export const tableNodeAlignIcons = {
  left: AlignStartVerticalIcon,
  center: AlignCenterVerticalIcon,
  right: AlignEndVerticalIcon,
}

export const tableNodeAlignLabels: Record<TableNodeAlign, string> = {
  left: "Aligner le tableau à gauche",
  center: "Centrer le tableau",
  right: "Aligner le tableau à droite",
}

/**
 * Checks if table alignment can be performed in the current editor state
 */
export function canSetTableNodeAlign(
  editor: Editor | null,
  _align: TableNodeAlign,
  extensionName: string = "table",
  _attributeName: string = "nodeTextAlign"
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, [extensionName])) return false

  // Check if a table is selected or if the selection is inside a table
  // Ideally, we want to align the table node itself.
  // If we are inside a table, we might need to select the table node first?
  // Or just update the attribute of the table node at the current position.
  
  // For simplicity, we check if we can update the attribute on the 'table' node.
  // However, 'updateAttributes' typically works on the selection.
  // If the selection is inside the table, we might need to find the table pos.
  
  return true // Simplified check, as 'updateAttributes' logic handles the rest or we use 'setNodeTextAlign'
}

/**
 * Checks if the table alignment is currently active
 */
export function isTableNodeAlignActive(
  editor: Editor | null,
  align: TableNodeAlign,
  extensionName: string = "table",
  attributeName: string = "nodeTextAlign"
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, [extensionName])) return false

  // We need to check the attribute of the currently selected table or the table around the selection
  const { selection } = editor.state
  let tableNode = null
  
  if (selection instanceof NodeSelection && selection.node.type.name === extensionName) {
      tableNode = selection.node
  } else {
      // Find table ancestor
      let depth = selection.$anchor.depth
      while (depth > 0) {
          const node = selection.$anchor.node(depth)
          if (node.type.name === extensionName) {
              tableNode = node
              break
          }
          depth--
      }
  }

  if (!tableNode) return false

  const currentAlign = tableNode.attrs[attributeName] || "center" // Default might be center or none
  return currentAlign === align
}

/**
 * Sets table alignment in the editor
 */
export function setTableNodeAlign(
  editor: Editor | null,
  align: TableNodeAlign,
  extensionName: string = "table",
  attributeName: string = "nodeTextAlign"
): boolean {
  if (!editor?.isEditable) {
    return false
  }

  if (!isExtensionAvailable(editor, [extensionName])) {
    return false
  }

  try {
    const { state, view } = editor
    const { selection } = state
    let tablePos: number | null = null
    let tableNode: any = null

    // Check if selection is a NodeSelection of a table
    if (selection instanceof NodeSelection && selection.node.type.name === extensionName) {
      tablePos = selection.from
      tableNode = selection.node
    } else {
      // Find table ancestor
      let depth = selection.$anchor.depth
      while (depth > 0) {
        const node = selection.$anchor.node(depth)
        if (node.type.name === extensionName) {
          tablePos = selection.$anchor.before(depth)
          tableNode = node
          break
        }
        depth--
      }
    }

    if (tablePos !== null && tableNode) {
      const tr = state.tr.setNodeMarkup(tablePos, undefined, {
        ...tableNode.attrs,
        [attributeName]: align,
      })
      view.dispatch(tr)
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Determines if the table align button should be shown
 */
export function shouldShowTableNodeAlignButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  align: TableNodeAlign
  extensionName?: string
  attributeName?: string
}): boolean {
  const {
    editor,
    extensionName = "table",
  } = props

  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, [extensionName])) return false

  // Always show the button if editor is editable, but it might be disabled
  return true
}

/**
 * Custom hook that provides table node align functionality for Tiptap editor
 */
export function useTableNodeAlign(config: UseTableNodeAlignConfig) {
  const {
    editor: providedEditor,
    align,
    extensionName = "table",
    attributeName = "nodeTextAlign",
    hideWhenUnavailable = false,
    onAligned,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsBreakpoint()
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isDisabled, setIsDisabled] = useState<boolean>(true)
  const canAlign = canSetTableNodeAlign(editor, align, extensionName, attributeName)
  const isActive = isTableNodeAlignActive(
    editor,
    align,
    extensionName,
    attributeName
  )

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowTableNodeAlignButton({
          editor,
          align,
          hideWhenUnavailable,
          extensionName,
          attributeName,
        })
      )
      setIsDisabled(!editor.isActive(extensionName))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)
    editor.on("transaction", handleSelectionUpdate) // Also listen to transaction for attribute changes
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
      editor.off("transaction", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable, align, extensionName, attributeName])

  const handleTableNodeAlign = useCallback(() => {
    if (!editor) return false

    const success = setTableNodeAlign(editor, align, extensionName, attributeName)
    if (success) {
      onAligned?.()
    }
    return success
  }, [editor, align, extensionName, attributeName, onAligned])

  useHotkeys(
    TABLE_NODE_ALIGN_SHORTCUT_KEYS[align],
    (event) => {
      event.preventDefault()
      handleTableNodeAlign()
    },
    {
      enabled: isVisible && canAlign,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  )

  return {
    isVisible,
    isActive,
    handleTableNodeAlign,
    canAlign,
    label: tableNodeAlignLabels[align],
    shortcutKeys: TABLE_NODE_ALIGN_SHORTCUT_KEYS[align],
    Icon: tableNodeAlignIcons[align],
    isDisabled,
  }
}
