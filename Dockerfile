# Use Node 18 with Alpine Linux (small & fast)
FROM node:18-alpine

# Install system dependencies
RUN apk update && apk add --no-cache git

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install && npm cache clean --force

# Copy the rest of the project files
COPY . .

# Build TypeScript into dist/
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Expose the app port
EXPOSE 80

# Start the app
CMD ["npm", "start"]
