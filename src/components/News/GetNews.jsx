import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";
import toast from 'react-hot-toast'

export default function GetNews() {
  const [news, setNews] = useState([]);

 useEffect(() => {
  const fetchNews = async () => {
    try {
      const res = await axios.get(`/api/v1/news`);
      setNews(res.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    }
  };

  fetchNews();
}, []);

  const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this news item?")) return;

  try {
    const res = await axios.delete(
      `/api/v1/news/${id}`
    );

    toast.success(res.data.message || "News deleted successfully.");
    setNews((prev) => prev.filter((item) => item._id !== id));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete news.";
    toast.error(errorMessage);
    console.error("Delete error:", error);
  }
};

  return (
    <>
     <div className="text-end px-6 py-4">
        <Link
          to="/dashboard/addnews"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add News
        </Link>
      </div>
   
    <div className="min-h-screen w-full px-3">
      <h1 className="text-4xl font-bold text-center mb-8">
        All News
      </h1>
     
      <div className="overflow-x-auto bg-[#111827] p-6 rounded-lg shadow-lg">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs uppercase bg-[#1f2937] text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Course
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr
                key={item._id}
                className="border-b border-gray-700 hover:bg-gray-800"
              >
                <td className="px-6 py-4 font-medium text-white">
                  {item.title}
                </td>
                <td className="px-6 py-4">{item.description}</td>
                <td className="px-6 py-4">{item.date}</td>
                <td className="px-6 py-4">
                  <span className="bg-green-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-4">
                  <Link
                    to={`/dashboard/editnews/${item._id}`}
                    className="text-blue-400 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
     </>
  );
}
