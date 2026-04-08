# 📚 Estate Management System - Documentation Index

**Complete Onboarding Guide for New Developers**

---

## 🎯 Start Here

### For Quick Start (30 minutes)

👉 **[QUICK_START.md](QUICK_START.md)** - Setup, key concepts, common issues, checklists

### For Complete Understanding (2-3 hours)

Follow this reading order:

1. **[CODEBASE_GUIDE.md](CODEBASE_GUIDE.md)** (30 min)

   - Project overview
   - Tech stack (NestJS, MongoDB, Redis)
   - Request-to-response lifecycle
   - Folder structure

2. **[03-core-modules.md](03-core-modules.md)** (45 min)

   - Auth/Login flow
   - Users & roles system
   - Payments lifecycle
   - Levies management
   - Other modules overview

3. **[04-endpoints-reference.md](04-endpoints-reference.md)** (30 min)

   - Complete API endpoint list
   - Request/response schemas
   - HTTP status codes
   - Example payloads

4. **[05-cqrs-pattern.md](05-cqrs-pattern.md)** (30 min)

   - What is CQRS?
   - Command & Query handlers
   - Writing new handlers
   - Real-world examples
   - Testing patterns

5. **[06-cross-cutting-concerns.md](06-cross-cutting-concerns.md)** (30 min)

   - Middleware (logging)
   - Guards (JWT, roles, permissions)
   - Pipes (validation)
   - Filters (error handling)
   - Interceptors (audit logging)

6. **[07-event-driven-architecture.md](07-event-driven-architecture.md)** (30 min)

   - Event publishing (transactional outbox)
   - Event handlers (email, audit, compliance, real-time)
   - BullMQ job queue
   - Monitoring & debugging

7. **[08-database-models.md](08-database-models.md)** (30 min)
   - MongoDB schema design
   - Entity relationships
   - Soft deletes
   - Indexes & performance
   - Query examples

---

## 📋 Document Details

### CODEBASE_GUIDE.md

**What:** High-level system overview  
**Who:** Everyone - read first  
**Time:** 30 minutes  
**Topics:**

- Technology stack explanation
- Overall architecture and design principles
- Request-to-response flow with code snippets
- Project structure walkthrough
- Common patterns & best practices
- Troubleshooting tips

### QUICK_START.md

**What:** Practical setup and getting started guide  
**Who:** Developers starting development  
**Time:** 20 minutes  
**Topics:**

- Local environment setup
- Installation steps
- User roles & permissions quick ref
- Authentication flow diagram
- Creating new endpoints
- Testing template
- Common issues & fixes
- Useful curl commands
- Pre-PR checklist

### 03-core-modules.md

**What:** Deep dive into 5 core modules  
**Who:** Understanding specific features  
**Time:** 45 minutes  
**Topics:**

- Auth module: Login, registration, verification
- Users module: Role hierarchy, permissions system
- Payments module: Manual & online payments
- Levies module: Assessment management
- Sequence diagrams for key flows
- Code snippets from actual handlers
- Request/response examples

### 04-endpoints-reference.md

**What:** Complete API endpoint catalog  
**Who:** Backend/frontend testing, API consumers  
**Time:** Reference document (lookup as needed)  
**Topics:**

- All endpoints organized by module
- HTTP method & path
- Request body schema (JSON)
- Response schema (JSON)
- Error responses
- HTTP status codes
- Query parameters
- Sample payloads for testing

### 05-cqrs-pattern.md

**What:** CQRS pattern implementation guide  
**Who:** When building new features  
**Time:** 30 minutes  
**Topics:**

- What is CQRS and why we use it
- File organization structure
- Command class examples
- Command handler implementation
- Query class examples
- Query handler implementation
- Real-world payment verification flow
- Testing handlers
- Best practices
- Common commands & queries in codebase

### 06-cross-cutting-concerns.md

**What:** Middleware, guards, filters, interceptors  
**Who:** Understanding request handling, auth, validation  
**Time:** 30 minutes  
**Topics:**

- Request lifecycle diagram
- Logger middleware
- 4 types of Guards (JWT, Verified, Roles, Permissions)
- Global Validation Pipe
- Exception Filters (HTTP & Generic)
- Audit Interceptor
- Complete request lifecycle example
- Error handling example
- Best practices

### 07-event-driven-architecture.md

**What:** Async event handling system  
**Who:** When publishing events or handling side effects  
**Time:** 30 minutes  
**Topics:**

- Why event-driven architecture?
- Publishing events (transactional outbox pattern)
- Domain event classes
- Event handlers (email, audit, compliance, real-time)
- BullMQ job queue & Redis
- Event flows with examples
- Monitoring with BullBoard
- Debugging failed events
- Idempotency & retries
- Best practices

### 08-database-models.md

**What:** MongoDB schema reference  
**Who:** Database queries, data modeling, migrations  
**Time:** 30 minutes  
**Topics:**

- User schema (with AdminDetails, Permissions)
- Estate schema
- Property schema
- Levy schema
- Payment schema
- Audit Log schema
- Gate Pass Token schema
- Soft delete plugin
- Recommended MongoDB indexes
- Query examples
- Performance tips

---

## 🎓 By Role

### Backend Developer (Full-stack)

1. Start with **QUICK_START.md** (setup)
2. **CODEBASE_GUIDE.md** (overall architecture)
3. **03-core-modules.md** (understand features)
4. **05-cqrs-pattern.md** (for implementing features)
5. **08-database-models.md** (database design)
6. Keep **04-endpoints-reference.md** & **06-cross-cutting-concerns.md** as reference

### Frontend Developer

1. **QUICK_START.md** (basics)
2. **04-endpoints-reference.md** (API contracts)
3. **CODEBASE_GUIDE.md** (understand flow)
4. Use Swagger: http://localhost:3000/api/docs

### DevOps/Platform Engineer

1. **CODEBASE_GUIDE.md** (tech stack)
2. **QUICK_START.md** (setup)
3. Focus on deployment in **setup.md** (in docs folder)

### Product/QA

1. **QUICK_START.md** (user roles)
2. **03-core-modules.md** (workflows)
3. **04-endpoints-reference.md** (what to test)

### Tech Lead/Architect

Read all 8 documents for comprehensive understanding

---

## 🔍 Common Questions - Where to Find Answers

| Question                              | Document                     | Section                   |
| ------------------------------------- | ---------------------------- | ------------------------- |
| Why is this built with NestJS?        | CODEBASE_GUIDE               | Technology Stack          |
| How do I set up locally?              | QUICK_START                  | Local Development Setup   |
| How does login work?                  | 03-core-modules              | Authentication Module     |
| How do I create a new endpoint?       | QUICK_START                  | Creating a New Endpoint   |
| How do payments get verified?         | 03-core-modules              | Payments Module           |
| What's CQRS?                          | 05-cqrs-pattern              | What is CQRS?             |
| How do I write a handler?             | 05-cqrs-pattern              | Command Handler Example   |
| What guards protect my endpoint?      | 06-cross-cutting-concerns    | Guards (Authorization)    |
| How do async tasks work?              | 07-event-driven-architecture | Event Publishing          |
| What database structure exists?       | 08-database-models           | User Model, etc.          |
| Why did my email not send?            | QUICK_START                  | Common Issues & Solutions |
| How do I test this?                   | QUICK_START                  | Testing                   |
| What permissions does this role have? | QUICK_START                  | User Roles & Permissions  |

---

## 📊 Documentation Statistics

| Document                        | Pages         | Focus                  | Read Time     |
| ------------------------------- | ------------- | ---------------------- | ------------- |
| CODEBASE_GUIDE.md               | 8 pages       | Architecture, Overview | 30 min        |
| QUICK_START.md                  | 6 pages       | Setup, Quick Ref       | 20 min        |
| 03-core-modules.md              | 10 pages      | 5 Key Modules          | 45 min        |
| 04-endpoints-reference.md       | 15 pages      | API Reference          | 30 min        |
| 05-cqrs-pattern.md              | 10 pages      | Design Pattern         | 30 min        |
| 06-cross-cutting-concerns.md    | 12 pages      | Request Lifecycle      | 30 min        |
| 07-event-driven-architecture.md | 10 pages      | Async Processing       | 30 min        |
| 08-database-models.md           | 12 pages      | Data Design            | 30 min        |
| **TOTAL**                       | **~80 pages** | **Complete Codebase**  | **2-3 hours** |

---

## ✅ Learning Milestones

### Day 1: Foundation

- [ ] Read QUICK_START.md
- [ ] Read CODEBASE_GUIDE.md
- [ ] Setup local environment
- [ ] Access Swagger at http://localhost:3000/api/docs
- [ ] Explore existing endpoints in Postman

**Checkpoint:** Can run app locally and understand overall flow ✓

### Day 2: Project Structure

- [ ] Read 03-core-modules.md
- [ ] Read 08-database-models.md
- [ ] Explore MongoDB collections
- [ ] Trace one user story (e.g., login flow) through code

**Checkpoint:** Can find code for any feature ✓

### Day 3: Implementation Patterns

- [ ] Read 05-cqrs-pattern.md
- [ ] Read 06-cross-cutting-concerns.md
- [ ] Read 07-event-driven-architecture.md
- [ ] Create a simple endpoint

**Checkpoint:** Can build a new feature following patterns ✓

### Day 4: Deep Dive

- [ ] Read 04-endpoints-reference.md
- [ ] Create CRUD endpoints
- [ ] Add proper validation & error handling
- [ ] Write unit tests

**Checkpoint:** Ready for first PR ✓

---

## 🚀 Next Steps

1. **Setup** → Follow QUICK_START.md
2. **Read** → Start with CODEBASE_GUIDE.md
3. **Explore** → Check code in VS Code
4. **Test** → Use Swagger or Postman
5. **Code** → Build something small
6. **Submit** → Create your first PR!

---

## 📞 Support

- **Questions?** Ask in team Slack
- **Confused about a concept?** Search relevant doc using Ctrl+F
- **Can't find something?** Check the index above
- **Found a typo/gap?** Create an issue or PR to update docs

---

## 🎓 Recommended Order by Background

### Backend Developer

CODEBASE → 03-Core → 05-CQRS → 06-Guards → 07-Events → 08-DB → 04-Endpoints

### Frontend Developer

QUICK_START → 04-Endpoints → CODEBASE → optionally others

### Full-Stack Developer

Read all 8 in order

### DevOps/SRE

CODEBASE → QUICK_START → focus on deployment & monitoring

---

## 🏆 Success Criteria

After reading these docs, you should be able to:

✅ Explain the overall architecture and why each tech was chosen  
✅ Trace a request from client through API to database and back  
✅ Understand CQRS pattern and when to use it  
✅ Identify all user roles and their permissions  
✅ Write a new CQRS handler  
✅ Add authentication guards to an endpoint  
✅ Publish and handle a domain event  
✅ Query the MongoDB database  
✅ Debug an API issue using logs and BullBoard  
✅ Write unit tests for a handler

---

## 📖 Now Get Started!

👉 **Begin with [QUICK_START.md](QUICK_START.md) if new to project.**

👉 **Or go to [CODEBASE_GUIDE.md](CODEBASE_GUIDE.md) for detailed overview.**

---

**Last Updated:** February 2026  
**Sections:** 8 Comprehensive Guides  
**Total Content:** ~80 pages  
**Status:** ✅ Complete for Onboarding
