"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminTwoFactorSettingsProps = {
  initialEnabled: boolean;
  initialHasPendingSetup: boolean;
  initialUpdatedAt: string | null;
  username: string;
};

type SetupPayload = {
  enabled: boolean;
  formattedSecret: string;
  otpauthUrl: string;
  secret: string;
  username: string;
};

export default function AdminTwoFactorSettings({
  initialEnabled,
  initialHasPendingSetup,
  initialUpdatedAt,
  username,
}: AdminTwoFactorSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [hasPendingSetup, setHasPendingSetup] = useState(initialHasPendingSetup);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [setupPayload, setSetupPayload] = useState<SetupPayload | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isStartingSetup, setIsStartingSetup] = useState(false);
  const [isConfirmingSetup, setIsConfirmingSetup] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Unable to copy ${label.toLowerCase()}.`);
    }
  }

  async function startSetup() {
    setIsStartingSetup(true);

    try {
      const response = await fetch("/api/admin/2fa", {
        method: "POST",
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<
        SetupPayload & { error: string }
      >;

      if (!response.ok) {
        throw new Error(payload.error || "Unable to start 2FA setup.");
      }

      setSetupPayload(payload as SetupPayload);
      setHasPendingSetup(true);
      setConfirmCode("");
      toast.success(
        enabled
          ? "A new admin 2FA secret is ready. Confirm it to rotate your authenticator."
          : "Admin 2FA setup started. Add the secret to your authenticator app.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to start 2FA setup.",
      );
    } finally {
      setIsStartingSetup(false);
    }
  }

  async function confirmSetup() {
    setIsConfirmingSetup(true);

    try {
      const response = await fetch("/api/admin/2fa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: confirmCode }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to enable admin 2FA.");
      }

      setEnabled(true);
      setHasPendingSetup(false);
      setSetupPayload(null);
      setConfirmCode("");
      setUpdatedAt(new Date().toISOString());
      toast.success(payload.message || "Admin 2FA enabled.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to enable admin 2FA.",
      );
    } finally {
      setIsConfirmingSetup(false);
    }
  }

  async function disableTwoFactor() {
    setIsDisabling(true);

    try {
      const response = await fetch("/api/admin/2fa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: disableCode,
          currentPassword,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to disable admin 2FA.");
      }

      setEnabled(false);
      setHasPendingSetup(false);
      setSetupPayload(null);
      setDisableCode("");
      setCurrentPassword("");
      setUpdatedAt(new Date().toISOString());
      toast.success(payload.message || "Admin 2FA disabled.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to disable admin 2FA.",
      );
    } finally {
      setIsDisabling(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 luxury-shadow backdrop-blur sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-[var(--luxury-gold-deep)]">
              Admin 2FA
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-950">
              Authenticator app protection
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--luxury-muted)]">
              Protect the separate admin account with a time-based 6-digit code
              from Google Authenticator, Authy, Microsoft Authenticator, or any
              compatible app.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
            <p className="font-medium text-stone-900">
              {enabled ? "Enabled" : "Disabled"}
            </p>
            <p className="mt-1 text-stone-500">Admin: {username}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
              Current Status
            </p>
            <p className="mt-3 text-lg font-semibold text-stone-950">
              {enabled ? "2FA is active" : "2FA not enabled yet"}
            </p>
            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
              {enabled
                ? "Every admin login now requires your password and authenticator code."
                : "Admin login still uses only the password until you complete setup."}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
              Last Updated
            </p>
            <p className="mt-3 text-lg font-semibold text-stone-950">
              {updatedAt ? new Date(updatedAt).toLocaleString() : "Not configured"}
            </p>
            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
              Resetting the seeded admin credentials also clears admin 2FA for
              recovery.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-stone-200 bg-stone-50/60 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-stone-950">
                {enabled ? "Rotate authenticator secret" : "Start setup"}
              </h3>
              <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                Generate a secret, save it in your authenticator app, then enter
                the 6-digit code to confirm.
              </p>
            </div>
            <Button
              type="button"
              onClick={startSetup}
              disabled={isStartingSetup}
              className="sm:w-auto"
            >
              {isStartingSetup
                ? "Preparing..."
                : enabled
                  ? "Generate New Secret"
                  : "Enable 2FA"}
            </Button>
          </div>

          {hasPendingSetup && !setupPayload ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              A 2FA setup session is pending, but the secret is not available in
              this browser anymore. Generate a fresh secret and confirm it to
              finish setup.
            </p>
          ) : null}

          {setupPayload ? (
            <div className="mt-6 space-y-5 rounded-[1.5rem] border border-stone-200 bg-white p-5">
              <div>
                <p className="text-sm font-medium text-stone-900">
                  1. Add this setup key to your authenticator app
                </p>
                <div className="mt-3 rounded-xl bg-stone-950 px-4 py-3 font-mono text-sm tracking-[0.25em] text-stone-50">
                  {setupPayload.formattedSecret}
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyValue(setupPayload.secret, "Setup key")}
                  >
                    Copy Setup Key
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyValue(setupPayload.otpauthUrl, "Setup link")}
                  >
                    Copy otpauth URL
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-two-factor-code">
                  2. Enter the 6-digit code from your app
                </Label>
                <Input
                  id="confirm-two-factor-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={confirmCode}
                  onChange={(event) =>
                    setConfirmCode(
                      event.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  className="mt-2"
                  placeholder="123456"
                />
                <Button
                  type="button"
                  onClick={confirmSetup}
                  disabled={isConfirmingSetup}
                  className="mt-4"
                >
                  {isConfirmingSetup ? "Confirming..." : "Confirm and Enable"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 luxury-shadow backdrop-blur sm:p-8">
        <h2 className="text-2xl font-semibold text-stone-950">
          Disable or recover
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
          Disabling 2FA requires both your current admin password and a valid
          authenticator code. If you lose access entirely, reseeding the admin
          account clears 2FA and restores the seeded credentials.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="disable-current-password">Current Password</Label>
            <Input
              id="disable-current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="mt-2"
              disabled={!enabled}
            />
          </div>

          <div>
            <Label htmlFor="disable-two-factor-code">Authenticator Code</Label>
            <Input
              id="disable-two-factor-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={disableCode}
              onChange={(event) =>
                setDisableCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
              className="mt-2"
              disabled={!enabled}
              placeholder="123456"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={disableTwoFactor}
            disabled={!enabled || isDisabling}
            className="w-full"
          >
            {isDisabling ? "Disabling..." : "Disable Admin 2FA"}
          </Button>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5 text-sm text-[var(--luxury-muted)]">
          <p className="font-medium text-stone-900">Recovery path</p>
          <p className="mt-2 leading-7">
            If you lose the authenticator app, log in with another active admin
            session and disable 2FA here, or reset the seeded admin account and
            re-run the seed command to clear 2FA.
          </p>
        </div>
      </section>
    </div>
  );
}
