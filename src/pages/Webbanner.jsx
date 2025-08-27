import { useEffect, useState } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FileField from "@/components/form/FileField"; 

export default function Webbanner() {
  const [banner, setBanner] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/webbanner/get`);
      setBanner(res.data?.[0] ?? null);
    } catch (err) {
      console.error(err);
      setError("Failed to load banner.");
    }
    setLoading(false);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const uploadBanner = async () => {
    if (!selectedFile) return toast.error("Please select an image!");

    const formData = new FormData();
    formData.append("webbanner", selectedFile);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/webbanner/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(res.data?.message || "Banner uploaded!");
      setBanner(res.data.banner);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed.");
    }
  };

  const updateBanner = async () => {
    if (!selectedFile || !banner?._id) return toast.error("Select new image first!");

    const formData = new FormData();
    formData.append("webbanner", selectedFile);

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/webbanner/update/${banner._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(res.data?.message || "Banner updated!");
      setBanner(res.data.banner);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed.");
    }
  };

  const deleteBanner = async () => {
    if (!banner?._id) return toast.error("No banner to delete.");

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/webbanner/${banner._id}`
      );

      toast.success(res.data?.message || "Banner deleted!");
      setBanner(null);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto my-10 p-6 bg-white/10">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Manage Web Banner</h2>

      {loading ? (
        <Skeleton className="w-full h-[200px] rounded-lg mb-4" />
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          {banner && !selectedFile && (
            <img
              src={`${import.meta.env.VITE_API_URL}${banner.imageUrl}`}
              alt="Web Banner"
              className="w-full rounded-lg shadow-md max-h-[300px] object-cover mb-4"
            />
          )}

          <FileField
            // label="Upload New Banner"
            accept="image/*"
            onChange={handleFileSelect}
          />

          <div className="flex justify-end mt-6 gap-4">
            {banner && (
              <Button
                variant="destructive"
                onClick={deleteBanner}
                className="min-w-[120px]"
              >
                Delete
              </Button>
            )}
            {banner ? (
              <Button onClick={updateBanner}>Update</Button>
            ) : (
              <Button onClick={uploadBanner}>Upload</Button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
