import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  id: string;
  platform: string;
  content: string;
  published_at: string;
  views: number;
  likes: number;
  shares: number;
  clicks: number;
  engagement_rate: number;
}

const SocialMediaAnalytics = ({ projectId }: { projectId: string }) => {
  const [posts, setPosts] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data, error } = await supabase
        .from("project_social_content")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error fetching analytics:", error);
        return;
      }

      setPosts(data);
    };

    fetchAnalytics();
  }, [projectId]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Social Media Analytics</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Views: {post.views}</div>
                  <div>Likes: {post.likes}</div>
                  <div>Shares: {post.shares}</div>
                  <div>Clicks: {post.clicks}</div>
                </div>
                <div className="text-sm font-medium">
                  Engagement Rate: {post.engagement_rate}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaAnalytics;