import React from "react";

const Noresult = () => {
  return (
    <motion.div
      className="text-center text-gray-400 py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-6xl mb-4">😔</p>
      <p className="text-xl">No Blogs Found</p>
    </motion.div>
  );
};

export default Noresult;
