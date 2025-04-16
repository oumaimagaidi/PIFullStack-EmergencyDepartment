# Use the official Node.js image (Alpine for a small footprint)
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files separately to benefit from caching
COPY package*.json ./

# Install dependencies (use legacy-peer-deps if necessary)
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# (Optional) Build the backend if you use a build step
# RUN npm run build

# Expose the port your backend uses (adjust if necessary)
EXPOSE 8089

# Start the backend (adjust the startup script or command to your needs)
CMD ["npm", "run", "dev"]
