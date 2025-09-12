import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor';

export default function CreateNews() {
  const [formData, setFormData] = useState({ title: '', description: '', date: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDescriptionChange = (html) => {
    setFormData((prev) => ({ ...prev, description: html }));
  };

  // Strip tags, whitespace, &nbsp; to detect empty rich text
  const isDescriptionEmpty = (html = '') => {
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (isDescriptionEmpty(formData.description)) {
      toast.error('Description cannot be empty');
      return;
    }
    if (!formData.date) {
      toast.error('Date is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/news`,
        formData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success(res.data.message || 'News submitted successfully!');
      navigate('/dashboard/news');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit news.';
      toast.error(errorMessage);
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl backdrop-blur-lg">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">Create News</h2>

        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="block w-full mb-4 p-3 border rounded text-black"
          required
        />

         <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          className="block w-full mb-6 mt-5 p-3 border rounded text-black"
          required
        />

        {/* 👇 Replace textarea with your RichTextEditor */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-black">Description</label>
          <RichTextEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Write your news content…"
            height={300}
          />
        </div>

       

        <button
          type="submit"
          disabled={submitting}
          className={`w-full text-white mt-10 py-3 rounded ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
