import { automationScheduler } from "@/server/services/automation/scheduler";
import { initializeDefaultSettings } from "@/server/services/automation/settings";

// Initialize automation system
export async function initializeAutomation() {
  try {
    console.log('🔧 Initializing automation system...');

    // Initialize default settings
    await initializeDefaultSettings();

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