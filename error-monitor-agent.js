#!/usr/bin/env node

/**
 * ERROR MONITORING AGENT
 * Watches Metro bundler logs and provides instant diagnostics
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'metro-errors.log');
const ERROR_PATTERNS = [
  { pattern: /Error:.*/, severity: 'ERROR', action: 'Check syntax and imports' },
  { pattern: /SyntaxError.*/, severity: 'CRITICAL', action: 'Fix JavaScript syntax' },
  { pattern: /Cannot find module.*/, severity: 'ERROR', action: 'Install missing package' },
  { pattern: /EADDRINUSE.*/, severity: 'ERROR', action: 'Kill process on port' },
  { pattern: /Transform error.*/, severity: 'ERROR', action: 'Check Babel config' },
  { pattern: /Unable to resolve.*/, severity: 'CRITICAL', action: 'Check imports and paths' },
  { pattern: /network error.*/, severity: 'WARNING', action: 'Check backend connection' },
];

let errorCount = 0;
let lastError = null;

console.log('🤖 ERROR MONITORING AGENT STARTED');
console.log('📊 Watching Metro bundler...\n');

// Start Metro bundler
const metro = spawn('npx', ['expo', 'start', '--port', '8081', '--clear'], {
  cwd: __dirname + '/JobHubMobile-Expo',
  shell: true,
});

const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

metro.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  logStream.write(`[STDOUT] ${new Date().toISOString()} - ${output}`);

  // Check for success patterns
  if (output.includes('Waiting on') || output.includes('packager-status:running')) {
    console.log('\n✅ Metro bundler is running successfully!');
  }
});

metro.stderr.on('data', (data) => {
  const error = data.toString();
  console.error(error);
  logStream.write(`[STDERR] ${new Date().toISOString()} - ${error}`);

  // Analyze error
  analyzeError(error);
});

metro.on('close', (code) => {
  console.log(`\n⚠️  Metro bundler exited with code ${code}`);
  logStream.end();

  if (code !== 0) {
    console.log('\n🔴 METRO BUNDLER CRASHED!');
    console.log(`📊 Total errors detected: ${errorCount}`);
    if (lastError) {
      console.log(`\n🔍 LAST ERROR:`);
      console.log(lastError);
      console.log(`\n💡 SUGGESTED FIX: ${getSolution(lastError)}`);
    }
  }
});

function analyzeError(errorText) {
  errorCount++;
  lastError = errorText;

  for (const { pattern, severity, action } of ERROR_PATTERNS) {
    if (pattern.test(errorText)) {
      console.log(`\n🚨 [${severity}] ERROR DETECTED!`);
      console.log(`📝 Error: ${errorText.substring(0, 200)}`);
      console.log(`💡 Action: ${action}\n`);

      // Auto-fix common issues
      if (errorText.includes('EADDRINUSE')) {
        console.log('🔧 Auto-fixing: Killing process on port...');
        autoFixPortConflict();
      }

      if (errorText.includes('Cannot find module')) {
        const moduleName = extractModuleName(errorText);
        if (moduleName) {
          console.log(`🔧 Auto-fixing: Installing ${moduleName}...`);
          autoInstallModule(moduleName);
        }
      }

      break;
    }
  }
}

function getSolution(errorText) {
  if (errorText.includes('Transform')) return 'Check babel.config.js and package.json';
  if (errorText.includes('resolve')) return 'Verify import paths and installed packages';
  if (errorText.includes('Syntax')) return 'Fix JavaScript syntax errors';
  if (errorText.includes('module')) return 'Run: npm install';
  return 'Check metro-errors.log for details';
}

function extractModuleName(errorText) {
  const match = errorText.match(/Cannot find module ['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function autoFixPortConflict() {
  const { execSync } = require('child_process');
  try {
    execSync('netstat -ano | findstr :8081 | findstr LISTENING', { encoding: 'utf-8' })
      .split('\n')
      .forEach(line => {
        const match = line.match(/LISTENING\s+(\d+)/);
        if (match) {
          execSync(`taskkill /F /PID ${match[1]}`);
          console.log(`✅ Killed process ${match[1]}`);
        }
      });
  } catch (e) {
    console.log('⚠️  Could not auto-fix port conflict');
  }
}

function autoInstallModule(moduleName) {
  const { execSync } = require('child_process');
  try {
    execSync(`npm install ${moduleName}`, {
      cwd: __dirname + '/JobHubMobile-Expo',
      stdio: 'inherit',
    });
    console.log(`✅ Installed ${moduleName}`);
  } catch (e) {
    console.log(`⚠️  Could not auto-install ${moduleName}`);
  }
}

process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping error monitor...');
  metro.kill();
  process.exit(0);
});

console.log('💡 Press Ctrl+C to stop\n');
