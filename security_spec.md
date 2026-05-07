# Security Specification: WA Admin Biznet

## Data Invariants
1. Only authorized admins can read/write the `settings/businessConfig`.
2. The `whatsapp/session` is strictly internal and should only be readable/writable by the server (admin).

## The Dirty Dozen Payloads
- T1: Malicious user tries to overwrite business config to redirect sales.
- T2: Unauthorized user tries to read the WhatsApp session to hijack the connection.
... (etc)

## Test Plan
- Run tests verifying that `request.auth != null` is required for any sensitive path.
- Verify that only users in an `admins` collection can write configs.

## Bootstrapping Admin
- User Email: ideal.man.smd@gmail.com
