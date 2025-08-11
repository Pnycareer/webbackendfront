// import { createHashRouter  } from "react-router-dom";
import { createBrowserRouter  } from "react-router-dom";
import { lazy, Suspense } from "react";
import Sidebar from "../common/Sidebar";
import App from "../../App";
import Login from "../../pages/Auth/Login";
import PrivateRoute from "../protectedroutes/PrivateRoute";
import AccessDenied from "../../pages/AccessDenied/Accessdenied";
import AuthLock from "../../pages/AuthLock";



const Webbanner = lazy(() => import("../../pages/Webbanner"));
const CategoryTable = lazy(() => import("../category/CategoryTable"));
const AddCategory = lazy(() => import("../../pages/Category/AddCate"));
const EditCategory = lazy(() => import("../category/Editcategory"));
const Courses = lazy(() => import("../../pages/Courses/Course"));
const AddCourse = lazy(() => import("../../pages/Courses/AddCourse"));
const EditCourse = lazy(() => import("../courses/Getcourse/EditCourse"));
const CourseModulesTable = lazy(() =>import("../../pages/CourseModel/ModelCourse"));
const EditModel = lazy(() => import("../../pages/CourseModel/EditModel"));
const AddModel = lazy(() => import("../../pages/CourseModel/AddModel"));
const Allblogs = lazy(() => import("../../pages/Blog/Allblogs"));
const Blog = lazy(() => import("../../pages/Blog/Blog"));
const EditBlog = lazy(() => import("../../pages/Blog/EditBlog"));
const Instructors = lazy(() => import("../../pages/Instructors/Instructors"));
const Addinstructors = lazy(() =>import("../../pages/Instructors/AddInstructor"));
const EditInstructor = lazy(() =>import("../../pages/Instructors/EditInstructor"));
const Register = lazy(() => import("../../pages/Auth/Register"));
const Users = lazy(() => import("../../pages/Users/Allusers"));
const Geteflayer = lazy(() => import("../../pages/Eflyer/GetEflyers"));
const posteflayer = lazy(() => import("../../pages/Eflyer/Eflayer"));
const editeflayer = lazy(() => import("../../pages/Eflyer/EditEflyers"));
const Brouchuredata = lazy(() => import("../../pages/Brouchuredata/Brouchuredata"));
const FaqList = lazy(() => import("../Faqs/Faqs"));
const EditFaq = lazy(() => import("../Faqs/Editfaq"));
const FaqPostPage = lazy(() => import("../Faqs/AddFaq"));
const GalleryForm = lazy(() => import("../../pages/Gallery/Addgallery"));
const GalleryTable = lazy(() => import("../Gallery/Gallery"));
const Gettermsandcondition = lazy(() => import("../../pages/Termsandconditions/Addtermsandconditions"));
const Privacypolicy = lazy(() => import("../../pages/Privacypolicy/Privacypolicy"));
const GetNews = lazy(() => import("../News/GetNews"));
const Editnews = lazy(() => import("../News/Edit"));
const CreateNews = lazy(() => import("../../pages/News/Addnews"));


// Wrapper for Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
    <Component />
  </Suspense>
);

const isElectron = window?.process?.versions?.electron;
const isUnlocked = localStorage.getItem("unlocked") === "true";


const router = createBrowserRouter([
  {
  path: "/auth-lock",
  element: <AuthLock />,
},
  // Auth-Routes
  {
    path: "/",
    element: <App />,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: "/403",
    element: <AccessDenied />,
  },

  // Dashboard-Routes
  {
    path: "dashboard", element: (
  isElectron && !isUnlocked ? (
    <Navigate to="/auth-lock" />
  ) : (
    <PrivateRoute>
      <Sidebar />
    </PrivateRoute>
  )
),

    children: [
      { index: true, element: <h1>Home</h1> },

      // Web-Banner
      {
        path: "web-banner",
        element: withSuspense(Webbanner),
      },

      // Category
      {
        path: "course-categories",
        element: (
          <PrivateRoute allowedRoles={["admin", 'modifier' , "superadmin"]}>
            {withSuspense(CategoryTable)}
          </PrivateRoute>
        ),
      },
      // Users
      {
        path: "register",
        element: (
          <PrivateRoute allowedRoles={["superadmin"]}>
            {withSuspense(Register)}
          </PrivateRoute>
        ),
      },
      {
        path: "users",
        element: <PrivateRoute allowedRoles={["superadmin"]}>{withSuspense(Users)}</PrivateRoute>,
      },

      // Categories
      { path: "add-categories", element: withSuspense(AddCategory) },
      { path: "edit-category/:id", element: withSuspense(EditCategory) },

      // Courses
      { path: "courses", element: withSuspense(Courses) },
      { path: "addcourse", element: withSuspense(AddCourse) },
      { path: "editcourse/:id", element: withSuspense(EditCourse) },

      // Course-Model
      { path: "coursemodel", element: withSuspense(CourseModulesTable) },
      { path: "editmodel/:id", element: withSuspense(EditModel) },
      { path: "addcoursemodel", element: withSuspense(AddModel) },

      // Blogs
      { path: "all-blogs", element: withSuspense(Allblogs) },
      { path: "blog-post", element: withSuspense(Blog) },
      { path: "editblog/:id", element: withSuspense(EditBlog) },

      // Instructor
      { path: "instructors", element: withSuspense(Instructors) },
      { path: "addinstructors", element: withSuspense(Addinstructors) },
      { path: "editinstructors/:id", element: withSuspense(EditInstructor) },

      // E-flyers
      { path: "eflayer", element: withSuspense(Geteflayer) },
      { path: "add-eflayer", element: withSuspense(posteflayer) },
      { path: "edit-eflayer/:id", element: withSuspense(editeflayer) },

      // Brochure Data
      { path: "brouchuredata", element: withSuspense(Brouchuredata) },

      // Faq's
      { path: "faqs", element: withSuspense(FaqList) },
      { path: "editfaq/:id", element: withSuspense(EditFaq) },
      { path: "addfaqs", element: withSuspense(FaqPostPage) },
      
      
      // Gallery
      { path: "gallery", element: withSuspense(GalleryTable) },
      { path: "addgallery", element: withSuspense(GalleryForm) },
      
      // terms&conditions
      { path: "termsandconditions", element: withSuspense(Gettermsandcondition) },

      // Privacy policy
      { path: "privacypolicy", element: withSuspense(Privacypolicy) },

      // Privacy policy
      { path: "news", element: withSuspense(GetNews) },
      { path: "addnews", element: withSuspense(CreateNews) },
      { path: "editnews/:id", element: withSuspense(Editnews) },
    ],
  },
]);

export default router;
