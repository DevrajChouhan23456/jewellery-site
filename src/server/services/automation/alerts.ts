import prisma from "@/lib/prisma";
import type { AlertPriority, AlertType } from "@prisma/client";

export interface CreateAlertData {
  type: AlertType;
  title: string;
  message: string;
  priority?: AlertPriority;
  metadata?: any;
}

export async function createAlert(data: CreateAlertData) {
  return await prisma.alert.create({
    data: {
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'MEDIUM',
      metadata: data.metadata
    }
  });
}

export async function getUnreadAlerts(limit = 50) {
  return await prisma.alert.findMany({
    where: { isRead: false },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

export async function markAlertAsRead(alertId: string) {
  return await prisma.alert.update({
    where: { id: alertId },
    data: { isRead: true, updatedAt: new Date() }
  });
}

export async function resolveAlert(alertId: string) {
  return await prisma.alert.update({
    where: { id: alertId },
    data: { resolvedAt: new Date(), updatedAt: new Date() }
  });
}

export async function getAlertsByType(type: AlertType, limit = 20) {
  return await prisma.alert.findMany({
    where: { type },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

export async function getCriticalAlerts() {
  return await prisma.alert.findMany({
    where: {
      priority: 'CRITICAL',
      isRead: false,
      resolvedAt: null
    },
    orderBy: { createdAt: 'desc' }
  });
}