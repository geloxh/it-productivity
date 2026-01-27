### IT PRODUCTIVITY SOFTWARE
Personal Project to build a progressive, maintainable, scalable web and app IT productivity tool.

## Project Structure
- **client/**: React.js Frontend application.
- **server/**: Node.js/Express.js Backend API.

### Installation

1. **Backend Setup**
   ```bash
   cd server
   npm install
   npm run dev
   ```

## Usage Commands
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs server
docker-compose logs client

# Rebuild specific service
docker-compose build server
