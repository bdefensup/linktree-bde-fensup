"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-[#1B1B1B]/50 p-2">
      {/* Group 1: Formatting */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <Code className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().unsetAllMarks().run()}
        className="text-muted-foreground hover:bg-white/5"
      >
        <X className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-px bg-white/10" />

      {/* Group 2: Headings */}
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-px bg-white/10" />

      {/* Group 3: Lists */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-px bg-white/10" />

      {/* Group 4: Links/Actions */}
      <Toggle
        size="sm"
        pressed={editor.isActive("link")}
        onPressedChange={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("URL", previousUrl);
          if (url === null) {
            return;
          }
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <LinkIcon className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-px bg-white/10" />

      {/* Group 5: Alignment */}
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "justify" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
        className="text-muted-foreground hover:bg-white/5 data-[state=on]:bg-white/10 data-[state=on]:text-white"
      >
        <AlignJustify className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-px bg-white/10" />

      {/* Group 6: History */}
      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="text-muted-foreground hover:bg-white/5 disabled:opacity-50"
      >
        <Undo className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="text-muted-foreground hover:bg-white/5 disabled:opacity-50"
      >
        <Redo className="h-4 w-4" />
      </Toggle>
    </div>
  );
};

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Commencez à écrire...",
        emptyEditorClass:
          "is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground/50 before:float-left before:pointer-events-none",
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 hover:underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    immediatelyRender: false,
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-white/90",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-white/10 bg-[#1B1B1B]/50", className)}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
