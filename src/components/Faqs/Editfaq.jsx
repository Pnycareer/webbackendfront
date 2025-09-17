import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";

const EditFaq = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [faqs, setFaqs] = useState([]);

  // 🔎 search
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFaqDetails = async () => {
      try {
        const res = await axios.get(`/api/v1/faqs/${id}`);
        const data = res.data;

        setCategoryName(data.category.name);
        setPreviewImage(
          `${import.meta.env.VITE_API_URL}/${data.category.category_image}`
        );
        setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
      } catch (err) {
        console.error("Failed to fetch FAQ details:", err);
      }
    };

    if (id) fetchFaqDetails();
  }, [id]);

  const handleFaqChange = (index, field, value) => {
    setFaqs((prev) => {
      const cloned = [...prev];
      cloned[index] = { ...cloned[index], [field]: value };
      return cloned;
    });
  };

  const addFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "", status: "1" }]);
  };

  const removeFaq = (index) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  // helper: strip html to plain text (for validation & search)
  const plainText = (html = "") =>
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invalid = faqs.some(
      (f) => !f.question?.trim() || plainText(f.answer).length === 0
    );
    if (invalid) {
      toast.error("Please fill all questions and answers.");
      return;
    }

    const formData = new FormData();
    formData.append("category", JSON.stringify({ name: categoryName }));
    formData.append("faqs", JSON.stringify(faqs));
    if (categoryImage) {
      formData.append("faqImage", categoryImage);
    }

    try {
      const res = await axios.put(`/api/v1/faqs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "FAQ updated!");
      navigate("/dashboard/faqs");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update FAQ";
      toast.error(errorMessage);
    }
  };

  // 🔎 compute filtered faqs (keep original index so editing works)
  const filteredFaqs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      return faqs.map((f, i) => ({ data: f, originalIndex: i }));
    }
    return faqs
      .map((f, i) => ({ data: f, originalIndex: i }))
      .filter(({ data }) => {
        const inQuestion = (data.question || "").toLowerCase().includes(q);
        const inAnswer = plainText(data.answer || "")
          .toLowerCase()
          .includes(q);
        return inQuestion || inAnswer;
      });
  }, [faqs, searchTerm]);

  return (
    <div className="min-h-screen w-full mx-auto overflow-y-auto bg-gray-100 py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Edit FAQ Category
        </h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Category Name */}
          <div className="mb-6">
            <label className="block mb-1 font-medium text-gray-700">
              Category Name:
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              disabled
              className="w-full px-4 py-2 border rounded-md text-black bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block mb-1 font-medium text-gray-700">
              Category Image:
            </label>
            {previewImage && (
              <img
                src={previewImage}
                alt="Current"
                className="mb-2 h-24 rounded shadow object-contain bg-gray-50 p-1"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCategoryImage(e.target.files[0])}
              className="block w-full text-black"
            />
          </div>

          {/* 🔎 Search */}
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              Search FAQs
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search in questions and answers…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                  title="Clear"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? `${filteredFaqs.length} result${
                    filteredFaqs.length !== 1 ? "s" : ""
                  } for “${searchTerm}”`
                : `${faqs.length} FAQ${faqs.length !== 1 ? "s" : ""} total`}
            </div>
          </div>

          {/* FAQs */}
          <h3 className="text-lg font-semibold text-gray-700 mb-2">FAQs</h3>

          {filteredFaqs.length === 0 ? (
            <div className="mb-6 rounded border border-dashed p-6 text-center text-gray-500">
              No FAQs match your search.
            </div>
          ) : null}

          {filteredFaqs.map(({ data: faq, originalIndex }) => (
            <div
              key={faq._id || originalIndex}
              className="relative mb-4 border border-gray-300 rounded-md p-4 bg-gray-50 space-y-3"
            >
              {/* Remove up top-right so it never gets hidden by the editor */}
              <button
                type="button"
                onClick={() => removeFaq(originalIndex)}
                className="absolute top-0 right-3 rounded-md border px-2.5 py-1 text-sm text-red-600 hover:bg-red-50"
                aria-label="Remove FAQ"
              >
                Remove
              </button>

              <input
                type="text"
                placeholder="Question"
                value={faq.question || ""}
                onChange={(e) =>
                  handleFaqChange(originalIndex, "question", e.target.value)
                }
                required
                className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Answer
                </label>
                <RichTextEditor
                  value={faq.answer || ""}
                  onChange={(html) =>
                    handleFaqChange(originalIndex, "answer", html)
                  }
                  placeholder="Write the answer…"
                  height={280}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Status: {faq.status === "1" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addFaq}
            className="mb-6 text-blue-600 hover:underline font-medium text-sm"
          >
            + Add FAQ
          </button>

          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFaq;
