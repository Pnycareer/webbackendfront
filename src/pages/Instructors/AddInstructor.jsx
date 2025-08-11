import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";

const AddInstructor = () => {
  const [instructorName, setInstructorName] = useState("");
  const [instructorImage, setInstructorImage] = useState(null);
  const [profileDescription, setProfileDescription] = useState("");
  const [viewOnWeb, setViewOnWeb] = useState("No");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/categories`
        );
        // Format for react-select
        const options = response.data.map((category) => ({
          value: category.url_Slug,
          label: category.Category_Name,
        }));
        setCategories(options);
      } catch (error) {
        toast.error("Error fetching categories: " + error.message);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", instructorName);
    formData.append("photo", instructorImage);
    formData.append("other_info", profileDescription);
    formData.append("in_View", viewOnWeb);

    // Append each selected category as an individual entry
    selectedCategories.forEach((category) => {
      formData.append("categories[]", category.value);
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/instructors/add-instructor`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Instructor Added:", response.data);
      navigate("/instructors");
      toast.success("Instructor added successfully");
    } catch (error) {
      console.error("Error adding instructor:", error.message);
      toast.error("Error adding instructor: " + error.message);
    }
  };


  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md w-full mx-auto">
      <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">
        Add Instructor
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Instructor Name */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="instructorName">
            Instructor Name
          </label>
          <input
            type="text"
            id="instructorName"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            placeholder="Enter instructor name"
            required
          />
        </div>

        {/* Category Multi-Select */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="categories">
            Categories
          </label>
          <Select
            id="categories"
            options={categories}
            isMulti
            value={selectedCategories}
            onChange={(selected) => setSelectedCategories(selected)}
            className="w-full bg-gray-700 text-black rounded-md"
            placeholder="Select one or more categories"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="instructorImage">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            id="instructorImage"
            onChange={(e) => setInstructorImage(e.target.files[0])}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            required
          />
        </div>

        {/* Profile Description */}
        <div className="mb-4">
          <label
            className="block text-gray-400 mb-2"
            htmlFor="profileDescription"
          >
            Instructor Profile
          </label>
          <textarea
            id="profileDescription"
            value={profileDescription}
            onChange={(e) => setProfileDescription(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            placeholder="Write profile description"
            required
          />
        </div>

        {/* View on Web */}
        <div className="mb-4">
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="viewOnWeb">
              Is View on Web?
            </label>
            <select
              id="viewOnWeb"
              value={viewOnWeb ? "true" : "false"}
              onChange={(e) => setViewOnWeb(e.target.value === "true")}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            >
              <option>--Select--</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
        >
          Add Instructor
        </button>
      </form>
    </div>
  );
};

export default AddInstructor;
