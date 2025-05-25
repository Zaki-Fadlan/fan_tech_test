npx prisma migrate reset --force
npx prisma migrate dev --name init
npx prisma generate
# Project Setup & Installation

This guide will walk you through the setup, installation, and how to run the project. The project is built with **Node.js**, **Express**, and **Prisma** as the ORM for database management.

## Prerequisites

Before getting started, make sure you have the following software installed on your machine:

- **Node.js** (Recommended version: 14.x or higher)
- **npm** or **yarn** (npm comes with Node.js, yarn can be installed separately)
- **Prisma** (Prisma will be installed as part of the project setup)
- **Database** (PostgreSQL, MySQL, or SQLite supported. Ensure your database is set up before proceeding.)

## Step 1: Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/Zaki-Fadlan/fan_tech_test.git
cd fan_tech_test
cd backend_script_test
```
## Step 2: Install Dependencies
Install the project dependencies using either npm or yarn:

Using npm:
```bash
npm install
```
Using yarn:
```bash
yarn install
```
This will install the necessary dependencies listed in the package.json file, including express, prisma, and other required packages.

## Step 3: Configure the Environment Variables
Copy the .env.example file and create a new .env file:
```bash
cp .env.example .env
```

## : Set Up Prisma
Generate Prisma Client
Run the following command to generate the Prisma client, which will be used to interact with the database:
```bash
npx prisma generate
```
Migrate the Database
Prisma uses migrations to set up and manage your database schema. If you have existing migrations, you can run them using:

```bash
npx prisma migrate deploy
```
To create a new migration after modifying the schema, run:

```bash
npx prisma migrate dev --name init
```
This will generate the migration file and apply it to your database.

(Optional) Seed the Database
If you want to seed your database with initial data, you can run the seed script (if available):
```
bash
npx prisma db seed
```
Check prisma/seed.ts for any data seeding logic.

## Step 5: Run the Project
After setting everything up, you can run the project locally:

Using npm:
```bash
npm run dev
```
Using yarn:
```bash
yarn dev
```
# API Documentation

This document provides the details of the available routes in the application. Each route is described with the corresponding HTTP method, URL, required parameters, and expected responses.

## Authentication Routes

### `POST /api/auth/login`

- **Description**: Login to the system and retrieve a JWT token.
- **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "your-password"
    }
    ```
- **Response**:
    - **200 OK**:
        ```json
        {
          "message": "Login successful",
          "token": "your-jwt-token"
        }
        ```
    - **400 Bad Request**: If email or password is missing or invalid.
    - **401 Unauthorized**: If email or password is incorrect.

---

### `POST /api/auth/register`

- **Description**: Register a new user in the system.
- **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "your-password",
      "name": "User Name"
    }
    ```
- **Response**:
    - **201 Created**:
        ```json
        {
          "message": "User registered successfully"
        }
        ```
    - **400 Bad Request**: If required fields (email, password, name) are missing or invalid.

---

## Presence Routes

### `POST /api/presences`

- **Description**: Submit a request for presence approval (IN or OUT).
- **Middleware**: Requires authentication (`authenticateToken`).
- **Request Body**:
    ```json
    {
      "type": "IN",
      "waktu": "2025-05-23 08:00:00"
    }
    ```
- **Response**:
    - **200 OK**:
        ```json
        {
          "message": "Req Approval Routes",
          "data": {
            "id": 1,
            "id_users": 123,
            "type": "IN",
            "waktu": "2025-05-23T08:00:00.000Z"
          }
        }
        ```
    - **400 Bad Request**: If the `type` is not `IN` or `OUT`, or if `waktu` is in an invalid format.

---

### `GET /api/presences`

- **Description**: Get all presence data.
- **Middleware**: Requires authentication (`authenticateToken`).
- **Response**:
    - **200 OK**:
        ```json
        {
          "message": "Success Get All Presences data",
          "data": [
            {
              "id_user": 123,
              "nama_user": "User Name",
              "tanggal": "2025-05-23",
              "waktu_masuk": "08:00:00",
              "waktu_pulang": "17:00:00",
              "status_masuk": "Approved",
              "status_pulang": "Pending"
            }
          ]
        }
        ```
    - **401 Unauthorized**: If the user is not authenticated.

---

### `PUT /api/presences/:id`

- **Description**: Approve or reject a specific presence request by its ID.
- **Middleware**: Requires authentication (`authenticateToken`).
- **URL Parameters**:
    - `id`: The ID of the presence request to be updated.
- **Query Parameters**:
    - `is_approve`: A boolean value (`true` or `false`) indicating whether the request is approved.
- **Response**:
    - **200 OK**:
        ```json
        {
          "message": "Res Approval Routes untuk ID 1",
          "data": {
            "id": 1,
            "id_users": 123,
            "type": "IN",
            "waktu": "2025-05-23T08:00:00.000Z",
            "is_approve": true
          }
        }
        ```
    - **400 Bad Request**: If `is_approve` is missing or not a valid boolean (`true` or `false`).
    - **401 Unauthorized**: If the user does not have permission to approve this presence request.
    - **404 Not Found**: If the presence ID does not exist.

---

### `GET /api/presences/:id`

- **Description**: Get a specific user's presence data by their ID.
- **Middleware**: Requires authentication (`authenticateToken`).
- **URL Parameters**:
    - `id`: The ID of the user to retrieve the presence data for.
- **Response**:
    - **200 OK**:
        ```json
        {
          "message": "Get Approval by ID Routes untuk ID 1",
          "data": {
            "id": 1,
            "id_users": 123,
            "type": "IN",
            "waktu": "2025-05-23T08:00:00.000Z",
            "is_approve": true
          }
        }
        ```
    - **404 Not Found**: If the user with the given ID does not exist.
    - **401 Unauthorized**: If the user is not authenticated.

---

## Error Codes

The following are common error responses returned by the API:

- **400 Bad Request**: If the request is missing required fields or has invalid parameters.
- **401 Unauthorized**: If the user is not authenticated or does not have permission to perform the action.
- **404 Not Found**: If the requested resource is not found.
- **500 Internal Server Error**: If there is an error on the server.

## Notes

- Ensure that the `Authorization` header is included in all requests that require authentication, with the format: `Bearer <JWT_TOKEN>`.
- All timestamps (`waktu`) should follow the `yyyy-MM-dd HH:mm:ss` format.
