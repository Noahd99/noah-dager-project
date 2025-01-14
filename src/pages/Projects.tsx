import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
}

const Projects = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("order_index");
      
      if (error) throw error;
      return data as Project[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dager-white pt-24 pb-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dager-white overflow-hidden flex flex-col">
      <div className="relative h-full w-full flex flex-col md:flex-row pt-24">
        {/* Left side content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full md:w-1/3 flex items-start justify-center md:justify-end p-4 md:pr-8"
        >
          <p className="text-dager-black/70 text-sm max-w-[200px] text-center md:text-right sticky top-32">
            Each project represents a unique story, carefully crafted to capture moments and emotions that resonate with audiences worldwide.
          </p>
        </motion.div>

        {/* Right side content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full md:w-2/3 p-4 md:pl-8"
        >
          <div className="max-w-3xl mx-auto md:mx-0">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-block px-3 py-1 text-xs font-medium bg-dager-yellow text-dager-black rounded-full mb-6"
            >
              OUR WORK
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-dager-black mb-12 tracking-tighter"
            >
              Selected Projects
            </motion.h1>

            <div className="grid grid-cols-1 gap-16">
              {projects?.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 * index }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg mb-6">
                    {project.image_url && (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full aspect-[16/9] object-cover transform transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-dager-black mb-3 tracking-tighter">
                    {project.title}
                  </h3>
                  <p className="text-dager-black/80 text-lg">
                    {project.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Projects;