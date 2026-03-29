# Authentication Fix TODO

## Plan Steps (Approved)

### 1. [✅] Create TODO.md
### 2. [✅] Fix NextAuth route.ts → use admin authOptions  
### 3. [✅] Add debug logging to lib/auth.ts authorize()
### 4. [✅] Update middleware.ts with optional logging
### 5. [✅] Update next-auth.d.ts types for role
### 6. [ ] Test login /api/auth/callback/credentials
### 7. [ ] Run prisma seed for default admin
### 8. [ ] Complete - attempt_completion

**Default admin**: username=`admin`, password=`admin12345` (post-seed)
**Status**: All code fixes complete. Ready for testing + seed.


