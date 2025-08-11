import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useCourses from "../../hooks/useCourses";

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriesWithCourses, setCategoriesWithCourses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openCategories, setOpenCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const { fetchCourses, deleteCourse, updateStatus } = useCourses();

  const fetchAndUpdate = async () => {
    setLoading(true);
    const data = await fetchCourses();
    setCategoriesWithCourses(data);
    setFilteredData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAndUpdate();
  }, [location.pathname]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredData(categoriesWithCourses);
      setOpenCategories([]);
      return;
    }

    const filtered = categoriesWithCourses
      .map((cat) => {
        const matchedCourses = cat.courses.filter((course) =>
          course.course_Name?.toLowerCase().includes(term)
        );
        return matchedCourses.length
          ? { ...cat, courses: matchedCourses }
          : null;
      })
      .filter(Boolean);

    setFilteredData(filtered);
    const matchedIds = filtered.map((cat) => cat._id);
    setOpenCategories(matchedIds);
  };

  const toggleCategory = (id) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );
    if (!confirmDelete) return;
    await deleteCourse(id, fetchAndUpdate);
  };

  const handleStatusChange = async (id, currentStatus) => {
    await updateStatus(id, currentStatus, fetchAndUpdate);
  };

  const handleEdit = (courseId) => {
    navigate(`/dashboard/editcourse/${courseId}`);
  };

  const isAddCoursePage = location.pathname.includes("addcourse");

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {!isAddCoursePage && (
        <>
          <div className="text-center items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-100 mb-5">
              Courses by Category
            </h2>
            <hr className="w-full h-1 bg-slate-500 rounded-sm" />
            <div className="my-5 flex justify-center lg:justify-between items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>
              <Link to="/dashboard/addcourse">
                <button className="bg-blue-600 hover:bg-blue-500 text-white hidden sm:block font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                  Add Courses
                </button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-60">
              <motion.div
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear",
                }}
              />
              <p className="text-gray-300 mt-3">Loading courses...</p>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((category) => (
              <div
                key={category._id}
                className="mb-6 border rounded-lg bg-gray-900 border-gray-700"
              >
                <button
                  onClick={() => toggleCategory(category._id)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left bg-gray-800 hover:bg-gray-700 transition-all"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {category.category_Name.charAt(0).toUpperCase() +
                      category.category_Name.slice(1)}
                  </h3>
                  <motion.div
                    animate={{
                      rotate: openCategories.includes(category._id) ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="text-gray-300" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openCategories.includes(category._id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="overflow-x-auto px-6 pb-4">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead>
                            <tr>
                              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                                Course
                              </th>
                              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                                Image
                              </th>
                              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                                Monthly Fee
                              </th>
                              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                                Admission Fee
                              </th>
                              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                                Status
                              </th>
                              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {category.courses.map((course) => (
                              <motion.tr
                                key={course._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <td className="py-2 text-gray-100">
                                  {course.course_Name}
                                </td>
                                <td className="py-2">
                                  <img
                                    src={
                                      course.course_Image
                                        ? `${
                                            import.meta.env.VITE_API_URL
                                          }/${course.course_Image.replace(
                                            /\\/g,
                                            "/"
                                          )}`
                                        : "https://via.placeholder.com/50"
                                    }
                                    alt="Course"
                                    className="h-14 w-14 rounded"
                                  />
                                </td>
                                <td className="py-2 text-gray-300">
                                  {course.Monthly_Fee || "N/A"}
                                </td>
                                <td className="py-2 text-gray-300">
                                  {course.Admission_Fee || "N/A"}
                                </td>
                                <td className="py-2">
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        course._id,
                                        course.status
                                      )
                                    }
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No courses found.</p>
          )}
        </>
      )}
      <Outlet />
    </motion.div>
  );
};

export default Courses;
