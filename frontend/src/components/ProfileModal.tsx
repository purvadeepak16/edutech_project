import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("sc_token");
      if (!token) {
        return;
      }

      setIsLoading(true);
      const res = await fetch("/api/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("sc_token");
          return;
        }
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setUserProfile({
        name: data.name || "User",
        email: data.email || "",
        role: data.role || "user",
        createdAt: data.createdAt
          ? new Date(data.createdAt).toLocaleDateString()
          : "N/A",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast({
        title: "Error",
        description: "Failed to load profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && !userProfile) {
      fetchUserProfile();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Information</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : userProfile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-border/30">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-pink flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{userProfile.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {userProfile.role}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Email Address
                </p>
                <p className="text-sm break-words bg-muted/50 p-3 rounded-lg">
                  {userProfile.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Account Role
                </p>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      userProfile.role === "teacher"
                        ? "bg-accent/20 text-accent"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {userProfile.role.charAt(0).toUpperCase() +
                      userProfile.role.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Member Since
                </p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {userProfile.createdAt}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
