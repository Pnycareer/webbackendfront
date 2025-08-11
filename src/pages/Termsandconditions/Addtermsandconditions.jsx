import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Gettermsandcondition = () => {
  const [terms, setTerms] = useState([]);
  const [error, setError] = useState('');
  const [editingTerm, setEditingTerm] = useState(null);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/terms`);
      setTerms(res.data);
    } catch (err) {
      setError('Failed to fetch terms and conditions');
    }
  };

  const handleEditClick = (term) => {
    setEditingTerm({ ...term }); // make a copy to edit
  };

  const handleSave = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/terms/${editingTerm._id}`, editingTerm);
      setEditingTerm(null);
      fetchTerms();
    } catch (err) {
      setError('Failed to update term');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingTerm((prev) => ({ ...prev, [name]: value }));
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white mx-auto overflow-y-auto">
      <div className="w-full">
        <h2 className="text-3xl font-bold mb-8 text-center">Terms and Conditions</h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <div className="overflow-auto rounded-lg shadow-lg">
          <table className="w-full bg-gray-800 text-sm text-left">
            <thead className="bg-indigo-700 text-white">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Meta Title</th>
                <th className="px-4 py-3">Meta Description</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term, i) => (
                <motion.tr
                  key={term._id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                  className="border-b border-gray-700 hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-3 font-medium text-indigo-300">{term.page_title}</td>
                  <td className="px-4 py-3">{term.page_slug}</td>
                  <td className="px-4 py-3">{term.meta_title || '—'}</td>
                  <td className="px-4 py-3">{term.meta_description || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEditClick(term)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingTerm && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold mb-4 text-white">Edit Term</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <label className="text-sm">Page Title</label>
                <input
                  name="page_title"
                  value={editingTerm.page_title}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded text-black"
                />
              </div> */}
              {/* <div>
                <label className="text-sm">Page Slug</label>
                <input
                  name="page_slug"
                  value={editingTerm.page_slug}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded text-black"
                />
              </div> */}
              {/* <div>
                <label className="text-sm">Page Image URL</label>
                <input
                  name="page_image"
                  value={editingTerm.page_image}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded text-black"
                />
              </div> */}
              <div>
                <label className="text-sm">Short description</label>
                <input
                  name="shortdescription"
                  value={editingTerm.shortdescription}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded text-black"
                />
              </div>
              <div>
                <label className="text-sm">Meta Title</label>
                <input
                  name="meta_title"
                  value={editingTerm.meta_title}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded text-black"
                />
              </div>
              <div>
                <label className="text-sm">Meta Description</label>
                <input
                  name="meta_description"
                  value={editingTerm.meta_description}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded text-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm">Page Description</label>
                <ReactQuill
                  value={editingTerm.page_description}
                  onChange={(val) =>
                    setEditingTerm((prev) => ({ ...prev, page_description: val }))
                  }
                  className="bg-white mt-2 rounded text-black"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditingTerm(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gettermsandcondition;
