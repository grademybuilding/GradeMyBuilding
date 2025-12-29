import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Shield, HelpCircle, ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { ChangePasswordModal } from "@/components/Settings/ChangePasswordModal";
import { TwoFactorSetup } from "@/components/Settings/TwoFactorSetup";
import { EditProfileModal } from "@/components/Settings/EditProfileModal";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Settings() {
  const { profile, user } = useAuth();
  const { preferences, loading: prefsLoading, updatePreferences } = useNotificationPreferences();
  
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [checkingMfa, setCheckingMfa] = useState(true);
  const [localProfile, setLocalProfile] = useState(profile);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  useEffect(() => {
    checkMfaStatus();
  }, [user]);

  const checkMfaStatus = async () => {
    if (!user) return;
    
    setCheckingMfa(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const hasVerifiedFactor = data.totp.some(factor => factor.status === "verified");
      setMfaEnabled(hasVerifiedFactor);
    } catch (error) {
      // Silent fail
    } finally {
      setCheckingMfa(false);
    }
  };

  const handleEmailNotificationsChange = async (checked: boolean) => {
    const success = await updatePreferences({ email_notifications: checked });
    if (success) {
      toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
    } else {
      toast.error("Failed to update notification settings");
    }
  };

  const handleInspectionRemindersChange = async (checked: boolean) => {
    const success = await updatePreferences({ inspection_reminders: checked });
    if (success) {
      toast.success(checked ? "Inspection reminders enabled" : "Inspection reminders disabled");
    } else {
      toast.error("Failed to update reminder settings");
    }
  };

  const handleProfileUpdate = async () => {
    // Refetch profile data
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (data) {
      setLocalProfile({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        company_name: data.company_name,
        avatar_url: data.avatar_url,
        role: profile?.role,
      });
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="font-medium">{localProfile?.full_name || "Not set"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{localProfile?.email || "Not set"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="font-medium">{localProfile?.phone || "Not set"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Company</Label>
                <p className="font-medium">{localProfile?.company_name || "Not set"}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setEditProfileOpen(true)}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prefsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={preferences?.email_notifications ?? true}
                    onCheckedChange={handleEmailNotificationsChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Inspection Reminders</p>
                    <p className="text-sm text-muted-foreground">Get reminded of upcoming inspections</p>
                  </div>
                  <Switch 
                    checked={preferences?.inspection_reminders ?? true}
                    onCheckedChange={handleInspectionRemindersChange}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              {checkingMfa ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : mfaEnabled ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-medium">Enabled</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldX className="h-5 w-5" />
                  <span className="text-sm">Disabled</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
                Change Password
              </Button>
              <Button 
                variant={mfaEnabled ? "outline" : "default"}
                onClick={() => setTwoFactorOpen(true)}
              >
                {mfaEnabled ? "Manage 2FA" : "Enable Two-Factor Authentication"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Help & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">View Documentation</Button>
              <Button variant="outline">Contact Support</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ChangePasswordModal 
        open={changePasswordOpen} 
        onOpenChange={setChangePasswordOpen} 
      />
      <TwoFactorSetup 
        open={twoFactorOpen} 
        onOpenChange={setTwoFactorOpen}
        onStatusChange={checkMfaStatus}
      />
      <EditProfileModal
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        profile={localProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}
