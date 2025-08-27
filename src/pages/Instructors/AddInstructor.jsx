import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../utils/axios"; // your configured axios instance

const AddInstructor = () => {
  const [instructorName, setInstructorName] = useState("");
  const [instructorImage, setInstructorImage] = useState(null);
  const [profileDescription, setProfileDescription] = useState("");
  const [viewOnWeb, setViewOnWeb] = useState(true); // ✅ boolean, default YES
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/categories");
        const options = (res?.data || []).map((category) => ({
          value: category.url_Slug,
          label: category.Category_Name,
        }));
        setCategories(options);
      } catch (err) {
        toast.error("Error fetching categories: " + (err?.message || "Unknown error"));
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!instructorName.trim()) return toast.error("Instructor name is required");
    if (!instructorImage) return toast.error("Please upload an instructor image");
    if (!profileDescription.trim()) return toast.error("Profile description is required");

    const formData = new FormData();
    formData.append("name", instructorName);
    formData.append("photo", instructorImage);
    formData.append("other_info", profileDescription);
    formData.append("in_View", viewOnWeb ? "true" : "false"); // ✅ always a string "true"/"false"

    // Append each selected category
    selectedCategories.forEach((cat) => {
      formData.append("categories[]", cat.value);
    });

    try {
      const res = await axiosInstance.post("/api/instructors/add-instructor", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data) {
        toast.success("Instructor added successfully");
        navigate("/dashboard/instructors");
      } else {
        throw new Error("Unexpected response");
      }
    } catch (err) {
      console.error("Error adding instructor:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to add instructor";
      toast.error(msg);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md w-full mx-auto">
      <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">Add Instructor</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Instructor Name */}
        <div>
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
        <div>
          <label className="block text-gray-400 mb-2" htmlFor="categories">
            Categories
          </label>
          <Select
            id="categories"
            options={categories}
            isMulti
            value={selectedCategories}
            onChange={setSelectedCategories}
            className="w-full text-black"
            classNamePrefix="react-select"
            placeholder="Select one or more categories"
            noOptionsMessage={() => "No categories found"}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-400 mb-2" htmlFor="instructorImage">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            id="instructorImage"
            onChange={(e) => setInstructorImage(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            required
          />
        </div>

        {/* Profile Description */}
        <div>
          <label className="block text-gray-400 mb-2" htmlFor="profileDescription">
            Instructor Profile
          </label>
          <textarea
            id="profileDescription"
            value={profileDescription}
            onChange={(e) => setProfileDescription(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            placeholder="Write profile description"
            rows={5}
            required
          />
        </div>

        {/* View on Web */}
        <div>
          <label className="block text-gray-400 mb-2" htmlFor="viewOnWeb">
            Is View on Web?
          </label>
          <select
            id="viewOnWeb"
            value={String(viewOnWeb)}                 // ✅ "true" | "false"
            onChange={(e) => setViewOnWeb(e.target.value === "true")} // ✅ boolean
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
          >
            {/* no empty placeholder on a controlled input */}
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Submit */}
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
