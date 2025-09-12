import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../utils/axios";

const BlogFaqsTable = () => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get("/api/blogs/blogfaqs/get");
      setFaqData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading Blog FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    if (query) {
      const index = faqData.findIndex((blog) =>
        blog.blogName?.toLowerCase().includes(query.toLowerCase())
      );
      if (index !== -1) setOpenIndex(index);
    }
  }, [query, faqData]);

  const handleDelete = async (blogId, faqId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this FAQ?");
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`/api/blogs/faqs/${blogId}/${faqId}`);
      if (res.data?.success) {
        alert(res.data.message || "✅ FAQ deleted successfully");
        setFaqData((prev) =>
          prev.map((blog) =>
            blog._id === blogId
              ? { ...blog, faqs: blog.faqs.filter((f) => f._id !== faqId) }
              : blog
          )
        );
      } else {
        alert(res.data.message || "❌ Failed to delete FAQ");
      }
    } catch (err) {
      console.error("Error deleting FAQ:", err);
      const msg = err.response?.data?.message || "❌ Something went wrong while deleting.";
      alert(msg);
    }
  };

  const filteredBlogs = faqData.filter((b) =>
    b.blogName?.toLowerCase().includes(query.toLowerCase())
  );

  const toggleAccordion = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center items-start p-4 md:p-10">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-2xl p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Blog FAQs</h2>

        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
          <input
            type="text"
            placeholder="Search by blog title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-black"
          />
          <Link
            to="/dashboard/add-blog-faqs"
            className="bg-blue-500 px-6 py-2 rounded text-white hover:bg-blue-600"
          >
            + Add FAQs
          </Link>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBlogs.length === 0 ? (
              <p className="text-center text-gray-500">No matching results.</p>
            ) : (
              filteredBlogs.map((blog, i) => (
                <div key={blog._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => toggleAccordion(i)}
                    className="w-full px-6 py-4 flex justify-between items-center text-left text-lg font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    {blog.blogName} <span>{openIndex === i ? "▲" : "▼"}</span>
                  </button>

                  <AnimatePresence initial={false}>
                    {openIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        {blog.faqs?.length > 0 ? (
                          <ul className="space-y-4 mt-4">
                            {blog.faqs.map((faq) => (
                              <li key={faq._id} className="p-4 border rounded bg-gray-50 shadow-sm">
                                <p className="font-medium">{faq.question}</p>
                                <p className="text-gray-600 text-sm mt-1">{faq.answer}</p>
                                <div className="mt-2 flex gap-4 text-xs">
                                  <Link
                                    to={`/dashboard/edit-blog-faq/${blog._id}/${faq._id}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(blog._id, faq._id)}
                                    className="text-red-500 hover:underline"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 mt-4">No FAQs added.</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogFaqsTable;
