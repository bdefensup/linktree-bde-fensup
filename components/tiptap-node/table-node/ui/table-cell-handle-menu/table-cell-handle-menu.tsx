"use client"

import { forwardRef, useCallback, useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { cn, SR_ONLY } from "@/lib/tiptap-utils"

// --- UI ---
import { ColorMenu } from "@/components/tiptap-ui/color-menu"
import { TableAlignMenu } from "@/components/tiptap-node/table-node/ui/table-alignment-menu"
import { TableFormatMenu } from "@/components/tiptap-node/table-node/ui/table-format-menu"
import { useTableClearRowColumnContent } from "@/components/tiptap-node/table-node/ui/table-clear-row-column-content-button"
import { useTableMergeSplitCell } from "@/components/tiptap-node/table-node/ui/table-merge-split-cell-button"
import { MathEditCard } from "@/components/tiptap-ui/math-popover/math-edit-card"


// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Combobox, ComboboxList } from "@/components/tiptap-ui-primitive/combobox"
import {
  Menu,
  MenuButton,
  MenuContent,
  MenuGroup,
  MenuItem,
} from "@/components/tiptap-ui-primitive/menu"
import { Separator } from "@/components/tiptap-ui-primitive/separator"

// --- Icons ---
import { Grip4Icon } from "@/components/tiptap-icons/grip-4-icon"
import { Sigma } from "lucide-react"

import "./table-cell-handle-menu.scss"

interface TableAction {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  onClick: () => void
  isAvailable: boolean
  isActive?: boolean
  shortcutBadge?: React.ReactNode
  preventClose?: boolean
}

/**
 * Hook to manage all table actions and their availability
 */
function useTableActions({ onMathClick }: { onMathClick: () => void }) {
  const mergeCellAction = useTableMergeSplitCell({ action: "merge" })
  const splitCellAction = useTableMergeSplitCell({ action: "split" })
  const clearContentAction = useTableClearRowColumnContent({ resetAttrs: true })

  const mergeAction: TableAction = {
    icon: mergeCellAction.Icon,
    label: mergeCellAction.label,
    onClick: mergeCellAction.handleExecute,
    isAvailable: mergeCellAction.canExecute,
  }

  const splitAction: TableAction = {
    icon: splitCellAction.Icon,
    label: splitCellAction.label,
    onClick: splitCellAction.handleExecute,
    isAvailable: splitCellAction.canExecute,
  }

  const clearAction: TableAction = {
    icon: clearContentAction.Icon,
    label: clearContentAction.label,
    onClick: clearContentAction.handleClear,
    isAvailable: clearContentAction.canClearRowColumnContent,
  }

  const mathAction: TableAction = {
    icon: Sigma,
    label: "Equation",
    onClick: onMathClick,
    isAvailable: true,
    preventClose: true,
  }

  return {
    mergeAction,
    splitAction,
    clearAction,
    mathAction,
  }
}

/**
 * Hook to manage table handle menu state and interactions
 */
function useTableCellHandleMenu({ editor }: { editor: Editor | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    editor?.commands.unfreezeHandles()
  }, [editor])

  const handleMenuToggle = useCallback(
    (isOpen: boolean) => {
      setIsMenuOpen(isOpen)

      if (!editor) return

      if (isOpen) {
        editor.commands.freezeHandles()
      } else {
        editor.commands.unfreezeHandles()
      }
    },
    [editor]
  )

  return {
    isMenuOpen,
    handleMenuToggle,
    closeMenu,
  }
}

const TableActionItem = ({ action }: { action: TableAction }) => {
  const { icon: Icon, label, onClick, isActive = false, shortcutBadge, isAvailable, preventClose } = action

  return (
    <MenuItem
      render={
        <Button
          data-style="ghost"
          data-active-state={isActive ? "on" : "off"}
          disabled={!isAvailable} // Added disabled prop
        />
      }
      onClick={onClick}
      disabled={!isAvailable} // Added disabled prop
      preventClose={preventClose}
    >
      <Icon className="tiptap-button-icon" />
      <span className="tiptap-button-text">{label}</span>
      {shortcutBadge}
    </MenuItem>
  )
}

const TableActionMenu = ({
  onClose,
  editor,
}: {
  onClose: () => void
  editor: Editor | null
}) => {
  const [isMathOpen, setIsMathOpen] = useState(false)
  const [formula, setFormula] = useState("")

  const { mergeAction, splitAction, clearAction, mathAction } = useTableActions({
    onMathClick: () => setIsMathOpen(true),
  })

  const handleMathApply = () => {
    if (editor && formula) {
      editor.chain().focus().insertInlineMath({ latex: formula }).run()
    }
    setFormula("")
    setIsMathOpen(false)
    onClose()
  }

  const hasMergeOrSplit = mergeAction.isAvailable || splitAction.isAvailable

  if (isMathOpen) {
    return (
      <MenuContent
        autoFocusOnShow
        modal
        onClose={() => {
          setIsMathOpen(false)
          onClose()
        }}
      >
        <div className="p-2">
          <MathEditCard
            formula={formula}
            setFormula={setFormula}
            onApply={handleMathApply}
            onCancel={() => setIsMathOpen(false)}
          />
        </div>
      </MenuContent>
    )
  }

  return (
    <MenuContent autoFocusOnShow modal onClose={onClose}>
      <Combobox style={SR_ONLY} />
      <ComboboxList style={{ minWidth: "15rem" }}>
        {hasMergeOrSplit && (
          <>
            <MenuGroup>
              {mergeAction.isAvailable && (
                <TableActionItem action={mergeAction} />
              )}
              {splitAction.isAvailable && (
                <TableActionItem action={splitAction} />
              )}
            </MenuGroup>
            <Separator orientation="horizontal" />
          </>
        )}

        <MenuGroup>
          <TableFormatMenu editor={editor} />
          <ColorMenu />
          <TableAlignMenu />
          <TableActionItem action={mathAction} />
        </MenuGroup>

        <Separator orientation="horizontal" />
        <MenuGroup>
          <TableActionItem
            action={{
              ...clearAction,
              isActive: false, // Ensure it's not active
            }}
          />
        </MenuGroup>
      </ComboboxList>
    </MenuContent>
  )
}

interface TableCellHandleMenuProps
  extends React.ComponentPropsWithoutRef<"button"> {
  editor?: Editor | null
  onOpenChange?: (isOpen: boolean) => void
}

export const TableCellHandleMenu = forwardRef<
  HTMLButtonElement,
  TableCellHandleMenuProps
>(({ editor: providedEditor, onOpenChange, className, ...props }, ref) => {
  const { editor } = useTiptapEditor(providedEditor)
  const { isMenuOpen, handleMenuToggle, closeMenu } = useTableCellHandleMenu({
    editor,
  })

  useEffect(() => {
    onOpenChange?.(isMenuOpen)
  }, [isMenuOpen, onOpenChange])

  return (
    <Menu
      open={isMenuOpen}
      onOpenChange={handleMenuToggle}
      placement="bottom-start"
      trigger={
        <MenuButton
          ref={ref}
          className={cn(
            "expandable-menu-button",
            isMenuOpen && "menu-opened",
            className
          )}
          aria-label="Table cells option"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          {...props}
        >
          <Grip4Icon className="tiptap-button-icon" />
        </MenuButton>
      }
    >
      <TableActionMenu onClose={closeMenu} editor={editor} />
    </Menu>
  )
})

TableCellHandleMenu.displayName = "TableCellHandleMenu"

export { TableActionMenu }
