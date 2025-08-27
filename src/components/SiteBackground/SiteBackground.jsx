// src/components/SiteBackground/SiteBackground.jsx
export default function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Dark background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#262935] via-[#0f1117] to-[#1a1d2e]" />

      {/* Radial Glow Spots */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-sky-400/15 rounded-full blur-[160px]" />
      <div className="absolute -top-20 right-1/4 w-[350px] h-[350px] bg-teal-400/20 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[200px]" />
      <div className="absolute bottom-20 left-16 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-pink-500/15 rounded-full blur-[140px]" />
      <div className="absolute top-[60%] right-[30%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[120px]" />
    </div>
  );
}
