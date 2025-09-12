import React, { useEffect, useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import Quill from "quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";

/* ---------- Custom Image Blot (alt support) ---------- */
const BaseImageBlot = Quill.import("formats/image");

class ImageWithAltBlot extends BaseImageBlot {
  static create(value) {
    const { url, alt } =
      typeof value === "string" ? { url: value, alt: "" } : value || {};
    const node = super.create(url);
    node.setAttribute("src", url || "");
    if (alt != null) node.setAttribute("alt", alt);
    return node;
  }
  static value(node) {
    return {
      url: node.getAttribute("src"),
      alt: node.getAttribute("alt") || "",
    };
  }
}
ImageWithAltBlot.blotName = "image";
ImageWithAltBlot.tagName = "img";
Quill.register(ImageWithAltBlot, true);

/* ---------- Helpers ---------- */
function getImageUrlsFromDelta(delta) {
  const urls = new Set();
  (delta?.ops || []).forEach((op) => {
    if (op.insert && op.insert.image) {
      const val = op.insert.image;
      const url = typeof val === "string" ? val : val?.url;
      if (url) urls.add(url);
    }
  });
  return urls;
}

// Strip empty <li> and any now-empty <ul>/<ol>
const stripEmptyLists = (html = "") => {
  let cleaned = html.replace(/<li>(?:\s|&nbsp;|<br\s*\/?>)*<\/li>/gi, "");
  cleaned = cleaned.replace(/<(ul|ol)[^>]*>\s*<\/\1>/gi, "");
  return cleaned;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing…",
  height = 500,
}) {
  const quillRef = useRef(null);
  const inputRef = useRef(null);

  // track current images + delayed deletions
  const currentImagesRef = useRef(new Set());
  const deleteTimersRef = useRef(new Map());
  const GRACE_MS = 4000;

  /* ---------- Image upload (with alt) ---------- */
  const handleImageChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const fd = new FormData();
    fd.append("editorImage", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload/upload-editor-image`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const url = res?.data?.url;
      if (url) {
        const alt = window.prompt("Enter alt text for this image:") || "";
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", { url, alt });
        quill.setSelection(range.index + 1, 0);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  const imageHandler = () => {
    if (!inputRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = handleImageChosen;
      inputRef.current = input;
    }
    inputRef.current.click();
  };

  /* ---------- YouTube insert ---------- */
  const extractYouTubeId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname === "youtu.be") return u.pathname.slice(1);
      if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
        return u.searchParams.get("v");
      }
      return null;
    } catch {
      return null;
    }
  };

  const videoHandler = () => {
    const url = window.prompt("Paste YouTube video URL:");
    if (!url) return;

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      window.alert("Invalid YouTube URL");
      return;
    }

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, "video", `https://www.youtube.com/embed/${videoId}`);
    quill.setSelection(range.index + 1, 0);
  };

  /* ---------- List handler (NO bullets on empty lines) ---------- */
  const applyListWithoutEmptyLines = (value) => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;

    const range = quill.getSelection(true);
    if (!range) return;

    const lines = quill.getLines(range.index, range.length || 1);

    lines.forEach((line) => {
      const lineIndex = quill.getIndex(line);
      const len = Math.max(line.length(), 1); // include newline
      // grab plain text of the line
      const text = quill
        .getText(lineIndex, len)
        .replace(/\u200B/g, "") // zero-width space
        .replace(/\s+/g, " ")
        .trim();

      if (text.length === 0) {
        // remove list formatting if line is empty
        quill.formatLine(lineIndex, len, "list", false);
      } else {
        // apply requested list type
        quill.formatLine(lineIndex, len, "list", value);
      }
    });

    quill.setSelection(range.index, range.length, "silent");
  };

  /* ---------- Toolbar / Modules ---------- */
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler,
          list: (value) => applyListWithoutEmptyLines(value), // 👈 override default list handler
        },
      },
      clipboard: { matchVisual: false },
    }),
    []
  );

  /* ---------- onChange: sanitize + image diff ---------- */
  const handleEditorChange = (content, delta, source, editor) => {
    const cleaned = stripEmptyLists(content);
    if (onChange) onChange(cleaned);

    const nowUrls = getImageUrlsFromDelta(editor.getContents());
    const prevUrls = currentImagesRef.current;

    // cancel pending deletes for any url that reappeared
    nowUrls.forEach((url) => {
      const t = deleteTimersRef.current.get(url);
      if (t) {
        clearTimeout(t);
        deleteTimersRef.current.delete(url);
      }
    });

    // schedule deletes for any url that disappeared
    prevUrls.forEach((url) => {
      if (!nowUrls.has(url) && !deleteTimersRef.current.get(url)) {
        const timer = setTimeout(async () => {
          deleteTimersRef.current.delete(url);
          try {
            await axios.delete(
              `${import.meta.env.VITE_API_URL}/upload/upload-editor-image`,
              { data: { url } }
            );
          } catch (err) {
            console.error("Failed to delete image from server:", err);
          }
        }, GRACE_MS);
        deleteTimersRef.current.set(url, timer);
      }
    });

    currentImagesRef.current = nowUrls;
  };

  // initialize currentImagesRef on mount
  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;
    currentImagesRef.current = getImageUrlsFromDelta(quill.getContents());
  }, []);

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      deleteTimersRef.current.forEach((t) => clearTimeout(t));
      deleteTimersRef.current.clear();
    };
  }, []);

  return (
    <div className="w-full">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleEditorChange}
        placeholder={placeholder}
        modules={modules}
        style={{ height }}
        className="rounded-md"
      />

      <style>
        {`
        .ql-container { min-height: ${height}px; }
        .ql-editor { min-height: ${height - 50}px; }
      `}
      </style>
    </div>
  );
}
