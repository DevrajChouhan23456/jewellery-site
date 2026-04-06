import prisma from "@/lib/prisma";

export interface AutomationSetting {
  key: string;
  value: any;
  description?: string;
  isEnabled?: boolean;
}

export async function getAutomationSetting(key: string) {
  const setting = await prisma.automationSettings.findUnique({
    where: { key }
  });

  return setting;
}

export async function setAutomationSetting(setting: AutomationSetting, retries = 3) {
  const { key, value, description, isEnabled = true } = setting;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await prisma.automationSettings.upsert({
        where: { key },
        update: {
          value,
          description,
          isEnabled,
          updatedAt: new Date()
        },
        create: {
          key,
          value,
          description,
          isEnabled
        }
      });
    } catch (error: any) {
      if (error.code === 'P2034' && attempt < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        continue;
      }
      throw error;
    }
  }
}

export async function updateLastExecuted(key: string) {
  return await prisma.automationSettings.update({
    where: { key },
    data: { lastExecutedAt: new Date() }
  });
}

export async function getAllAutomationSettings() {
  return await prisma.automationSettings.findMany({
    orderBy: { updatedAt: 'desc' }
  });
}

// Default automation settings
export const DEFAULT_AUTOMATION_SETTINGS = [
  {
    key: 'inventory_alerts_enabled',
    value: true,
    description: 'Send alerts when products go below low stock threshold'
  },
  {
    key: 'inventory_alert_email',
    value: 'admin@example.com',
    description: 'Email address to receive inventory alerts'
  },
  {
    key: 'cart_recovery_enabled',
    value: true,
    description: 'Send recovery emails and WhatsApp messages for abandoned carts'
  },
  {
    key: 'cart_recovery_delay_hours',
    value: 24,
    description: 'Hours to wait before sending cart recovery messages'
  },
  {
    key: 'whatsapp_notifications_enabled',
    value: true,
    description: 'Send WhatsApp notifications for orders and updates'
  },
  {
    key: 'email_notifications_enabled',
    value: true,
    description: 'Send email notifications for orders and updates'
  },
  {
    key: 'dynamic_pricing_enabled',
    value: false,
    description: 'Automatically adjust product prices based on demand'
  },
  {
    key: 'dynamic_pricing_interval_hours',
    value: 24,
    description: 'How often to check and update prices'
  },
  {
    key: 'sales_drop_alerts_enabled',
    value: true,
    description: 'Alert when sales drop significantly'
  },
  {
    key: 'recommendations_enabled',
    value: true,
    description: 'Generate product recommendations'
  }
];

export async function initializeDefaultSettings() {
  for (const setting of DEFAULT_AUTOMATION_SETTINGS) {
    await setAutomationSetting(setting);
  }
}