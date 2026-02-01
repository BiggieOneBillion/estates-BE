# Setup & Installation Guide

This guide describes how to set up and run the Estate Management System locally.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)
- npm or yarn

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd estate-management
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env.development` file in the root directory and populate it with the following:
    ```env
    # Database
    MONGODB_URI=mongodb://localhost:27017/estate_db

    # Authentication
    JWT_SECRET=your_jwt_secret_here
    JWT_EXPIRES_IN=24h

    # Cloudinary (Optional - for file uploads)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Email (Optional)
    MAIL_HOST=smtp.example.com
    MAIL_USER=your_email
    MAIL_PASS=your_password
    ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```
