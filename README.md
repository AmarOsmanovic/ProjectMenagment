# Project Management Web App

## Overview

This is a web application built using Node.js and Express for project management. It allows users to efficiently manage and track their projects, tasks, and team members.

## Features

- **User Authentication:** Secure user authentication system to manage user accounts.
- **Project Creation:** Easily create and manage projects with customizable details.
- **Task Tracking:** Keep track of tasks associated with each project.
- **Team Collaboration:** Collaborate with team members by assigning tasks and roles.
- **User-friendly Interface:** Intuitive and responsive web interface for a seamless user experience.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed
- npm (Node Package Manager) installed
- MongoDB database set up

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/project-management-web-app.git
    ```

2. Navigate to the project directory:

    ```bash
    cd project-management-web-app
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Set up environment variables:

    Create a `.env` file in the root directory and configure the following variables:

    ```env
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/project_management_db
    SECRET_KEY=your_secret_key
    ```

5. Start the application:

    ```bash
    npm start
    ```

6. Open your browser and visit `http://localhost:3000` to access the application.

## Usage

1. **Register/Login:**
   - Visit the application in your browser.
   - Sign up for a new account or log in if you already have an account.

2. **Create a Project:**
   - Once logged in, navigate to the dashboard.
   - Click on the "Create Project" button.
   - Fill in the project details and click "Create."

3. **Manage Tasks:**
   - Within each project, you can manage tasks associated with it.
   - Add, edit, or delete tasks as needed.

4. **Collaborate with Team:**
   - Assign tasks to team members and set roles.
   - Foster collaboration within your team.

## Contributing

If you would like to contribute to the project, please follow the steps below:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and submit a pull request.

## Contact

For any questions or inquiries, please contact amar.osmanovic07@gmail.com.

