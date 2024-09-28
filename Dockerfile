# Use Node.js 22.7 as the base image
FROM node:22.7-bullseye

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./
COPY pnpm-lock*.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies using pnpm
RUN pnpm install

# Files to run the project as configuration (should change later)
COPY firebase-config.json ./
COPY .swcrc ./
COPY tsconfig.json ./

# Files to run the project in dev mode (should change later)
COPY src ./src

# Expose the port the app runs on
EXPOSE 8900

# Command to run the server
CMD ["npm", "start"]