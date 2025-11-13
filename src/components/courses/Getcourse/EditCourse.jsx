import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Quill from "quill";
import "react-quill/dist/quill.snow.css";
import RichTextEditor from "../../RichTextEditor/RichTextEditor";
import axios from "../../../utils/axios";
import useCourses from "../../../hooks/useCourses";

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState({
    course_Name: "",
    Short_Description: "",
    course_Image: "",
    course_Image_Alt: "",
    status: " ",
    Admission_Fee: "",
    Brochure: "",
    Course_Description: "",
    Duration_Day: "",
    Duration_Months: "",
    In_Sitemap: false,
    priority: "",
    Instructor: "",
    Meta_Description: "",
    Meta_Title: "",
    Monthly_Fee: "",
    Page_Index: false,
    Skill_Level: "",
    showtoc: false,
    View_On_Web: false,
    url_Slug: "",
    video_Id: "",
    course_Category: "",
    featured_Option: "",
    bootcamp: false,

    // JSON-LD schemas (array of strings)
    schemas: [],
  });

  const [categories, setCategories] = useState([]);
  const [brochureFile, setBrochureFile] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateCourse } = useCourses();

  const quillRef = useRef();

  // Register custom YouTube icon once
  useEffect(() => {
    if (typeof window !== "undefined") {
      const icons = Quill.import("ui/icons");
      icons["youtube"] = `
         <svg viewBox="0 0 24 24">
           <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>
         </svg>`;
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/courses/getallcategories/getcategory`
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseResponse, instructorsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/courses/getonid/${id}`),
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/instructors/get-instructor`
          ),
        ]);

        const fetchedCourse = courseResponse.data;

        // make sure all keys exist (including schemas)
        const template = { ...course };
        for (const key in template) {
          if (!(key in fetchedCourse)) {
            fetchedCourse[key] = template[key];
          }
        }

        // ensure schemas is always an array of editable strings
        if (!Array.isArray(fetchedCourse.schemas)) {
          fetchedCourse.schemas = fetchedCourse.schemas
            ? [fetchedCourse.schemas]
            : [];
        }
        fetchedCourse.schemas = fetchedCourse.schemas.map((schemaBlock) => {
          if (schemaBlock == null) return "";
          if (typeof schemaBlock === "string") return schemaBlock;
          try {
            return JSON.stringify(schemaBlock, null, 2);
          } catch (_) {
            return "";
          }
        });

        setCourse(fetchedCourse);
        setInstructors(instructorsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    if (id) fetchData();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const slugify = (text) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s.-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]:
        type === "checkbox"
          ? checked
          : name === "url_Slug"
          ? slugify(value)
          : value,
    }));
  };

  // ====== schema handlers ======

  const handleSchemaChange = (index, value) => {
    setCourse((prev) => {
      const schemas = Array.isArray(prev.schemas) ? [...prev.schemas] : [];
      schemas[index] = value;
      return { ...prev, schemas };
    });
  };

  const addSchemaBlock = () => {
    setCourse((prev) => ({
      ...prev,
      schemas: [...(prev.schemas || []), ""],
    }));
  };

  const removeSchemaBlock = (index) => {
    setCourse((prev) => {
      const schemas = [...(prev.schemas || [])];
      schemas.splice(index, 1);
      return { ...prev, schemas };
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const { faqs, schemas, ...courseWithoutFaqs } = course;

  const normalizedSchemas = (schemas || [])
    .map((s) => (s && s.trim() ? s : null))
    .filter(Boolean);

  const payload = {
    ...courseWithoutFaqs,
    schemas: normalizedSchemas,    // 👈 array of raw strings
  };

  await updateCourse({
    id,
    data: payload,
    brochureFile,
    targetCategoryId,
    setIsSubmitting,
  });
};


  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full overflow-auto">
      <div className="bg-gray-500 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border my-10 border-gray-700 mx-auto w-full">
        <h2 className="text-2xl font-semibold text-gray-100 mb-5">
          Edit Course
        </h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Move to Category */}
          <div className="mb-4">
            <label className="block text-gray-300">Move to Category</label>
            <select
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="">(keep current category)</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.category_Name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Pick a category to move this course into. Leave blank to stay put.
            </p>
          </div>

          {/* Course Name */}
          <div className="mb-4">
            <label className="block text-gray-300">Course Name</label>
            <input
              type="text"
              name="course_Name"
              value={course.course_Name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          {/* URL Slug */}
          <div className="mb-4">
            <label className="block text-gray-300">URL Slug</label>
            <input
              type="text"
              name="url_Slug"
              value={course.url_Slug}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          {/* Course Image */}
          <div className="mb-4">
            <label className="block text-gray-300">Upload Course Image</label>
            <input
              type="file"
              name="course_Image"
              onChange={(e) =>
                setCourse((prev) => ({
                  ...prev,
                  course_Image: e.target.files[0],
                }))
              }
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          {/* Image Alt */}
          <div className="mb-4">
            <label className="block text-gray-300">Image Alt Text</label>
            <input
              type="text"
              name="course_Image_Alt"
              value={course.course_Image_Alt}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder={`Alt for ${course.course_Name || "course image"}`}
            />
          </div>

          {/* Video ID */}
          <div className="my-2">
            <label>Video ID</label>
            <input
              className="w-full p-2 rounded bg-gray-700 text-white"
              type="text"
              name="video_Id"
              value={course.video_Id}
              onChange={handleChange}
            />
          </div>

          {/* Skill Level */}
          <div className="mb-4">
            <label className="block text-gray-300">Skill Level</label>
            <select
              name="Skill_Level"
              value={course?.Skill_Level}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="" disabled>
                Select Skill Level
              </option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Short Description */}
          <div className="mb-4">
            <label className="block text-gray-300">Short Description</label>
            <textarea
              name="Short_Description"
              value={course.Short_Description}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          {/* Course Description */}
          <div className="mb-4">
            <label className="block text-gray-300">Course Description</label>
            <RichTextEditor
              value={course.Course_Description}
              onChange={(content) =>
                setCourse((prev) => ({
                  ...prev,
                  Course_Description: content,
                }))
              }
            />
          </div>

          {/* Instructor */}
          <div className="mb-4">
            <label className="block text-gray-300">Instructor</label>
            <select
              name="Instructor"
              value={course.Instructor}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="">Select an Instructor</option>
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fees & Duration */}
          <div className="mb-4">
            <label className="block text-gray-300">Monthly_Fee</label>
            <input
              type="number"
              name="Monthly_Fee"
              value={course.Monthly_Fee}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300">Admission Fee</label>
            <input
              type="number"
              name="Admission_Fee"
              value={course.Admission_Fee}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300">Duration_Months</label>
            <input
              type="number"
              name="Duration_Months"
              value={course.Duration_Months}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300">Duration_Day</label>
            <input
              type="number"
              name="Duration_Day"
              value={course.Duration_Day}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          {/* Meta */}
          <div className="mb-4">
            <label className="block text-gray-300">Meta_Title</label>
            <input
              type="text"
              name="Meta_Title"
              value={course.Meta_Title}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300">Meta_Description</label>
            <input
              type="text"
              name="Meta_Description"
              value={course.Meta_Description}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          {/* Brochure */}
          <div className="mb-4">
            <label className="block text-gray-300">Upload Brochure</label>
            <input
              type="file"
              name="Brochure"
              accept=".pdf"
              onChange={(e) => setBrochureFile(e.target.files[0])}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          {course.Brochure && (
            <a
              href={`${import.meta.env.VITE_API_URL}/${course.Brochure}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              View Existing Brochure
            </a>
          )}

          {/* Status / flags */}
          <div className="mb-4">
            <label className="block text-gray-300">Status</label>
            <select
              name="status"
              value={course.status}
              onChange={(e) =>
                setCourse((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="my-2">
            <label>Table of Content</label>
            <input
              type="checkbox"
              name="showtoc"
              checked={course.showtoc}
              onChange={(e) =>
                setCourse({ ...course, showtoc: e.target.checked })
              }
            />
          </div>

          <div className="my-2">
            <label>View on Web</label>
            <input
              type="checkbox"
              name="View_On_Web"
              checked={course.View_On_Web}
              onChange={(e) =>
                setCourse({ ...course, View_On_Web: e.target.checked })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300">Is Bootcamp?</label>
            <select
              name="bootcamp"
              value={course.bootcamp ? "true" : "false"}
              onChange={(e) =>
                setCourse((prev) => ({
                  ...prev,
                  bootcamp: e.target.value === "true",
                }))
              }
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div className="my-2">
            <label>In_Sitemap</label>
            <input
              type="checkbox"
              name="In_Sitemap"
              checked={course.In_Sitemap}
              onChange={(e) =>
                setCourse({ ...course, In_Sitemap: e.target.checked })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300">Priority</label>
            <input
              type="number"
              step="0.1"
              min="0.0"
              max="0.9"
              name="priority"
              value={course.priority}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div className="my-2">
            <label>Page Index</label>
            <input
              type="checkbox"
              name="Page_Index"
              checked={course.Page_Index}
              onChange={(e) =>
                setCourse({ ...course, Page_Index: e.target.checked })
              }
            />
          </div>

          {/* Schema editor */}
          <div className="mt-6 mb-4">
            <label className="block text-gray-300 mb-2">
              Structured Data (JSON-LD Schemas)
            </label>

            {(!course.schemas || course.schemas.length === 0) && (
              <p className="text-sm text-gray-400 mb-2">
                No schemas yet. Click &quot;Add Schema&quot; to add FAQ,
                Article, BreadcrumbList, etc.
              </p>
            )}

            {course.schemas &&
              course.schemas.map((schemaItem, index) => (
                <div
                  key={index}
                  className="mb-3 border border-gray-600 rounded p-3 bg-gray-800"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-200 text-sm">
                      Schema #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSchemaBlock(index)}
                      className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    className="w-full min-h-[140px] p-2 rounded bg-gray-900 text-white text-xs font-mono"
                    placeholder={`Paste JSON-LD here, e.g.\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  ...\n}`}
                    value={schemaItem || ""}
                    onChange={(e) => handleSchemaChange(index, e.target.value)}
                  />
                </div>
              ))}

            <button
              type="button"
              onClick={addSchemaBlock}
              className="mt-2 px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-500"
            >
              Add Schema
            </button>
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Updating…" : "Update Course"}
            </button>

            <button
              type="button"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 focus:outline-none"
              onClick={() => navigate("/dashboard/courses")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
