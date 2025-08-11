import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';

export default function CreateNews() {
  const [formData, setFormData] = useState({ title: '', description: '', date: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/news`,
      formData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    toast.success(res.data.message || 'News submitted successfully!');
    navigate('/dashboard/news');
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || 'Failed to submit news.';
    toast.error(errorMessage);
    console.error('Submission error:', error);
  }
};

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md backdrop-blur-lg">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">Create News</h2>
        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
          className="block w-full mb-4 p-3 border rounded text-black"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="block w-full mb-4 p-3 border rounded text-black"
          required
        />
        <input
          name="date"
          type="date"
          onChange={handleChange}
          className="block w-full mb-4 p-3 border rounded text-black"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600">
          Submit
        </button>
      </form>
    </div>
  );
}
