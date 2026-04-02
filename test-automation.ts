import { initializeAutomation } from './src/server/automation-init';

async function testAutomation() {
  console.log('Testing automation initialization...');
  try {
    await initializeAutomation();
    console.log('✅ Automation initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize automation:', error);
  }
}

testAutomation();