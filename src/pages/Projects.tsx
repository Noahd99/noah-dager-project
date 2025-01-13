import { motion } from "framer-motion";

const projects = [
  {
    id: 1,
    title: "AMIE",
    subtitle: "Blu",
    image: "/lovable-uploads/b13ed90a-09ad-4682-970b-38b55895bc4c.png",
    description: "Inspired by cinema, every shot drives the story forward. Sophisticated yet fresh.",
  },
  // Add more projects as needed
];

const Projects = () => {
  return (
    <div className="min-h-screen bg-dager-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="inline-block px-3 py-1 text-xs font-medium bg-dager-yellow text-dager-black rounded-full mb-6">
            OUR WORK
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-dager-black mb-4 tracking-tighter">
            Selected Projects
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg mb-6">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full aspect-[4/3] object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-3xl font-bold text-dager-black mb-2 tracking-tighter">
                {project.title}
              </h3>
              <h4 className="text-xl text-dager-red mb-4 italic">
                {project.subtitle}
              </h4>
              <p className="text-dager-black/80">
                {project.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;