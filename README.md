# Estate Management System

A modern, scalable Estate Management System built with **NestJS** and **MongoDB**. This project provides a comprehensive solution for managing estates, properties, and community access.

---

## 🚀 Key Features

- **Multi-Role User Management**: Support for Super Admins, Site Admins, Landlords, Tenants, and Security.
- **Estate & Property Organization**: Manage units, assignments, and supporting documents.
- **Gate Pass System**: Pre-authorize visitors with secure, temporary tokens.
- **Real-time Notifications**: Instant alerts for important estate activities.
- **Media Support**: Integrated Cloudinary support for document and image storage.

---

## 📂 Documentation

We've broken down our documentation into specialized sections for better readability:

- 🏗️ **[Architecture](docs/architecture.md)**: Tech stack and system overview.
- ⚙️ **[Setup & Installation](docs/setup.md)**: How to get the project running.
- 🔌 **[API Overview](docs/api.md)**: Core features and endpoint logic.
- 🗄️ **[Database Schema](docs/database.md)**: Data structures and relationships.

---

## ⚡ Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env.development` file based on the requirements in **[Setup Guide](docs/setup.md)**.

### 3. Run the App
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 4. Testing
```bash
npm run test
```

---

## 🛠️ Built With

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Validation**: Joi / Class-validator
- **Security**: Passport + JWT
- **Communication**: Socket.io

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
