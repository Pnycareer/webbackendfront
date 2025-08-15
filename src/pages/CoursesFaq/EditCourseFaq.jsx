import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axios";


const EditCourseFaq = () => {
  const { courseId, faqId } = useParams();
  const navigate = useNavigate();

  const [faq, setFaq] = useState({ question: "", answer: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const res = await axios.get(`/courses/faqs/${courseId}`);

        // ✅ FIXED: response is an array, not an object
        const matchedFaq = Array.isArray(res.data)
          ? res.data.find((f) => f._id === faqId)
          : null;

        if (!matchedFaq) throw new Error("FAQ not found");

        setFaq({ question: matchedFaq.question, answer: matchedFaq.answer });
      } catch (err) {
        console.error(err);
        setError("Failed to load FAQ");
      } finally {
        setLoading(false);
      }
    };

    fetchFaq();
  }, [courseId, faqId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFaq((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.put(
      `/courses/faqs/${courseId}/${faqId}`,
      faq
    );

    // Show backend response message if available
    if (res.data?.success) {
      setSuccess(res.data.message || "FAQ updated successfully ✅");
      setError(null);
      setTimeout(() => navigate("/dashboard/courses-faqs"), 800);
    } else {
      setError(res.data.message || "Failed to update FAQ ❌");
    }
  } catch (err) {
    console.error("Update FAQ error:", err);
    // Try to read error message from backend
    const msg =
      err.response?.data?.message || "❌ Failed to update FAQ. Please try again.";
    setError(msg);
    setSuccess(null);
  }
};


  if (loading) {
    return <div className="p-10 text-center text-gray-700">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center items-start p-6 md:p-12">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit FAQ</h2>

        {error && (
          <div className="text-red-500 mb-4 text-sm text-center">{error}</div>
        )}
        {success && (
          <div className="text-green-500 mb-4 text-sm text-center">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Question
            </label>
            <input
              type="text"
              name="question"
              value={faq.question}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Answer
            </label>
            <textarea
              name="answer"
              value={faq.answer}
              onChange={handleChange}
              required
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Update FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseFaq;
