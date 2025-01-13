import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  order_index: number;
}

const ProjectsPanel = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    image_url: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("order_index");
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error fetching projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return;

    try {
      const { error } = await supabase.from("projects").insert([
        {
          title: newProject.title,
          description: newProject.description,
          image_url: newProject.image_url,
          order_index: projects.length,
        },
      ]);
      if (error) throw error;

      toast({
        title: "Project added successfully",
      });
      setNewProject({ title: "", description: "", image_url: "" });
      fetchProjects();
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error adding project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Project deleted successfully",
      });
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error deleting project",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddProject} className="space-y-4">
        <Input
          placeholder="Project Title"
          value={newProject.title}
          onChange={(e) =>
            setNewProject({ ...newProject, title: e.target.value })
          }
        />
        <Textarea
          placeholder="Project Description"
          value={newProject.description}
          onChange={(e) =>
            setNewProject({ ...newProject, description: e.target.value })
          }
        />
        <Input
          placeholder="Image URL"
          value={newProject.image_url}
          onChange={(e) =>
            setNewProject({ ...newProject, image_url: e.target.value })
          }
        />
        <Button type="submit">Add Project</Button>
      </form>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-start justify-between p-4 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-sm text-gray-600">{project.description}</p>
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="mt-2 h-20 w-auto object-cover rounded"
                />
              )}
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteProject(project.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPanel;