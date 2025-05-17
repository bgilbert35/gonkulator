# LaaS Cost Calculator

A reactive web application for creating, saving, and sharing Lab as a Service (LaaS) cost calculations. This application allows users to configure resources, calculate costs, and compare with cloud providers like Azure and AWS.

## Features

- **Resource Configuration**: Configure LaaS resources including Sandbox, Developer Machines, Pipeline Combined, and Custom Systems
- **Cost Calculation**: Calculate monthly and annual costs for different configurations
- **Cloud Comparison**: Compare costs with Azure and AWS to see potential savings
- **User Authentication**: Register and login to save your configurations
- **Role-Based Access**: Admin users can see and modify pricing settings
- **Configuration History**: Track changes between versions and roll back when needed
- **Shareable Links**: Share configurations with others via unique links
- **Responsive Design**: Works on desktop and mobile devices
- **Containerized**: Runs in Docker containers for easy deployment

## Technology Stack

- **Frontend**: React.js, Material-UI, Recharts
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker, Docker Compose

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (v8 or higher)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for containerized deployment)
- [MongoDB](https://www.mongodb.com/) (if running locally without Docker)

## Installation and Setup

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd laas-calculator
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `server` directory based on the `.env.example` file
   - Configure MongoDB connection string and JWT secret

4. Run the application in development mode:
   ```bash
   # Start the backend server (from the server directory)
   npm run server

   # In a separate terminal, start the frontend (from the client directory)
   npm start
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Docker Deployment

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd laas-calculator
   ```

2. Build and run the containers:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Web Application: http://localhost:5000
   - MongoDB Express (database admin): http://localhost:8081

## Usage

1. **Public Access**:
   - Anyone can access the cost calculator without logging in
   - Create configurations and see DLA costs
   - Compare with cloud providers

2. **Registered Users**:
   - Save configurations for future reference
   - Track changes between versions
   - Share configurations via unique links

3. **Admin Users**:
   - Access all user configurations
   - View WWT costs (hidden from regular users)
   - Modify pricing settings

## Initial Admin Setup

To create the first admin user:

1. Register a new user through the application
2. Connect to the MongoDB database
3. Update the user's role to 'admin':
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## License

[MIT](LICENSE)
