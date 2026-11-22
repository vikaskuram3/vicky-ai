"""
VICKY AI - Backend Configuration
Handles environment configurations, GPU detection, FFmpeg discovery, and model paths.
"""

import os
import shutil
import subprocess
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUTS_DIR = BASE_DIR / "data" / "outputs"
SAMPLES_DIR = BASE_DIR / "public" / "samples"
WORKFLOWS_DIR = BASE_DIR / "backend" / "workflows"
BIN_DIR = BASE_DIR / "bin"

OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
BIN_DIR.mkdir(parents=True, exist_ok=True)

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# FFmpeg Dynamic Resolution
def get_ffmpeg_path() -> str:
    """Locate FFmpeg executable across bundled bin, system paths, and standard directories"""
    candidates = [
        os.getenv("FFMPEG_PATH"),
        str(BIN_DIR / "ffmpeg.exe"),
        str(BIN_DIR / "ffmpeg"),
        r"C:\Program Files\AI ExpertMeet\resources\bindings\FFmpeg\ffmpeg.exe",
        r"C:\ffmpeg\bin\ffmpeg.exe",
        r"C:\ProgramData\chocolatey\bin\ffmpeg.exe",
        shutil.which("ffmpeg")
    ]
    for c in candidates:
        if c and os.path.isfile(c):
            return str(Path(c).resolve())
    return None

FFMPEG_BIN = get_ffmpeg_path()

def get_ffmpeg_health() -> dict:
    """Validate FFmpeg installation and available video/audio encoders"""
    ffmpeg = get_ffmpeg_path()
    if not ffmpeg:
        return {
            "installed": False,
            "error": "FFmpeg executable not found. Please install FFmpeg or place in bin/."
        }
    try:
        res = subprocess.run([ffmpeg, "-version"], capture_output=True, text=True, timeout=5)
        first_line = res.stdout.splitlines()[0] if res.stdout else "FFmpeg present"
        
        # Check encoder capabilities
        enc_res = subprocess.run([ffmpeg, "-encoders"], capture_output=True, text=True, timeout=5)
        enc_text = enc_res.stdout or ""
        
        has_libx264 = "libx264" in enc_text
        has_libopenh264 = "libopenh264" in enc_text
        has_h264_mf = "h264_mf" in enc_text
        has_aac = " aac" in enc_text or "aac_mf" in enc_text

        chosen_h264 = "libx264" if has_libx264 else ("libopenh264" if has_libopenh264 else ("h264_mf" if has_h264_mf else None))

        return {
            "installed": True,
            "path": ffmpeg,
            "version": first_line,
            "h264_encoder": chosen_h264,
            "has_aac": has_aac,
            "ready_for_mp4": chosen_h264 is not None and has_aac
        }
    except Exception as e:
        return {
            "installed": False,
            "error": str(e)
        }

# ComfyUI Integration (RunPod / Modal / Local)
COMFYUI_HOST = os.getenv("COMFYUI_HOST", "127.0.0.1:8188")
COMFYUI_ENABLED = os.getenv("COMFYUI_ENABLED", "false").lower() == "true"

# GPU Hardware Acceleration
USE_GPU = os.getenv("USE_GPU", "false").lower() == "true"

# Default Open-Source Model
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "wan-2.1")

# Supported Models List
SUPPORTED_MODELS = [
    {
        "id": "wan-2.1",
        "name": "Wan 2.1 (T2V 14B / 1.3B - GPU Backend)",
        "type": "text-to-video",
        "description": "State-of-the-art open-source video foundation model by Alibaba WanX team with cinematic 1080p photorealism. Requires connected GPU backend or ComfyUI instance.",
        "requires_gpu": True,
        "aspect_ratios": ["16:9", "9:16", "1:1"],
        "max_duration": 10,
        "recommended_fps": 24
    },
    {
        "id": "ffmpeg-procedural",
        "name": "Built-in Open-Source FFmpeg Engine (H.264 / AAC)",
        "type": "text-to-video",
        "description": "Verified open-source kinematic diffusion visual synthesizer powered by FFmpeg. Fully ready on CPU & GPU with zero external dependencies.",
        "requires_gpu": False,
        "aspect_ratios": ["16:9", "9:16", "1:1"],
        "max_duration": 8,
        "recommended_fps": 24
    },
    {
        "id": "svd-xt",
        "name": "Stable Video Diffusion (SVD-XT 1.1)",
        "type": "image-to-video",
        "description": "Stability AI's high-fidelity image-to-video foundation model with smooth motion trajectory.",
        "requires_gpu": False,
        "aspect_ratios": ["16:9", "9:16", "1:1"],
        "max_duration": 4,
        "recommended_fps": 24
    },
    {
        "id": "animatediff-xl",
        "name": "AnimateDiff XL v3",
        "type": "text-to-video",
        "description": "Motion module tuned for high-motion stylized anime, cyberpunk, and hyperlapse visuals.",
        "requires_gpu": False,
        "aspect_ratios": ["16:9", "9:16", "1:1"],
        "max_duration": 8,
        "recommended_fps": 16
    },
    {
        "id": "comfyui-direct",
        "name": "ComfyUI Pipeline (Custom Graph)",
        "type": "hybrid",
        "description": "Direct node execution on connected ComfyUI GPU backend.",
        "requires_gpu": True,
        "aspect_ratios": ["16:9", "9:16", "1:1"],
        "max_duration": 15,
        "recommended_fps": 24
    }
]
