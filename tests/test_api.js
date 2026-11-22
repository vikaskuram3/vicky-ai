/**
 * VICKY AI - Automated In-Memory API Test Suite
 * Tests server endpoints in-memory without requiring network socket permissions.
 */

const assert = require('assert');
const { Readable, Writable } = require('stream');
const { handleRequest } = require('../server.js');

function simulateRequest(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    // Create Mock IncomingMessage (Readable Stream)
    const req = new Readable({
      read() {
        if (body) {
          this.push(JSON.stringify(body));
        }
        this.push(null);
      }
    });

    req.method = method;
    req.url = url;
    req.headers = Object.assign({
      'content-type': 'application/json',
      host: 'localhost:3000'
    }, headers);

    // Create Mock ServerResponse (Writable Stream)
    let statusCode = 200;
    const responseHeaders = {};
    let responseBody = '';

    const res = new Writable({
      write(chunk, encoding, callback) {
        responseBody += chunk.toString();
        callback();
      }
    });

    res.writeHead = (status, headers = {}) => {
      statusCode = status;
      Object.assign(responseHeaders, headers);
    };

    res.setHeader = (k, v) => {
      responseHeaders[k.toLowerCase()] = v;
    };

    res.end = (chunk) => {
      if (chunk) responseBody += chunk.toString();
      try {
        const json = JSON.parse(responseBody);
        resolve({ status: statusCode, headers: responseHeaders, data: json });
      } catch (e) {
        resolve({ status: statusCode, headers: responseHeaders, data: responseBody });
      }
    };

    // Execute Request Handler
    handleRequest(req, res).catch(reject);
  });
}

async function runTests() {
  console.log('--- Starting VICKY AI In-Memory API Test Suite ---');
  let passed = 0;
  let failed = 0;

  // 1. Health Endpoint
  try {
    const res = await simulateRequest('GET', '/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.app, 'VICKY AI');
    assert.strictEqual(res.data.status, 'healthy');
    console.log('✔ Test 1: GET /health passed');
    passed++;
  } catch (err) {
    console.error('✘ Test 1 failed:', err.message);
    failed++;
  }

  // 2. Open-Source Models Endpoint
  try {
    const res = await simulateRequest('GET', '/api/models');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.models));
    assert.ok(res.data.models.some(m => m.id === 'wan-2.1'));
    assert.ok(res.data.models.some(m => m.id === 'svd-xt'));
    assert.ok(res.data.models.some(m => m.id === 'animatediff-xl'));
    console.log('✔ Test 2: GET /api/models passed (Validated Wan 2.1, SVD-XT, AnimateDiff)');
    passed++;
  } catch (err) {
    console.error('✘ Test 2 failed:', err.message);
    failed++;
  }

  // 3. Neural Voices Endpoint
  try {
    const res = await simulateRequest('GET', '/api/voices');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.voices));
    assert.ok(res.data.voices.length >= 5);
    console.log('✔ Test 3: GET /api/voices passed');
    passed++;
  } catch (err) {
    console.error('✘ Test 3 failed:', err.message);
    failed++;
  }

  // 4. Projects Endpoint
  try {
    const res = await simulateRequest('GET', '/api/projects');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.projects));
    console.log('✔ Test 4: GET /api/projects passed (Found ' + res.data.projects.length + ' projects)');
    passed++;
  } catch (err) {
    console.error('✘ Test 4 failed:', err.message);
    failed++;
  }

  // 5. Script Generator Endpoint
  try {
    const res = await simulateRequest('POST', '/api/generate/script', {
      topic: 'Artificial Intelligence Video Revolution',
      style: 'cinematic',
      platform: 'youtube_shorts'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.scenes.length >= 3);
    assert.ok(res.data.full_voiceover_script.length > 20);
    console.log('✔ Test 5: POST /api/generate/script passed');
    passed++;
  } catch (err) {
    console.error('✘ Test 5 failed:', err.message);
    failed++;
  }

  // 6. User Auth Login Endpoint
  try {
    const res = await simulateRequest('POST', '/api/auth/login', {
      email: 'creator@vickyai.com',
      password: 'password123'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.strictEqual(res.data.user.email, 'creator@vickyai.com');
    console.log('✔ Test 6: POST /api/auth/login passed');
    passed++;
  } catch (err) {
    console.error('✘ Test 6 failed:', err.message);
    failed++;
  }

  // 7. Voice Generator Endpoint
  try {
    const res = await simulateRequest('POST', '/api/generate/voice', {
      text: 'VICKY AI: Create Anything. Generate Everything.',
      voice: 'en-US-GuyNeural'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.audio_url);
    assert.ok(res.data.duration_sec > 0);
    console.log('✔ Test 7: POST /api/generate/voice passed');
    passed++;
  } catch (err) {
    console.error('✘ Test 7 failed:', err.message);
    failed++;
  }

  // 8. Health Dependencies Endpoint (FFmpeg & Model Check)
  try {
    const res = await simulateRequest('GET', '/api/health/dependencies');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.ffmpeg);
    assert.strictEqual(res.data.ffmpeg.installed, true);
    assert.strictEqual(res.data.ffmpeg.ready_for_mp4, true);
    console.log('✔ Test 8: GET /api/health/dependencies passed (FFmpeg & Encoders Ready)');
    passed++;
  } catch (err) {
    console.error('✘ Test 8 failed:', err.message);
    failed++;
  }

  // 9. Probe Endpoint (Container, Stream, and H.264/AAC Validation)
  try {
    const res = await simulateRequest('GET', '/api/probe?file=cyberpunk_city.mp4');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.valid, true);
    assert.strictEqual(res.data.is_mp4_container, true);
    assert.strictEqual(res.data.has_h264_stream, true);
    assert.strictEqual(res.data.has_aac_stream, true);
    assert.strictEqual(res.data.can_decode, true);
    console.log('✔ Test 9: GET /api/probe passed (100% Validated H.264 & AAC Streams)');
    passed++;
  } catch (err) {
    console.error('✘ Test 9 failed:', err.message);
    failed++;
  }

  // 10. Multi-Tenant User Isolation & Private Project Security
  try {
    // 10.1 Register User Alice
    const uid = Date.now();
    const regAlice = await simulateRequest('POST', '/api/auth/register', {
      name: 'Alice Creator',
      email: `alice_${uid}@test.com`,
      password: 'secret_alice_pass'
    });
    assert.ok(regAlice.status === 201 || regAlice.status === 200);
    const aliceToken = regAlice.data.token;
    const aliceId = regAlice.data.user.id;

    // 10.2 Register User Bob
    const regBob = await simulateRequest('POST', '/api/auth/register', {
      name: 'Bob Creator',
      email: `bob_${uid}@test.com`,
      password: 'secret_bob_pass'
    });
    assert.ok(regBob.status === 201 || regBob.status === 200);
    const bobToken = regBob.data.token;
    const bobId = regBob.data.user.id;

    // 10.3 Alice creates a private project
    const createProj = await simulateRequest('POST', '/api/projects', {
      title: "Alice's Secret Project",
      prompt: "Ultra secret cyberpunk neon drone",
      video_url: "/outputs/test_verified_16_9.mp4"
    }, { 'Authorization': `Bearer ${aliceToken}`, 'x-user-id': aliceId });
    assert.strictEqual(createProj.status, 201);
    const aliceProjId = createProj.data.project.id;

    // 10.4 Bob tries to delete Alice's project -> MUST BE FORBIDDEN (403)
    const bobDeleteAttempt = await simulateRequest('DELETE', `/api/projects/${aliceProjId}`, null, {
      'Authorization': `Bearer ${bobToken}`,
      'x-user-id': bobId
    });
    assert.strictEqual(bobDeleteAttempt.status, 403);
    assert.strictEqual(bobDeleteAttempt.data.success, false);

    // 10.5 Alice deletes her own project -> MUST SUCCEED (200)
    const aliceDeleteAttempt = await simulateRequest('DELETE', `/api/projects/${aliceProjId}`, null, {
      'Authorization': `Bearer ${aliceToken}`,
      'x-user-id': aliceId
    });
    assert.strictEqual(aliceDeleteAttempt.status, 200);
    assert.strictEqual(aliceDeleteAttempt.data.success, true);

    console.log('✔ Test 10: Multi-Tenant Project Isolation & User Security passed');
    passed++;
  } catch (err) {
    console.error('✘ Test 10 failed:', err.message);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
