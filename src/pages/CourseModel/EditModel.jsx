import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { motion, AnimatePresence } from "framer-motion";
import useCourseModel from "../../hooks/useCourseModel";

const EditModel = () => {
  const { id } = useParams(); // This is your featureId
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [originalLectures, setOriginalLectures] = useState([]);
  const [expandedLecture, setExpandedLecture] = useState(null);
  const {
  getModuleById,
  updateCourseModel,
  deleteLectureFromModel,
} = useCourseModel();

  useEffect(() => {
  const fetchModule = async () => {
    try {
      const data = await getModuleById(id);
      setModuleData(data);
      setLectures(data.lectures);
      setOriginalLectures(data.lectures);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };
  fetchModule();
}, [id]);


  const handleAddLecture = () => {
    // Collect used lecture numbers
    const usedNumbers = lectures.map((lec) => lec.lectureNumber);

    // Find the smallest missing number
    let lectureNumber = 1;
    while (usedNumbers.includes(lectureNumber)) {
      lectureNumber++;
    }

    const newLecture = {
      lectureNumber,
      title: "",
      content: "",
      topics: "",
    };

    // Add and sort the lectures
    const updatedLectures = [...lectures, newLecture].sort(
      (a, b) => a.lectureNumber - b.lectureNumber
    );

    setLectures(updatedLectures);

    // 🔥 Auto-expand the newly added lecture
    setExpandedLecture(lectureNumber);
  };

  const handleLectureChange = (index, field, value) => {
    const updatedLectures = [...lectures];
    updatedLectures[index][field] = value;
    setLectures(updatedLectures);
  };

const handleDeleteLecture = async (lectureId) => {
  const confirm = window.confirm("Are you sure you want to delete this lecture?");
  if (!confirm) return;

  try {
    const updatedLectures = await deleteLectureFromModel(id, lectureId);
    setLectures(updatedLectures);
    setOriginalLectures(updatedLectures);
  } catch (err) {
    // toast already triggered
  }
};


  const handleUpdate = async (e) => {
  e.preventDefault();

  try {
    await updateCourseModel(id, {
      courseId: moduleData.courseId._id || moduleData.courseId,
      lectures,
    });
    setTimeout(() => navigate("/coursemodel"), 1500);
  } catch (err) {
    // No need to set message manually, it's handled by toast
  }
};


  if (loading)
    return <div className="text-center text-white py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 mx-auto overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Edit Module for: {moduleData.courseName}
        </h2>

       

        <div className="mb-6 max-w-xs">
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2 border rounded-md text-black"
            placeholder="Search by lecture number..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);

              if (!value) {
                setLectures(originalLectures);
                setExpandedLecture(null);
              } else {
                const number = parseInt(value, 10);
                const filtered = originalLectures.filter(
                  (lecture) => lecture.lectureNumber === number
                );
                setLectures(filtered);
                if (filtered.length > 0) {
                  setExpandedLecture(filtered[0].lectureNumber);
                } else {
                  setExpandedLecture(null);
                }
              }
            }}
          />
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {lectures.map((lecture, index) => {
            const isOpen = expandedLecture === lecture.lectureNumber;

            return (
              <div
                key={lecture._id || lecture.lectureNumber}
                className="border border-gray-300 rounded-md bg-gray-50 mb-4"
              >
                <div
                  onClick={() =>
                    setExpandedLecture(isOpen ? null : lecture.lectureNumber)
                  }
                  className="flex justify-between items-center px-4 py-3 cursor-pointer bg-gray-200 hover:bg-gray-300 rounded-t-md"
                >
                  <p className="font-semibold text-gray-700">
                    Lecture #{lecture.lectureNumber}
                  </p>
                  <span className="text-sm text-blue-600">
                    {isOpen ? "▲ Collapse" : "▼ Expand"}
                  </span>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden px-4 pb-4 pt-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          className="text-black px-3 py-2 border rounded-md"
                          placeholder="Title"
                          value={lecture.title}
                          onChange={(e) =>
                            handleLectureChange(index, "title", e.target.value)
                          }
                        />
                        <input
                          type="text"
                          className="text-black px-3 py-2 border rounded-md"
                          placeholder="Content"
                          value={lecture.content}
                          onChange={(e) =>
                            handleLectureChange(
                              index,
                              "content",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="mt-2">
                        <label className="block text-gray-700 mb-1">
                          Topics
                        </label>
                        <ReactQuill
                          theme="snow"
                          value={lecture.topics}
                          onChange={(value) =>
                            handleLectureChange(index, "topics", value)
                          }
                          className="bg-white text-black"
                        />
                      </div>
                      <div className="mt-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteLecture(
                              lecture._id || lecture.lectureNumber
                            )
                          }
                          className="text-red-500 text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <div className="mb-6">
            <button
              type="button"
              onClick={handleAddLecture}
              className="px-4 py-2 rounded-md text-blue-500"
            >
              + Add Lecture
            </button>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Update Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModel;
