FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy both frontend and backend code
COPY ./frontend/ ./frontend
COPY ./backend/  ./backend

# Install dependencies in each directory
RUN cd ./frontend && npm install --legacy-peer-deps
RUN cd ./backend && npm install --legacy-peer-deps

# Create a start script that launches both dev servers concurrently
RUN echo '#!/bin/sh' > start.sh \
    && echo '(cd frontend && npm run dev) &' >> start.sh \
    && echo '(cd backend && npm run dev) &' >> start.sh \
    && echo 'wait' >> start.sh \
    && chmod +x start.sh

# Expose ports for both the frontend and backend
EXPOSE 3000
EXPOSE 8089

# Start both servers when the container runs
CMD ["./start.sh"]
