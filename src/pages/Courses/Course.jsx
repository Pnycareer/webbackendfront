import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, GripVertical } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useCourses from "../../hooks/useCourses";
import axios from "../../utils/axios";
import { toast } from "react-hot-toast";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ==================== Sortable Row ====================
function SortableRow({ course, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: course._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <motion.tr
      ref={setNodeRef}
      style={style}
      key={course._id}
      className="group"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <td className="py-2 pl-2 w-8 text-gray-400">
        <button
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-700/60"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </td>
      {children}
    </motion.tr>
  );
}

// ==================== Overlay Row Preview ====================
function DragRowPreview({ course }) {
  return (
    <table className="min-w-full">
      <tbody>
        <tr className="bg-gray-800 shadow-lg rounded opacity-90">
          <td className="py-2 pl-2 w-8 text-gray-400">
            <GripVertical size={16} />
          </td>
          <td className="py-2 text-gray-100">{course.course_Name}</td>
          <td className="py-2 text-gray-100">{course.Instructor?.name}</td>
          <td className="py-2 text-gray-100">{course.Duration_Months}</td>
          <td className="py-2 text-gray-300">{course.Monthly_Fee || "N/A"}</td>
          <td className="py-2 text-gray-300">{course.Admission_Fee || "N/A"}</td>
          <td className="py-2">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${
                course.status === "Active"
                  ? "bg-green-800 text-green-100"
                  : "bg-red-800 text-red-100"
              }`}
            >
              {course.status}
            </span>
          </td>
          <td className="py-2 text-sm text-gray-300">Moving…</td>
        </tr>
      </tbody>
    </table>
  );
}

// ==================== Draggable Table ====================
function DraggableCourseTable({ category, onEdit, onDelete, onToggleStatus }) {
  const [items, setItems] = useState(category.courses || []);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setItems(category.courses || []);
  }, [category.courses]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const ids = items.map((c) => c._id);

  const persistOrder = async (newIds) => {
    try {
      await axios.put(`/courses/reorder/${category._id}`, { order: newIds });
    } catch (e) {
      console.error("Persist reorder failed:", e);
      toast.error("Failed to save order");
    }
  };

  const onDragStart = (event) => setActiveId(event.active.id);
  const onDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    persistOrder(newItems.map((c) => c._id));
  };

  const activeCourse = items.find((c) => c._id === activeId);

  return (
    <div className="overflow-x-auto px-6 pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th className="text-left text-xs text-gray-400 uppercase py-2">Course</th>
                <th className="text-left text-xs text-gray-400 uppercase py-2">Instructor</th>
                <th className="text-left text-xs text-gray-400 uppercase py-2">Duration</th>
                <th className="text-left text-xs text-gray-400 uppercase py-2">Monthly Fee</th>
                <th className="text-left text-xs text-gray-400 uppercase py-2">Admission Fee</th>
                <th className="text-left text-xs text-gray-400 uppercase py-2">Status</th>
                <th className="text-left text-xs text-gray-400 uppercase py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {items.map((course) => (
                <SortableRow key={course._id} course={course}>
                  <>
                    <td className="py-2 text-gray-100">{course.course_Name}</td>
                    <td className="py-2 text-gray-100">{course.Instructor?.name}</td>
                    <td className="py-2 text-gray-100">{course.Duration_Months}</td>
                    <td className="py-2 text-gray-300">{course.Monthly_Fee || "N/A"}</td>
                    <td className="py-2 text-gray-300">{course.Admission_Fee || "N/A"}</td>
                    <td className="py-2">
                      <button
                        onClick={() => onToggleStatus(course._id, course.status)}
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          course.status === "Active"
                            ? "bg-green-800 text-green-100"
                            : "bg-red-800 text-red-100"
                        }`}
                      >
                        {course.status}
                      </button>
                    </td>
                    <td className="py-2 text-sm text-gray-300">
                      <button
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                        onClick={() => onEdit(course._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-400 hover:text-red-300"
                        onClick={() => onDelete(course._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                </SortableRow>
              ))}
            </tbody>
          </table>
        </SortableContext>

        {/* 👇 Overlay row that follows the cursor */}
        <DragOverlay adjustScale={false}>
          {activeCourse ? <DragRowPreview course={activeCourse} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ==================== Main Courses Page ====================
const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriesWithCourses, setCategoriesWithCourses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openCategories, setOpenCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [editedtitle, setEditedTitle] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { fetchCourses, deleteCourse, updateStatus } = useCourses();

  const fetchAndUpdate = async () => {
    setLoading(true);
    const data = await fetchCourses();
    setCategoriesWithCourses(data);
    setFilteredData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAndUpdate();
  }, [location.pathname]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredData(categoriesWithCourses);
      setOpenCategories([]);
      return;
    }

    const filtered = categoriesWithCourses
      .map((cat) => {
        const matchedCourses = cat.courses.filter((course) =>
          course.course_Name?.toLowerCase().includes(term)
        );
        return matchedCourses.length ? { ...cat, courses: matchedCourses } : null;
      })
      .filter(Boolean);

    setFilteredData(filtered);
    setOpenCategories(filtered.map((cat) => cat._id));
  };

  const toggleCategory = (id) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      await deleteCourse(id, fetchAndUpdate);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    await updateStatus(id, currentStatus, fetchAndUpdate);
  };

  const handleEdit = (courseId) => navigate(`/dashboard/editcourse/${courseId}`);

  const handleSaveCategoryDescription = async (categoryId) => {
    try {
      await axios.patch(`/courses/category-update/${categoryId}`, {
        category_Name: editedtitle,
        category_Description: editedDescription,
      });
      toast.success("Category updated!");
      setEditingCategoryId(null);
      fetchAndUpdate();
    } catch (error) {
      toast.error("Failed to update category.");
    }
  };

  const isAddCoursePage = location.pathname.includes("addcourse");

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {!isAddCoursePage && (
        <>
          {/* Header + Search */}
          <div className="text-center items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-100 mb-5">
              Courses by Category
            </h2>
            <hr className="w-full h-1 bg-slate-500 rounded-sm" />
            <div className="my-5 flex justify-center lg:justify-between items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <Link to="/dashboard/addcourse">
                <button className="bg-blue-600 hover:bg-blue-500 text-white hidden sm:block font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                  Add Courses
                </button>
              </Link>
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-60">
              <motion.div
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <p className="text-gray-300 mt-3">Loading courses...</p>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((category) => (
              <div
                key={category._id}
                className="mb-6 border rounded-lg bg-gray-900 border-gray-700"
              >
                {/* Category Header */}
                <div className="w-full flex justify-between items-center px-6 py-4 bg-gray-800 hover:bg-gray-700 transition-all">
                  <div
                    onClick={() => toggleCategory(category._id)}
                    className="flex-1 cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {category.category_Name}
                    </h3>
                  </div>
                  <div className="flex gap-3 items-center ml-4">
                    {editingCategoryId === category._id ? (
                      <>
                        <button
                          onClick={() => handleSaveCategoryDescription(category._id)}
                          className="text-green-400 hover:text-green-300 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCategoryId(category._id);
                          setEditedDescription(category.category_Description || "");
                          setEditedTitle(category.category_Name || "");
                          if (!openCategories.includes(category._id)) {
                            setOpenCategories((prev) => [...prev, category._id]);
                          }
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Edit
                      </button>
                    )}
                    <motion.div
                      animate={{
                        rotate: openCategories.includes(category._id) ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="text-gray-300" />
                    </motion.div>
                  </div>
                </div>

                {/* Description */}
                {openCategories.includes(category._id) && (
                  <div className="px-6 pb-2">
                    {editingCategoryId === category._id ? (
                      <>
                        <input
                          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring mt-2"
                          value={editedtitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                        />
                        <textarea
                          rows={2}
                          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring mt-2"
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                        />
                      </>
                    ) : (
                      <p className="text-gray-400 italic mt-2">
                        {category.category_Description || "No description provided."}
                      </p>
                    )}
                  </div>
                )}

                {/* Course Table */}
                <AnimatePresence>
                  {openCategories.includes(category._id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <DraggableCourseTable
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleStatusChange}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No courses found.</p>
          )}
        </>
      )}
      <Outlet />
    </motion.div>
  );
};

export default Courses;
