"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Mention from "@tiptap/extension-mention";
import { Mathematics } from "@tiptap/extension-mathematics";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Emoji } from "@tiptap/extension-emoji";
import Details from "@tiptap/extension-details";
import FileHandler from "@tiptap/extension-file-handler";
import InvisibleCharacters from "@tiptap/extension-invisible-characters";
import TableOfContents from "@tiptap/extension-table-of-contents";
import Youtube from "@tiptap/extension-youtube";
import { TableKit } from "@/components/tiptap-node/table-node/extensions/table-node-extension";
import ImageExtension from "@/components/tiptap-node/image-node/image-node-extension";
import ImageUploadExtension from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import HorizontalRuleExtension from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
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
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button/code-block-button";
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover/color-highlight-popover";
import { ResetAllFormattingButton } from "@/components/tiptap-ui/reset-all-formatting-button/reset-all-formatting-button";
import { MentionDropdownMenu } from "@/components/tiptap-ui/mention-dropdown-menu/mention-dropdown-menu";
import { EmojiDropdownMenu } from "@/components/tiptap-ui/emoji-dropdown-menu/emoji-dropdown-menu";
import { SlashDropdownMenu } from "@/components/tiptap-ui/slash-dropdown-menu/slash-dropdown-menu";
import { MathematicsButton } from "@/components/tiptap-ui/mathematics-button/mathematics-button";
import { DragContextMenu } from "@/components/tiptap-ui/drag-context-menu/drag-context-menu";
import { cn } from "@/lib/utils";

const lowlight = createLowlight(common);

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
        codeBlock: false,
        horizontalRule: false, // We use custom HorizontalRuleExtension
        dropcursor: {
          color: "#DBEAFE",
          width: 4,
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
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          char: "@",
        },
      }),
      Emoji.configure({
        enableEmoticons: true,
        suggestion: {
          char: ":",
        },
      }),
      Mathematics,
      Typography,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Details.configure({
        persist: true,
        HTMLAttributes: {
          class: "details",
        },
      }),
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
      InvisibleCharacters.configure({
        injectCSS: true,
      }),
      TableOfContents,
      Youtube.configure({
        controls: false,
      }),
      // Custom Nodes
      TableKit.configure({
        table: {
          resizable: true,
        },
      }),
      ImageExtension,
      ImageUploadExtension,
      HorizontalRuleExtension,
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
      <Toolbar className="border-border bg-muted/30 flex-wrap gap-1 overflow-x-auto border-b p-2">
        {/* Undo/Redo Group */}
        <UndoRedoButton editor={editor} action="undo" />
        <UndoRedoButton editor={editor} action="redo" />
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Structure Group */}
        <HeadingDropdownMenu editor={editor} portal />
        <ListDropdownMenu
          editor={editor}
          types={["bulletList", "orderedList", "taskList"]}
          portal
        />
        <BlockquoteButton editor={editor} />
        <CodeBlockButton editor={editor} />
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Formatting Group */}
        <MarkButton editor={editor} type="bold" />
        <MarkButton editor={editor} type="italic" />
        <MarkButton editor={editor} type="strike" />
        <MarkButton editor={editor} type="code" />
        <MarkButton editor={editor} type="underline" />
        <ColorHighlightPopover editor={editor} />
        <ResetAllFormattingButton editor={editor} />
        <LinkPopover editor={editor} />
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Sub/Superscript Group */}
        <MarkButton editor={editor} type="superscript" />
        <MarkButton editor={editor} type="subscript" />
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Alignment Group */}
        <TextAlignButton editor={editor} align="left" />
        <TextAlignButton editor={editor} align="center" />
        <TextAlignButton editor={editor} align="right" />
        <TextAlignButton editor={editor} align="justify" />
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Insert Group */}
        <ImageUploadButton editor={editor} />
        <MathematicsButton editor={editor} />
      </Toolbar>

      <div className="bg-background relative flex-1 overflow-y-auto">
        <DragContextMenu editor={editor} />
        <EditorContent editor={editor} />
        <MentionDropdownMenu editor={editor} />
        <EmojiDropdownMenu editor={editor} />
        <SlashDropdownMenu editor={editor} />
      </div>
    </div>
  );
}
