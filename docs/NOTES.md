### PROJECT : IT PRODUCTIVITY SOFTWARE
Personal Project to build a progressive, maintainable, scalable web and app IT productivity tool that monitor and manage IT resources.
## TECHNOLOGIES
- Frontend : React.js
- Backend : Node.js, Express.js
- Database : MongoDB
- Authentication : JWT
- Deployment : ?

## PROJECT FEATURES
- ***User Process***
- **User Authentication** : Register, Login, Logout
- **Devices Management** : Add, Remove, Update, and View IT assets (Desktop, Laptop, AIO & Peripherals)
- **Alerts and Notifications** : Receive alerts and notifications for IT resource issues.
- **Dashboards and Reports** : View dashboards and reports for IT resource performance and usage.
- **Activity Log** : View process/activity log
- **Employee Management** : Add, Remove, Update, and View employee information.
- **Ticket Management**: Add, Remove, Update, and View tickets.
- **Knowledge Base** : Add, Remove, Update, and View knowledge base entries.
- **Project Management** : Add, Remove, Update, and View projects.
- **Tasks Management** : Add, Remove, Update, and View tasks.
- **View Sessions** (Display devies where users singin & out in the system)
- **View Users of the system**


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


### Assets
user (string, current user/assignee name)

systemInfo (string, OS/specs summary)

deviceYearModel (number/string)

formerUser (string)

contractStatus (enum)

dateAcquired (Date, replaces/supplements purchaseDate)

equipmentStatus (enum, more specific than status)

notes (string)

company (string)

brand → already manufacturer, just rename display
