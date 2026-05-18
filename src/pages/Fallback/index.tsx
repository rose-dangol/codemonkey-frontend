import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <img
          src="/NotFound.jpeg"
          alt="Not Found"
          className="w-full max-w-md mx-auto mb-8"
        />

        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          Page Not Found
        </h1>

        <p className="text-gray-500 text-base md:text-lg mb-8">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/home"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-md"
        >
          <Home size={18} />
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
