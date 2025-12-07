"use client"

import { useCallback, useState } from "react"
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { CaseSensitiveIcon } from "@/components/tiptap-icons/case-sensitive-icon"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"

const FONT_FAMILIES = [
  { label: "Inter", value: "Inter" },
  { label: "Arial", value: "Arial" },
  { label: "Helvetica", value: "Helvetica" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Courier New", value: "Courier New" },
  { label: "Georgia", value: "Georgia" },
  { label: "Verdana", value: "Verdana" },
]

export function FontFamilyDropdown({
  editor: providedEditor,
  portal = false,
}: {
  editor?: any
  portal?: boolean
}) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)

  const currentFontFamily =
    editor?.getAttributes("textStyle").fontFamily || "Default"
  const isActive = currentFontFamily !== "Default"

  const handleFontFamilyChange = useCallback(
    (font: string) => {
      if (font === "Default") {
        editor?.chain().focus().unsetFontFamily().run()
      } else {
        editor?.chain().focus().setFontFamily(font).run()
      }
      setIsOpen(false)
    },
    [editor]
  )

  if (!editor) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          data-active-state={isActive || isOpen ? "on" : "off"}
          role="button"
          tabIndex={-1}
          aria-label="Font Family"
          tooltip="Font Family"
        >
          <CaseSensitiveIcon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        portal={portal}
      >
        <Card>
          <CardBody className="max-h-[300px] overflow-y-auto">
            <ButtonGroup>
              <DropdownMenuItem asChild>
                <Button
                  type="button"
                  data-style="ghost"
                  data-active-state={currentFontFamily === "Default" ? "on" : "off"}
                  onClick={() => handleFontFamilyChange("Default")}
                  className="justify-start w-full"
                >
                  <span className="tiptap-button-text">Default</span>
                </Button>
              </DropdownMenuItem>
              {FONT_FAMILIES.map((font) => (
                <DropdownMenuItem key={font.value} asChild>
                  <Button
                    type="button"
                    data-style="ghost"
                    data-active-state={currentFontFamily === font.value ? "on" : "off"}
                    onClick={() => handleFontFamilyChange(font.value)}
                    className="justify-start w-full"
                    style={{ fontFamily: font.value }}
                  >
                    <span className="tiptap-button-text">{font.label}</span>
                  </Button>
                </DropdownMenuItem>
              ))}
            </ButtonGroup>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
