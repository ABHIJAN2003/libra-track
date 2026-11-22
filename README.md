# LibraTrack - Library Book Issue Management System

## Purpose
Let the library desk record, track, and search books issued to members, and mark them as returned.

## Users
- **Admin (Librarian):** can add, edit, mark returned / re-issue, and delete records
- **Viewer:** read-only (list, search, filter, view details)

## Features
1. Login with username and password (roles: admin, viewer)
2. Add a new issue record (admin only)
3. View the list of all records
4. View one record's details
5. Edit a record (admin only)
6. Delete a record (admin only)
7. Search records by borrower name or mobile number
8. Mark a book as Returned or Issued again (admin only)
9. Filter by status and see summary counts (all, out on loan, returned)
10. Overdue books are marked with a red stamp and the number of days late

## Record Data Fields

| Field | Required | Notes |
|---|---|---|
| borrowerName | Yes | Text |
| mobile | Yes | Exactly 10 digits |
| email | No | Must be a valid email |
| department | No | Department / class / organization |
| bookTitle | Yes | Book being borrowed |
| dueDate | Yes | Date by which the book must be returned |
| issueDateTime | Auto | Defaults to current time |
| status | Auto | "Issued" or "Returned" |

## Validation Rules
- Borrower name, mobile, book title, and due date cannot be empty
- Mobile must be 10 digits
- Email, if given, must be a valid format (checked in the form and on the server)
- Status can only be "Issued" or "Returned"
- Only logged-in users can read data; only admins can change it

## Tech Stack
React (Vite), Bootstrap, Axios, React Router, Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs

## How Login and Roles Work
- Passwords are stored hashed (bcryptjs), never as plain text
- Logging in returns a JWT token that lasts 8 hours and holds the role
- The frontend sends the token with every request
- The server checks the token (`protect`) and the role (`adminOnly`)
- Accounts are created with `node seedUser.js <username> <password> <admin|viewer>`
- After changing a role, sign out and sign back in (the role lives inside the token)

## Project Structure
```
Libra-track
├── client            React app (Vite)
│   └── src
│       ├── api       API calls (recordAPI.js)
│       ├── components
│       ├── pages     Login, RecordList, RecordDetails, RecordForm
│       ├── App.jsx   Routes
│       └── auth.js   Token and role helpers
└── server            Express API
    ├── models        User.js, Record.js
    ├── routes        authRoutes.js, recordRoutes.js
    ├── middleware    authMiddleware.js
    ├── seedUser.js   Creates login accounts
    └── server.js
```

## Project Status

### Done
- [x] Express server and MongoDB Atlas connection
- [x] User and Record models with validation
- [x] bcryptjs password hashing and `seedUser.js`
- [x] Login route with JWT
- [x] `protect` and `adminOnly` middleware
- [x] CRUD routes for records, search, status filter, stats
- [x] React login page and protected routes
- [x] List page with search, status filter, summary counts
- [x] Add / Edit form with validation
- [x] Details page
- [x] Admin buttons hidden for viewers (and enforced on the server)
- [x] Redesigned frontend

### To Do
- [ ] Deploy backend (Render or Railway) and frontend (Vercel)
- [ ] Move the API base URL to an environment variable in production

### Ideas for Later
- Return date, success messages, CSV export, "issued by" field

## Out of Scope
- Redux, microservices
- Fines and payments, email/SMS notifications, barcode scanning

## Testing Checklist
- [x] Admin login works
- [x] Viewer login works
- [x] Viewer sees no Add / Return / Edit / Delete buttons
- [x] No token gives 401
- [x] Viewer trying to add a record gives 403
- [x] Email rules: `abc` blocked, `abc@gmail.com` saves, empty email saves
- [x] Mobile with fewer or more than 10 digits is rejected

## How to Run Locally

### 1. Install
Open two terminals, one in `server` and one in `client`, and run in each:
```
npm install
```

### 2. Create `server/.env`
```
PORT=5000
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=a-long-random-string
```
Never upload this file or share its values.

### 3. Create `client/.env`
```
VITE_API_URL=http://localhost:5000/api
```

### 4. Create the login accounts
In the `server` folder run:
```
node seedUser.js admin admin123 admin
node seedUser.js viewer viewer123 viewer
```
Use your own passwords.

### 5. Start both apps
- In `server`: `npm run dev` (runs on http://localhost:5000)
- In `client`: `npm run dev` (runs on http://localhost:5173)

Open the address the client prints and sign in.

## Tips
- Use 3 terminals: server, client, and a free one for installs, seeding, and git
- Check the terminal prompt path before using `cd`
- Nodemon does not watch `.env`: restart the server after editing it
- Hiding buttons is not security: the server checks the role on every change
- If a secret is ever shown or uploaded by mistake, replace it straight away
