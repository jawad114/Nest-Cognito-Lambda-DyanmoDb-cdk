# Use the Node.js 18 base image
FROM node:18

# Set the working directory in the container
# WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application source code
COPY . .

# Build the application
RUN npm run build

# Specify the command to run the Lambda handler
CMD ["node", "dist/src/lambda.js"]
