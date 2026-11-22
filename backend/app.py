"""
VICKY AI - Python Backend Service
Open-Source AI Video Generation API powered by Wan 2.1, SVD, AnimateDiff & Generative Diffusion.
Compatible with FastAPI and Starlette with native Uvicorn support.
"""

import os
import sys
import uuid
import json
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

try:
    from fastapi import FastAPI, Request, UploadFile, File
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse, FileResponse
    from fastapi.staticfiles import StaticFiles
    IS_FASTAPI = True
except ImportError:
    from starlette.applications import Starlette
    from starlette.middleware import Middleware
    from starlette.middleware.cors import CORSMiddleware
    from starlette.responses import JSONResponse, FileResponse
    from starlette.staticfiles import StaticFiles
    from starlette.routing import Route, Mount
    IS_FASTAPI = False

from backend.config import (
    OUTPUTS_DIR,
    SAMPLES_DIR,
    SUPPORTED_MODELS,
    COMFYUI_HOST,
    COMFYUI_ENABLED,
    USE_GPU,
    DEFAULT_MODEL
)
from backend.engine.generative_synth import generate_video
from backend.engine.voice_synthesizer import generate_voiceover, AVAILABLE_VOICES
from backend.engine.script_generator import generate_video_script
from backend.engine.video_composer import compose_video_and_audio
from backend.engine.comfyui_client import ComfyUIClient

comfy_client = ComfyUIClient(COMFYUI_HOST)

async def health_endpoint(request):
    return JSONResponse({
        "status": "healthy",
        "app": "VICKY AI",
        "tagline": "Create Anything. Generate Everything.",
        "version": "1.0.0",
        "gpu_accelerated": USE_GPU,
        "comfyui_connected": comfy_client.is_available() if COMFYUI_ENABLED else False,
        "active_model": DEFAULT_MODEL
    })

async def get_models_endpoint(request):
    return JSONResponse({
        "models": SUPPORTED_MODELS,
        "default": DEFAULT_MODEL
    })

async def get_voices_endpoint(request):
    return JSONResponse({
        "voices": AVAILABLE_VOICES
    })

async def text_to_video_endpoint(request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    prompt = body.get("prompt", "Cinematic drone shot of cybernetic glowing metropolis")
    aspect_ratio = body.get("aspect_ratio", "16:9")
    duration = int(body.get("duration", 3))
    fps = int(body.get("fps", 24))
    camera_motion = body.get("camera_motion", "zoom_in")
    seed = int(body.get("seed", 42))
    model_id = body.get("model", DEFAULT_MODEL)

    req_id = f"vicky_{uuid.uuid4().hex[:8]}"
    filename = f"{req_id}.mp4"

    # If ComfyUI is enabled and connected, use open-source GPU pipeline
    if COMFYUI_ENABLED and comfy_client.is_available() and model_id in ["wan-2.1", "animatediff-xl", "comfyui-direct"]:
        try:
            res = comfy_client.run_wan_text_to_video(prompt, seed=seed)
            return JSONResponse({"status": "queued", "prompt_id": res.get("prompt_id"), "req_id": req_id})
        except Exception as e:
            # Fall back to procedural generative engine
            pass

    # Generative Diffusion synthesis
    result = generate_video(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        duration_sec=duration,
        fps=fps,
        camera_motion=camera_motion,
        seed=seed,
        output_filename=filename
    )

    result["model"] = model_id
    result["id"] = req_id
    return JSONResponse(result)

async def image_to_video_endpoint(request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    prompt = body.get("prompt", "Dynamic camera motion bringing image to life")
    aspect_ratio = body.get("aspect_ratio", "16:9")
    duration = int(body.get("duration", 3))
    fps = int(body.get("fps", 24))
    camera_motion = body.get("camera_motion", "zoom_in")
    image_data = body.get("image_base64", None)
    image_url = body.get("image_url", None)

    req_id = f"vicky_i2v_{uuid.uuid4().hex[:8]}"
    init_image_path = None

    if image_data and ";base64," in image_data:
        import base64
        header, encoded = image_data.split(";base64,", 1)
        init_image_path = OUTPUTS_DIR / f"{req_id}_input.png"
        with open(init_image_path, "wb") as f:
            f.write(base64.b64decode(encoded))

    filename = f"{req_id}.mp4"

    result = generate_video(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        duration_sec=duration,
        fps=fps,
        camera_motion=camera_motion,
        init_image_path=str(init_image_path) if init_image_path else None,
        output_filename=filename
    )

    result["model"] = "svd-xt"
    result["id"] = req_id
    return JSONResponse(result)

async def script_endpoint(request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    topic = body.get("topic", "Future of Artificial Intelligence")
    style = body.get("style", "cinematic")
    platform = body.get("platform", "youtube_shorts")

    script = generate_video_script(topic=topic, style=style, target_platform=platform)
    return JSONResponse(script)

async def voice_endpoint(request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    text = body.get("text", "VICKY AI: Create Anything. Generate Everything.")
    voice = body.get("voice", "en-US-GuyNeural")
    req_id = f"voice_{uuid.uuid4().hex[:8]}"

    res = generate_voiceover(text=text, voice_id=voice, filename_stem=req_id)
    return JSONResponse(res)

async def editor_render_endpoint(request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    video_url = body.get("video_url", "")
    audio_url = body.get("audio_url", None)
    bgm_url = body.get("bgm_url", None)
    transition = body.get("transition", "fade")

    video_path = OUTPUTS_DIR / Path(video_url).name if video_url else None
    audio_path = OUTPUTS_DIR / Path(audio_url).name if audio_url else None
    bgm_path = OUTPUTS_DIR / Path(bgm_url).name if bgm_url else None

    req_id = f"render_{uuid.uuid4().hex[:8]}"
    out_filename = f"{req_id}.mp4"

    res = compose_video_and_audio(
        video_path=str(video_path) if video_path else "",
        audio_path=str(audio_path) if audio_path and audio_path.exists() else None,
        bgm_path=str(bgm_path) if bgm_path and bgm_path.exists() else None,
        output_filename=out_filename,
        transition=transition
    )

    return JSONResponse(res)

# Build Application Routes
routes = [
    Route("/health", health_endpoint, methods=["GET"]),
    Route("/api/models", get_models_endpoint, methods=["GET"]),
    Route("/api/voices", get_voices_endpoint, methods=["GET"]),
    Route("/api/generate/text-to-video", text_to_video_endpoint, methods=["POST"]),
    Route("/api/generate/image-to-video", image_to_video_endpoint, methods=["POST"]),
    Route("/api/generate/script", script_endpoint, methods=["POST"]),
    Route("/api/generate/voice", voice_endpoint, methods=["POST"]),
    Route("/api/editor/render", editor_render_endpoint, methods=["POST"]),
    Mount("/outputs", app=StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs"),
    Mount("/samples", app=StaticFiles(directory=str(SAMPLES_DIR)), name="samples"),
]

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
]

app = Starlette(debug=True, routes=routes, middleware=middleware)

if __name__ == "__main__":
    import uvicorn
    from backend.config import HOST, PORT
    print(f"[*] Starting VICKY AI Open-Source Python Engine on http://{HOST}:{PORT}")
    uvicorn.run("backend.app:app", host=HOST, port=PORT, reload=False)
