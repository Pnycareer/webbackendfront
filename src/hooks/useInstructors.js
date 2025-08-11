import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "../utils/axios";

const useInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/instructors/get-instructor");
      setInstructors(res.data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast.error("Failed to load instructors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  return { instructors, loading };
};

export default useInstructors;
