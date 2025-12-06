"use client"

import { forwardRef, useCallback, useState } from "react"
import { Youtube } from "lucide-react"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"
import { Input, InputGroup } from "@/components/tiptap-ui-primitive/input"

export interface YoutubePopoverProps extends Omit<ButtonProps, "type"> {
  editor?: any
}

export const YoutubePopover = forwardRef<HTMLButtonElement, YoutubePopoverProps>(
  ({ editor: providedEditor, className, ...props }, ref) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isOpen, setIsOpen] = useState(false)
    const [url, setUrl] = useState("")
    const isMobile = useIsBreakpoint()

    const handleAddYoutube = useCallback(() => {
      if (url && editor) {
        editor.chain().focus().setYoutubeVideo({ src: url }).run()
        setUrl("")
        setIsOpen(false)
      }
    }, [editor, url])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault()
        handleAddYoutube()
      }
    }

    if (!editor) {
      return null
    }

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className={className}
            data-style="ghost"
            tooltip="YouTube"
            ref={ref}
            {...props}
          >
            <Youtube className="tiptap-button-icon" />
          </Button>
        </PopoverTrigger>

        <PopoverContent>
          <Card
            style={{
              ...(isMobile ? { boxShadow: "none", border: 0 } : {}),
            }}
          >
            <CardBody
              style={{
                ...(isMobile ? { padding: 0 } : {}),
              }}
            >
              <CardItemGroup orientation="horizontal">
                <InputGroup>
                  <Input
                    type="url"
                    placeholder="Coller l'URL YouTube..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    autoComplete="off"
                  />
                </InputGroup>

                <ButtonGroup orientation="horizontal">
                  <Button
                    type="button"
                    onClick={handleAddYoutube}
                    title="Ajouter la vidéo"
                    disabled={!url}
                    data-style="ghost"
                  >
                    <Youtube className="tiptap-button-icon" />
                  </Button>
                </ButtonGroup>
              </CardItemGroup>
            </CardBody>
          </Card>
        </PopoverContent>
      </Popover>
    )
  }
)

YoutubePopover.displayName = "YoutubePopover"
