import * as cron from 'node-cron';
import { sendLowStockAlerts } from './inventory';
import { processCartRecovery } from './cart-recovery';
import { applyDynamicPricing } from './dynamic-pricing';
import { updateLastExecuted } from './settings';
import { createAlert } from './alerts';

class AutomationScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  start() {
    console.log('🚀 Starting automation scheduler...');

    // Inventory alerts - every 6 hours
    this.scheduleJob('inventory-check', '0 */6 * * *', async () => {
      console.log('📦 Running inventory check...');
      try {
        const alerts = await sendLowStockAlerts();
        await updateLastExecuted('inventory_alerts_enabled');
        console.log(`📦 Inventory check complete. Found ${alerts?.length || 0} low stock items.`);
      } catch (error) {
        console.error('❌ Inventory check failed:', error);
        await createAlert({
          type: 'SYSTEM_ERROR',
          title: 'Inventory Check Failed',
          message: `Error: ${error.message}`,
          priority: 'HIGH'
        });
      }
    });

    // Cart recovery - every hour
    this.scheduleJob('cart-recovery', '0 * * * *', async () => {
      console.log('🛒 Running cart recovery check...');
      try {
        const processed = await processCartRecovery();
        await updateLastExecuted('cart_recovery_enabled');
        console.log(`🛒 Cart recovery complete. Processed ${processed} abandoned carts.`);
      } catch (error) {
        console.error('❌ Cart recovery failed:', error);
        await createAlert({
          type: 'SYSTEM_ERROR',
          title: 'Cart Recovery Failed',
          message: `Error: ${error.message}`,
          priority: 'HIGH'
        });
      }
    });

    // Dynamic pricing - daily at 2 AM
    this.scheduleJob('dynamic-pricing', '0 2 * * *', async () => {
      console.log('💰 Running dynamic pricing update...');
      try {
        const updated = await applyDynamicPricing();
        await updateLastExecuted('dynamic_pricing_enabled');
        console.log(`💰 Dynamic pricing complete. Updated ${updated} products.`);
      } catch (error) {
        console.error('❌ Dynamic pricing failed:', error);
        await createAlert({
          type: 'SYSTEM_ERROR',
          title: 'Dynamic Pricing Failed',
          message: `Error: ${error.message}`,
          priority: 'HIGH'
        });
      }
    });

    // Sales monitoring - every 4 hours
    this.scheduleJob('sales-monitoring', '0 */4 * * *', async () => {
      console.log('📊 Running sales monitoring...');
      try {
        // This would integrate with the existing sales drop alerts
        // For now, just log
        await updateLastExecuted('sales_drop_alerts_enabled');
        console.log('📊 Sales monitoring complete.');
      } catch (error) {
        console.error('❌ Sales monitoring failed:', error);
      }
    });

    console.log('✅ Automation scheduler started successfully');
  }

  private scheduleJob(name: string, cronExpression: string, job: () => Promise<void>) {
    const task = cron.schedule(cronExpression, job, {
      scheduled: false // Don't start immediately
    });

    this.jobs.set(name, task);
    task.start();
    console.log(`📅 Scheduled ${name}: ${cronExpression}`);
  }

  stop() {
    console.log('🛑 Stopping automation scheduler...');
    for (const [name, task] of this.jobs) {
      task.stop();
      console.log(`🛑 Stopped ${name}`);
    }
    this.jobs.clear();
  }

  // Manual trigger for testing
  async runJob(jobName: string) {
    switch (jobName) {
      case 'inventory':
        return await sendLowStockAlerts();
      case 'cart-recovery':
        return await processCartRecovery();
      case 'dynamic-pricing':
        return await applyDynamicPricing();
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }
}

export const automationScheduler = new AutomationScheduler();