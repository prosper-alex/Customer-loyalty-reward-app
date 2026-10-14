## 🌐 API Documentation

The Customer Loyalty App backend provides REST API endpoints for authentication, user management, products, purchases, loyalty points, rewards, favorites, and notifications.

The API uses JWT-based authentication for protected endpoints and role-based authorization for administrative operations.

**Production API Base URL:**
https://customer-loyalty-reward-app-uldx.onrender.com/api

For detailed endpoint documentation, including HTTP methods, access requirements, request bodies, response formats, and error handling, see the [API Documentation](./API_DOCUMENTATION.md).

### Main API Routes

| Route                | Purpose                                |
| -------------------- | -------------------------------------- |
| `/api/auth`          | Authentication and user management     |
| `/api/products`      | Product management                     |
| `/api/purchases`     | Purchase records and purchase history  |
| `/api/points`        | Loyalty points and transaction history |
| `/api/rewards`       | Rewards and redemption                 |
| `/api/favorites`     | Favorite products                      |
| `/api/notifications` | User notifications                     |


### Technologies

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JSON Web Tokens (JWT)
* bcryptjs
* Cloudinary for profile photo uploads

---

## 2. Authentication and Authorization

Most API endpoints require authentication using a JWT access token.

Include the token in the request header:

`Authorization: Bearer <your_token>`

### User roles

| Role  | Permissions                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| USER  | Manage own account, view available products, purchase products, earn points, redeem rewards, manage favorites, and manage personal notifications. |
| ADMIN | Manage products and rewards, view users and purchase histories, and access administrative records.                                                |

An authenticated user can access only the resources permitted by their role and the endpoint's ownership checks.

### Common HTTP status codes

| Status | Meaning                                          |
| ------ | ------------------------------------------------ |
| 200    | Request completed successfully                   |
| 201    | Resource created successfully                    |
| 400    | Invalid input or request                         |
| 401    | Authentication failed or credentials are invalid |
| 403    | Access denied or account inactive                |
| 404    | Requested resource not found                     |
| 409    | Conflict, such as a duplicate resource           |
| 500    | Internal server error                            |

Exact responses depend on the endpoint and the error encountered.

---

# 3. Authentication and User Management API

**Prefix:** `/api/auth`

### 3.1 Register a user

**Endpoint:** `POST /api/auth/createUser`

**Access:** Public

Creates a customer account.

**Request body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "password": "SecurePass123",
  "referralCode": "ABC123"
}
```

`referralCode` is optional.

**Successful response:** `201 Created`

Returns the user's account information, including the user ID, name, email, phone number, role, account status, email verification status, and points balance.

**Possible errors:**

* `400` — Required fields are missing or invalid.
* `409` — Email address or phone number is already registered.
* `500` — Account creation failed.

**Note:** Email verification endpoints are currently commented out in the backend routes. Registration should not be documented as requiring a completed email verification step.

### 3.2 Log in

**Endpoint:** `POST /api/auth/loginUser`

**Access:** Public

**Request body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Successful response:** `200 OK`

Returns a JWT token and basic user information.

**Possible errors:**

* `400` — Required credentials are missing.
* `401` — Invalid email or password.
* `403` — Account is inactive.
* `500` — Login failed.

### 3.3 Request a password reset

**Endpoint:** `POST /api/auth/forgotPassword`

**Access:** Public

**Request body:**

```json
{
  "email": "john@example.com"
}
```

Requests a password-reset code. The code expires after 10 minutes.

The endpoint returns a generic success response even when an account is not found, helping to prevent account enumeration.

### 3.4 Reset a password

**Endpoint:** `POST /api/auth/resetPassword`

**Access:** Public

**Request body:**

```json
{
  "email": "john@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}
```

**Successful response:** `200 OK`

The password is updated, and the reset code is cleared.

**Possible errors:**

* `400` — Missing fields, invalid or expired code, or password validation failure.
* `404` — Account not found, where applicable.
* `500` — Password reset failed.

### 3.5 Get the current user's profile

**Endpoint:** `GET /api/auth/getUser`

**Access:** Authenticated user

Returns the authenticated user's profile, including account information, role, points balance, total points earned, email verification status, profile photo, and referral code.

### 3.6 Get all users

**Endpoint:** `GET /api/auth/getAllUsers`

**Access:** ADMIN

Returns the registered users without exposing their password hashes.

### 3.7 Update a user profile

**Endpoint:** `PATCH /api/auth/updateUser`

**Access:** Authenticated user

Updates permitted profile fields.

**Request body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "08098765432"
}
```

Only the fields being changed need to be included.

**Possible errors:**

* `400` — Invalid fields or no valid update provided.
* `409` — Phone number already in use.
* `500` — Update failed.

### 3.8 Change password

**Endpoint:** `PATCH /api/auth/changePassword`

**Access:** Authenticated user

**Request body:**

```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass123"
}
```

The current password must be correct, the new password must meet the minimum length requirement, and the new password must differ from the current password.

### 3.9 Deactivate the current user's account

**Endpoint:** `PATCH /api/auth/deactivateAccount`

**Access:** USER

Deactivates the authenticated user's account by setting `isActive` to `false`.

### 3.10 Deactivate another user

**Endpoint:** `PATCH /api/auth/deactivateUser/:id`

**Access:** ADMIN

Deactivates the user identified by `:id`.

### 3.11 Reactivate a user

**Endpoint:** `PATCH /api/auth/activateUser/:id`

**Access:** ADMIN

Reactivates the specified user account.

### 3.12 Upload a profile photo

**Endpoint:** `PATCH /api/auth/uploadProfilePhoto`

**Access:** Authenticated user

Uses `multipart/form-data`.

**File field:** `profilePhoto`

The uploaded image is stored using Cloudinary, and the resulting secure URL is saved to the user's profile.

---

# 4. Product Management API

**Prefix:** `/api/products`

### Product fields

| Field                   | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `name`                  | Product name                                     |
| `size`                  | Optional product size                            |
| `description`           | Product description                              |
| `price`                 | Product price                                    |
| `quantity`              | Available stock                                  |
| `points`                | Loyalty points awarded per unit                  |
| `isAvailable`           | Whether the product is available                 |
| `isManuallyDeactivated` | Whether an administrator manually deactivated it |

### 4.1 Create a product

**Endpoint:** `POST /api/products/createProduct`

**Access:** ADMIN

**Request body:**

```json
{
  "name": "Banana Flavoured Ice-Cream",
  "size": "Medium",
  "description": "Creamy banana-flavoured ice-cream.",
  "price": 10000,
  "quantity": 100,
  "points": 50
}
```

**Successful response:** `201 Created`

Returns the newly created product.

### 4.2 Get all products

**Endpoint:** `GET /api/products/getAllProducts`

**Access:** USER, ADMIN

* USER receives available products with stock greater than zero.
* ADMIN can retrieve all products, including unavailable products.

### 4.3 Get a product by ID

**Endpoint:** `GET /api/products/getProduct/:id`

**Access:** USER, ADMIN

Returns the specified product.

### 4.4 Update a product

**Endpoint:** `PATCH /api/products/updateProduct/:id`

**Access:** ADMIN

Updates permitted product fields.

**Example request body:**

```json
{
  "price": 12000,
  "quantity": 80,
  "points": 60
}
```

The controller validates numeric values and duplicate product names. Availability is updated based on stock and manual deactivation status.

### 4.5 Deactivate a product

**Endpoint:** `PATCH /api/products/deactivateProduct/:id`

**Access:** ADMIN

Marks the product as manually deactivated and unavailable.

### 4.6 Reactivate a product

**Endpoint:** `PATCH /api/products/reactivateProduct/:id`

**Access:** ADMIN

Reactivates a product only if its quantity is greater than zero.

### 4.7 Delete a product

**Endpoint:** `DELETE /api/products/deleteProduct/:id`

**Access:** ADMIN

Permanently deletes the specified product.

### Product API errors

Depending on the endpoint:

* `400` — Invalid input or invalid numeric values.
* `404` — Product not found.
* `409` — Duplicate product name.
* `500` — Operation failed.

---

# 5. Purchase Management API

**Prefix:** `/api/purchases`

All purchase routes require authentication.

### 5.1 Create a purchase

**Endpoint:** `POST /api/purchases/createPurchase`

**Access:** USER

**Request body:**

```json
{
  "productId": "PRODUCT_OBJECT_ID",
  "quantity": 2
}
```

The controller validates the product ID, quantity, product availability, and available stock.

The application calculates:

* **Total price:** Product price multiplied by quantity.
* **Points earned:** Product points multiplied by quantity.

The purchase workflow uses a database transaction to coordinate purchase creation, stock reduction, loyalty point updates, and related records.

If the user qualifies for a referral bonus, the first-purchase referral conditions are checked and the applicable bonus is recorded.

**Successful response:** `201 Created`

Returns purchase details, the points transaction, the updated points balance, total points earned, and quantity information.

**Possible errors:**

* `400` — Invalid product ID, invalid quantity, unavailable product, or insufficient stock.
* `404` — Product or user not found.
* `500` — Purchase could not be completed.

### 5.2 Get the current user's purchase history

**Endpoint:** `GET /api/purchases/getMyPurchaseHistory`

**Access:** USER

Returns the authenticated user's purchases, ordered from newest to oldest.

### 5.3 Get all purchase histories

**Endpoint:** `GET /api/purchases/getAllPurchaseHistory`

**Access:** ADMIN

Returns purchase records with relevant user and product information.

### 5.4 Get a customer's purchase history

**Endpoint:** `GET /api/purchases/getCustomerPurchaseHistory/:id`

**Access:** ADMIN

Returns purchase history for the specified user.

### 5.5 Get a purchase by ID

**Endpoint:** `GET /api/purchases/getPurchaseById/:id`

**Access:** USER, ADMIN

Returns the specified purchase.

A USER may retrieve only their own purchase. An ADMIN may retrieve purchases across users.

**Possible errors:**

* `403` — A user attempts to access another user's purchase.
* `404` — Purchase or specified user not found.
* `500` — Retrieval failed.

---

# 6. Loyalty Points API

**Prefix:** `/api/points`

All points routes require authentication.

### Points transaction fields

A points transaction records the user, transaction type, points amount, description, and optional associated purchase.

Transaction types include:

* `Earned`
* `Redeemed`
* `Adjusted`

### 6.1 Get my points history

**Endpoint:** `GET /api/points/getMyPointsHistory`

**Access:** USER

Returns the authenticated user's points transaction history, including relevant purchase information where available.

### 6.2 Get all points histories

**Endpoint:** `GET /api/points/getAllPointsHistory`

**Access:** ADMIN

Returns points transactions across users, with relevant user and purchase information.

### Points calculation

Points are awarded according to the product's configured points value and the quantity purchased.

For example, purchasing two units of a product worth 50 points per unit earns:

`50 × 2 = 100 points`

The points balance is updated as part of the purchase workflow.

Redeeming a reward deducts the required points and records a `Redeemed` points transaction.

---

# 7. Rewards and Redemption API

**Prefix:** `/api/rewards`

### Reward fields

| Field            | Description                     |
| ---------------- | ------------------------------- |
| `name`           | Reward name                     |
| `description`    | Reward description              |
| `pointsRequired` | Points required for redemption  |
| `quantity`       | Available reward stock          |
| `isAvailable`    | Whether the reward is available |
| `featured`       | Whether the reward is featured  |

### 7.1 Create a reward

**Endpoint:** `POST /api/rewards/createReward`

**Access:** ADMIN

**Request body:**

```json
{
  "name": "Free Coffee",
  "description": "Redeem points for a free coffee.",
  "pointsRequired": 100,
  "quantity": 20,
  "featured": true
}
```

`featured` is optional and defaults to `false`.

The reward must have a positive stock quantity to be featured.

**Successful response:** `201 Created`

Returns the created reward. The controller also attempts to notify active users about newly created rewards.

### 7.2 Get available rewards

**Endpoint:** `GET /api/rewards/getRewards`

**Access:** USER

Returns available rewards with stock greater than zero, ordered by points required.

### 7.3 Get all rewards

**Endpoint:** `GET /api/rewards/getAllRewards`

**Access:** ADMIN

Returns all rewards, including unavailable rewards.

### 7.4 Redeem a reward

**Endpoint:** `POST /api/rewards/redeemReward`

**Access:** USER

**Request body:**

```json
{
  "rewardId": "REWARD_OBJECT_ID"
}
```

The controller checks reward availability, stock, and the user's points balance.

A successful redemption:

1. Reserves one unit of reward stock.
2. Deducts the required points.
3. Creates a redemption record.
4. Creates a points transaction of type `Redeemed`.
5. Updates reward availability when stock is exhausted.
6. Attempts to notify the user.

The redemption workflow uses a database transaction to coordinate the related changes.

**Successful response:** `201 Created`

Returns the redemption record, points transaction, reward name, points used, remaining points, and remaining reward quantity.

**Possible errors:**

* `400` — Invalid request, unavailable reward, insufficient points, or no stock.
* `404` — Reward or user not found.
* `409` — Transaction conflict.
* `500` — Redemption failed.

### 7.5 Get my redemption history

**Endpoint:** `GET /api/rewards/getMyRedemptionHistory`

**Access:** USER

Returns the authenticated user's redemption history.

### 7.6 Get all redemption histories

**Endpoint:** `GET /api/rewards/getAllRedemptionHistory`

**Access:** ADMIN

Returns redemption records across users, with relevant user and reward information.

### 7.7 Deactivate a reward

**Endpoint:** `PATCH /api/rewards/deactivateReward/:id`

**Access:** ADMIN

Marks the specified reward as unavailable and removes its featured status.

### 7.8 Reactivate a reward

**Endpoint:** `PATCH /api/rewards/reactivateReward/:id`

**Access:** ADMIN

Reactivates a reward only if stock is available.

### 7.9 Toggle a reward's featured status

**Endpoint:** `PATCH /api/rewards/toggleFeatured/:id`

**Access:** ADMIN

Changes the reward's featured status, subject to availability and stock restrictions.

### 7.10 Get featured rewards

**Endpoint:** `GET /api/rewards/featured`

**Access:** USER

Returns featured rewards that are available and have stock greater than zero.

---

# 8. Favorites API

**Prefix:** `/api/favorites`

All favorites routes require authentication and the `USER` role.

### 8.1 Add a product to favorites

**Endpoint:** `POST /api/favorites/:productId`

**Access:** USER

Adds the specified product to the authenticated user's favorites.

**Possible errors:**

* `400` — Product is already in favorites or the request is invalid.
* `404` — Product not found.

### 8.2 Get favorites

**Endpoint:** `GET /api/favorites`

**Access:** USER

Returns the authenticated user's favorite products, with product information populated.

### 8.3 Remove a product from favorites

**Endpoint:** `DELETE /api/favorites/:productId`

**Access:** USER

Removes the specified product from the authenticated user's favorites.

---

# 9. Notifications API

**Prefix:** `/api/notifications`

All notification endpoints require authentication.

Notifications belong to individual users and include a title, optional body, read status, and timestamps.

### 9.1 Get my notifications

**Endpoint:** `GET /api/notifications/getMyNotifications`

**Access:** Authenticated user

Returns the authenticated user's notifications, ordered from newest to oldest.

### 9.2 Mark all notifications as read

**Endpoint:** `PATCH /api/notifications/markAllNotificationsRead`

**Access:** Authenticated user

Marks the authenticated user's notifications as read.

### 9.3 Mark one notification as read

**Endpoint:** `PATCH /api/notifications/markNotificationRead/:id`

**Access:** Authenticated user

Marks the specified notification as read, provided it belongs to the authenticated user.

**Possible errors:**

* `404` — Notification not found or not accessible to the current user.
* `500` — Update failed.

### 9.4 Delete read notifications

**Endpoint:** `DELETE /api/notifications/deleteReadNotifications`

**Access:** Authenticated user

Deletes read notifications belonging to the authenticated user. It does not delete other users' notifications.

---

# 10. General Request and Response Guidelines

### JSON requests

For JSON request bodies, include:

`Content-Type: application/json`

The profile photo upload endpoint instead uses `multipart/form-data`.

### Authentication

For protected endpoints, include:

`Authorization: Bearer <your_token>`

The token is obtained through a successful login.

### Response structure

Response formats vary by endpoint. Many successful responses use fields such as:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

This is an illustrative format; consult each endpoint's implementation for its exact response structure.

### Validation

The API validates relevant fields, including required values, numeric limits, identifiers, stock quantities, and points balances.

### Error handling

Errors are returned with appropriate HTTP status codes and messages based on the endpoint and the type of failure.

---

# 11. Important Implementation Notes

* Email verification and resend-verification routes are currently commented out and are not active public endpoints.
* Password recovery uses a time-limited reset code.
* Product and reward availability depends on stock and administrative status.
* Purchases and redemptions update associated records using database transactions.
* Purchase and redemption notifications are attempted after the primary transaction completes; a notification failure does not undo the completed operation.
* User-facing routes are protected by authentication and role checks where configured.
* Individual purchase retrieval includes an ownership check for USER accounts.

---

# 12. API Endpoint Summary

| Area                | Method | Endpoint                                        | Access        |
| ------------------- | ------ | ----------------------------------------------- | ------------- |
| Authentication      | POST   | `/api/auth/createUser`                          | Public        |
| Authentication      | POST   | `/api/auth/loginUser`                           | Public        |
| Password recovery   | POST   | `/api/auth/forgotPassword`                      | Public        |
| Password recovery   | POST   | `/api/auth/resetPassword`                       | Public        |
| User profile        | GET    | `/api/auth/getUser`                             | Authenticated |
| User management     | GET    | `/api/auth/getAllUsers`                         | ADMIN         |
| User profile        | PATCH  | `/api/auth/updateUser`                          | Authenticated |
| Password management | PATCH  | `/api/auth/changePassword`                      | Authenticated |
| Account management  | PATCH  | `/api/auth/deactivateAccount`                   | USER          |
| User management     | PATCH  | `/api/auth/deactivateUser/:id`                  | ADMIN         |
| User management     | PATCH  | `/api/auth/activateUser/:id`                    | ADMIN         |
| Profile photo       | PATCH  | `/api/auth/uploadProfilePhoto`                  | Authenticated |
| Products            | POST   | `/api/products/createProduct`                   | ADMIN         |
| Products            | GET    | `/api/products/getAllProducts`                  | USER, ADMIN   |
| Products            | GET    | `/api/products/getProduct/:id`                  | USER, ADMIN   |
| Products            | PATCH  | `/api/products/updateProduct/:id`               | ADMIN         |
| Products            | PATCH  | `/api/products/deactivateProduct/:id`           | ADMIN         |
| Products            | PATCH  | `/api/products/reactivateProduct/:id`           | ADMIN         |
| Products            | DELETE | `/api/products/deleteProduct/:id`               | ADMIN         |
| Purchases           | POST   | `/api/purchases/createPurchase`                 | USER          |
| Purchases           | GET    | `/api/purchases/getMyPurchaseHistory`           | USER          |
| Purchases           | GET    | `/api/purchases/getAllPurchaseHistory`          | ADMIN         |
| Purchases           | GET    | `/api/purchases/getCustomerPurchaseHistory/:id` | ADMIN         |
| Purchases           | GET    | `/api/purchases/getPurchaseById/:id`            | USER, ADMIN   |
| Points              | GET    | `/api/points/getMyPointsHistory`                | USER          |
| Points              | GET    | `/api/points/getAllPointsHistory`               | ADMIN         |
| Rewards             | POST   | `/api/rewards/createReward`                     | ADMIN         |
| Rewards             | GET    | `/api/rewards/getRewards`                       | USER          |
| Rewards             | GET    | `/api/rewards/getAllRewards`                    | ADMIN         |
| Rewards             | POST   | `/api/rewards/redeemReward`                     | USER          |
| Redemptions         | GET    | `/api/rewards/getMyRedemptionHistory`           | USER          |
| Redemptions         | GET    | `/api/rewards/getAllRedemptionHistory`          | ADMIN         |
| Rewards             | PATCH  | `/api/rewards/deactivateReward/:id`             | ADMIN         |
| Rewards             | PATCH  | `/api/rewards/reactivateReward/:id`             | ADMIN         |
| Rewards             | PATCH  | `/api/rewards/toggleFeatured/:id`               | ADMIN         |
| Rewards             | GET    | `/api/rewards/featured`                         | USER          |
| Favorites           | POST   | `/api/favorites/:productId`                     | USER          |
| Favorites           | GET    | `/api/favorites`                                | USER          |
| Favorites           | DELETE | `/api/favorites/:productId`                     | USER          |
| Notifications       | GET    | `/api/notifications/getMyNotifications`         | Authenticated |
| Notifications       | PATCH  | `/api/notifications/markAllNotificationsRead`   | Authenticated |
| Notifications       | PATCH  | `/api/notifications/markNotificationRead/:id`   | Authenticated |
| Notifications       | DELETE | `/api/notifications/deleteReadNotifications`    | Authenticated |

---

## 13. Conclusion

This document consolidates the Customer Loyalty App's authentication, user management, product management, purchases, loyalty points, rewards, redemption, favorites, and notifications APIs into a single reference.

It is intended to help developers and assessors understand the available endpoints, required access levels, request formats, and principal application behaviours.
