-- ==========================================================================
-- VICKY AI VIDEO STUDIO - Supabase Database Schema Migration
-- Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
-- Migration: 20261121000000_vicky_studio_init.sql
-- ==========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    plan TEXT NOT NULL DEFAULT 'Pro Studio Creator',
    credits_total INTEGER NOT NULL DEFAULT 500,
    credits_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url, plan, credits_total, credits_used)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        'Pro Studio Creator',
        500,
        0
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Projects & Video History Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text-to-video',
    model TEXT NOT NULL DEFAULT 'ffmpeg-procedural',
    aspect_ratio TEXT NOT NULL DEFAULT '16:9',
    duration NUMERIC NOT NULL DEFAULT 3.0,
    fps INTEGER NOT NULL DEFAULT 24,
    resolution TEXT NOT NULL DEFAULT '854x480',
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    format TEXT NOT NULL DEFAULT 'video/mp4',
    codec TEXT NOT NULL DEFAULT 'H.264 / AAC',
    is_private BOOLEAN NOT NULL DEFAULT TRUE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT[] DEFAULT ARRAY['AI Video'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Consistent Characters Table (Character Memory - Part 5B)
CREATE TABLE IF NOT EXISTS public.characters (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    archetype TEXT NOT NULL DEFAULT 'Protagonist',
    avatar_url TEXT,
    visual_traits TEXT NOT NULL,
    conditioning_tokens TEXT NOT NULL,
    voice_profile TEXT NOT NULL DEFAULT 'en-US-GuyNeural',
    seed BIGINT NOT NULL DEFAULT 42,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Multi-Scene Movies Table (One-Prompt Movie Maker - Part 5A)
CREATE TABLE IF NOT EXISTS public.movies (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL DEFAULT 'ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE.',
    logline TEXT,
    prompt TEXT NOT NULL,
    genre TEXT NOT NULL DEFAULT 'cinematic',
    language TEXT NOT NULL DEFAULT 'english',
    is_teluglish BOOLEAN NOT NULL DEFAULT FALSE,
    scenes JSONB NOT NULL DEFAULT '[]'::JSONB,
    screenplay TEXT,
    srt_subtitles TEXT,
    character_name TEXT,
    character_id TEXT REFERENCES public.characters(id) ON DELETE SET NULL,
    video_url TEXT,
    thumbnail_url TEXT,
    duration_sec NUMERIC DEFAULT 0,
    aspect_ratio TEXT NOT NULL DEFAULT '16:9',
    transition TEXT NOT NULL DEFAULT 'crossfade',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Thumbnails Table (AI Thumbnail Studio - Part 5G)
CREATE TABLE IF NOT EXISTS public.thumbnails (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    headline TEXT NOT NULL,
    subtext TEXT,
    style_preset TEXT NOT NULL DEFAULT 'youtube_yellow',
    badge TEXT DEFAULT 'none',
    aspect_ratio TEXT NOT NULL DEFAULT '16:9',
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_movies_user_id ON public.movies(user_id);
CREATE INDEX IF NOT EXISTS idx_thumbnails_user_id ON public.thumbnails(user_id);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thumbnails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own or public projects" ON public.projects FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own characters" ON public.characters FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own characters" ON public.characters FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
CREATE POLICY "Users can update own characters" ON public.characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own characters" ON public.characters FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own movies" ON public.movies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own movies" ON public.movies FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
CREATE POLICY "Users can delete own movies" ON public.movies FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own thumbnails" ON public.thumbnails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own thumbnails" ON public.thumbnails FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
CREATE POLICY "Users can delete own thumbnails" ON public.thumbnails FOR DELETE USING (auth.uid() = user_id);
