# API Documentation

The Estate Management System provides a RESTful API for managing estates, properties, and security access.

## Base URL
Default: `http://localhost:3000/`

## Swagger Documentation
Interactive API documentation is available at:
`http://localhost:3000/api` (assuming the Swagger module is enabled in `main.ts`)

## Core Features

### 1. Authentication
- **Flow**: POST credentials to `/auth/login` to receive a JWT.
- **Header**: Use `Authorization: Bearer <token>` for protected routes.

### 2. Estates & Properties
- Manage estate details and property listings.
- Assign tenants to properties.

### 3. Gate Pass System
The gate pass system allows residents to pre-authorize visitors.
- **Generate Token**: residents can generate a specific gate pass code for their visitors.
- **Verification**: Security personnel at the gate can verify this token using its unique ID or scan.
- **Expiration**: Tokens automatically expire based on the set `expiresAt` field.

## Common Status Codes

| Code | Description |
| :--- | :--- |
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation Error) |
| 401 | Unauthorized |
| 403 | Forbidden (Insufficient Permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |
