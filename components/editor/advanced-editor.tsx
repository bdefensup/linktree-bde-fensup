"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import { TableKit } from "@/components/tiptap-node/table-node/extensions/table-node-extension";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import UniqueID from "@tiptap/extension-unique-id";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import { common, createLowlight } from "lowlight";
import Youtube from "@tiptap/extension-youtube";
import Mathematics from "@tiptap/extension-mathematics";
import Emoji from "@tiptap/extension-emoji";
import Details from "@tiptap/extension-details";
import DetailsSummary from "@tiptap/extension-details-summary";
import DetailsContent from "@tiptap/extension-details-content";
import FileHandler from "@tiptap/extension-file-handler";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";

import { cn } from "@/lib/utils";

// Tiptap UI Components
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { TableTriggerButton } from "@/components/tiptap-node/table-node/ui/table-trigger-button";
import { EmojiTriggerButton } from "@/components/tiptap-ui/emoji-trigger-button";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import { ColorTextPopover } from "@/components/tiptap-ui/color-text-popover";

// Manual imports for extras
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Youtube as YoutubeIcon,
  Sigma,
  MoreHorizontal,
} from "lucide-react";

const lowlight = createLowlight(common);

const extensions = [
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    codeBlock: false, // Disable default codeBlock to use lowlight
  }),
  TextStyle,
  Color,
  Image,
  TableKit,
  Underline,
  Link.configure({
    openOnClick: false,
  }),
  Superscript,
  Subscript,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Typography,
  UniqueID.configure({
    types: ["heading", "paragraph"],
  }),
  Highlight.configure({
    multicolor: true,
  }),
  CodeBlockLowlight.configure({
    lowlight,
  }),
  ImageUploadNode.configure({
    upload: (file: File) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    },
  }),
  Youtube.configure({
    controls: false,
  }),
  Mathematics,
  Emoji,
  Details.configure({
    persist: true,
    HTMLAttributes: {
      class: "details",
    },
  }),
  DetailsSummary,
  DetailsContent,
  FileHandler.configure({
    allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
    onDrop: (currentEditor, files, pos) => {
      files.forEach((file) => {
        const fileReader = new FileReader();

        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
          currentEditor
            .chain()
            .insertContentAt(pos, {
              type: "image",
              attrs: {
                src: fileReader.result,
              },
            })
            .focus()
            .run();
        };
      });
    },
    onPaste: (currentEditor, files, htmlContent) => {
      files.forEach((file) => {
        if (htmlContent) {
          // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
          // you could extract the pasted file from this url string and upload it to a server for example
          console.log(htmlContent); // eslint-disable-line no-console
          return;
        }

        const fileReader = new FileReader();

        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
          currentEditor
            .chain()
            .insertContentAt(currentEditor.state.selection.anchor, {
              type: "image",
              attrs: {
                src: fileReader.result,
              },
            })
            .focus()
            .run();
        };
      });
    },
  }),
];

interface AdvancedEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  className?: string;
  editorClassName?: string;
  toolbarClassName?: string;
  placeholder?: string;
}

export function AdvancedEditor({
  initialContent,
  onChange,
  className,
  editorClassName,
  toolbarClassName,
  placeholder,
}: AdvancedEditorProps) {
  const editor = useEditor({
    extensions: [
      ...extensions,
      Placeholder.configure({
        placeholder: placeholder || "Commencez à écrire...",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none dark:prose-invert max-w-none prose-invert",
          editorClassName
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const addYoutube = () => {
    const url = window.prompt("URL de la vidéo YouTube");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-full rounded-lg border border-white/10 bg-[#0E0E11] text-white shadow-sm",
        className
      )}
    >
      {/* Toolbar */}
      <Toolbar
        className={cn(
          "sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-lg border-b border-white/10 bg-[#0E0E11] p-2 justify-center",
          toolbarClassName
        )}
      >
        <ToolbarGroup>
          <UndoRedoButton editor={editor} action="undo" />
          <UndoRedoButton editor={editor} action="redo" />
        </ToolbarGroup>

        <ToolbarSeparator className="mx-1 h-6 bg-white/10" />

        <ToolbarGroup>
          <HeadingDropdownMenu editor={editor} />
          <ListDropdownMenu editor={editor} />
          <BlockquoteButton editor={editor} />
          <CodeBlockButton editor={editor} />
        </ToolbarGroup>

        <ToolbarSeparator className="mx-1 h-6 bg-white/10" />

        <ToolbarGroup>
          <MarkButton editor={editor} type="bold" />
          <MarkButton editor={editor} type="italic" />
          <MarkButton editor={editor} type="strike" />
          <MarkButton editor={editor} type="code" />
          <MarkButton editor={editor} type="underline" />
          <ColorTextPopover editor={editor} />
          <LinkPopover editor={editor} />
        </ToolbarGroup>

        <ToolbarSeparator className="mx-1 h-6 bg-white/10" />

        <ToolbarGroup>
          <MarkButton editor={editor} type="superscript" />
          <MarkButton editor={editor} type="subscript" />
        </ToolbarGroup>

        <ToolbarSeparator className="mx-1 h-6 bg-white/10" />

        <ToolbarGroup>
          <TextAlignButton editor={editor} align="left" />
          <TextAlignButton editor={editor} align="center" />
          <TextAlignButton editor={editor} align="right" />
          <TextAlignButton editor={editor} align="justify" />
        </ToolbarGroup>

        <ToolbarSeparator className="mx-1 h-6 bg-white/10" />

        <ToolbarGroup>
          <ImageUploadButton editor={editor} text="Add" />
        </ToolbarGroup>

        <ToolbarSeparator className="mx-1 h-6 bg-white/10" />

        {/* Extras Menu */}
        <ToolbarGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-white hover:bg-white/10 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Plus
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0E0E11] text-white border-white/10">
              <DropdownMenuItem
                onClick={addYoutube}
                className="hover:bg-white/10 cursor-pointer gap-2"
              >
                <YoutubeIcon className="h-4 w-4" />
                YouTube
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setDetails().run()}
                className="hover:bg-white/10 cursor-pointer gap-2"
              >
                <MoreHorizontal className="h-4 w-4" />
                Détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const input = window.prompt(
                    "Entrez votre équation LaTeX (ex: E = mc^2)"
                  );
                  if (input) {
                    editor.chain().focus().insertContent(`$${input}$`).run();
                  }
                }}
                className="hover:bg-white/10 cursor-pointer gap-2"
              >
                <Sigma className="h-4 w-4" />
                Mathématiques
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                className="hover:bg-white/10 cursor-pointer gap-2"
              >
                <TableTriggerButton editor={editor} />
              </DropdownMenuItem>
              <DropdownMenuItem
                 onClick={() => editor.chain().focus().setEmoji("😄").run()}
                 className="hover:bg-white/10 cursor-pointer gap-2"
              >
                <EmojiTriggerButton editor={editor} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ToolbarGroup>
      </Toolbar>

      {/* Editor Content */}
      {/* Editor Content */}
      <div className="h-[900px] w-full overflow-y-auto rounded-b-lg border-t-0 p-4">
        <EditorContent editor={editor} className="min-h-full" />
      </div>
    </div>
  );
}
