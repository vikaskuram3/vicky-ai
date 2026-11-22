/**
 * VICKY AI VIDEO STUDIO - Feature Verification Test Suite (In-Memory)
 * Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
 * Validates:
 * 1. Dedicated Login Page (/login)
 * 2. Dedicated Signup Page (/signup)
 * 3. Supabase Auth Config & Public API (/api/config)
 * 4. Authentication Suite (Registration, Login, Google OAuth, Password Reset)
 * 5. AI Story Director (/api/director/generate)
 * 6. Telugu AI Studio (Pure Telugu & Teluglish script generation & Tollywood presets)
 * 7. One-Prompt Movie Maker multi-scene render (/api/generate/movie)
 * 8. Social Media Export & Direct MP4 Downloads (/api/download)
 */

const assert = require('assert');
const { Readable, Writable } = require('stream');
const handleRequest = require('../server.js');

function simulateRequest(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = new Readable({
      read() {
        if (body) {
          this.push(typeof body === 'string' ? body : JSON.stringify(body));
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
        resolve({ status: statusCode, headers: responseHeaders, data: json, raw: responseBody });
      } catch (e) {
        resolve({ status: statusCode, headers: responseHeaders, data: responseBody, raw: responseBody });
      }
    };

    try {
      handleRequest(req, res);
    } catch (e) {
      reject(e);
    }
  });
}

async function runFeatureTests() {
  console.log('--- Starting VICKY AI Feature Verification Test Suite ---');
  let passed = 0;
  let failed = 0;

  // 1. Dedicated Login Page (/login)
  try {
    const res = await simulateRequest('GET', '/login');
    assert.strictEqual(res.status, 200);
    assert.ok(res.raw.includes('VICKY AI'));
    assert.ok(res.raw.includes('cinematicCanvas'));
    assert.ok(res.raw.includes('loginEmail'));
    assert.ok(res.raw.includes('loginPassword'));
    assert.ok(res.raw.includes('togglePasswordBtn'));
    assert.ok(res.raw.includes('rememberMe'));
    assert.ok(res.raw.includes('openForgotModal'));
    assert.ok(res.raw.includes('btnSignIn'));
    assert.ok(res.raw.includes('handleGoogleSignIn'));
    assert.ok(res.raw.includes('/signup'));
    console.log('✔ Test 1: Dedicated Login Page (/login) verified with all 10 required elements');
    passed++;
  } catch (e) {
    console.error('✘ Test 1 failed:', e.message);
    failed++;
  }

  // 2. Dedicated Signup Page (/signup)
  try {
    const res = await simulateRequest('GET', '/signup');
    assert.strictEqual(res.status, 200);
    assert.ok(res.raw.includes('signupName'));
    assert.ok(res.raw.includes('signupEmail'));
    assert.ok(res.raw.includes('signupPassword'));
    assert.ok(res.raw.includes('signupConfirmPassword'));
    assert.ok(res.raw.includes('handleGoogleSignUp'));
    assert.ok(res.raw.includes('agreeTerms'));
    assert.ok(res.raw.includes('btnCreateAccount'));
    assert.ok(res.raw.includes('verificationModal'));
    console.log('✔ Test 2: Dedicated Signup Page (/signup) verified with full registration & verification flow');
    passed++;
  } catch (e) {
    console.error('✘ Test 2 failed:', e.message);
    failed++;
  }

  // 3. Supabase Auth Configuration Endpoint (/api/config)
  try {
    const res = await simulateRequest('GET', '/api/config');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.supabase_url !== undefined);
    assert.ok(res.data.supabase_anon_key !== undefined);
    assert.strictEqual(res.data.app_name, 'VICKY AI');
    assert.strictEqual(res.data.tagline, 'ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE.');
    console.log('✔ Test 3: Supabase Configuration & Public API Config verified');
    passed++;
  } catch (e) {
    console.error('✘ Test 3 failed:', e.message);
    failed++;
  }

  // 4. Authentication: Register, Login, Google OAuth, Password Reset
  try {
    const testEmail = `creator_${Date.now()}@vickyai.com`;
    const regRes = await simulateRequest('POST', '/api/auth/register', {
      name: 'Arjun Creator',
      email: testEmail,
      password: 'securepassword123'
    });
    assert.ok(regRes.status === 200 || regRes.status === 201);
    assert.ok(regRes.data.success);
    assert.ok(regRes.data.token);

    const loginRes = await simulateRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'securepassword123'
    });
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginRes.data.success);
    assert.ok(loginRes.data.token);

    const googleRes = await simulateRequest('POST', '/api/auth/google', {
      email: `google_${Date.now()}@gmail.com`,
      name: 'Google Creator'
    });
    assert.strictEqual(googleRes.status, 200);
    assert.ok(googleRes.data.success);

    const resetRes = await simulateRequest('POST', '/api/auth/reset-password', {
      email: testEmail
    });
    assert.strictEqual(resetRes.status, 200);
    assert.ok(resetRes.data.success);

    console.log('✔ Test 4: Full Auth Suite (Registration, Login, Google OAuth, Password Reset) verified');
    passed++;
  } catch (e) {
    console.error('✘ Test 4 failed:', e.message);
    failed++;
  }

  // 5. AI Story Director (/api/director/generate)
  try {
    const res = await simulateRequest('POST', '/api/director/generate', {
      prompt: 'A cyber archaeologist in Neo-Hyderabad uncovers an ancient crystal monolith',
      genre: 'cinematic',
      language: 'english',
      character_name: 'Dr. Kalyan',
      character_traits: 'Athletic, silver streak hair, neon cyber visor'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'success');
    assert.ok(res.data.logline);
    assert.ok(res.data.screenplay);
    assert.ok(res.data.scenes.length >= 4);
    assert.ok(res.data.srt_subtitles.includes('-->'));
    assert.ok(res.data.scenes[0].camera_instruction);
    assert.ok(res.data.scenes[0].visual_prompt.includes('Dr. Kalyan'));
    console.log('✔ Test 5: AI Story Director verified (Premise, Screenplay, Scene breakdown, Camera, Subtitles)');
    passed++;
  } catch (e) {
    console.error('✘ Test 5 failed:', e.message);
    failed++;
  }

  // 6. Telugu AI Studio (Pure Telugu & Teluglish script breakdown)
  try {
    const resTelugu = await simulateRequest('POST', '/api/director/generate', {
      prompt: 'మాస్ హీరో ఎలివేషన్ మరియు పల్లెటూరి యాక్షన్',
      genre: 'telugu_mass',
      language: 'telugu',
      is_teluglish: false
    });
    assert.strictEqual(resTelugu.status, 200);
    assert.strictEqual(resTelugu.data.language, 'telugu');
    assert.ok(resTelugu.data.scenes.length >= 4);

    const resTeluglish = await simulateRequest('POST', '/api/director/generate', {
      prompt: 'Hyderabad lo oka high-tech cyber chase scene',
      genre: 'telugu_scifi',
      language: 'teluglish',
      is_teluglish: true
    });
    assert.strictEqual(resTeluglish.status, 200);
    assert.strictEqual(resTeluglish.data.is_teluglish, true);
    assert.ok(resTeluglish.data.scenes.length >= 4);
    console.log('✔ Test 6: Telugu AI Studio verified (Pure Telugu & Teluglish scripts, Tollywood presets)');
    passed++;
  } catch (e) {
    console.error('✘ Test 6 failed:', e.message);
    failed++;
  }

  // 7. ONE-PROMPT MOVIE MAKER multi-scene video renderer (/api/generate/movie)
  try {
    console.log('Testing One-Prompt Movie Maker multi-scene render (H.264 MP4)...');
    const res = await simulateRequest('POST', '/api/generate/movie', {
      prompt: 'Cyberpunk journey into the neon nexus',
      aspect_ratio: '16:9',
      fps: 12,
      transition: 'crossfade',
      scenes: [
        { scene: 1, title: 'Act 1: Arrival', visual_prompt: 'Arrival at cyber nexus', duration_sec: 2, camera_motion: 'zoom_in' },
        { scene: 2, title: 'Act 2: The Portal', visual_prompt: 'Activating the glowing portal', duration_sec: 2, camera_motion: 'orbit' }
      ]
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'success');
    assert.strictEqual(res.data.is_valid_mp4, true);
    assert.ok(res.data.video_url.endsWith('.mp4'));
    assert.ok(res.data.file_size > 5000);
    console.log(`✔ Test 7: One-Prompt Movie Maker verified: ${res.data.scene_count} scenes, ${res.data.duration_sec}s, ${res.data.file_size} bytes MP4`);
    passed++;
  } catch (e) {
    console.error('✘ Test 7 failed:', e.message);
    failed++;
  }

  // 8. Direct MP4 Download Hub with Content-Disposition (/api/download)
  try {
    const res = await simulateRequest('GET', '/api/download?file=cyberpunk_city.mp4&name=My_Cinematic_Movie.mp4');
    assert.strictEqual(res.status, 200);
    const disposition = res.headers['content-disposition'] || res.headers['Content-Disposition'] || '';
    assert.ok(disposition.includes('attachment; filename="My_Cinematic_Movie.mp4"'));
    const contentType = res.headers['content-type'] || res.headers['Content-Type'] || '';
    assert.strictEqual(contentType, 'video/mp4');
    console.log('✔ Test 8: Video Download Hub verified with proper Content-Disposition and MP4 streaming');
    passed++;
  } catch (e) {
    console.error('✘ Test 8 failed:', e.message);
    failed++;
  }

  // 9. Character Memory Backend API (/api/characters)
  try {
    const getRes = await simulateRequest('GET', '/api/characters');
    assert.strictEqual(getRes.status, 200);
    assert.ok(Array.isArray(getRes.data.characters));
    assert.ok(getRes.data.characters.length >= 4);

    const postRes = await simulateRequest('POST', '/api/characters', {
      name: 'Neo Arjun',
      archetype: 'Cyber Commander',
      visual_traits: 'Athletic, tactical jacket, cyan visor'
    });
    assert.strictEqual(postRes.status, 201);
    assert.ok(postRes.data.success);
    assert.ok(postRes.data.character.id);

    const delRes = await simulateRequest('DELETE', `/api/characters/${postRes.data.character.id}`);
    assert.strictEqual(delRes.status, 200);
    assert.ok(delRes.data.success);
    console.log('✔ Test 9: Character Memory CRUD API verified (/api/characters)');
    passed++;
  } catch (e) {
    console.error('✘ Test 9 failed:', e.message);
    failed++;
  }

  // 10. AI Thumbnail Studio Backend API (/api/thumbnails)
  try {
    const postThumb = await simulateRequest('POST', '/api/thumbnails', {
      headline: 'THE ULTIMATE CLIMAX',
      subtext: 'ONE PROMPT. ONE MOVIE.',
      style_preset: 'cyber_neon',
      badge: '4K UHD',
      aspect_ratio: '16:9'
    });
    assert.strictEqual(postThumb.status, 201);
    assert.ok(postThumb.data.success);
    assert.ok(postThumb.data.thumbnail.id);

    const getThumbs = await simulateRequest('GET', '/api/thumbnails');
    assert.strictEqual(getThumbs.status, 200);
    assert.ok(Array.isArray(getThumbs.data.thumbnails));
    assert.ok(getThumbs.data.thumbnails.length >= 1);
    console.log('✔ Test 10: AI Thumbnail Studio Persistence API verified (/api/thumbnails)');
    passed++;
  } catch (e) {
    console.error('✘ Test 10 failed:', e.message);
    failed++;
  }

  // 11. Auto Video Editor (/api/editor/render)
  try {
    const editorRes = await simulateRequest('POST', '/api/editor/render', {
      video_url: '/samples/cyberpunk_city.mp4',
      bgm_url: '/audio/ambient_tech.wav',
      transition: 'fade',
      burn_subtitles: true
    });
    assert.strictEqual(editorRes.status, 200);
    assert.ok(editorRes.data.output_url || editorRes.data.video_url);
    console.log('✔ Test 11: Auto Video Editor verified (/api/editor/render multi-track composition)');
    passed++;
  } catch (e) {
    console.error('✘ Test 11 failed:', e.message);
    failed++;
  }

  // 12. Character Memory Conditioning Injection
  try {
    const directorWithChar = await simulateRequest('POST', '/api/director/generate', {
      prompt: 'A master ninja defends a neon temple',
      genre: 'cinematic',
      language: 'english',
      character_name: 'Kalyan',
      character_traits: 'Athletic, silver hair, cyber visor'
    });
    assert.strictEqual(directorWithChar.status, 200);
    assert.strictEqual(directorWithChar.data.status, 'success');
    assert.strictEqual(directorWithChar.data.character.name, 'Kalyan');
    assert.ok((directorWithChar.data.character.visual_traits || directorWithChar.data.character.traits).includes('Athletic'));
    console.log('✔ Test 12: Character Memory Conditioning Injection verified end-to-end');
    passed++;
  } catch (e) {
    console.error('✘ Test 12 failed:', e.message);
    failed++;
  }

  console.log(`\nFeature Tests Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runFeatureTests();
}

module.exports = runFeatureTests;
