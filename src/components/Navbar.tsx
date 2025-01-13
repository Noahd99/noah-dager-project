import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed w-full z-50 px-6 py-4 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold tracking-tighter text-dager-black hover:text-dager-red transition-colors"
        >
          DAGER
        </Link>
        
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-dager-red ${
              location.pathname === "/" ? "text-dager-red" : "text-dager-black"
            }`}
          >
            HOME
          </Link>
          <Link
            to="/projects"
            className={`text-sm font-medium transition-colors hover:text-dager-red ${
              location.pathname === "/projects" ? "text-dager-red" : "text-dager-black"
            }`}
          >
            PROJECTS
          </Link>
          <button
            className="px-4 py-2 text-sm font-medium text-dager-black border border-dager-black rounded-full hover:bg-dager-black hover:text-white transition-all duration-300"
          >
            Login
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;