FROM node:20-bullseye-slim

# Set working directory
WORKDIR /usr/src/app


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
