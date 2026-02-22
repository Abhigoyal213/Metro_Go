# Authentication Guide

## Overview
MetroGo uses phone number-based OTP authentication. Login is required only for booking tickets and accessing the admin panel.

## Access Levels

### Public Access (No Login Required)
- Journey planning and route search
- Interactive metro map exploration
- Station information viewing
- Network status checking

### Authenticated Access (Login Required)
- Booking confirmation and ticket generation
- QR code ticket access

### Admin Access (Restricted)
- **Credentials**: Name: Abhishek, Phone: 8107235363
- Network management and configuration
- Bulk import/export operations
- Version compatibility management

## Login Flow

### For Regular Users
1. Browse and plan journey without login
2. Click "Book Ticket" on selected route
3. Redirected to login page if not authenticated
4. Enter name and phone number
5. Receive 6-digit OTP (shown in console/alert in demo mode)
6. Enter OTP to verify
7. Redirected to booking confirmation

### For Admin Users
1. Click "Login" button in header
2. Enter admin credentials (Abhishek / 8107235363)
3. Complete OTP verification
4. Admin link appears in navigation
5. Access admin dashboard

## Demo Mode

**Important**: This is a demo implementation without SMS integration.

- OTP is displayed in browser console
- OTP shown in alert dialog
- Any 10-digit phone number accepted
- Session stored in localStorage

### Production Recommendations
- Integrate SMS gateway (Twilio, AWS SNS, etc.)
- Server-side OTP generation and validation
- Rate limiting and security measures
- JWT-based session management

## Testing

### Test Regular Login
```
Name: John Doe
Phone: 1234567890
OTP: (check console)
```

### Test Admin Login
```
Name: Abhishek
Phone: 8107235363
OTP: (check console)
```

## Security Notes

This demo implementation is for prototype purposes only. For production:

1. Never expose OTP in client-side code
2. Implement server-side validation
3. Add rate limiting for OTP requests
4. Use HTTPS for all communications
5. Implement proper session management
6. Add brute force protection
7. Store admin credentials securely in database

## Session Management

User data stored in localStorage:
```json
{
  "name": "User Name",
  "phone": "1234567890",
  "loginTime": "2024-01-01T12:00:00.000Z"
}
```

Session persists across browser refreshes until logout.

## Logout

Click on user name in header → Click "Logout" button

This clears the session and redirects to login page if on a protected route.
