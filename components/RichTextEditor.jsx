
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function RichTextEditor({
  content = "",
  onChange,
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[180px] rounded-lg border border-slate-600 bg-slate-800 p-4 text-white outline-none",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  const buttonStyle = (active) =>
    `rounded px-3 py-2 text-sm ${
      active
        ? "bg-blue-600 text-white"
        : "bg-slate-700 text-white hover:bg-slate-600"
    }`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonStyle(editor.isActive("bold"))}
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          className={buttonStyle(editor.isActive("italic"))}
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
        >
          <em>I</em>
        </button>

        <button
          type="button"
          className={buttonStyle(
            editor.isActive("heading", { level: 2 })
          )}
          onClick={() =>
            editor.chain().focus().toggleHeading({
              level: 2,
            }).run()
          }
        >
          H2
        </button>

        <button
          type="button"
          className={buttonStyle(
            editor.isActive("bulletList")
          )}
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          • List
        </button>

        <button
          type="button"
          className={buttonStyle(false)}
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </button>

        <button
          type="button"
          className={buttonStyle(false)}
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
