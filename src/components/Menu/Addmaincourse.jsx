import React, { useState, useEffect } from "react";
import { ToastContainer, toast, Zoom } from "react-toastify";

function App() {
  // -----------------------------
  // 1. Subcategory fields
  // -----------------------------
  const [name, setName] = useState("");
  const [urlSlug, setUrlSlug] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [instructorOptions, setInstructorOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [courseType, setCourseType] = useState(""); // <-- NEW

  const mainCourseOptions = [
    "diploma",
    "marketing",
    "development",
    "designing",
    "business",
    "multimedia",
  ];

  const cityCourseOptions = [
    "lahore",
    "multan",
    "karachi",
    "islamabad",
    "rawalpindi",
  ];

  const [courses, setCourses] = useState([{ course_id: "" }]);
  const [instructors, setInstructors] = useState([{ instructor_id: "" }]);

  const handleAddCourse = () => {
    setCourses((prev) => [...prev, { course_id: "" }]);
  };

  const handleRemoveCourse = (index) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCourseChange = (index, value) => {
    setCourses((prev) => {
      const updatedCourses = [...prev];
      updatedCourses[index].course_id = value;
      return updatedCourses;
    });
  };

  const handleAddInstructor = () => {
    setInstructors((prev) => [...prev, { instructor_id: "" }]);
  };

  const handleRemoveInstructor = (index) => {
    setInstructors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInstructorChange = (index, value) => {
    setInstructors((prev) => {
      const updatedInstructors = [...prev];
      updatedInstructors[index].instructor_id = value;
      return updatedInstructors;
    });
  };

  const handleSlugChange = async (e) => {
    const selectedSlug = e.target.value;
    setUrlSlug(selectedSlug);

    // Reset fields
    setName("");
    setDescription("");
    setMetaTitle("");
    setMetaDescription("");
    setCourses([{ course_id: "" }]);
    setInstructors([{ instructor_id: "" }]);

    if (!selectedSlug) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/subCourse/getsubcourses/${selectedSlug}`
      );
      const data = await response.json();

      if (response.ok && data.name) {
        setName(data.name);
        setDescription(data.description);
        setMetaTitle(data.meta_title);
        setMetaDescription(data.meta_description);
      } else {
        toast.success("Subcategory not found!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          transition: Zoom,
        });
      }
    } catch (error) {
      console.error("Error fetching subcategory:", error);
      toast("Failed to fetch subcategory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      if (!urlSlug) {
        setCourseOptions([]);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/courses/getoncategory/${urlSlug}`
        );
        const data = await response.json();

        if (response.ok && data.length > 0) {
          setCourseOptions(data);
        } else {
          setCourseOptions([]);
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        setCourseOptions([]);
      }
    };

    fetchCourses();
  }, [urlSlug]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/instructors/get-instructor`
        );
        const data = await response.json();
        if (response.ok) {
          setInstructorOptions(data);
        } else {
          console.error("Error fetching instructors");
        }
      } catch (error) {
        console.error("Failed to fetch instructors:", error);
      }
    };

    fetchInstructors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      name,
      url_slug: urlSlug,
      description,
      meta_title: metaTitle,
      meta_description: metaDescription,
      category_courses: courses,
      category_instructors: instructors.filter(
        (instructor) =>
          instructor.instructor_id && instructor.instructor_id !== ""
      ),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/subCourse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Success! " + data.message);
      } else {
        alert("Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="w-full mx-auto p-6 h-92 overflow-y-auto bg-gray-700">
      <h1 className="text-2xl font-bold mb-6">Create / Update Subcategory</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =====================
            Subcategory Fields
            ===================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Name:</label>
            <input
              type="text"
              className="border rounded w-full p-2 text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Select Course Type:</label>
            <select
              className="border rounded w-full p-2 text-black"
              value={courseType}
              onChange={(e) => {
                setCourseType(e.target.value);
                setUrlSlug("");
              }}
              required
            >
              <option value="">Select a type</option>
              <option value="main">Main Courses</option>
              <option value="city">City Courses</option>
            </select>
          </div>

          <div className="relative">
            <label className="block font-semibold">Select Slug:</label>
            <select
              className="border rounded w-full p-2 text-black"
              value={urlSlug}
              onChange={handleSlugChange}
              disabled={!courseType}
            >
              <option value="">Select a slug</option>
              {(courseType === "main"
                ? mainCourseOptions
                : courseType === "city"
                ? cityCourseOptions
                : []
              ).map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>

            {/* Loader */}
            {isLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0l4 4-4 4V4a8 8 0 00-8 8H4z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block font-semibold">Description Short:</label>
          <input
            type="text"
            className="border rounded w-full p-2 text-black"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Meta Title:</label>
            <input
              type="text"
              className="border rounded w-full p-2 text-black"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold">Meta Description:</label>
            <input
              type="text"
              className="border rounded w-full p-2 text-black"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              required
            />
          </div>
        </div>

        {/* =====================
            Courses Section
            ===================== */}
        <div>
          <label className="block font-semibold">Select Course:</label>
          {courses.map((course, index) => (
            <div key={index} className="flex items-center gap-4 mb-2">
              <select
                className="border rounded w-full p-2 text-black"
                value={course.course_id}
                onChange={(e) => handleCourseChange(index, e.target.value)}
              >
                <option value="">Select</option>
                {courseOptions.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.course_Name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleRemoveCourse(index)}
                className="text-red-600 font-bold"
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddCourse}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Add Course
          </button>
        </div>

        {/* =====================
            Instructors Section
            ===================== */}
        <div>
          <label className="block font-semibold">Select Instructor:</label>
          {instructors.map((inst, index) => (
            <div key={index} className="flex items-center gap-4 mb-2">
              <select
                className="border rounded w-full p-2 text-black"
                value={inst.instructor_id}
                onChange={(e) => handleInstructorChange(index, e.target.value)}
              >
                <option value="">Select</option>
                {instructorOptions.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleRemoveInstructor(index)}
                className="text-red-600 font-bold"
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddInstructor}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Add Instructor
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>

      <ToastContainer />
    </div>
  );
}

export default App;
