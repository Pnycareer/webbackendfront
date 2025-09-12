import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor'; // 👈 import editor

export default function EditNews() {
  const { id } = useParams();
  const [formData, setFormData] = useState({ title: '', description: '', date: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewsById = async () => {
      try {
        const res = await axios.get(`/api/v1/news/${id}`);
        setFormData(res.data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
        toast.error(error.response?.data?.message || 'Error loading news');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNewsById();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (html) => {
    setFormData((prev) => ({ ...prev, description: html }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await axios.put(`/api/v1/news/${id}`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      toast.success(res.data.message || 'News updated successfully!');
      navigate('/dashboard/news');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update news.';
      toast.error(errorMessage);
      console.error('Update error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl backdrop-blur-lg"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-black">Edit News</h2>

        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="block w-full mb-4 p-3 border rounded text-black"
          required
        />

        <input
          name="date"
          type="date"
          value={formData.date ? formData.date.substring(0, 10) : ''}
          onChange={handleChange}
          className="block w-full mb-6 p-3 border rounded text-black"
          required
        />


        <div className="mb-6">
          <label className="block mb-2 font-medium text-black">Description</label>
          <RichTextEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Edit your news content…"
            height={300}
          />
        </div>

        
        <button
          type="submit"
          disabled={submitting}
          className={`w-full text-white mt-10 py-3 rounded ${
            submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {submitting ? 'Updating…' : 'Update'}
        </button>
      </form>
    </div>
  );
}
