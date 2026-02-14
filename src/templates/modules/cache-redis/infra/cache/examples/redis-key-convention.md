# Redis Key Convention

- user profile: `app:user:profile:{userId}`
- auth session: `app:auth:session:{sessionId}`
- rate limit: `app:rate:{route}:{userId}`
