# Use Node Alpine for building the frontend
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies 
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend application source
COPY . .

# Build the frontend for production (if applicable)
RUN npm run build

# Optionally serve the built app using a lightweight server (e.g., serve)
# You can install it globally and then use it:
RUN npm install -g serve

# Expose the port your app runs on
EXPOSE 3000

# Start the frontend using the build output
CMD ["serve", "-s", "dist"]
