"""
VICKY AI - AI Story Director & Movie Script Generator
Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."

Generates:
1. One-Prompt Movie Maker scenes (Acts 1-4)
2. Character Memory conditioning injection
3. AI Story Director (Story premise, Screenplay, Scene breakdown, Camera instructions, Narration, Subtitles)
4. Telugu AI Studio (Pure Telugu & Teluglish mixed scripts, Tollywood presets)
"""

import re
from typing import Dict, List, Any, Optional

# Thematic prompt presets
THEME_DATABASE = {
    "tech": {
        "visual_style": "futuristic holographic HUD, glowing fiber optics, sleek glass reflections, neon cyan and violet highlights",
        "music": "Cyberpunk Synthwave or High-Tech Ambient Electronic",
        "hook_templates": [
            "What if artificial intelligence isn't just changing the future—it's building it right now?",
            "Stop scrolling. This single AI breakthrough is about to change everything you know about video creation.",
            "You won't believe what just happened in the world of open-source artificial intelligence."
        ]
    },
    "cinematic": {
        "visual_style": "35mm anamorphic film lens, dramatic golden hour volumetric lighting, deep depth of field, 8k photorealism",
        "music": "Hans Zimmer Style Epic Cinematic Orchestral",
        "hook_templates": [
            "Every epic story begins with a single bold vision.",
            "In a world where boundaries fade, true innovation takes flight.",
            "Look closer. The unseen details tell the greatest story of all."
        ]
    },
    "business": {
        "visual_style": "minimalist corporate studio, crisp typography, clean data visualizations, modern executive aesthetic",
        "music": "Inspiring Uplifting Corporate Acoustic & Piano",
        "hook_templates": [
            "Are you still spending hours creating marketing videos manually?",
            "Here is the secret top creators use to 10x their production speed without spending a dime.",
            "The old way of video production is dead. Here is what is replacing it."
        ]
    },
    "education": {
        "visual_style": "engaging isometric 3D illustrations, smooth animated infographics, vibrant contrasting color palette",
        "music": "Lofi Chill Study Beats or Curious Upbeat Instrumental",
        "hook_templates": [
            "Did you know that 80% of internet traffic is now pure video content?",
            "Here is the fascinating science behind how AI models generate video frame by frame.",
            "3 simple steps that will instantly level up your creative workflow."
        ]
    },
    "telugu_mass": {
        "visual_style": "high-octane Tollywood elevation, slow-motion dust storm, fiery golden backlighting, dynamic anamorphic lens flares, intense heroic glare",
        "music": "Thumping Dholak, Heavy Brass Elevation Beats & Epic Sitar",
        "hook_templates": [
            "ఒక శకం ముగిసింది... ఇప్పుడు కొత్త చరిత్ర మొదలవుతుంది!",
            "Mass elevation incoming! When the hero steps onto the battlefield, the rules change.",
            "ఇది కేవలం సినిమా కాదు... ఒక పవర్-ప్యాక్డ్ విజువల్ ఎక్స్‌పీరియన్స్!"
        ]
    },
    "telugu_emotional": {
        "visual_style": "warm nostalgic sepia tone, soft rain particles on window, golden sunset backlight, tender close-up cinematography",
        "music": "Soulful Acoustic Violin & Soft Piano Melody",
        "hook_templates": [
            "కొన్ని జ్ఞాపకాలు ఎప్పటికీ చెరిగిపోవు... కాలం మారినా మనసు మారదు.",
            "A story of love, sacrifice and eternal memories that stay with us forever.",
            "ఈ ప్రయాణంలో ప్రతి క్షణం ఒక అనుభూతి... ఒక మధురమైన జ్ఞాపకం."
        ]
    },
    "telugu_scifi": {
        "visual_style": "Amaravati 2050 cyberpunk skyline, floating magnetic hyper-trains, glowing Telugu holographic glyphs, neon purple & electric-blue energy shields",
        "music": "Futuristic Hybrid Cyber Synthwave with Indian Percussion",
        "hook_templates": [
            "2050 లో హైదరాబాద్ మరియు అమరావతి... ఊహించని సరికొత్త ప్రపంచం!",
            "What happens when ancient Vedic knowledge merges with Quantum Cybernetics in 2050?",
            "భవిష్యత్తు వైపు ఒక సాహసోపేతమైన అడుగు... క్వాంటమ్ యుగం మొదలైంది!"
        ]
    },
    "telugu_mythological": {
        "visual_style": "ancient golden palace of Hastinapura, divine radiant aura, glowing cosmic astras, majestic celestial clouds, 8K epic cinema lighting",
        "music": "Grand Vedic Sanskrit Chants, Temple Bells & Thunderous Damru",
        "hook_templates": [
            "యుగాల నాటి ధర్మ యుద్ధం... పురాణాల వెలుగులో వెలిసిన దివ్య కథ!",
            "Witness the grand awakening of cosmic divine power in a forgotten era.",
            "ధర్మం అధర్మం మధ్య జరిగే మహా సంగ్రామం... ఇది శాశ్వతమైన విజయం!"
        ]
    },
    "telugu_village": {
        "visual_style": "raw rustic Rayalaseema village, dry red soil explosion, intense sun flare, cinematic dust wind, sharp action framing",
        "music": "Raw Folk Percussion, Oggu Katha Beats & Roaring Bass",
        "hook_templates": [
            "ఆ ఊరి నేలమీద రక్తపు చారలు... న్యాయం కోసం లేచిన ఒంటరి వీరుడు!",
            "Raw, rustic and uncompromising power. When self-respect meets iron will.",
            "ఇది పల్లెటూరి పౌరుషం... అన్యాయాన్ని ఎదిరించే సాహసోపేతమైన పోరాటం!"
        ]
    }
}

# Tollywood Cinematic Presets
TOLLYWOOD_PRESETS = {
    "mass_hero": {
        "name": "Mass Hero Elevation (హీరో ఎలివేషన్)",
        "theme": "telugu_mass",
        "default_camera": "Extreme Low Angle Dutch Tilt Slow Push-In",
        "sample_telugu": "ఒక్క అడుగు ముందుకు వేస్తే చరిత్ర తిరగరాయడం ఖాయం. నా దారి రహదారి!",
        "sample_teluglish": "Scene lo hero enter avvagane theatre lo whistles blast avvali! This is mass elevation at its peak.",
        "bgm": "Roaring Brass Horns, Thumping Thavil Beats & Electric Sitar"
    },
    "emotional_flashback": {
        "name": "Emotional Flashback (ఎమోషనల్ ఫ్లాష్‌బ్యాక్)",
        "theme": "telugu_emotional",
        "default_camera": "Soft Focus 85mm Portrait Tracking Shot with Rain bokeh",
        "sample_telugu": "కాలం వెనక్కి వెళ్తుంటే... పాత జ్ఞాపకాలు గుండెల్లో తారాడుతున్నాయి.",
        "sample_teluglish": "Memory lo prathi scene oka unforgettable emotion la undi. A pure nostalgic flashback.",
        "bgm": "Gentle Violin Arpeggios & Rain Droplet Melodies"
    },
    "scifi_andhra": {
        "name": "Sci-Fi Andhra 2050 (సైన్స్ ఫిక్షన్)",
        "theme": "telugu_scifi",
        "default_camera": "High Altitude Drone Orbit around Holographic Cyber Pagoda",
        "sample_telugu": "2050 లో హైదరాబాద్ ఆకాశంలో తేలియాడే నగరాలు... కొత్త యుగానికి నాంది!",
        "sample_teluglish": "Cyberpunk Neo-Hyderabad lo quantum core activate aindi. The future is electric!",
        "bgm": "Pulsing Synthwave Bassline & Holographic Audio Glitches"
    },
    "mythological_epic": {
        "name": "Mythological Epic (పౌరాణిక కావ్యం)",
        "theme": "telugu_mythological",
        "default_camera": "Epic Golden Hour Crane Ascending to Celestial Kingdom",
        "sample_telugu": "అధర్మం పెచ్చుమీరినప్పుడు... దివ్య ఆయుధాలు ధర్మ రక్షణకు ఆవిర్భవిస్తాయి!",
        "sample_teluglish": "Ancient Vedic kingdom lo divine energy unlock aindi. An epic visual saga.",
        "bgm": "Sacred Chants, Temple Shankham & Cosmic Thunder"
    },
    "village_action": {
        "name": "Village Action Thriller (పల్లెటూరి యాక్షన్)",
        "theme": "telugu_village",
        "default_camera": "Handheld Tracking Whip-Pan across rustic red earth",
        "sample_telugu": "ఈ మట్టికి ఒక పౌరుషం ఉంది... మాట తప్పని వీరుడి కథ ఇది!",
        "sample_teluglish": "Raw rustic action and explosive intensity. Real village mass power.",
        "bgm": "High BPM Rural Folk Drums & Heavy Sub-Bass"
    }
}

def format_timestamp(seconds: float) -> str:
    """Format seconds into standard SRT timestamp HH:MM:SS,mmm"""
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

def generate_srt(scenes: List[Dict[str, Any]]) -> str:
    """Generate formatted SRT subtitle string from scenes"""
    srt_lines = []
    current_time = 0.0
    for idx, scene in enumerate(scenes, 1):
        duration = float(scene.get("duration_sec", 4))
        start_ts = format_timestamp(current_time)
        end_ts = format_timestamp(current_time + duration)
        subtitle_text = scene.get("subtitles") or scene.get("voiceover", "")
        srt_lines.append(f"{idx}\n{start_ts} --> {end_ts}\n{subtitle_text}\n")
        current_time += duration
    return "\n".join(srt_lines)

def generate_story_director(
    prompt: str,
    character_name: Optional[str] = None,
    character_traits: Optional[str] = None,
    genre: str = "cinematic",
    language: str = "english",
    is_teluglish: bool = False
) -> Dict[str, Any]:
    """
    AI Story Director Engine:
    Converts one prompt into:
    - Story Logline & Premise
    - Full Screenplay Script
    - Scene breakdown
    - Camera instructions
    - Narration text
    - Timed subtitles (SRT format)
    """
    clean_prompt = prompt.strip() or "A mysterious traveler discovers a glowing alien artifact in a cyberpunk city"

    # Character conditioning
    char_prefix = ""
    if character_name:
        traits_str = f" ({character_traits})" if character_traits else ""
        char_prefix = f"Featuring consistent protagonist {character_name}{traits_str}. "

    # Select theme
    theme_key = "cinematic"
    if genre in THEME_DATABASE:
        theme_key = genre
    elif "mass" in clean_prompt.lower() or "hero" in clean_prompt.lower() or "elevation" in clean_prompt.lower():
        theme_key = "telugu_mass"
    elif "emotion" in clean_prompt.lower() or "love" in clean_prompt.lower():
        theme_key = "telugu_emotional"
    elif "cyber" in clean_prompt.lower() or "future" in clean_prompt.lower() or "scifi" in clean_prompt.lower():
        theme_key = "telugu_scifi" if (language == "telugu" or is_teluglish) else "tech"

    theme = THEME_DATABASE.get(theme_key, THEME_DATABASE["cinematic"])

    # Multi-scene breakdown (4-act movie structure)
    if language == "telugu" and not is_teluglish:
        # Pure Telugu Movie Generation
        scenes = [
            {
                "scene": 1,
                "act": "Act I - The Awakening (ప్రారంభం)",
                "title": "Scene 1: Establishing the World",
                "duration_sec": 4,
                "visual_prompt": f"{char_prefix}Cinematic establishing shot of {clean_prompt}, {theme['visual_style']}, 8K resolution",
                "camera_motion": "Slow Push-In towards horizon with 35mm anamorphic flare",
                "camera_instruction": "Wide angle dolly-in, 24fps, shallow depth of field, slow focus pull to subject",
                "voiceover": f"ఒక కొత్త ప్రపంచం ప్రారంభమైంది. {clean_prompt} ద్వారా సరికొత్త విప్లవం వెలుగులోకి వచ్చింది.",
                "subtitles": f"ఒక అద్భుతమైన ప్రయాణం ప్రారంభమైంది: {clean_prompt[:35]}..."
            },
            {
                "scene": 2,
                "act": "Act II - Rising Tension (సంక్షోభం)",
                "title": "Scene 2: Confronting the Unknown",
                "duration_sec": 5,
                "visual_prompt": f"{char_prefix}Intense medium close-up, dynamic lightning, glowing energy surges around {clean_prompt}, {theme['visual_style']}",
                "camera_motion": "Orbiting Camera Sweep 180 degrees",
                "camera_instruction": "Medium close-up orbiting tracking shot, dutch tilt 10 degrees, volumetric smoke particles",
                "voiceover": "పరిస్థితి మరింత ఉత్కంఠభరితంగా మారింది. అనుకోని రహస్యం బట్టబయలైన సమయం ఇది.",
                "subtitles": "అనుకోని రహస్యాలు బట్టబయలైన ఉత్కంఠభరిత క్షణం."
            },
            {
                "scene": 3,
                "act": "Act III - The Climax (శిఖరాగ్రం)",
                "title": "Scene 3: The Power Surge",
                "duration_sec": 5,
                "visual_prompt": f"{char_prefix}High-energy climax elevation, burst of electric-blue and purple aura, {clean_prompt}, {theme['visual_style']}",
                "camera_motion": "Fast dynamic camera zoom with motion blur",
                "camera_instruction": "Extreme low-angle push-in, fast shutter speed 1/120s, dynamic cinematic flare",
                "voiceover": "ఇది కేవలం పోరాటం మాత్రమే కాదు... ఆత్మవిశ్వాసంతో చరిత్రను మార్చే మహా విజయం!",
                "subtitles": "చరిత్రను తిరగరాసే మహా శిఖరాగ్ర ఘట్టం!"
            },
            {
                "scene": 4,
                "act": "Act IV - Resolution & Legend (ముగింపు)",
                "title": "Scene 4: The Immortal Legend",
                "duration_sec": 4,
                "visual_prompt": f"{char_prefix}Epic golden hour wide panorama, heroic silhouette overlooking vast cinematic expanse, glowing VICKY AI cinema emblem, {theme['visual_style']}",
                "camera_motion": "Elevating Jib Shot into sunrise",
                "camera_instruction": "Jib crane ascending upward, golden hour backlight, atmospheric haze, slow fade out",
                "voiceover": "ఒక్క ఆలోచన... ఒక దృశ్య కావ్యం... VICKY AI తో మీ సృజనాత్మకతకు అవధులు లేవు.",
                "subtitles": "వన్ ప్రాంప్ట్. వన్ స్టోరీ. వన్ కంప్లీట్ మూవీ - VICKY AI."
            }
        ]
        logline = f"తెలుగు సినీ శైలిలో రూపొందించబడిన విజువల్ దృశ్య కావ్యం: {clean_prompt}."
    elif is_teluglish or language == "teluglish":
        # Teluglish (Telugu-English blend)
        scenes = [
            {
                "scene": 1,
                "act": "Act I - The Intro Hook (హీరో ఎంట్రీ)",
                "title": "Scene 1: World Discovery",
                "duration_sec": 4,
                "visual_prompt": f"{char_prefix}Cinematic establishing shot of {clean_prompt}, {theme['visual_style']}, 8k",
                "camera_motion": "Low angle slow push-in with electric anamorphic flare",
                "camera_instruction": "Wide angle dolly-in, 24fps, shallow depth of field, slow focus pull to subject",
                "voiceover": f"Story start aindi. In a futuristic world, {clean_prompt} created a massive shockwave!",
                "subtitles": f"Wait till you see this! {clean_prompt[:30]}..."
            },
            {
                "scene": 2,
                "act": "Act II - Plot Twist (బిగ్ ట్విస్ట్)",
                "title": "Scene 2: The Core Conflict",
                "duration_sec": 5,
                "visual_prompt": f"{char_prefix}Dynamic medium shot, energy particles pulsating, high tension atmosphere around {clean_prompt}, {theme['visual_style']}",
                "camera_motion": "Orbiting Camera Sweep 180 degrees",
                "camera_instruction": "Medium close-up orbiting tracking shot, dutch tilt 10 degrees, volumetric smoke particles",
                "voiceover": "Kani unexpected ga oka mind-bending secret reveal aindi. The game completely changed!",
                "subtitles": "Unexpected ga situation motham change aipoyindi!"
            },
            {
                "scene": 3,
                "act": "Act III - Mass Elevation Climax (శిఖరాగ్రం)",
                "title": "Scene 3: Climax Surge",
                "duration_sec": 5,
                "visual_prompt": f"{char_prefix}Explosive mass elevation visual, glowing purple-cyan light trails, {clean_prompt}, {theme['visual_style']}",
                "camera_motion": "Rapid Zoom-In with motion blur",
                "camera_instruction": "Extreme low-angle push-in, fast shutter speed 1/120s, dynamic cinematic flare",
                "voiceover": "Mass elevation at its peak! Power, action, and pure adrenaline combined into one epic moment.",
                "subtitles": "Mass elevation at peak! Full power and pure adrenaline."
            },
            {
                "scene": 4,
                "act": "Act IV - Cinematic Outro (రోరింగ్ ఎండ్)",
                "title": "Scene 4: The Legacy",
                "duration_sec": 4,
                "visual_prompt": f"{char_prefix}Golden panoramic vista, silhouette of hero against illuminated sky, VICKY AI cinematic emblem, {theme['visual_style']}",
                "camera_motion": "Slow Pull-Back to Wide Panorama",
                "camera_instruction": "Jib crane ascending upward, golden hour backlight, atmospheric haze",
                "voiceover": "One Prompt. One Story. One Complete Movie. Create your Tollywood masterpiece with VICKY AI.",
                "subtitles": "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
            }
        ]
        logline = f"A high-energy Telugu-English cinematic experience: {clean_prompt}."
    else:
        # Standard Cinematic English Movie Generation
        scenes = [
            {
                "scene": 1,
                "act": "Act I - The Establishing World",
                "title": "Scene 1: The Inciting Vision",
                "duration_sec": 4,
                "visual_prompt": f"{char_prefix}Cinematic establishing shot of {clean_prompt}, {theme['visual_style']}, 8k photorealism",
                "camera_motion": "Slow Push-In towards horizon with 35mm anamorphic flare",
                "camera_instruction": "Wide angle dolly-in, 24fps, shallow depth of field, slow focus pull to subject",
                "voiceover": f"Every great journey begins with a spark. In a world shaped by imagination, {clean_prompt} came to life.",
                "subtitles": f"In a world of imagination, {clean_prompt[:35]} emerges."
            },
            {
                "scene": 2,
                "act": "Act II - The Discovery & Rising Conflict",
                "title": "Scene 2: Into the Uncharted",
                "duration_sec": 5,
                "visual_prompt": f"{char_prefix}Macro tracking shot exploring intricate details of {clean_prompt}, volumetric lighting, {theme['visual_style']}",
                "camera_motion": "Orbiting Camera Sweep 180 degrees",
                "camera_instruction": "Medium close-up orbiting tracking shot, dutch tilt 10 degrees, volumetric smoke particles",
                "voiceover": "As boundaries dissolved, the deeper truth surfaced. What seemed impossible was only the beginning.",
                "subtitles": "Boundaries dissolve as the hidden mystery unfolds."
            },
            {
                "scene": 3,
                "act": "Act III - The Climax & Revelation",
                "title": "Scene 3: The Moment of Power",
                "duration_sec": 5,
                "visual_prompt": f"{char_prefix}Dynamic high-energy cinematic climax, glowing electric-blue energy, atmospheric tension around {clean_prompt}, {theme['visual_style']}",
                "camera_motion": "Fast dynamic camera zoom with motion blur",
                "camera_instruction": "Extreme low-angle push-in, fast shutter speed 1/120s, dynamic cinematic flare",
                "voiceover": "In the decisive moment, fear transformed into raw power. History was forged in an instant.",
                "subtitles": "At the peak moment, history is rewritten forever."
            },
            {
                "scene": 4,
                "act": "Act IV - Resolution & Triumph",
                "title": "Scene 4: The New Horizon",
                "duration_sec": 4,
                "visual_prompt": f"{char_prefix}Breathtaking wide-angle vista, triumphant hero silhouette, golden hour rays, VICKY AI cinema watermark, {theme['visual_style']}",
                "camera_motion": "Elevating Jib Shot into sunrise",
                "camera_instruction": "Jib crane ascending upward, golden hour backlight, atmospheric haze",
                "voiceover": "One prompt. One story. One complete movie. Unleash your cinematic universe with VICKY AI.",
                "subtitles": "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE - VICKY AI."
            }
        ]
        logline = f"A gripping cinematic journey exploring {clean_prompt} across four unified narrative acts."

    total_duration = sum(s["duration_sec"] for s in scenes)
    srt_content = generate_srt(scenes)

    # Full Screenplay script
    screenplay_lines = [
        f"TITLE: {clean_prompt.upper()[:40]}",
        f"TAGLINE: ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE.",
        f"DIRECTOR: AI STORY DIRECTOR (VICKY AI STUDIO)",
        f"LOGLINE: {logline}",
        f"PROTAGONIST: {character_name or 'The Traveler'}",
        "=" * 50,
        ""
    ]

    for s in scenes:
        screenplay_lines.append(f"[{s['act'].upper()}] - {s['title'].upper()}")
        screenplay_lines.append(f"CAMERA: {s['camera_instruction']}")
        screenplay_lines.append(f"VISUAL: {s['visual_prompt']}")
        screenplay_lines.append(f"NARRATION (V.O.): \"{s['voiceover']}\"")
        screenplay_lines.append(f"TIMING: {s['duration_sec']} SECONDS")
        screenplay_lines.append("-" * 40)
        screenplay_lines.append("")

    full_screenplay = "\n".join(screenplay_lines)

    return {
        "status": "success",
        "title": clean_prompt.title()[:45],
        "tagline": "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE.",
        "logline": logline,
        "genre": genre,
        "language": language,
        "is_teluglish": is_teluglish,
        "character": {
            "name": character_name or "Cinematic Protagonist",
            "traits": character_traits or "Consistent hero styling",
            "visual_traits": character_traits or "Consistent hero styling"
        },
        "background_music": theme["music"],
        "estimated_duration_sec": total_duration,
        "scene_count": len(scenes),
        "scenes": scenes,
        "screenplay": full_screenplay,
        "srt_subtitles": srt_content,
        "voiceover_full": " ".join(s["voiceover"] for s in scenes)
    }

def generate_video_script(topic: str, style: str = "cinematic", target_platform: str = "youtube_shorts") -> Dict[str, Any]:
    """
    Standard script generation backward compatibility for existing tests.
    """
    clean_topic = topic.strip() or "The Future of AI Video Generation"
    style_key = style.lower() if style.lower() in THEME_DATABASE else "cinematic"
    theme = THEME_DATABASE[style_key]

    is_short = target_platform.lower() in ["youtube_shorts", "tiktok", "instagram_reels", "9:16"]
    scene_count = 3 if is_short else 5

    hook_text = f"Discover {clean_topic}. " + theme["hook_templates"][0]

    if is_short:
        scenes = [
            {
                "scene": 1,
                "title": "The High-Impact Hook",
                "duration_sec": 3,
                "visual_prompt": f"Fast dynamic camera zoom on {clean_topic}, {theme['visual_style']}, high energy motion",
                "camera_motion": "Rapid Zoom-In with subtle motion blur",
                "voiceover": hook_text,
                "subtitles": f"Wait! Here is the truth about {clean_topic}."
            },
            {
                "scene": 2,
                "title": "The Core Revelation",
                "duration_sec": 6,
                "visual_prompt": f"Cinematic parallax panning shot showcasing {clean_topic} in action, {theme['visual_style']}, intricate detail",
                "camera_motion": "Smooth Right-to-Left Pan, 45 degree angle",
                "voiceover": f"When you combine open-source video models with creative vision, the impossible becomes effortless. {clean_topic} gives you full creative freedom without limits.",
                "subtitles": "Unleash infinite creative power with zero limits."
            },
            {
                "scene": 3,
                "title": "Call To Action",
                "duration_sec": 4,
                "visual_prompt": f"Dramatic wide angle beauty shot, glowing VICKY AI logo transition, {theme['visual_style']}",
                "camera_motion": "Slow Pull-Back to Wide Shot",
                "voiceover": "Create anything. Generate everything. Try VICKY AI today and start creating for free.",
                "subtitles": "Create Anything. Generate Everything with VICKY AI."
            }
        ]
    else:
        scenes = [
            {
                "scene": 1,
                "title": "Introduction & Hook",
                "duration_sec": 5,
                "visual_prompt": f"Dramatic cinematic opening establishing shot of {clean_topic}, {theme['visual_style']}, 8k",
                "camera_motion": "Slow Push-In towards horizon",
                "voiceover": hook_text,
                "subtitles": f"Welcome to the new era of {clean_topic}."
            },
            {
                "scene": 2,
                "title": "The Paradigm Shift",
                "duration_sec": 8,
                "visual_prompt": f"Detailed macro lens focus pulling across intricate elements of {clean_topic}, {theme['visual_style']}",
                "camera_motion": "Orbiting Camera Sweep around centerpiece",
                "voiceover": f"Historically, high-end video production required massive budgets and compute farms. Today, open-source AI models like Wan 2.1 and Stable Video Diffusion place Hollywood-grade studio tools in everyone's hands.",
                "subtitles": "Hollywood-grade video production is now decentralized."
            },
            {
                "scene": 3,
                "title": "Deep Dive & Mechanism",
                "duration_sec": 10,
                "visual_prompt": f"Exploded view dynamic flow visualization illustrating {clean_topic}, {theme['visual_style']}",
                "camera_motion": "Smooth Crane Downward Tracking",
                "voiceover": "By understanding spatial and temporal latents, generative AI maps prompt semantics directly into fluid, high-frame-rate motion. Every frame is synthesized with photorealistic coherence.",
                "subtitles": "Temporal latents generate fluid, lifelike motion."
            },
            {
                "scene": 4,
                "title": "Real-World Impact",
                "duration_sec": 8,
                "visual_prompt": f"Montage of creative professionals using AI studio tools, glowing screens, {theme['visual_style']}",
                "camera_motion": "Lateral Tracking Shot Left to Right",
                "voiceover": "From filmmakers and storytellers to digital marketers and educators, creators worldwide are building entire universes with just a few lines of text.",
                "subtitles": "Empowering millions of creators across the globe."
            },
            {
                "scene": 5,
                "title": "Call To Action & Outro",
                "duration_sec": 5,
                "visual_prompt": f"Vibrant crescendo burst into the VICKY AI emblem, golden rays, {theme['visual_style']}",
                "camera_motion": "Elevating Jib Shot into sunrise",
                "voiceover": "The only limit is your imagination. Visit VICKY AI, generate your first AI video, and build your masterpiece today.",
                "subtitles": "Start your journey today at VICKY AI."
            }
        ]

    total_duration = sum(s["duration_sec"] for s in scenes)
    clean_slug = re.sub(r'[^a-zA-Z0-9]+', '-', clean_topic.lower()).strip('-')

    return {
        "title": f"{clean_topic.title()} - AI Video Masterpiece",
        "slug": clean_slug,
        "style": style_key,
        "platform": target_platform,
        "estimated_duration_sec": total_duration,
        "background_music_suggestion": theme["music"],
        "scenes": scenes,
        "full_voiceover_script": " ".join(s["voiceover"] for s in scenes),
        "seo_keywords": [
            f"{clean_topic} AI video",
            "Vicky AI video generator",
            "text to video AI",
            "open source AI video",
            "free AI video generator"
        ]
    }
