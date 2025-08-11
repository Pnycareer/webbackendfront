import { useState } from "react";
import axios from "axios";

const GalleryForm = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const handleImageChange = (e) => {
    const files = [...e.target.files];
    setGalleryImages(files);

    // Preview
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category_Name", categoryName);
    formData.append("category_Description", categoryDescription);

    galleryImages.forEach((image) => {
      formData.append("galleryImages", image);
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/gallery`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Gallery Created:", response.data);
      alert("Gallery created successfully!");

      // Reset form
      setCategoryName("");
      setCategoryDescription("");
      setGalleryImages([]);
      setPreviewImages([]);
    } catch (error) {
      console.error("Error creating gallery:", error);
      alert("Error creating gallery");
    }
  };

  return (
    <div className="w-full mx-auto p-8  shadow-md rounded-md mt-10 overflow-y-auto min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Create New Gallery
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white mb-2">Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Category Description</label>
          <textarea
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            required
            rows="4"
            className="w-full border text-black border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
        </div>

        <div>
          <label className="block text-white mb-2">Upload Gallery Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-white
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Preview Selected Images */}
        {previewImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {previewImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt="Preview"
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-all duration-300"
          >
            Create Gallery
          </button>
        </div>
      </form>
    </div>
  );
};

export default GalleryForm;
