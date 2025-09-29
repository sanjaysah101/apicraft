#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { createServer } from 'http';
import { parse } from 'url';

const CONFIG_FILE = '.apicraft.json';
const HISTORY_FILE = '.apicraft-history.json';
const VERSION = '1.0.0';

class ApiCraft {
  constructor() {
    this.config = this.loadConfig();
    this.history = this.loadHistory();
    this.currentEnv = 'default';
  }

  loadConfig() {
    if (existsSync(CONFIG_FILE)) {
      try {
        return JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
      } catch (e) {
        return this.getDefaultConfig();
      }
    }
    return this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      environments: {
        default: { baseUrl: '', headers: {} },
        dev: { baseUrl: 'http://localhost:3000', headers: {} },
        prod: { baseUrl: '', headers: {} }
      },
      saved: {},
      settings: { timeout: 30000, followRedirects: true }
    };
  }

  saveConfig() {
    writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  loadHistory() {
    if (existsSync(HISTORY_FILE)) {
      try {
        const data = JSON.parse(readFileSync(HISTORY_FILE, 'utf8'));
        return data.requests || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  saveHistory() {
    writeFileSync(HISTORY_FILE, JSON.stringify({ requests: this.history.slice(-50) }, null, 2));
  }

  interpolate(str) {
    const env = this.config.environments[this.currentEnv] || this.config.environments.default;
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return env[key] || env.baseUrl || match;
    });
  }

  async request(method, url, options = {}) {
    const fullUrl = this.interpolate(url);
    const env = this.config.environments[this.currentEnv] || this.config.environments.default;
    const headers = { ...env.headers, ...options.headers };
    
    const startTime = Date.now();
    const fetchOptions = {
      method: method.toUpperCase(),
      headers,
      redirect: this.config.settings.followRedirects ? 'follow' : 'manual'
    };

    if (options.body) {
      fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    try {
      const response = await fetch(fullUrl, fetchOptions);
      const duration = Date.now() - startTime;
      const contentType = response.headers.get('content-type') || '';
      let body;

      if (contentType.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body,
        duration,
        url: fullUrl,
        method: method.toUpperCase()
      };

      this.addToHistory(result, options.body);
      return result;
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  addToHistory(request, requestBody = null) {
    this.history.push({
      ...request,
      requestBody,
      timestamp: new Date().toISOString()
    });
    this.saveHistory();
  }

  formatResponse(response) {
    const statusColor = response.status < 300 ? '\x1b[32m' : response.status < 400 ? '\x1b[33m' : '\x1b[31m';
    const reset = '\x1b[0m';
    const bold = '\x1b[1m';
    const dim = '\x1b[2m';

    console.log(`\n${bold}${statusColor}${response.status} ${response.statusText}${reset} ${dim}(${response.duration}ms)${reset}`);
    console.log(`${dim}${response.method} ${response.url}${reset}\n`);

    if (typeof response.body === 'object') {
      console.log(JSON.stringify(response.body, null, 2));
    } else {
      console.log(response.body);
    }
  }

  generateCode(response, type = 'fetch') {
    const { method, url, requestBody } = response;
    const env = this.config.environments[this.currentEnv];
    const headers = env.headers || {};

    if (type === 'fetch') {
      const options = { method };
      if (Object.keys(headers).length > 0) options.headers = headers;
      if (requestBody && typeof requestBody === 'object') options.body = JSON.stringify(requestBody);
      return `fetch('${url}', ${JSON.stringify(options, null, 2)})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
    } else if (type === 'axios') {
      const config = {};
      if (Object.keys(headers).length > 0) config.headers = headers;
      if (requestBody && typeof requestBody === 'object') config.data = requestBody;
      return `axios.${method.toLowerCase()}('${url}'${requestBody ? ', ' + JSON.stringify(requestBody, null, 2) : ''}${Object.keys(config).length > 0 ? ', ' + JSON.stringify(config, null, 2) : ''})
  .then(res => console.log(res.data))
  .catch(err => console.error(err));`;
    } else if (type === 'curl') {
      let cmd = `curl -X ${method} '${url}'`;
      Object.entries(headers).forEach(([key, value]) => {
        cmd += ` -H '${key}: ${value}'`;
      });
      if (requestBody && typeof requestBody === 'object') {
        cmd += ` -d '${JSON.stringify(requestBody)}'`;
      }
      return cmd;
    }
    return 'Unknown code type';
  }

  saveRequest(name, method, url, options = {}) {
    this.config.saved[name] = { method, url, options };
    this.saveConfig();
    console.log(`✓ Saved request: ${name}`);
  }

  runSavedRequest(name) {
    const saved = this.config.saved[name];
    if (!saved) {
      throw new Error(`Request '${name}' not found`);
    }
    return this.request(saved.method, saved.url, saved.options);
  }

  listSavedRequests() {
    const saved = Object.keys(this.config.saved);
    if (saved.length === 0) {
      console.log('No saved requests');
      return;
    }
    console.log('\nSaved Requests:');
    saved.forEach(name => {
      const req = this.config.saved[name];
      console.log(`  ${name}: ${req.method} ${req.url}`);
    });
  }

  setEnvironment(env) {
    if (!this.config.environments[env]) {
      throw new Error(`Environment '${env}' not found`);
    }
    this.currentEnv = env;
    console.log(`✓ Switched to '${env}' environment`);
  }

  setEnvVariable(key, value) {
    if (!this.config.environments[this.currentEnv]) {
      this.config.environments[this.currentEnv] = { headers: {} };
    }
    this.config.environments[this.currentEnv][key] = value;
    this.saveConfig();
    console.log(`✓ Set ${key} = ${value} in '${this.currentEnv}' environment`);
  }

  showHistory(limit = 10) {
    const recent = this.history.slice(-limit).reverse();
    if (recent.length === 0) {
      console.log('No history');
      return;
    }
    console.log('\nRecent Requests:');
    recent.forEach((req, idx) => {
      const statusColor = req.status < 300 ? '\x1b[32m' : req.status < 400 ? '\x1b[33m' : '\x1b[31m';
      const reset = '\x1b[0m';
      console.log(`  ${limit - idx}. ${req.method} ${req.url} ${statusColor}${req.status}${reset} (${req.duration}ms)`);
    });
  }

  replayRequest(index) {
    const req = this.history[this.history.length - index];
    if (!req) {
      throw new Error(`No request at index ${index}`);
    }
    return this.request(req.method, req.url, { body: req.requestBody });
  }

  async startMockServer(directory, port = 3000) {
    const mockDir = resolve(directory);
    if (!existsSync(mockDir)) {
      throw new Error(`Directory '${directory}' not found`);
    }

    const mocks = this.loadMockFiles(mockDir);
    
    const server = createServer((req, res) => {
      const { pathname } = parse(req.url);
      const key = `${req.method}:${pathname}`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (mocks[key]) {
        res.writeHead(200);
        res.end(JSON.stringify(mocks[key]));
        console.log(`${req.method} ${pathname} -> 200`);
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
        console.log(`${req.method} ${pathname} -> 404`);
      }
    });

    server.listen(port, () => {
      console.log(`\n🚀 Mock server running on http://localhost:${port}`);
      console.log(`Loaded ${Object.keys(mocks).length} mock endpoints:\n`);
      Object.keys(mocks).forEach(key => {
        console.log(`  ${key}`);
      });
    });
  }

  loadMockFiles(dir) {
    const mocks = {};
    const files = readdirSync(dir);
    
    files.forEach(file => {
      const filePath = join(dir, file);
      if (statSync(filePath).isFile() && file.endsWith('.json')) {
        try {
          const content = JSON.parse(readFileSync(filePath, 'utf8'));
          const name = file.replace('.json', '');
          const [method, ...pathParts] = name.split('_');
          const path = '/' + pathParts.join('/');
          mocks[`${method.toUpperCase()}:${path}`] = content;
        } catch (e) {
          console.error(`Error loading ${file}: ${e.message}`);
        }
      }
    });
    
    return mocks;
  }

  showHelp() {
    console.log(`
apicraft v${VERSION} - API Development CLI Tool

USAGE:
  apicraft <command> [options]

COMMANDS:
  get <url>                    Make a GET request
  post <url> [body]            Make a POST request
  put <url> [body]             Make a PUT request
  delete <url>                 Make a DELETE request
  patch <url> [body]           Make a PATCH request

  save <name> <method> <url>   Save a request
  run <name>                   Run a saved request
  list                         List all saved requests

  generate <type>              Generate code (fetch/axios/curl) from last request
  history [limit]              Show request history
  replay <index>               Replay a request from history

  env <name>                   Switch environment
  set <key> <value>            Set environment variable
  init                         Initialize .apicraft.json

  mock <directory> [port]      Start mock server (default port: 3000)

EXAMPLES:
  apicraft get https://api.github.com/users/sanjaysah101
  apicraft post https://api.example.com/users '{"name":"John"}'
  apicraft save getUser get https://api.example.com/users/1
  apicraft run getUser
  apicraft generate curl
  apicraft env dev
  apicraft set baseUrl https://api.example.com
  apicraft mock ./mocks 3000
`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const craft = new ApiCraft();

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    craft.showHelp();
    process.exit(0);
  }

  const command = args[0];
  
  try {
    if (['get', 'post', 'put', 'delete', 'patch'].includes(command)) {
      const url = args[1];
      if (!url) throw new Error('URL required');
      const body = args[2] ? JSON.parse(args[2]) : undefined;
      const response = await craft.request(command, url, { body });
      craft.formatResponse(response);
    } else if (command === 'save') {
      const [, name, method, url, body] = args;
      if (!name || !method || !url) throw new Error('Usage: save <name> <method> <url> [body]');
      craft.saveRequest(name, method, url, body ? { body: JSON.parse(body) } : {});
    } else if (command === 'run') {
      const name = args[1];
      if (!name) throw new Error('Request name required');
      const response = await craft.runSavedRequest(name);
      craft.formatResponse(response);
    } else if (command === 'list') {
      craft.listSavedRequests();
    } else if (command === 'generate') {
      const type = args[1] || 'fetch';
      if (craft.history.length === 0) throw new Error('No requests in history');
      const lastRequest = craft.history[craft.history.length - 1];
      console.log('\n' + craft.generateCode(lastRequest, type) + '\n');
    } else if (command === 'history') {
      const limit = parseInt(args[1]) || 10;
      craft.showHistory(limit);
    } else if (command === 'replay') {
      const index = parseInt(args[1]);
      if (!index) throw new Error('History index required');
      const response = await craft.replayRequest(index);
      craft.formatResponse(response);
    } else if (command === 'env') {
      const env = args[1];
      if (!env) throw new Error('Environment name required');
      craft.setEnvironment(env);
    } else if (command === 'set') {
      const [, key, value] = args;
      if (!key || !value) throw new Error('Usage: set <key> <value>');
      craft.setEnvVariable(key, value);
    } else if (command === 'init') {
      craft.saveConfig();
      console.log('✓ Initialized .apicraft.json');
    } else if (command === 'mock') {
      const directory = args[1];
      const port = parseInt(args[2]) || 3000;
      if (!directory) throw new Error('Directory required');
      await craft.startMockServer(directory, port);
    } else {
      throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error(`\x1b[31m✗ Error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

main();