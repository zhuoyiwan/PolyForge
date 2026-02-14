# Auth Center Module

- Endpoints:
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `GET /auth/verify`
  - `GET /health`
- Includes JWT access/refresh token minimal flow.
- Configure `JWT_SECRET` and `JWT_REFRESH_SECRET` for production.
