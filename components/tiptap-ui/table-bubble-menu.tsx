import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { TableMergeSplitCellButton } from "@/components/tiptap-node/table-node/ui/table-merge-split-cell-button";
import { TableAddRowColumnButton } from "@/components/tiptap-node/table-node/ui/table-add-row-column-button";
import { TableDeleteRowColumnButton } from "@/components/tiptap-node/table-node/ui/table-delete-row-column-button";
import { Separator } from "@/components/tiptap-ui-primitive/separator";
import { Card, CardBody, CardItemGroup } from "@/components/tiptap-ui-primitive/card";
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import { Trash2, Eraser, X, Sigma, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { TableToggleHeaderButton } from "@/components/tiptap-node/table-node/ui/table-toggle-header-button";
import { useState, useCallback, useEffect } from "react";
import { MathEditCard } from "@/components/tiptap-ui/math-popover";

interface TableBubbleMenuProps {
  editor: Editor | null;
}

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  const [isMathEditing, setIsMathEditing] = useState(false);
  const [formula, setFormula] = useState("");

  const updateFormula = useCallback(() => {
    if (!editor) return;

    const { selection } = editor.state;
    const { from, to } = selection;
    const text = editor.state.doc.textBetween(from, to);
    
    // Check if we are selecting an existing math formula (wrapped in $)
    const isMathText = text.startsWith("$") && text.endsWith("$");
    
    // Check if we are selecting a math node
    const isMathNode = editor.isActive("mathematics") || editor.isActive("inlineMath") || editor.isActive("blockMath");

    if (isMathNode) {
      const node = editor.getAttributes("mathematics")?.latex || editor.getAttributes("inlineMath")?.latex || editor.getAttributes("blockMath")?.latex;
      if (node) {
        setFormula(node);
        setIsMathEditing(true);
        return;
      }
    }

    if (isMathText) {
      setFormula(text.slice(1, -1));
      setIsMathEditing(true);
    } else {
      setFormula(text);
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      editor.on("selectionUpdate", updateFormula);
    }
    return () => {
      editor?.off("selectionUpdate", updateFormula);
    };
  }, [editor, updateFormula]);

  if (!editor) return null;

  const applyFormula = () => {
    if (formula) {
      if (editor.isActive("inlineMath")) {
        editor.chain().focus().updateInlineMath({ latex: formula }).run();
      } else if (editor.isActive("blockMath")) {
        editor.chain().focus().updateBlockMath({ latex: formula }).run();
      } else {
        editor.chain().focus().deleteSelection().insertInlineMath({ latex: formula }).run();
      }
      setIsMathEditing(false);
    }
  };

  const deleteMath = () => {
    if (editor.isActive("inlineMath")) {
      editor.chain().focus().deleteInlineMath().run();
    } else if (editor.isActive("blockMath")) {
      editor.chain().focus().deleteBlockMath().run();
    } else {
        editor.chain().focus().deleteSelection().run();
    }
    setIsMathEditing(false);
  };

  const unrenderMath = () => {
    const latex = editor.getAttributes("mathematics")?.latex || editor.getAttributes("inlineMath")?.latex || editor.getAttributes("blockMath")?.latex;
    if (latex) {
        if (editor.isActive("inlineMath")) {
            editor.chain().focus().deleteInlineMath().insertContent(latex).run();
        } else if (editor.isActive("blockMath")) {
            editor.chain().focus().deleteBlockMath().insertContent(latex).run();
        }
    }
    setIsMathEditing(false);
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => {
        return editor.isActive("table");
      }}
    >
      {isMathEditing ? (
        <MathEditCard
          formula={formula}
          setFormula={setFormula}
          onApply={applyFormula}
          onCancel={() => setIsMathEditing(false)}
          onDelete={deleteMath}
          onUnrender={unrenderMath}
        />
      ) : (
        <Card>
          <CardBody>
            <CardItemGroup orientation="horizontal">
              <ButtonGroup orientation="horizontal">
                <TableMergeSplitCellButton editor={editor} action="merge" hideWhenUnavailable={true} />
                <TableMergeSplitCellButton editor={editor} action="split" hideWhenUnavailable={true} />
              </ButtonGroup>

              <Separator orientation="vertical" className="h-4" />

              <ButtonGroup orientation="horizontal">
                <TableAddRowColumnButton editor={editor} orientation="row" side="above" />
                <TableAddRowColumnButton editor={editor} orientation="row" side="below" />
                <TableAddRowColumnButton editor={editor} orientation="column" side="left" />
                <TableAddRowColumnButton editor={editor} orientation="column" side="right" />
              </ButtonGroup>

              <Separator orientation="vertical" className="h-4" />

              <ButtonGroup orientation="horizontal">
                <TableDeleteRowColumnButton 
                    editor={editor} 
                    orientation="row" 
                >
                    <Eraser className="tiptap-button-icon" />
                </TableDeleteRowColumnButton>
                <TableDeleteRowColumnButton 
                    editor={editor} 
                    orientation="column" 
                >
                    <X className="tiptap-button-icon" />
                </TableDeleteRowColumnButton>
              </ButtonGroup>
              
              <Separator orientation="vertical" className="h-4" />

              <ButtonGroup orientation="horizontal">
                <Button
                  type="button"
                  onClick={() => editor.chain().focus().updateAttributes("table", { align: "left" }).run()}
                  data-style="ghost"
                  data-active-state={editor.getAttributes("table").align === "left" ? "on" : "off"}
                  tooltip="Aligner à gauche"
                >
                  <AlignLeft className="tiptap-button-icon" />
                </Button>
                <Button
                  type="button"
                  onClick={() => editor.chain().focus().updateAttributes("table", { align: "center" }).run()}
                  data-style="ghost"
                  data-active-state={editor.getAttributes("table").align === "center" ? "on" : "off"}
                  tooltip="Centrer"
                >
                  <AlignCenter className="tiptap-button-icon" />
                </Button>
                <Button
                  type="button"
                  onClick={() => editor.chain().focus().updateAttributes("table", { align: "right" }).run()}
                  data-style="ghost"
                  data-active-state={editor.getAttributes("table").align === "right" ? "on" : "off"}
                  tooltip="Aligner à droite"
                >
                  <AlignRight className="tiptap-button-icon" />
                </Button>
              </ButtonGroup>

              <Separator orientation="vertical" className="h-4" />

              <ButtonGroup orientation="horizontal">
                <Button
                  type="button"
                  onClick={() => {
                    setIsMathEditing(true);
                    const { from, to } = editor.state.selection;
                    const text = editor.state.doc.textBetween(from, to);
                    if (text.startsWith("$") && text.endsWith("$")) {
                        setFormula(text.slice(1, -1));
                    } else {
                        setFormula(text);
                    }
                  }}
                  data-style="ghost"
                  tooltip="Mathématiques"
                >
                  <Sigma className="tiptap-button-icon" />
                </Button>
              </ButtonGroup>

              <Separator orientation="vertical" className="h-4" />

              <ButtonGroup orientation="horizontal">
                <TableToggleHeaderButton editor={editor} type="row" />
                <TableToggleHeaderButton editor={editor} type="column" />
              </ButtonGroup>
              
              <Separator orientation="vertical" className="h-4" />
              
              <ButtonGroup orientation="horizontal">
                   <Button
                    type="button"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    data-style="ghost"
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    tooltip="Supprimer le tableau"
                  >
                    <Trash2 className="tiptap-button-icon" />
                  </Button>
              </ButtonGroup>
            </CardItemGroup>
          </CardBody>
        </Card>
      )}
    </BubbleMenu>
  );
}
