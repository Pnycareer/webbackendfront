import React, { useEffect, useState, useMemo } from "react";
import useCourseModel from "../../hooks/useCourseModel";
import axios from "../../utils/axios";
import { Link } from "react-router-dom";

const AddFaqs = () => {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [loading, setLoading] = useState(false); // submit loading
  const [fetchingFaqs, setFetchingFaqs] = useState(false); // course faq loading
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { fetchCategories, fetchCoursesByCategory } = useCourseModel();

 

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load courses when category changes
  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedCategory) return;
      try {
        const courseList = await fetchCoursesByCategory(selectedCategory);
        setCourses(courseList || []);
        setSelectedCourseId(""); // reset course
        setFaqs([{ question: "", answer: "" }]); // reset faqs when category changes
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // --- NEW: fetch FAQs for the selected course and prefill the form ---
  // --- Replace your existing useEffect that loads FAQs for selected course ---
  useEffect(() => {
    const fetchCourseFaqs = async (courseId) => {
      setFetchingFaqs(true);
      setError("");
      setSuccess(false);

      try {
        // 1) Grab the array of courses with their faqs
        const res = await axios.get("/courses/faqs");
        const list = Array.isArray(res.data) ? res.data : [];

        // 2) Find the selected course in that list
        const courseNode = list.find((c) => c._id === courseId);

        // 3) Normalize its faqs -> [{question, answer, _id?}]
        const normalized = (courseNode?.faqs || []).map((f) => ({
          question: f.question || "",
          answer: f.answer || "",
          _id: f._id, // keep id if you ever want to diff/update
        }));

        if (normalized.length > 0) {
          setFaqs(normalized);
        } else {
          setFaqs([{ question: "", answer: "" }]);
        }
      } catch (err) {
        console.error("Error loading FAQs:", err);
        setError("❌ Failed to load existing FAQs for this course.");
        setFaqs([{ question: "", answer: "" }]);
      } finally {
        setFetchingFaqs(false);
      }
    };

    if (selectedCourseId) {
      fetchCourseFaqs(selectedCourseId);
    } else {
      setFaqs([{ question: "", answer: "" }]);
    }
  }, [selectedCourseId]);

  const handleChange = (index, field, value) => {
    setFaqs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addFaqField = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };

  const removeFaqField = (index) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourseId) {
      setError("❌ Please select a course.");
      return;
    }

    // tiny guard: drop completely empty rows
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
      const res = await axios.post(`/courses/add-faq/${selectedCourseId}`, {
        faqs: cleaned,
      });

      if (res.data?.success) {
        setSuccess(true);
        // keep the edited list visible after save (so user sees what was saved)
        setFaqs(cleaned.length ? cleaned : [{ question: "", answer: "" }]);
      } else {
        setError(res.data?.message || "Failed to add FAQs.");
      }
    } catch (err) {
      console.error("Error adding FAQ:", err);
      setError("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === selectedCourseId),
    [courses, selectedCourseId]
  );


  console.log(categories , 'cat')

  return (
    <div className="min-h-screen overflow-y-auto w-full bg-gray-100 flex justify-center items-start p-4 md:p-10">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add FAQs to Course
        </h2>

        {success && (
          <p className="text-green-600 text-sm mb-4 text-center">
            ✅ FAQs saved successfully!
          </p>
        )}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category & Course */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                required
              >
                <option value="">-- Choose Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id}>
                    {cat.category_Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Select Course
              </label>
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

          {/* Existing FAQs info */}
          {selectedCourseId && (
            <div className="rounded-md bg-gray-50 border p-3 text-sm text-gray-700">
              {fetchingFaqs ? (
                <span>Loading existing FAQs…</span>
              ) : faqs.length > 0 && (faqs[0].question || faqs[0].answer) ? (
                <span>
                  Showing existing FAQs for{" "}
                  <b>{selectedCourse?.course_Name || "this course"}</b>. You can
                  edit them or add more below.
                </span>
              ) : (
                <span>
                  No FAQs found for{" "}
                  <b>{selectedCourse?.course_Name || "this course"}</b>. Add new
                  ones below.
                </span>
              )}
            </div>
          )}

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) =>
                      handleChange(index, "question", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer
                  </label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) =>
                      handleChange(index, "answer", e.target.value)
                    }
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
              disabled={!selectedCourseId || fetchingFaqs}
            >
              + Add another FAQ
            </button>
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              disabled={loading || fetchingFaqs || !selectedCourseId}
            >
              {loading ? "Submitting..." : "Save FAQs"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link
            to="/dashboard/courses-faqs"
            className="inline-block px-6 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition"
          >
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddFaqs;
