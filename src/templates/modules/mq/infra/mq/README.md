# MQ Module

- Purpose: async collaboration between Go/Java/Python services
- Local stack: Kafka + RabbitMQ + NATS (`infra/mq/docker-compose.yml`)
- Runnable worker example: `apps/mq-worker`
- Default capabilities: producer/consumer samples, retry + idempotency + DLQ placeholders
