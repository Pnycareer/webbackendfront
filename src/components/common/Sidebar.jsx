import { BarChart2, BookAIcon, Menu, TrendingUp } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, Outlet } from "react-router-dom";
import { BiCategory } from "react-icons/bi";
import { GiTeacher } from "react-icons/gi";
import { MdEventNote, MdFolderSpecial } from "react-icons/md";
import { TbCategory, TbWriting } from "react-icons/tb";
import { FaQq } from "react-icons/fa6";
import { FcGallery } from "react-icons/fc";
import { GrGallery } from "react-icons/gr";
import { SiMetrodelaciudaddemexico } from "react-icons/si";
import Header from "./Header";
import useAuth from "../../context/useAuth";
import SiteBackground from "../SiteBackground/SiteBackground";

const ALL_SIDEBAR_ITEMS = [
  {
    name: "Pny Dashboard",
    icon: BarChart2,
    color: "#6366f1",
    href: "/dashboard",
  },
  {
    name: "Users",
    icon: BarChart2,
    color: "#6366f1",
    href: "/dashboard/users",
  },
  {
    name: "Web Banner",
    icon: BarChart2,
    color: "#6366f1",
    href: "/dashboard/web-banner",
  },
  {
    name: "Courses",
    icon: BookAIcon,
    color: "#EC4899",
    href: "#",
    dropdown: [
      {
        name: "Category",
        icon: BiCategory,
        color: "#8B5CF6",
        href: "/dashboard/course-categories",
      },
      {
        name: "Courses",
        icon: BookAIcon,
        color: "#EC4899",
        href: "/dashboard/courses",
      },
      {
        name: "Courses Meta",
        icon: BookAIcon,
        color: "#EC4899",
        href: "/dashboard/add-meta",
      },
      {
        name: "Courses Faq's",
        icon: BookAIcon,
        color: "#EC4899",
        href: "/dashboard/courses-faqs",
      },  
      {
        name: "Course Module",
        icon: SiMetrodelaciudaddemexico,
        color: "#EC4899",
        href: "/dashboard/coursemodel",
      },
    ],
  },
  {
    name: "Blog",
    icon: TbWriting,
    color: "#EC4899",
    href: "#",
    dropdown: [
      {
        name: "Blog Post",
        icon: BookAIcon,
        color: "#EC4899",
        href: "/dashboard/blog-post",
      },
      {
        name: "All Blogs",
        icon: BookAIcon,
        color: "#EC4899",
        href: "/dashboard/all-blogs",
      },
      {
        name: "Blog Faq's",
        icon: BookAIcon,
        color: "#EC4899",
        href: "/dashboard/blog-faqs",
      },
    ],
  },
  {
    name: "Instructor",
    icon: GiTeacher,
    color: "#10B981",
    href: "/dashboard/instructors",
  },
  {
    name: "E-Flyers",
    icon: MdFolderSpecial,
    color: "#F59E0B",
    href: "#",
    dropdown: [
      {
        name: "E-Flyers",
        icon: BiCategory,
        color: "#8B5CF6",
        href: "/dashboard/eflayer",
      },
    ],
  },
  {
    name: "Brouchure Data",
    icon: MdFolderSpecial,
    color: "#F59E0B",
    href: "/dashboard/brouchuredata",
  },
  {
    name: "Contact Data",
    icon: MdFolderSpecial,
    color: "#F59E0B",
    href: "/dashboard/contact-data",
  },
  {
    name: "Faqs",
    icon: FaQq,
    color: "#F59E0B",
    href: "#",
    dropdown: [
      {
        name: "Faqs",
        icon: BiCategory,
        color: "#8B5CF6",
        href: "/dashboard/faqs",
      },
    ],
  },
  {
    name: "Gallery",
    icon: GrGallery,
    color: "#F59E0B",
    href: "#",
    dropdown: [
      {
        name: "Gallery",
        icon: FcGallery,
        color: "#8B5CF6",
        href: "/dashboard/gallery",
      },
    ],
  },
  {
    name: "Other",
    icon: MdEventNote,
    color: "#F59E0B",
    href: "#",
    dropdown: [
      {
        name: "Terms & Conditions",
        icon: TrendingUp,
        color: "#3B82F6",
        href: "/dashboard/termsandconditions",
      },
      {
        name: "Privacy Policy",
        icon: TrendingUp,
        color: "#3B82F6",
        href: "/dashboard/privacypolicy",
      },
      {
        name: "News",
        icon: TrendingUp,
        color: "#3B82F6",
        href: "/dashboard/news",
      },
    ],
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // 🧠 Filter sidebar items by role
  const sidebarItems = ALL_SIDEBAR_ITEMS.filter((item) => {
    if (user?.role === "csr") {
      return item.name === "Brouchure Data";
    }

    if (item.name === "Users" && user?.role !== "superadmin") {
      return false; // hide 'Users' unless superadmin
    }

    return true; // show everything else
  });

  return (
    <div className="flex h-screen">
      <motion.div
        className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 bg-black text-white ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
      >
        <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700 overflow-y-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
          >
            <Menu size={24} />
          </motion.button>

          <nav className="mt-8 flex-grow">
            {sidebarItems.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <div>
                    <motion.div
                      onClick={() => toggleDropdown(item.name)}
                      className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 cursor-pointer"
                    >
                      <item.icon
                        size={20}
                        style={{ color: item.color, minWidth: "20px" }}
                      />
                      {isSidebarOpen && (
                        <motion.span
                          className="ml-4 whitespace-nowrap"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2, delay: 0.3 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </motion.div>
                    {openDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-8 space-y-2"
                      >
                        {item.dropdown.map((subItem) => (
                          <Link key={subItem.href} to={subItem.href}>
                            <motion.div className="flex items-center p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                              <subItem.icon
                                size={16}
                                style={{ color: subItem.color }}
                              />
                              {isSidebarOpen && (
                                <motion.span
                                  className="ml-2 whitespace-nowrap"
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: "auto" }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.2, delay: 0.3 }}
                                >
                                  {subItem.name}
                                </motion.span>
                              )}
                            </motion.div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Link to={item.href}>
                    <motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                      <item.icon
                        size={20}
                        style={{ color: item.color, minWidth: "20px" }}
                      />
                      {isSidebarOpen && (
                        <motion.span
                          className="ml-4 whitespace-nowrap"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2, delay: 0.3 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </motion.div>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 overflow-y-auto">
         <SiteBackground/>
        <Header />
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;
