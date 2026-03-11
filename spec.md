# KSRP FM

## Current State
New project — no existing code.

## Requested Changes (Diff)

### Add
- Video streaming platform with short films
- User authentication: register (first name, last name, mobile number, password) and login (mobile number, password)
- Video categories: Romance, Thriller, Action
- Continue Watching: tracks partially watched videos per user and surfaces them on the home page
- Home page with featured videos, category rows, and continue watching row
- Video player page with progress tracking
- Browse/category pages to filter videos by genre
- Sample/seed video content for each category
- Premium subscription: Monthly (₹100) and Yearly (₹1000) plans
- Payment flow: show QR code for payment, user submits UTR/Transaction ID, admin verifies and grants premium
- Premium benefits: no ads, unlimited video access
- Admin panel to verify pending premium payment requests

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: user accounts (mobile + password), video catalog with genre tags, watch progress tracking per user
2. Backend APIs: register, login, listVideos, listVideosByGenre, recordProgress, getContinueWatching, getVideoById
3. Premium APIs: submitPremiumRequest (plan, utrId), verifyPremiumRequest (admin), getUserPremiumStatus, listPendingRequests (admin)
4. Frontend: auth screens, home page, category browse, video player, premium page with QR + UTR form, admin verification panel
