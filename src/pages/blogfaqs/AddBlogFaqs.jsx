import React, { useEffect, useMemo, useState } from "react";
import axios from "../../utils/axios";

// If you already have a hook like useCourseModel, swap these with your real ones
const useBlogModel = () => {
  const fetchBlogCategories = async () => {
    // TODO: replace with your real endpoint
    // expected: [{ _id, blogCategory }]
    const res = await axios.get("/api/blogs/categories/get");
    return Array.isArray(res.data) ? res.data : [];
  };

  const fetchBlogsByCategory = async (categoryName) => {
    // TODO: replace with your real endpoint
    // expected: [{ _id, blogName, ... }]
    const res = await axios.get(`/api/blogs/by-category/${encodeURIComponent(categoryName)}`);
    return Array.isArray(res.data) ? res.data : [];
  };

  return { fetchBlogCategories, fetchBlogsByCategory };
};

const AddBlogFaqs = () => {
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBlogId, setSelectedBlogId] = useState("");

  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [loading, setLoading] = useState(false);
  const [fetchingFaqs, setFetchingFaqs] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { fetchBlogCategories, fetchBlogsByCategory } = useBlogModel();

  // load categories
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchBlogCategories();
        setCategories(data || []);
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load blogs on category change
  useEffect(() => {
    (async () => {
      if (!selectedCategory) return;
      try {
        const data = await fetchBlogsByCategory(selectedCategory);
        setBlogs(data || []);
        setSelectedBlogId("");
        setFaqs([{ question: "", answer: "" }]);
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // fetch existing FAQs for selected blog
  useEffect(() => {
    const run = async (blogId) => {
      setFetchingFaqs(true);
      setError("");
      setSuccess(false);
      try {
        // same shape as courses: we can hit the all endpoint and find our blog
        const res = await axios.get("/api/blogs/blogfaqs/get");
        const list = Array.isArray(res.data) ? res.data : [];
        const node = list.find((b) => b._id === blogId);
        const normalized = (node?.faqs || []).map((f) => ({
          question: f.question || "",
          answer: f.answer || "",
          _id: f._id,
        }));
        setFaqs(normalized.length ? normalized : [{ question: "", answer: "" }]);
      } catch (e) {
        console.error("Error loading blog FAQs:", e);
        setError("❌ Failed to load existing FAQs for this blog.");
        setFaqs([{ question: "", answer: "" }]);
      } finally {
        setFetchingFaqs(false);
      }
    };
    if (selectedBlogId) run(selectedBlogId);
    else setFaqs([{ question: "", answer: "" }]);
  }, [selectedBlogId]);

  const handleChange = (index, field, value) => {
    setFaqs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addFaqField = () => setFaqs((p) => [...p, { question: "", answer: "" }]);
  const removeFaqField = (index) => setFaqs((p) => p.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBlogId) {
      setError("❌ Please select a blog.");
      return;
    }

    const cleaned = faqs
      .map((f) => ({
        question: (f.question || "").trim(),
        answer: (f.answer || "").trim(),
      }))
      .filter((f) => f.question || f.answer);

    if (cleaned.length === 0) {
      setError("❌ Add at least one FAQ.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await axios.post(`/api/blogs/add-faq/${selectedBlogId}`, { faqs: cleaned });
      if (res.data?.success) {
        setSuccess(true);
        setFaqs(cleaned.length ? cleaned : [{ question: "", answer: "" }]);
      } else {
        setError(res.data?.message || "Failed to add FAQs.");
      }
    } catch (e) {
      console.error(e);
      setError("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const selectedBlog = useMemo(
    () => blogs.find((b) => b._id === selectedBlogId),
    [blogs, selectedBlogId]
  );

  return (
    <div className="min-h-screen overflow-y-auto w-full bg-gray-100 flex justify-center items-start p-4 md:p-10">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add FAQs to Blog</h2>

        {success && <p className="text-green-600 text-sm mb-4 text-center">✅ FAQs saved successfully!</p>}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Select Blog Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                required
              >
                <option value="">-- Choose Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.blogCategory}>
                    {cat.blogCategory}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Select Blog</label>
              <select
                value={selectedBlogId}
                onChange={(e) => setSelectedBlogId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                required
              >
                <option value="">-- Choose Blog --</option>
                {blogs.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.blogName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedBlogId && (
            <div className="rounded-md bg-gray-50 border p-3 text-sm text-gray-700">
              {fetchingFaqs ? (
                <span>Loading existing FAQs…</span>
              ) : faqs.length > 0 && (faqs[0].question || faqs[0].answer) ? (
                <span>
                  Showing existing FAQs for <b>{selectedBlog?.blogName || "this blog"}</b>. You can edit
                  them or add more below.
                </span>
              ) : (
                <span>
                  No FAQs found for <b>{selectedBlog?.blogName || "this blog"}</b>. Add new ones below.
                </span>
              )}
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">FAQs</h3>
            {faqs.map((faq, index) => (
              <div key={index} className="border border-blue-300 bg-blue-50 p-4 rounded-lg mb-4">
                <div className="text-end">
                  {faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFaqField(index)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleChange(index, "question", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleChange(index, "answer", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    required
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addFaqField}
              className="text-blue-600 hover:underline text-sm font-medium"
              disabled={!selectedBlogId || fetchingFaqs}
            >
              + Add another FAQ
            </button>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              disabled={loading || fetchingFaqs || !selectedBlogId}
            >
              {loading ? "Submitting..." : "Save FAQs"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogFaqs;
