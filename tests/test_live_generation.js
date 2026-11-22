/**
 * VICKY AI - Live Video Generation & Download End-to-End Verification Test
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { Readable, Writable } = require('stream');
const { handleRequest } = require('../server.js');
const { spawn } = require('child_process');

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
    const chunks = [];

    const res = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        callback();
      }
    });

    res.writeHead = (status, headers = {}) => {
      statusCode = status;
      if (typeof headers === 'object' && headers !== null) {
        for (const [k, v] of Object.entries(headers)) {
          responseHeaders[k.toLowerCase()] = v;
        }
      }
    };

    res.setHeader = (k, v) => {
      responseHeaders[k.toLowerCase()] = v;
    };

    res.end = (chunk) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const totalBuffer = Buffer.concat(chunks);
      resolve({ status: statusCode, headers: responseHeaders, buffer: totalBuffer });
    };

    handleRequest(req, res).catch(reject);
  });
}

async function runLiveTest() {
  console.log('========================================================');
  console.log('🎬 VICKY AI — LIVE GENERATION & DOWNLOAD VERIFICATION');
  console.log('========================================================\n');

  // STEP 1: Prompt & Generation Request
  const prompt = 'Futuristic bioluminescent cyber-station with neon reflections and volumetric light rays';
  console.log(`[1/5] Submitting generation request for prompt: "${prompt}"...`);
  
  const genPayload = {
    prompt: prompt,
    aspect_ratio: '16:9',
    duration: 3,
    fps: 16,
    camera_motion: 'zoom_in',
    model: 'ffmpeg-procedural'
  };

  const genRes = await simulateRequest('POST', '/api/generate/text-to-video', genPayload);
  assert.strictEqual(genRes.status, 200, 'Generation endpoint returned non-200 status');
  
  const genData = JSON.parse(genRes.buffer.toString('utf-8'));
  console.log('✔ Generation completed successfully!');
  console.log(`  - Video URL: ${genData.video_url}`);
  console.log(`  - File Name: ${genData.filename}`);
  console.log(`  - File Size: ${genData.file_size} bytes`);
  console.log(`  - Resolution: ${genData.resolution}`);
  console.log(`  - Codec: ${genData.codec}\n`);

  // STEP 2: Probe the Generated File with FFmpeg
  console.log('[2/5] Running deep stream probe on generated file...');
  const probeRes = await simulateRequest('GET', `/api/probe?file=${genData.filename}`);
  assert.strictEqual(probeRes.status, 200);
  const probeData = JSON.parse(probeRes.buffer.toString('utf-8'));
  console.log('✔ FFprobe Validation Result:');
  console.log(`  - Is MP4 Container: ${probeData.is_mp4_container}`);
  console.log(`  - Has H.264 Stream: ${probeData.has_h264_stream}`);
  console.log(`  - Has AAC Audio Stream: ${probeData.has_aac_stream}`);
  console.log(`  - Pixel Format: yuv420p (${probeData.pixel_format_yuv420p})`);
  console.log(`  - Decodable: ${probeData.can_decode}`);
  console.log(`  - Status: ${probeData.status}\n`);

  assert.strictEqual(probeData.valid, true, 'Probe reported invalid stream');

  // STEP 3: Download via /api/download
  console.log('[3/5] Testing MP4 Download via /api/download...');
  const downloadRes = await simulateRequest('GET', `/api/download?file=${encodeURIComponent(genData.filename)}&name=${encodeURIComponent('vicky_live_download')}.mp4`);
  
  assert.strictEqual(downloadRes.status, 200, 'Download endpoint did not return 200');
  const contentType = downloadRes.headers['content-type'];
  const contentDisp = downloadRes.headers['content-disposition'];
  const acceptRanges = downloadRes.headers['accept-ranges'];

  console.log('✔ Download Response Headers:');
  console.log(`  - Content-Type: ${contentType}`);
  console.log(`  - Content-Disposition: ${contentDisp}`);
  console.log(`  - Accept-Ranges: ${acceptRanges}`);
  console.log(`  - Downloaded Bytes: ${downloadRes.buffer.length} bytes\n`);

  assert.ok(contentType.includes('video/mp4'), 'Content-Type must be video/mp4');
  assert.ok(contentDisp.includes('attachment; filename='), 'Content-Disposition must be attachment');
  assert.ok(contentDisp.endsWith('.mp4"'), 'Filename must end in .mp4');
  assert.strictEqual(acceptRanges, 'bytes', 'Must support byte-ranges');

  // STEP 4: Byte-Level Magic Header Inspection
  console.log('[4/5] Inspecting downloaded binary file bytes...');
  const first32 = downloadRes.buffer.slice(0, 32);
  const magicFourCC = first32.slice(4, 8).toString('ascii');
  const majorBrand = first32.slice(8, 12).toString('ascii');

  console.log(`  - Hex: ${first32.toString('hex')}`);
  console.log(`  - Box Type (Bytes 4-7): ${magicFourCC} (Expected: ftyp)`);
  console.log(`  - Major Brand (Bytes 8-11): ${majorBrand} (Expected: isom)`);

  assert.strictEqual(magicFourCC, 'ftyp', 'Missing ftyp box in MP4');
  assert.strictEqual(majorBrand, 'isom', 'Major brand is not isom');
  console.log('✔ Binary header matches ISO Base Media File Format.\n');

  // STEP 5: Testing Wan 2.1 Unconnected GPU Behavior
  console.log('[5/5] Testing Wan 2.1 model selection when GPU is unconfigured...');
  const wanRes = await simulateRequest('POST', '/api/generate/text-to-video', {
    prompt: 'A cinematic drone shot of cyber city',
    model: 'wan-2.1'
  });

  const wanData = JSON.parse(wanRes.buffer.toString('utf-8'));
  console.log(`  - Status Code: ${wanRes.status} (Expected: 400 Bad Request)`);
  console.log(`  - Error Message: ${wanData.error}`);
  console.log(`  - Missing Configuration Reported: ${wanData.missing_configuration ? wanData.missing_configuration.service : 'None'}`);
  console.log(`  - Suggested Action: ${wanData.missing_configuration ? wanData.missing_configuration.suggested_model : 'None'}`);

  assert.strictEqual(wanRes.status, 400);
  assert.ok(wanData.missing_configuration);
  console.log('✔ System correctly rejects fake simulation and reports actual GPU requirements.\n');

  console.log('========================================================');
  console.log('🎉 ALL LIVE GENERATION & DOWNLOAD CHECKS COMPLETED!');
  console.log('========================================================');
}

runLiveTest().catch(err => {
  console.error('Live Test Failed:', err);
  process.exit(1);
});
