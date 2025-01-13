import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProjectFormProps {
  onSubmit: (project: {
    title: string;
    description: string;
    image_url: string;
  }) => void;
  initialData?: {
    title: string;
    description: string;
    image_url: string;
  };
}

const ProjectForm = ({ onSubmit, initialData }: ProjectFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [enhancedDescription, setEnhancedDescription] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { url } = await response.json();
      setImageUrl(url);
      toast({
        title: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const enhanceDescription = async () => {
    if (!description) return;

    setIsEnhancing(true);
    try {
      const response = await fetch("/api/enhance-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) throw new Error("Enhancement failed");

      const { enhancedText } = await response.json();
      setEnhancedDescription(enhancedText);
      setShowConfirmation(true);
    } catch (error) {
      toast({
        title: "Failed to enhance description",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description: enhancedDescription || description,
      image_url: imageUrl,
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="space-y-2">
          <Textarea
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Button
            type="button"
            variant="secondary"
            onClick={enhanceDescription}
            disabled={!description || isEnhancing}
          >
            {isEnhancing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enhance Description
          </Button>
        </div>
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Project preview"
              className="mt-2 h-32 w-auto object-cover rounded"
            />
          )}
        </div>
        <Button type="submit" className="w-full">
          {initialData ? "Update Project" : "Add Project"}
        </Button>
      </form>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Enhanced Description</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Original Description:</h4>
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            </div>
            <div>
              <h4 className="font-medium">Enhanced Description:</h4>
              <p className="mt-1 text-sm text-gray-600">{enhancedDescription}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEnhancedDescription("");
                setShowConfirmation(false);
              }}
            >
              Keep Original
            </Button>
            <Button
              onClick={() => {
                setDescription(enhancedDescription);
                setShowConfirmation(false);
              }}
            >
              Use Enhanced
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectForm;