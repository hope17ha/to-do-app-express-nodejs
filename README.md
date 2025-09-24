
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

```
.
├── app.js                  # Main application file
├── middleware
│   └── isAuth.js           # Authentication middleware
│   └── getCurrentUser.js   # Middleware to attach current user to requests
├── utils
│   ├── tasks.js            # Task-related functions (get/save tasks, etc.)
│   └── users.js            # User-related functions
├── data
│   └── tasks.json          # JSON file storing users' tasks
├── public
│   └── style.css           # CSS styles
├── views
│   ├── index.hbs           # Main tasks view
│   └── layout
│       └── main.hbs        # Main layout template
└── README.md               # Project documentation
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

