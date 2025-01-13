import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Pencil } from "lucide-react";
import ProjectForm from "./ProjectForm";
import SocialMediaContent from "./SocialMediaContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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

  const handleAddProject = async (projectData: {
    title: string;
    description: string;
    image_url: string;
  }) => {
    try {
      const { error } = await supabase.from("projects").insert([
        {
          ...projectData,
          order_index: projects.length,
        },
      ]);
      if (error) throw error;

      toast({
        title: "Project added successfully",
      });
      setShowAddDialog(false);
      fetchProjects();
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error adding project",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProject = async (
    id: string,
    projectData: {
      title: string;
      description: string;
      image_url: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", id);
      if (error) throw error;

      toast({
        title: "Project updated successfully",
      });
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error updating project",
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
      <Button onClick={() => setShowAddDialog(true)}>Add New Project</Button>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col space-y-4 p-4 border rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingProject(project)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t">
              <h4 className="font-medium mb-4">Social Media Content</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <SocialMediaContent
                  projectId={project.id}
                  projectTitle={project.title}
                  projectDescription={project.description || ""}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm onSubmit={handleAddProject} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingProject !== null}
        onOpenChange={(open) => !open && setEditingProject(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              initialData={editingProject}
              onSubmit={(data) => handleUpdateProject(editingProject.id, data)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPanel;