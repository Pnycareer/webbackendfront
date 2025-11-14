"use client";

import React from "react";
import axiosInstance from "@/utils/axios";

const PAGE_SIZE = 10;

const AllLandingData = () => {
  const [enrollments, setEnrollments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selectedCity, setSelectedCity] = React.useState("all");
  const [selectedCourse, setSelectedCourse] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [lastUpdated, setLastUpdated] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/api/enrollments");

        if (res.status !== 200) {
          throw new Error("Failed to fetch enrollments");
        }

        const incoming = Array.isArray(res.data) ? res.data : [];

        if (isMounted) {
          setEnrollments(incoming);
          setLastUpdated(new Date());
          setCurrentPage(1);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load enrollment data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const cityOptions = React.useMemo(() => {
    const set = new Set();
    enrollments.forEach((item) => {
      if (item?.city) {
        set.add(item.city);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [enrollments]);

  const courseOptions = React.useMemo(() => {
    const set = new Set();
    enrollments.forEach((item) => {
      if (item?.course) {
        set.add(item.course);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [enrollments]);

  const filteredEnrollments = React.useMemo(() => {
    const normalizedCity = selectedCity.toLowerCase();
    const normalizedCourse = selectedCourse.toLowerCase();

    return enrollments.filter((item) => {
      const matchesCity =
        selectedCity === "all" ||
        (item?.city || "").toLowerCase() === normalizedCity;
      const matchesCourse =
        selectedCourse === "all" ||
        (item?.course || "").toLowerCase() === normalizedCourse;
      return matchesCity && matchesCourse;
    });
  }, [enrollments, selectedCity, selectedCourse]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEnrollments.length / PAGE_SIZE)
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, selectedCourse, enrollments.length]);

  React.useEffect(() => {
    setCurrentPage((prev) => (prev > totalPages ? totalPages : prev));
  }, [totalPages]);

  const rowOffset = (currentPage - 1) * PAGE_SIZE;
  const hasResults = filteredEnrollments.length > 0;
  const startIndex = hasResults ? rowOffset + 1 : 0;
  const endIndex = hasResults
    ? Math.min(rowOffset + PAGE_SIZE, filteredEnrollments.length)
    : 0;

  const paginatedEnrollments = React.useMemo(() => {
    return filteredEnrollments.slice(rowOffset, rowOffset + PAGE_SIZE);
  }, [filteredEnrollments, rowOffset]);

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const clearFilters = () => {
    setSelectedCity("all");
    setSelectedCourse("all");
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Dashboard
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">
                Enrollment Data
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Monitor leads coming from the landing page in real-time.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-right">
              <p className="text-sm text-slate-500">Total entries</p>
              <p className="text-3xl font-semibold text-slate-900">
                {enrollments.length}
              </p>
              {lastUpdated && (
                <p className="text-xs text-slate-500">
                  Updated {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur lg:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              City
            </label>
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All courses</option>
              {courseOptions.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white/90 shadow-sm">
          {loading && (
            <div className="p-12 text-center text-slate-500">
              Loading enrollment data...
            </div>
          )}

          {!loading && error && (
            <div className="p-6">
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3 text-left">#</th>
                      <th className="px-6 py-3 text-left">First Name</th>
                      <th className="px-6 py-3 text-left">Last Name</th>
                      <th className="px-6 py-3 text-left">Phone</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">City</th>
                      <th className="px-6 py-3 text-left">Course</th>
                      <th className="px-6 py-3 text-left">Message</th>
                      <th className="px-6 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {paginatedEnrollments.map((item, index) => (
                      <tr
                        key={item._id || `${item.email}-${index}`}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">
                          {startIndex + index}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {item.firstName || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {item.lastName || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {item.phone || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {item.email || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {item.city || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {item.course || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          <span className="line-clamp-2 max-w-xs">
                            {item.message || "-"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {hasResults ? (
                <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Showing {startIndex}-{endIndex} of{" "}
                    {filteredEnrollments.length} entries
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={currentPage === 1}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition enabled:hover:border-slate-300 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition enabled:hover:border-slate-300 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  No enrollment data found for the selected filters.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllLandingData;
