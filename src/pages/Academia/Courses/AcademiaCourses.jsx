import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/utils/axios";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AcademiaCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all"); // "all" | "academia" | "corporate trainings"
  const [typing, setTyping] = useState(false);

  // delete dialog
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // debounce helper
  const debouncedSearch = useMemo(() => {
    let timer;
    return (val, cb) => {
      setTyping(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setTyping(false);
        cb(val);
      }, 350);
    };
  }, []);

  // fetch from API
  async function loadCourses({ q, category }) {
    try {
      setLoading(true);
      const res = await api.get("/api/academia/courses", {
        params: {
          q: q || undefined,
          category: category === "all" ? undefined : category,
        },
      });
      setCourses(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to load courses", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    loadCourses({ q: "", category: "all" });
  }, []);

  // search watcher
  useEffect(() => {
    debouncedSearch(search, (value) => {
      loadCourses({ q: value, category });
    });
  }, [search]);

  // category watcher
  useEffect(() => {
    loadCourses({ q: search, category });
  }, [category]);

  const confirmDelete = (course) => {
    setTarget(course);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!target?._id) return;
    try {
      setDeleting(true);
      await api.delete(`/api/academia/courses/${encodeURIComponent(target._id)}`);
      setCourses((prev) => prev.filter((c) => c._id !== target._id));
      setOpen(false);
      setTarget(null);
    } catch (err) {
      console.error("Delete failed", err?.response?.data || err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* 🔍 Toolbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="w-full sm:w-72 bg-white">
              <Input
                placeholder="Search courses…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <Select value={category} onValueChange={(v) => setCategory(v)}>
              <SelectTrigger className="w-full sm:w-56 bg-white">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="academia">Academia</SelectItem>
                <SelectItem value="corporate trainings">
                  Corporate Trainings
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add button */}
          <Link to="/dashboard/add-academia-courses">
            <button className="bg-blue-600 hover:bg-blue-500 text-white hidden sm:block font-semibold py-2 px-4 rounded-lg transition-all duration-300">
              Add Academia Courses
            </button>
          </Link>
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          {typing
            ? "Searching…"
            : loading
            ? "Loading…"
            : `${courses.length} result(s)`}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Academia Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="p-4">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>View</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length ? (
                    courses.map((c) => (
                      <TableRow key={c._id}>
                        <TableCell>{c.coursename}</TableCell>
                        <TableCell>{c.slug}</TableCell>
                        <TableCell>{c.coursecategory}</TableCell>
                        <TableCell>
                          {typeof c.Instructor === "object"
                            ? c.Instructor?.name || c.Instructor?._id
                            : c.Instructor}
                        </TableCell>
                        <TableCell>{c.status}</TableCell>
                        <TableCell>{c.priority}</TableCell>
                        <TableCell>{c.viewOnWeb ? "✅" : "❌"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link to={`/dashboard/editacademiacourse/${c._id}`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>

                          <AlertDialog
                            open={open && target?._id === c._id}
                            onOpenChange={(v) => {
                              if (!v) {
                                setOpen(false);
                                setTarget(null);
                              }
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => confirmDelete(c)}
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete this course?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. It will
                                  permanently delete
                                  <span className="font-medium">
                                    {" "}
                                    {target?.coursename}
                                  </span>
                                  .
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleting}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  disabled={deleting}
                                >
                                  {deleting ? "Deleting…" : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No courses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AcademiaCourses;
