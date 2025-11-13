// src/hooks/useCourses.js
import axios from "../utils/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import slugify from "../utils/slugify";
import { useSnackbar } from "notistack";

const useCourses = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const addCourse = async ({
    data,
    courseDescription,
    courseImage,
    brochure,
    setIsSubmitting,
  }) => {
    setIsSubmitting(true);

    try {
      // trim strings
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === "string") {
          data[key] = data[key].trim();
        }
      });

      // slugify
      if (data.url_Slug) {
        data.url_Slug = slugify(data.url_Slug);
      }

      // ensure image alt exists (fallback from course name), clean + cap length
      if (!data.course_Image_Alt || !data.course_Image_Alt.trim()) {
        data.course_Image_Alt = `${data.course_Name || "Course"} image`;
      }
      data.course_Image_Alt = data.course_Image_Alt.trim().slice(0, 150);

      // normalize booleans
      const toBool = (v) => v === true || v === "true" || v === "yes";

      const formData = new FormData();

      // Required / always-present fields
      formData.append("course_Name", data.course_Name);
      formData.append("url_Slug", data.url_Slug);
      formData.append("course_Category", data.course_Category);
      formData.append("category_Description", data.category_Description || "");
      formData.append("Short_Description", data.Short_Description);
      formData.append("Course_Description", courseDescription);
      formData.append("Instructor", data.instructor);
      formData.append("Meta_Title", data.Meta_Title);
      formData.append("Meta_Description", data.Meta_Description);

      // backend expects `status`, not `Status`
      formData.append("status", data.status || data.Status || "Active");

      // booleans as strings
      formData.append("View_On_Web", String(toBool(data.View_On_Web)));
      formData.append("showtoc", String(toBool(data.showtoc)));
      formData.append("In_Sitemap", String(toBool(data.In_Sitemap)));
      formData.append("bootcamp", String(data.bootcamp === "true"));
      formData.append("Page_Index", String(toBool(data.Page_Index)));

      // optional
      formData.append("Custom_Canonical_Url", data.Custom_Canonical_Url || "");

      // image alt
      formData.append("course_Image_Alt", data.course_Image_Alt);

      // priority
      if (
        data.priority !== undefined &&
        data.priority !== null &&
        data.priority !== ""
      ) {
        formData.append("priority", String(Number(data.priority)));
      }

      if (data.Skill_Level) {
        formData.append("Skill_Level", data.Skill_Level);
      }

      if (data.video_Id) {
        formData.append("video_Id", data.video_Id);
      }

      // optional numeric fields
      const optionalFields = [
        "Monthly_Fee",
        "Admission_Fee",
        "Duration_Months",
        "Duration_Day",
      ];
      optionalFields.forEach((field) => {
        if (
          data[field] !== undefined &&
          data[field] !== null &&
          data[field] !== ""
        ) {
          formData.append(field, data[field]);
        }
      });

      // files
      if (courseImage) formData.append("course_Image", courseImage);
      if (brochure) formData.append("Brochure", brochure);

      await axios.post("/courses/add-course", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      enqueueSnackbar("Course added successfully!", { variant: "success" });
      navigate("/dashboard/courses");
    } catch (error) {
      console.error("Add course error:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Something went wrong!",
        {
          variant: "error",
        }
      );
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

  const updateCourse = async ({
    id,
    data,
    brochureFile,
    targetCategoryId,
    setIsSubmitting,
  }) => {
    try {
      if (setIsSubmitting) setIsSubmitting(true);

      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        // schema → already JSON.stringify(array) from EditCourse
        if (key === "schemas") {
          // send as JSON string of array so backend can parse
          formData.append("schemas", JSON.stringify(value));
          return;
        }

        // handle course image file
        if (key === "course_Image") {
          if (value instanceof File) {
            formData.append("course_Image", value);
          }
          // if it's just a string path, skip so backend keeps old value
          return;
        }

        // booleans & numbers
        if (typeof value === "boolean" || typeof value === "number") {
          formData.append(key, String(value));
          return;
        }

        formData.append(key, value);
      });

      if (brochureFile) {
        formData.append("Brochure", brochureFile);
      }

      if (targetCategoryId) {
        formData.append("targetCategoryId", targetCategoryId);
      }

      await axios.put(`/courses/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      enqueueSnackbar("Course updated successfully!", { variant: "success" });
      // if you want redirect after update:
      // navigate("/dashboard/courses");
    } catch (error) {
      console.error("Update course error:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to update course.",
        { variant: "error" }
      );
      throw error;
    } finally {
      if (setIsSubmitting) setIsSubmitting(false);
    }
  };

  const reorderCourses = async ({ categoryId, order }) => {
    try {
      await axios.put(`/courses/reorder/${categoryId}`, { order });
      toast.success("Courses reordered successfully.");
    } catch (error) {
      console.error("Reorder courses error:", error);
      toast.error("Failed to reorder courses.");
    }
  };

  return {
    addCourse,
    fetchCourses,
    deleteCourse,
    updateStatus,
    updateCourse,
    reorderCourses,
  };
};

export default useCourses;
