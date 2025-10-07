import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactQuill from 'react-quill'
import Quill from 'quill'
import axios from 'axios'
import 'react-quill/dist/quill.snow.css'

// shadcn/ui
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'

// Icons
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  List,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Eraser,
  ExternalLink,
  Pencil,
  Trash2,
} from 'lucide-react'

/* ---------- Custom Image Blot (alt support) ---------- */
if (typeof window !== 'undefined' && Quill && !Quill.imports['formats/image-alt']) {
  const BaseImageBlot = Quill.import('formats/image')
  class ImageWithAltBlot extends BaseImageBlot {
    static create(value) {
      const { url, alt } = typeof value === 'string' ? { url: value, alt: '' } : value || {}
      const node = super.create(url)
      node.setAttribute('src', url || '')
      if (alt != null) node.setAttribute('alt', alt)
      return node
    }
    static value(node) {
      return {
        url: node.getAttribute('src'),
        alt: node.getAttribute('alt') || '',
      }
    }
  }
  ImageWithAltBlot.blotName = 'image'
  ImageWithAltBlot.tagName = 'img'
  Quill.register({ 'formats/image-alt': ImageWithAltBlot, 'formats/image': ImageWithAltBlot }, true)
}

/* ---------- Helpers ---------- */
function getImageUrlsFromDelta(delta) {
  const urls = new Set()
  ;(delta?.ops || []).forEach((op) => {
    if (op.insert && op.insert.image) {
      const val = op.insert.image
      const url = typeof val === 'string' ? val : val?.url
      if (url) urls.add(url)
    }
  })
  return urls
}

const stripEmptyLists = (html = '') => {
  let cleaned = html.replace(/<li>(?:\s|&nbsp;|<br\s*\/?>)*<\/li>/gi, '')
  cleaned = cleaned.replace(/<(ul|ol)[^>]*>\s*<\/(\1)>/gi, '')
  return cleaned
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing…',
  height = 500,
}) {
  const quillRef = useRef(null)
  const fileInputRef = useRef(null)

  const [openImageDialog, setOpenImageDialog] = useState(false)
  const [openVideoDialog, setOpenVideoDialog] = useState(false)
  const [imageAlt, setImageAlt] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [pendingFile, setPendingFile] = useState(null)

  // Active formats for toggles + heading highlight
  const [activeFormats, setActiveFormats] = useState({})

  // Link hover popover state
  const [linkPopover, setLinkPopover] = useState({
    show: false,
    href: '',
    left: 0,
    top: 0,
    range: null,
  })
  const popoverRef = useRef(null)

  const currentImagesRef = useRef(new Set())
  const deleteTimersRef = useRef(new Map())
  const GRACE_MS = 4000

  const applyListWithoutEmptyLines = useCallback((valueArg) => {
    const quill = quillRef.current?.getEditor?.()
    if (!quill) return

    const range = quill.getSelection(true)
    if (!range) return

    const lines = quill.getLines(range.index, range.length || 1)

    lines.forEach((line) => {
      const lineIndex = quill.getIndex(line)
      const len = Math.max(line.length(), 1)
      const text = quill
        .getText(lineIndex, len)
        .replace(/\u200B/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (text.length === 0) {
        quill.formatLine(lineIndex, len, 'list', false)
      } else {
        quill.formatLine(lineIndex, len, 'list', valueArg)
      }
    })

    quill.setSelection(range.index, range.length, 'silent')
  }, [])

  // toggle-aware formatter
  const toggleFormat = (name, valueArg) => {
    const quill = quillRef.current?.getEditor?.()
    if (!quill) return
    const range = quill.getSelection(true)
    if (!range) return

    const formats = quill.getFormat(range)
    if (name === 'header') {
      const targetLevel = valueArg
      const currentLevel = formats.header
      quill.format('header', currentLevel === targetLevel ? false : targetLevel)
      return
    }
    if (name === 'list') return applyListWithoutEmptyLines(valueArg)

    const toggleable = ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'link']
    if (toggleable.includes(name)) {
      const isActive = !!formats[name]
      quill.format(name, isActive ? false : (valueArg ?? true))
      return
    }
    quill.format(name, valueArg)
  }

  const insertLink = () => {
    const quill = quillRef.current?.getEditor?.()
    if (!quill) return
    const range = quill.getSelection(true)
    if (!range) return

    const existing = quill.getFormat(range)?.link
    const url = window.prompt('Paste URL:', existing || '')
    if (url === null) return
    if (url === '') {
      quill.format('link', false)
    } else {
      quill.format('link', url)
    }
    quill.setSelection(range.index + (range.length || 0), 0)
  }

  const handleChooseImage = () => fileInputRef.current?.click()

  const onFilePicked = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPendingFile(file)
    setImageAlt('')
    setOpenImageDialog(true)
  }

  const doUploadImage = async () => {
    if (!pendingFile) return
    const fd = new FormData()
    fd.append('editorImage', pendingFile)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload/upload-editor-image`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      const url = res?.data?.url
      if (url) {
        const quill = quillRef.current.getEditor()
        const range = quill.getSelection(true)
        quill.insertEmbed(range.index, 'image', { url, alt: imageAlt || '' })
        quill.setSelection(range.index + 1, 0)
        toast.success('Image added', { description: imageAlt || 'No alt provided' })
      }
    } catch (err) {
      console.error('Image upload failed:', err)
      toast.error('Upload failed', { description: 'Could not upload image' })
    } finally {
      setOpenImageDialog(false)
      setPendingFile(null)
      setImageAlt('')
    }
  }

  const extractYouTubeId = (url) => {
    try {
      const u = new URL(url)
      if (u.hostname === 'youtu.be') return u.pathname.slice(1)
      if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') {
        return u.searchParams.get('v')
      }
      return null
    } catch {
      return null
    }
  }

  const confirmInsertYouTube = () => {
    if (!youtubeUrl) return setOpenVideoDialog(false)
    const videoId = extractYouTubeId(youtubeUrl)
    if (!videoId) return toast.error('Invalid YouTube URL')
    const quill = quillRef.current.getEditor()
    const range = quill.getSelection(true)
    quill.insertEmbed(range.index, 'video', `https://www.youtube.com/embed/${videoId}`)
    quill.setSelection(range.index + 1, 0)
    setOpenVideoDialog(false)
    setYoutubeUrl('')
  }

  const modules = useMemo(
    () => ({ toolbar: false, clipboard: { matchVisual: false } }),
    []
  )

  const handleEditorChange = (content, delta, source, editor) => {
    const cleaned = stripEmptyLists(content)
    onChange?.(cleaned)

    const range = editor.getSelection()
    if (range) {
      const fmts = editor.getFormat(range)
      setActiveFormats(fmts || {})
    }

    const nowUrls = getImageUrlsFromDelta(editor.getContents())
    const prevUrls = currentImagesRef.current

    nowUrls.forEach((url) => {
      const t = deleteTimersRef.current.get(url)
      if (t) {
        clearTimeout(t)
        deleteTimersRef.current.delete(url)
      }
    })

    prevUrls.forEach((url) => {
      if (!nowUrls.has(url) && !deleteTimersRef.current.get(url)) {
        const timer = setTimeout(async () => {
          deleteTimersRef.current.delete(url)
          try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/upload/upload-editor-image`, { data: { url } })
          } catch (err) {
            console.error('Failed to delete image from server:', err)
          }
        }, GRACE_MS)
        deleteTimersRef.current.set(url, timer)
      }
    })

    currentImagesRef.current = nowUrls
  }

  // keep activeFormats in sync on selection change
  useEffect(() => {
    const quill = quillRef.current?.getEditor?.()
    if (!quill) return
    const handleSelectionChange = (range) => {
      if (!range) {
        setActiveFormats({})
        return
      }
      const fmts = quill.getFormat(range)
      setActiveFormats(fmts || {})
    }
    quill.on('selection-change', handleSelectionChange)
    return () => {
      quill.off('selection-change', handleSelectionChange)
    }
  }, [])

  // initialize current images
  useEffect(() => {
    const quill = quillRef.current?.getEditor?.()
    if (!quill) return
    currentImagesRef.current = getImageUrlsFromDelta(quill.getContents())
  }, [])

  // clear pending deletes on unmount
  useEffect(() => () => {
    deleteTimersRef.current.forEach((t) => clearTimeout(t))
    deleteTimersRef.current.clear()
  }, [])

  // Link hover inspector: show on link hover, don't auto-hide. Close only on click outside.
  const attachLinkHoverHandlers = useCallback(() => {
    const quill = quillRef.current?.getEditor?.()
    if (!quill) return
    const root = quill.root
    const wrapper = root?.parentElement

    const onMouseOver = (e) => {
      const link = e.target.closest('a')
      if (!link || !root.contains(link)) return

      // map DOM node to blot to get range
      let linkIndex = null
      let linkLength = null
      try {
        const blot = Quill.find(link)
        if (blot && quill && blot.offset && blot.length) {
          linkIndex = blot.offset(quill.scroll)
          linkLength = blot.length()
        }
      } catch (_) {}

      const rect = link.getBoundingClientRect()
      const hostRect = wrapper.getBoundingClientRect()
      const left = rect.left - hostRect.left
      const top = rect.bottom - hostRect.top + 6

      setLinkPopover({
        show: true,
        href: link.getAttribute('href') || '',
        left,
        top,
        range: linkIndex != null ? { index: linkIndex, length: linkLength || link.textContent?.length || 0 } : null,
      })
    }

    root.addEventListener('mouseover', onMouseOver)
    return () => {
      root.removeEventListener('mouseover', onMouseOver)
    }
  }, [])

  useEffect(() => {
    attachLinkHoverHandlers()
  }, [attachLinkHoverHandlers])

  // Close popover on click outside
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!linkPopover.show) return
      const inside = popoverRef.current && popoverRef.current.contains(e.target)
      if (!inside) {
        setLinkPopover((s) => ({ ...s, show: false }))
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [linkPopover.show])

  const editHoveredLink = () => {
    const quill = quillRef.current?.getEditor?.()
    if (!quill) return
    const range = linkPopover.range || quill.getSelection(true)
    if (!range) return
    quill.setSelection(range.index, range.length, 'silent')
    const url = window.prompt('Edit URL:', linkPopover.href || '')
    if (url === null) return
    if (url === '') {
      quill.format('link', false)
      toast.success('Link removed')
    } else {
      quill.format('link', url)
      toast.success('Link updated')
    }
    setLinkPopover((s) => ({ ...s, show: false }))
  }

  const removeHoveredLink = () => {
    const quill = quillRef.current?.getEditor?.()
    if (!quill) return
    const range = linkPopover.range || quill.getSelection(true)
    if (!range) return
    quill.setSelection(range.index, range.length, 'silent')
    quill.format('link', false)
    toast.success('Link removed')
    setLinkPopover((s) => ({ ...s, show: false }))
  }

  // Toolbar UI bits
  const ToolbarButton = ({ label, icon: Icon, onClick, active }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={active ? 'default' : 'ghost'}
            size="sm"
            className={`h-9 w-9 p-0 ${active ? 'shadow-sm' : ''}`}
            onClick={onClick}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const HeaderButton = ({ level }) => (
    <ToolbarButton
      label={`Heading ${level}`}
      icon={level === 1 ? Heading1 : level === 2 ? Heading2 : Heading3}
      active={activeFormats.header === level}
      onClick={() => toggleFormat('header', level)}
    />
  )

  return (
    <Card className="w-full border rounded-2xl shadow-sm">
      <CardHeader className="py-2">
        <div className="flex flex-wrap items-center gap-1">
          <HeaderButton level={1} />
          <HeaderButton level={2} />
          <HeaderButton level={3} />
          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarButton
            label="Bold"
            icon={Bold}
            active={!!activeFormats.bold}
            onClick={() => toggleFormat('bold')}
          />
          <ToolbarButton
            label="Italic"
            icon={Italic}
            active={!!activeFormats.italic}
            onClick={() => toggleFormat('italic')}
          />
          <ToolbarButton
            label="Underline"
            icon={Underline}
            active={!!activeFormats.underline}
            onClick={() => toggleFormat('underline')}
          />
          <ToolbarButton
            label="Strike"
            icon={Strikethrough}
            active={!!activeFormats.strike}
            onClick={() => toggleFormat('strike')}
          />
          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarButton
            label="Ordered List"
            icon={ListOrdered}
            active={activeFormats.list === 'ordered'}
            onClick={() => toggleFormat('list', 'ordered')}
          />
          <ToolbarButton
            label="Bullet List"
            icon={List}
            active={activeFormats.list === 'bullet'}
            onClick={() => toggleFormat('list', 'bullet')}
          />
          <ToolbarButton
            label="Blockquote"
            icon={Quote}
            active={!!activeFormats.blockquote}
            onClick={() => toggleFormat('blockquote')}
          />
          <ToolbarButton
            label="Code Block"
            icon={Code}
            active={!!activeFormats['code-block']}
            onClick={() => toggleFormat('code-block')}
          />
          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarButton
            label="Insert/Edit Link"
            icon={LinkIcon}
            active={!!activeFormats.link}
            onClick={insertLink}
          />
          <ToolbarButton label="Insert Image" icon={ImageIcon} onClick={handleChooseImage} />
          <ToolbarButton label="Insert YouTube" icon={Video} onClick={() => setOpenVideoDialog(true)} />
          <ToolbarButton label="Clear Formatting" icon={Eraser} onClick={() => toggleFormat('clean', true)} />

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFilePicked} />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <div className="relative">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={handleEditorChange}
            placeholder={placeholder}
            modules={modules}
            className="rounded-b-2xl"
            style={{ height }}
          />

          {/* Link hover popover (stays open until click outside) */}
          {linkPopover.show && (
            <div
              ref={popoverRef}
              className="absolute z-20"
              style={{ left: linkPopover.left, top: linkPopover.top }}
            >
              <div className="rounded-xl border bg-background shadow-lg p-2 w-[280px]">
                <div className="text-xs text-muted-foreground truncate">{linkPopover.href || 'No URL'}</div>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={linkPopover.href || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs underline"
                    onClick={() => setLinkPopover((s) => ({ ...s, show: false }))}
                  >
                    <ExternalLink className="h-3 w-3" /> Open
                  </a>
                  <Button size="xs" variant="ghost" className="h-7 px-2 text-xs" onClick={editHoveredLink}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="xs" variant="ghost" className="h-7 px-2 text-xs" onClick={removeHoveredLink}>
                    <Trash2 className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          )}

          <style>{`
            .ql-container { min-height: ${height}px; border: none; }
            .ql-toolbar { display: none; }
            .ql-editor { min-height: ${height - 50}px; font-size: 0.95rem; }
            .ql-editor a { text-decoration: underline; }
          `}</style>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <span>Supports images with alt, embeds, lists without empty bullets, live format toggles, heading highlight, and a link inspector.</span>
        <span>{placeholder}</span>
      </CardFooter>

      {/* Image Dialog */}
      <Dialog open={openImageDialog} onOpenChange={setOpenImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add image alt text</DialogTitle>
            <DialogDescription>Good alt boosts accessibility and SEO.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="alt">Alt text</Label>
            <Input id="alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Describe the image..." />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={() => setOpenImageDialog(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={doUploadImage}>Insert Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Dialog */}
      <Dialog open={openVideoDialog} onOpenChange={setOpenVideoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert YouTube Video</DialogTitle>
            <DialogDescription>Paste a full YouTube URL.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="yt">YouTube URL</Label>
            <Input id="yt" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={() => setOpenVideoDialog(false)}>Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={confirmInsertYouTube}>Insert Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
