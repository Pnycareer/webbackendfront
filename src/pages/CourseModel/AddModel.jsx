import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import useCourseModel from "../../hooks/useCourseModel";

const AddModel = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lectures, setLectures] = useState([
    { lectureNumber: 1, title: "", content: "", topics: "" },
  ]);
  const [message, setMessage] = useState("");
  const { fetchCategories, fetchCoursesByCategory,  submitCourseModel } =
    useCourseModel();

  const navigate = useNavigate();

  // Fetch categories on page load
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  // Fetch courses when category is selected
  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedCategory) return;
      const courseList = await fetchCoursesByCategory(selectedCategory);
      setCourses(courseList);
      setSelectedCourseId("");
    };
    loadCourses();
  }, [selectedCategory]);

  const handleLectureChange = (index, field, value) => {
    const updatedLectures = [...lectures];
    updatedLectures[index][field] = value;
    setLectures(updatedLectures);
  };

  const addLectureField = () => {
    setLectures([
      ...lectures,
      {
        lectureNumber: lectures.length + 1,
        title: "",
        content: "",
        topics: "",
      },
    ]);
  };

  const removeLectureField = (index) => {
    const updatedLectures = [...lectures];
    updatedLectures.splice(index, 1);
    setLectures(updatedLectures);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setMessage("❌ Please select a course");
      return;
    }

    try {
      const response = await submitCourseModel({
        courseId: selectedCourseId,
        lectures,
      });
      setMessage(response.message || "✅ Module added successfully!");
      setSelectedCourseId("");
      setLectures([{ lectureNumber: 1, title: "", content: "", topics: "" }]);
      navigate("/coursemodel");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "❌ Something went wrong. Please try again.";
      setMessage(`❌ ${errorMsg}`);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto w-full bg-gray-100 flex justify-center items-start p-4 md:p-10">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add Course Module
        </h2>

        {message && (
          <div className="mb-4 text-center text-sm font-medium text-green-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector */}
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
                  <option key={cat.slug} value={cat.url_Slug}>
                    {cat.Category_Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Selector */}
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

          {/* Lectures */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Lectures
            </h3>
            {lectures.map((lecture, index) => (
              <div
                key={index}
                className="border border-gray-200 p-4 rounded-lg mb-4 bg-gray-50"
              >
                <div className="text-end">
                  {lectures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLectureField(index)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="font-medium mb-2 text-gray-600">
                  Lecture #{index + 1}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={lecture.title}
                    onChange={(e) =>
                      handleLectureChange(index, "title", e.target.value)
                    }
                    required
                    className="px-4 py-2 border border-gray-300 rounded-md text-black"
                  />
                  <input
                    type="text"
                    placeholder="Content"
                    value={lecture.content}
                    onChange={(e) =>
                      handleLectureChange(index, "content", e.target.value)
                    }
                    required
                    className="px-4 py-2 border border-gray-300 rounded-md text-black"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-1">
                      Topics
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={lecture.topics}
                      onChange={(value) =>
                        handleLectureChange(index, "topics", value)
                      }
                      className="text-black bg-white rounded-md"
                      placeholder="Write topics or key points here..."
                      style={{ height: "200px", marginBottom: "2rem" }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addLectureField}
              className="mt-2 text-blue-600 hover:underline text-sm font-medium"
            >
              + Add another lecture
            </button>
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Submit Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModel;
