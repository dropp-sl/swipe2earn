# Use a base Node.js image
FROM node:21-alpine3.18 AS builder

# Set the working directory
WORKDIR /usr/app

# Copy package.json and yarn.lock before running yarn install
COPY package.json yarn.lock ./

# Install dependencies, making sure bcrypt is built inside Docker
RUN yarn install --frozen-lockfile --production

# Copy the rest of the application files
COPY . .

# Build the project
RUN yarn build

# Use a separate image for production (smaller size)
FROM node:21-alpine3.18 AS production

WORKDIR /usr/app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/node_modules ./node_modules
COPY --from=builder /usr/app/package.json ./package.json

# Set environment variables
ENV NODE_ENV=production

# Expose the necessary port
EXPOSE 4801

# Run the application
CMD ["node", "dist/main"]
