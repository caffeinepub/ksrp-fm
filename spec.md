# KSRP FM

## Current State
The app has a Navbar with nav links (Home, Romance, Thriller, Action), Admin Power Mode, and a user avatar dropdown. The Admin Panel has tabs: All Users, Payment Requests, Videos, Payment Settings.

## Requested Changes (Diff)

### Add
- Help Desk button in the navbar (visible to all)
- Help Desk dialog/form with fields: Name, Phone Number, Problem (open to anyone)
- Backend: HelpDeskRequest type, submitHelpDeskRequest function (no auth required), listHelpDeskRequests function (admin only)
- Admin Panel: "Help Desk Records" tab after the Videos tab showing all submitted requests

### Modify
- Navbar: remove genre/home nav links from the top nav area; keep only View My Profile (in avatar dropdown when logged in), Admin Power Mode, and Help Desk as the visible action items
- backend.d.ts: add HelpDeskRequest interface and new methods
- useQueries.ts: add useSubmitHelpDeskRequest and useListHelpDeskRequests hooks

### Remove
- Home, Romance, Thriller, Action nav links from the main navigation bar

## Implementation Plan
1. Add HelpDeskRequest type and helpdesk functions to main.mo
2. Update backend.d.ts with new types and methods
3. Add helpdesk hooks to useQueries.ts
4. Update Navbar.tsx: remove genre nav links, add Help Desk button that opens a dialog
5. Update AdminPage.tsx: add Help Desk Records tab after Videos tab
