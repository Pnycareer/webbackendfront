import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import { toast } from "react-hot-toast";
import Select from "react-select";
import axios from "../../utils/axios";

const EditInstructor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const response = await axios.get(
          `/api/instructors/${id}`
        );
        const data = response.data.data;
        setInstructor(data);
        setImagePreview(`${import.meta.env.VITE_API_URL}/${data.photo}`);

        // Set the existing categories as selected
        setSelectedCategories(
          data.categories.map((category) => ({
            value: category,
            label: category,
          }))
        );
      } catch (error) {
        console.error(
          "Error fetching instructor:",
          error.response ? error.response.data : error.message
        );
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `/api/v1/categories`
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

    fetchInstructor();
    fetchCategories();
  }, [id]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", instructor.name);
  formData.append("photo", selectedImage || instructor.photo);
  formData.append("other_info", instructor.other_info);
  formData.append("in_View", instructor.in_View);

  selectedCategories.forEach((category) => {
    formData.append("categories[]", category.value);
  });

  try {
    const response = await axios.put(
      `/api/instructors/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Show success toast with backend message
    toast.success(response.data.message || "Instructor updated successfully!");
    navigate("/dashboard/instructors");
  } catch (error) {
    console.error(
      "Error updating instructor:",
      error.response ? error.response.data : error.message
    );

    // Show error toast with backend message
    toast.error(
        (error.response?.data?.message || error.message)
    );
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInstructor((prevInstructor) => ({
      ...prevInstructor,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);

      // Show preview of the selected image
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  console.log(instructor, "inst");

  if (!instructor) {
    return <p className="text-black">Loading...</p>;
  }

  return (
    <div className="overflow-auto mx-auto w-full">
      <div className="bg-opacity-80 my-6 backdrop-blur-md shadow-lg rounded-xl p-6 border mx-auto border-gray-300 w-full">
        <h2 className="text-2xl font-semibold text-white mb-5">
          Edit Instructor
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Instructor Name */}
          <div className="mb-4">
            <label className="block text-white">Instructor Name</label>
            <input
              type="text"
              name="name"
              value={instructor.name || ""}
              onChange={handleInputChange}
              required
              className="w-full p-2 rounded bg-gray-100 text-black border"
            />
          </div>

          {/* Category Multi-Select */}
          <div className="mb-4">
            <label className="block text-white">Categories</label>
            <Select
              options={categories}
              isMulti
              value={selectedCategories}
              onChange={(selected) => setSelectedCategories(selected)}
              className="w-full bg-gray-100 text-black"
              placeholder="Select one or more categories"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-white">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 rounded bg-gray-100 text-black border"
            />
            {imagePreview && (
              <div className="mt-4 w-32">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="w-full h-auto rounded-md border border-gray-400"
                />
              </div>
            )}
          </div>

          {/* Instructor Profile */}
          <div className="mb-4">
            <label className="block text-white">Instructor Profile</label>
            <textarea
              name="other_info"
              value={instructor.other_info || ""}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-100 text-black border"
              placeholder="Write profile description"
              required
            />
          </div>

          {/* View on Web */}
          <div className="mb-4">
            <div className="mb-4">
              <label className="block text-white">Is View on Web?</label>
              <select
                name="in_View"
                value={instructor.in_View ? "Yes" : "No"}
                onChange={(e) =>
                  setInstructor((prevInstructor) => ({
                    ...prevInstructor,
                    in_View: e.target.value === "Yes",
                  }))
                }
                className="w-full p-2 rounded bg-gray-100 text-black border"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg"
          >
            Update Instructor
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditInstructor;
