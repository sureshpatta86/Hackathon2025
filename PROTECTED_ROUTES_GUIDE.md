# Protected Routes System

This document outlines the comprehensive protected routes system implemented in the HealthComm application.

## Overview

The protected routes system provides multiple layers of authentication and authorization:

1. **Middleware-level protection** - Server-side route protection
2. **Component-level protection** - Client-side route protection with HOCs
3. **Context-based authentication** - Centralized auth state management
4. **API route protection** - Secure API endpoints
5. **Role-based access control** - Different permission levels

## Components

### 1. Middleware (`src/middleware.ts`)

Server-side protection that runs before pages are rendered:

- **Protected Routes**: `/dashboard`, `/api/patients`, `/api/appointments`, etc.
- **Public Routes**: `/`, `/login`, `/api/auth/login`, `/api/webhooks/twilio`
- **Features**:
  - Token validation from cookies/headers
  - Automatic redirects for unauthenticated users
  - Security headers (XSS protection, CSRF prevention)
  - CORS handling for API routes

### 2. Auth Context (`src/contexts/AuthContext.tsx`)

Centralized authentication state management:

```tsx
const { user, isAuthenticated, login, logout, checkAuth } = useAuth();
```

- **Features**:
  - Persistent sessions using sessionStorage and cookies
  - Automatic token validation
  - Login/logout functionality
  - Loading states

### 3. Higher-Order Components

#### Page Protection (`src/components/withAuth.tsx`)

```tsx
// Protect entire pages
export default withProtectedRoute(DashboardPage);

// Public pages (redirect if authenticated)
export default withPublicRoute(LoginPage);

// Role-based protection
export default withAdminRoute(AdminPage);
export default withManagerRoute(ManagerPage);
```

#### API Protection (`src/lib/withApiAuth.ts`)

```tsx
// Protect API routes
export const GET = withAuth(async (request, user) => {
  // user is guaranteed to be authenticated
  return NextResponse.json({ data: 'protected data' });
});

// Role-based API protection
export const POST = withAdminAuth(async (request, user) => {
  // Only admin users can access
  return NextResponse.json({ message: 'Admin only' });
});
```

### 4. Authentication Wrapper (`src/components/AuthWrapper.tsx`)

Legacy wrapper component for conditional rendering:

```tsx
<AuthWrapper fallback={<LoginForm />}>
  <ProtectedContent />
</AuthWrapper>
```

## Usage Examples

### 1. Protecting a Page

```tsx
// src/app/admin/page.tsx
'use client';

import { withAdminRoute } from '@/components/withAuth';

function AdminPage() {
  return <div>Admin Only Content</div>;
}

export default withAdminRoute(AdminPage);
```

### 2. Protecting an API Route

```tsx
// src/app/api/admin/route.ts
import { withAdminAuth } from '@/lib/withApiAuth';

export const GET = withAdminAuth(async (request, user) => {
  // Only admin users can access this endpoint
  return NextResponse.json({ 
    message: `Hello admin ${user.username}` 
  });
});
```

### 3. Using Auth Context

```tsx
// Any component
import { useAuth } from '@/contexts/AuthContext';

export function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Authentication Flow

1. **User accesses protected route**
2. **Middleware checks authentication**
   - Valid token → Allow access
   - Invalid/missing token → Redirect to login
3. **Login page**
   - User enters credentials
   - API validates credentials
   - Sets authentication cookies
   - Redirects to intended page
4. **Client-side protection**
   - AuthContext validates session
   - HOCs provide additional protection
   - Components conditionally render based on auth state

## Token Management

### Server-side Tokens
- Stored in HTTP-only cookies for security
- Used by middleware for route protection
- Automatically sent with requests

### Client-side Sessions
- Stored in sessionStorage for persistence
- Used by React components
- Cleared on logout

## Role-Based Access Control

### Available Roles
- `admin` - Full system access
- `manager` - Limited administrative access  
- `user` - Standard user access

### Implementation
```tsx
// Page level
export default withAuth(MyPage, { 
  allowedRoles: ['admin', 'manager'] 
});

// API level
export const GET = withAuth(handler, { 
  allowedRoles: ['admin'] 
});
```

## Security Features

1. **HTTP-only cookies** - Prevent XSS attacks
2. **CSRF protection** - SameSite cookie attributes
3. **Secure headers** - XSS, MIME-type sniffing protection
4. **Token validation** - Server-side verification
5. **Automatic logout** - On token expiration
6. **Role verification** - Prevent privilege escalation

## Configuration

### Environment Variables
```env
NODE_ENV=production  # Enables secure cookies in production
```

### Middleware Config
```tsx
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

## Best Practices

1. **Always use HOCs** for page protection
2. **Validate on server-side** with middleware
3. **Use proper TypeScript types** for user objects
4. **Handle loading states** gracefully
5. **Provide clear error messages** for unauthorized access
6. **Test authentication flows** thoroughly
7. **Keep tokens secure** with HTTP-only cookies

## Troubleshooting

### Common Issues

1. **Infinite redirect loops**
   - Check middleware matcher patterns
   - Ensure public routes are properly configured

2. **Token validation failures**
   - Verify token format and expiration
   - Check cookie settings and domain

3. **Role-based access not working**
   - Confirm user role in database
   - Verify role validation logic

### Debug Steps

1. Check browser console for auth errors
2. Inspect Network tab for failed requests
3. Verify cookies are being set correctly
4. Test with different user roles
5. Check middleware logs

## Migration from Legacy Auth

If migrating from the old AuthWrapper-based system:

1. Replace `AuthWrapper` with `withProtectedRoute`
2. Update login logic to use `useAuth`
3. Add role-based restrictions where needed
4. Test all protected routes
5. Update API routes to use `withAuth`

## Future Enhancements

- JWT token implementation
- Session management with database
- OAuth integration (Google, GitHub)
- Two-factor authentication
- Audit logging
- Rate limiting
- Session timeout warnings
