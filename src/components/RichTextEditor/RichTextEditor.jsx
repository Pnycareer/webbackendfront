import React, { useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import Quill from "quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";

const RichTextEditor = ({ value, onChange, height = "300px" }) => {
  const quillRef = useRef();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const icons = Quill.import("ui/icons");
      icons["youtube"] = `
        <svg viewBox="0 0 24 24">
          <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>
        </svg>`;
    }
  }, []);

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("editorImage", file);

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload/upload-editor-image`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const imageUrl = res.data.url;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, "image", imageUrl);
      } catch (err) {
        console.error("Image upload error:", err);
      }
    };
  };

  const insertYouTubeVideo = () => {
    const videoId = prompt("Enter YouTube video ID:");
    if (!videoId) return;

    const videoUrl = `https://www.youtube.com/embed/${videoId}`;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    editor.insertEmbed(range.index, "video", videoUrl);
    editor.setSelection(range.index + 1);
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ align: [] }],  // <<== ADD ALIGNMENT BUTTONS
        ["link", "image", "video", "youtube"],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
      handlers: {
        image: handleImageUpload,
        youtube: insertYouTubeVideo,
      },
    },
  };

  const formats = [
    "header", "bold", "italic", "underline", 
    "link", "image", "video", "list", "bullet",
    "align" // <<== IMPORTANT: ADD align in formats
  ];

  return (
    <div className="bg-white text-black rounded-md hover:text-white">
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        theme="snow"
        modules={modules}
        formats={formats}
        className="text-black"
        style={{ minHeight: height }}
      />
    </div>
  );
};

export default RichTextEditor;
