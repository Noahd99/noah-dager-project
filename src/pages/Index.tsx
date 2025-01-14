import { motion } from "framer-motion";
import { useEffect } from "react";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="h-screen w-full bg-dager-white overflow-hidden flex flex-col">
      <div className="relative flex-1 w-full flex flex-col md:flex-row">
        {/* Left side content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full md:w-1/3 flex items-center justify-center md:justify-end p-4 md:pr-8 order-2 md:order-1"
        >
          <p className="text-dager-black/70 text-sm max-w-[200px] text-center md:text-right">
            Crafting visual narratives that resonate with authenticity and innovation.
            Where creativity meets purpose.
          </p>
        </motion.div>

        {/* Right side content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full md:w-2/3 flex flex-col justify-center p-4 md:pl-8 order-1 md:order-2"
        >
          <div className="max-w-xl mx-auto md:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-4"
            >
              <span className="inline-block px-3 py-1 text-xs font-medium bg-dager-yellow text-dager-black rounded-full mb-6">
                CREATIVE STUDIO
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-4xl md:text-6xl lg:text-8xl font-bold text-dager-black mb-6 tracking-tighter"
            >
              DAGER STUDIOS
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-lg md:text-xl lg:text-2xl text-dager-black/90 max-w-2xl"
            >
              A filmic mind and a modern eye come together in our creative work.
              Every project is equal parts story, substance, and style.
            </motion.p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;