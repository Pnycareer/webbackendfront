import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import axios from "@/utils/axios";

export default function CategoryMetaManager() {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    category_Meta_Title: "",
    category_Meta_Description: ""
  });

  const [msg, setMsg] = useState({ type: "", text: "" });

  const selectedCategory = useMemo(() => {
    return categories.find(c => String(c._id) === String(selectedId));
  }, [categories, selectedId]);

  // 1) Load categories list
  useEffect(() => {
    let ignore = false;
    async function loadCategories() {
      setLoadingList(true);
      setMsg({ type: "", text: "" });
      try {
        // GET: /courses/getallcategories/getcategory
        const { data } = await axios.get("/courses/getallcategories/getcategory");
        if (ignore) return;

        // expecting array of { _id, category_Name, category_Description, (maybe) category_Meta_Title, category_Meta_Description }
        setCategories(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedId(String(data[0]._id));
        }
      } catch (err) {
        setMsg({ type: "error", text: err?.response?.data?.message || err.message || "Failed to load categories" });
      } finally {
        setLoadingList(false);
      }
    }
    loadCategories();
    return () => { ignore = true; };
  }, []);

  // 2) When category changes, fetch full category to prefill meta
  useEffect(() => {
    if (!selectedId) return;
    let ignore = false;

    async function loadCategory() {
      setLoadingCategory(true);
      setMsg({ type: "", text: "" });
      try {
        // GET: /courses/getoncategoryid/:id
        const { data } = await axios.get(`/courses/getoncategoryid/${selectedId}`);

        const title = (data?.category_Meta_Title || "").trim();
        const desc = (data?.category_Meta_Description || "").trim();

        if (!ignore) {
          setForm({
            category_Meta_Title: title,
            category_Meta_Description: desc
          });
        }
      } catch (err) {
        if (!ignore) {
          setForm({ category_Meta_Title: "", category_Meta_Description: "" });
          setMsg({ type: "error", text: err?.response?.data?.message || err.message || "Failed to load category" });
        }
      } finally {
        if (!ignore) setLoadingCategory(false);
      }
    }

    loadCategory();
    return () => { ignore = true; };
  }, [selectedId]);

  const onChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      setMsg({ type: "error", text: "Pick a category first." });
      return;
    }

    setSaving(true);
    setMsg({ type: "", text: "" });

    const payload = {
      category_Meta_Title: form.category_Meta_Title?.trim() || "",
      category_Meta_Description: form.category_Meta_Description?.trim() || ""
    };

    try {
      // Primary path: POST /courses/category/:id/meta
      await axios.post(`/courses/category/${selectedId}/meta`, payload);
      setMsg({ type: "success", text: "Meta saved ✅" });
    } catch (e1) {
      try {
        // Fallback: PATCH /courses/category-update/:id
        await axios.patch(`/courses/category-update/${selectedId}`, payload);
        setMsg({ type: "success", text: "Meta saved (via PATCH) ✅" });
      } catch (e2) {
        setMsg({ type: "error", text: e2?.response?.data?.message || e1?.response?.data?.message || e2.message || e1.message || "Failed to save" });
      }
    } finally {
      setSaving(false);
    }
  };

  const titleRemaining = 60 - (form.category_Meta_Title?.length || 0);
  const descRemaining = 160 - (form.category_Meta_Description?.length || 0);

  return (
    <div className="w-full flex justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Category SEO Meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selector */}
          <div className="space-y-2">
            <Label>Category</Label>
            {loadingList ? (
              <div className="text-sm text-muted-foreground">Loading categories…</div>
            ) : (
              <Select
                value={selectedId}
                onValueChange={(val) => setSelectedId(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={String(c._id)}>
                      {c.category_Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedCategory ? (
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">Selected:</span> {selectedCategory.category_Name}
              </div>
            ) : null}
          </div>

          {/* Form */}
          {loadingCategory ? (
            <div className="text-sm text-muted-foreground">Loading category…</div>
          ) : (
            <form className="space-y-6" onSubmit={onSave}>
              <div className="space-y-2">
                <Label htmlFor="category_Meta_Title">Meta Title</Label>
                <Input
                  id="category_Meta_Title"
                  name="category_Meta_Title"
                  value={form.category_Meta_Title}
                  onChange={onChange}
                  placeholder="e.g., Web Development Courses | Your Brand"
                  maxLength={120}
                />
                <div className="text-xs text-muted-foreground">
                  Aim ~50–60 chars. {titleRemaining} remaining (guideline).
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_Meta_Description">Meta Description</Label>
                <Textarea
                  id="category_Meta_Description"
                  name="category_Meta_Description"
                  value={form.category_Meta_Description}
                  onChange={onChange}
                  placeholder="Concise summary for SERP. Aim ~150–160 chars."
                  rows={5}
                  maxLength={300}
                />
                <div className="text-xs text-muted-foreground">
                  Aim ~150–160 chars. {descRemaining} remaining (guideline).
                </div>
              </div>

              {msg.text ? (
                <div className={`text-sm ${msg.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
                  {msg.text}
                </div>
              ) : null}

              <CardFooter className="px-0">
                <Button type="submit" disabled={saving || !selectedId}>
                  {saving ? "Saving…" : "Save Meta"}
                </Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
