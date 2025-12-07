"use client"

import {
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuContent,
  MenuGroup,
  MenuItem,
} from "@/components/tiptap-ui-primitive/menu"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { ComboboxList } from "@/components/tiptap-ui-primitive/combobox"
import { ChevronRightIcon } from "@/components/tiptap-icons/chevron-right-icon"
import { AlignLeftIcon } from "@/components/tiptap-icons/align-left-icon"
import { AlignCenterIcon } from "@/components/tiptap-icons/align-center-icon"
import { AlignRightIcon } from "@/components/tiptap-icons/align-right-icon"
import { AlignmentIcon } from "@/components/tiptap-icons/alignment-icon"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { Editor } from "@tiptap/react"

interface TableNodeAlignMenuProps {
  editor: Editor | null
}

export const TableNodeAlignMenu = ({ editor: providedEditor }: TableNodeAlignMenuProps) => {
  const { editor } = useTiptapEditor(providedEditor)

  if (!editor) return null

  const setAlignment = (align: string) => {
    editor.chain().focus().setNodeTextAlign(align).run()
  }

  const isAligned = (align: string) => {
    return editor.isActive({ nodeTextAlign: align })
  }

  return (
    <Menu
      placement="right"
      trigger={
        <MenuButton
          render={
            <MenuItem
              render={
                <Button data-style="ghost">
                  <AlignmentIcon className="tiptap-button-icon" />
                  <span className="tiptap-button-text">Position</span>
                  <MenuButtonArrow render={<ChevronRightIcon />} />
                </Button>
              }
            />
          }
        />
      }
    >
      <MenuContent>
        <ComboboxList>
          <MenuGroup>
            <MenuItem
              render={
                <Button
                  data-style="ghost"
                  data-active-state={isAligned("left") ? "on" : "off"}
                />
              }
              onClick={() => setAlignment("left")}
            >
              <AlignLeftIcon className="tiptap-button-icon" />
              <span className="tiptap-button-text">Gauche</span>
            </MenuItem>
            <MenuItem
              render={
                <Button
                  data-style="ghost"
                  data-active-state={isAligned("center") ? "on" : "off"}
                />
              }
              onClick={() => setAlignment("center")}
            >
              <AlignCenterIcon className="tiptap-button-icon" />
              <span className="tiptap-button-text">Centre</span>
            </MenuItem>
            <MenuItem
              render={
                <Button
                  data-style="ghost"
                  data-active-state={isAligned("right") ? "on" : "off"}
                />
              }
              onClick={() => setAlignment("right")}
            >
              <AlignRightIcon className="tiptap-button-icon" />
              <span className="tiptap-button-text">Droite</span>
            </MenuItem>
          </MenuGroup>
        </ComboboxList>
      </MenuContent>
    </Menu>
  )
}
