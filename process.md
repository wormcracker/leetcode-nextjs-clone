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
