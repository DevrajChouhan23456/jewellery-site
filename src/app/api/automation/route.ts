import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/server/auth/admin";
import { getAllAutomationSettings, setAutomationSetting, initializeDefaultSettings } from "@/server/services/automation/settings";
import { getUnreadAlerts, markAlertAsRead, resolveAlert, getCriticalAlerts } from "@/server/services/automation/alerts";
import { automationScheduler } from "@/server/services/automation/scheduler";

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdminApiAccess();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'settings':
        const settings = await getAllAutomationSettings();
        return NextResponse.json({ settings });

      case 'alerts':
        const alerts = await getUnreadAlerts();
        return NextResponse.json({ alerts });

      case 'critical-alerts':
        const criticalAlerts = await getCriticalAlerts();
        return NextResponse.json({ alerts: criticalAlerts });

      default:
        return NextResponse.json({
          message: 'Automation API',
          endpoints: {
            'GET /api/automation?action=settings': 'Get all automation settings',
            'GET /api/automation?action=alerts': 'Get unread alerts',
            'GET /api/automation?action=critical-alerts': 'Get critical alerts',
            'POST /api/automation?action=update-setting': 'Update automation setting',
            'POST /api/automation?action=mark-alert-read': 'Mark alert as read',
            'POST /api/automation?action=resolve-alert': 'Resolve alert',
            'POST /api/automation?action=run-job': 'Manually run automation job',
            'POST /api/automation?action=initialize': 'Initialize default settings'
          }
        });
    }
  } catch (error) {
    console.error('Automation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminApiAccess();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    const body = await req.json();

    switch (action) {
      case 'update-setting':
        const { key, value, description, isEnabled } = body;
        const setting = await setAutomationSetting({ key, value, description, isEnabled });
        return NextResponse.json({ setting });

      case 'mark-alert-read':
        const { alertId } = body;
        const alert = await markAlertAsRead(alertId);
        return NextResponse.json({ alert });

      case 'resolve-alert':
        const { resolveAlertId } = body;
        const resolvedAlert = await resolveAlert(resolveAlertId);
        return NextResponse.json({ alert: resolvedAlert });

      case 'run-job':
        const { jobName } = body;
        const result = await automationScheduler.runJob(jobName);
        return NextResponse.json({ result, jobName });

      case 'initialize':
        await initializeDefaultSettings();
        return NextResponse.json({ message: 'Default settings initialized' });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Automation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}