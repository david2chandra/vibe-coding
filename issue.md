# Feature: User Profile Update & Password Change

This task involves adding functionality for users to update their profile information and change their password.

## Objective
Implement API endpoints and service logic to allow authenticated users to update their `name` and update their `password`.

## Requirements

### 1. User Profile Update Endpoint
- **URL**: `PATCH /api/users/profile`
- **Method**: `PATCH`
- **Auth**: Required (Bearer Token)
- **Body**: `{ "name": "string (optional)" }`
- **Response**:
  - `200 OK`: `{ "message": "Profile updated successfully", "data": { "id", "name", "email", ... } }`
  - `400 Bad Request`: Validation errors.
  - `401 Unauthorized`: Invalid or missing token.

### 2. Password Change Endpoint
- **URL**: `POST /api/users/change-password`
- **Method**: `POST`
- **Auth**: Required (Bearer Token)
- **Body**: 
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```
- **Logic**:
  - Verify `oldPassword` matches the current password in the database.
  - Hash `newPassword` and update the database.
  - Invalidate the current session or keep it (depending on security policy, usually logout others).
- **Response**:
  - `200 OK`: `{ "message": "Password changed successfully" }`
  - `400 Bad Request`: `oldPassword` incorrect or validation failure.
  - `401 Unauthorized`: Invalid token.

## Technical Details (Implementation Guide)

### Service Layer (`src/services/users-service.ts`)
- Add `updateProfile(userId, name)` method.
- Add `changePassword(userId, oldPassword, newPassword)` method.
  - Use `Bun.password.verify` and `Bun.password.hash`.

### Route Layer (`src/routes/users-route.ts`)
- Register new routes within the guarded section.
- Use `t.Object` for body validation.

### Database (`src/db/schema.ts`)
- Ensure `updatedAt` is correctly handled by Drizzle on update.

## Definition of Done
- Endpoints are functional and tested manually (e.g., via Swagger or curl).
- Unit tests are added in `tests/users.test.ts` for these two new features.
- Swagger documentation is updated automatically via Elysia's `detail`.
