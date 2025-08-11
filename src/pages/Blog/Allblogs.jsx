import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";

const Allblogs = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCounts, setVisibleCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/blogs`);
      setCategories(response.data);

      const initialCounts = {};
      response.data.forEach((cat) => {
        initialCounts[cat._id] = 5;
      });
      setVisibleCounts(initialCounts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Error fetching blogs!");
      setLoading(false);
    }
  };

 const handleDelete = async (blogId) => {
  const confirmed = window.confirm("Are you sure you want to delete this blog?");
  if (!confirmed) return;

  try {
    // Make delete API request
    const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/blogs/${blogId}`);

    // Remove the blog from UI (locally update)
    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        blogs: cat.blogs.filter((blog) => blog._id !== blogId),
      }))
    );

    toast.success(res.data?.message || "Blog deleted successfully!");
  } catch (error) {
    console.error("Error deleting blog:", error);
    const message =
      error.response?.data?.message || "Something went wrong while deleting the blog.";
    toast.error(message);
  }
};


  

  const handleEdit = (blogId) => {
    navigate(`/dashboard/editblog/${blogId}`);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSearchQuery("");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (inView && !loading) {
      filteredCategories.forEach((cat) => {
        if (searchQuery === "") {
          setVisibleCounts((prev) => ({
            ...prev,
            [cat._id]: (prev[cat._id] || 5) + 5,
          }));
        }
      });
    }
  }, [inView]);

  const getFilteredCategories = () => {
    let filtered =
      selectedCategory === "all"
        ? categories
        : categories.filter((cat) => cat._id === selectedCategory);

    if (searchQuery.trim() !== "") {
      filtered = filtered.map((cat) => ({
        ...cat,
        blogs: cat.blogs.filter((blog) =>
          blog.blogName.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }));
    }

    return filtered;
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div className="p-2 w-full min-h-screen overflow-y-auto mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">All Blogs</h1>
        <div className="flex gap-4 items-center">
          <Link to='/dashboard/blog-post' className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Add Blog
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-black font-semibold">
            Filter by Category:
          </label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="border border-gray-500 bg-gray-800 text-white p-2 rounded"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.blogCategory}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-black font-semibold">Search Blog:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Enter blog name..."
            className="border border-gray-500 bg-gray-800 text-white p-2 rounded"
          />
        </div>
      </div>

      {/* Main Section */}
      {loading ? (
        <Spinner />
      ) : filteredCategories.length === 0 ? (
        <NoResult />
      ) : (
        filteredCategories
        .filter((category) => category.blogs.length > 0) // ✨
        .map((category) => (
          <div key={category._id} className="mb-10">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4 capitalize">
              {category.blogCategory}
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700 mb-6">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Sr. No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700 text-gray-300">
                  {category.blogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-4 text-gray-400"
                      >
                        No matching blogs found.
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {category.blogs
                        .slice(
                          0,
                          searchQuery
                            ? category.blogs.length
                            : visibleCounts[category._id] || 5
                        )
                        .map((blog, index) => (
                          <motion.tr
                            key={blog._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold">
                                {blog.blogName}
                              </div>
                              <div className="text-sm text-gray-400">
                                {blog.author?.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="truncate w-48">
                                {blog.shortDescription}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src={`${import.meta.env.VITE_API_URL}/${blog.blogImage.replace(
                                  /\\/g,
                                  "/"
                                )}`}
                                alt="Blog"
                                className="w-16 h-16 object-cover rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${blog.inviewweb ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
                              >
                                {blog.inviewweb ? "Active" : "Inactive"}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap flex gap-4">
                              <button
                                onClick={() => handleEdit(blog._id)}
                                className="text-blue-400 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(blog._id)}
                                className="text-red-400 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Scroll observer div */}
      <div ref={ref} className="h-1"></div>
    </div>
  );
};

export default Allblogs;

// Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// No Result Component
const NoResult = () => (
  <motion.div
    className="text-center text-gray-400 py-20"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <p className="text-6xl mb-4">😔</p>
    <p className="text-xl">No Blogs Found</p>
  </motion.div>
);
