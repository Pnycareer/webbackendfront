import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";

const GetEflyers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [flyerData, setFlyerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openCategories, setOpenCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlyers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/eflyer");
        setFlyerData(res.data);
        setFilteredData(res.data);
      } catch (err) {
        console.error("Error fetching flyers:", err);
      }
      setLoading(false);
    };

    fetchFlyers();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredData(flyerData);
      setOpenCategories([]);
      return;
    }

    const filtered = flyerData
      .map((flyer) => {
        const matched = flyer.eflyers.filter((e) =>
          e.title.toLowerCase().includes(term)
        );
        return matched.length ? { ...flyer, eflyers: matched } : null;
      })
      .filter(Boolean);

    setFilteredData(filtered);
    const matchedIds = filtered.map((f) => f._id);
    setOpenCategories(matchedIds);
  };

  const toggleCategory = (id) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };





const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you *sure* you want to delete this flyer?");
  if (!confirmDelete) {
    toast.info("Deletion cancelled.");
    return;
  }

  try {
    const res = await axios.delete(`/api/eflyer/${id}`);

    // Assuming the backend returns something like { message: "Deleted successfully" }
    const successMessage = res.data?.message || "Flyer deleted successfully.";

    setFlyerData((prev) =>
      prev.map((flyer) => ({
        ...flyer,
        eflyers: flyer.eflyers.filter((e) => e._id !== id),
      }))
    );
    setFilteredData((prev) =>
      prev.map((flyer) => ({
        ...flyer,
        eflyers: flyer.eflyers.filter((e) => e._id !== id),
      }))
    );

    toast.success(successMessage);
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || "Something went wrong while deleting the flyer.";
    console.error("Delete failed:", error);
    toast.error(errorMessage);
  }
};


  return (
    <>
    <div className="p-4 flex justify-end text-white">
        <Link className="bg-blue-500 px-4 py-2" to = '/dashboard/add-eflayer'>
        Add E-Flyers
    </Link>
    </div>
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="text-center items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-100 mb-5">
          E-Flyers by Category
        </h2>
        <hr className="w-full h-1 bg-slate-500 rounded-sm" />
        <div className="my-5 flex justify-center items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search e-flyers..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-60">
          <motion.div
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="text-gray-300 mt-3">Loading e-flyers...</p>
        </div>
      ) : filteredData.length > 0 ? (
        filteredData.map((flyer) => (
          <div
            key={flyer._id}
            className="mb-6 border rounded-lg bg-gray-900 border-gray-700"
          >
            <button
              onClick={() => toggleCategory(flyer._id)}
              className="w-full flex justify-between items-center px-6 py-4 text-left bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <h3 className="text-lg font-semibold text-white">
                {flyer.name}
              </h3>
              <motion.div
                animate={{
                  rotate: openCategories.includes(flyer._id) ? 180 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="text-gray-300" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openCategories.includes(flyer._id) && (
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
                            Title
                          </th>
                          <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                            Description
                          </th>
                          <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                            Brochure
                          </th>
                          <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {flyer.eflyers.map((doc) => (
                          <motion.tr
                            key={doc._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td className="py-2 text-gray-100">{doc.title}</td>
                            <td className="py-2 text-gray-300">
                              {doc.description}
                            </td>
                            <td className="py-2">
                              <a
                                href={`http://localhost:8080/${doc.brochureUrl.replace(/\\/g, "/")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                              >
                                Download
                              </a>
                            </td>
                            <td className="py-2 text-sm text-gray-300">
                              <Link to = {`/dashboard/edit-eflayer/${doc._id}`}
                                className="text-indigo-400 hover:text-indigo-300 mr-2">
                                Edit
                              </Link>
                              <button
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDelete(doc._id)}
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
        <p className="text-center text-gray-400">No flyers found.</p>
      )}
    </motion.div>
    </>
  );
};

export default GetEflyers;