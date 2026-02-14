// Minimal cache client wrapper example
// Replace with your runtime client (ioredis/go-redis/spring-data-redis).

function buildCacheKey(domain, entity, id) {
  return `app:${domain}:${entity}:${id}`;
}

module.exports = { buildCacheKey };
