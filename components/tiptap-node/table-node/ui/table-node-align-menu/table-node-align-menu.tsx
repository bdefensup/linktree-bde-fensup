"use client"

import { useCallback } from "react"
import type { Editor } from "@tiptap/react"
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
import { LayoutIcon } from "@/components/tiptap-icons/layout-icon"

export const TableNodeAlignMenu = ({ editor }: { editor: Editor | null }) => {
  const setTableAlign = useCallback(
    (align: "left" | "center" | "right" | null) => {
      if (!editor) return

      editor.chain().focus().updateAttributes("table", { align }).run()
    },
    [editor]
  )

  const currentAlign = editor?.getAttributes("table")?.align || null

  return (
    <Menu
      placement="right"
      trigger={
        <MenuButton
          render={
            <MenuItem
              render={
                <Button data-style="ghost">
                  <LayoutIcon className="tiptap-button-icon" />
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
                  data-active-state={currentAlign === "left" ? "on" : "off"}
                />
              }
              onClick={() => setTableAlign("left")}
            >
              <AlignLeftIcon className="tiptap-button-icon" />
              <span className="tiptap-button-text">Gauche (Habillage)</span>
            </MenuItem>
            <MenuItem
              render={
                <Button
                  data-style="ghost"
                  data-active-state={currentAlign === "center" ? "on" : "off"}
                />
              }
              onClick={() => setTableAlign("center")}
            >
              <AlignCenterIcon className="tiptap-button-icon" />
              <span className="tiptap-button-text">Centré</span>
            </MenuItem>
            <MenuItem
              render={
                <Button
                  data-style="ghost"
                  data-active-state={currentAlign === "right" ? "on" : "off"}
                />
              }
              onClick={() => setTableAlign("right")}
            >
              <AlignRightIcon className="tiptap-button-icon" />
              <span className="tiptap-button-text">Droite (Habillage)</span>
            </MenuItem>
          </MenuGroup>
        </ComboboxList>
      </MenuContent>
    </Menu>
  )
}
