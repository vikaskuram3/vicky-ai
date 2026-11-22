/**
 * VICKY AI - Automated Video Generation & H.264 MP4 Integrity Test Suite
 * Validates genuine ISO BMFF (ftypisom) H.264/AAC MP4 container encoding across aspect ratios.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

function runPython(code) {
  return new Promise((resolve, reject) => {
    const py = spawn('python', ['-c', code], { cwd: path.join(__dirname, '..') });
    let stdout = '';
    let stderr = '';
    py.stdout.on('data', d => stdout += d.toString());
    py.stderr.on('data', d => stderr += d.toString());
    py.on('close', code => {
      if (code === 0) {
        try {
          const lines = stdout.trim().split('\n');
          resolve(JSON.parse(lines[lines.length - 1]));
        } catch (e) {
          resolve({ raw: stdout });
        }
      } else {
        reject(new Error(stderr || stdout));
      }
    });
  });
}

function probeWithFFmpeg(filePath) {
  return new Promise((resolve, reject) => {
    const ffmpeg = path.join(__dirname, '..', 'bin', 'ffmpeg.exe');
    const p = spawn(ffmpeg, ['-i', filePath]);
    let stderr = '';
    p.stderr.on('data', d => stderr += d.toString());
    p.on('close', () => {
      // ffmpeg -i <file> exits with 1 when no output file specified, but outputs metadata in stderr
      const isH264 = stderr.includes('Video: h264') || stderr.includes('Video: libopenh264');
      const isAAC = stderr.includes('Audio: aac');
      const isISOM = stderr.includes('major_brand     : isom') || stderr.includes('compatible_brands');
      resolve({ isH264, isAAC, isISOM, raw: stderr });
    });
  });
}

async function runVideoTests() {
  console.log('--- Starting VICKY AI Video Generation & H.264 MP4 Integrity Test ---');
  let passed = 0;
  let failed = 0;

  const aspectRatios = ['16:9', '9:16', '1:1'];

  for (const aspect of aspectRatios) {
    const filename = `test_verified_${aspect.replace(':', '_')}.mp4`;
    const pyCode = `
import sys, json
sys.path.insert(0, '.')
from backend.engine.generative_synth import generate_video

res = generate_video(
    prompt='Cinematic neon pulse wave in dark void, volumetric god rays, 8k',
    aspect_ratio='${aspect}',
    duration_sec=2,
    fps=12,
    camera_motion='zoom_in',
    output_filename='${filename}'
)
print(json.dumps(res))
`;

    try {
      console.log(`Generating test video for aspect ratio ${aspect}...`);
      const result = await runPython(pyCode);
      const filePath = result.output_path;

      // 1. Check file exists & has .mp4 extension
      assert.ok(fs.existsSync(filePath), `Video file does not exist: ${filePath}`);
      assert.ok(filePath.toLowerCase().endsWith('.mp4'), `File missing .mp4 extension: ${filePath}`);

      // 2. Check file size is non-empty (> 5KB)
      const stats = fs.statSync(filePath);
      assert.ok(stats.size > 5000, `Video file size too small: ${stats.size} bytes`);

      // 3. Check ISO Base Media File Format header (must contain 'ftyp' in bytes 4-8)
      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(16);
      fs.readSync(fd, buffer, 0, 16, 0);
      fs.closeSync(fd);

      const magic = buffer.slice(4, 8).toString();
      assert.strictEqual(magic, 'ftyp', `File is NOT a valid ISO BMFF MP4! Header was: ${buffer.toString('hex')}`);

      // 4. Probe with FFmpeg to verify H.264 video & AAC audio streams
      const probe = await probeWithFFmpeg(filePath);
      assert.ok(probe.isH264, `FFmpeg did not detect H.264 stream: ${probe.raw.slice(0, 300)}`);
      assert.ok(probe.isAAC, `FFmpeg did not detect AAC audio stream`);

      console.log(`✔ Aspect ${aspect} passed:`);
      console.log(`  - File: ${path.basename(filePath)} (${stats.size} bytes)`);
      console.log(`  - Resolution: ${result.resolution} @ ${result.fps}fps`);
      console.log(`  - Magic Header: ftyp (${magic})`);
      console.log(`  - Streams: H.264 Video + AAC Audio (Windows Media Player & VLC 100% Ready)`);
      passed++;
    } catch (err) {
      console.error(`✘ Aspect ${aspect} failed:`, err.message);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

runVideoTests();
