# Pawject Patrol - Complete Testing Guide

## Overview
This guide provides a comprehensive checklist for testing all pages, routes, and functionality in the Pawject Patrol application.

---

## Testing Environment Setup

### Prerequisites
1. **Local Development Server**: `pnpm dev` or `npm run dev`
2. **Database**: Ensure Supabase connection is active
3. **Test Accounts**:
   - User account (for user routes)
   - Admin account (for admin routes)
4. **Browsers**: Test on Chrome, Firefox, Safari (if possible)
5. **Devices**: Desktop, Tablet, Mobile responsive views

---

## 🏠 Public Routes (No Authentication Required)

### 1. Landing Page
- **Route**: `/`
- **Test Cases**:
  - [/] Page loads without errors
  - [/] Logo displays correctly
  - [/] Navigation menu opens/closes
  - [ ] All navigation links work (Home, About Us, Mission, Vision, Goals)
  - [/] Social media icons display
  - [/] "Animal Catalogue" link redirects to `/catalog`
  - [/] "Report Animal" link redirects to `/form`
  - [/] "Task Volunteer" link redirects to `/volunteer`
  - [/] Footer displays correctly
  - [/] Responsive design works on mobile/tablet

---

## 👤 User Routes (May require authentication)

### 2. User Dashboard
- **Route**: `/(user)` or `/dashboard`
- **Test Cases**:
  - [/] **Authentication**: Redirects to `/login` if not authenticated
  - [/] **User Info**: Displays correct username and email
  - [/] **Stats Cards**: Shows total reports, accepted reports, volunteers joined
  - [/] **Quick Actions**: All three cards (Report Animal, Browse Catalog, Volunteer) are clickable
  - [/] **Recent Reports Section**:
    - [/] Displays user's reports (max 3 initially)
    - [/] Report cards show: photo, title, animal type, date, area, status badge
    - [/] "View Details" button opens modal
    - [/] Modal displays all report details correctly
    - [/] Modal can be closed
    - [/] "See More" button appears if >3 reports
    - [/] "See More" expands to show all reports
    - [/] "Show Less" collapses back to 3 reports
  - [/] **Volunteer Opportunities Section**:
    - [/] Displays upcoming volunteer calls
    - [/] Shows "Joined" badge if user already joined
    - [/] Cards show date/time and location
    - [/] Clicking card redirects to volunteer detail page
  - [/] **Catalog Animals Section**:
    - [/] Displays 3 recent animals
    - [/] Cards show animal photo/placeholder, name, species
    - [/] Clicking card opens modal
    - [/] Modal shows: photo, name, breed, location
    - [/] Pills display: species, gender, collar status
    - [/] Details tab shows physical description
    - [/] Health tab shows vaccination status and health issues
    - [/] Modal can be closed
  - [/] **Sidebar**: Opens/closes correctly
  - [/] **Logout**: Successfully logs out and redirects

### 3. User Login
- **Route**: `/login`
- **Test Cases**:
  - [/] Page loads without errors
  - [/] Email input field works
  - [/] Password input field works (shows/hides password)
  - [/] "Sign in with Email" button triggers login
  - [/] Shows error message for invalid credentials
  - [/] Successful login redirects to user dashboard
  - [/] "Create an account" link works
  - [/] "Admin" link redirects to `/admin/login`
  - [/] Responsive design

### 4. Animal Report Form
- **Route**: `/form`
- **Test Cases**:
  - [/] **Page 1 - Reporter Info**:
    - [/] Report title input works
    - [/] Reporter name input works
    - [/] Type of animal input works
    - [/] "Next" button validates required fields
  - [/] **Page 2 - Animal Details**:
    - [/] Report title input
    - [/] Animal name input
    - [/] Animal type dropdown (Cat/Dog)
    - [/] Gender selection (Male/Female)
    - [/] Date seen picker works
    - [/] Physical description textarea
    - [/] Photo upload works
    - [/] "Previous" and "Next" buttons work
  - [/] **Page 3 - Location**:
    - [/] Area input works
    - [/] Landmark input works
    - [/] Road input works
    - [/] "Get Current Location" button requests permission
    - [/] Map displays correctly
    - [/] Can click map to set location
    - [/] Latitude/longitude update when location set
    - [/] "Previous" and "Next" buttons work
  - [/] **Page 4 - Additional Info**:
    - [/] Health issues textarea
    - [/] Collar details textarea
    - [/] Other information textarea
    - [/] "Previous" and "Review" buttons work
  - [/] **Confirmation Page**:
    - [/] All entered data displays correctly
    - [/] Photo preview shows
    - [/] Map shows selected location
    - [/] "Edit" button goes back to form
    - [/] "Confirm & Submit" successfully submits
    - [/] Success message appears
    - [/] Redirects after submission

### 5. Report Confirmation
- **Route**: `/form/confirm`
- **Test Cases**:
  - [/] Receives data from form via URL params or session
  - [/] Displays all report details
  - [/] Photo displays if uploaded
  - [/] Map shows location
  - [/] "Edit" button returns to form
  - [/] "Submit" creates report in database
  - [/] Success message appears
  - [/] Clears session storage after submit

### 6. Animal Catalog
- **Route**: `/catalog`
- **Test Cases**:
  - [/] All animals display in grid
  - [/] Filter buttons work (All, Cat, Dog)
  - [/] Search bar filters by name, breed, species
  - [/] Animal cards show photo/placeholder, name, species
  - [/] Theme colors display correctly per animal
  - [/] Clicking animal opens modal
  - [/] Modal shows all details (photo, name, breed, location)
  - [/] Pills show species, gender, collar status
  - [/] Tab system works (Details/Health)
  - [/] Details tab shows description
  - [/] Health tab shows vaccination and health issues
  - [/] Modal close button works
  - [/] Responsive grid layout

### 7. Volunteer Opportunities List
- **Route**: `/volunteer`
- **Test Cases**:
  - [/] All active volunteer calls display
  - [/] Cards show title, date/time, location, capacity
  - [/] "Joined" badge appears if user joined
  - [/] Clicking card redirects to detail page
  - [/] Shows message if no opportunities available
  - [/] Responsive layout

### 8. Volunteer Detail Page
- **Route**: `/volunteer/[id]`
- **Test Cases**:
  - [/] Displays specific volunteer call details
  - [/] Shows title, description, date/time, location
  - [/] Capacity information displays
  - [/] "Join" button appears if not joined
  - [/] "Leave" button appears if already joined
  - [/] Join/Leave functionality works
  - [/] Updates database correctly
  - [/] Shows success/error messages
  - [/] "Back" button returns to list
  - [/] 404 or error for invalid ID

---

## 🔧 Admin Routes (Requires admin authentication)

### 9. Admin Login
- **Route**: `/admin/login`
- **Test Cases**:
  - [/] Page loads without errors
  - [/] Email input works
  - [/] Password input works
  - [/] Login button authenticates admin
  - [/] Shows error for non-admin users
  - [/] Successful login redirects to admin dashboard
  - [/] "User" link redirects to user login
  - [/] Responsive design

### 10. Admin Dashboard
- **Route**: `/admin`
- **Test Cases**:
  - [/] **Authentication**: Redirects to `/admin/login` if not admin
  - [/] Displays admin username and email
  - [/] Shows admin statistics
  - [/] Quick action cards work:
    - [/] View Reports
    - [/] Manage Animals
    - [/] Volunteer Calls
  - [/] Navigation sidebar works
  - [/] Logout button works
  - [/] Responsive design

### 11. Admin Reports List
- **Route**: `/admin/report`
- **Test Cases**:
  - [/] All reports display in table/grid
  - [/] Shows report ID, title, reporter, animal type, status, date
  - [/] Filter/search functionality works
  - [/] Clicking report opens detail page
  - [/] Status badges display correctly (Pending/Accepted/Rejected)
  - [/] Pagination works if implemented
  - [/] Responsive layout

### 12. Admin Report Detail
- **Route**: `/admin/report/[id]`
- **Test Cases**:
  - [/] Displays all report information
  - [ ] Photo displays if available
  - [/] Map shows reported location
  - [/] All fields visible (name, type, description, location, etc.)
  - [/] Status can be updated (Accept/Reject)
  - [/] Status update saves to database
  - [/] "Back" button returns to reports list
  - [ ] 404 or error for invalid ID

### 13. Animal Profiles List
- **Route**: `/admin/profiles/animal`
- **Test Cases**:
  - [/] All animal profiles display
  - [/] Shows animal photo, name, species, breed, status
  - [/] Filter/search works
  - [/] "Add New Animal" button redirects to creation form
  - [/] Clicking animal redirects to detail page
  - [/] Theme colors display correctly
  - [/] Responsive grid

### 14. Animal Profile Detail
- **Route**: `/admin/profiles/animal/[id]`
- **Test Cases**:
  - [/] Displays all animal information
  - [/] Photo displays
  - [/] All details visible (name, species, breed, description, etc.)
  - [/] Location info displays
  - [/] Vaccination status shows
  - [/] Health issues show
  - [/] "Edit" button redirects to edit page
  - [/] "Delete" button (if exists) works with confirmation
  - [ ] 404 for invalid ID

### 15. Animal Profile Edit
- **Route**: `/admin/profiles/animal/[id]/edit`
- **Test Cases**:
  - [/] Form pre-fills with existing data
  - [/] All fields are editable
  - [/] Photo can be changed
  - [/] Location can be updated via map
  - [/] "Save" button updates database
  - [/] Shows success message
  - [/] Validation works for required fields
  - [ ] "Cancel" returns to detail page
  - [ ] 404 for invalid ID

### 16. Animal Profile Creation
- **Route**: `/admin/profiles/animal/confirm`
- **Test Cases**:
  - [/] **Form Page**:
    - [/] Recorder name input
    - [/] Animal name input (required)
    - [/] Species dropdown/input
    - [/] Breed input
    - [/] Gender selection
    - [/] Date seen picker
    - [/] Physical description textarea
    - [/] Photo upload works
    - [/] Location fields (area, landmark, road)
    - [/] Map for location selection
    - [/] Vaccination status input
    - [/] Health issues textarea
    - [/] Collar details input
    - [/] Theme color selection
    - [/] Status dropdown
    - [/] "Confirm" redirects to confirmation
  - [/] **Confirmation Page**:
    - [/] All data displays correctly
    - [/] Photo preview shows
    - [/] Map shows location
    - [/] "Edit" returns to form
    - [/] "Submit" creates animal profile
    - [/] Success message appears
    - [/] Redirects to profiles list

### 17. Admin Volunteer Calls List
- **Route**: `/admin/volunteer`
- **Test Cases**:
  - [/] All volunteer calls display
  - [/] Shows title, date, location, capacity, status
  - [/] Filter by status (Active/Completed/Cancelled)
  - [/] "Create New Call" button works
  - [/] Clicking call opens detail page
  - [/] Shows participant count
  - [/] Responsive layout

### 18. Admin Volunteer Call Detail
- **Route**: `/admin/volunteer/[id]`
- **Test Cases**:
  - [/] Displays call details
  - [/] Shows title, description, date/time, location
  - [/] Displays capacity and current participants
  - [/] Lists all volunteers who joined
  - [/] "Edit" button redirects to edit page
  - [/] "Cancel Call" button works (if exists)
  - [/] Status can be updated
  - [ ] 404 for invalid ID

### 19. Admin Volunteer Call Edit
- **Route**: `/admin/volunteer/[id]/edit`
- **Test Cases**:
  - [/] Form pre-fills with existing data
  - [/] All fields editable
  - [/] Date/time picker works
  - [/] Location can be updated
  - [/] Capacity can be changed
  - [/] "Save" updates database
  - [/] Validation works
  - [/] "Cancel" returns to detail page

### 20. Admin Volunteer Call Creation
- **Route**: `/admin/volunteer/request/confirm`
- **Test Cases**:
  - [/] **Form Page**:
    - [/] Title input (required)
    - [/] Description textarea
    - [/] Start time picker
    - [/] End time picker
    - [/] Location input
    - [/] Capacity number input
    - [/] Additional info textarea
    - [/] "Confirm" redirects to confirmation
  - [/] **Confirmation Page**:
    - [/] All data displays correctly
    - [/] "Edit" returns to form
    - [/] "Submit" creates volunteer call
    - [/] Success message
    - [/] Redirects to volunteer list

---

## 🔐 Authentication Flow Testing

### Auth Callback
- **Route**: `/auth/callback`
- **Test Cases**:
  - [ ] Handles Supabase OAuth callback
  - [ ] Redirects to appropriate page after auth
  - [ ] Handles errors gracefully

### Authentication Tests
- [/] User cannot access admin routes
- [/] Admin cannot access user routes (or can depending on design)
- [/] Unauthenticated users redirected to login
- [/] Session persists across page reloads
- [/] Logout clears session completely
- [/] Token refresh works for long sessions

---

## 🧪 Cross-Browser Testing

Test all above routes on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 📱 Responsive Design Testing

Test all pages at these breakpoints:
- [ ] Mobile (320px - 480px)
- [ ] Tablet (481px - 768px)
- [/] Desktop (769px+)

Check for:
- [ ] Layout doesn't break
- [ ] Navigation is usable
- [ ] Forms are accessible
- [ ] Modals display correctly
- [ ] Maps are interactive
- [ ] Images scale properly

---

## ⚡ Performance Testing

- [ ] Page load times < 3 seconds
- [ ] Images optimized
- [ ] No console errors
- [ ] Smooth animations
- [ ] Map loads without lag

---

## 🐛 Error Handling Testing

Test these scenarios:
- [ ] Invalid route (404 page)
- [ ] Database connection failure
- [ ] Image upload failure
- [ ] Form submission with missing data
- [ ] Network timeout
- [ ] Invalid data in URL params

---

## 📊 Data Integrity Testing

- [ ] Form submissions save correctly
- [ ] Updates modify existing records properly
- [ ] Deletes remove records (if applicable)
- [ ] Relationships maintained (user-reports, user-volunteers)
- [ ] File uploads stored correctly
- [ ] No duplicate entries created

---

## 🔄 Integration Testing

- [/] Report submission → appears in admin panel
- [/] Admin accepts report → status updates for user
- [/] User joins volunteer → appears in admin participant list
- [/] Animal profile creation → appears in catalog
- [/] Photo upload → accessible via public URL

---

## Testing Checklist Summary

**Total Routes to Test**: 20+

### Priority Levels:
- **Critical (P0)**: Landing, Login, Dashboard, Report Form, Catalog
- **High (P1)**: Volunteer pages, Admin reports, Animal profiles
- **Medium (P2)**: Edit pages, Detail views
- **Low (P3)**: Edge cases, Error pages

---

## Automated Testing (Optional but Recommended)

Consider setting up:
1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test API calls and database operations
3. **E2E Tests**: Use Playwright or Cypress to automate user flows

Example E2E test flow:
```javascript
// Pseudo-code for E2E test
test('User can submit animal report', async () => {
  await login('user@test.com', 'password')
  await navigate('/form')
  await fillForm({ name: 'Test User', animalName: 'Max', type: 'Dog' })
  await uploadPhoto('dog.jpg')
  await selectLocation(14.5, 121.0)
  await submitForm()
  await expectSuccessMessage()
})
```

---

## Bug Reporting Template

When you find a bug, document:
1. **Route**: Which page?
2. **Steps to Reproduce**: Exact actions taken
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What actually happened?
5. **Browser/Device**: Testing environment
6. **Screenshots**: Visual evidence
7. **Console Errors**: Any error messages

---

## Testing Schedule Recommendation

1. **Daily**: Test critical paths (login, form submission)
2. **Weekly**: Full regression test of all routes
3. **Before Deployment**: Complete checklist + cross-browser
4. **After Major Changes**: Affected routes + related functionality

---

## Quick Test Commands

```bash
# Start development server
pnpm dev

# Run linting
pnpm lint

# Build for production (catches build errors)
pnpm build

# Check TypeScript types
pnpm tsc --noEmit
```

---

## Notes
- Replace `[id]` with actual IDs from your database when testing
- Keep test credentials secure
- Clear browser cache between major test runs
- Test with slow network conditions occasionally
- Verify mobile touch interactions work properly

Good luck with testing! 🚀
