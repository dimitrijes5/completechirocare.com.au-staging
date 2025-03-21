export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'f7e8d6c5b4a3921087654321dcba9876'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'a8346c9d5f2e7b1908d63f4a52c71b9e'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
