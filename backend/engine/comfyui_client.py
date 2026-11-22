"""
VICKY AI - ComfyUI Client
Connects VICKY AI to open-source ComfyUI server for Wan 2.1, Stable Video Diffusion, and AnimateDiff.
"""

import json
import urllib.request
import urllib.parse
import uuid
import time
import os
from pathlib import Path
from backend.config import COMFYUI_HOST, WORKFLOWS_DIR, OUTPUTS_DIR

class ComfyUIClient:
    def __init__(self, host=COMFYUI_HOST):
        self.host = host
        self.client_id = str(uuid.uuid4())

    def is_available(self) -> bool:
        """Check if ComfyUI server is reachable"""
        try:
            req = urllib.request.Request(f"http://{self.host}/system_stats", method="GET")
            with urllib.request.urlopen(req, timeout=2) as response:
                return response.status == 200
        except Exception:
            return False

    def load_workflow(self, workflow_name: str) -> dict:
        """Load workflow JSON template"""
        workflow_file = WORKFLOWS_DIR / f"{workflow_name}.json"
        if not workflow_file.exists():
            raise FileNotFoundError(f"Workflow template {workflow_name} not found.")
        with open(workflow_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def queue_prompt(self, prompt_graph: dict) -> dict:
        """Submit prompt graph to ComfyUI /prompt endpoint"""
        data = json.dumps({"prompt": prompt_graph["prompt"], "client_id": self.client_id}).encode('utf-8')
        req = urllib.request.Request(
            f"http://{self.host}/prompt",
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))

    def get_history(self, prompt_id: str) -> dict:
        """Get output execution history for a prompt ID"""
        req = urllib.request.Request(f"http://{self.host}/history/{prompt_id}")
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))

    def download_output_file(self, filename: str, subfolder: str = "", folder_type: str = "output") -> Path:
        """Download or copy generated video from ComfyUI to local outputs directory"""
        params = urllib.parse.urlencode({"filename": filename, "subfolder": subfolder, "type": folder_type})
        url = f"http://{self.host}/view?{params}"
        dest_path = OUTPUTS_DIR / filename
        urllib.request.urlretrieve(url, str(dest_path))
        return dest_path

    def run_wan_text_to_video(self, prompt_text: str, negative_prompt: str = "", steps: int = 25, seed: int = 42) -> dict:
        """Execute Wan 2.1 Text-to-Video Workflow"""
        graph = self.load_workflow("wan_t2v_workflow")
        # Inject user parameters
        graph["prompt"]["2"]["inputs"]["text"] = prompt_text
        if negative_prompt:
            graph["prompt"]["3"]["inputs"]["text"] = negative_prompt
        graph["prompt"]["5"]["inputs"]["steps"] = steps
        graph["prompt"]["5"]["inputs"]["seed"] = seed

        res = self.queue_prompt(graph)
        return res

    def run_svd_image_to_video(self, image_path: str, motion_bucket_id: int = 127, steps: int = 25) -> dict:
        """Execute Stable Video Diffusion Image-to-Video Workflow"""
        graph = self.load_workflow("svd_i2v_workflow")
        graph["prompt"]["3"]["inputs"]["motion_bucket_id"] = motion_bucket_id
        graph["prompt"]["4"]["inputs"]["steps"] = steps
        return self.queue_prompt(graph)
