// src/hooks/useCourses.js
import axios from "../utils/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import slugify from "../utils/slugify";

const useCourses = () => {
  const navigate = useNavigate();

  const addCourse = async ({
    data,
    courseDescription,
    courseImage,
    brochure,
    setIsSubmitting,
  }) => {
    setIsSubmitting(true);

    try {
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === "string") {
          data[key] = data[key].trim();
        }
      });

      if (data.url_Slug) {
        data.url_Slug = slugify(data.url_Slug);
      }

      const formData = new FormData();
      formData.append("course_Name", data.course_Name);
      formData.append("url_Slug", data.url_Slug);
      formData.append("video_Id", data.video_Id);
      formData.append("course_Category", data.course_Category);
      formData.append("category_Description", data.category_Description || "");
      formData.append("Skill_Level", data.Skill_Level);
      formData.append("Short_Description", data.Short_Description);
      formData.append("Course_Description", courseDescription);
      formData.append("Instructor", data.instructor);
      formData.append("Monthly_Fee", data.Monthly_Fee);
      formData.append("Admission_Fee", data.Admission_Fee);
      formData.append("Duration_Months", data.Duration_Months);
      formData.append("Duration_Day", data.Duration_Day);
      formData.append("Meta_Title", data.Meta_Title);
      formData.append("Meta_Description", data.Meta_Description);
      formData.append("Status", data.Status);
      formData.append("View_On_Web", data.View_On_Web);
      formData.append("showtoc", data.showtoc);
      formData.append("In_Sitemap", data.In_Sitemap);
      formData.append("priority", data.priority);
      formData.append("bootcamp", data.bootcamp === "true");
      formData.append("Page_Index", data.Page_Index);
      formData.append("Custom_Canonical_Url", data.Custom_Canonical_Url);

      if (courseImage) formData.append("course_Image", courseImage);
      if (brochure) formData.append("Brochure", brochure);

      await axios.post("/courses/add-course", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Course added successfully!");
      navigate("/dashboard/courses");
    } catch (error) {
      console.error("Add course error:", error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses/get-course");
      return res.data.data;
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses.");
      return [];
    }
  };

  const deleteCourse = async (id, onSuccess) => {
    try {
      const response = await axios.delete(`/courses/delete/${id}`);
      toast.success(response.data.message || "Course deleted successfully!");
      if (onSuccess) onSuccess();
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Failed to delete course.";
      toast.error(errMsg);
      console.error("Delete course error:", error);
    }
  };

  const updateStatus = async (id, currentStatus, onSuccess) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await axios.put(
        `/api/courses/${id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(`Status updated to ${newStatus}`);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update status.");
    }
  };

  // Add inside useCourses.js
  const updateCourse = async ({
    id,
    data,
    targetCategoryId,
    brochureFile,
    setIsSubmitting,
  }) => {
    setIsSubmitting?.(true);

    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "url_Slug" && value) {
          value = slugify(value);
        }

        if (key === "course_Category") {
          formData.append(key, value?._id || value);
        } else if (key === "course_Image" && value instanceof File) {
          formData.append(key, value);
        } else if (key === "Brochure") {
          // skip
        } else if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !(typeof value === "object" && Object.keys(value).length === 0)
        ) {
          formData.append(key, value);
        }
      });

      // 🚚 the only thing needed to move categories server-side
      if (targetCategoryId) {
        formData.append("targetCategoryId", targetCategoryId);
      }

      if (brochureFile) {
        formData.append("Brochure", brochureFile);
      }

      await axios.put(`/courses/update/${id}`, formData);

      toast.success("Course updated successfully!");
      navigate("/dashboard/courses");
    } catch (err) {
      console.error("Error updating course:", err);
      const errorMsg =
        err?.response?.data?.message || "Failed to update course";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting?.(false);
    }
  };

  return {
    addCourse,
    fetchCourses,
    deleteCourse,
    updateStatus,
    updateCourse, // 👈 new function
  };
};

export default useCourses;
