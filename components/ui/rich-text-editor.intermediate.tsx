"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { UiState } from "@/components/tiptap-extension/ui-state-extension";

// UI Components
import { Toolbar } from "@/components/tiptap-ui-primitive/toolbar/toolbar";
import { Separator } from "@/components/tiptap-ui-primitive/separator";
import { MarkButton } from "@/components/tiptap-ui/mark-button/mark-button";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu/heading-dropdown-menu";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu/list-dropdown-menu";
import { LinkPopover } from "@/components/tiptap-ui/link-popover/link-popover";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button/image-upload-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button/undo-redo-button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
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
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg border border-border",
        },
      }),
      UiState,
    ],
    immediatelyRender: false,
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-foreground",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col overflow-hidden rounded-xl border",
        className
      )}
    >
      <Toolbar className="border-border bg-muted/30 border-b p-2">
        <UndoRedoButton editor={editor} action="undo" />
        <UndoRedoButton editor={editor} action="redo" />
        <Separator orientation="vertical" className="mx-1 h-6" />

        <HeadingDropdownMenu editor={editor} portal />
        <Separator orientation="vertical" className="mx-1 h-6" />

        <MarkButton editor={editor} type="bold" />
        <MarkButton editor={editor} type="italic" />
        <MarkButton editor={editor} type="underline" />
        <MarkButton editor={editor} type="strike" />
        <MarkButton editor={editor} type="code" />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ListDropdownMenu editor={editor} portal />
        <TextAlignButton editor={editor} align="left" />
        <TextAlignButton editor={editor} align="center" />
        <TextAlignButton editor={editor} align="right" />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <LinkPopover editor={editor} />
        <ImageUploadButton editor={editor} />
      </Toolbar>

      <div className="bg-background flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
