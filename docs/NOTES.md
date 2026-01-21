### PROJECT : IT PRODUCTIVITY SOFTWARE
Personal Project to build a progressive, maintainable, scalable web and app IT productivity tool that monitor and manage IT resources.
## TECHNOLOGIES
- Frontend : React.js
- Backend : Node.js, Express.js
- Database : MongoDB
- Authentication : JWT
- Deployment : ?

## PROJECT FEATURES
- User Authentication : Register, Login, Logout
- Devices Management : Add, Remove, Update, and View IT devices such as servers, networks, storage, and applications.
- Alerts and Notifications : Receive alerts and notifications for IT resource issues.
- Dashboards and Reports : View dashboards and reports for IT resource performance and usage.
- Employee Management : Add, Remove, Update, and View employee information.

## FUTURE ENHANCEMENTS
- Resource Monitoring : Monitor IT resources such as servers, networks, storage, and applications.
- Resource Management : Manage IT resources such as servers, networks, storage, and applications.
- Alerts and Notifications : Receive alerts and notifications for IT resource issues.
- Dashboards and Reports : View dashboards and reports for IT resource performance and usage.



## Monorepo Structure
project/
├── client/             # React Frontend (Vite)
├── server/             # Node/Express Backend
│   ├── config/         # Database & App Config
│   ├── controllers/    # Route Logic
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Routes
│   ├── middleware/     # Auth & Error Handling
│   ├── .env            # Environment Variables
│   └── server.js       # Entry Point
├── docs/               # Documentation
└── README.md           # Main Project Info File
