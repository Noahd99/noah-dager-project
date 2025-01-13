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
    <div className="h-screen w-full bg-dager-white overflow-hidden">
      <div className="relative h-full w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute inset-0"
        >
          <img
            src="/lovable-uploads/85b98247-fbd3-4360-a0af-364333f7dd61.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
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
            className="text-xl md:text-2xl text-dager-white/90 max-w-2xl mx-auto mb-8"
          >
            A filmic mind and a modern eye come together in our creative work.
            Every project is equal parts story, substance, and style.
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Index;