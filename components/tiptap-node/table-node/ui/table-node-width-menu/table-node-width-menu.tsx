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
import { TextExtendIcon } from "@/components/tiptap-icons/text-extend-icon"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { Editor } from "@tiptap/react"

interface TableNodeWidthMenuProps {
  editor: Editor | null
}

export const TableNodeWidthMenu = ({ editor: providedEditor }: TableNodeWidthMenuProps) => {
  const { editor } = useTiptapEditor(providedEditor)

  if (!editor) return null

  // Placeholder logic for width - currently just a visual menu
  // You can implement actual width logic here (e.g. toggling class or style)
  
  return (
    <Menu
      placement="right"
      trigger={
        <MenuButton
          render={
            <MenuItem
              render={
                <Button data-style="ghost">
                  <TextExtendIcon className="tiptap-button-icon" />
                  <span className="tiptap-button-text">Largeur</span>
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
                <Button data-style="ghost">
                   <span className="tiptap-button-text">Pleine largeur</span>
                </Button>
              }
              onClick={() => {
                  // Implement full width logic
              }}
            />
             <MenuItem
              render={
                <Button data-style="ghost">
                   <span className="tiptap-button-text">Automatique</span>
                </Button>
              }
              onClick={() => {
                  // Implement auto width logic
              }}
            />
          </MenuGroup>
        </ComboboxList>
      </MenuContent>
    </Menu>
  )
}
