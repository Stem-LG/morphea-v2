# Design Document

## Overview

The user profile page will be implemented as a comprehensive dashboard that allows authenticated users to view and manage their personal information, account settings, and preferences. The design follows the existing application's visual language with the Morphea theme, utilizing the established color palette (morpheus-blue-dark/light, morpheus-gold-dark/light) and component patterns.

The profile page will be accessible through the navigation bar and will be protected by authentication middleware to ensure only logged-in users can access it. The page will integrate seamlessly with the existing Supabase authentication system and maintain consistency with the current UI/UX patterns.

## Architecture

### Page Structure
- **Route**: `/profile` - A new page route in the Next.js app directory
- **Layout**: Utilizes the existing root layout with NavBar and AnimatedBackground
- **Authentication**: Protected route that redirects unauthenticated users to login
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Component Hierarchy
```
ProfilePage (app/profile/page.tsx)
├── ProfileHeader (displays user info and avatar)
├── ProfileTabs (navigation between sections)
│   ├── PersonalInfoTab
│   │   ├── ProfileInfoDisplay (read-only view)
│   │   └── ProfileInfoEdit (edit form)
│   ├── SecurityTab
│   │   ├── PasswordChangeForm
│   │   └── AccountDeletionSection
│   ├── ActivityTab
│   │   ├── WishlistSummary
│   │   ├── CartSummary
│   │   └── RecentActivityList
│   └── PreferencesTab
│       ├── LanguagePreference
│       └── NotificationSettings
```

### State Management
- **React Query**: For server state management (user data, profile updates)
- **Local State**: For form states, tab navigation, and UI interactions
- **Supabase Integration**: Direct integration with existing auth and database

## Components and Interfaces

### Core Components

#### ProfilePage Component
```typescript
import { User } from '@supabase/supabase-js';

interface ProfilePageProps {
  // No props - uses useAuth hook for user data
}

// Use Supabase's built-in User type
type UserProfile = User;
```

#### ProfileInfoEdit Component
```typescript
interface ProfileInfoEditProps {
  user: User;
  onSave: (data: ProfileUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

interface ProfileUpdateData {
  name?: string;
  email?: string;
}
```

#### PasswordChangeForm Component
```typescript
interface PasswordChangeFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

#### ActivitySummary Component
```typescript
interface ActivitySummaryProps {
  wishlistCount: number;
  cartCount: number;
  onViewWishlist: () => void;
  onViewCart: () => void;
}
```

### Styling and Theme Integration

#### Color Scheme
- **Primary Background**: `bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light`
- **Card Backgrounds**: `bg-gradient-to-br from-morpheus-blue-dark/90 to-morpheus-blue-light/80`
- **Accent Colors**: `morpheus-gold-dark` and `morpheus-gold-light`
- **Text Colors**: White primary, gray-300 secondary
- **Border Colors**: `border-morpheus-gold-dark/30`

#### Component Styling Patterns
- **Cards**: Consistent with existing UI components using gradient backgrounds
- **Forms**: Following the login-form.tsx pattern with morpheus-themed inputs
- **Buttons**: Using the established button variants with gold gradients
- **Typography**: Parisienne font for headings, Geist for body text

## Data Models

### User Profile Data Structure
```typescript
import { User } from '@supabase/supabase-js';

// Use Supabase's built-in User type for auth data
type UserProfileData = User & {
  // Extended profile fields (stored in profiles table if needed)
  name?: string;
  avatar_url?: string;
};

interface ProfileUpdateRequest {
  name?: string;
  email?: string;
}

interface PasswordUpdateRequest {
  password: string;
}

interface AccountDeletionRequest {
  password: string;
  confirmation: boolean;
}
```

### Database Schema Extensions
```sql
-- Extend existing user profiles if not already present
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Error Handling

### Error Types and Handling Strategy

#### Authentication Errors
- **Unauthenticated Access**: Redirect to `/auth/login` with return URL
- **Session Expired**: Show session expired message and redirect to login
- **Permission Denied**: Display error message and redirect to appropriate page

#### Form Validation Errors
- **Email Format**: Client-side validation with regex pattern
- **Password Strength**: Real-time validation with strength indicator
- **Required Fields**: Prevent submission and highlight missing fields
- **Server Validation**: Display server-returned validation errors

#### Network and Server Errors
- **Connection Issues**: Retry mechanism with exponential backoff
- **Server Errors**: User-friendly error messages with error codes
- **Rate Limiting**: Display appropriate wait time messages

#### Error Display Components
```typescript
interface ErrorDisplayProps {
  error: string | null;
  type: 'validation' | 'server' | 'network';
  onDismiss?: () => void;
}

interface LoadingStateProps {
  isLoading: boolean;
  message?: string;
}
```

## Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library for all profile components
- **Hook Testing**: Custom hooks for profile data management
- **Form Validation**: Test all validation rules and error states
- **Utility Functions**: Test helper functions for data transformation

### Integration Testing
- **Authentication Flow**: Test protected route behavior
- **Form Submissions**: Test complete form submission workflows
- **API Integration**: Test Supabase integration with mock data
- **Navigation**: Test tab switching and page navigation

### End-to-End Testing
- **User Journey**: Complete profile management workflow
- **Cross-browser**: Test on major browsers and devices
- **Accessibility**: Screen reader and keyboard navigation testing
- **Performance**: Page load times and interaction responsiveness

### Test Data and Mocking
```typescript
// Mock user data for testing
const mockUser: UserProfileData = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  created_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-15T12:00:00Z',
  updated_at: '2024-01-15T12:00:00Z'
};

// Mock Supabase client responses
const mockSupabaseResponses = {
  updateUser: { data: mockUser, error: null },
  updatePassword: { data: null, error: null },
  deleteUser: { data: null, error: null }
};
```

### Accessibility Considerations
- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Tab order and keyboard shortcuts
- **Color Contrast**: Ensure sufficient contrast ratios
- **Focus Management**: Proper focus handling in forms and modals
- **Semantic HTML**: Use appropriate HTML elements and structure

### Performance Optimizations
- **Code Splitting**: Lazy load profile components
- **Image Optimization**: Optimize avatar images with Next.js Image component
- **Caching**: Implement proper caching strategies for user data
- **Bundle Size**: Minimize JavaScript bundle size for profile page

### Security Considerations
- **Input Sanitization**: Sanitize all user inputs
- **CSRF Protection**: Implement CSRF tokens for sensitive operations
- **Rate Limiting**: Implement rate limiting for profile updates
- **Audit Logging**: Log profile changes for security auditing
- **Password Security**: Enforce strong password requirements