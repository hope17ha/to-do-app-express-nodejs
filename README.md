
# To-Do List App

A simple To-Do List web application built with **Node.js**, **Express**, and **Handlebars (hbs)**.

## Features

* User authentication and session management
* Add tasks specific to each user
* Mark tasks as completed/uncompleted
* Delete tasks
* Tasks are stored in a JSON file (`tasks.json`) organized by user
* Middleware for authentication and current user retrieval
* Clean and responsive UI with improved CSS styling

## Requirements

* Node.js (v14 or higher recommended)
* npm

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/todo-list-app.git
   cd todo-list-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the app:

   ```bash
   node app.js
   ```

4. Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

## Project Structure

```plaintext
to-do-app-express-nodejs/
├── app.js                # Main entry point of the application
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Dependency lock file
├── README.md             # Project documentation
├── style.css             # Global stylesheet
├── taaaasks.json         # Example/extra tasks file (typo test file?)
│
├── data/                 # JSON data storage (mock database)
│   ├── tasks.json        # Stores tasks data
│   └── users.json        # Stores users data
│
├── middlewares/          # Express middlewares
│   ├── getUser.js        # Middleware to get current user
│   └── isAuth.js         # Middleware to check authentication
│
├── utils/                # Utility/helper functions
│   ├── password.js       # Password hashing and verification
│   ├── tasks.js          # Task-related helper functions
│   └── users.js          # User-related helper functions
│
├── views/                # Handlebars (HBS) templates
│   ├── index.hbs         # Home page
│   ├── login.hbs         # Login form
│   ├── register.hbs      # Registration form
│   └── layout/           # Layout templates
│
├── public/               # Static files (CSS, images, client-side JS)
│
└── node_modules/         # Installed dependencies (auto-generated) 
```


## Usage

* Register or log in to access your personal task list
* Add new tasks via the form
* Mark tasks as completed or uncompleted using checkboxes
* Delete tasks with the delete button
* Tasks are saved per user and persist across sessions

## Notes

* Passwords are hashed using bcrypt for security
* Sessions managed via cookies
* JSON files are used as a simple data store (consider switching to a database for production)

