# Multi-Tenant Authentication Architecture Guide

This document outlines the multi-tenant authentication architecture used in this application. This setup allows for multiple client organizations (partners) to exist within a single Firebase project, each with their own isolated set of users, while still being managed centrally.

## Core Concepts

1.  **Firebase Identity Platform (Multi-Tenancy):** The foundation of this architecture is Firebase's multi-tenancy support. Each partner organization is represented as a **Tenant** in Firebase Authentication. Users belonging to a partner are created *within* that partner's tenant.

2.  **Firestore for Data Segregation:**
    *   `partners` **collection**: Stores information about each partner organization, including a crucial reference to their `tenantId`.
    *   `userMappings` **collection**: This is the key to the login flow. It's a simple lookup table that maps a user's identifier (like an email address) to their `tenantId`. This prevents us from having to search all tenants to find a user.
    *   **Data Scoping**: Most other data (like tasks, team members, etc.) should include a `partnerId` field to ensure data is correctly scoped to a specific organization's workspace.

3.  **Server-Side Logic (Genkit Flows & Actions):** All administrative actions like creating tenants and users are handled securely on the server using Genkit flows, which are wrappers around Firebase Admin SDK calls.

## Key Files & Their Roles

-   `src/ai/flows/create-tenant-flow.ts`:
    -   Handles the creation of a new partner.
    -   **Action**: Creates a new **Firebase Auth Tenant** for the organization.
    -   **Action**: Creates a corresponding document in the `partners` collection in Firestore, storing the new `tenantId`.

-   `src/ai/flows/user-management-flow.ts`:
    -   Handles creating a user *for a specific tenant*.
    -   **Action**: Uses the Admin SDK's `authForTenant(tenantId)` method to interact with the correct tenant.
    -   **Action**: Creates the user with an email and password within that tenant.
    -   **Action**: Sets custom claims on the user object (e.g., `role`, `partnerId`).
    -   **Action**: Calls `createUserMapping` to add an entry to the `userMappings` collection.

-   `src/services/tenant-service.ts`:
    -   `getTenantIdForEmail()`: The most critical function for the login flow. It queries the `userMappings` collection to find the `tenantId` associated with a user's email.
    -   `createUserMapping()`: Creates the document in `userMappings` that links an email to a `tenantId` and `partnerId`.

-   `src/app/partner/login/page.tsx`:
    -   The client-side component for the partner login form. It orchestrates the tenant-aware login process.

## Step-by-Step User Flows

### Partner Signup Flow (`/partner/signup`)

1.  A new partner provides their organization name and admin email/password.
2.  The `handleSignup` function is triggered on the client.
3.  It calls the `createTenant` Genkit flow to create the Firebase Auth Tenant and the `partners` document.
4.  It then calls the `createUserInTenant` flow, passing the `tenantId` from the previous step.
5.  `createUserInTenant` creates the user in the specified tenant, sets their custom claims (`role: 'partner_admin'`), and creates the crucial entry in the `userMappings` collection.

### Partner Login Flow (`/partner/login`)

This is where the architecture truly shines.

1.  A user enters their email and password on the login page.
2.  The `handleLogin` function calls a server action, `getTenantForEmailAction`.
3.  This action uses `getTenantIdForEmail` to perform a direct lookup in the `userMappings` collection using the user's email as the document ID. This is extremely fast and efficient.
4.  The action returns the `tenantId` to the client.
5.  **Crucially**, the client-side code sets the `tenantId` on the Firebase Auth instance: `auth.tenantId = tenantId;`.
6.  `signInWithEmailAndPassword(auth, email, password)` is called. Because the `auth` object now has a `tenantId`, Firebase knows exactly which tenant to authenticate the user against.
7.  After the sign-in attempt, `auth.tenantId` is reset to `null` to ensure it doesn't interfere with other authentication operations (like admin login).

This architecture provides a scalable, secure, and efficient way to manage multiple tenants in a single Firebase project. The `userMappings` collection is the secret sauce that makes the login process fast, as it avoids the need to iterate through all tenants to find a user.