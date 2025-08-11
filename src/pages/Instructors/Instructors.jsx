import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/axios";

const Instructors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch instructor details from the API
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get(
          `/api/instructors/get-instructor`
        );
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      }
    };

    fetchInstructors();
  }, [location]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    // Filter the users by both name and email, ensuring that they are not undefined
    const filtered = users.filter(
      (user) =>
        (user.name && user.name.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term))
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this instructor?");
  if (!confirmDelete) return;

  try {
    const response = await axios.delete(`/api/instructors/${id}`);
    
    // Update UI
    setFilteredUsers(filteredUsers.filter((user) => user._id !== id));

    // Show success toast with backend message
    toast.success(response.data.message || "Instructor deleted successfully");
  } catch (error) {
    console.error("Failed to delete user", error);

    // Show error toast with backend message if available
    toast.error(error.response?.data?.message || "Failed to delete instructor");
  }
};


  const handleEditClick = (userId) => {
    navigate(`/dashboard/editinstructors/${userId}`);
  };

  const isAddInstructorPage = location.pathname.includes("adduser");

  return (
    <motion.div
      className="bg-gray-900 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {!isAddInstructorPage && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-100 cursor-pointer mb-6">
              Instructor
            </h2>
            <hr className="w-full h-1 bg-slate-500 rounded-sm" />
            <div className="my-5 flex justify-center lg:justify-between items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>
              <Link to="/dashboard/addinstructors">
                <button className="bg-blue-600 hover:bg-blue-500 hidden sm:block text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                  Add Instructor
                </button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sr No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Photo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    View Web
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{index + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                        <img
                          src={
                            user.photo
                              ? `${
                                  import.meta.env.VITE_API_URL
                                }/${user.photo.replace(/\\/g, "/")}`
                              : "path/to/default-image.jpg" // Use a fallback image here
                          }
                          alt="User profile"
                          className="h-full w-full object-cover rounded-full"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/users/${user._id}`}>
                        <button className="text-blue-400 hover:text-blue-300">
                          View Web
                        </button>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                        onClick={() => handleEditClick(user._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(user._id)}
                      >
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

export default Instructors;
