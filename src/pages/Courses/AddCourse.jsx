"use client";

import { useState , useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form"; // ✅ add this

import Field from "@/components/form/Field.jsx";
import SelectField from "@/components/form/SelectField.jsx";
import FileField from "@/components/form/FileField.jsx";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import useCourses from "@/hooks/useCourses";
import useCategories from "@/hooks/useCategories";
import useInstructors from "@/hooks/useInstructors";
import { cityOptions, shortcourseOptions } from "@/components/Data/Data";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor";


export default function AddCourse() {
  const { enqueueSnackbar } = useSnackbar();
  const { categories } = useCategories();
  const { instructors } = useInstructors();
  const { addCourse } = useCourses();

  const [courseType, setCourseType] = useState("main");
  const [courseDescription, setCourseDescription] = useState("");
  const [selectedCourseImage, setSelectedCourseImage] = useState(null);
  const [selectedBrochure, setSelectedBrochure] = useState(null);
  const [brochureError, setBrochureError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      bootcamp: "false",
      course_Name: "",
      url_Slug: "",
      video_Id: "",
      course_Category: "",
      category_Description: "",
      Skill_Level: "",
      instructor: "",
      Monthly_Fee: undefined,
      Admission_Fee: undefined,
      Duration_Months: undefined,
      Duration_Day: undefined,
      Status: "Active",
      showtoc: "no",
      View_On_Web: "yes",
      In_Sitemap: "yes",
      priority: undefined,
      Page_Index: "yes",
      Short_Description: "",
      Meta_Title: "",
      Meta_Description: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    if (!courseDescription) {
      enqueueSnackbar("Course Description is required", { variant: "error" });
      return;
    }

    if (courseType === "main" && !selectedBrochure) {
      enqueueSnackbar("Please attach the brochure PDF", { variant: "error" });
      return;
    }

    if (!selectedCourseImage) {
      enqueueSnackbar("Please attach the course image", { variant: "error" });
      return;
    }

    // 🛠️ Strip out unused fields for city/short course
    if (courseType !== "main") {
      delete data.Monthly_Fee;
      delete data.Admission_Fee;
      delete data.Duration_Months;
      delete data.Duration_Day;
    }

    const ok = await addCourse({
      data,
      courseDescription,
      courseImage: selectedCourseImage,
      brochure: selectedBrochure,
      setIsSubmitting,
    });

    if (ok) {
      form.reset();
      setCourseDescription("");
      setSelectedCourseImage(null);
      setSelectedBrochure(null);
    }
  };

  const categoryItems =
    courseType === "main"
      ? (categories || []).map((c) => ({
          value: c.url_Slug,
          label: c.Category_Name,
        }))
      : courseType === "city"
      ? (cityOptions || []).map((city) => ({
          value: city,
          label: city.charAt(0).toUpperCase() + city.slice(1),
        }))
      : (shortcourseOptions || []).map((opt) => ({
          value: opt,
          label: opt
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        }));

  const instructorItems = (instructors || []).map((i) => ({
    value: i._id,
    label: i.name,
  }));


  

  return (
    <>
      <div className="p-4">
       

        <Card className="border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-gray-100 text-center tracking-tight">
              Add Course
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-2">
            {/* Course type toggle */}
            <div className="space-y-2 mb-6">
              <Label className="text-gray-200">Select Course Type*</Label>
              <div className="grid grid-cols-3 gap-2">
                {["main", "city", "short"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCourseType(v)}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-medium transition border",
                      courseType === v
                        ? "bg-white/30 text-white border-white/20"
                        : "bg-white/[0.04] text-gray-300 hover:bg-white/[0.06] border-white/10",
                    ].join(" ")}
                  >
                    {v === "main"
                      ? "Main Course"
                      : v === "city"
                      ? "City Course"
                      : "Short Course"}
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ wrap your form with shadcn's <Form> to provide RHF context */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <SelectField
                  control={form.control}
                  name="bootcamp"
                  label="Is Bootcamp?*"
                  rules={{ required: "Required" }}
                  items={[
                    { value: "false", label: "No" },
                    { value: "true", label: "Yes" },
                  ]}
                />

                <Field
                  control={form.control}
                  name="course_Name"
                  label="Course Name*"
                  placeholder="Enter course name"
                  rules={{ required: "Course Name is required" }}
                />

                <Field
                  control={form.control}
                  name="url_Slug"
                  label="URL Slug*"
                  placeholder="enter-course-slug"
                  rules={{ required: "URL Slug is required" }}
                />

                {courseType === "main" && (
                  <Field
                    control={form.control}
                    name="video_Id"
                    label="Video ID*"
                    placeholder="YouTube/Vimeo ID"
                    rules={{ required: "Video ID is required" }}
                  />
                )}

                <SelectField
                  control={form.control}
                  name="course_Category"
                  label="Course Category*"
                  rules={{ required: "Course Category is required" }}
                  items={categoryItems}
                />

                <Field
                  control={form.control}
                  name="category_Description"
                  label="Category Description (Optional)"
                  placeholder="Enter description for the category"
                />

                {courseType === "main" && (
                  <SelectField
                    control={form.control}
                    name="Skill_Level"
                    label="Skill Level*"
                    rules={{ required: "Skill Level is required" }}
                    items={[
                      { value: "Beginner", label: "Beginner" },
                      { value: "Intermediate", label: "Intermediate" },
                      { value: "Advanced", label: "Advanced" },
                      { value: "all", label: "Appropriate for All" },
                    ]}
                  />
                )}

                <SelectField
                  control={form.control}
                  name="instructor"
                  label="Instructor*"
                  rules={{ required: "Instructor is required" }}
                  items={instructorItems}
                />

                {courseType === "main" && (
                  <>
                    <Field
                      control={form.control}
                      name="Monthly_Fee"
                      label="Monthly Fee*"
                      placeholder="Enter monthly fee"
                      type="number"
                      rules={{ required: "Monthly Fee is required" }}
                      transformValue={(e) => ({
                        target: {
                          value:
                            e.target.value === "" ? undefined : +e.target.value,
                        },
                      })}
                    />
                    <Field
                      control={form.control}
                      name="Admission_Fee"
                      label="Admission Fee*"
                      placeholder="Enter admission fee"
                      type="number"
                      rules={{ required: "Admission Fee is required" }}
                      transformValue={(e) => ({
                        target: {
                          value:
                            e.target.value === "" ? undefined : +e.target.value,
                        },
                      })}
                    />
                    <Field
                      control={form.control}
                      name="Duration_Months"
                      label="Duration Months*"
                      placeholder="Enter duration in months"
                      type="number"
                      rules={{ required: "Duration in Months is required" }}
                      transformValue={(e) => ({
                        target: {
                          value:
                            e.target.value === "" ? undefined : +e.target.value,
                        },
                      })}
                    />
                    <Field
                      control={form.control}
                      name="Duration_Day"
                      label="Duration Days*"
                      placeholder="Enter duration in days"
                      type="number"
                      rules={{ required: "Duration in Days is required" }}
                      transformValue={(e) => ({
                        target: {
                          value:
                            e.target.value === "" ? undefined : +e.target.value,
                        },
                      })}
                    />

                    <FileField
                      label="Brochure (PDF Only)*"
                      accept=".pdf"
                      required
                      error={brochureError}
                      onChange={(file) => {
                        if (file && file.type !== "application/pdf") {
                          setBrochureError("Only PDF files are allowed");
                          setSelectedBrochure(null);
                        } else {
                          setBrochureError("");
                          setSelectedBrochure(file);
                        }
                      }}
                    />
                  </>
                )}

                <SelectField
                  control={form.control}
                  name="Status"
                  label="Status*"
                  rules={{ required: "Status is required" }}
                  items={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                />

                <SelectField
                  control={form.control}
                  name="showtoc"
                  label="Show table of content?*"
                  rules={{ required: "Selection is required" }}
                  items={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                />

                <SelectField
                  control={form.control}
                  name="View_On_Web"
                  label="Is View on Web?*"
                  rules={{ required: "Selection is required" }}
                  items={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />

                <SelectField
                  control={form.control}
                  name="In_Sitemap"
                  label="In Sitemap?*"
                  rules={{ required: "Selection is required" }}
                  items={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />

                <Field
                  control={form.control}
                  name="priority"
                  label="Priority"
                  placeholder="0.0 to 0.9"
                  type="number"
                  transformValue={(e) => ({
                    target: {
                      value:
                        e.target.value === "" ? undefined : +e.target.value,
                    },
                  })}
                />

                <SelectField
                  control={form.control}
                  name="Page_Index"
                  label="Page Index?*"
                  rules={{ required: "Selection is required" }}
                  items={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />

                {/* Course Image */}
                <FileField
                  label="Course Image*"
                  accept="image/*"
                  required
                  onChange={(file) => setSelectedCourseImage(file)}
                />

                {/* Short Description */}
                <Field
                  control={form.control}
                  name="Short_Description"
                  label="Short Description*"
                  placeholder="Enter short description"
                  rules={{ required: "Short Description is required" }}
                  textarea
                />

                {/* Course Description */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Course Description*</Label>
                  <div className="rounded-md overflow-hidden bg-white/10 text-black">
                    <RichTextEditor
                      value={courseDescription || ""}
                      onChange={setCourseDescription}
                    />
                  </div>
                  {form.formState.isSubmitted && !courseDescription && (
                    <p className="text-sm text-red-500">
                      Course Description is required
                    </p>
                  )}
                </div>

                {/* Meta */}
                <Field
                  control={form.control}
                  name="Meta_Title"
                  label="Meta Title*"
                  placeholder="Enter meta title"
                  rules={{ required: "Meta Title is required" }}
                />
                <Field
                  control={form.control}
                  name="Meta_Description"
                  label="Meta Description*"
                  placeholder="Enter meta description"
                  rules={{ required: "Meta Description is required" }}
                  textarea
                />

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="gap-2"
                    disabled={isSubmitting || !courseDescription}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Add Course"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
