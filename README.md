# TravelBuddy Backend Documentation

Welcome to the **TravelBuddy** backend documentation. TravelBuddy is a web application that allows users to explore destinations, hotels, and districts nearby, share contributions, post comments, and track visits. This document describes all available API endpoints, authentication requirements, and functionality.

---

## Base URL

http://http://3.108.235.83:3000/api


---
# TravelBuddy Backend - Environment Variables Example

This file provides an example of environment variables used in the TravelBuddy backend.  
Rename this file to `.env` in your local setup and replace the values with your actual credentials.

---

## MongoDB
```env
JWT_SECRET=
EMAIL_PASS=
EMAIL_USER=
BUCKET_SECRET_KEY=
BUCKET_ACCESS_KEY=
BUCKET_REGION=
BUCKET_NAME=
GOOGLE_API_KEY=
PORT=
MONGO_URI=
```
## Schema

[![ER Diagram](./db.png)]

## Table of Contents

1. [Users](#users)
2. [Locations](#locations)
3. [Districts](#districts)
4. [Contributions](#contributions)
5. [Comments](#comments)
6. [Tracking](#tracking)
7. [Hotels](#hotels)
8. [Blogs](#blogs)
9. [Contact](#contact)

---


---

## Users

**Base route:** `/api/users`  

Handles user registration, login, profiles, wishlist, follow/unfollow, password reset, and admin management.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/register` | POST | No | Register a new user |
| `/login` | POST | No | Login user and get token |
| `/profile` | GET | ✅ | Get logged-in user profile |
| `/profile` | PUT | ✅ | Update profile (supports `profilePic` and `coverPhoto` uploads) |
| `/profile/:username` | GET | ✅ | Get another user's profile by username |
| `/follow/:username` | PUT | ✅ | Follow or unfollow a user |
| `/wishlist/add/:locationId` | PUT | ✅ | Add a location to wishlist |
| `/wishlist/remove/:locationId` | PUT | ✅ | Remove a location from wishlist |
| `/wishlist` | GET | ✅ | Get user's wishlist |
| `/locations/track/:locationId` | PUT | Optional | Track a location visit (supports logged-in & anonymous) |
| `/admin/users` | GET | ✅ + staff | Get all users (admin/staff only) |
| `/admin/users/:id/role` | PUT | ✅ + staff | Update a user's role |
| `/admin/users/:id` | DELETE | ✅ + staff | Delete a user |
| `/forgot-password` | POST | No | Request password reset OTP |
| `/verify-otp` | POST | No | Verify password reset OTP |
| `/reset-password` | POST | No | Reset password with OTP verification |

---

## Locations

**Base route:** `/api/locations`  

Handles fetching, creating, updating, deleting, and nearby location features.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Get all locations (no district filter) |
| `/district/:district` | GET | No | Get all locations by district name |
| `/:id` | GET | No | Get location by ID |
| `/nearest/:lat/:lon` | GET | No | Get nearest location by coordinates |
| `/` | POST | ✅ + staff | Create new location (with multiple images) |
| `/:id` | PUT | ✅ + staff | Update location info (with images) |
| `/:id` | DELETE | ✅ + staff | Delete a location |

---

## Districts

**Base route:** `/api/districts`  

Handles district data, including adding locations and retrieving comments.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Get all districts |
| `/:id` | GET | No | Get district by ID |
| `/state/:state` | GET | No | Get districts by state name |
| `/:id/comments` | GET | No | Get all comments related to a district |
| `/nearest/:lat/:lon` | GET | No | Get nearest district by coordinates |
| `/` | POST | ✅ + admin | Create new district (with image upload) |
| `/:id/location` | PUT | ✅ + admin | Add location to district |
| `/:id` | PUT | ✅ + admin | Update district info and image |

---

## Contributions

**Base route:** `/api/contributions`  

Handles user-submitted content such as reviews, experiences, and photos.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | ✅ | Create a new contribution (supports multiple images & cover image) |
| `/user` | GET | ✅ | Get contributions created by logged-in user |
| `/location/:locationId` | GET | No | Get verified contributions for a specific location |
| `/:id` | GET | No | Get single contribution by ID |
| `/verify/:id` | PUT | ✅ + staff | Verify a contribution |
| `/:id/like` | PUT | ✅ | Like or unlike a contribution |
| `/:id/comments` | GET | No | Get all comments for a contribution |
| `/:id/comments` | POST | ✅ | Add a comment to a contribution |
| `/:contribId/comments/like/:commentId` | PUT | ✅ | Like/unlike a comment on a contribution |
| `/district/:id` | GET | No | Get contributions filtered by district |
| `/` | GET | ✅ + staff | Get all contributions (staff/admin only) |
| `/:id` | DELETE | ✅ + staff | Delete a contribution (admin/staff only) |

---

## Comments

**Base route:** `/api/comments`  

Manages user comments, likes, replies, and moderation.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | ✅ | Add a new comment |
| `/location/:locationId` | GET | No | Get all comments for a specific location |
| `/like/:id` | PUT | ✅ | Like or unlike a comment |
| `/reply/:id` | POST | ✅ | Add a reply to a comment |
| `/reply/:commentId/:replyId` | DELETE | ✅ | Delete a specific reply |
| `/district/:id` | GET | No | Get all comments for a district |
| `/` | GET | ✅ + staff | Get all comments (with optional district/location filters) |
| `/:id` | DELETE | ✅ + staff | Delete a comment (admin/staff only) |

---

## Tracking

**Base route:** `/api/track`  

Tracks page visits, user engagement, and analytics.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | No | Track a page or location visit |
| `/stats` | GET | No | Get overall analytics |
| `/user-stats` | GET | No | Get user visit statistics |
| `/user-details/:userId` | GET | No | Get detailed stats for a specific user |
| `/location-stats` | GET | No | Get stats for all locations |
| `/location-details/:location` | GET | No | Get detailed analytics for a location |
| `/top-hotels` | GET | No | Get top-rated or most-visited hotels |
| `/hotel-details/:hotelId` | GET | No | Get detailed stats for a hotel |
| `/hotel-stats` | GET | No | Get overall hotel analytics |
| `/exit` | POST | No | Record a user exit event |

---

## Hotels

**Base route:** `/api/hotels`  

Handles hotel data management, retrieval, and nearby hotel search.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Get all hotels |
| `/:id` | GET | No | Get hotel by ID |
| `/nearest/:locationId` | GET | No | Get nearby hotels for a location |
| `/` | POST | ✅ + staff | Create a hotel with image |
| `/:id` | PUT | ✅ + staff | Update hotel info and image |
| `/:id` | DELETE | ✅ + staff | Delete a hotel entry |

---

## Blogs

**Base route:** `/api/blogs`  

Handles creation, editing, and viewing of travel blogs and articles.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Get all blogs |
| `/:slug` | GET | No | Get blog by slug |
| `/` | POST | ✅ + staff | Create a new blog (with image upload) |
| `/:id` | PUT | ✅ + staff | Update a blog (with image) |
| `/:id` | DELETE | ✅ + staff | Delete a blog |

---

## Contact

**Base route:** `/api/contact`  

Handles user contact messages and OTP verification.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | No | Send a contact message |
| `/send-otp` | POST | No | Send OTP to user’s phone/email |
| `/verify-otp` | POST | No | Verify OTP for contact or feedback form |

---


**Base route:** `/api/contact`  

Handles user inquiries and OTP verification.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | No | Send a contact message |
| `/send-otp` | POST | No | Send OTP to phone/email |
| `/verify-otp` | POST | No | Verify OTP |

---

## Authentication

- **JWT-based authentication** using `protect` middleware.
- **Role-based access** using `staffProtect` and `adminProtect`.
- Public routes do not require authentication.
- Admin/staff routes require both login and elevated role.

---

## File Uploads

- All image uploads use **Multer memory storage** for in-memory processing.
- Multiple images supported for locations and contributions (`maxCount: 10`).
- Single images for district, hotels, and blogs.

---

## Notes

- Track endpoints can handle anonymous users.
- Contributions and comments can be liked/unliked.
- Users can follow/unfollow each other.
- Wishlist allows adding/removing favorite locations.
- Location search supports nearest coordinates queries.

---

**TravelBuddy Backend** is designed to support a fully-featured travel exploration app with rich user-generated content, analytics, and admin moderation capabilities.
