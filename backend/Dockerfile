FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS prod
WORKDIR /app
ENV NODE_ENV production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/scripts ./dist/scripts

# Create health check script
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'curl -f http://localhost:${PORT:-5000}/health || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh

EXPOSE 5000

# Start the application
CMD ["npm", "start"]
