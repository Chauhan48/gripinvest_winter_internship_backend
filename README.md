# Node.js Express Backend

A **Backend server** built with **Node.js + Express + MySQL**, designed to handle APIs and database operations.  

The backend provides:
- **API endpoints for application features**
- **MySQL database integration**
- **Dockerized setup for easy deployment**

---

## Features
- Built with **Express.js**
- Database powered by **MySQL**
- Environment variables managed through `.env`
- **Docker support** for containerized builds

---

## Prerequisites
- [Node.js](https://nodejs.org/) >= 16
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/)
- [Docker](https://www.docker.com/)

---

## Installation

1. **Clone the repository**
    ```sh
    git clone <your-repo-url>
    cd <your-project-folder>

2. **Install dependencies**
    ```sh
    npm install

3. **Create .env file**  
Refer to `.env.sample` and add your environment variables:


4. **Run locally**
    ```sh
    npm start


---

## Running with Docker

1. **Build docker image**
    ```sh
    npm run docker:build

2. **Run docker container**
    ```sh
    npm run docker:run
*This will start the backend inside a Docker container and connect to the configured MySQL database.*
