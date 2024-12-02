# Learn sessions

[![Bluesky: @kauefraga.dev](https://img.shields.io/badge/bluesky-%40kauefraga.dev-blue)](https://bsky.app/profile/kauefraga.dev)
[![Dev.to: kauefraga](https://img.shields.io/badge/dev.to-kauefraga-242424)](https://dev.to/kauefraga)
[![Last commit](https://img.shields.io/github/last-commit/kauefraga/learn-sessions/main)](https://github.com/kauefraga/learn-sessions/commits/main)

Inspired by the article ["Stop using JWT for sessions"](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/) (yes, http), here's an implementation on sessions with TypeScript, Fastify & Drizzle ORM.

This repository aims to explain the **concepts of sessions** and provide a **simple implementation**, so you have a solid start point.

## 🔥 Features

- [x] Simple specification: create user, authenticate user, log out user and fetch users (authorization required)
- [x] Cookie HTTP only, signed and max age set
- [x] Session validator
- [x] Package by layer
- [x] "Keep me signed in"
- [ ] CSRF mitigation

## 🔑 Concepts

**Cookies** can be considered kind of a storage, where you put small pieces of data. In fact, cookies were used as a general client-side data storage before the modern storage APIs (session storage and local storage).

> The server sends them to the user's web browser and the browser may store, create new ones, modify existing ones, and send them back to the same server with later requests.

The key idea of cookies is **remember state information**, because the HTTP protocol is stateless by default.

Cookies are used to store user session information, user preferences, tracking data and other data related to the site.

The **localStorage** API is used to store client-side data (same as cookies) with the differential of having more space and not sending the data in all requests.

Basically, you can persist more user data using the `localStorage` API than you would with cookies, however it's not send back to the server with later requests, you have to manually retrieve data, parse it and send.

Neither user session id nor JWT tokens are recommended to be stored in `localStorage` because of the facility to access them with JavaScript. **Cookies HTTP-only** solve this issue.

The **session** or user session should be created when the user create an account or log in your application. This is used to keep user authentication/authorization (and maybe more) information associated with its proper record.

The HTTP protocol is stateless as mentioned before, it doesn't hold any state, so without sessions the user would need to identify itself for each action that triggers a server call (HTTP request). Sessions solve it :)

To understand why not to use JWT tokens to store user session, read the article: ["Stop using JWT for sessions"](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/).

References:

- [Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Understanding Cookies in Web Browsers](https://www.geeksforgeeks.org/understanding-cookies-in-web-browsers/)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

## 📜 API specification

Base URL: `http://localhost:3333`

The REST API has the following use cases:

<details>
  <summary><h3>Create user</h3></summary>

**URL**: `POST /v1/user/create`

**Request body**:

```json
{
  "displayName": "string, optional, max 255 characters,",
  "name": "string, max 100 characters",
  "email": "string, valid e-mail, max 255 characters",
  "password": "string"
}
```

**Response**:

```json
{
  "id": "a9bd9d92-fb05-4938-956c-98b9228bdea2",
  "displayName": null,
  "name": "test",
  "email": "test@test.test",
  "createdAt": "2024-11-25T01:28:35.230Z"
}
```

**Status codes**:

- 201: successfully created user and session

**Cookies**:

- sessionId: `signed cookie containing session uuid`

</details>

<details>
  <summary><h3>Authenticate user</h3></summary>

**URL**: `POST /v1/user/auth`

**Request body**:

```json
{
  "name": "string, max 100 characters, optional*",
  "email": "string, valid e-mail, max 255 characters, optional*",
  "password": "string"
}
```

Must provide either name or email (*).

**Response**:

```json
{
  "id": "5e5f1642-f36b-4e8b-bc06-cfec569610a0",
  "userId": "9f8f7148-c321-4f88-a402-70020404e900",
  "startedAt": "2024-11-27T00:59:33.707Z"
}
```

**Status codes**:

- 201: successfully started user session
- 400: session already exists, required field not provided, user does not exist or invalid credentials

**Cookies**:

- sessionId: `signed cookie containing session uuid`

</details>

<details>
  <summary><h3>Log out user</h3></summary>

This route deletes the user session and clear the `sessionId` cookie.

**URL**: `DELETE /v1/user/logout`

**Status codes**:

- 204: successfully deleted user session
- 401: no session
- 500: failed to delete session

</details>

<details>
  <summary><h3>Fetch users</h3></summary>

**URL**: `GET /v1/users`

**Authentication**: required, `sessionId` cookie

**Response**:

```json
[
  {
    "id": "a9bd9d92-fb05-4938-956c-98b9228bdea2",
    "displayName": null,
    "name": "test",
    "email": "test@test.test",
    "createdAt": "2024-11-25T01:28:35.230Z",
    "sessionId": null
  },
  {
    "id": "36df8ca1-e04d-4176-b209-388937a74807",
    "displayName": "TypeScript is fantastic",
    "name": "ts",
    "email": "coreteam@ts.org",
    "createdAt": "2024-11-25T02:31:50.055Z",
    "sessionId": "45c7e6a6-a673-40fa-bcd6-d14f70788585"
  },
  // ...
]
```

**Status codes**:

- 200: successfully authorized to see other users
- 401: invalid session, unauthorized

</details>

## 🛠 How to run

Make sure you have [Node](https://nodejs.org/en), [pnpm](https://pnpm.io/) and [Docker](https://www.docker.com/) installed in your machine.

Clone the project in your machine

```sh
git clone https://github.com/kauefraga/learn-sessions.git

cd learn-sessions
```

Install the dependencies of the project

```sh
pnpm install
```

Start the database container

```sh
docker compose up -d
```

Define secrets in `.env`

```sh
cp .env.example .env
```

Run database migrations

```sh
pnpm drizzle-kit migrate
```

Run the server

```sh
pnpm dev
```

## 💭 Considerations

About the authentication abstraction, two options:

- Turn it into a middleware/plugin
- Make it a service and use repository instead of direct database connection

About the project:

- Create front end and integrate with the API
- Use package by feature instead of package by layer

## 📝 License

This project is licensed under the MIT License - See the [LICENSE](https://github.com/kauefraga/learn-sessions/blob/main/LICENSE) for more information.

---

If this repository has helped you, consider giving it a star ⭐
