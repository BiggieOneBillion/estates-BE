# Estate Management System

A enterprise-grade, scalable Estate Management System built with **NestJS** and **MongoDB**. Designed for robustness, high availability, and secure community management.

---

## 🚀 Key Features

- **Advanced Role-Based Access Control (RBAC)**: Fine-grained permissions for Super Admins, Site Admins, Landlords, Tenants, and Security.
- **Visitor Management (Gate Pass)**: Secure, temporary tokens for community access with mandatory security verification and ID documentation.
- **Automated Compliance Enforcement**: Real-time restriction of estate privileges (like gate pass generation) based on levy payment status.
- **Financial Orchestration**: Support for both manual and online (Paystack) payments with automated reconciliation.
- **Distributed Auditing**: Comprehensive audit trail for every critical action, ensuring accountability across the system.
- **Real-time Engine**: WebSocket-based notifications for tenant alerts and security updates.
- **Media Engine**: Cloud-native image and document management via Cloudinary.

---

## 🏛️ Design Principles

The system is built on modern distributed systems patterns:

- **CQRS (Command Query Responsibility Segregation)**: Explicit separation of "Write" operations (Commands) and "Read" operations (Queries) to allow independent optimization.
- **Transactional Outbox Pattern**: Ensures reliable consistency between the primary database and asynchronous events (Email, Notifs) even during system failures.
- **Event-Driven Architecture**: Decoupled services communicating via high-performance BullMQ queues.
- **Idempotency by Design**: Event handlers (like Audit Logging) are resilient to retries, preventing duplicate processing.
- **Observability**: Distributed tracing integrated with OpenTelemetry and Jaeger for deep system visibility.

---

## �️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Core Framework** | [NestJS](https://nestjs.com/) (Node.js) |
| **Primary Database** | [MongoDB](https://www.mongodb.com/) (Mongoose ODM) |
| **Cache & Queues** | [Redis](https://redis.io/) (BullMQ) |
| **Real-time** | [Socket.io](https://socket.io/) (Redis Adapter for scaling) |
| **Observability** | OpenTelemetry / Jaeger / BullBoard |
| **Communication** | Nodemailer (Ethereal/SMTP) / Firebase (FCM) |
| **Security** | Passport.js (JWT) / 2FA (OTP) |

---

## 📂 Documentation

- 🏗️ **[Architecture Overview](docs/architecture.md)**: Deep dive into the tech stack and system design.
- ✅ **[QA & Workflow Guide](docs/QA_GUIDE.md)**: Step-by-step business flows for testing and integration.
- ⚙️ **[Setup & Installation](docs/setup.md)**: Getting started with development and production.
- � **[API Data Contract](API_CONTRACT.md)**: Full list of endpoints, request bodies, and responses.

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

## 📄 License

This project is licensed under the [MIT License](LICENSE).
