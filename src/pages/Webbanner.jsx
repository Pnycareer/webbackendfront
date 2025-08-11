import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const Webbanner = () => {
  const [banner, setBanner] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch active banner
  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/webbanner/get`);
      setBanner(response.data[0]);
    } catch (err) {
      console.error("Error fetching banner:", err);
      setError("Failed to load banner.");
    }
    setLoading(false);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Upload New Banner
 const uploadBanner = async () => {
  if (!selectedFile) {
    toast.error("Please select an image!");
    return;
  }

  const formData = new FormData();
  formData.append("webbanner", selectedFile);

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/webbanner/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    setBanner(response.data.banner);
    const message = response.data?.message || "Banner uploaded successfully!";
    toast.success(message);
  } catch (error) {
    console.error("Upload Error:", error);
    const message =
      error.response?.data?.message || "Failed to upload banner!";
    toast.error(message);
  }
};

  // Update Existing Banner
const updateBanner = async () => {
  if (!banner || !banner._id || !selectedFile) {
    toast.error("Please upload a new image to update!");
    return;
  }

  const formData = new FormData();
  formData.append("webbanner", selectedFile);

  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/v1/webbanner/update/${banner._id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    setBanner(response.data.banner);
    const message = response.data?.message || "Banner updated successfully!";
    toast.success(message);
  } catch (error) {
    console.error("Update Error:", error);
    const message =
      error.response?.data?.message || "Failed to update banner!";
    toast.error(message);
  }
};
  // Delete Banner


const deleteBanner = async () => {
  if (!banner || !banner._id) {
    toast.error("No banner to delete!");
    return;
  }

  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/v1/webbanner/${banner._id}`
    );

    setBanner(null);
    const message = res.data?.message || "Banner deleted successfully!";
    toast.success(message);
  } catch (error) {
    console.error("Delete Error:", error);
    const message =
      error.response?.data?.message || "Failed to delete banner!";
    toast.error(message);
  }
};


  return (
    <div className="max-w-4xl mx-auto my-10 p-6 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Manage Web Banner</h2>

      {loading && <p className="text-center text-gray-500 animate-pulse">Loading banner...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {banner ? (
        <div className="flex flex-col items-center">
          <img
            src={`${import.meta.env.VITE_API_URL}${banner.imageUrl}`}
            alt="Web Banner"
            className="w-full max-w-3xl rounded-lg shadow-md mb-4"
          />
          <div className="flex gap-4">
            <button
              onClick={deleteBanner}
              className="px-6 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
            >
              Delete Banner
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">No active banner available.</p>
      )}

      <div className="mt-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-gray-700 px-4 py-2 border rounded-lg shadow-sm"
        />
      </div>

      <div className="flex justify-center mt-4 gap-4">
        {banner ? (
          <button
            onClick={updateBanner}
            className="px-6 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition"
          >
            Update Banner
          </button>
        ) : (
          <button
            onClick={uploadBanner}
            className="px-6 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition"
          >
            Upload Banner
          </button>
        )}
      </div>
    </div>
  );
};

export default Webbanner;
