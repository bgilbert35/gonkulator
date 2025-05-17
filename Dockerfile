# Multi-stage build for optimized production image

# Stage 1: Build the React frontend
FROM node:18-alpine as client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build the Node.js backend
FROM node:18-alpine as server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./

# Stage 3: Production image
FROM node:18-alpine
WORKDIR /app

# Copy built client files
COPY --from=client-builder /app/client/build /app/client/build

# Copy server files and install production dependencies
COPY --from=server-builder /app/server /app/server
WORKDIR /app/server
RUN npm ci --only=production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
