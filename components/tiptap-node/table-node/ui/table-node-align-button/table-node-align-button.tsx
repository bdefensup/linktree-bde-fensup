"use client"

import { forwardRef, useCallback } from "react"

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type {
  TableNodeAlign,
  UseTableNodeAlignConfig,
} from "@/components/tiptap-node/table-node/ui/table-node-align-button/use-table-node-align"
import {
  TABLE_NODE_ALIGN_SHORTCUT_KEYS,
  useTableNodeAlign,
} from "@/components/tiptap-node/table-node/ui/table-node-align-button/use-table-node-align"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Badge } from "@/components/tiptap-ui-primitive/badge"

export interface TableNodeAlignButtonProps
  extends Omit<ButtonProps, "type">,
    UseTableNodeAlignConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean
}

export function TableNodeAlignShortcutBadge({
  align,
  shortcutKeys = TABLE_NODE_ALIGN_SHORTCUT_KEYS[align],
}: {
  align: TableNodeAlign
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

/**
 * Button component for setting table node alignment in a Tiptap editor.
 */
export const TableNodeAlignButton = forwardRef<
  HTMLButtonElement,
  TableNodeAlignButtonProps
>(
  (
    {
      editor: providedEditor,
      align,
      text,
      extensionName,
      attributeName = "nodeTextAlign",
      hideWhenUnavailable = false,
      onAligned,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const {
      isVisible,
      handleTableNodeAlign,
      label,
      canAlign,
      isActive,
      Icon,
      shortcutKeys,
      isDisabled,
    } = useTableNodeAlign({
      editor,
      align,
      extensionName,
      attributeName,
      hideWhenUnavailable,
      onAligned,
    })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleTableNodeAlign()
      },
      [handleTableNodeAlign, onClick]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        disabled={isDisabled || !canAlign}
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={isDisabled || !canAlign}
        role="button"
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut ? (
              <TableNodeAlignShortcutBadge
                align={align}
                shortcutKeys={shortcutKeys}
              />
            ) : null}
          </>
        )}
      </Button>
    )
  }
)

TableNodeAlignButton.displayName = "TableNodeAlignButton"
