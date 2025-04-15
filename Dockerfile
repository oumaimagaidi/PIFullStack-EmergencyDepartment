FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy frontend and backend separately
COPY ./frontend ./frontend
COPY ./backend ./backend

# Install dependencies
RUN cd frontend && npm install --legacy-peer-deps
RUN cd backend && npm install --legacy-peer-deps

# Fix nodemon permissions
RUN chmod +x backend/node_modules/.bin/nodemon || true

# Start both apps concurrently
RUN echo '#!/bin/sh' > start.sh \
  && echo '(cd frontend && npm run dev) &' >> start.sh \
  && echo '(cd backend && npm run dev) &' >> start.sh \
  && echo 'wait' >> start.sh \
  && chmod +x start.sh

# Expose frontend and backend ports
EXPOSE 3000
EXPOSE 8089

CMD ["./start.sh"]
