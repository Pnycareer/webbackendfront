import { useState, useEffect } from "react";
import axios from "../../utils/axios";

const Eflayer = () => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    flyerFile: null,
    brochure: null,
  });

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch categories on page load
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `/api/v1/categories`
      );

      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  fetchCategories();
}, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("name", formData.name); // Category name

      const eflyerObj = [
        {
          title: formData.title,
          description: formData.description,
        },
      ];

      data.append("eflyers", JSON.stringify(eflyerObj));

      if (formData.flyerFile) {
        data.append("flyerFile", formData.flyerFile);
      }

      if (formData.brochure) {
        data.append("Brochure", formData.brochure);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/eflyer`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Something went wrong!");
      }

      const result = await res.json();
      console.log(result);
      setMessage("Eflyer uploaded successfully!");
      setFormData({
        name: "",
        title: "",
        description: "",
        flyerFile: null,
        brochure: null,
      });
    } catch (error) {
      console.error(error);
      setMessage("Failed to upload Eflyer.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Upload New Eflyer</h1>

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        encType="multipart/form-data"
      >
        <div>
          <label className="block mb-2 font-semibold">Select Category:</label>
          <select
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded text-black"
          >
            <option value="">-- Select a Category --</option>
            {categories.map((category) => (
              <option key={category._id} value={category.Category_Name}>
                {category.Category_Name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Flyer Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded text-black"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Flyer Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded text-black"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Flyer Image:</label>
          <input
            type="file"
            name="flyerFile"
            accept="image/*"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded text-black"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Flyer Brochure (PDF):
          </label>
          <input
            type="file"
            name="brochure"
            accept="application/pdf"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded text-black"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
        >
          Upload Eflyer
        </button>
      </form>
    </div>
  );
};

export default Eflayer;
