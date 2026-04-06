import { automationScheduler } from "@/server/services/automation/scheduler";
import { initializeDefaultSettings } from "@/server/services/automation/settings";
import { registerOrderNotificationListeners } from "@/server/event-listeners/order-notifications";

// Initialize automation system
export async function initializeAutomation() {
  try {
    console.log('🔧 Initializing automation system...');

    // Initialize default settings
    await initializeDefaultSettings();

    // Register event listeners for order notifications
    registerOrderNotificationListeners();

    // Start the scheduler
    automationScheduler.start();

    console.log('✅ Automation system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize automation system:', error);
  }
}

// Cleanup function for graceful shutdown
export function cleanupAutomation() {
  automationScheduler.stop();
}