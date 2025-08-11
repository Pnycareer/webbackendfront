import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../common/Header";
import { toast } from "react-toastify";

const EditMaincat = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for category details
  const [name, setName] = useState("");
  const [urlSlug, setUrlSlug] = useState("");
  const [subImage, setSubImage] = useState(null);
  const [courses, setCourses] = useState([]); // All courses from API
  const [selectedCourses, setSelectedCourses] = useState([]); // Selected courses
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering courses
  const [filteredCourses, setFilteredCourses] = useState([]); // Filtered courses based on search term

  // Fetch category data
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/subCategory/${id}`)
      .then((response) => {
        const category = response.data;
        setName(category.name);
        setUrlSlug(category.url_slug);
        setSubImage(category.subimage);
        setSelectedCourses(category.courses.map((course) => course._id)); // Store selected courses
      })
      .catch((error) => console.error("Error fetching category:", error));
  }, [id]);

  // Fetch all courses
  useEffect(() => {
    axios
      .get("${import.meta.env.VITE_API_URL}/api/courses")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setCourses(response.data);
          setFilteredCourses(response.data); // Initialize filtered courses
        } else if (Array.isArray(response.data.courses)) {
          setCourses(response.data.courses);
          setFilteredCourses(response.data.courses); // Initialize filtered courses
        } else {
          console.error("Unexpected API response format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    setSubImage(e.target.files[0]); // Store selected image
  };

  // Handle course selection
  const handleCourseSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedCourses(selectedOptions);
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = courses.filter(
      (course) =>
        (course.course_Name &&
          course.course_Name.toLowerCase().includes(term)) ||
        (course.url_Slug && course.url_Slug.toLowerCase().includes(term))
    );
    setFilteredCourses(filtered);
  };

  // Handle form submission
  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("url_slug", urlSlug);
    if (subImage) {
      formData.append("subimage", subImage);
    }
    selectedCourses.forEach((courseId) => {
      formData.append("courses[]", courseId);
    });

    try {
      await axios.put(`http://localhost:8080/api/subCategory/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Category updated successfully!");
      navigate("/subcat");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate("/subcat");
  };

  return (
    <div className="overflow-auto w-full">
      <Header />
      <div className="p-6 bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg my-6 rounded-xl mx-auto w-full">
        <h2 className="text-2xl font-semibold text-gray-100 mb-5">
          Edit Category
        </h2>

        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Category Name</label>
          <input
            type="text"
            className="w-full p-2 bg-gray-700 text-white rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* URL Slug Field */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">URL Slug</label>
          <input
            type="text"
            className="w-full p-2 bg-gray-700 text-white rounded-lg"
            value={urlSlug}
            onChange={(e) => setUrlSlug(e.target.value)}
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Sub Image</label>
          <input
            type="file"
            className="w-full p-2 bg-gray-700 text-white rounded-lg"
            onChange={handleFileChange}
          />
          {subImage && (
            <img
              src={
                typeof subImage === "string"
                  ? subImage
                  : URL.createObjectURL(subImage)
              }
              alt="Sub Image"
              className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-500"
            />
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Search Courses</label>
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full p-2 bg-gray-700 text-white rounded-lg"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Course Selection */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Select Courses</label>
          {filteredCourses.length === 0 ? (
            <p className="text-red-500">No courses available</p>
          ) : (
            <select
              multiple // Allow multiple selections
              className="w-full p-2 bg-gray-700 text-white rounded-lg"
              onChange={handleCourseSelection}
              value={selectedCourses}
            >
              {filteredCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.course_Name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMaincat;
