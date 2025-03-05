FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Navigate to frontend, copy files, install dependencies, and run dev
COPY ./frontend/ ./frontend
RUN cd ./frontend && npm install --legacy-peer-deps
CMD ["sh", "-c", "cd ./frontend && npm run dev"]

# Expose port for frontend development server (default Vite port)
EXPOSE 3000
