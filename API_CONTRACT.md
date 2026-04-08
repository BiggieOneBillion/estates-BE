# API Data Contract - Estate Management System

## Base URL
`/api` (e.g., `http://localhost:3000/api`)

## Authentication
Authentication is handled via JWT (JSON Web Tokens).
- **Header**: `Authorization: Bearer <token>`
- **Refresh Token**: Stored in HTTP-only Cookie `refresh_token`.

## Role Definitions
- `SUPER_ADMIN`: System owner, full access.
- `ADMIN`: Estate administrator/Manager.
- `LANDLORD`: Property owner.
- `TENANT`: Resident.
- `SECURITY`: Gate security personnel.
- `SITE_ADMIN`: Global system admin (likely platform owner).

---

## 1. Authentication (`/auth`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | User login | *Public* | `LoginDto` { email, password } | `{ accessToken, user }` |
| `POST` | `/auth/login/verify` | Verify 2FA OTP for login | *Public* | `VerifyLoginDto` { email, otp } | `{ accessToken, user }` |
| `POST` | `/auth/register` | Register new estate | *Public* | `RegisterDto` { email, password, firstName, lastName, phone, ... } | `{ message }` |
| `POST` | `/auth/verify-preauth` | Resolve pre-auth (2FA/Multi-device) | *Auth* | `VerifyPreAuthDto` { code } | `{ accessToken }` |
| `POST` | `/auth/verify-email` | Verify registration email | *Auth* | `VerifyEmailDto` { code } | `{ message }` |
| `GET` | `/auth/profile` | Get current user profile | *Auth* | - | `User` object |
| `POST` | `/auth/forgot-password` | Request password reset OTP | *Public* | `ForgotPasswordDto` { email } | `{ message }` |
| `POST` | `/auth/verify-reset-otp` | Verify password reset OTP | *Public* | `VerifyResetOtpDto` { email, code } | `{ message }` (Cookies: `reset_token`) |
| `POST` | `/auth/reset-password` | Reset password | *Public* | `ResetPasswordDto` { newPassword } | `{ message }` |
| `POST` | `/auth/logout` | Logout user | *Auth* | - | `{ message }` |

---

## 2. Users (`/users`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users/create/admin` | Create Admin user | `SUPER_ADMIN`, `ADMIN` | `CreateAdminDto` | `User` object |
| `POST` | `/users/create/landlord` | Create Landlord user | `SUPER_ADMIN`, `ADMIN` | `CreateLandlordDto` | `User` object |
| `POST` | `/users/create/tenant` | Create Tenant user | `SUPER_ADMIN`, `ADMIN`, `LANDLORD` | `CreateTenantDto` | `User` object |
| `POST` | `/users/create/security` | Create Security user | `SUPER_ADMIN`, `ADMIN` | `CreateSecurityDto` | `User` object |
| `GET` | `/users/all` | Get all users in estate | `SUPER_ADMIN`, `ADMIN` | - | `User[]` |
| `GET` | `/users/:id` | Get user by ID | *Auth (Scoped)* | - | `User` object |
| `PATCH` | `/users/full-update/:id` | Full update of user | `SUPER_ADMIN`, `ADMIN` | `UpdateUserDto` | `User` object |
| `PATCH` | `/users/:id` | Update own profile | *Auth (Self)* | `UpdateProfileDto` | `User` object |
| `PUT` | `/users/:id` | Edit user details (Admin) | `SUPER_ADMIN`, `ADMIN` | `UpdateUserDto` | `User` object |
| `PATCH` | `/users/update/to-admin/:id` | Promote Landlord to Admin | `SUPER_ADMIN` | `CreateAdminDetailsDto` | `User` object |
| `PATCH` | `/users/demote/to-landlord/:id` | Demote Admin to Landlord | `SUPER_ADMIN` | - | `User` object |
| `DELETE` | `/users/:id` | Delete user | `SUPER_ADMIN`, `ADMIN` | - | `{ message }` |
| `PATCH` | `/users/permissions/:userId` | Update permissions | `SUPER_ADMIN`, `ADMIN` | `UpdatePermissionsDto` | `User` object |
| `PATCH` | `/users/disable-token-generation/:id` | Disable token gen | `SUPER_ADMIN` | - | `User` object |
| `PATCH` | `/users/enable-token-generation/:id` | Enable token gen | `SUPER_ADMIN` | - | `User` object |
| `POST` | `/users/fcm-token` | Register FCM Token | *Auth* | `RegisterFcmTokenDto` { fcmToken } | `User` object |
| `DELETE` | `/users/fcm-token/:token` | Remove FCM Token | *Auth* | - | `User` object |
| `PATCH` | `/users/notification-preferences` | Update Notif Prefs | *Auth* | `UpdateNotificationPreferencesDto` | `User` object |
| `GET` | `/users/notification-preferences/me` | Get Notif Prefs | *Auth* | - | `{ preferences }` |

---

## 3. Estates (`/estates`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/estates/create` | Create new estate | `SUPER_ADMIN` | `CreateEstateDto` | `Estate` object |
| `GET` | `/estates` | Get all estates | `SITE_ADMIN` | - | `Estate[]` |
| `GET` | `/estates/:id` | Get estate by ID | `SUPER_ADMIN` | - | `Estate` object |
| `PATCH` | `/estates/:id` | Update estate | `SUPER_ADMIN` | `UpdateEstateDto` | `Estate` object |
| `DELETE` | `/estates/:id` | Delete estate | `SUPER_ADMIN` | - | `{ message }` |

---

## 4. Properties (`/properties`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/properties` | Create property | `SUPER_ADMIN`, `ADMIN`, `LANDLORD` | `CreatePropertyDto` | `Property` object |
| `GET` | `/properties` | Get all properties | *Public/Auth* | - | `Property[]` |
| `GET` | `/properties/estate/:estateId` | Get properties by estate | *Public/Auth* | - | `Property[]` |
| `GET` | `/properties/:id` | Get property by ID | *Public/Auth* | - | `Property` object |
| `PATCH` | `/properties/:id` | Update property | `SUPER_ADMIN`, `ADMIN`, `LANDLORD` | `UpdatePropertyDto` | `Property` object |
| `DELETE` | `/properties/:id` | Delete property | `SUPER_ADMIN`, `ADMIN` | - | `{ message }` |

---

## 5. Levies (`/levies`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/levies` | Create new levy | `SUPER_ADMIN`, `ADMIN` | `CreateLevyDto` | `Levy` object |
| `GET` | `/levies` | Get all levies for estate | *Auth* | - | `Levy[]` |
| `GET` | `/levies/active` | Get active levies | *Auth* | - | `Levy[]` |
| `GET` | `/levies/:id` | Get levy by ID | *Auth* | - | `Levy` object |
| `PATCH` | `/levies/:id` | Update levy | `SUPER_ADMIN`, `ADMIN` | `UpdateLevyDto` | `Levy` object |
| `DELETE` | `/levies/:id` | Delete levy | `SUPER_ADMIN` | - | `{ message }` |

---

## 6. Payments (`/payments`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/payments` | Submit Manual Payment | *Auth* | `CreatePaymentDto` | `Payment` object |
| `GET` | `/payments/my-payments` | Get My Payments | *Auth* | - | `Payment[]` |
| `GET` | `/payments/pending` | Get Pending Payments | `SUPER_ADMIN`, `ADMIN` | - | `Payment[]` |
| `GET` | `/payments/levy/:levyId` | Get Payments by Levy | `SUPER_ADMIN`, `ADMIN` | - | `Payment[]` |
| `GET` | `/payments/:id` | Get Payment by ID | *Auth* | - | `Payment` object |
| `PATCH` | `/payments/:id/verify` | Verify Payment | `SUPER_ADMIN`, `ADMIN` | `VerifyPaymentDto` | `Payment` object |
| `PATCH` | `/payments/:id/reject` | Reject Payment | `SUPER_ADMIN`, `ADMIN` | `RejectPaymentDto` | `Payment` object |
| `POST` | `/payments/initialize` | Init Paystack Payment | *Auth* | `InitializePaymentDto` { levyId, amount } | `{ authorizationUrl, reference }` |
| `GET` | `/payments/paystack/verify/:ref` | Verify Paystack Payment | *Auth* | - | `{ payment, paystackData }` |

---

## 7. Gate Pass Tokens (`/tokens`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/tokens` | Create Visitor Token | `LANDLORD`, `TENANT`, `ADMIN`, `SUPER_ADMIN` | `CreateTokenDto` | `Token` object |
| `POST` | `/tokens/means-of-identification` | Add ID to Token | `SECURITY`, `SUPER_ADMIN` | `FormData` { image, token, meansOfId } | `{ message, token }` |
| `GET` | `/tokens` | Get All Tokens | `ADMIN`, `SUPER_ADMIN`, `SECURITY` | Query: `?estateId` | `Token[]` |
| `GET` | `/tokens/get-user-tokens/:id` | Get User Tokens (Admin View) | `SUPER_ADMIN` | - | `Token[]` |
| `GET` | `/tokens/my-tokens` | Get My Tokens | `LANDLORD`, `TENANT`, `ADMIN` | - | `Token[]` |
| `GET` | `/tokens/:tokenId` | Get Token Details | `SUPER_ADMIN`, `SECURITY` | - | `Token` object |
| `GET` | `/tokens/verify/:token` | Verify Token (Security) | `SECURITY`, `ADMIN`, `SUPER_ADMIN` | - | `{ valid, token }` |
| `POST` | `/tokens/verify-visitor/:token` | Verify Visitor (Tenant/Host) | `TENANT`, `LANDLORD`, `ADMIN` | - | `{ valid, token }` |
| `PATCH` | `/tokens/:tokenId` | Update Token | `LANDLORD`, `TENANT`, `ADMIN` | `UpdateTokenDto` | `Token` object |
| `DELETE` | `/tokens/:tokenId` | Delete Token | `LANDLORD`, `TENANT`, `ADMIN` | - | `{ message }` |

---

## 8. Notifications (`/notifications`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Get All Notifications | *Auth* | - | `Notification[]` |
| `GET` | `/notifications/unread` | Get Unread Notifications | *Auth* | - | `Notification[]` |
| `POST` | `/notifications/:id/read` | Mark as Read | *Auth* | - | `Notification` object |
| `POST` | `/notifications/read-all` | Mark All as Read | *Auth* | - | `{ message }` |

---

## 9. Compliance (`/compliance`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/compliance/status` | Get My Compliance Status | *Auth* | - | `{ compliant: boolean }` |
| `GET` | `/compliance/outstanding` | Get Outstanding Levies | *Auth* | - | `Levy[]` |
| `GET` | `/compliance/estate-report` | Estate Compliance Report | `SUPER_ADMIN`, `ADMIN` | - | `{ report }` |

---

## 10. Audit Logs (`/audit-logs`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/audit-logs` | Get Audit Logs | `SUPER_ADMIN`, `SITE_ADMIN` | Query: `limit`, `skip`, `action`... | `AuditLog[]` |
| `GET` | `/audit-logs/stats` | Get Audit Stats | `SUPER_ADMIN`, `SITE_ADMIN` | - | `{ stats }` |
| `GET` | `/audit-logs/resource/:r/:id` | Get Logs by Resource | `SUPER_ADMIN`, `SITE_ADMIN` | - | `AuditLog[]` |
| `GET` | `/audit-logs/user/:userId` | Get Logs by User | `SUPER_ADMIN`, `SITE_ADMIN` | - | `AuditLog[]` |

---

## 11. Cloudinary (`/cloudinary`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/cloudinary/upload` | Upload File | `SUPER_ADMIN`, `ADMIN`, `LANDLORD`, `TENANT` | `FormData` { file } | `{ url, publicId, ... }` |

---

## 12. General (`/`)

| Method | Endpoint | Description | Roles | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Health Check | *Public* | - | "Hello World!" or string |
