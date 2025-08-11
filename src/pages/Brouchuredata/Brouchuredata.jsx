"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiTrash2, FiEdit } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const Brouchuredata = () => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    courseName: "",
  });

  const fetchData = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/brochure`);
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/v1/brochure/${id}`, {
      method: "DELETE",
    });
    fetchData();
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm(item);
  };

  const handleUpdate = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/v1/brochure/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditingId(null);
    setForm({ name: "", phone: "", email: "", city: "", courseName: "" });
    fetchData();
  };

  return (
    <motion.div
      className="p-6 max-w-6xl mx-auto text-white relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-black">📥 Brochure Requests</h2>

      <div className="overflow-x-auto max-h-screen overflow-y-auto rounded-xl border border-gray-700">
        <table className="min-w-full bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Course</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) =>
              editingId === item._id ? (
                <tr key={item._id} className="bg-gray-800">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={form.courseName}
                      onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                    />
                  </td>
                  <td className="px-4 py-2 text-center space-x-2 flex">
                    <button
                      onClick={handleUpdate}
                      className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-500"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 px-3 py-1 rounded text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <motion.tr
                  key={item._id}
                  className="border-t border-gray-800 hover:bg-gray-800 transition"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {item.phone}
                    <a
                      href={`https://wa.me/92${item.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:text-green-400"
                    >
                      <FaWhatsapp size={18} />
                    </a>
                  </td>
                  <td className="px-4 py-3">{item.city}</td>
                  <td className="px-4 py-3">{item.courseName}</td>
                  <td className="px-4 py-3 text-center space-x-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Brouchuredata;