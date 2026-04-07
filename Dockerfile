FROM node:18

WORKDIR /app

# Copy only package.json first to leverage Docker cache
COPY package.json ./

# Use verbose logging to see the actual error if it fails
RUN npm install --verbose

# Copy the rest of the application
COPY . .

# Start the bot
CMD ["node", "index.js"]
