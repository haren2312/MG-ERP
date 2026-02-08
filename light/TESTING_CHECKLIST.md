# User Management CRUD - Testing Checklist

## Pre-Test Setup
- [ ] Backend running on port 8005
- [ ] Frontend running on port (dev/build)
- [ ] SQLite database initialized
- [ ] Logged in as Super Admin (admin/admin123)

---

## Test 1: Access Control ✓

### Test 1.1: Super Admin Access
- [ ] Login as admin
- [ ] See "🔐 Users Management" in sidebar
- [ ] Can navigate to Users Management page
- [ ] Page loads without errors

### Test 1.2: Manager Access
- [ ] Login as manager (if available)
- [ ] "🔐 Users Management" NOT visible in sidebar
- [ ] Try navigating to `/auth-users`
- [ ] Get "Access Denied" message

### Test 1.3: Cashier Access
- [ ] Login as cashier
- [ ] "🔐 Users Management" NOT visible in sidebar
- [ ] Try navigating to `/auth-users`
- [ ] Get "Access Denied" message

---

## Test 2: Read Operations ✓

### Test 2.1: List Users
- [ ] Page loads with user table
- [ ] All existing users displayed
- [ ] Table shows: Username, Full Name, Email, Role, Status, Last Login, Created Date
- [ ] Statistics show correct counts

### Test 2.2: View Statistics
- [ ] "Total Users" count is accurate
- [ ] "Active Users" count is correct
- [ ] "Inactive Users" count is correct
- [ ] Stats update when users change

### Test 2.3: Filter by Status
- [ ] Uncheck "Show inactive users"
- [ ] Only active users displayed
- [ ] Check "Show inactive users"
- [ ] All users displayed
- [ ] Filter persists on page refresh

### Test 2.4: View Current User Indicator
- [ ] Current user has "👤" indicator
- [ ] Current user shows "Current user" in actions column
- [ ] Edit/Delete buttons disabled for current user

---

## Test 3: Create Operations ✓

### Test 3.1: Add User Form
- [ ] Click "➕ Add User"
- [ ] Form appears with all fields
- [ ] Form fields: Username, Password, Full Name, Email, Role, Status
- [ ] Role dropdown shows: Cashier, Manager, Super Admin
- [ ] Status dropdown shows: Active, Inactive

### Test 3.2: Form Validation - Required Fields
- [ ] Try submit without username → Error "Username is required"
- [ ] Try submit without password (new user) → Error "Password is required"
- [ ] Try submit without role → Error shown or default selected
- [ ] Error messages display in red

### Test 3.3: Username Validation
- [ ] Try username < 3 chars → Error "Username must be at least 3 characters"
- [ ] Try existing username → Error "Username already exists"
- [ ] Enter valid new username → No error

### Test 3.4: Password Validation
- [ ] Try password < 6 chars → Error "Password must be at least 6 characters"
- [ ] Enter valid password → No error

### Test 3.5: Email Validation
- [ ] Enter invalid email → Error "Invalid email format"
- [ ] Enter valid email → No error
- [ ] Leave email empty → No error (optional)
- [ ] Try duplicate email → Error shown

### Test 3.6: Create New User (Happy Path)
- [ ] Fill form with valid data:
  - Username: testuser1
  - Password: password123
  - Full Name: Test User
  - Email: test@example.com
  - Role: Cashier
  - Status: Active
- [ ] Click "➕ Add User"
- [ ] Success message appears
- [ ] New user appears in table
- [ ] Form clears
- [ ] Form closes

### Test 3.7: Create Multiple Users
- [ ] Create second user: testuser2, manager role
- [ ] Create third user: testuser3, super_admin role
- [ ] All three users visible in table
- [ ] Correct roles displayed

---

## Test 4: Update Operations ✓

### Test 4.1: Edit Form Opens
- [ ] Click "✏️ Edit" on any user
- [ ] Form opens with user data pre-filled
- [ ] Form title shows "Edit User"
- [ ] Username field is disabled (cannot edit)
- [ ] Password field is hidden (not for edit)

### Test 4.2: Edit User Details
- [ ] Edit user fields:
  - [ ] Change email
  - [ ] Change full_name
  - [ ] Change role
  - [ ] Change status to inactive
- [ ] Click "💾 Update User"
- [ ] Success message appears
- [ ] User table updates with new values
- [ ] Form closes

### Test 4.3: Edit Multiple Users
- [ ] Edit different users
- [ ] Each maintains their changes
- [ ] Statistics update correctly

### Test 4.4: Cancel Edit
- [ ] Click "✏️ Edit"
- [ ] Form appears
- [ ] Make changes
- [ ] Click "Cancel"
- [ ] Form closes
- [ ] Changes not saved

### Test 4.5: Validation on Update
- [ ] Try blank email then save → Error if format invalid
- [ ] Change back to valid → No error
- [ ] Updates save correctly

---

## Test 5: Delete Operations ✓

### Test 5.1: Delete Confirmation
- [ ] Click "🗑️ Delete" on testuser1
- [ ] Confirmation dialog appears
- [ ] Message: "Are you sure you want to delete this user?"
- [ ] Cancel button works (no delete)
- [ ] Confirm button works (deletes)

### Test 5.2: Delete User (Happy Path)
- [ ] Click "🗑️ Delete" on testuser1
- [ ] Confirm deletion
- [ ] Success message appears
- [ ] User removed from table immediately
- [ ] User count decreases

### Test 5.3: Delete Multiple Users
- [ ] Delete testuser2
- [ ] Delete testuser3
- [ ] Both removed successfully
- [ ] Statistics updated

### Test 5.4: Self-Deletion Prevention
- [ ] Try to delete current user (admin)
- [ ] Get error: "Cannot delete your own account"
- [ ] User NOT deleted
- [ ] User still in table

### Test 5.5: Delete Protection Message
- [ ] For current user row
- [ ] "Current user" message shown instead of Edit/Delete buttons
- [ ] Buttons are disabled/hidden

---

## Test 6: Role Management ✓

### Test 6.1: Cashier Role
- [ ] Create user with Cashier role
- [ ] Edit to Manager role
- [ ] Role badge changes from green to yellow
- [ ] Can login with new role and see appropriate features

### Test 6.2: Manager Role
- [ ] Create/edit user as Manager
- [ ] Manager can see "Users Management" link? NO (only Super Admin)
- [ ] Manager can access inventory, expenses
- [ ] Manager cannot access user management

### Test 6.3: Super Admin Role
- [ ] Create/edit user as Super Admin
- [ ] Super Admin can access user management
- [ ] Super Admin can see all features
- [ ] Role displays as "SUPER ADMIN" in table

### Test 6.4: Role Hierarchy
- [ ] Create test users for each role
- [ ] Verify access levels match roles
- [ ] Each role sees appropriate pages

---

## Test 7: Status Management ✓

### Test 7.1: Active User
- [ ] Create/set user as Active
- [ ] Active badge shows green "✓ Active"
- [ ] User can login
- [ ] User row opacity is 100%

### Test 7.2: Inactive User
- [ ] Edit user and set to Inactive
- [ ] Inactive badge shows red "✗ Inactive"
- [ ] User cannot login (verify by trying)
- [ ] User row opacity reduced (visual indication)
- [ ] Statistics updated

### Test 7.3: Toggle Status
- [ ] Edit inactive user
- [ ] Change to Active
- [ ] User can login again
- [ ] Status updates immediately

### Test 7.4: Show/Hide Inactive
- [ ] Create one active and one inactive user
- [ ] Uncheck "Show inactive users"
- [ ] Only active user shown
- [ ] Check "Show inactive users"
- [ ] Both shown
- [ ] Filter preference persists

---

## Test 8: Data Integrity ✓

### Test 8.1: Timestamps
- [ ] New user shows current date in "Created" column
- [ ] New user shows empty "Last Login"
- [ ] After login, "Last Login" updates
- [ ] Timestamps remain unchanged when not logging in

### Test 8.2: Unique Fields
- [ ] Try create user with existing username
- [ ] Error: "Username already exists"
- [ ] Try create user with existing email
- [ ] Error: "Email already exists"
- [ ] Can create user with unique combo

### Test 8.3: Data Persistence
- [ ] Create user
- [ ] Refresh page (F5)
- [ ] User still in table with same data
- [ ] Edit user
- [ ] Refresh page
- [ ] Changes persist

### Test 8.4: Bulk Operations
- [ ] Create 10 users
- [ ] All display correctly
- [ ] Table scrollable if needed
- [ ] Performance acceptable
- [ ] No lag on interactions

---

## Test 9: Error Handling ✓

### Test 9.1: Network Errors
- [ ] (Offline backend) Try to create user
- [ ] Error message shown: "Failed to save user"
- [ ] Form stays open for retry
- [ ] Restart backend
- [ ] Retry works

### Test 9.2: Validation Errors
- [ ] Various validation errors shown clearly
- [ ] User can correct and retry
- [ ] Error messages disappear when corrected
- [ ] No duplicate error messages

### Test 9.3: Permission Errors
- [ ] Try delete as non-Super Admin
- [ ] Get error: "Access denied"
- [ ] Try create as Manager
- [ ] Page shows "Access Denied"

### Test 9.4: Not Found Errors
- [ ] Delete user
- [ ] Manually navigate to edit URL (if possible)
- [ ] Get appropriate error
- [ ] Or redirect to users list

---

## Test 10: UI/UX ✓

### Test 10.1: Form Layout
- [ ] Form has logical field grouping
- [ ] Labels clear and helpful
- [ ] Input fields properly sized
- [ ] Buttons aligned correctly
- [ ] Error messages visible

### Test 10.2: Table Layout
- [ ] Table headers clear
- [ ] Rows align properly
- [ ] Action buttons visible
- [ ] Scrollable on small screens
- [ ] All columns visible or scrollable

### Test 10.3: Responsive Design
- [ ] Desktop (1920px) - All visible
- [ ] Tablet (768px) - Properly arranged
- [ ] Mobile (375px) - Scrollable, functional
- [ ] Touch targets (buttons) >= 44px

### Test 10.4: Visual Indicators
- [ ] Active role buttons green
- [ ] Inactive status red
- [ ] Manager role yellow
- [ ] Super Admin red
- [ ] Badges properly styled

### Test 10.5: Loading States
- [ ] Page shows "Loading users..." initially
- [ ] Disappears when loaded
- [ ] No visible delay on modern hardware
- [ ] Slow network shows spinner (optional)

---

## Test 11: API Integration ✓

### Test 11.1: API Calls Correct
- [ ] Open DevTools Network tab
- [ ] List users → GET /api/auth/users
- [ ] Create user → POST /api/auth/users
- [ ] Edit user → PUT /api/auth/users/{id}
- [ ] Delete user → DELETE /api/auth/users/{id}
- [ ] All show 200/201/204 status

### Test 11.2: Request Headers
- [ ] All requests have Authorization header
- [ ] Token is Bearer format
- [ ] Content-Type: application/json

### Test 11.3: Response Format
- [ ] GET returns user objects
- [ ] POST returns created user
- [ ] PUT returns updated user
- [ ] DELETE returns 204 No Content
- [ ] All JSON valid

### Test 11.4: Authentication
- [ ] Logout
- [ ] Try access Users Management
- [ ] Redirected to login
- [ ] Login again
- [ ] Can access Users Management

---

## Test 12: Edge Cases ✓

### Test 12.1: Empty States
- [ ] (If no users) Table shows "No users found"
- [ ] Add first user
- [ ] Table populates
- [ ] Statistics update

### Test 12.2: Long Values
- [ ] Create user with long email
- [ ] Create user with long name
- [ ] Create user with special characters
- [ ] All display and save correctly

### Test 12.3: Concurrent Users
- [ ] Open two browser tabs
- [ ] Create user in tab 1
- [ ] Refresh tab 2
- [ ] New user appears in tab 2

### Test 12.4: Password Hashing
- [ ] Create user with password
- [ ] View database (sqlite browser)
- [ ] Password is hashed, not plain text
- [ ] Different users have different hashes

---

## Test 13: Performance ✓

### Test 13.1: Load Time
- [ ] Page loads within 2 seconds
- [ ] Table renders quickly
- [ ] No excessive CPU usage
- [ ] No memory leaks on repeated use

### Test 13.2: Form Performance
- [ ] Form validation instant
- [ ] No lag on typing
- [ ] Submit processes quickly
- [ ] No duplicate requests

### Test 13.3: Scalability
- [ ] Add 100 users (via API if needed)
- [ ] Page still responsive
- [ ] Table still scrollable
- [ ] Sorting/filtering work (if implemented)

---

## Test 14: Security ✓

### Test 14.1: Authentication Required
- [ ] Cannot access without login
- [ ] Cannot access with invalid token
- [ ] Token expires properly
- [ ] Must re-login after expiry

### Test 14.2: Authorization Checks
- [ ] Non-Super Admin cannot see page
- [ ] Non-Super Admin cannot POST/PUT/DELETE
- [ ] API rejects unauthorized requests
- [ ] Frontend doesn't show buttons

### Test 14.3: Password Security
- [ ] Password not in logs
- [ ] Password not in localStorage
- [ ] Password not in network requests (visible)
- [ ] Password hashed on backend

### Test 14.4: CSRF Protection
- [ ] API validates origin
- [ ] Cross-origin requests blocked
- [ ] Same-origin requests allowed

---

## Test 15: Documentation ✓

### Test 15.1: Code Comments
- [ ] File structure clear
- [ ] Complex logic documented
- [ ] API usage examples present
- [ ] Validation rules documented

### Test 15.2: User Documentation
- [ ] README.md updated
- [ ] API docs complete
- [ ] User guide includes users section
- [ ] Troubleshooting section helpful

---

## Test Summary

### Passed Tests: ___/15

### Failed Tests: ___

### Issues Found:
```
[List any issues here]
```

### Overall Status: ☐ PASS ☐ FAIL ☐ PARTIAL

### Notes:
```
[Any additional notes]
```

### Approved By: _________________ Date: _______

---

## Deployment Checklist

- [ ] All tests passed
- [ ] No console errors
- [ ] No network errors
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Database backed up
- [ ] Environment variables set
- [ ] Production config applied
- [ ] Security audit complete
- [ ] Performance acceptable
- [ ] Ready for deployment

---

**Test Completed:** ________________

**Tested By:** ________________

**Date:** ________________
