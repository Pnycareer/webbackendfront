import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const Blog = () => {
  const [formData, setFormData] = useState({
    blogName: "",
    shortDescription: "",
    urlSlug: "",
    blogCategory: "",
    blogDescription: "",
    publishDate: new Date().toISOString().split("T")[0], // ✅ today's date
    authorName: "",
    authorBio: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    pageindex: "",
    insitemap: true,
    canonical: "",
    inviewweb: true,
    showtoc: true, // ✅ Add this line
  });
  const navigate = useNavigate();
  const [blogImage, setBlogImage] = useState(null);
  const [authorProfileImage, setAuthorProfileImage] = useState(null); // ✅
  const [loading, setLoading] = useState(false);

  const categories = [
    { label: "Technology", value: "technology" },
    { label: "Marketing", value: "marketing" },
    { label: "Software", value: "software" },
    { label: "Education", value: "education" },
    {
      label: "Short Courses in Islamabad",
      value: "short-courses-in-islamabad",
    },
    {
      label: "Short Courses in Faisalabad",
      value: "short-courses-in-faisalabad",
    },
    { label: "IT Softwares", value: "it-softwares" },
    { label: "SEO", value: "seo" },
    { label: "Design", value: "design" },
    { label: "Photography", value: "photography" },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlogImageChange = (e) => {
    setBlogImage(e.target.files[0]);
  };

  const handleAuthorImageChange = (e) => {
    setAuthorProfileImage(e.target.files[0]);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   const data = new FormData();

  //   // Append all form fields
  //   Object.keys(formData).forEach((key) => {
  //     const value = formData[key];
  //     if (typeof value === "string") {
  //       data.append(key, value.trim());
  //     } else {
  //       data.append(key, value);
  //     }
  //   });

  //   if (blogImage) {
  //     data.append("blogImage", blogImage);
  //   }

  //   if (authorProfileImage) {
  //     data.append("authorProfileImage", authorProfileImage);
  //   }

  //   // Slug generation
  //   const finalSlug = formData.urlSlug
  //     .trim()
  //     .toLowerCase()
  //     .replace(/[^a-z0-9\s-]/g, "")
  //     .replace(/\s+/g, "-")
  //     .replace(/-+/g, "-");
  //   data.append("url_slug", finalSlug);

  //   try {
  //     const res = await axios.post(
  //       `${import.meta.env.VITE_API_URL}/api/blogs`,
  //       data,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     const message = res.data?.message || "Blog posted successfully!";
  //     setLoading(false);
  //     toast.success(message);
  //     navigate("/dashboard/all-blogs");

  //     // Reset form
  //     setFormData({
  //       blogName: "",
  //       shortDescription: "",
  //       blogCategory: "",
  //       blogDescription: "",
  //       publishDate: "",
  //       authorName: "",
  //       authorBio: "",
  //       tags: "",
  //       metaTitle: "",
  //       urlSlug: "",
  //       metaDescription: "",
  //       canonical: "",
  //     });
  //     setBlogImage(null);
  //     setAuthorProfileImage(null);
  //   } catch (error) {
  //     console.error(error);
  //     const message =
  //       error.response?.data?.message ||
  //       "Something went wrong while posting the blog.";
  //     setLoading(false);
  //     toast.error(message);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

    // Convert boolean-like string fields to actual booleans
    const formattedFormData = {
      ...formData,
      insitemap: formData.insitemap === "true" || formData.insitemap === true,
      inviewweb: formData.inviewweb === "true" || formData.inviewweb === true,
      pageindex: formData.pageindex === "true" || formData.pageindex === true,
      showtoc: formData.showtoc === "true" || formData.showtoc === true,
    };

    // Append all fields to FormData
    Object.keys(formattedFormData).forEach((key) => {
      const value = formattedFormData[key];
      if (typeof value === "string") {
        data.append(key, value.trim());
      } else {
        data.append(key, value);
      }
    });

    if (blogImage) {
      data.append("blogImage", blogImage);
    }

    if (authorProfileImage) {
      data.append("authorProfileImage", authorProfileImage);
    }

    // Generate slug from urlSlug field
    const finalSlug = formData.urlSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    data.set("url_slug", finalSlug); // overwrite if already added

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/blogs`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const message = res.data?.message || "Blog posted successfully!";
      setLoading(false);
      toast.success(message);
      navigate("/dashboard/all-blogs");

      // Reset form after submission
      setFormData({
        blogName: "",
        shortDescription: "",
        blogCategory: "",
        blogDescription: "",
        publishDate: new Date().toISOString().split("T")[0],
        authorName: "",
        authorBio: "",
        tags: "",
        metaTitle: "",
        urlSlug: "",
        metaDescription: "",
        canonical: "",
        pageindex: "",
        insitemap: true,
        inviewweb: true,
        showtoc: true, // ✅ Reset to default true
      });
      setBlogImage(null);
      setAuthorProfileImage(null);
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message ||
        "Something went wrong while posting the blog.";
      setLoading(false);
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto p-6 bg-gray-400">
      <h2 className="text-3xl font-bold mb-6 text-center">Create a Blog</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Blog Name */}
        <div className="flex flex-col">
          <label className="font-semibold">Blog Name</label>
          <input
            type="text"
            name="blogName"
            value={formData.blogName}
            onChange={handleChange}
            className="border p-2 rounded text-black"
            required
          />
        </div>

        {/* Short Description */}
        <div className="flex flex-col">
          <label className="font-semibold">Short Description</label>
          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            className="border p-2 rounded min-h-[52px] text-black"
            required
          />
        </div>

        {/* Blog Category */}
        <div className="flex flex-col">
          <label className="font-semibold">Blog Category</label>
          <select
            name="blogCategory"
            value={formData.blogCategory}
            onChange={handleChange}
            className="border p-2 rounded text-black"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* URL Slug */}
        <div className="flex flex-col">
          <label className="font-semibold">URL Slug</label>
          <input
            type="text"
            name="urlSlug"
            value={formData.urlSlug}
            onChange={handleChange}
            className="border p-2 rounded text-black"
            required
          />
        </div>

        {/* Blog Description */}
        <div className="flex flex-col">
          <label className="font-semibold mb-2">Blog Description</label>
          <RichTextEditor
            value={formData.blogDescription}
            onChange={(content) =>
              setFormData({ ...formData, blogDescription: content })
            }
            height="300px"
          />
        </div>

        {/* Publish Date */}
        <div className="flex flex-col">
          <label className="font-semibold">Publish Date</label>
          <input
            type="date"
            name="publishDate"
            value={formData.publishDate}
            onChange={handleChange}
            className="border p-2 rounded text-black"
          />
        </div>

        {/* Author Details */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Author Information</label>

          <input
            type="text"
            name="authorName"
            placeholder="Author Name"
            value={formData.authorName}
            onChange={handleChange}
            className="border p-2 rounded text-black"
            required
          />

          <textarea
            name="authorBio"
            placeholder="Author Bio"
            value={formData.authorBio}
            onChange={handleChange}
            className="border p-2 rounded min-h-[100px] text-black"
          />

          {/* Upload Author Profile Image */}
          <input
            type="file"
            name="authorProfileImage"
            onChange={handleAuthorImageChange}
            className="border p-2 rounded text-white"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col">
          <label className="font-semibold">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="border p-2 rounded text-black"
          />
        </div>

        {/* Meta Title */}
        <div className="flex flex-col">
          <label className="font-semibold">Meta Title</label>
          <input
            type="text"
            name="metaTitle"
            value={formData.metaTitle}
            onChange={handleChange}
            className="border p-2 rounded text-black"
            required
          />
        </div>

        {/* Meta Description */}
        <div className="flex flex-col">
          <label className="font-semibold">Meta Description</label>
          <textarea
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleChange}
            className="border p-2 rounded min-h-[80px] text-black"
            required
          />
        </div>

        {/* Blog Image Upload */}
        <div className="flex flex-col">
          <label className="font-semibold">Blog Image</label>
          <input
            type="file"
            name="blogImage"
            onChange={handleBlogImageChange}
            className="border p-2 rounded text-white"
            required
          />
        </div>

        {/* Page Index */}
        <div className="flex flex-col">
          <label className="font-semibold">Page Index</label>
          <select
            name="pageindex"
            value={formData.pageindex}
            onChange={handleChange}
            className="border p-2 rounded text-black"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* In Sitemap */}
        <div className="flex flex-col">
          <label className="font-semibold">Include in Sitemap?</label>
          <select
            name="insitemap"
            value={formData.insitemap}
            onChange={handleChange}
            className="border p-2 rounded text-black"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Canonical URL */}
        <div className="flex flex-col">
          <label className="font-semibold">Canonical URL</label>
          <input
            type="text"
            name="canonical"
            value={formData.canonical}
            onChange={handleChange}
            className="border p-2 rounded text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold">Show Table of Contents?</label>
          <select
            name="showtoc"
            value={formData.showtoc}
            onChange={handleChange}
            className="border p-2 rounded text-black"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* In View Web */}
        <div className="flex flex-col">
          <label className="font-semibold">Show on Website?</label>
          <select
            name="inviewweb"
            value={formData.inviewweb}
            onChange={handleChange}
            className="border p-2 rounded text-black"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded w-full transition-all flex items-center justify-center ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Posting...
            </>
          ) : (
            "Post Blog"
          )}
        </button>
      </form>
    </div>
  );
};

export default Blog;
