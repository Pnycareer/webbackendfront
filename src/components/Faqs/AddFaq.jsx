import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../utils/axios";


export default function FaqPostPage() {
  const [category, setCategory] = useState({ name: "", url_slug: "" });
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [faqImage, setFaqImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`/api/v1/categories`);
        setCategories(res.data); // axios auto-parses JSON
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (i, key, val) => {
    const updated = [...faqs];
    updated[i][key] = val;
    setFaqs(updated);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaqImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);

  const handleSelect = (cat) => {
    setCategory({
      name: cat.Category_Name,
      url_slug: cat.url_Slug,
      _id: cat._id,
    });
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("category", JSON.stringify(category));
  formData.append("faqs", JSON.stringify(faqs));
  if (faqImage) formData.append("faqImage", faqImage);

  try {
    const res = await axios.post(
      `/api/v1/faqs`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Assuming your backend sends something like: { message: "FAQ posted successfully" }
    alert(res.data.message || "FAQ posted!");
    
    // Reset state after success
    setCategory({ name: "", url_slug: "" });
    setFaqs([{ question: "", answer: "" }]);
    setFaqImage(null);
  } catch (err) {
    // Grab backend message or default to err.message
    const errorMessage = err.response?.data?.message || "Something went wrong.";
    alert("Error: " + errorMessage);
  }
};  

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full mx-auto p-6 bg-gray-100 shadow-lg space-y-6 overflow-y-auto min-h-screen"
    >
      <h2 className="text-2xl font-bold text-gray-800">Create a FAQ</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative w-full">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-full p-3 rounded-lg border border-gray-300 text-left bg-white text-black hover:border-blue-500 transition-all"
          >
            {category.name || "Select a Category"}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto"
              >
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    onClick={() => handleSelect(cat)}
                    className="p-3 hover:bg-blue-100 cursor-pointer text-black"
                  >
                    {cat.Category_Name}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <label
            htmlFor="faqImage"
            className="flex flex-col items-center justify-center w-full h-40 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:border-blue-500 hover:bg-blue-50 transition-all relative overflow-hidden"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="object-contain h-full w-full"
              />
            ) : (
              <>
                <svg
                  className="w-10 h-10 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4v-4m-4 4h8"
                  />
                </svg>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  & drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, JPEG up to 5MB
                </p>
              </>
            )}

            <input
              id="faqImage"
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>

        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border p-4 rounded-lg text-black"
          >
            <input
              type="text"
              placeholder="Question"
              value={faq.question}
              onChange={(e) => handleChange(i, "question", e.target.value)}
              className="w-full mb-2 p-2 border border-gray-300 rounded"
              required
            />
            <textarea
              placeholder="Answer"
              value={faq.answer}
              onChange={(e) => handleChange(i, "answer", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows="3"
              required
            />
          </motion.div>
        ))}

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={addFaq}
            className="text-blue-600 underline mt-2"
          >
            + Add another FAQ
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            Submit FAQ
          </button>
        </div>
      </form>
    </motion.div>
  );
}
