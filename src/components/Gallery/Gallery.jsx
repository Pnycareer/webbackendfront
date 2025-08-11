import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const GalleryTable = () => {
  const [galleries, setGalleries] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

 const fetchGalleries = async () => {
  try {
    const res = await axios.get(`/api/v1/gallery`);
    setGalleries(res.data);
  } catch (err) {
    console.error("Error fetching galleries:", err);
    toast.error(
      err.response?.data?.message || "Failed to load gallery items."
    ); // Optional toast
  }
};

  useEffect(() => {
    fetchGalleries();
  }, []);

  const toggleCategory = (categoryId) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

const handleDeleteImage = async (galleryId, imagePath) => {
  if (!confirm("Are you sure you want to delete this image?")) return;

  try {
    const res = await axios.delete(
      `/api/v1/gallery/${galleryId}/image`,
      {
        data: { imagePath },
      }
    );

    toast.success(res.data.message || "Image deleted successfully.");
    fetchGalleries(); // Refresh the gallery list
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete image.";
    toast.error(errorMessage);
    console.error("Error deleting image:", error);
  }
};

 const handleDeleteGallery = async (galleryId) => {
  if (!confirm("Are you sure you want to delete this gallery?")) return;

  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/v1/gallery/deletegallaery/${galleryId}`
    );

    toast.success(res.data.message || "Gallery deleted successfully.");
    fetchGalleries(); // Refresh list
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete gallery.";
    toast.error(errorMessage);
    console.error("Error deleting gallery:", error);
  }
};

  return (
    <div className="w-full mx-auto mt-10 p-4 overflow-y-auto min-h-screen">
      <div className="mt-6 text-end">
        <Link
          to="/dashboard/addgallery"
          className="px-4 py-2 mb-5 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Gallery
        </Link>
      </div>
      <h2 className="text-3xl font-bold mb-6 text-center">Gallery List</h2>

      {galleries.length === 0 ? (
        <div className="text-center">No galleries found.</div>
      ) : (
        <div className="space-y-6">
          {galleries.map((gallery) => (
            <div
              key={gallery._id}
              className="bg-gray-800 text-white rounded-md shadow-md"
            >
              <div
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleCategory(gallery._id)}
              >
                <h3 className="text-xl font-semibold">
                  {gallery.category_Name}
                </h3>
                <div className="text-2xl">
                  {activeCategory === gallery._id ? "▲" : "▼"}
                </div>
              </div>

              <AnimatePresence>
                {activeCategory === gallery._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4">
                      <table className="w-full text-left">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="py-2 px-4">COURSE</th>
                            <th className="py-2 px-4">IMAGE</th>
                            <th className="py-2 px-4">MONTHLY FEE</th>
                            <th className="py-2 px-4">ADMISSION FEE</th>
                            <th className="py-2 px-4">STATUS</th>
                            <th className="py-2 px-4">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gallery.pictures.map((pic, idx) => (
                            <tr key={idx} className="border-b border-gray-600">
                              <td className="py-2 px-4 capitalize">
                                {gallery.category_Name} Course {idx + 1}
                              </td>
                              <td className="py-2 px-4">
                                <img
                                  src={`${import.meta.env.VITE_API_URL}/${pic}`}
                                  alt="Gallery pic"
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                              </td>
                              <td className="py-2 px-4">44</td>{" "}
                              {/* Monthly Fee - Static Example */}
                              <td className="py-2 px-4">500</td>{" "}
                              {/* Admission Fee - Static Example */}
                              <td className="py-2 px-4">
                                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                                  Active
                                </span>
                              </td>
                              <td className="py-2 px-4">
                                <button className="text-blue-400 hover:underline mr-4">
                                  Edit
                                </button>
                                <button
                                  className="text-red-400 hover:underline"
                                  onClick={() =>
                                    handleDeleteImage(gallery._id, pic)
                                  }
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="text-right mt-4">
                        <button
                          onClick={() => handleDeleteGallery(gallery._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        >
                          Delete Entire Gallery
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryTable;
