"use client";

import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Image } from "@/components/tiptap-node/image-node/image-node-extension";
import { NodeBackground } from "@/components/tiptap-extension/node-background-extension";
import { NodeAlignment } from "@/components/tiptap-extension/node-alignment-extension";
import { TableKit } from "@/components/tiptap-node/table-node/extensions/table-node-extension";
import { TableHandleExtension } from "@/components/tiptap-node/table-node/extensions/table-handle";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

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
import { Mathematics } from "@tiptap/extension-mathematics";

import FileHandler from "@tiptap/extension-file-handler";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { uploadImage } from "@/lib/upload-image";

import { cn } from "@/lib/utils";
import "@/components/tiptap-node/table-node/styles/prosemirror-table.scss";
import "@/components/tiptap-node/table-node/styles/table-node.scss";

// Tiptap UI Components
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ImageAlignButton } from "@/components/tiptap-ui/image-align-button";
import { TableTriggerButton } from "@/components/tiptap-node/table-node/ui/table-trigger-button";
import { TableNodeAlignButton } from "@/components/tiptap-node/table-node/ui/table-node-align-button";

import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import { ColorTextPopover } from "@/components/tiptap-ui/color-text-popover";
import { MathBubbleMenu } from "@/components/tiptap-ui/math-bubble-menu";
import { YoutubePopover } from "@/components/tiptap-ui/youtube-popover";
import { MathPopover } from "@/components/tiptap-ui/math-popover";
import { FontSizeDropdown } from "@/components/tiptap-ui/font-size-dropdown"
import { FontFamilyDropdown } from "@/components/tiptap-ui/font-family-dropdown";
import katex from "katex";

import { ScrollArea } from "@/components/ui/scroll-area";

// Table Node UI Components
import { TableHandle } from "@/components/tiptap-node/table-node/ui/table-handle/table-handle";
import { TableSelectionOverlay } from "@/components/tiptap-node/table-node/ui/table-selection-overlay";
import { TableCellHandleMenu } from "@/components/tiptap-node/table-node/ui/table-cell-handle-menu";
import { TableExtendRowColumnButtons } from "@/components/tiptap-node/table-node/ui/table-extend-row-column-button";

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
  TextStyleKit,
  Color,
  Image,
  TableKit.configure({
    table: {
      resizable: true,
    },
  }),
  TableHandleExtension,
  NodeBackground,
  NodeAlignment,
  Underline,
  Link.configure({
    openOnClick: false,
  }),

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
    maxSize: 1024 * 1024 * 1024 * 1.5, // 1.5GB
    accept: "image/*",
    upload: (file: File) => {
      return uploadImage(file);
    },
  }),
  Youtube.configure({
    controls: false,
  }),
  Mathematics.configure({
    katexOptions: {
      throwOnError: false,
    },
  }),

  FileHandler.configure({
    allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff", "image/x-icon", "image/heic", "image/avif"],
    onDrop: (currentEditor, files, pos) => {
      files.forEach(async (file) => {
        if (file.size > 1024 * 1024 * 1024 * 1.5) {
          window.alert("Fichier trop volumineux. La taille maximum est de 1.5GB.");
          return;
        }

        try {
          const url = await uploadImage(file);
          currentEditor
            .chain()
            .insertContentAt(pos, {
              type: "image",
              attrs: {
                src: url,
              },
            })
            .focus()
            .run();
        } catch (error) {
          console.error("Upload failed:", error);
          window.alert("Échec de l'upload de l'image.");
        }
      });
    },
    onPaste: (currentEditor, files, htmlContent) => {
      files.forEach(async (file) => {
        if (htmlContent) {
          console.log(htmlContent);
          return;
        }

        if (file.size > 1024 * 1024 * 1024 * 1.5) {
          window.alert("Fichier trop volumineux. La taille maximum est de 1.5GB.");
          return;
        }

        try {
          const url = await uploadImage(file);
          currentEditor
            .chain()
            .insertContentAt(currentEditor.state.selection.anchor, {
              type: "image",
              attrs: {
                src: url,
              },
            })
            .focus()
            .run();
        } catch (error) {
          console.error("Upload failed:", error);
          window.alert("Échec de l'upload de l'image.");
        }
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
  portal?: boolean;
}

export function AdvancedEditor({
  initialContent,
  onChange,
  className,
  editorClassName,
  toolbarClassName,
  placeholder,
  portal = false,
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

  // Ensure katex is available globally for the extension
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).katex = katex;
  }

  if (!editor) {
    return null;
  }

  return (
    <EditorContext.Provider value={{ editor }}>
      <div
        className={cn(
          "mx-auto w-full max-w-full rounded-lg border border-white/10 bg-[#19191A] text-white shadow-sm",
          className
        )}
      >
        <style jsx global>{`
          .prose ul > li, .prose ol > li {
            margin-top: 0.1em !important;
            margin-bottom: 0.1em !important;
          }
          .prose ul, .prose ol {
            margin-top: 0.5em !important;
            margin-bottom: 0.5em !important;
          }
          .prose li p {
            margin-top: 0.1em !important;
            margin-bottom: 0.1em !important;
          }
          /* Bullet point styles */
          .prose ul {
            list-style-type: disc !important;
          }
          .prose ul ul {
            list-style-type: circle !important;
          }
          .prose ul ul ul {
            list-style-type: square !important;
          }
          /* Link styles */
          .prose a {
            text-decoration: none !important;
          }
          /* Hide scrollbar */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
        {/* Toolbar */}
        <Toolbar
          className={cn(
            "sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-lg border-b border-white/10 bg-[#19191A] p-2 justify-center",
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
            <FontSizeDropdown editor={editor} portal={portal} />
            <FontFamilyDropdown editor={editor} portal={portal} />
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
            <TextAlignButton editor={editor} align="left" />
            <TextAlignButton editor={editor} align="center" />
            <TextAlignButton editor={editor} align="right" />
            <TextAlignButton editor={editor} align="justify" />
          </ToolbarGroup>

          <ToolbarSeparator className="mx-1 h-6 bg-white/10" />

          <ToolbarGroup>
            <ImageUploadButton editor={editor} text="Add" />
            <ImageAlignButton editor={editor} align="left" />
            <ImageAlignButton editor={editor} align="center" />
            <ImageAlignButton editor={editor} align="right" />
          </ToolbarGroup>

          <ToolbarSeparator className="mx-1 h-6 bg-white/10" />



          <ToolbarGroup>
            <TableTriggerButton editor={editor} text="Tableau" />
            <TableNodeAlignButton editor={editor} align="left" />
            <TableNodeAlignButton editor={editor} align="center" />
            <TableNodeAlignButton editor={editor} align="right" />
          </ToolbarGroup>

          <ToolbarSeparator className="mx-1 h-6 bg-white/10" />

          {/* Extras Menu */}
          <ToolbarGroup>
            <YoutubePopover editor={editor} />
            <MathPopover editor={editor} />
          </ToolbarGroup>
        </Toolbar>

        {/* Editor Content */}
        <ScrollArea className="h-[900px] w-full rounded-b-lg border-t-0 p-4">
          <EditorContent editor={editor} className="min-h-full" />
          <MathBubbleMenu editor={editor} />
        </ScrollArea>

        {/* Table Components */}
        <TableHandle />
        <TableSelectionOverlay
          showResizeHandles={true}
          cellMenu={(props) => (
            <TableCellHandleMenu
              editor={props.editor}
              onMouseDown={(e) => props.onResizeStart?.('br')(e)}
            />
          )}
        />
        <TableExtendRowColumnButtons />
      </div>
    </EditorContext.Provider>
  );
}
