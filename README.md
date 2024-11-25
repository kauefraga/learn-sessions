# Learn sessions

Inspired by the article ["Stop using JWT for sessions"](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/) (yes, http), here's an implementation on sessions with TypeScript, Fastify & Drizzle ORM.

This repository aims to explain the **concepts of sessions** and provide a **simple implementation**.

## 🔑 Concepts

- Cookies
- LocalStorage and why not
- Sessions
- JWT tokens and why not

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

Coming soon...

</details>

<details>
  <summary><h3>Log out user</h3></summary>

Coming soon...

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

## 📝 License

This project is licensed under the MIT License - See the [LICENSE](https://github.com/kauefraga/learn-sessions/blob/main/LICENSE) for more information.

---

If this repository has helped you, consider giving it a star ⭐
