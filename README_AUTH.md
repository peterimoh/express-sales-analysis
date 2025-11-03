# Authentication System Documentation

## Overview

This authentication system provides role-based access control with two roles:

- **Super Admin**: Can create admins and access all features
- **Admin**: Can access features but must reset password on first login

## Database Setup

### 1. Run the Migration

Execute the SQL migration file to create the users table:

```bash
psql -U your_user -d your_database -f migrations/001_create_users_table.sql
```

Or run it manually using your PostgreSQL client.

### 2. Create Initial Super Admin

Run the script to create the first super admin:

```bash
npx tsx scripts/create-super-admin.ts admin@company.com "SuperAdmin@2025"
```

**Important**: Change the default password after first login!

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
```

**Security Note**: Use a strong, randomly generated secret key in production (at least 32 characters).

## API Endpoints

### Authentication Endpoints

#### 1. Login

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@company.com",
      "role": "admin",
      "is_password_reset_required": true
    }
  }
}
```

#### 2. Get Profile

**GET** `/api/auth/profile`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "email": "admin@company.com",
    "role": "admin",
    "is_password_reset_required": true,
    "last_login": "2025-01-15T10:30:00.000Z",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3. Reset Password

**POST** `/api/auth/reset-password`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "defaultPassword123",
  "newPassword": "NewSecurePassword@2025"
}
```

**Response:**

```json
{
  "message": "Password reset successfully"
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

#### 4. Create Admin (Super Admin Only)

**POST** `/api/auth/admins`

**Headers:**

```
Authorization: Bearer <super_admin_token>
```

**Request Body:**

```json
{
  "email": "newadmin@company.com",
  "password": "DefaultPassword123"
}
```

**Response:**

```json
{
  "data": {
    "id": 2,
    "email": "newadmin@company.com",
    "role": "admin",
    "is_password_reset_required": true,
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  "message": "Admin created successfully. They must reset their password on first login."
}
```

## Database Schema

### Users Table

| Column                     | Type         | Constraints             | Description                         |
| -------------------------- | ------------ | ----------------------- | ----------------------------------- |
| id                         | SERIAL       | PRIMARY KEY             | Auto-incrementing user ID           |
| email                      | VARCHAR(255) | UNIQUE, NOT NULL        | User email address                  |
| password_hash              | VARCHAR(255) | NOT NULL                | Bcrypt hashed password              |
| role                       | VARCHAR(20)  | NOT NULL, CHECK         | Either 'super_admin' or 'admin'     |
| is_password_reset_required | BOOLEAN      | NOT NULL, DEFAULT FALSE | Flag for password reset requirement |
| is_active                  | BOOLEAN      | NOT NULL, DEFAULT TRUE  | User account status                 |
| last_login                 | TIMESTAMP    | NULL                    | Last login timestamp                |
| created_at                 | TIMESTAMP    | NOT NULL, DEFAULT       | Account creation timestamp          |
| updated_at                 | TIMESTAMP    | NOT NULL, DEFAULT       | Last update timestamp               |

## Usage in Protected Routes

To protect routes with authentication:

```typescript
import { authenticate, authorize } from "#common/middleware/auth.js";

// Require authentication
router.get("/protected", authenticate, controller.handler);

// Require super admin role
router.post(
  "/admin-only",
  authenticate,
  authorize("super_admin"),
  controller.handler
);

// Allow both super_admin and admin
router.get(
  "/both-roles",
  authenticate,
  authorize("super_admin", "admin"),
  controller.handler
);
```

## Workflow

### Admin Creation Flow

1. **Super Admin creates admin**:

   - Super admin calls `/api/auth/admins` with email and default password
   - Admin is created with `is_password_reset_required = true`

2. **Admin first login**:

   - Admin logs in with default password at `/api/auth/login`
   - Response includes `is_password_reset_required: true`

3. **Admin resets password**:
   - Admin calls `/api/auth/reset-password` with current and new password
   - Flag is set to `false` automatically

### Super Admin Flow

- Super admin can login normally
- No password reset requirement (can be set during creation)
- Can create new admins
- Has access to all endpoints

## Security Features

1. **Password Hashing**: Uses bcrypt with salt rounds = 10
2. **JWT Tokens**: Secure token-based authentication
3. **Role-Based Access**: Middleware enforces role requirements
4. **Password Validation**: Strong password requirements
5. **Active User Check**: Only active users can login
6. **Token Expiration**: Configurable token expiration (default: 7 days)

## Testing

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password123"
  }'
```

### Test Protected Route

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <your_token_here>"
```

### Test Create Admin (Super Admin)

```bash
curl -X POST http://localhost:3000/api/auth/admins \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@company.com",
    "password": "DefaultPassword123"
  }'
```
