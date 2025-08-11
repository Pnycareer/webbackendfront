import { motion } from "framer-motion";

const CourseTable = ({ courses, handleEdit, handleDelete, updateStatus }) => (
  <div className="overflow-x-auto px-6 pb-4">
    <table className="min-w-full divide-y divide-gray-700">
      <thead>
        <tr>
          <th className="text-left text-xs text-gray-400 uppercase py-2">Course</th>
          <th className="text-left text-xs text-gray-400 uppercase py-2">Image</th>
          <th className="text-left text-xs text-gray-400 uppercase py-2">Monthly Fee</th>
          <th className="text-left text-xs text-gray-400 uppercase py-2">Admission Fee</th>
          <th className="text-left text-xs text-gray-400 uppercase py-2">Status</th>
          <th className="text-left text-xs text-gray-400 uppercase py-2">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {courses.map((course) => (
          <motion.tr
            key={course._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <td className="py-2 text-gray-100">{course.course_Name}</td>
            <td className="py-2">
              <img
                src={
                  course.course_Image
                    ? `${import.meta.env.VITE_API_URL}/${course.course_Image.replace(/\\/g, "/")}`
                    : "https://via.placeholder.com/50"
                }
                alt="Course"
                className="h-14 w-14 rounded"
              />
            </td>
            <td className="py-2 text-gray-300">{course.Monthly_Fee || "N/A"}</td>
            <td className="py-2 text-gray-300">{course.Admission_Fee || "N/A"}</td>
            <td className="py-2">
              <button
                onClick={() => updateStatus(course._id, course.status)}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  course.status === "Active"
                    ? "bg-green-800 text-green-100"
                    : "bg-red-800 text-red-100"
                }`}
              >
                {course.status}
              </button>
            </td>
            <td className="py-2 text-sm text-gray-300">
              <button
                className="text-indigo-400 hover:text-indigo-300 mr-2"
                onClick={() => handleEdit(course._id)}
              >
                Edit
              </button>
              <button
                className="text-red-400 hover:text-red-300"
                onClick={() => handleDelete(course._id)}
              >
                Delete
              </button>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CourseTable;
