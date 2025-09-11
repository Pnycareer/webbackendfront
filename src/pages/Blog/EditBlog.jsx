import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor";

const categories = [
  { label: "Technology", value: "technology" },
  { label: "Marketing", value: "marketing" },
  { label: "Business", value: "business" },
  { label: "Software", value: "software" },
  { label: "Education", value: "education" },
  { label: "Short Courses in Islamabad", value: "short-courses-in-islamabad" },
  {
    label: "Short Courses in Faisalabad",
    value: "short-courses-in-faisalabad",
  },
  { label: "IT Softwares", value: "it-softwares" },
  { label: "SEO", value: "seo" },
  { label: "Design", value: "design" },
  { label: "Photography", value: "photography" },
];

const EditBlog = () => {
  const { id } = useParams(); // 👈 Get ID from URL
  const [formData, setFormData] = useState({
    blogName: "",
    shortDescription: "",
    urlSlug: "",
    blogCategory: "",
    blogDescription: "",
    publishDate: "",
    authorName: "",
    authorBio: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    pageindex: "",
    insitemap: true,
    canonical: "",
    inviewweb: true,
    showtoc: true, // ✅ Add this
    blogImageAlt: "",
  });

  const [blogImage, setBlogImage] = useState(null);
  const [blogDescription, setBlogDescription] = useState("");
  const [authorProfileImage, setAuthorProfileImage] = useState(null);
  const [socialLinks, setSocialLinks] = useState([{ platform: "", url: "" }]);
  const navigate = useNavigate();

  const fetchBlogData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/blogs/${id}`
      );
      const blog = res.data;

      console.log(blog.blogName, "rahilblog");
      // setCh(blog.blogName)

      setFormData({
        blogName: blog.blogName || "",
        shortDescription: blog.shortDescription || "",
        urlSlug: blog.url_slug || "",
        blogCategory: blog.blogCategory || "",
        // blogDescription: blog.blogDescription || "",
        publishDate: blog.publishDate ? blog.publishDate.split("T")[0] : "",
        authorName: blog.author?.name || "",
        authorBio: blog.author?.bio || "",
        tags: blog.tags ? blog.tags.join(", ") : "",
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        pageindex: blog.pageindex,
        insitemap: blog.insitemap,
        canonical: blog.canonical || "",
        inviewweb: blog.inviewweb,
        showtoc: blog.showtoc, // ✅ Add this
        blogImageAlt: blog.blogImageAlt || "",
      });
      setBlogDescription(blog.blogDescription || "");

      if (blog.socialLinks) {
        const socialArray = Object.entries(blog.socialLinks).map(
          ([platform, url]) => ({
            platform,
            url,
          })
        );
        setSocialLinks(socialArray);
      }
    } catch (error) {
      console.error("Failed to fetch blog:", error);
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlogImageChange = (e) => {
    setBlogImage(e.target.files[0]);
  };

  const handleAuthorImageChange = (e) => {
    setAuthorProfileImage(e.target.files[0]);
  };

  const handleSocialLinkChange = (index, field, value) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index][field] = value;
    setSocialLinks(updatedLinks);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const data = new FormData();

  //   // Append all fields
  //   Object.keys(formData).forEach((key) => {
  //     let fieldName = key;
  //     const value = formData[key];

  //     if (key === "urlSlug") {
  //       const finalSlug = value
  //         .trim()
  //         .toLowerCase()
  //         .replace(/[^a-z0-9\s-]/g, "")
  //         .replace(/\s+/g, "-")
  //         .replace(/-+/g, "-");
  //       data.append("url_slug", finalSlug);
  //     } else if (typeof value === "string") {
  //       data.append(fieldName, value.trim());
  //     } else {
  //       data.append(fieldName, value);
  //     }
  //   });

  //   if (blogImage) {
  //     data.append("blogImage", blogImage);
  //   }

  //   if (authorProfileImage) {
  //     data.append("authorProfileImage", authorProfileImage);
  //   }

  //   data.append("newCategory", formData.blogCategory);
  //   data.append("blogDescription", blogDescription.trim());
  //   const socialLinksObject = {};
  //   socialLinks.forEach(({ platform, url }) => {
  //     if (platform && url) {
  //       socialLinksObject[platform.trim()] = url.trim();
  //     }
  //   });
  //   data.append("socialLinks", JSON.stringify(socialLinksObject));

  //   try {
  //     const res = await axios.put(
  //       `${import.meta.env.VITE_API_URL}/api/blogs/${id}`,
  //       data,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       }
  //     );

  //     toast.success(res.data?.message || "Blog updated successfully!");
  //     navigate("/dashboard/all-blogs");
  //   } catch (error) {
  //     console.error("Failed to update blog:", error);
  //     const message =
  //       error.response?.data?.message ||
  //       "Something went wrong while updating the blog.";
  //     toast.error(message);
  //   }
  // };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData();

  // Convert boolean-like fields from strings to actual booleans
  const boolKeys = ["showtoc", "inviewweb", "insitemap", "pageindex"];
  const formattedFormData = { ...formData };
  boolKeys.forEach((key) => {
    formattedFormData[key] =
      formattedFormData[key] === "true" || formattedFormData[key] === true;
  });

  // ✅ sanitize / fallback blog image alt
  const safeAlt =
    (formattedFormData.blogImageAlt || "").trim() ||
    `${formattedFormData.blogName || "Blog"} image`;
  formattedFormData.blogImageAlt = safeAlt.slice(0, 150);

  // Append all fields
  Object.keys(formattedFormData).forEach((key) => {
    const value = formattedFormData[key];

    if (key === "urlSlug") {
      const finalSlug = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      data.append("url_slug", finalSlug);
    } else if (typeof value === "string") {
      data.append(key, value.trim());
    } else {
      data.append(key, value);
    }
  });

  // Be explicit about the alt (overrides in case it was appended above)
  data.set("blogImageAlt", formattedFormData.blogImageAlt);

  // Files
  if (blogImage) data.append("blogImage", blogImage);
  if (authorProfileImage) data.append("authorProfileImage", authorProfileImage);

  // Rich text body
  data.append("blogDescription", (blogDescription || "").trim());

  // Category change tracking
  data.append("newCategory", formData.blogCategory);

  // Social links
  const socialLinksObject = {};
  socialLinks.forEach(({ platform, url }) => {
    if (platform && url) {
      socialLinksObject[String(platform).trim()] = String(url).trim();
    }
  });
  data.append("socialLinks", JSON.stringify(socialLinksObject));

  try {
    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/blogs/${id}`,
      data,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    toast.success(res.data?.message || "Blog updated successfully!");
    navigate("/dashboard/all-blogs");
  } catch (error) {
    console.error("Failed to update blog:", error);
    const message =
      error.response?.data?.message ||
      "Something went wrong while updating the blog.";
    toast.error(message);
  }
};



  return (
    <div className="w-full mx-auto p-6 overflow-y-auto min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center">Edit Blog</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Form fields same as your Blog post form */}

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
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

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
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Blog Description</label>
          <RichTextEditor
            className="bg-white"
            value={blogDescription}
            onChange={setBlogDescription}
            height={300}
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

        {/* Social Links */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Social Links</label>

          {socialLinks.map((link, index) => (
            <div key={index} className="flex gap-3">
              <select
                value={link.platform}
                onChange={(e) =>
                  handleSocialLinkChange(index, "platform", e.target.value)
                }
                className="border p-2 rounded flex-1 text-black"
              >
                <option value="">Select Platform</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="website">Website</option>
              </select>

              <input
                type="text"
                placeholder="URL"
                value={link.url}
                onChange={(e) =>
                  handleSocialLinkChange(index, "url", e.target.value)
                }
                className="border p-2 rounded flex-1 text-black"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addSocialLink}
            className="mt-2 text-blue-600 hover:underline self-start"
          >
            + Add More
          </button>
        </div>

        {/* Blog Image Upload */}
        <div className="flex flex-col">
          <label className="font-semibold">Blog Image</label>
          <input
            type="file"
            name="blogImage"
            onChange={handleBlogImageChange}
            className="border p-2 rounded text-white"
          />
        </div>

        {/* Blog Image Alt */}
        <div className="flex flex-col">
          <label className="font-semibold">Image Alt Text</label>
          <input
            type="text"
            name="blogImageAlt"
            value={formData.blogImageAlt}
            onChange={handleChange}
            placeholder={`Alt for ${formData.blogName || "blog image"}`}
            className="border p-2 rounded text-black"
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
            value={String(formData.showtoc)} // ✅ force boolean to string
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
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Update Blog
        </button>
      </form>
    </div>
  );
};

export default EditBlog;
