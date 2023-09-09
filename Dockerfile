# Use the Node.js LTS image as  base
FROM node:lts

# Copy app source
COPY . /src

# Set working directory to /src
WORKDIR /src

# Install app dependencies
RUN npm install

# Expose port to outside 
EXPOSE 3000

# Start command as per the package.json file
CMD ["npm", "start"]