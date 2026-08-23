# CollegeEvents — Production Google Authentication Reimplementation

## Objective

Reimplement the Google OAuth authentication flow in the existing CollegeEvents Next.js application.

The application already uses:

* Next.js
* Better Auth
* Prisma
* PostgreSQL / Neon
* Email/password authentication
* GitHub OAuth
* Google OAuth
* Role-based users
* StudentProfile
* OrganizerProfile
* Session-based authentication

Do **NOT** replace Better Auth with another authentication library.

Do **NOT** create a separate custom Google authentication system.

The goal is to make Google authentication production-ready while integrating cleanly with the existing Better Auth + Prisma + PostgreSQL architecture.

---

# PHASE 1 — Inspect the Existing Codebase First

Before changing anything, inspect the entire existing authentication implementation.

At minimum inspect:

```text
src/lib/auth.ts
src/lib/auth-client.ts
src/lib/prisma.ts
src/app/api/auth/[...all]/route.ts
src/proxy.ts
prisma/schema.prisma
```

Also search for:

```text
signIn.social
provider: "google"
google
github
signUpEmail
signIn.email
useSession
getSession
registerStudent
registerOrganizer
loginAction
authClient
StudentProfile
OrganizerProfile
```

Inspect the existing login, signup, onboarding, dashboard, admin and profile flows.

Do not make assumptions about the current implementation.

First understand how the existing system works.

---

# PHASE 2 — Preserve the Existing Authentication Architecture

The authentication authority must remain:

```text
Better Auth
        ↓
Prisma Adapter
        ↓
PostgreSQL / Neon
```

The architecture must remain:

```text
                    ┌───────────────┐
                    │    Google     │
                    │   OAuth 2.0   │
                    └───────┬───────┘
                            │
                            ▼
                     Better Auth
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
           User          Account         Session
             │
             ├── StudentProfile
             │
             └── OrganizerProfile
```

Do not manually implement:

* OAuth token exchange
* OAuth callback processing
* session token generation
* session cookie generation
* password hashing
* Google identity validation

Better Auth should own these responsibilities.

---

# PHASE 3 — Correct the Identity Data Model

Use the Better Auth `User` + `Account` relationship as the source of truth.

A user can have multiple authentication methods:

```text
User
 │
 ├── Account → credentials
 ├── Account → google
 └── Account → github
```

Do not create separate users for different authentication providers when they represent the same application user.

Review the existing fields:

```prisma
User.provider
User.providerId
User.passwordHash
```

and determine whether they are redundant with Better Auth's `Account` model.

If they are not required anywhere in the application, remove them safely through a Prisma migration.

Do not remove them blindly.

Search the entire repository for their usage first.

Similarly, review the existing `databaseHooks` that copy the credential password into `User.passwordHash`.

Prefer keeping authentication-specific credentials inside Better Auth's `Account` model rather than duplicating authentication secrets in `User`, unless the existing application has a concrete requirement for those fields.

---

# PHASE 4 — Configure Google OAuth Properly

Use Better Auth's existing:

```ts
socialProviders.google
```

configuration.

Use environment variables:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_APP_URL=
```

Do not hardcode credentials.

Configure Better Auth with the correct production base URL.

The OAuth callback should use the existing Better Auth route:

```text
/api/auth/callback/google
```

Do not create a custom Google OAuth callback unless the existing architecture absolutely requires it.

---

# PHASE 5 — Google Login Flow

Implement the Google button using Better Auth's client API.

The frontend should trigger the Better Auth social login flow rather than manually interacting with Google's OAuth APIs.

Expected flow:

```text
User clicks "Continue with Google"
        ↓
Better Auth
        ↓
Google OAuth
        ↓
User grants permission
        ↓
Google callback
        ↓
Better Auth validates OAuth response
        ↓
Find Google Account
        ↓
Find/Create User
        ↓
Create Session
        ↓
Secure authentication cookie
        ↓
CollegeEvents application
```

---

# PHASE 6 — New Google User Provisioning

When a completely new user authenticates with Google:

Google provides:

```text
name
email
profile image
provider account ID
verified identity information
```

Better Auth should create:

```text
User
Account
Session
```

The default application role should be:

```text
STUDENT
```

unless the existing application explicitly requires another role selection flow.

Do NOT automatically make Google users organizers.

Do NOT create fake academic information.

---

# PHASE 7 — Student Profile Onboarding

The existing `StudentProfile` requires:

```text
college
branch
academicYear
interests
```

Google does not provide these values.

Therefore, do NOT create an invalid StudentProfile with fake/default academic data merely to make authentication succeed.

Instead:

```text
Google Authentication
        ↓
User created
        ↓
Account created
        ↓
Session created
        ↓
Does StudentProfile exist?
        │
        ├── YES → Dashboard
        │
        └── NO → Student onboarding
```

Create or reuse an onboarding page.

The onboarding page should collect the fields required by the existing StudentProfile schema.

At minimum:

```text
College
Branch
Academic Year
Interests
```

Name, email and profile image should already come from the authenticated user where appropriate.

After successful onboarding:

```text
StudentProfile created
        ↓
Dashboard
```

Do not make authentication dependent on completing every application profile field.

Authentication and profile completion are separate responsibilities.

---

# PHASE 8 — Existing User + Google Login

This is critical.

Consider:

```text
Existing User
email = user@example.com
authentication = credentials
```

Then the same user clicks:

```text
Continue with Google
```

and Google returns:

```text
user@example.com
```

Do NOT create:

```text
User A → credentials
User B → google
```

Instead, use Better Auth's account-linking mechanism.

Expected model:

```text
User
 │
 ├── Account → credentials
 │
 └── Account → google
```

The existing:

* user ID
* role
* StudentProfile
* OrganizerProfile
* registrations
* saved events
* notifications

must remain unchanged.

Do not create a duplicate application user.

---

# PHASE 9 — Existing Google User

If:

```text
Account(providerId = "google", accountId = GOOGLE_ID)
```

already exists:

```text
Google
 ↓
Better Auth
 ↓
Existing Account
 ↓
Existing User
 ↓
Create Session
 ↓
Existing application profile
 ↓
Dashboard
```

Do not create another User or Account.

---

# PHASE 10 — Email Verification

Review the current email verification behavior.

For Google users, use Google's verified identity information appropriately.

Do not mark arbitrary email/password users as verified simply because they logged in.

Keep Google verification and credential email verification logically separate.

---

# PHASE 11 — Session Architecture

Better Auth must remain responsible for sessions.

After Google authentication:

```text
User
 ↓
Session
 ↓
Secure HTTP-only cookie
```

Use Better Auth's server-side session API for actual authentication checks.

Do not rely solely on checking whether a cookie exists.

The existing `proxy.ts` currently checks whether a Better Auth cookie exists.

Review this architecture carefully.

The proxy can be used as a lightweight route/perimeter guard, but actual authentication and authorization decisions must be validated server-side using Better Auth.

For protected server routes/pages/actions, use the authenticated session returned by Better Auth.

---

# PHASE 12 — Role-Based Authorization

Preserve the existing roles:

```text
STUDENT
ORGANIZER
SUPER_ADMIN
```

Expected behavior:

```text
STUDENT
    ↓
/dashboard
```

```text
ORGANIZER
    ↓
/admin
```

```text
SUPER_ADMIN
    ↓
/admin
```

Do not rely on client-side role checks for security.

Every protected server operation must verify:

```text
authenticated session
+
authorized role
```

---

# PHASE 13 — Organizer Flow

Do not allow Google OAuth to bypass organizer verification.

If an existing organizer logs in with Google:

```text
Google
 ↓
Existing User
 ↓
Existing OrganizerProfile
 ↓
Check verificationStatus
```

If:

```text
APPROVED
```

allow organizer access.

If:

```text
PENDING
```

send the user to:

```text
/pending-approval
```

If:

```text
REJECTED
```

do not grant organizer privileges.

Google authentication must never automatically grant organizer privileges.

---

# PHASE 14 — Database Integrity

The following relationships must remain valid:

```text
User
 ├── Session[]
 ├── Account[]
 ├── StudentProfile?
 ├── OrganizerProfile?
 ├── Notification[]
 ├── Event[]
 └── SavedEvent[]
```

Never create a StudentProfile or OrganizerProfile with fabricated required information.

Use Prisma transactions where multiple application records must be created together.

Prevent:

* duplicate users
* duplicate Google accounts
* duplicate profiles
* orphaned profiles
* orphaned authentication accounts

---

# PHASE 15 — Google Authentication Error Handling

Implement proper handling for:

```text
OAuth cancelled
OAuth denied
invalid OAuth configuration
redirect URI mismatch
existing account conflict
account linking failure
missing email
invalid callback
expired session
database failure
profile provisioning failure
```

The user should receive a clear UI message.

Do not expose:

* client secrets
* access tokens
* refresh tokens
* database errors
* stack traces

to the browser.

---

# PHASE 16 — Environment Configuration

Create/update the appropriate environment configuration.

Development:

```env
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Production:

```env
BETTER_AUTH_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Never commit secrets.

Update `.env.example` with variable names but no secrets.

---

# PHASE 17 — Google Cloud OAuth Configuration

Document the exact redirect URI required by the application.

Development:

```text
http://localhost:3000/api/auth/callback/google
```

Production:

```text
https://YOUR_DOMAIN/api/auth/callback/google
```

Do not add unnecessary localhost ports unless the application genuinely uses them.

Verify that the Google OAuth consent screen and authorized origins are configured correctly.

---

# PHASE 18 — Authentication UI

Update the existing login UI rather than creating a duplicate login page.

The Google button should:

```text
Continue with Google
```

and include:

* Google icon
* loading state
* disabled state while redirecting
* error state
* accessible label
* keyboard accessibility

The button must not manually handle Google tokens.

---

# PHASE 19 — Do Not Break Existing Authentication

Before modifying anything, identify dependencies on:

```text
email/password login
email signup
GitHub login
password reset
email verification
role-based redirects
admin authentication
student authentication
sessions
```

After implementation, verify that all existing flows still work.

Google authentication is an additional authentication method, not a replacement for email/password or GitHub.

---

# PHASE 20 — Testing

After implementation, test the following scenarios.

## Test 1 — New Google Student

```text
New Google account
 ↓
Google login
 ↓
User created
 ↓
Account created
 ↓
Session created
 ↓
Student onboarding
 ↓
StudentProfile created
 ↓
Dashboard
```

Verify PostgreSQL contains:

```text
User
Account(providerId = google)
Session
StudentProfile
```

---

## Test 2 — Existing Google Student

```text
Existing Google user
 ↓
Google login
 ↓
Existing Account found
 ↓
Existing User found
 ↓
New Session
 ↓
Dashboard
```

No duplicate User.

No duplicate Account.

No duplicate StudentProfile.

---

## Test 3 — Existing Email User

```text
Existing email/password user
 ↓
Google login using same verified email
 ↓
Account linking
 ↓
Same User ID
 ↓
Existing StudentProfile preserved
 ↓
Dashboard
```

Verify that no duplicate user is created.

---

## Test 4 — Existing Organizer

```text
Organizer
 ↓
Google login
 ↓
Existing User
 ↓
OrganizerProfile
 ↓
verificationStatus
```

Only:

```text
APPROVED
```

gets organizer privileges.

---

## Test 5 — Cancel Google Login

```text
Login
 ↓
Google
 ↓
Cancel
 ↓
Return to login
```

No User should be created.

---

## Test 6 — OAuth Failure

Verify that a failed OAuth operation does not create:

```text
orphan User
orphan Account
orphan Profile
```

---

# PHASE 21 — Migration Safety

Before changing Prisma schema:

1. Search repository usage.
2. Determine whether existing fields are actually used.
3. Create a migration.
4. Do not delete production data.
5. Verify existing users remain valid.
6. Verify existing sessions remain valid where possible.

Never perform destructive database changes just to simplify the implementation.

---

# PHASE 22 — Final Verification

After implementation run:

```bash
npm run lint
```

```bash
npm run build
```

and the appropriate Prisma validation/generation commands used by this repository.

Verify:

```text
✓ Google OAuth
✓ Email/password
✓ GitHub OAuth
✓ Account linking
✓ Sessions
✓ Student onboarding
✓ Organizer authentication
✓ Admin authorization
✓ Database integrity
✓ Production environment configuration
✓ No exposed secrets
✓ No duplicate users
✓ No duplicate accounts
✓ No orphan profiles
```

---

# IMPORTANT IMPLEMENTATION RULES

1. Do not replace Better Auth.
2. Do not introduce NextAuth/Auth.js.
3. Do not implement Google OAuth manually.
4. Do not create a GoogleUser table.
5. Do not duplicate authentication state unnecessarily.
6. Do not create fake StudentProfile data.
7. Do not bypass organizer verification.
8. Do not rely solely on the existence of a session cookie for authorization.
9. Do not break email/password authentication.
10. Do not break GitHub authentication.
11. Do not make destructive database changes without checking existing usage.
12. Do not modify unrelated parts of the application.

---

# Expected Final Architecture

```text
                         Google
                           │
                           ▼
                    Better Auth OAuth
                           │
                           ▼
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                 ┌─────────┼─────────┐
                 ▼         ▼         ▼
             Account    Session    Profile
                 │                   │
        ┌────────┼────────┐          │
        ▼        ▼        ▼          │
   credentials google  github        │
                                      │
                              ┌───────┴────────┐
                              ▼                ▼
                       StudentProfile   OrganizerProfile
                              │                │
                              ▼                ▼
                         Dashboard       Verification
```

Implement the system according to the existing repository rather than blindly following this document.

If the existing code differs from these assumptions, first adapt the architecture to the actual repository.

Before making destructive or major architectural changes, explain the issue and choose the smallest safe change that achieves the objective.

At the end, provide:

1. Files changed
2. Files created
3. Prisma schema changes
4. Environment variables required
5. Google Cloud configuration required
6. Authentication flow implemented
7. Database flow implemented
8. Tests performed
9. Build/lint result
10. Any remaining issues
