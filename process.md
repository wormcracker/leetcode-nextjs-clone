# Process of making LeetClone Clone using Next.js

## Modules and Libraries

- CSS: Tailwind
- UI: ShadCN
- Database: Postgres
- ORM: Prisma
- Git: Github ( github.com/wormcracker )
- Docker
- Authentication: Clerk ( 3rd party )

## Prisma and Database Setup

### Todo

- Install prisma + prisma client
- Initialize Prisma
- Grab a postgress database url ( Docker )

### Steps followed

- Installed and initiate prisma
- Setup `docker-compose.yml`, update `package.json` to run docker, update `.env`, create `lib/db.js`

## Authentication ( Clerk )

- Install and setup clerk
- Update `.env`
- Setup `proxy.js` clerkMiddleware() for app and protect( if user is not authenticated, redirect them to sign-in )
- Create `app/(auth)/...` for rendering clerk components like singin/up in your dedicated page.

## User onboarding with prisma ( on our domain db )

- Defining user Schema `prisma/schema.prisma`
- prisma generate for client
- prisma migration to track and sync
- Defining Server Actions ( After logged-in, crate a onBoard() server actions, get userInfo from clerk session, and store into db)
- use upsert(); update if exists, create if not.

## NavBar and Homepage

- Create a route group `app/(root)` then `page.jsx` and `layout.jsx` to have shared layout across root routes.
- Create a dark theme provider, provided by shadcn `component/provider/theme-provider.jsx` and wrap it, also create a mode-toggle inside `component/ui/mode-toggle.jsx` to toggle theme provided by shadcn
- Create a navbar component `modules/navbar.jsx` and import it in `app/(root)/layout.jsx` to share navbar for entire homepage.
- Create a landing page.
