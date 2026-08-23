# CollegeEvents — Google Authentication Verification Checklist

The Google authentication implementation has reportedly been completed.

Do NOT make new changes yet.

Your task is to **audit and verify the implementation against the actual repository**.

Do not simply report that the implementation exists because a file or function exists. Trace the complete runtime flow and verify that it actually works.

For every checklist item, mark:

* ✅ PASS — correctly implemented and verified
* ⚠️ PARTIAL — exists but has a problem or incomplete behavior
* ❌ FAIL — missing or incorrect
* ➖ N/A — genuinely not applicable

For every ⚠️ or ❌ item, provide:

1. The exact file
2. The relevant code/problem
3. Why it is a problem
4. What should be changed

---

# 1. Better Auth Configuration

Inspect:

```text
src/lib/auth.ts
```

### Checklist

* [ ] Google is configured through Better Auth `socialProviders.google`.
* [ ] `GOOGLE_CLIENT_ID` comes from environment variables.
* [ ] `GOOGLE_CLIENT_SECRET` comes from environment variables.
* [ ] Google credentials are NOT hardcoded.
* [ ] Better Auth has a correct `baseURL` / production URL configuration.
* [ ] `trustedOrigins` is configured correctly.
* [ ] Development URLs are not unnecessarily hardcoded.
* [ ] Production URLs are supported.
* [ ] Google OAuth does not use a custom/manual OAuth implementation unnecessarily.
* [ ] Better Auth remains the single authentication authority.

---

# 2. Google OAuth Client Flow

Inspect the login UI and auth client.

Search for:

```text
signIn.social
provider: "google"
authClient
Google
```

### Checklist

* [ ] Login page contains a Google login button.
* [ ] Google button calls Better Auth's social login API.
* [ ] It does NOT manually exchange Google authorization codes.
* [ ] It does NOT manually store Google access tokens in browser storage.
* [ ] It does NOT expose Google client secret to the client.
* [ ] Loading state exists while redirecting.
* [ ] Google login errors are handled.
* [ ] User can cancel Google authentication without breaking the login page.
* [ ] Button is accessible and keyboard usable.

---

# 3. Google OAuth Callback

Verify the existing Better Auth route:

```text
src/app/api/auth/[...all]/route.ts
```

### Checklist

* [ ] GET handler exists.
* [ ] POST handler exists where required by Better Auth.
* [ ] `toNextJsHandler(auth)` is correctly connected.
* [ ] Google callback reaches Better Auth.
* [ ] Callback path is:

```text
/api/auth/callback/google
```

* [ ] No duplicate custom Google callback route exists unnecessarily.
* [ ] OAuth callback errors are handled correctly.
* [ ] Redirect URI matches the Google Cloud configuration.

---

# 4. Environment Variables

Inspect:

```text
.env
.env.local
.env.example
```

and all relevant configuration.

### Checklist

* [ ] `GOOGLE_CLIENT_ID` exists.
* [ ] `GOOGLE_CLIENT_SECRET` exists.
* [ ] `BETTER_AUTH_URL` exists.
* [ ] `NEXT_PUBLIC_APP_URL` exists where required.
* [ ] Secrets are not committed to Git.
* [ ] `.env.example` contains variable names but NOT actual secrets.
* [ ] No Google client secret appears in client-side code.
* [ ] No secret is prefixed with `NEXT_PUBLIC_`.
* [ ] Production configuration uses the production domain.
* [ ] Local development configuration uses localhost.

DO NOT print actual secret values in your report.

---

# 5. Google Cloud OAuth Configuration

Verify the implementation's expected Google configuration.

Expected local callback:

```text
http://localhost:3000/api/auth/callback/google
```

Expected production callback:

```text
https://YOUR_DOMAIN/api/auth/callback/google
```

### Checklist

* [ ] Correct callback URL is documented.
* [ ] Authorized JavaScript origins are documented.
* [ ] Production callback URL is documented.
* [ ] No incorrect port is being used.
* [ ] HTTP is used only for localhost development.
* [ ] HTTPS is required for production.

If you cannot inspect the Google Cloud Console directly, clearly mark this:

```text
⚠️ MANUAL VERIFICATION REQUIRED
```

Do NOT claim Google Cloud configuration is correct without actually verifying it.

---

# 6. Database Schema

Inspect:

```text
prisma/schema.prisma
```

### Verify these models:

```text
User
Account
Session
Verification
StudentProfile
OrganizerProfile
```

### Checklist

* [ ] `User` has a unique email.
* [ ] `User` has a role.
* [ ] `User` can have multiple Accounts.
* [ ] `User` can have multiple Sessions.
* [ ] `Account` has `providerId`.
* [ ] `Account` has `accountId`.
* [ ] `Account` references `User`.
* [ ] `@@unique([providerId, accountId])` exists.
* [ ] Account cascade behavior is correct.
* [ ] Session references User.
* [ ] Session cascade behavior is correct.
* [ ] StudentProfile has a unique User relationship.
* [ ] OrganizerProfile has a unique User relationship.

---

# 7. Authentication Identity Architecture

This is one of the most important checks.

Verify that the architecture is:

```text
User
 │
 ├── Account → credentials
 ├── Account → google
 └── Account → github
```

### Checklist

* [ ] Google identity is stored in `Account`.
* [ ] Google account ID is stored in `Account.accountId`.
* [ ] Google provider is stored as `Account.providerId`.
* [ ] Google does NOT require a separate `GoogleUser` table.
* [ ] A Google login does NOT create a duplicate User for an existing user.
* [ ] One User can have credentials + Google + GitHub accounts.
* [ ] Existing StudentProfile remains attached to the same User.
* [ ] Existing OrganizerProfile remains attached to the same User.
* [ ] Existing registrations remain attached to the same StudentProfile.

---

# 8. Duplicate User Prevention

Test this carefully.

### Scenario

Existing database:

```text
User
email = test@example.com
```

User logs in with Google using:

```text
test@example.com
```

### Checklist

* [ ] Existing User is detected.
* [ ] New duplicate User is NOT created.
* [ ] Google Account is linked to the existing User when appropriate.
* [ ] Existing User ID remains unchanged.
* [ ] Existing role remains unchanged.
* [ ] Existing StudentProfile remains unchanged.
* [ ] Existing registrations remain unchanged.
* [ ] Existing saved events remain unchanged.
* [ ] Existing notifications remain unchanged.

Expected:

```text
ONE User

User
 ├── Account(credentials)
 └── Account(google)
```

NOT:

```text
User A → credentials
User B → google
```

---

# 9. New Google User Flow

Test with a Google account that has never used CollegeEvents.

Expected:

```text
Google
 ↓
Better Auth
 ↓
User created
 ↓
Account created
 ↓
Session created
 ↓
Profile onboarding
```

### Checklist

* [ ] User record is created.
* [ ] User name is populated from Google.
* [ ] User email is populated from Google.
* [ ] User profile image is populated when available.
* [ ] Google Account record is created.
* [ ] `providerId = google`.
* [ ] Correct Google account ID is stored.
* [ ] Session is created.
* [ ] Session belongs to the new User.
* [ ] Secure authentication cookie is created.
* [ ] Default role is correct.
* [ ] No fake academic information is inserted.

---

# 10. Student Onboarding

The current StudentProfile requires:

```text
college
branch
academicYear
interests
```

### Checklist

* [ ] New Google users are detected when they have no StudentProfile.
* [ ] They are redirected to onboarding.
* [ ] They are NOT sent directly to the dashboard with an incomplete profile.
* [ ] College is collected.
* [ ] Branch is collected.
* [ ] Academic year is collected.
* [ ] Interests are collected.
* [ ] Required fields are validated server-side.
* [ ] StudentProfile is created after successful submission.
* [ ] StudentProfile is linked to the correct User ID.
* [ ] Duplicate StudentProfiles cannot be created.
* [ ] After onboarding, user is redirected to dashboard.

---

# 11. Existing Student Flow

Test a user who already has:

```text
User
StudentProfile
Account
```

### Checklist

* [ ] Google login does not trigger onboarding again.
* [ ] Existing StudentProfile is detected.
* [ ] User goes directly to dashboard.
* [ ] Existing profile information is preserved.
* [ ] Existing registrations remain intact.
* [ ] Existing tickets remain intact.

---

# 12. Organizer Flow

Test an existing organizer.

### Checklist

* [ ] Google login does not change organizer role.
* [ ] Google login does not automatically create organizer privileges.
* [ ] Existing OrganizerProfile is preserved.
* [ ] `verificationStatus` is checked.
* [ ] `APPROVED` organizer can access `/admin`.
* [ ] `PENDING` organizer cannot access protected admin functionality.
* [ ] `REJECTED` organizer cannot access protected admin functionality.
* [ ] Google login cannot bypass organizer verification.

---

# 13. Session Creation

After successful Google authentication:

```text
User
 ↓
Session
 ↓
Cookie
```

### Checklist

* [ ] Better Auth creates the session.
* [ ] Session is stored in PostgreSQL.
* [ ] Session references the correct User.
* [ ] Session has an expiration time.
* [ ] Session token is unique.
* [ ] Session cookie is HTTP-only.
* [ ] Secure cookie is used in production.
* [ ] SameSite policy is appropriate.
* [ ] Session is not stored in localStorage.
* [ ] OAuth access tokens are not used as application sessions.

---

# 14. Server-Side Session Validation

Inspect:

```text
src/proxy.ts
```

and all protected server components/actions/API routes.

### IMPORTANT

Do not consider this sufficient:

```ts
request.cookies.get(...)
```

A cookie existing does NOT prove the session is valid.

### Checklist

* [ ] Proxy is treated as a lightweight routing/perimeter guard.
* [ ] Protected server operations validate the actual Better Auth session.
* [ ] `auth.api.getSession()` or the repository's equivalent is used server-side.
* [ ] Expired sessions are rejected.
* [ ] Invalid/revoked sessions are rejected.
* [ ] User identity comes from the validated session.
* [ ] User ID is not trusted from client input.
* [ ] Role is not trusted from client input.

---

# 15. Server-Side Authorization

### Checklist

For `/dashboard`:

* [ ] Authentication is required.

For `/admin`:

* [ ] Authentication is required.
* [ ] Role is checked server-side.
* [ ] STUDENT cannot access organizer functionality.
* [ ] ORGANIZER can access only permitted organizer functionality.
* [ ] SUPER_ADMIN has appropriate privileges.

For sensitive API/server actions:

* [ ] Session is validated.
* [ ] User ID comes from session.
* [ ] Role is checked server-side.
* [ ] Client-provided role is ignored.

---

# 16. Account Linking

Inspect:

```text
account.accountLinking
```

### Checklist

* [ ] Account linking is enabled intentionally.
* [ ] Trusted providers are explicitly configured.
* [ ] Google is treated as a trusted provider.
* [ ] GitHub behavior is preserved.
* [ ] Linking cannot result in duplicate Users.
* [ ] Linking preserves the existing User ID.
* [ ] Linking preserves application profiles.
* [ ] Linking preserves registrations and tickets.

---

# 17. Email/Password Authentication Regression

Google implementation must not break existing authentication.

### Test:

```text
email + password
```

### Checklist

* [ ] Signup still works.
* [ ] Login still works.
* [ ] Password hashing still works.
* [ ] Password reset still works.
* [ ] Email verification behavior still works.
* [ ] Existing users can still log in.
* [ ] Existing sessions still work.
* [ ] No credential data is exposed to the client.

---

# 18. GitHub Authentication Regression

### Checklist

* [ ] GitHub login still works.
* [ ] GitHub Account is stored correctly.
* [ ] Existing GitHub users are recognized.
* [ ] GitHub does not create duplicate Users.
* [ ] GitHub + Google can coexist for the same User.
* [ ] GitHub + credentials can coexist where intended.

---

# 19. Database Transaction Safety

For any custom provisioning logic:

### Checklist

* [ ] User creation and related application provisioning are handled safely.
* [ ] Prisma transactions are used where appropriate.
* [ ] Failed profile creation does not leave broken application state.
* [ ] Failed onboarding does not delete a valid authentication identity.
* [ ] Retry does not create duplicate profiles.
* [ ] OAuth retry does not create duplicate Users.
* [ ] OAuth retry does not create duplicate Accounts.

---

# 20. Security Audit

### Checklist

* [ ] No client secret in client code.
* [ ] No access token in console logs.
* [ ] No refresh token in console logs.
* [ ] No password hash exposed to client.
* [ ] No session token exposed to client JavaScript.
* [ ] No sensitive OAuth information in URL parameters after callback.
* [ ] HTTPS is used in production.
* [ ] Secure cookies are enabled in production.
* [ ] HTTP-only cookies are used.
* [ ] CSRF/trusted-origin protection is handled by Better Auth.
* [ ] Open redirect vulnerabilities are not introduced through callback URLs.
* [ ] Arbitrary `callbackUrl` values cannot redirect users to malicious external domains.
* [ ] Role cannot be changed through client requests.
* [ ] User ID cannot be changed through client requests.

---

# 21. Prisma Migration

### Checklist

* [ ] Prisma schema is valid.
* [ ] Migration exists for actual schema changes.
* [ ] Migration is not unnecessarily destructive.
* [ ] Existing authentication data is preserved.
* [ ] Existing User records remain valid.
* [ ] Existing Account records remain valid.
* [ ] Existing Session records remain valid where expected.
* [ ] Existing StudentProfiles remain valid.
* [ ] `npx prisma generate` succeeds.
* [ ] Database migration succeeds.

---

# 22. Build Verification

Run the project's actual commands.

At minimum:

```bash
npm run lint
```

```bash
npm run build
```

and:

```bash
npx prisma validate
```

```bash
npx prisma generate
```

If the project has tests:

```bash
npm test
```

or the appropriate test command.

### Checklist

* [ ] Lint passes.
* [ ] TypeScript passes.
* [ ] Prisma validation passes.
* [ ] Prisma client generation passes.
* [ ] Production build passes.
* [ ] Tests pass.
* [ ] No new critical warnings.
* [ ] No auth-related build errors.

Include the actual command output/result in the report.

---

# 23. Manual End-to-End Test

Do not mark the implementation complete without manually testing the real application.

Perform these tests:

### Test A

```text
New Google account
→ Google login
→ User created
→ Account created
→ Session created
→ Onboarding
→ StudentProfile created
→ Dashboard
```

### Test B

```text
Existing Google account
→ Login
→ Existing User
→ Existing Account
→ New Session
→ Dashboard
```

### Test C

```text
Existing email/password account
→ Google login with same verified email
→ Account linking
→ Same User
→ Existing StudentProfile
→ Dashboard
```

### Test D

```text
Existing organizer
→ Google login
→ OrganizerProfile
→ verificationStatus checked
→ Correct admin/pending behavior
```

### Test E

```text
Google login
→ Cancel
→ Login page
→ No broken session
→ No orphan User
```

---

# 24. Database Verification

After each relevant test, inspect PostgreSQL.

For a new Google user, verify:

```text
User
 ├── id
 ├── name
 ├── email
 ├── image
 ├── emailVerified
 └── role

Account
 ├── providerId = google
 ├── accountId = Google account ID
 └── userId = User.id

Session
 └── userId = User.id
```

After onboarding:

```text
StudentProfile
 └── userId = User.id
```

Confirm that there is exactly:

```text
1 User
1 Google Account
1 active/relevant Session
1 StudentProfile
```

for a new student.

---

# 25. Final Report Format

After completing the audit, DO NOT simply say:

> "Everything is implemented correctly."

Instead produce this table:

| Area               | Status | Evidence | Problem | Required Action |
| ------------------ | ------ | -------- | ------- | --------------- |
| Better Auth        |        |          |         |                 |
| Google OAuth       |        |          |         |                 |
| Callback           |        |          |         |                 |
| Database           |        |          |         |                 |
| Account Linking    |        |          |         |                 |
| New User           |        |          |         |                 |
| Existing User      |        |          |         |                 |
| Student Onboarding |        |          |         |                 |
| Organizer          |        |          |         |                 |
| Sessions           |        |          |         |                 |
| Proxy              |        |          |         |                 |
| Authorization      |        |          |         |                 |
| Security           |        |          |         |                 |
| Prisma             |        |          |         |                 |
| Build              |        |          |         |                 |
| Tests              |        |          |         |                 |

Then provide:

## Critical Issues

List only issues that must be fixed before considering Google authentication production-ready.

## Warnings

List issues that are not immediately blocking but should be addressed.

## Manual Verification Required

List anything that cannot be verified from the repository, especially Google Cloud Console configuration.

## Final Verdict

Choose exactly one:

```text
PRODUCTION READY
```

```text
READY AFTER MINOR FIXES
```

```text
NOT READY
```

Do not mark it `PRODUCTION READY` if the real Google login flow or database flow has not been tested.

Do not modify the code during this audit unless explicitly instructed.

The purpose of this task is to **verify the implementation, not rewrite it**.
