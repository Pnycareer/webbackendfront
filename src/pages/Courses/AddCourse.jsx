import { useForm } from "react-hook-form";
import { cityOptions, shortcourseOptions } from "../../components/Data/Data";
import { useState } from "react";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";
import useCategories from "../../hooks/useCategories";
import useInstructors from "../../hooks/useInstructors";
import useCourses from "../../hooks/useCourses";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema } from "../../components/schemas/courseSchema";

const AddCourse = () => {
  const { categories } = useCategories();
  const { instructors } = useInstructors();
  const { addCourse } = useCourses();
  const [selectedCourseImage, setSelectedCourseImage] = useState(null); // State for course image file
  const [selectedBrochure, setSelectedBrochure] = useState(null); // State for brochure file
  const [courseType, setCourseType] = useState("main"); // default is "main"
  const [courseDescription, setCourseDescription] = useState(""); // State for course description
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brochureError, setBrochureError] = useState(""); // Add this near your state declarations

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(courseSchema),
  });

  const onSubmit = async (data) => {
    await addCourse({
      data,
      courseDescription,
      courseImage: selectedCourseImage,
      brochure: selectedBrochure,
      setIsSubmitting,
    });
  };

  return (
    <div className="w-full overflow-y-auto">
      <div className="p-6 bg-gray-800 shadow-md m-full mx-auto">
        <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">
          Add Course
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">
              Select Course Type*
            </label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              required
            >
              <option value="main">Main Course</option>
              <option value="city">City Course</option>
              <option value="short">Short Course</option>
            </select>
          </div>

          {/* Bootcamp Field */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Is Bootcamp?*</label>
            <select
              {...register("bootcamp", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          {/* Course Name */}

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Course Name*</label>
            <input
              type="text"
              {...register("course_Name", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter course name"
            />
            {errors.course_Name && (
              <span className="text-red-500">{errors.course_Name.message}</span>
            )}
          </div>
          {/* URL Slug */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">URL Slug*</label>
            <input
              type="text"
              {...register("url_Slug", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter URL slug"
            />
            {errors.url_Slug && (
              <span className="text-red-500">{errors.url_Slug.message}</span>
            )}
          </div>

          {courseType === "main" && (
            <>
              {/* Video ID */}
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Video ID*</label>
                <input
                  type="text"
                  {...register("video_Id", { required: true })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                  placeholder="Enter Video ID"
                />
                {errors.videoID && (
                  <span className="text-red-500">Video ID is required</span>
                )}
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Course Category*</label>
            <select
              {...register("course_Category", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              defaultValue=""
            >
              <option value="" disabled>
                Select Category
              </option>

              {courseType === "main" &&
                categories.map((cat) => (
                  <option key={cat._id} value={cat.url_Slug}>
                    {cat.Category_Name}
                  </option>
                ))}

              {courseType === "city" &&
                cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city.charAt(0).toUpperCase() + city.slice(1)}
                  </option>
                ))}

              {courseType === "short" &&
                shortcourseOptions.map((city) => (
                  <option key={city} value={city}>
                    {`${city
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}`}
                  </option>
                ))}
            </select>
            {errors.course_Category && (
              <span className="text-red-500">Course Category is required</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">
              Category Description (Optional)
            </label>
            <input
              type="text"
              {...register("category_Description")}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter description for the category"
            />
          </div>

          {courseType === "main" && (
            <>
              {/* Skill Level */}
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Skill Level*</label>
                <select
                  {...register("Skill_Level", { required: true })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                  defaultValue="" // important for validation
                >
                  <option value="" disabled>
                    Select Skill
                  </option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="all">Appropriate for All</option>
                </select>
                {errors.Skill_Level && (
                  <span className="text-red-500">Skill Level is required</span>
                )}
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Instructor*</label>
            <select
              {...register("instructor", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              defaultValue="" // <- important for validation to work with the placeholder
            >
              <option value="" disabled>
                Select Instructor
              </option>
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name}
                </option>
              ))}
            </select>
            {errors.instructor && (
              <span className="text-red-500">Instructor is required</span>
            )}
          </div>

          {courseType === "main" && (
            <>
              {/* Monthly Fee */}
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Monthly Fee*</label>
                <input
                  type="number"
                  {...register("Monthly_Fee", { required: true })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                  placeholder="Enter monthly fee"
                />
                {errors.monthlyFee && (
                  <span className="text-red-500">Monthly Fee is required</span>
                )}
              </div>

              {/* Admission Fee */}
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">
                  Admission Fee*
                </label>
                <input
                  type="number"
                  {...register("Admission_Fee", { required: true })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                  placeholder="Enter admission fee"
                />
                {errors.admissionFee && (
                  <span className="text-red-500">
                    Admission Fee is required
                  </span>
                )}
              </div>

              {/* Duration Months */}
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">
                  Duration Months*
                </label>
                <input
                  type="number"
                  {...register("Duration_Months", { required: true })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                  placeholder="Enter duration in months"
                />
                {errors.durationMonths && (
                  <span className="text-red-500">
                    Duration in Months is required
                  </span>
                )}
              </div>

              {/* Duration Days */}
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">
                  Duration Days*
                </label>
                <input
                  type="number"
                  {...register("Duration_Day", { required: true })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                  placeholder="Enter duration in days"
                />
                {errors.durationDays && (
                  <span className="text-red-500">
                    Duration in Days is required
                  </span>
                )}
              </div>

              {/* Brochure */}
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">
                  Brochure (PDF Only)*
                </label>
                <input
                  type="file"
                  {...register("Brochure", { required: true })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.type !== "application/pdf") {
                      setBrochureError("Only PDF files are allowed");
                      setSelectedBrochure(null);
                      e.target.value = ""; // clear file input
                    } else {
                      setBrochureError("");
                      setSelectedBrochure(file);
                    }
                  }}
                />
                {(errors.Brochure || brochureError) && (
                  <span className="text-red-500">
                    {brochureError || "Brochure is required"}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Status */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Status*</label>
            <select
              {...register("Status", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {errors.Status && (
              <span className="text-red-500">Status is required</span>
            )}
          </div>

          {/* Showtoc */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">
              Show table of content? *
            </label>
            <select
              {...register("showtoc", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            {errors.showtoc && (
              <span className="text-red-500">Selection is required</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">
              Is View on Web? *
            </label>
            <select
              {...register("View_On_Web", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.isViewOnWeb && (
              <span className="text-red-500">Selection is required</span>
            )}
          </div>

          {/* In Sitemap */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">In Sitemap? *</label>
            <select
              {...register("In_Sitemap", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.inSitemap && (
              <span className="text-red-500">Selection is required</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Priority</label>
            <input
              type="number"
              step="0.1" // Allow decimals
              min="0.0"
              max="0.9"
              {...register("priority", { required: false })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter priority"
            />
            {errors.durationDays && (
              <span className="text-red-500">Duration in Days is required</span>
            )}
          </div>

          {/* Page Index */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Page Index? *</label>
            <select
              {...register("Page_Index", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.pageIndex && (
              <span className="text-red-500">Selection is required</span>
            )}
          </div>
          {/* Custom Canonical URL */}
          {/* <div className="mb-4">
            <label className="block text-gray-400 mb-2">
              Custom Canonical URL
            </label>
            <input
              type="text"
              {...register("Custom_Canonical_Url")}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter custom canonical URL"
            />
          </div> */}

          {/* Course Image */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Course Image*</label>
            <input
              type="file"
              {...register("course_Image", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              accept="image/*"
              placeholder="jpg,png,jpeg, gif size : 5mb"
              onChange={(e) => setSelectedCourseImage(e.target.files[0])}
            />
            {errors.courseImage && (
              <span className="text-red-500">Course Image is required</span>
            )}
          </div>

          {/* Short Description */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">
              Short Description*
            </label>
            <textarea
              {...register("Short_Description", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter short description"
            />
            {errors.shortDescription && (
              <span className="text-red-500">
                Short Description is required
              </span>
            )}
          </div>
          {/* Course Description (CKEditor) */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">
              Course Description*
            </label>
            <RichTextEditor
              value={courseDescription}
              onChange={setCourseDescription}
            />

            {errors.courseDescription && (
              <span className="text-red-500">
                Course Description is required
              </span>
            )}
          </div>

          {/* Meta Title */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Meta Title*</label>
            <input
              type="text"
              {...register("Meta_Title", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter meta title"
            />
            {errors.metaTitle && (
              <span className="text-red-500">Meta Title is required</span>
            )}
          </div>
          {/* Meta Description */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">
              Meta Description*
            </label>
            <textarea
              {...register("Meta_Description", { required: true })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter meta description"
            />
            {errors.metaDescription && (
              <span className="text-red-500">Meta Description is required</span>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                "Add Course"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
