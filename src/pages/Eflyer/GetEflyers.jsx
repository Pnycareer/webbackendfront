import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, ImagePlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";

const GetEflyers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [flyerData, setFlyerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openCategories, setOpenCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // local state for pending image files keyed by category id
  const [pendingImages, setPendingImages] = useState({});
  const [uploadingId, setUploadingId] = useState(null);

  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

  // ---- Fetch categories with eflyers
  useEffect(() => {
    const fetchFlyers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/eflyer");
        setFlyerData(res.data || []);
        setFilteredData(res.data || []);
      } catch (err) {
        console.error("Error fetching flyers:", err);
        toast.error("Failed to fetch e-flyers");
      } finally {
        setLoading(false);
      }
    };
    fetchFlyers();
  }, []);

  // ---- Search by flyer title
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredData(flyerData);
      setOpenCategories([]);
      return;
    }

    const filtered = flyerData
      .map((cat) => {
        const matched = (cat.eflyers || []).filter((e) =>
          (e.title || "").toLowerCase().includes(term)
        );
        return matched.length ? { ...cat, eflyers: matched } : null;
      })
      .filter(Boolean);

    setFilteredData(filtered);
    setOpenCategories(filtered.map((f) => f._id));
  };

  const toggleCategory = (id) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ---- Delete a single eflyer
  const handleDelete = async (eflyerId) => {
    if (!window.confirm("Delete this flyer? This can’t be undone.")) return;
    try {
      const res = await axios.delete(`/api/eflyer/${eflyerId}`);
      const msg = res.data?.message || "Flyer deleted.";

      const prune = (arr) =>
        arr.map((cat) => ({
          ...cat,
          eflyers: (cat.eflyers || []).filter((e) => e._id !== eflyerId),
        }));

      setFlyerData(prune);
      setFilteredData(prune);
      toast.success(msg);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  // ---- Image change handlers (per category)
  const onPickImage = (categoryId, file) => {
    if (!file) return;
    setPendingImages((prev) => ({ ...prev, [categoryId]: file }));
  };

  const saveCategoryImage = async (categoryId) => {
    const file = pendingImages[categoryId];
    if (!file) {
      toast.error("Pick an image first.");
      return;
    }
    try {
      setUploadingId(categoryId);
      const fd = new FormData();
      // field name must match your multer config: flyerFile
      fd.append("flyerFile", file);

      const res = await axios.put(`/api/eflyer/category/${categoryId}/image`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data?.category;
      if (!updated) throw new Error("No category returned");

      const replace = (arr) => arr.map((c) => (c._id === categoryId ? updated : c));
      setFlyerData(replace);
      setFilteredData(replace);

      setPendingImages((prev) => {
        const { [categoryId]: _, ...rest } = prev;
        return rest;
      });

      toast.success("Category image updated.");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Image update failed");
    } finally {
      setUploadingId(null);
    }
  };

  const normalizedUrl = (p) =>
    p ? `${apiBase}/${String(p).replace(/\\/g, "/").replace(/^\/+/, "")}` : "";

  const CategoryImageRow = ({ cat }) => {
    const imgSrc = cat.imageUrl ? normalizedUrl(cat.imageUrl) : null;
    const pending = pendingImages[cat._id];

    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-28 h-20 bg-gray-800 border border-gray-700 rounded overflow-hidden flex items-center justify-center">
            {imgSrc ? (
              <img src={imgSrc} alt="category" className="object-cover w-full h-full" />
            ) : (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <ImagePlus size={14} /> No image
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400">
            {imgSrc ? "Current image" : "Upload an image"}
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPickImage(cat._id, e.target.files?.[0])}
            className="text-sm"
          />
          <button
            onClick={() => saveCategoryImage(cat._id)}
            disabled={uploadingId === cat._id || !pending}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
          >
            {uploadingId === cat._id ? "Uploading..." : "Save image"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="p-4 flex justify-between items-center text-white">
        <h2 className="text-xl font-semibold">E-Flyers</h2>
        <Link className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600" to="/dashboard/add-eflayer">
          Add E-Flyers
        </Link>
      </div>

      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center items-center mb-6">
          <div className="my-5 flex justify-center items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search e-flyers by title…"
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <motion.div
              className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <p className="text-gray-300 mt-3">Loading…</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center text-gray-400">
            No flyers found. Try clearing search or{" "}
            <Link className="text-blue-400 hover:underline" to="/dashboard/add-eflayer">
              add a new one
            </Link>
            .
          </div>
        ) : (
          filteredData.map((cat) => (
            <div key={cat._id} className="mb-6 border rounded-lg bg-gray-900 border-gray-700">
              {/* header */}
              <button
                onClick={() => toggleCategory(cat._id)}
                className="w-full flex justify-between items-center px-6 py-4 text-left bg-gray-800 hover:bg-gray-700 transition-all"
              >
                <h3 className="text-lg font-semibold text-white">
                  {cat.name || "Untitled Category"}
                </h3>
                <motion.div
                  animate={{ rotate: openCategories.includes(cat._id) ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="text-gray-300" />
                </motion.div>
              </button>

              {/* image editor row */}
              <CategoryImageRow cat={cat} />

              <AnimatePresence>
                {openCategories.includes(cat._id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
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
                            {/* <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                              Brochure
                            </th> */}
                            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {(cat.eflyers || []).length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-4 text-gray-400">
                                No flyers in this category yet.{" "}
                                <Link className="text-blue-400 hover:underline" to="/dashboard/add-eflayer">
                                  Add one
                                </Link>
                                .
                              </td>
                            </tr>
                          ) : (
                            (cat.eflyers || []).map((doc) => (
                              <motion.tr
                                key={doc._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <td className="py-2 text-gray-100">{doc.title}</td>
                                <td className="py-2 text-gray-300">{doc.description}</td>
                                {/* <td className="py-2">
                                  {doc.brochureUrl ? (
                                    <a
                                      href={normalizedUrl(doc.brochureUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:underline"
                                    >
                                      Download
                                    </a>
                                  ) : (
                                    <span className="text-gray-500">—</span>
                                  )}
                                </td> */}
                                <td className="py-2 text-sm text-gray-300">
                                  <Link
                                    to={`/dashboard/edit-eflayer/${doc._id}`}
                                    className="text-indigo-400 hover:text-indigo-300 mr-3"
                                  >
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
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </motion.div>
    </>
  );
};

export default GetEflyers;
