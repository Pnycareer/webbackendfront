import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const TableMenucat = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [galleryItems, setGalleryItems] = useState([]);

  const location = useLocation();

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/subCategory")
      .then((response) => setGalleryItems(response.data))
      .catch((error) => console.error("Error fetching sub-categories:", error));
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8080/api/subCategory/${itemId}`);
      setGalleryItems(galleryItems.filter((item) => item._id !== itemId));
      toast.success("Sub-category deleted successfully");
    } catch (error) {
      console.error("Error deleting sub-category:", error);
    }
  };

  const isAddGalleryPage = location.pathname.includes("addgallery");

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {!isAddGalleryPage && (
        <>
          <div className="text-center items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-100 mb-5">Sub-Category</h2>
            <hr className="w-full h-1 bg-slate-500 rounded-sm mb-5" />

            <div className="flex justify-center lg:justify-between items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search sub-category"
                  className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>

              <Link to="/addsubcat">
                <button className="bg-blue-600 hidden sm:block hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                  Add Sub-Category
                </button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sr No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    URL Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {galleryItems
                  .filter((item) => item.name && item.name.toLowerCase().includes(searchTerm))
                  .map((item, index) => (
                    <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      {/* <img
  src={item.subimage ? item.subimage.replace(/\\/g, "/") : "https://via.placeholder.com/50"}
  alt="Cover"
  className="h-12 w-12 rounded"
/> */}
<img
  src={`http://localhost:8080/${item.subimage.replace(/\\/g, "/")}`}
  alt="Course"
  className="h-14 w-14"
/>


                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.url_Slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.courses.length > 0 ? item.courses.map((course) => course.course_Name.slice(0,15)).join(", ") : "No Courses"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <Link to={`/editsubcat/${item._id}`}>
                          <button className="text-indigo-400 hover:text-indigo-300 mr-2">Edit</button>
                        </Link>
                        <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-300">
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TableMenucat;
