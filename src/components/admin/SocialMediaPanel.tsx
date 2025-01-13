import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2 } from "lucide-react";

interface SocialMedia {
  id: string;
  platform: string;
  url: string;
}

const SocialMediaPanel = () => {
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSocialMedia, setNewSocialMedia] = useState({
    platform: "",
    url: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSocialMedia();
  }, []);

  const fetchSocialMedia = async () => {
    try {
      const { data, error } = await supabase.from("social_media").select("*");
      if (error) throw error;
      setSocialMedia(data || []);
    } catch (error) {
      console.error("Error fetching social media:", error);
      toast({
        title: "Error fetching social media links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSocialMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialMedia.platform || !newSocialMedia.url) return;

    try {
      const { error } = await supabase.from("social_media").insert([
        {
          platform: newSocialMedia.platform,
          url: newSocialMedia.url,
        },
      ]);
      if (error) throw error;

      toast({
        title: "Social media link added successfully",
      });
      setNewSocialMedia({ platform: "", url: "" });
      fetchSocialMedia();
    } catch (error) {
      console.error("Error adding social media:", error);
      toast({
        title: "Error adding social media link",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSocialMedia = async (id: string) => {
    try {
      const { error } = await supabase.from("social_media").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Social media link deleted successfully",
      });
      fetchSocialMedia();
    } catch (error) {
      console.error("Error deleting social media:", error);
      toast({
        title: "Error deleting social media link",
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
      <form onSubmit={handleAddSocialMedia} className="space-y-4">
        <Input
          placeholder="Platform (e.g., Twitter, LinkedIn)"
          value={newSocialMedia.platform}
          onChange={(e) =>
            setNewSocialMedia({ ...newSocialMedia, platform: e.target.value })
          }
        />
        <Input
          placeholder="URL"
          value={newSocialMedia.url}
          onChange={(e) =>
            setNewSocialMedia({ ...newSocialMedia, url: e.target.value })
          }
        />
        <Button type="submit">Add Social Media Link</Button>
      </form>

      <div className="space-y-4">
        {socialMedia.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{item.platform}</h3>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {item.url}
              </a>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteSocialMedia(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaPanel;