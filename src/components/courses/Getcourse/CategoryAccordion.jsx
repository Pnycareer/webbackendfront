import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import CourseTable from "./CourseTable";

const CategoryAccordion = ({
  category,
  openCategoryIds,
  toggleCategory,
  handleEdit,
  handleDelete,
  updateStatus,
}) => {
  const isOpen = openCategoryIds.includes(category._id);

  return (
    <div className="mb-6 border rounded-lg bg-gray-900 border-gray-700">
      <button
        onClick={() => toggleCategory(category._id)}
        className="w-full flex justify-between items-center px-6 py-4 text-left bg-gray-800 hover:bg-gray-700 transition-all"
      >
        <h3 className="text-lg font-semibold text-white capitalize">
          {category.category_Name}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="text-gray-300" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CourseTable
              courses={category.courses}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              updateStatus={updateStatus}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryAccordion;
