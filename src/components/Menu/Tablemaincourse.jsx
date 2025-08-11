import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Tablemaincourse = () => {
  const [courses, setCourses] = useState([]);
  const [editCourse, setEditCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch courses data
  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/subCourse`
      );
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

 

  const handleEditCourse = (course) => {
    setEditCourse({ ...course });
  };

  const handleInputChangeupper = (e) => {
    setEditCourse({ ...editCourse, [e.target.name]: e.target.value });
  };

  const handleUpdateCourse = async () => {
    if (!editCourse) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/subCourse/update-sub-courses/${
          editCourse._id
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editCourse.name,
            description: editCourse.description,
            meta_title: editCourse.meta_title,
            meta_description: editCourse.meta_description,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert("Update Successful!");
        setEditCourse(null);
        fetchCourses(); // Refresh data
      } else {
        alert(`Update Failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const handleDelete = async (courseId, itemId = null) => {
    const confirmDelete = window.confirm(
      itemId
        ? "Are you sure you want to delete this item?"
        : "Are you sure you want to delete this entire sub-course?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/subCourse/delete-category/${courseId}${
          itemId ? `/${itemId}` : ""
        }`,
        { method: "DELETE" }
      );

      const result = await response.json();
      if (response.ok) {
        alert("Deleted Successfully!");
        fetchCourses(); // Refresh data
      } else {
        alert(`Delete Failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end px-4">
        <Link to="/addmainc" className="bg-blue-500 px-3 py-2">
          Add Categories
        </Link>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Courses List</h2>
      <table className="min-w-full bg-gray-900 text-white border border-gray-300">
        <thead>
          <tr className="bg-gray-700 text-center">
            <th className="py-2 px-4 border">Category Name</th>
            <th className="py-2 px-4 border">Description</th>
            <th className="py-2 px-4 border text-center">Meta_title</th>
            <th className="py-2 px-4 border text-center">Meta_Description</th>
            <th className="py-2 px-4 border">Action</th>
            <th className="py-2 px-4 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <React.Fragment key={course._id}>
              <tr>
                <td className="py-2 px-4 border">{course.name}</td>
                <td className="py-2 px-4 border">{course.description}</td>

                <td className="py-2 px-4 border text-center">
                {course.meta_title}
                </td>
                <td className="py-2 px-4 border text-center">
                {course.meta_description}
                </td>
                <td className="py-2 px-4 border text-center">
                  <button onClick={() => handleEditCourse(course)}>Edit</button>
                </td>
                <td className="py-2 px-4 border text-center">
                  <button onClick={() => handleDelete(course._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Edit Course Modal */}
      {editCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-200 p-6 rounded-lg w-96">
            <h3 className="text-xl text-black font-semibold mb-4">
              Edit Course
            </h3>

            <label className="block text-gray-700">Course Name</label>
            <input
              type="text"
              name="name"
              value={editCourse.name}
              onChange={handleInputChangeupper}
              className="w-full px-3 py-2 border rounded-md text-black"
            />

            <label className="block text-gray-700 mt-2">Description</label>
            <textarea
              name="description"
              value={editCourse.description}
              onChange={handleInputChangeupper}
              className="w-full px-3 py-2 border rounded-md text-black"
            />

            <label className="block text-gray-700">Meta_Title</label>
            <input
              type="text"
              name="meta_title"
              value={editCourse.meta_title}
              onChange={handleInputChangeupper}
              className="w-full px-3 py-2 border rounded-md text-black"
            />

            <label className="block text-gray-700">Meta_description</label>
            <input
              type="text"
              name="meta_description"
              value={editCourse.meta_description}
              onChange={handleInputChangeupper}
              className="w-full px-3 py-2 border rounded-md text-black"
            />

            <button
              onClick={handleUpdateCourse}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditCourse(null)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md ml-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tablemaincourse;
