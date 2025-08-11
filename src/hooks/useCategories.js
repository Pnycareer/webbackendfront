import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "../utils/axios";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/categories`,);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await axios.delete(`/api/v1/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories(); // refresh after delete
    } catch (error) {
      console.error("Error deleting category:", error);
      const message =
        error?.response?.data?.message || "Delete failed. Please try again.";
      toast.error(message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    fetchCategories,
    deleteCategory,
  };
};

export default useCategories;
