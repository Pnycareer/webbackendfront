import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, FileText as PdfIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FileField({
  label,
  accept,
  required,
  onChange,
  error,
}) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setFileName(file?.name || null);
    onChange?.(file);

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const isPdf = accept?.includes("pdf");

  return (
    <div className="space-y-2">
      {label && <Label className="text-gray-200">{label}</Label>}

      <div
        className="relative group border border-dashed border-white/20 bg-white/5 rounded-lg min-h-[160px] flex items-center justify-center transition hover:border-white/40 hover:shadow-[0_0_20px_#ffffff15] cursor-pointer overflow-hidden"
        onClick={() => inputRef.current?.click()}
      >
        {previewUrl && !isPdf ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="object-contain max-h-[140px] w-auto transition-all"
          />
        ) : (
          <div className="flex flex-col items-center text-center pointer-events-none">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 2 }}
              transition={{ type: "spring", stiffness: 250 }}
            >
              {isPdf ? (
                <PdfIcon className="w-10 h-10 text-white/80 group-hover:text-white mb-2" />
              ) : (
                <ImageIcon className="w-10 h-10 text-white/80 group-hover:text-white mb-2" />
              )}
            </motion.div>

            <span className="text-sm text-white/50">
              {fileName ? "Change File" : "Click to upload"}
            </span>

            <AnimatePresence>
              {fileName && (
                <motion.span
                  key={fileName}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs text-white/60 mt-1 truncate max-w-xs"
                >
                  {fileName}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        required={required}
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
