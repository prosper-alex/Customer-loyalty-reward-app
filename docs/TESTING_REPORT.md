# Customer Loyalty App

## Testing Report

### 1. Introduction

This report documents the testing performed on the Customer Loyalty App, a full-stack web application developed to manage customer accounts, products, purchases, loyalty points, rewards, redemptions, favorites, and notifications.

The purpose of testing was to verify that the application's core features function correctly, that input validation works as expected, and that authentication and role-based access controls protect restricted operations.

### 2. Testing Scope

The following functional areas were tested:

* User registration and login
* Authentication and role-based authorization
* Product management
* Purchases and loyalty point calculations
* Rewards and redemption
* Favorites management
* Notifications
* Password changes and recovery
* User profile management and profile photo uploads

### 3. Test Results

| No. | Feature                          | Tests Performed                                                                   | Result |
| --- | -------------------------------- | --------------------------------------------------------------------------------- | ------ |
| 1   | User registration                | Account creation, required-field validation, duplicate email and phone checks     | Pass   |
| 2   | User login                       | Valid credentials, invalid credentials, inactive-account restrictions             | Pass   |
| 3   | Authentication and authorization | Protected endpoints, customer/admin access restrictions                           | Pass   |
| 4   | Product management               | Create, retrieve, update, deactivate, reactivate, and delete products             | Pass   |
| 5   | Purchases                        | Purchase creation, quantity validation, product availability, and stock checks    | Pass   |
| 6   | Loyalty points                   | Points calculation, balance updates, and transaction history                      | Pass   |
| 7   | Referral rewards                 | Referral bonus conditions and first-purchase handling                             | Pass   |
| 8   | Rewards management               | Reward creation, retrieval, availability, and stock management                    | Pass   |
| 9   | Reward redemption                | Successful redemption, insufficient-points handling, and stock updates            | Pass   |
| 10  | Favorites                        | Add, retrieve, and remove favorite products                                       | Pass   |
| 11  | Notifications                    | Retrieve notifications, mark notifications as read, and delete read notifications | Pass   |
| 12  | Password management              | Change password, request a reset code, and reset password                         | Pass   |
| 13  | Profile management               | Update profile information and upload a profile photo                             | Pass   |

### 4. Security and Validation Testing

Testing included checks to confirm that:

* Passwords are handled using hashing.
* Protected endpoints require authentication.
* Role-based permissions restrict administrator operations.
* Required fields and invalid input values are rejected.
* Duplicate email addresses and phone numbers are rejected during registration.
* Inactive accounts cannot log in.
* Customers cannot access other customers' purchase records through the individual purchase endpoint.
* Password-reset codes expire and are invalidated after successful use.
* Product and reward stock restrictions are enforced during purchases and redemptions.

### 5. Database and Transaction Testing

The application's database operations were tested using MongoDB Atlas.

Purchase and redemption workflows were tested to confirm that relevant records and balance or stock updates were persisted correctly. These workflows use database transactions to maintain consistency across related operations.

### 6. Testing Outcome

Based on the tests performed, all listed functional areas and the selected validation and access-control scenarios passed.

The results indicate that the application's core features are functioning as expected under the tested conditions.

### 7. Limitations

This report covers the functional tests and edge cases performed during development. It does not claim that a comprehensive automated test suite, formal load testing, penetration testing, or cross-browser compatibility testing has been completed.

### 8. Conclusion

The Customer Loyalty App passed the functional tests performed on its core features, including account management, product management, purchases, loyalty points, rewards, redemptions, favorites, and notifications.

The application is ready for the final project review, subject to the remaining submission checks and any additional requirements specified by TS Academy.