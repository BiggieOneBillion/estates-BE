# Project Architecture

This document provides a high-level overview of the Estate Management System's architecture and technology stack.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (v11+)
- **Language**: TypeScript
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: Passport.js with JWT Strategy
- **Real-time**: Socket.io / NestJS Websockets
- **File Storage**: Cloudinary
- **Logging**: Winston

## System Overview

The system is built as a modular NestJS application, following a structured approach to separate concerns. It handles user management, estate/property organization, and security token generation for visitors.

### Core Modules

1.  **AuthModule**: Handles authentication, registration, and login. Uses JWT for stateless authentication.
2.  **UsersModule**: Manages user profiles, roles (Super Admin, Site Admin, Landlord, Tenant, Security), and hierarchy.
3.  **EstatesModule**: Manages estate-level information, subscription plans, and document storage.
4.  **PropertiesModule**: Handles individual property units within an estate, linking them to landlords and tenants.
5.  **TokenModule**: Responsible for generating and verifying gate pass tokens for visitor access.
6.  **NotificationsModule**: Manages system alerts and notifications.
7.  **CloudinaryModule**: Integration for handling media uploads.
8.  **EventsModule**: Handles internal events and real-time communication.

## Key Architectural Patterns

- **Dependency Injection**: Leveraged throughout for decoupled services.
- **Middleware**: Used for logging and shared request handling.
- **Entities/Schemas**: Defined using Mongoose for structured data persistence.
- **DTOs**: Ensure type-safe data transfer across layers.
