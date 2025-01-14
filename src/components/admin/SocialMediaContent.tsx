import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import SocialMediaAnalytics from "./SocialMediaAnalytics";

interface SocialMediaContentProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  imageUrl?: string;
}

const SocialMediaContent = ({
  projectId,
  projectTitle,
  projectDescription,
  imageUrl,
}: SocialMediaContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [platform, setPlatform] = useState<"linkedin" | "twitter">("linkedin");
  const [tone, setTone] = useState<string>("professional");
  const [content, setContent] = useState("");
  const [includeImage, setIncludeImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-social-content",
        {
          body: { projectTitle, projectDescription, platform, tone },
        }
      );

      if (error) throw error;
      setContent(data.content);
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error generating content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveContent = async () => {
    try {
      const { error } = await supabase.from("project_social_content").insert([
        {
          project_id: projectId,
          platform,
          content,
          tone,
          status: "draft",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Content saved successfully",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error saving content",
        variant: "destructive",
      });
    }
  };

  const postContent = async () => {
    setIsPosting(true);
    try {
      // Save the content first
      const { data: savedContent, error: saveError } = await supabase
        .from("project_social_content")
        .insert([
          {
            project_id: projectId,
            platform,
            content,
            tone,
            status: "published",
            published_at: new Date().toISOString(),
            views: 0,
            likes: 0,
            shares: 0,
            clicks: 0,
            engagement_rate: 0.0,
          },
        ])
        .select()
        .single();

      if (saveError) throw saveError;

      // Simulate successful API post
      console.log("Simulating post to", platform, "with content:", {
        content,
        imageUrl: includeImage ? imageUrl : undefined,
      });

      toast({
        title: `Posted successfully to ${platform}`,
        description: "Note: This is currently in test mode",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error posting content:", error);
      toast({
        title: `Error posting to ${platform}`,
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Create Social Media Post</Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Social Media Post</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Select
                value={platform}
                onValueChange={(value: "linkedin" | "twitter") =>
                  setPlatform(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="informative">Informative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Button
                onClick={generateContent}
                disabled={isGenerating}
                variant="secondary"
              >
                {isGenerating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Content
              </Button>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Generated content will appear here..."
                className="h-32"
              />
            </div>

            {imageUrl && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-image"
                    checked={includeImage}
                    onCheckedChange={(checked) => setIncludeImage(!!checked)}
                  />
                  <label
                    htmlFor="include-image"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include project image
                  </label>
                </div>
                {includeImage && (
                  <img
                    src={imageUrl}
                    alt="Project preview"
                    className="mt-2 h-32 w-auto object-cover rounded"
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="secondary" onClick={saveContent}>
              Save as Draft
            </Button>
            <Button onClick={postContent} disabled={isPosting}>
              {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-8">
        <SocialMediaAnalytics projectId={projectId} />
      </div>
    </>
  );
};

export default SocialMediaContent;