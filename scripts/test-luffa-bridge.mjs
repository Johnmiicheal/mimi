#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Environment file not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    let value = match[2] ?? '';
    value = value.trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
  return true;
}

const cwd = process.cwd();
console.log('🔍 Testing Luffa Bridge Setup...\n');

loadEnvFile(path.join(cwd, '.env.local'));
loadEnvFile(path.join(cwd, '.env'));

const LUFFA_SECRET = process.env.LUFFA_BOT_SECRET || process.env.LUFFA_SECRET;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

console.log('📋 Environment Variables:');
console.log(`  LUFFA_BOT_SECRET: ${LUFFA_SECRET ? '✅ Present' : '❌ Missing'}`);
console.log(`  ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY ? '✅ Present' : '❌ Missing'}`);
console.log(`  ANTHROPIC_MODEL: ${ANTHROPIC_MODEL}`);

if (!LUFFA_SECRET) {
  console.log('\n❌ FATAL: Missing LUFFA_BOT_SECRET');
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.log('\n❌ FATAL: Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

async function testLuffaAPI() {
  console.log('\n🧪 Testing Luffa API endpoint...');
  try {
    const response = await fetch('https://apibot.luffa.im/robot/receive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: LUFFA_SECRET }),
    });

    if (!response.ok) {
      console.log(`  ❌ Luffa API error: ${response.status} ${response.statusText}`);
      const body = await response.text();
      console.log(`  Response: ${body.substring(0, 200)}`);
      return false;
    }

    const payload = await response.json();
    console.log(`  ✅ Luffa API connection successful`);
    console.log(`  Response type: ${Array.isArray(payload) ? 'Array' : 'Object'}`);
    if (payload.data && Array.isArray(payload.data)) {
      console.log(`  Messages pending: ${payload.data.length}`);
    }
    return true;
  } catch (error) {
    console.log(`  ❌ Luffa API error: ${error.message}`);
    return false;
  }
}

async function testAnthropicAPI() {
  console.log('\n🧪 Testing Anthropic API...');
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 100,
        system: 'You are a helpful assistant.',
        messages: [{ role: 'user', content: 'Say hello' }],
      }),
    });

    if (!response.ok) {
      console.log(`  ❌ Anthropic API error: ${response.status} ${response.statusText}`);
      const body = await response.text();
      console.log(`  Response: ${body.substring(0, 300)}`);
      return false;
    }

    const payload = await response.json();
    console.log(`  ✅ Anthropic API connection successful`);
    console.log(`  Model used: ${payload.model || 'Unknown'}`);
    if (payload.content && Array.isArray(payload.content)) {
      const textContent = payload.content.find(c => c.type === 'text');
      if (textContent) {
        console.log(`  Test response: "${textContent.text.substring(0, 50)}..."`);
      }
    }
    return true;
  } catch (error) {
    console.log(`  ❌ Anthropic API error: ${error.message}`);
    return false;
  }
}

async function main() {
  const luffaOk = await testLuffaAPI();
  const anthropicOk = await testAnthropicAPI();

  console.log('\n✨ Test Summary:');
  console.log(`  Luffa API: ${luffaOk ? '✅ OK' : '❌ Failed'}`);
  console.log(`  Anthropic API: ${anthropicOk ? '✅ OK' : '❌ Failed'}`);

  if (!luffaOk) {
    console.log('\n⚠️  Unable to connect to Luffa API. Check:');
    console.log('  1. LUFFA_BOT_SECRET is correct');
    console.log('  2. Internet connection is working');
    console.log('  3. apibot.luffa.im is accessible');
  }

  if (!anthropicOk) {
    console.log('\n⚠️  Unable to connect to Anthropic API. Check:');
    console.log('  1. ANTHROPIC_API_KEY is valid and not expired');
    console.log('  2. Internet connection is working');
    console.log('  3. api.anthropic.com is accessible');
  }

  process.exit(luffaOk && anthropicOk ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
