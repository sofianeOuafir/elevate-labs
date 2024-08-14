# Use the official Node.js image
FROM node:14

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Sequelize CLI globally
RUN npm install -g sequelize-cli

# Copy the rest of the application code
COPY . .

# Copy the entrypoint script
COPY entrypoint.sh /usr/src/app/entrypoint.sh

# Ensure the entrypoint script is executable
RUN chmod +x /usr/src/app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 3000

# Use the entrypoint script
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

# Run the application
# Set the default command, which can be overridden by --build-arg CMD="..."
CMD ["sh", "-c", "${CMD:-npm run start}"]
