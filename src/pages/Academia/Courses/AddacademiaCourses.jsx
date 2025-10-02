import React, { useState, useMemo } from "react";
// shadcn/ui imports
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
// combobox primitives
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, X } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor";
import useInstructors from "@/hooks/useInstructors";
import api from "@/utils/axios";

// tiny pill for subjects
const Pill = ({ children, onRemove }) => (
  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border">
    {children}
    <button type="button" onClick={onRemove} className="opacity-60 hover:opacity-100">
      <X className="h-3 w-3" />
    </button>
  </span>
);

const AddacademiaCourses = () => {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    coursename: "",
    slug: "",
    coursecategory: "academia",
    Course_Description: "",
    Instructor: "",
    status: "Active",
    viewOnWeb: true,
    priority: 0.9,
    In_Sitemap: false,
    Page_Index: true,
    course_Image_Alt: "",
    Short_Description: "",
    Meta_Title: "",
    Meta_Description: ""
  });

  // NEW: Subjects + FAQs state (same as Edit)
  const [subjects, setSubjects] = useState([]);     // ["maths","physics"]
  const [subjectInput, setSubjectInput] = useState("");
  const [faqs, setFaqs] = useState([]);             // [{question, answer}]

  const [courseImageFile, setCourseImageFile] = useState(null);
  const [brochureFile, setBrochureFile] = useState(null);

  // instructors
  const { instructors, loading: loadingInstructors } = useInstructors();
  const [instructorOpen, setInstructorOpen] = useState(false);
  const selectedInstructor =
    instructors?.find((i) => (i?._id || i?.id) === form.Instructor) || null;

  // helpers: subjects (parity with Edit)
  const pushSubjectsFromString = (raw) => {
    const parts = String(raw || "")
      .split(/[,\n]/)
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
    if (!parts.length) return;
    setSubjects((prev) => {
      const set = new Set(prev);
      parts.forEach((p) => set.add(p));
      return Array.from(set);
    });
  };
  const onSubjectKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (subjectInput.trim()) {
        pushSubjectsFromString(subjectInput);
        setSubjectInput("");
      }
    }
  };
  const removeSubject = (value) => setSubjects((prev) => prev.filter((s) => s !== value));

  // helpers: faqs (parity with Edit)
  const addFaq = () => setFaqs((s) => [...s, { question: "", answer: "" }]);
  const removeFaq = (idx) => setFaqs((s) => s.filter((_, i) => i !== idx));
  const updateFaq = (idx, key, value) =>
    setFaqs((s) => s.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSwitch = (name, checked) => {
    setForm((s) => ({ ...s, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!form.coursename?.trim()) {
      setMsg({ type: "error", text: "coursename is required." });
      return;
    }
    if (!form.Instructor?.trim()) {
      setMsg({ type: "error", text: "Instructor ObjectId is required." });
      return;
    }

    // Clean FAQs before sending (same as Edit)
    const faqsClean = faqs
      .map((f) => ({ question: (f.question || "").trim(), answer: (f.answer || "").trim() }))
      .filter((f) => f.question && f.answer);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") fd.append(k, v);
    });

    // NEW: send subjects & faqs as JSON strings
    fd.append("subjects", JSON.stringify(subjects || []));
    fd.append("faqs", JSON.stringify(faqsClean || []));

    if (courseImageFile) fd.append("course_Image", courseImageFile);
    if (brochureFile) fd.append("Brochure", brochureFile);

    try {
      setBusy(true);
      await api.post("/api/academia/courses", fd);
      setMsg({ type: "success", text: "Course created ✅" });

      // reset
      setForm({
        coursename: "",
        slug: "",
        coursecategory: "academia",
        Course_Description: "",
        Instructor: "",
        status: "Active",
        viewOnWeb: true,
        priority: 0,
        In_Sitemap: false,
        Page_Index: true,
        course_Image_Alt: "",
        Short_Description: "",
        Meta_Title: "",
        Meta_Description: ""
      });
      setSubjects([]);
      setSubjectInput("");
      setFaqs([]);
      setCourseImageFile(null);
      setBrochureFile(null);
    } catch (err) {
      const text =
        err?.response?.data?.message ||
        err?.message ||
        "Create failed. Check console for details.";
      setMsg({ type: "error", text });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto p-4 sm:p-6 h-screen">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add Academia Course</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            {/* coursename */}
            <div>
              <Label htmlFor="coursename">Course Name *</Label>
              <Input
                id="coursename"
                name="coursename"
                placeholder="e.g. Node.js & MongoDB Basics"
                value={form.coursename}
                onChange={onChange}
              />
            </div>

            {/* slug */}
            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="node-js-mongodb-basics"
                value={form.slug}
                onChange={onChange}
              />
            </div>

            {/* category */}
            <div>
              <Label htmlFor="coursecategory">Course Category</Label>
              <Input
                id="coursecategory"
                name="coursecategory"
                disabled
                value={form.coursecategory}
                onChange={onChange}
              />
            </div>

            {/* instructor combobox */}
            <div className="space-y-2">
              <Label>Instructor *</Label>
              <Popover open={instructorOpen} onOpenChange={setInstructorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {loadingInstructors
                      ? "Loading instructors…"
                      : selectedInstructor
                        ? (selectedInstructor.name || selectedInstructor.fullName || selectedInstructor.email || selectedInstructor._id)
                        : "Select instructor"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search instructors…" />
                    <CommandList>
                      <CommandEmpty>No results.</CommandEmpty>
                      <CommandGroup>
                        {(instructors || []).map((i) => {
                          const id = i?._id || i?.id;
                          const label = i?.name || i?.fullName || i?.email || id;
                          return (
                            <CommandItem
                              key={id}
                              value={label}
                              onSelect={() => {
                                setForm((s) => ({ ...s, Instructor: id }));
                                setInstructorOpen(false);
                              }}
                            >
                              {label}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {form.Instructor ? (
                <p className="text-xs text-muted-foreground">Selected ID: {form.Instructor}</p>
              ) : null}
            </div>

            {/* priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                name="priority"
                type="number"
                step="0.1"
                value={form.priority}
                onChange={onChange}
              />
            </div>

            {/* status */}
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((s) => ({ ...s, status: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* NEW: Subjects */}
            <div className="space-y-2">
              <Label>Subjects (press Enter or comma to add)</Label>
              <Input
                placeholder="maths, physics, computer"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={onSubjectKeyDown}
              />
              <div className="flex flex-wrap gap-2">
                {subjects.length ? subjects.map((s) => (
                  <Pill key={s} onRemove={() => removeSubject(s)}>{s}</Pill>
                )) : <p className="text-sm text-muted-foreground">No subjects yet.</p>}
              </div>
            </div>

            {/* short description rich text */}
            <div className="space-y-2">
              <Label>Short Description</Label>
              <RichTextEditor
                value={form.Short_Description}
                onChange={(html) => setForm((s) => ({ ...s, Short_Description: html }))}
                placeholder="Write a short teaser…"
                height={400}
              />
            </div>

            {/* course description rich text */}
            <div className="space-y-2">
              <Label>Course Description</Label>
              <RichTextEditor
                value={form.Course_Description}
                onChange={(html) => setForm((s) => ({ ...s, Course_Description: html }))}
                placeholder="Full course details…"
                height={400}
              />
            </div>

            {/* NEW: FAQs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>FAQs</Label>
                <Button type="button" variant="outline" onClick={addFaq}>Add FAQ</Button>
              </div>
              {faqs.length === 0 && (
                <p className="text-sm text-muted-foreground">No FAQs yet. Click “Add FAQ”.</p>
              )}
              <div className="space-y-4">
                {faqs.map((f, idx) => (
                  <div key={idx} className="rounded-2xl border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">FAQ #{idx + 1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFaq(idx)}>
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <Label>Question *</Label>
                        <Input
                          value={f.question}
                          onChange={(e) => updateFaq(idx, "question", e.target.value)}
                          placeholder="Do I need prior coding experience?"
                        />
                      </div>
                      <div>
                        <Label>Answer *</Label>
                        <Input
                          value={f.answer}
                          onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                          placeholder="No, we start from basics."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* alt / meta */}
            <div>
              <Label htmlFor="course_Image_Alt">Course Image Alt</Label>
              <Input
                id="course_Image_Alt"
                name="course_Image_Alt"
                value={form.course_Image_Alt}
                onChange={onChange}
              />
            </div>

            <div>
              <Label htmlFor="Meta_Title">Meta Title</Label>
              <Input
                id="Meta_Title"
                name="Meta_Title"
                value={form.Meta_Title}
                onChange={onChange}
              />
            </div>

            <div>
              <Label htmlFor="Meta_Description">Meta Description</Label>
              <Input
                id="Meta_Description"
                name="Meta_Description"
                value={form.Meta_Description}
                onChange={onChange}
              />
            </div>

            {/* toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border p-3">
                <div>
                  <Label className="block">View on Web</Label>
                  <p className="text-sm text-muted-foreground">Enable public visibility</p>
                </div>
                <Switch
                  checked={form.viewOnWeb}
                  onCheckedChange={(c) => onSwitch("viewOnWeb", c)}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border p-3">
                <div>
                  <Label className="block">In Sitemap</Label>
                  <p className="text-sm text-muted-foreground">Include in sitemap.xml</p>
                </div>
                <Switch
                  checked={form.In_Sitemap}
                  onCheckedChange={(c) => onSwitch("In_Sitemap", c)}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border p-3">
                <div>
                  <Label className="block">Page Index</Label>
                  <p className="text-sm text-muted-foreground">Allow search indexing</p>
                </div>
                <Switch
                  checked={form.Page_Index}
                  onCheckedChange={(c) => onSwitch("Page_Index", c)}
                />
              </div>
            </div>

            {/* files */}
            <div>
              <Label htmlFor="course_Image">Course Image (image/*)</Label>
              <Input
                id="course_Image"
                type="file"
                accept="image/*"
                onChange={(e) => setCourseImageFile(e.target.files?.[0] || null)}
              />
              {courseImageFile ? (
                <p className="text-xs text-muted-foreground break-all">
                  Selected: {courseImageFile.name}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Optional but recommended.</p>
              )}
            </div>

            <div>
              <Label htmlFor="Brochure">Brochure (PDF)</Label>
              <Input
                id="Brochure"
                type="file"
                accept="application/pdf"
                onChange={(e) => setBrochureFile(e.target.files?.[0] || null)}
              />
              {brochureFile ? (
                <p className="text-xs text-muted-foreground break-all">
                  Selected: {brochureFile.name}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Optional PDF.</p>
              )}
            </div>

            <CardFooter className="flex items-center gap-3 p-0">
              <Button type="submit" disabled={busy}>
                {busy ? "Saving..." : "Create Course"}
              </Button>
              {msg && (
                <span
                  className={
                    msg.type === "error"
                      ? "text-sm text-red-600"
                      : "text-sm text-green-600"
                  }
                >
                  {msg.text}
                </span>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddacademiaCourses;
