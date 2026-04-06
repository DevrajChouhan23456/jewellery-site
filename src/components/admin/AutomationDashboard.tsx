'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Package,
  RefreshCcw,
  ShoppingCart,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { BlurFade } from '@/components/ui/magicui/blur-fade';

interface AutomationSetting {
  id: string;
  key: string;
  value: unknown;
  description: string;
  isEnabled: boolean;
  lastExecutedAt?: string;
}

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

function formatDate(value?: string) {
  if (!value) {
    return 'Never run';
  }

  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatSettingKey(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AutomationDashboard() {
  const [settings, setSettings] = useState<AutomationSetting[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingKeys, setPendingKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [settingsRes, alertsRes] = await Promise.all([
        fetch('/api/automation?action=settings'),
        fetch('/api/automation?action=alerts'),
      ]);

      const settingsData = await settingsRes.json();
      const alertsData = await alertsRes.json();

      setSettings(settingsData.settings || []);
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error('Failed to load automation data:', error);
      toast.error('Failed to load automation data');
    } finally {
      setLoading(false);
    }
  }

  async function updateSetting(key: string, isEnabled: boolean, value?: unknown) {
    setPendingKeys((current) => ({ ...current, [key]: true }));

    try {
      const response = await fetch('/api/automation?action=update-setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, isEnabled, value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      toast.success('Automation updated');
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update setting');
    } finally {
      setPendingKeys((current) => ({ ...current, [key]: false }));
    }
  }

  async function runJob(jobName: string) {
    setPendingKeys((current) => ({ ...current, [jobName]: true }));

    try {
      const response = await fetch('/api/automation?action=run-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to run ${jobName}`);
      }

      toast.success(`${jobName} automation ran successfully`);
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to run ${jobName}`);
    } finally {
      setPendingKeys((current) => ({ ...current, [jobName]: false }));
    }
  }

  async function markAlertRead(alertId: string) {
    setPendingKeys((current) => ({ ...current, [alertId]: true }));

    try {
      const response = await fetch('/api/automation?action=mark-alert-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark alert read');
      }

      await loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update alert');
    } finally {
      setPendingKeys((current) => ({ ...current, [alertId]: false }));
    }
  }

  const summary = useMemo(
    () => ({
      enabledSettings: settings.filter((setting) => setting.isEnabled).length,
      activeAlerts: alerts.filter((alert) => !alert.isRead).length,
      criticalAlerts: alerts.filter((alert) => alert.priority === 'CRITICAL').length,
    }),
    [alerts, settings],
  );

  function getPriorityClass(priority: string) {
    switch (priority) {
      case 'CRITICAL':
        return 'border-rose-200 bg-rose-50 text-rose-700';
      case 'HIGH':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'MEDIUM':
        return 'border-cyan-200 bg-cyan-50 text-cyan-700';
      default:
        return 'border-stone-200 bg-stone-50 text-stone-700';
    }
  }

  function getAlertIcon(type: string) {
    switch (type) {
      case 'INVENTORY_LOW':
        return <Package className="size-4" />;
      case 'SALES_DROP':
        return <TrendingUp className="size-4" />;
      case 'CART_ABANDONED':
        return <ShoppingCart className="size-4" />;
      default:
        return <Bell className="size-4" />;
    }
  }

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-white/70 bg-white/86 px-6 py-8 text-sm text-stone-500 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)]">
        Loading automation workspace...
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <BlurFade inView delay={0.04}>
        <Card className="rounded-[2rem] border-white/70 bg-white/86 py-0 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)]">
          <CardHeader className="border-b border-stone-100 px-6 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge
                  variant="outline"
                  className="rounded-full border-stone-200 bg-stone-50 text-stone-700"
                >
                  Automation
                </Badge>
                <CardTitle className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
                  Operations automation
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-stone-500">
                  Keep key recovery, pricing, and inventory jobs in motion.
                </CardDescription>
              </div>
              <Button
                onClick={() => void loadData()}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <RefreshCcw className="size-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-3 px-6 py-5 sm:grid-cols-3 sm:px-7">
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Enabled automations
              </p>
              <p className="mt-2 text-2xl font-semibold text-stone-950">
                {summary.enabledSettings}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Active alerts
              </p>
              <p className="mt-2 text-2xl font-semibold text-stone-950">
                {summary.activeAlerts}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Critical alerts
              </p>
              <p className="mt-2 text-2xl font-semibold text-stone-950">
                {summary.criticalAlerts}
              </p>
            </div>
          </CardContent>
        </Card>
      </BlurFade>

      <BlurFade inView delay={0.08}>
        <Card className="rounded-[2rem] border-white/70 bg-white/86 py-0 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)]">
          <CardHeader className="border-b border-stone-100 px-6 py-5 sm:px-7">
            <CardTitle className="text-lg font-semibold text-stone-950">
              Active alerts
            </CardTitle>
            <CardDescription>
              Review the most recent operational warnings first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 py-5 sm:px-7">
            {alerts.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50/70 px-4 py-8 text-center text-sm text-stone-500">
                No active alerts right now.
              </div>
            ) : (
              alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-stone-950">
                          {alert.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={`rounded-full ${getPriorityClass(alert.priority)}`}
                        >
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-stone-600">
                        {alert.message}
                      </p>
                      <p className="mt-2 text-xs text-stone-500">
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={Boolean(pendingKeys[alert.id])}
                      onClick={() => void markAlertRead(alert.id)}
                    >
                      Mark read
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </BlurFade>

      <BlurFade inView delay={0.12}>
        <Card className="rounded-[2rem] border-white/70 bg-white/86 py-0 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)]">
          <CardHeader className="border-b border-stone-100 px-6 py-5 sm:px-7">
            <CardTitle className="text-lg font-semibold text-stone-950">
              Automation settings
            </CardTitle>
            <CardDescription>
              Toggle always-on jobs and trigger one-off runs when needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 py-5 sm:px-7">
            {settings.map((setting) => {
              const jobName = setting.key.replace('_enabled', '');
              const running = Boolean(pendingKeys[setting.key] || pendingKeys[jobName]);

              return (
                <div
                  key={setting.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-stone-950">
                          {formatSettingKey(setting.key)}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            setting.isEnabled
                              ? 'rounded-full border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'rounded-full border-stone-200 bg-stone-50 text-stone-700'
                          }
                        >
                          {setting.isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-stone-600">
                        {setting.description}
                      </p>
                      <p className="mt-2 text-xs text-stone-500">
                        Last executed: {formatDate(setting.lastExecutedAt)}
                      </p>
                    </div>
                    <Switch
                      checked={setting.isEnabled}
                      disabled={running}
                      onCheckedChange={(checked) =>
                        void updateSetting(setting.key, checked)
                      }
                    />
                  </div>

                  {setting.key.includes('enabled') ? (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={running}
                        onClick={() => void runJob(jobName)}
                      >
                        <Sparkles className="size-4" />
                        Run now
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </BlurFade>

      <BlurFade inView delay={0.16}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Button
            onClick={() => void runJob('inventory')}
            className="h-20 rounded-[1.5rem] bg-stone-950 text-white hover:bg-stone-900"
            disabled={Boolean(pendingKeys.inventory)}
          >
            <Package className="size-5" />
            Check inventory
          </Button>
          <Button
            onClick={() => void runJob('cart-recovery')}
            className="h-20 rounded-[1.5rem] bg-white text-stone-950 ring-1 ring-stone-200 hover:bg-stone-50"
            disabled={Boolean(pendingKeys['cart-recovery'])}
          >
            <ShoppingCart className="size-5" />
            Send recoveries
          </Button>
          <Button
            onClick={() => void runJob('dynamic-pricing')}
            className="h-20 rounded-[1.5rem] bg-white text-stone-950 ring-1 ring-stone-200 hover:bg-stone-50"
            disabled={Boolean(pendingKeys['dynamic-pricing'])}
          >
            <TrendingUp className="size-5" />
            Update prices
          </Button>
          <Button
            onClick={() => void loadData()}
            className="h-20 rounded-[1.5rem] bg-white text-stone-950 ring-1 ring-stone-200 hover:bg-stone-50"
          >
            <AlertTriangle className="size-5" />
            Refresh alerts
          </Button>
        </div>
      </BlurFade>
    </section>
  );
}
