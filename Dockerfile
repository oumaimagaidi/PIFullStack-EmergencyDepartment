FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install build dependencies for native modules like canvas and sharp
# <<< REQUIRED: add Python, make, g++, and pixman/cairo deps for canvas
RUN apk update && \
    apk add --no-cache \
      python3 \
      build-base \                # includes gcc, g++, make :contentReference[oaicite:5]{index=5}
      pixman-dev \                # low-level pixel library :contentReference[oaicite:6]{index=6}
      cairo-dev \                 # 2D graphics library dev files :contentReference[oaicite:7]{index=7}
      pango-dev \                 # text layout engine dev files :contentReference[oaicite:8]{index=8}
      jpeg-dev \                  # JPEG image manipulation lib dev :contentReference[oaicite:9]{index=9}
      giflib-dev                  # GIF library dev files :contentReference[oaicite:10]{index=10}

# Copy only package.json files first (to leverage Docker cache for faster builds)
COPY ./frontend/package*.json ./frontend/
COPY ./backend/package*.json ./backend/

# Install dependencies inside container
RUN cd frontend && npm install --legacy-peer-deps
RUN cd backend && npm install --legacy-peer-deps

# Now copy full source code
COPY ./frontend ./frontend
COPY ./backend ./backend

# Fix nodemon permissions (in case used via scripts)
RUN chmod +x backend/node_modules/.bin/nodemon || true

# Create a script to start both frontend and backend
RUN echo '#!/bin/sh' > start.sh \
  && echo '(cd frontend && npm run dev) &' >> start.sh \
  && echo '(cd backend && npm run dev) &' >> start.sh \
  && echo 'wait' >> start.sh \
  && chmod +x start.sh

# Expose both frontend and backend ports
EXPOSE 3000
EXPOSE 8089

# Run the app
CMD ["./start.sh"]
