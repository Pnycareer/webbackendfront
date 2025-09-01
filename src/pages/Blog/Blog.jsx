"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "@/utils/axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

import Field from "@/components/form/Field";
import SelectField from "@/components/form/SelectField";
import FileField from "@/components/form/FileField";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor";

const categories = [
  { label: "Technology", value: "technology" },
  { label: "Marketing", value: "marketing" },
  { label: "Software", value: "software" },
  { label: "Education", value: "education" },
  { label: "Business", value: "business" },
  { label: "Short Courses in Islamabad", value: "short-courses-in-islamabad" },
  { label: "Short Courses in Faisalabad", value: "short-courses-in-faisalabad" },
  { label: "IT Softwares", value: "it-softwares" },
  { label: "SEO", value: "seo" },
  { label: "Design", value: "design" },
  { label: "Photography", value: "photography" },
];

export default function BlogForm() {
  const navigate = useNavigate();

  const [blogImage, setBlogImage] = useState(null);
  const [authorProfileImage, setAuthorProfileImage] = useState(null);
  const [blogDescription, setBlogDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      blogName: "",
      shortDescription: "",
      urlSlug: "",
      blogCategory: "",
      publishDate: new Date().toISOString().split("T")[0],
      authorName: "",
      authorBio: "",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      pageindex: "true",
      insitemap: "true",
      inviewweb: "true",
      showtoc: "true",
    },
  });

  const onSubmit = async (formData) => {
    if (!blogDescription) {
      toast.error("Blog description is required");
      return;
    }
    if (!blogImage) {
      toast.error("Please upload a blog image");
      return;
    }

    const data = new FormData();

    const finalSlug = formData.urlSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    Object.entries({ ...formData, blogDescription, url_slug: finalSlug }).forEach(
      ([key, value]) => {
        data.append(key, value);
      }
    );

    data.append("blogImage", blogImage);
    if (authorProfileImage) data.append("authorProfileImage", authorProfileImage);

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/blogs`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(res.data?.message || "Blog posted!");
      navigate("/dashboard/all-blogs");
    } catch (err) {
      console.error(err);
      toast.error("Failed to post blog.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <Card className="border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl text-gray-100 text-center tracking-tight">
            Post a Blog
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Field control={form.control} name="blogName" label="Blog Name*" placeholder="Enter blog title" rules={{ required: true }} />

              <Field control={form.control} name="shortDescription" label="Short Description*" textarea placeholder="Short intro..." rules={{ required: true }} />

              <SelectField control={form.control} name="blogCategory" label="Blog Category*" rules={{ required: true }} items={categories} />

              <Field control={form.control} name="urlSlug" label="URL Slug*" placeholder="url-friendly-slug" rules={{ required: true }} />

              <Field control={form.control} name="publishDate" label="Publish Date" type="date" />

              <Field control={form.control} name="authorName" label="Author Name*" placeholder="Author full name" rules={{ required: true }} />

              <Field control={form.control} name="authorBio" label="Author Bio" textarea placeholder="Author short bio" />

              <FileField label="Author Profile Image" accept="image/*" onChange={(file) => setAuthorProfileImage(file)} />

              <Field control={form.control} name="tags" label="Tags" placeholder="comma,separated,tags" />

              <Field control={form.control} name="metaTitle" label="Meta Title*" placeholder="SEO title" rules={{ required: true }} />

              <Field control={form.control} name="metaDescription" label="Meta Description*" textarea placeholder="SEO description" rules={{ required: true }} />

              <FileField label="Blog Image*" accept="image/*" required onChange={(file) => setBlogImage(file)} />

              <SelectField control={form.control} name="pageindex" label="Page Index?" items={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />

              <SelectField control={form.control} name="insitemap" label="Include in Sitemap?" items={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />

              <SelectField control={form.control} name="showtoc" label="Show Table of Contents?" items={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />

              <SelectField control={form.control} name="inviewweb" label="Show on Website?" items={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />

              <div className="space-y-2">
                <Label className="text-gray-200">Blog Description*</Label>
                <div className="rounded-md overflow-hidden bg-white/10 text-black">
                  <RichTextEditor value={blogDescription} onChange={setBlogDescription} height="300px" />
                </div>
                {form.formState.isSubmitted && !blogDescription && (
                  <p className="text-sm text-red-500">Blog Description is required</p>
                )}
              </div>

              <div className="flex justify-center">
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Post Blog"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
