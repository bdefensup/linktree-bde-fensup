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
import { ListButton } from "@/components/tiptap-ui/list-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { TableTriggerButton } from "@/components/tiptap-node/table-node/ui/table-trigger-button";
import { EmojiTriggerButton } from "@/components/tiptap-ui/emoji-trigger-button";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";

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
        "mx-auto w-full max-w-4xl rounded-lg border border-white/10 bg-[#0E0E11] text-white shadow-sm",
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
        
      </Toolbar>

      {/* Editor Content */}
      <div className="min-h-[400px] p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
