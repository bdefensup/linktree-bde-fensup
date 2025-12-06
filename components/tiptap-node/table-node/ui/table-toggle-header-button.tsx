import { Editor } from "@tiptap/react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Table, Columns, Rows } from "lucide-react";

interface TableToggleHeaderButtonProps {
  editor: Editor | null;
  type: "row" | "column" | "cell";
}

export function TableToggleHeaderButton({ editor, type }: TableToggleHeaderButtonProps) {
  if (!editor) return null;

  const handleToggle = () => {
    if (type === "row") {
      editor.chain().focus().toggleHeaderRow().run();
    } else if (type === "column") {
      editor.chain().focus().toggleHeaderColumn().run();
    } else if (type === "cell") {
      editor.chain().focus().toggleHeaderCell().run();
    }
  };

  const Icon = type === "row" ? Rows : type === "column" ? Columns : Table;
  const label = type === "row" ? "En-tête ligne" : type === "column" ? "En-tête colonne" : "En-tête cellule";

  return (
    <Button
      type="button"
      onClick={handleToggle}
      data-style="ghost"
      tooltip={`Basculer ${label}`}
    >
      <Icon className="tiptap-button-icon" />
    </Button>
  );
}
