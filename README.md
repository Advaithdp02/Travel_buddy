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

## Users

**Base route:** `/api/users`  

Handles user registration, login, profiles, wishlist, follow/unfollow, and admin management.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/register` | POST | No | Register a new user |
| `/login` | POST | No | Login user and get token |
| `/profile` | GET | ✅ | Get logged-in user profile |
| `/profile` | PUT | ✅ | Update profile and upload profilePic / coverPhoto |
| `/profile/:username` | GET | ✅ | Get other user’s profile by username |
| `/follow/:username` | PUT | ✅ | Follow/unfollow a user |
| `/wishlist/add/:locationId` | PUT | ✅ | Add a location to wishlist |
| `/wishlist/remove/:locationId` | PUT | ✅ | Remove a location from wishlist |
| `/locations/track/:locationId` | PUT | Optional | Track visit to a location (logged-in or anonymous) |
| `/admin/users` | GET | ✅ + staff | Get all users (admin/staff only) |
| `/admin/users/:id/role` | PUT | ✅ + staff | Update a user’s role |
| `/admin/users/:id` | DELETE | ✅ + staff | Delete a user |

---

## Locations

**Base route:** `/api/locations`  

Handles fetching, creating, updating, deleting, and searching for locations.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Get all locations without district |
| `/district/:district` | GET | No | Get all locations in a district |
| `/:id` | GET | No | Get location by ID |
| `/nearest/:lat/:lon` | GET | No | Get nearest location by coordinates |
| `/` | POST | ✅ + staff | Create a new location with multiple images |
| `/:id` | PUT | ✅ + staff | Update location info + images |
| `/:id` | DELETE | ✅ + staff | Delete a location |

---

## Districts

**Base route:** `/api/districts`  

Handles district management, fetching, and adding locations.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Get all districts |
| `/:id` | GET | No | Get district by ID |
| `/state/:state` | GET | No | Get districts by state |
| `/:id/comments` | GET | No | Get all comments for a district |
| `/nearest/:lat/:lon` | GET | No | Get nearest district |
| `/` | POST | ✅ + admin | Create district with image |
| `/:id/location` | PUT | ✅ + admin | Add location to district |
| `/:id` | PUT | ✅ + admin | Update district info + image |

---

## Contributions

**Base route:** `/api/contributions`  

Handles user-generated content contributions with images and comments.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | ✅ | Create a new contribution with images and coverImage |
| `/user` | GET | ✅ | Get all contributions by logged-in user |
| `/location/:locationId` | GET | No | Get all verified contributions for a location |
| `/:id` | GET | No | Get single contribution by ID |
| `/verify/:id` | PUT | ✅ + staff | Verify a contribution |
| `/:id/like` | PUT | ✅ | Like/unlike a contribution |
| `/:id/comments` | GET | No | Get all comments for a contribution |
| `/:id/comments` | POST | ✅ | Add a comment to a contribution |
| `/:contribId/comments/like/:commentId` | PUT | ✅ | Like/unlike a contribution comment |
| `/district/:id` | GET | No | Get contributions for a district |
| `/` | GET | ✅ + staff | Admin: Get all contributions |
| `/:id` | DELETE | ✅ + staff | Admin: Delete contribution |

---

## Comments

**Base route:** `/api/comments`  

Handles comments, likes, and replies.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | ✅ | Add a comment |
| `/location/:locationId` | GET | No | Get all comments for a location |
| `/like/:id` | PUT | ✅ | Like/unlike a comment |
| `/reply/:id` | POST | ✅ | Add reply to a comment |
| `/district/:id` | GET | No | Get comments for a district |
| `/` | GET | ✅ + staff | Admin: Get all comments with optional filters |
| `/:id` | DELETE | ✅ + staff | Admin: Delete a comment |

---

## Tracking

**Base route:** `/api/track`  

Handles visit tracking and analytics.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | No | Track page/location visit |
| `/stats` | GET | No | Get overall analytics stats |
| `/exit` | POST | No | Record user exit |
| `/user-stats` | GET | No | Get stats for users |
| `/user-details/:userId` | GET | No | Get details of a user |
| `/location-stats` | GET | No | Get stats for locations |
| `/location-details/:location` | GET | No | Get details for a location |
| `/top-hotels` | GET | No | Get top hotels |
| `/hotel-details/:hotelId` | GET | No | Get hotel details |
| `/hotel-stats` | GET | No | Get hotel analytics |

---

## Hotels

**Base route:** `/api/hotels`  

Manages hotel data.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Get all hotels |
| `/:id` | GET | No | Get hotel by ID |
| `/nearest/:locationId` | GET | No | Get nearest hotels to a location |
| `/` | POST | ✅ + staff | Add a hotel with image |
| `/:id` | PUT | ✅ + staff | Update hotel details and image |
| `/:id` | DELETE | ✅ + staff | Delete a hotel |

---

## Blogs

**Base route:** `/api/blogs`  

Manages travel blogs and articles.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Get all blogs |
| `/:slug` | GET | No | Get a blog by slug |
| `/` | POST | ✅ + staff | Create a blog with image |
| `/:id` | PUT | ✅ + staff | Update a blog with image |
| `/:id` | DELETE | ✅ + staff | Delete a blog |

---

## Contact

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
