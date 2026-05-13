import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { useEffect } from 'react'

export default function TiptapEditor({ value, onChange, placeholder, isError }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync value from outside if it changes (e.g. initial load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  if (!editor) return null

  const MenuBar = () => (
    <div className="flex gap-1 p-2 bg-slate-900 border-b border-white/5 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-5 bg-white/10 my-auto mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
      >
        <ListOrdered size={16} />
      </button>
    </div>
  )

  return (
    <div className={`border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-sky-500/50 transition-all shadow-inner ${isError ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-700/50 bg-slate-950/50'}`}>
      <MenuBar />
      <EditorContent editor={editor} className="cursor-text" />
    </div>
  )
}
