// src/schemas/courseSchema.js
import { z } from "zod";

export const courseSchema = z.object({
  bootcamp: z.enum(["true", "false"]),
  course_Name: z.string().min(1, "Course Name is required"),
  url_Slug: z.string().min(1, "URL Slug is required"),

  video_Id: z
    .string()
    .min(1, "Video ID is required")
    .optional()
    .or(z.literal("")),

  course_Category: z.string().min(1, "Course Category is required"),
  category_Description: z.string().optional(),

  Skill_Level: z
    .enum(["Beginner", "Intermediate", "Advanced", "all"])
    .optional(),

  instructor: z.string().min(1, "Instructor is required"),

  Monthly_Fee: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), { message: "Monthly Fee is required" })
    .optional(),

  Admission_Fee: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), { message: "Admission Fee is required" })
    .optional(),

  Duration_Months: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), { message: "Duration Months is required" })
    .optional(),

  Duration_Day: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), { message: "Duration Days is required" })
    .optional(),

  Brochure: z.any().optional(),

  Status: z.enum(["Active", "Inactive"]),
  showtoc: z.enum(["yes", "no"]),
  View_On_Web: z.enum(["yes", "no"]),
  In_Sitemap: z.enum(["yes", "no"]),
  Page_Index: z.enum(["yes", "no"]),
  priority: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : parseFloat(val))),

  course_Image: z.any(),
  Short_Description: z.string().min(1, "Short Description is required"),
  Meta_Title: z.string().min(1, "Meta Title is required"),
  Meta_Description: z.string().min(1, "Meta Description is required"),
});
