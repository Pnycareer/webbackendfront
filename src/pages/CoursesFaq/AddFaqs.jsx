import React, { useEffect, useState } from "react";
import useCourseModel from "../../hooks/useCourseModel";
import axios from "../../utils/axios";

const AddFaqs = () => {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    fetchCategories,
    fetchCoursesByCategory
  } = useCourseModel();

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Load courses when category changes
  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedCategory) return;
      try {
        const courseList = await fetchCoursesByCategory(selectedCategory);
        setCourses(courseList);
        setSelectedCourseId(""); // reset course
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    loadCourses();
  }, [selectedCategory]);

  const handleChange = (index, field, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  const addFaqField = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFaqField = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedCourseId) {
    setError("❌ Please select a course.");
    return;
  }

  setLoading(true);
  setError("");
  setSuccess(false);

  try {
    const res = await axios.post(`/courses/add-faq/${selectedCourseId}`, {
      faqs,
    });

    if (res.data.success) {
      setSuccess(true);
      setFaqs([{ question: "", answer: "" }]); // Reset form
    } else {
      setError(res.data.message || "Failed to add FAQs.");
    }
  } catch (err) {
    console.error("Error adding FAQ:", err);
    setError("❌ Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen overflow-y-auto w-full bg-gray-100 flex justify-center items-start p-4 md:p-10">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add FAQs to Course
        </h2>

        {success && <p className="text-green-600 text-sm mb-4 text-center">✅ FAQs added successfully!</p>}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Category Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Select Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                required
              >
                <option value="">-- Choose Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.url_Slug}>
                    {cat.Category_Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Selector */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                required
              >
                <option value="">-- Choose Course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.course_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FAQ Fields */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">FAQs</h3>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-blue-300 bg-blue-50 p-4 rounded-lg mb-4"
              >
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
            >
              + Add another FAQ
            </button>
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit FAQs"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFaqs;
