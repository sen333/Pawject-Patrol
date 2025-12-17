# Pawject Patrol - Routes Reference

Quick reference for all application routes.

## 🏠 Public Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/catalog` | Animal catalog (public view) | No |

## 👤 User Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/dashboard` or `/(user)` | User dashboard | Yes (User) |
| `/login` | User login page | No |
| `/form` | Animal report form | Optional |
| `/form/confirm` | Report confirmation page | Optional |
| `/volunteer` | Volunteer opportunities list | Optional |
| `/volunteer/[id]` | Volunteer opportunity detail | Optional |

## 🔧 Admin Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/admin` | Admin dashboard | Yes (Admin) |
| `/admin/login` | Admin login page | No |
| `/admin/report` | Reports management list | Yes (Admin) |
| `/admin/report/[id]` | Report detail view | Yes (Admin) |
| `/admin/profiles/animal` | Animal profiles list | Yes (Admin) |
| `/admin/profiles/animal/[id]` | Animal profile detail | Yes (Admin) |
| `/admin/profiles/animal/[id]/edit` | Edit animal profile | Yes (Admin) |
| `/admin/profiles/animal/confirm` | Create new animal profile | Yes (Admin) |
| `/admin/volunteer` | Volunteer calls list | Yes (Admin) |
| `/admin/volunteer/[id]` | Volunteer call detail | Yes (Admin) |
| `/admin/volunteer/[id]/edit` | Edit volunteer call | Yes (Admin) |
| `/admin/volunteer/request/confirm` | Create new volunteer call | Yes (Admin) |

## 🔐 Auth Routes

| Route | Description |
|-------|-------------|
| `/auth/callback` | OAuth callback handler |

## Testing URLs (localhost:3000)

### User Testing
```
http://localhost:3000/
http://localhost:3000/login
http://localhost:3000/dashboard
http://localhost:3000/form
http://localhost:3000/catalog
http://localhost:3000/volunteer
http://localhost:3000/volunteer/[replace-with-id]
```

### Admin Testing
```
http://localhost:3000/admin/login
http://localhost:3000/admin
http://localhost:3000/admin/report
http://localhost:3000/admin/report/[replace-with-id]
http://localhost:3000/admin/profiles/animal
http://localhost:3000/admin/profiles/animal/[replace-with-id]
http://localhost:3000/admin/volunteer
http://localhost:3000/admin/volunteer/[replace-with-id]
```

## Route Parameters

Routes with `[id]` are dynamic:
- Get IDs from database or URL after creating records
- Example: `/admin/report/123e4567-e89b-12d3-a456-426614174000`

## Testing Tips

1. **Start with user flow**: Landing → Login → Dashboard → Form → Catalog
2. **Then admin flow**: Admin Login → Dashboard → Reports → Profiles → Volunteers
3. **Test dynamic routes**: Create records first to get valid IDs
4. **Clear browser cache** between major test runs
5. **Use incognito mode** to test fresh sessions
