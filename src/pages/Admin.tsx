import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectsPanel from "@/components/admin/ProjectsPanel";
import SocialMediaPanel from "@/components/admin/SocialMediaPanel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      duration: 2000,
    });
    navigate("/");
  };

  if (!session) {
    return (
      <div className="container max-w-md mx-auto mt-32 p-4">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-24">
      <div className="flex justify-end mb-6">
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold pl-4">Admin Panel</h1>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            <ProjectsPanel />
          </TabsContent>
          <TabsContent value="social">
            <SocialMediaPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;