# VICKY AI - Unified Production Dockerfile
# Combines Node.js Frontend Gateway with Python AI Video Engine & FFmpeg

FROM python:3.11-slim

# Install system dependencies: FFmpeg, Node.js, git
RUN apt-get update && apt-get install -y \
    curl \
    git \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy package.json & install node dependencies
COPY package.json ./
RUN npm install --production

# Copy application files
COPY . .

# Ensure storage directories exist with write permissions
RUN mkdir -p /app/data/outputs /app/public/samples && chmod -R 777 /app/data

# Environment configuration
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV USE_GPU=false

EXPOSE 3000 8000

# Start script: launches server.js
CMD ["node", "server.js"]
