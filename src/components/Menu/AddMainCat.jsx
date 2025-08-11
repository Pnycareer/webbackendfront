import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";

const AddMainCat = () => {
  const [name, setName] = useState("");
  const [url_Slug, setUrl_Slug] = useState("");
  const [subImage, setSubImage] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const navigate = useNavigate();
  useState(() => {
    axios
      .get("${import.meta.env.VITE_API_URL}/api/courses")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setCourses(response.data);
        } else if (Array.isArray(response.data.courses)) {
          setCourses(response.data.courses);
        } else {
          console.error("Unexpected API response format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

  const handleFileChange = (e) => {
    setSubImage(e.target.files[0]);
  };
  const handleCourseSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedCourses(selectedOptions);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !url_Slug) {
      console.error("Name and URL Slug are required");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("url_Slug", url_Slug);
    if (subImage) {
      formData.append("subimage", subImage);
    }
    selectedCourses.forEach((course) => {
      formData.append("courses", course);
    });
    try {
      await axios.post("http://localhost:8080/api/subCategory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/subcat");
    } catch (error) {
      console.error("Error adding subcategory:", error.response?.data || error);
    }
  };

  return (
    <div className="overflow-auto w-full">
      <Header />
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mx-auto w-full my-6">
        <h2 className="text-2xl font-semibold text-gray-100 mb-5">
          Add SubCategory
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="URL Slug"
              className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg"
              value={url_Slug}
              onChange={(e) => setUrl_Slug(e.target.value)}
              required
            />
            <input
              type="file"
              className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg"
              onChange={handleFileChange}
            />

            <label className="text-gray-300 block">Select Courses</label>
            {courses.length === 0 ? (
              <p className="text-red-500">No courses available</p>
            ) : (
              <select
                multiple
                className="w-full p-3 bg-gray-700 text-white rounded-lg"
                onChange={handleCourseSelection}
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.course_Name}
                  </option>
                ))}
              </select>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Add SubCategory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMainCat;
