import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const CourseSearchBar = ({ searchTerm, handleSearch }) => (
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
    <Link to="/addcourse">
      <button className="bg-blue-600 hover:bg-blue-500 text-white hidden sm:block font-semibold py-2 px-4 rounded-lg transition-all duration-300">
        Add Courses
      </button>
    </Link>
  </div>
);

export default CourseSearchBar;
