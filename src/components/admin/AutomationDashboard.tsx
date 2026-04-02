'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, ShoppingCart, Package, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

interface AutomationSetting {
  id: string;
  key: string;
  value: any;
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

export default function AutomationDashboard() {
  const [settings, setSettings] = useState<AutomationSetting[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, alertsRes] = await Promise.all([
        fetch('/api/automation?action=settings'),
        fetch('/api/automation?action=alerts')
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
  };

  const updateSetting = async (key: string, isEnabled: boolean, value?: any) => {
    try {
      const response = await fetch('/api/automation?action=update-setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, isEnabled, value })
      });

      if (response.ok) {
        toast.success('Setting updated');
        loadData();
      } else {
        toast.error('Failed to update setting');
      }
    } catch (error) {
      toast.error('Failed to update setting');
    }
  };

  const runJob = async (jobName: string) => {
    try {
      const response = await fetch('/api/automation?action=run-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobName })
      });

      if (response.ok) {
        toast.success(`${jobName} job completed`);
        loadData();
      } else {
        toast.error(`Failed to run ${jobName} job`);
      }
    } catch (error) {
      toast.error(`Failed to run ${jobName} job`);
    }
  };

  const markAlertRead = async (alertId: string) => {
    try {
      await fetch('/api/automation?action=mark-alert-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      loadData();
    } catch (error) {
      toast.error('Failed to mark alert as read');
    }
  };

  if (loading) {
    return <div className="p-6">Loading automation dashboard...</div>;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'INVENTORY_LOW': return <Package className="h-4 w-4" />;
      case 'SALES_DROP': return <TrendingUp className="h-4 w-4" />;
      case 'CART_ABANDONED': return <ShoppingCart className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Automation Dashboard</h1>
        <Button onClick={loadData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Alerts ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-gray-500">No active alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAlertRead(alert.id)}
                  >
                    Mark Read
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                <p className="text-sm text-gray-600">{setting.description}</p>
                {setting.lastExecutedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last executed: {new Date(setting.lastExecutedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  checked={setting.isEnabled}
                  onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                />
                {/* Manual run buttons for some jobs */}
                {setting.key.includes('enabled') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const jobName = setting.key.replace('_enabled', '');
                      runJob(jobName);
                    }}
                  >
                    Run Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => runJob('inventory')} className="h-20 flex-col">
              <Package className="h-6 w-6 mb-2" />
              Check Inventory
            </Button>
            <Button onClick={() => runJob('cart-recovery')} className="h-20 flex-col">
              <ShoppingCart className="h-6 w-6 mb-2" />
              Send Recoveries
            </Button>
            <Button onClick={() => runJob('dynamic-pricing')} className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              Update Prices
            </Button>
            <Button onClick={loadData} variant="outline" className="h-20 flex-col">
              <Bell className="h-6 w-6 mb-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}