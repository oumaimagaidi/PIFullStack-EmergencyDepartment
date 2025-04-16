FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies (make sure nodemon is included)
RUN npm install --legacy-peer-deps

# Optional: Install nodemon globally if it's not in your package.json
# RUN npm install -g nodemon

COPY . .

# Fix nodemon permission if needed
RUN chmod +x ./node_modules/.bin/nodemon || true

EXPOSE 8089

CMD ["npm", "run", "dev"]
