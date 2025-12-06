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
import { useMark, type Mark } from "@/components/tiptap-ui/mark-button"
import { ChevronRightIcon } from "@/components/tiptap-icons/chevron-right-icon"
import { TextColorSmallIcon } from "@/components/tiptap-icons/text-color-small-icon"

const FormatItem = ({
  editor,
  type,
  label,
}: {
  editor: any
  type: Mark
  label: string
}) => {
  const { isVisible, handleMark, isActive, Icon } = useMark({
    editor,
    type,
  })

  if (!isVisible) return null

  return (
    <MenuItem
      render={
        <Button
          data-style="ghost"
          data-active-state={isActive ? "on" : "off"}
        />
      }
      onClick={handleMark}
    >
      <Icon className="tiptap-button-icon" />
      <span className="tiptap-button-text">{label}</span>
    </MenuItem>
  )
}

export const TableFormatMenu = ({ editor }: { editor: any }) => {
  return (
    <Menu
      placement="right"
      trigger={
        <MenuButton
          render={
            <MenuItem
              render={
                <Button data-style="ghost">
                  <TextColorSmallIcon className="tiptap-button-icon" />
                  <span className="tiptap-button-text">Format</span>
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
            <FormatItem editor={editor} type="bold" label="Gras" />
            <FormatItem editor={editor} type="italic" label="Italique" />
            <FormatItem editor={editor} type="underline" label="Souligné" />
            <FormatItem editor={editor} type="strike" label="Barré" />
            <FormatItem editor={editor} type="code" label="Code" />
          </MenuGroup>
        </ComboboxList>
      </MenuContent>
    </Menu>
  )
}
