/**
 * Prerequisites Checker for Midnight DAO Deployment
 * 
 * Verifies that all required tools and services are ready
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as http from 'http';
import { config } from 'dotenv';

const execAsync = promisify(exec);
config();

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: CheckResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'warning', message: string) {
  results.push({ name, status, message });
}

async function checkCommand(command: string, name: string, versionFlag = '--version'): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`${command} ${versionFlag}`);
    addResult(name, 'pass', stdout.trim().split('\n')[0]);
    return true;
  } catch (error) {
    addResult(name, 'fail', `${name} not found in PATH`);
    return false;
  }
}

async function checkUrl(url: string, name: string): Promise<boolean> {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
        addResult(name, 'pass', `Accessible at ${url}`);
        resolve(true);
      } else {
        addResult(name, 'fail', `HTTP ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', () => {
      addResult(name, 'fail', `Cannot connect to ${url}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      addResult(name, 'fail', `Connection timeout`);
      resolve(false);
    });

    req.end();
  });
}

async function checkEnvFile(): Promise<boolean> {
  const { readFileSync } = await import('fs');
  try {
    const envContent = readFileSync('.env', 'utf-8');
    if (envContent.includes('DEPLOYER_ADDRESS') && envContent.includes('CONTRACT_ADDRESS')) {
      addResult('.env file', 'pass', 'Contains required variables');
      return true;
    } else {
      addResult('.env file', 'warning', 'Missing some variables (expected after deployment)');
      return true;
    }
  } catch {
    addResult('.env file', 'warning', 'Not found - copy from .env.example');
    return false;
  }
}

async function checkCompiledContract(): Promise<boolean> {
  const { existsSync } = await import('fs');
  if (existsSync('./build/PrivateDAOTreasury.compact')) {
    addResult('Compiled contract', 'pass', 'Found at ./build/PrivateDAOTreasury.compact');
    return true;
  } else {
    addResult('Compiled contract', 'warning', 'Run: compact compile PrivateDAOTreasury.compact --output ./build');
    return false;
  }
}

async function runChecks() {
  console.log('🔍 Checking Prerequisites for Midnight DAO Deployment...\n');

  // Check Node.js and npm
  await checkCommand('node', 'Node.js');
  await checkCommand('npm', 'npm');

  // Check Compact CLI (optional but recommended)
  const hasCompact = await checkCommand('compact', 'Compact CLI');
  if (!hasCompact) {
    addResult('Compact CLI', 'warning', 'Install from: https://github.com/midnightntwrk/compact/releases');
  }

  // Check Docker containers
  console.log('\n🐳 Checking Docker Services...');
  await checkUrl('http://localhost:6300/health', 'Proof Server');
  await checkUrl('http://localhost:9944', 'Midnight Node');
  await checkUrl('http://localhost:8088', 'Indexer');

  // Check configuration files
  console.log('\n📋 Checking Configuration...');
  await checkEnvFile();
  await checkCompiledContract();

  // Print results
  console.log('\n═══════════════════════════════════════════');
  console.log('           PREREQUISITES REPORT');
  console.log('═══════════════════════════════════════════\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}\n`);
  });

  console.log('═══════════════════════════════════════════');
  console.log(`Summary: ${passed} passed, ${failed} failed, ${warnings} warnings\n`);

  if (failed > 0) {
    console.log('❌ Critical issues detected. Please fix failed checks before deploying.\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  Some warnings detected. Review before proceeding.\n');
  } else {
    console.log('✅ All checks passed! You\'re ready to deploy.\n');
    console.log('Next steps:');
    console.log('  1. Compile: compact compile PrivateDAOTreasury.compact --output ./build');
    console.log('  2. Deploy: npm run deploy\n');
  }
}

runChecks().catch(console.error);
