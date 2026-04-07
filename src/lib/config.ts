const config = {
  env: {
    api: {
      endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT!,
    },
    database: {
      url: process.env.DATABASE_URL!,
    },
    email: {
      resend: {
        token: process.env.RESEND_TOKEN!,
      }
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
    upstash: {
      redisUrl: process.env.UPSTASH_REDIS_REST_URL!,
      redisToken: process.env.UPSTASH_REDIS_REST_TOKEN!,
      qstashUrl: process.env.QSTASH_URL!,
      qstashToken: process.env.QSTASH_TOKEN!,
      qstashCurrentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
      qstashNextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
    },
  }
};

export default config;