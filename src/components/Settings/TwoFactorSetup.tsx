import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldX, Loader2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TwoFactorSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: () => void;
}

type SetupStep = "loading" | "enroll" | "verify" | "enabled" | "disable-confirm";

export function TwoFactorSetup({ open, onOpenChange, onStatusChange }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>("loading");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      checkMfaStatus();
    }
  }, [open]);

  const checkMfaStatus = async () => {
    setStep("loading");
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const activeFactor = data.totp.find(factor => factor.status === "verified");
      if (activeFactor) {
        setFactorId(activeFactor.id);
        setStep("enabled");
      } else {
        setStep("enroll");
      }
    } catch (error: any) {
      toast.error("Failed to check 2FA status");
      onOpenChange(false);
    }
  };

  const enrollMfa = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep("verify");
    } catch (error: any) {
      toast.error(error.message || "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const verifyMfa = async () => {
    if (!factorId || verificationCode.length !== 6) return;

    setLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (verifyError) throw verifyError;

      toast.success("Two-factor authentication enabled successfully");
      onStatusChange();
      setStep("enabled");
      setVerificationCode("");
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async () => {
    if (!factorId) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;

      toast.success("Two-factor authentication disabled");
      onStatusChange();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account.
          </DialogDescription>
        </DialogHeader>

        {step === "loading" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {step === "enroll" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Protect your account by requiring a verification code from your authenticator app when signing in.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={enrollMfa} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Enable 2FA"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {qrCode && (
                <div className="rounded-lg border bg-white p-2">
                  <img src={qrCode} alt="QR Code" className="h-48 w-48" />
                </div>
              )}
              <p className="text-sm text-center text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {secret && (
                <div className="w-full space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Or enter this code manually:
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all">
                      {secret}
                    </code>
                    <Button variant="outline" size="sm" onClick={copySecret}>
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Enter verification code</Label>
              <Input
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={verifyMfa} 
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Enable"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "enabled" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <ShieldCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium text-green-600 dark:text-green-400">
                  2FA is enabled
                </p>
                <p className="text-sm text-muted-foreground">
                  Your account is protected with two-factor authentication.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setStep("disable-confirm")}
              >
                <ShieldX className="mr-2 h-4 w-4" />
                Disable 2FA
              </Button>
            </div>
          </div>
        )}

        {step === "disable-confirm" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Are you sure you want to disable two-factor authentication? This will make your account less secure.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("enabled")}>
                Keep Enabled
              </Button>
              <Button 
                variant="destructive" 
                onClick={disableMfa}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  "Disable 2FA"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
