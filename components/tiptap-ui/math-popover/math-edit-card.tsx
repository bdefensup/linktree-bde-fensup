"use client"

import { CornerDownLeftIcon } from "@/components/tiptap-icons/corner-down-left-icon"
import { ExternalLinkIcon } from "@/components/tiptap-icons/external-link-icon"
import { TrashIcon } from "@/components/tiptap-icons/trash-icon"
import { RemoveFormatting } from "lucide-react"

import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"
import { Input, InputGroup } from "@/components/tiptap-ui-primitive/input"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

interface MathEditCardProps {
  formula: string
  setFormula: (value: string) => void
  onApply: () => void
  onCancel?: () => void
  onDelete?: () => void
  onUnrender?: () => void
  isEditing?: boolean
}

export function MathEditCard({
  formula,
  setFormula,
  onApply,
  onCancel,
  onDelete,
  onUnrender,
}: MathEditCardProps) {
  const isMobile = useIsBreakpoint()

  return (
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
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="E = mc^2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault()
                    onApply()
                }
                if (e.key === "Escape" && onCancel) onCancel()
              }}
              autoFocus
              autoComplete="off"
            />
          </InputGroup>

          <ButtonGroup orientation="horizontal">
            <Button
              type="button"
              onClick={onApply}
              title="Appliquer la formule"
              data-style="ghost"
            >
              <CornerDownLeftIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>

          <Separator />

          <ButtonGroup orientation="horizontal">
            <Button
              type="button"
              onClick={() => window.open("https://katex.org/docs/supported.html", "_blank")}
              title="Aide KaTeX"
              data-style="ghost"
            >
              <ExternalLinkIcon className="tiptap-button-icon" />
            </Button>

            {onUnrender && (
              <Button
                type="button"
                onClick={onUnrender}
                title="Convertir en texte"
                data-style="ghost"
              >
                <RemoveFormatting className="tiptap-button-icon" />
              </Button>
            )}

            {onDelete && (
              <Button
                type="button"
                onClick={onDelete}
                title="Supprimer la formule"
                data-style="ghost"
                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                <TrashIcon className="tiptap-button-icon" />
              </Button>
            )}
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}
