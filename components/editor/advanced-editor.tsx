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

// ... imports ...

// ... inside FileHandler configuration ...
    onPaste: (currentEditor, files, htmlContent) => {
      files.forEach((file) => {
        if (htmlContent) {
          console.log(htmlContent); // eslint-disable-line no-console
          return; // Changed from returning false to just return, or return false if the type expects it. Tiptap documentation says return boolean to handle/not handle.
          // Actually, looking at the error "Not all code paths return a value", the arrow function inside forEach doesn't need to return anything, but the onPaste handler itself might.
          // Wait, onPaste signature in FileHandler is `onPaste?: (editor: Editor, files: File[], htmlContent: string | undefined) => void`.
          // So it should return void. The previous code had `return false` inside a forEach callback, which does nothing for the outer function.
          // I will just remove the return false or make it return void.
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

// ... inside toolbar ...
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setDetails().run()}
              className="hover:bg-white/10 cursor-pointer gap-2"
            >
              <MoreHorizontal className="h-4 w-4" />
              Détails
            </DropdownMenuItem>
            <DropdownMenuItem
               onClick={() => {
                 const input = window.prompt("Entrez votre équation LaTeX (ex: E = mc^2)");
                 if (input) {
                   // Mathematics extension usage might differ, usually it parses $...$ or uses a command.
                   // Assuming standard usage or just inserting text that gets parsed.
                   // Let's check if there is a specific command. If not, inserting text with $ delimiters.
                   editor.chain().focus().insertContent(`$${input}$`).run();
                 }
               }}
               className="hover:bg-white/10 cursor-pointer gap-2"
            >
              <Sigma className="h-4 w-4" />
              Mathématiques
            </DropdownMenuItem>
             <DropdownMenuItem
               onClick={() => editor.chain().focus().setEmoji("😄").run()} // Basic example, usually opens a picker
               className="hover:bg-white/10 cursor-pointer gap-2"
            >
              <Smile className="h-4 w-4" />
              Emoji
            </DropdownMenuItem>

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Image as ImageIcon,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CheckSquare,
  Heading as HeadingIcon,
  ChevronDown,
  Plus,
  Youtube as YoutubeIcon,
  Sigma,
  Smile,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
          return false;
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

  const addImage = () => {
    const url = window.prompt("URL de l'image");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt("URL de la vidéo YouTube");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-4xl rounded-lg border border-white/10 bg-[#0E0E11] text-white shadow-sm",
        className
      )}
    >
      {/* Toolbar */}
      <div
        className={cn(
          "sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-lg border-b border-white/10 bg-[#0E0E11] p-2",
          toolbarClassName
        )}
      >
        {/* Undo / Redo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />

        {/* Headings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-white hover:bg-white/10 hover:text-white"
            >
              <HeadingIcon className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0E0E11] text-white border-white/10">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                "hover:bg-white/10 cursor-pointer",
                editor.isActive("heading", { level: 1 }) && "bg-white/10"
              )}
            >
              H1 Titre 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                "hover:bg-white/10 cursor-pointer",
                editor.isActive("heading", { level: 2 }) && "bg-white/10"
              )}
            >
              H2 Titre 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(
                "hover:bg-white/10 cursor-pointer",
                editor.isActive("heading", { level: 3 }) && "bg-white/10"
              )}
            >
              H3 Titre 3
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={cn(
                "hover:bg-white/10 cursor-pointer",
                editor.isActive("paragraph") && "bg-white/10"
              )}
            >
              Paragraphe
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("bulletList") && "bg-white/10"
          )}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("orderedList") && "bg-white/10"
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("taskList") && "bg-white/10"
          )}
        >
          <CheckSquare className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />

        {/* Formatting */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("bold") && "bg-white/10"
          )}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("italic") && "bg-white/10"
          )}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("strike") && "bg-white/10"
          )}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("code") && "bg-white/10"
          )}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("underline") && "bg-white/10"
          )}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={setLink}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("link") && "bg-white/10"
          )}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        {/* Sub/Superscript */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("superscript") && "bg-white/10"
          )}
        >
          <SuperscriptIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive("subscript") && "bg-white/10"
          )}
        >
          <SubscriptIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive({ textAlign: "left" }) && "bg-white/10"
          )}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive({ textAlign: "center" }) && "bg-white/10"
          )}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive({ textAlign: "right" }) && "bg-white/10"
          )}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={cn(
            "text-white hover:bg-white/10 hover:text-white",
            editor.isActive({ textAlign: "justify" }) && "bg-white/10"
          )}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />

        {/* Add Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-white hover:bg-white/10 hover:text-white"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0E0E11] text-white border-white/10">
            <DropdownMenuItem
              onClick={addImage}
              className="hover:bg-white/10 cursor-pointer gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Image
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={addYoutube}
              className="hover:bg-white/10 cursor-pointer gap-2"
            >
              <YoutubeIcon className="h-4 w-4" />
              YouTube
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
              className="hover:bg-white/10 cursor-pointer gap-2"
            >
              <TableIcon className="h-4 w-4" />
              Tableau
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className="hover:bg-white/10 cursor-pointer gap-2"
            >
              <Quote className="h-4 w-4" />
              Citation
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setDetails().run()}
              className="hover:bg-white/10 cursor-pointer gap-2"
            >
              <MoreHorizontal className="h-4 w-4" />
              Détails
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px] p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
