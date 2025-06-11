#!/usr/bin/env node

import { spawn } from 'child_process';
import net from 'net';
import chalk from 'chalk';
import ora from 'ora';

// Service configuration
const services = [
  {
    name: 'Frontend (Vite)',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: './project4site_-github-readme-to-site-generator',
    port: 5173,
    color: chalk.blue,
  },
  {
    name: 'API Gateway',
    command: 'docker-compose',
    args: ['up', '-d', 'api-gateway'],
    port: 4000,
    color: chalk.green,
  },
  {
    name: 'GitHub App Service',
    command: 'docker-compose',
    args: ['up', '-d', 'github-app-service'],
    port: 3001,
    color: chalk.yellow,
  },
  {
    name: 'Site Generation Engine',
    command: 'docker-compose',
    args: ['up', '-d', 'site-generation-engine'],
    port: 3000,
    color: chalk.magenta,
  },
];

// Check if port is available
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', () => {
      resolve(false);
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

// Find available port
async function findAvailablePort(preferredPort, serviceName) {
  // First check if preferred port is available
  if (await isPortAvailable(preferredPort)) {
    return preferredPort;
  }
  
  console.log(chalk.yellow(`⚠️  Port ${preferredPort} is busy for ${serviceName}`));
  
  // Try next 10 ports
  for (let i = 1; i <= 10; i++) {
    const port = preferredPort + i;
    if (await isPortAvailable(port)) {
      console.log(chalk.green(`✅ Using port ${port} for ${serviceName}`));
      return port;
    }
  }
  
  // Let OS assign a port
  return 0;
}

// Kill process on port
async function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const kill = spawn('lsof', ['-ti', `:${port}`]);
    let pid = '';
    
    kill.stdout.on('data', (data) => {
      pid += data.toString().trim();
    });
    
    kill.on('close', (code) => {
      if (pid) {
        spawn('kill', ['-9', pid]);
        console.log(chalk.red(`🔪 Killed process ${pid} on port ${port}`));
        setTimeout(resolve, 1000); // Wait for port to be released
      } else {
        resolve();
      }
    });
  });
}

// Start a service
async function startService(service) {
  const spinner = ora(`Starting ${service.name}...`).start();
  
  // Check and allocate port
  const port = await findAvailablePort(service.port, service.name);
  
  // Set environment variable for dynamic port
  const env = { ...process.env };
  if (service.name === 'Frontend (Vite)') {
    env.VITE_PORT = port;
  }
  
  // Start the service
  const proc = spawn(service.command, service.args, {
    cwd: service.cwd || '.',
    env,
    stdio: 'pipe',
  });
  
  // Handle output
  proc.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('ready') || output.includes('started') || output.includes('Local:')) {
      spinner.succeed(service.color(`${service.name} started on port ${port}`));
    }
  });
  
  proc.stderr.on('data', (data) => {
    console.error(service.color(`[${service.name}] ${data.toString()}`));
  });
  
  proc.on('error', (err) => {
    spinner.fail(`Failed to start ${service.name}: ${err.message}`);
  });
  
  return { proc, port };
}

// Main startup function
async function startAll() {
  console.log(chalk.bold.cyan('\n🚀 Starting Project4Site Services\n'));
  
  // Check for --kill flag
  const shouldKill = process.argv.includes('--kill');
  
  if (shouldKill) {
    console.log(chalk.yellow('🔪 Killing existing processes...\n'));
    for (const service of services) {
      await killProcessOnPort(service.port);
    }
  }
  
  // Start all services
  const runningServices = [];
  
  for (const service of services) {
    try {
      const result = await startService(service);
      runningServices.push({ ...service, ...result });
    } catch (err) {
      console.error(chalk.red(`Failed to start ${service.name}: ${err.message}`));
    }
  }
  
  // Display summary
  console.log(chalk.bold.green('\n✨ All services started!\n'));
  console.log(chalk.bold('Access URLs:'));
  console.log(chalk.cyan(`  Frontend:    http://localhost:${runningServices[0]?.port || 5173}`));
  console.log(chalk.cyan(`  API Gateway: http://localhost:${runningServices[1]?.port || 4000}`));
  console.log(chalk.cyan(`  API Docs:    http://localhost:${runningServices[1]?.port || 4000}/docs`));
  console.log(chalk.cyan(`  Preview:     http://localhost:${runningServices[3]?.port || 3000}/preview/[siteId]`));
  
  console.log(chalk.gray('\nPress Ctrl+C to stop all services\n'));
  
  // Handle shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n👋 Shutting down services...\n'));
    
    runningServices.forEach(({ proc, name }) => {
      if (proc && !proc.killed) {
        proc.kill();
        console.log(chalk.gray(`Stopped ${name}`));
      }
    });
    
    // Stop Docker services
    spawn('docker-compose', ['down'], { stdio: 'inherit' });
    
    setTimeout(() => process.exit(0), 2000);
  });
}

// Run the startup
startAll().catch(console.error);