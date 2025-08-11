import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [roleUpdated, setRoleUpdated] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      await axios.put(`/api/users/${userId}`, { role: newRole });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      setRoleUpdated(userId);
      setTimeout(() => setRoleUpdated(null), 1500); // Clear after feedback
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const res = await axios.put(`/api/users/block/${userId}`);
      const { blocked } = res.data.user;
      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? { ...user, blocked } : user))
      );
    } catch (err) {
      console.error("Error toggling block status:", err);
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">All Users</h2>
        <Link
          to="/dashboard/register"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add User
        </Link>
      </div>
      <div className="bg-white border-l-4 border-blue-600 rounded p-4 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-2 text-blue-700">
          🧑‍💼 Role Permissions Breakdown:
        </h3>
        <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
          <li>
            <strong>superadmin</strong>: Has full control — can add, edit,
            delete, block/unblock users.
          </li>
          <li>
            <strong>admin</strong>: Can post content, but{" "}
            <span className="text-red-500 font-semibold">
              cannot delete or update
            </span>{" "}
            users.
          </li>
          <li>
            <strong>modifier</strong>: Trusted role —{" "}
            <span className="text-green-600 font-semibold">
              can delete and edit
            </span>
            , but not as powerful as superadmin.
          </li>
          <li>
            <strong>csr</strong>: Can only access <em>Brouchure Data</em>{" "}
            section — nothing else.
          </li>
        </ul>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-2 px-4">Name</th>
              <th className="text-left py-2 px-4">Email</th>
              <th className="text-left py-2 px-4">Contact</th>
              <th className="text-left py-2 px-4">Role</th>
              <th className="text-left py-2 px-4">Blocked</th>
              <th className="text-left py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user._id}
                  className={`border-t ${user.blocked ? "bg-red-50" : ""}`}
                >
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.contact}</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role || ""}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        disabled={updating === user._id}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">None</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="modifier">Modifier</option>
                        <option value="csr">CSR</option>
                      </select>
                      {updating === user._id ? (
                        <span className="text-blue-500 text-sm animate-pulse">
                          Updating...
                        </span>
                      ) : roleUpdated === user._id ? (
                        <span className="text-green-600 text-sm">✓</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    {user.blocked ? (
                      <span className="text-red-600 font-medium">Blocked</span>
                    ) : (
                      <span className="text-green-600 font-medium">Active</span>
                    )}
                  </td>
                  <td className="py-2 px-4 flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggleBlock(user._id)}
                      className={`px-3 py-1 rounded text-white text-sm ${
                        user.blocked
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      {user.blocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUsers;
