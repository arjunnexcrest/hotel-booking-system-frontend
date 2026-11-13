# Hotel Booking System — Frontend (Next.js)

Repo: https://github.com/arjunnexcrest/hotel-booking-system-frontend.git

## Quick start

```bash
npm install
copy .env.example .env.local
npm run dev
```

App: http://localhost:3000  
API: set `NEXT_PUBLIC_API_URL` to the Django backend (`http://127.0.0.1:8000/api`)

## Folder structure

```
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/              # login, register, forgot-password
│   │   ├── (customer)/          # public customer portal
│   │   │   ├── hotels/
│   │   │   ├── bookings/
│   │   │   └── profile/
│   │   ├── (hotel-admin)/       # hotel admin portal
│   │   │   └── hotel-admin/
│   │   │       ├── restaurants/
│   │   │       ├── tables/
│   │   │       ├── bookings/
│   │   │       ├── staff/
│   │   │       ├── alerts/
│   │   │       ├── reports/
│   │   │       └── settings/
│   │   ├── (super-admin)/       # platform super admin
│   │   │   └── super-admin/
│   │   │       ├── hotels/
│   │   │       ├── approvals/
│   │   │       ├── customers/
│   │   │       ├── reports/
│   │   │       └── audit/
│   │   └── (staff)/             # waiter / staff portal
│   │       └── staff/
│   │           ├── tasks/
│   │           └── tables/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── auth/
│   │   ├── hotels/
│   │   ├── bookings/
│   │   ├── tables/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── api/                 # API client + domain calls
│   │   ├── auth/                # JWT / session helpers
│   │   ├── hooks/
│   │   └── utils/
│   ├── store/                   # client state (optional)
│   ├── styles/
│   └── types/
├── .env.local
├── .env.example
└── package.json
```
