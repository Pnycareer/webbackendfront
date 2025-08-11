import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "../../utils/axios";

const AddCategory = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await axios.post(`/api/v1/categories`, data);
      console.log(response, "res");
      toast.success("Category added successfully!");
      navigate("/dashboard/course-categories");
    } catch (error) {
      const message =
        error?.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
      console.error("Axios Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md w-full mx-auto">
      <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">
        Add Category
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Category Name */}
        <div>
          <label className="block text-gray-400 mb-2">Category Name</label>
          <input
            type="text"
            {...register("Category_Name", {
              required: "Category Name is required",
            })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            placeholder="Enter category name"
          />
          {errors.Category_Name && (
            <span className="text-red-500">{errors.Category_Name.message}</span>
          )}
        </div>

        {/* URL Slug */}
        <div>
          <label className="block text-gray-400 mb-2">URL Slug</label>
          <input
            type="text"
            {...register("url_Slug", { required: "URL Slug is required" })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            placeholder="Enter URL slug"
          />
          {errors.url_Slug && (
            <span className="text-red-500">{errors.url_Slug.message}</span>
          )}
        </div>

        {/* Icon */}
        <div>
          <label className="block text-gray-400 mb-2">Icon</label>
          <input
            type="text"
            {...register("Icon", { required: "Icon is required" })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            placeholder="Enter icon class"
          />
          {errors.Icon && (
            <span className="text-red-500">{errors.Icon.message}</span>
          )}
        </div>

        {/* Position */}
        <div>
          <label className="block text-gray-400 mb-2">Position</label>
          <input
            type="number"
            {...register("position", {
              required: "Position is required",
              pattern: {
                value: /^[0-9]{1,2}$/,
                message: "Only numbers up to two digits allowed",
              },
            })}
            onInput={(e) => {
              if (e.target.value.length > 2) {
                e.target.value = e.target.value.slice(0, 2);
              }
            }}
            onFocus={() => setShowTip(true)}
            onBlur={() => setShowTip(false)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            placeholder="Enter position"
          />
          {showTip && (
            <p className="text-sm text-yellow-400 mt-1">
              ⚠️ Only numeric values (max 2 digits) are allowed.
            </p>
          )}
          {errors.position && (
            <span className="text-red-500">{errors.position.message}</span>
          )}
        </div>

        {/* View on Web */}
        <div>
          <label className="block text-gray-400 mb-2">View on Web</label>
          <div className="flex space-x-4">
            <label className="text-gray-400">
              <input
                type="radio"
                value={true}
                {...register("viewonweb", {
                  required: "Please select an option",
                })}
                className="mr-2"
              />
              Yes
            </label>
            <label className="text-gray-400">
              <input
                type="radio"
                value={false}
                {...register("viewonweb", {
                  required: "Please select an option",
                })}
                className="mr-2"
              />
              No
            </label>
          </div>
          {errors.viewonweb && (
            <span className="text-red-500">{errors.viewonweb.message}</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full px-4 py-2 rounded-lg text-white ${
            isSubmitting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Add Category"}
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
