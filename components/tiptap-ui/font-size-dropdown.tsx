"use client"

import { useCallback, useState } from "react"
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { TypeIcon } from "@/components/tiptap-icons/type-icon"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"


const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "30px",
  "36px",
  "48px",
  "60px",
  "72px",
]

export function FontSizeDropdown({
  editor: providedEditor,
  portal = false,
}: {
  editor?: any
  portal?: boolean
}) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)

  const currentFontSize =
    editor?.getAttributes("textStyle").fontSize || "Default"
  const isActive = currentFontSize !== "Default"

  const handleFontSizeChange = useCallback(
    (size: string) => {
      if (!editor) return
      
      if (size === "Default") {
        editor.chain().focus().unsetFontSize().run()
      } else {
        editor.chain().focus().setFontSize(size).run()
      }
      setIsOpen(false)
    },
    [editor]
  )

  if (!editor) return null

  return (
    <DropdownMenu modal open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          data-active-state={isActive || isOpen ? "on" : "off"}
          role="button"
          tabIndex={-1}
          aria-label="Font Size"
          tooltip="Font Size"
        >
          <TypeIcon className="tiptap-button-icon" />
          <span className="text-xs font-medium w-[3ch] text-center">
            {currentFontSize === "Default" ? "-" : currentFontSize.replace("px", "")}
          </span>
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
                  data-active-state={currentFontSize === "Default" ? "on" : "off"}
                  onClick={() => handleFontSizeChange("Default")}
                  className="justify-start w-full"
                >
                  <span className="tiptap-button-text">Default</span>
                </Button>
              </DropdownMenuItem>
              {FONT_SIZES.map((size) => (
                <DropdownMenuItem key={size} asChild>
                  <Button
                    type="button"
                    data-style="ghost"
                    data-active-state={currentFontSize === size ? "on" : "off"}
                    onClick={() => handleFontSizeChange(size)}
                    className="justify-start w-full"
                  >
                    <span className="tiptap-button-text">{size}</span>
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
