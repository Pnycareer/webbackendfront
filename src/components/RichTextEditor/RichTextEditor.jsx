import React, { useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing…",
  height = 300,
}) {
  const quillRef = useRef(null);

  // ---- IMAGE UPLOAD (your code, Quill-integrated) ----
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
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", url);
        quill.setSelection(range.index + 1, 0);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.onchange = handleImageChosen;
    input.click();
  };

  // ---- YOUTUBE INSERT ----
  const extractYouTubeId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname === "youtu.be") return u.pathname.slice(1);
      if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
        // handles https://www.youtube.com/watch?v=ID and share links with extra params
        return u.searchParams.get("v");
      }
      return null;
    } catch {
      return null;
    }
  };

  const videoHandler = () => {
    const url = prompt("Paste YouTube video URL:");
    if (!url) return;

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    // Quill understands 'video' embeds — give it the embeddable URL
    quill.insertEmbed(range.index, "video", `https://www.youtube.com/embed/${videoId}`);
    quill.setSelection(range.index + 1, 0);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image", "video"], // keep both
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler, // <- custom YouTube handler
        },
      },
      clipboard: { matchVisual: false },
    }),
    []
  );

  return (
    <div className="w-full">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        style={{ height, backgroundColor: "#fff" }}
        className="rounded-md"
      />
    </div>
  );
}
