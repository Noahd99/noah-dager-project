import { motion } from "framer-motion";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="h-screen w-full bg-dager-black overflow-hidden">
      <div className="relative h-full w-full flex">
        {/* Left side content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-1/3 flex items-center justify-end pr-8"
        >
          <p className="text-dager-white/70 text-sm max-w-[200px] text-right">
            Crafting visual narratives that resonate with authenticity and innovation.
            Where creativity meets purpose.
          </p>
        </motion.div>

        {/* Right side content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-2/3 flex flex-col justify-center pl-8"
        >
          <div className="max-w-xl">
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
              className="text-6xl md:text-8xl font-bold text-dager-white mb-6 tracking-tighter"
            >
              DAGER STUDIOS
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-xl md:text-2xl text-dager-white/90 max-w-2xl"
            >
              A filmic mind and a modern eye come together in our creative work.
              Every project is equal parts story, substance, and style.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;