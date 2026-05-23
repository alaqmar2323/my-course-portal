# ════════════════════════════════════════════════════════
#  Course Registration Portal — Project README
# ════════════════════════════════════════════════════════

## Tech Stack
- Frontend : React (single-page app, self-contained JSX)
- Backend  : Django 4.x + Django REST Framework + SimpleJWT

---

## Project Structure

course-portal/
├── CoursePortal.jsx          ← React frontend (full SPA)
├── README.md
└── backend/
    ├── models.py             ← Django models (User, Course, Registration)
    ├── serializers.py        ← DRF serializers
    ├── views_and_urls.py     ← Views + URL patterns
    └── settings_snippet.py  ← Settings to add to settings.py

---

## Backend Setup

### 1. Install dependencies
```
pip install django djangorestframework djangorestframework-simplejwt \
            django-cors-headers pillow
```

### 2. Create Django project
```
django-admin startproject config .
python manage.py startapp courses
```

### 3. Copy backend/ files into the `courses` app
- models.py     → courses/models.py
- serializers.py → courses/serializers.py
- views_and_urls.py → split into courses/views.py + courses/urls.py

### 4. Apply settings (see settings_snippet.py)

### 5. Migrate & run
```
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser   # create admin
python manage.py runserver
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register/ | Public | Register new user |
| POST | /api/auth/login/ | Public | Login → JWT tokens |
| POST | /api/auth/refresh/ | Public | Refresh access token |
| GET  | /api/auth/me/ | User | Current user info |
| GET  | /api/courses/ | User | List all courses |
| POST | /api/courses/ | Admin | Create course |
| GET  | /api/courses/:id/ | User | Course detail |
| PUT/PATCH | /api/courses/:id/ | Admin | Update course |
| DELETE | /api/courses/:id/ | Admin | Delete course |
| GET  | /api/registrations/ | User/Admin | List registrations |
| POST | /api/registrations/ | User | Register for course |
| PATCH | /api/registrations/:id/status/ | Admin | Accept/Reject |
| GET  | /api/registrations/mine/ | User | My registrations |

---

## Frontend Demo Accounts (built into JSX)
- Admin : admin@portal.com / admin123
- User  : ravi@example.com / user123

---

## Connecting Frontend to Django API

In CoursePortal.jsx, replace the in-memory state operations with fetch calls:

```js
const BASE = "http://localhost:8000/api";

// Login
const res = await fetch(`${BASE}/auth/login/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: email, password }),
});
const { access, user } = await res.json();

// Authenticated request
const courses = await fetch(`${BASE}/courses/`, {
  headers: { Authorization: `Bearer ${access}` },
}).then(r => r.json());

// Enroll
await fetch(`${BASE}/registrations/`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
  body: JSON.stringify({ course_id: courseId }),
});

// Admin: update registration status
await fetch(`${BASE}/registrations/${regId}/status/`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
  body: JSON.stringify({ status: "accepted" }),
});
```
