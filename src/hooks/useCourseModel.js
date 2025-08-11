// hooks/useCourseModel.js
import axios from "../utils/axios";
import { toast } from "react-hot-toast";

const useCourseModel = () => {
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/v1/categories");
      return res.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      const message =
        error.response?.data?.message || "❌ Failed to fetch categories";
      toast.error(message);
      throw error;
    }
  };

  const fetchCoursesByCategory = async (slug) => {
    try {
      const res = await axios.get(`/courses/getoncategory/${slug}`);
      return res.data.courses || [];
    } catch (error) {
      console.error("Error fetching courses:", error);
      const message =
        error.response?.data?.message || "❌ Failed to fetch courses";
      toast.error(message);
      return [];
    }
  };

  const submitCourseModel = async ({ courseId, lectures }) => {
    try {
      const res = await axios.post("/api/coursemodel", {
        courseId,
        lectures,
      });
      toast.success(res.data?.message || "✅ Module submitted successfully");
      return res.data;
    } catch (error) {
      console.error("Error submitting model:", error);
      const message =
        error.response?.data?.message || "❌ Failed to submit module";
      toast.error(message);
      throw error;
    }
  };

  const fetchAllModules = async () => {
    try {
      const res = await axios.get("/api/coursemodel");
      return res.data;
    } catch (error) {
      console.error("Error fetching modules:", error);
      const message =
        error.response?.data?.message || "❌ Failed to fetch modules";
      toast.error(message);
      return [];
    }
  };

  const deleteModuleById = async (id) => {
    try {
      const res = await axios.delete(`/api/coursemodel/${id}`);
      toast.success(res.data?.message || "✅ Module deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting module:", error);
      const message =
        error.response?.data?.message || "❌ Failed to delete module";
      toast.error(message);
      return false;
    }
  };

  const getModuleById = async (id) => {
    try {
      const res = await axios.get(`/api/coursemodel/${id}`);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "❌ Failed to fetch module";
      toast.error(message);
      throw error;
    }
  };

  const updateCourseModel = async (id, data) => {
    try {
      const res = await axios.put(`/api/coursemodel/${id}`, data);
      toast.success(res.data?.message || "✅ Module updated successfully");
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "❌ Failed to update module";
      toast.error(message);
      throw error;
    }
  };

  const deleteLectureFromModel = async (modelId, lectureId) => {
    try {
      const res = await axios.delete(
        `/api/coursemodel/coursemodel/${modelId}/${lectureId}`
      );
      toast.success(res.data?.message || "✅ Lecture deleted successfully");
      return res.data.courseFeature.lectures;
    } catch (error) {
      const message =
        error.response?.data?.message || "❌ Failed to delete lecture";
      toast.error(message);
      throw error;
    }
  };

  return {
    fetchCategories,
    fetchCoursesByCategory,
    submitCourseModel,
    fetchAllModules,
    deleteModuleById,
    getModuleById, // ✅ new
    updateCourseModel, // ✅ new
    deleteLectureFromModel,
  };
};

export default useCourseModel;
