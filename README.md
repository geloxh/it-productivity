### IT PRODUCTIVITY SOFTWARE
Personal Project to build a progressive, maintainable, scalable web and app IT productivity tool.


## TECH-STACK
- *MongoDB*
- *ExpressJS*
- *React*
- *Vite*
- *Plain CSS*
- *NodeJS*

## Project Structure
- **client/**: React.js Frontend application.
- **server/**: Node.js/Express.js Backend API.

### PROJECT FEATURES
- **User Authentication** : Register, Login, Logout
- **Company Asset Management** : Add, Remove, Update, and View IT devices such as servers, networks, storage, and applications.
- **Alerts and Notifications** : Receive alerts and notifications for IT resource issues.
- **Dashboards and Reports** : View dashboards and reports for IT resource performance and usage.

- **Ticket system**

- **Project management**

- **Task management**

- **Knowledge Base**

- **Session management**

- **Audit logging** 

### UPCOMING FEATURES
- **Request for Payment Form** : Automated fill up form for payment request.

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
