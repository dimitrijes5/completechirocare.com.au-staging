export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS') || ['randomKey14dca8972fb', 'randomKey2bf6534e89c', 'randomKey37a9d21e56f', 'randomKey48c3a591e7d'],
  },
});
