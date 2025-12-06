import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useCallback, useEffect, useState } from "react";
import { Sigma } from "lucide-react";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";

// --- Components ---
import { MathEditCard } from "@/components/tiptap-ui/math-popover";

interface MathBubbleMenuProps {
  editor: Editor | null;
}

export function MathBubbleMenu({ editor }: MathBubbleMenuProps) {
  const [isEditing, setIsEditing] = useState(false);
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
        setIsEditing(true);
        return;
      }
    }

    if (isMathText) {
      setFormula(text.slice(1, -1));
      setIsEditing(true);
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
        // If selecting text that looks like math, replace it
        // Or just insert new math
        editor.chain().focus().deleteSelection().insertInlineMath({ latex: formula }).run();
      }
      setIsEditing(false);
    }
  };

  const deleteMath = () => {
    if (editor.isActive("inlineMath")) {
      editor.chain().focus().deleteInlineMath().run();
    } else if (editor.isActive("blockMath")) {
      editor.chain().focus().deleteBlockMath().run();
    } else {
        // Fallback for text selection or other cases
        editor.chain().focus().deleteSelection().run();
    }
    setIsEditing(false);
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
    setIsEditing(false);
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }: { editor: Editor }) => {
        // Show if text is selected or if it's a math node, BUT NOT if we are in a table (handled by TableBubbleMenu)
        if (editor.isActive("table")) return false;
        return !editor.state.selection.empty || editor.isActive("mathematics") || editor.isActive("inlineMath") || editor.isActive("blockMath");
      }}
    >
      {isEditing ? (
        <MathEditCard
          formula={formula}
          setFormula={setFormula}
          onApply={applyFormula}
          onCancel={() => setIsEditing(false)}
          onDelete={deleteMath}
          onUnrender={unrenderMath}
        />
      ) : (
        <Button
          type="button"
          onClick={() => {
            setIsEditing(true);
            // Pre-fill with selected text if any
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to);
             // Strip existing $ if present
            if (text.startsWith("$") && text.endsWith("$")) {
                setFormula(text.slice(1, -1));
            } else {
                setFormula(text);
            }
          }}
          data-style="ghost"
          className="bg-popover shadow-md"
        >
          <Sigma className="tiptap-button-icon mr-2" />
          Math
        </Button>
      )}
    </BubbleMenu>
  );
}
