import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useCourseModel from "../../hooks/useCourseModel";

const CourseModulesTable = () => {
  const [modules, setModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { fetchAllModules, deleteModuleById } = useCourseModel();

  useEffect(() => {
    const loadModules = async () => {
      setLoading(true);
      try {
        const data = await fetchAllModules();
        setModules(data);
      } catch (err) {
        console.error("Failed to load modules:", err);
      } finally {
        setLoading(false);
      }
    };
    loadModules();
  }, []);

 const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this module?");
  if (!confirmDelete) return;

  const success = await deleteModuleById(id);
  if (success) {
    setModules((prev) => prev.filter((mod) => mod._id !== id));
  }
};
  

  const filteredModules = modules.filter((module) =>
    module.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-black mb-4">
        All Course Modules
      </h2>

      {/* Search & Add */}
      <div className="mb-4 flex justify-between flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by course name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-black"
        />
        <Link
          to="/dashboard/addcoursemodel"
          className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600"
        >
          Add Module
        </Link>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full table-auto bg-[#0f172a] text-white">
            <thead className="bg-[#0f172a] border-b border-gray-700 text-sm text-left">
              <tr>
                <th className="px-4 py-3">COURSE</th>
                <th className="px-4 py-3">LECTURES</th>
                <th className="px-4 py-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-300">
                    No matching modules found.
                  </td>
                </tr>
              ) : (
                filteredModules.map((module, index) => (
                  <motion.tr
                    key={module._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="border-b border-gray-700 hover:bg-gray-800 transition-all"
                  >
                    <td className="px-4 py-3">{module.courseName}</td>
                    <td className="px-4 py-3">{module.lectures.length}</td>
                    <td className="px-4 py-3 space-x-2">
                      <Link
                        to={`/dashboard/editmodel/${module._id}`}
                        className="text-blue-400 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(module._id)}
                        className="text-red-400 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourseModulesTable;
