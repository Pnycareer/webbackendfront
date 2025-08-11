import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';

const EditEflyers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eflyer, setEflyer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brochure: null,
  });

  // Fetch existing eflyer
  useEffect(() => {
    const fetchEflyer = async () => {
      try {
        const res = await axios.get(`/api/eflyer/getonid/${id}`);
        setEflyer(res.data.eflyer);
        setFormData({
          title: res.data.eflyer.title || '',
          description: res.data.eflyer.description || '',
          brochure: null,
        });
      } catch (err) {
        toast.error('Failed to load eflyer');
      }
    };

    fetchEflyer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.brochure) {
      data.append('Brochure', formData.brochure);
    }

    try {
      await axios.put(`http://localhost:8080/api/eflyer/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Eflyer updated');
      navigate('/dashboard/eflayer'); // or back to dashboard
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  if (!eflyer) return <p>Loading eflyer...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Eflyer</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="border p-2 rounded"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 rounded"
          rows={4}
          required
        />
        <div>
          <label className="block mb-1">Replace Brochure (optional):</label>
          <input type="file" name="brochure" onChange={handleChange} />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditEflyers;
