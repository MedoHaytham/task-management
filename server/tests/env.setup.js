process.env.NODE_ENV = 'production';
process.env.ACCESS_TOKEN_SECRET_KEY = 'test-access-secret-key-not-for-production';
process.env.REFRESH_TOKEN_SECRET_KEY = 'test-refresh-secret-key-not-for-production';
process.env.ACCESS_TOKEN_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '30d';
process.env.ACCESS_TOKEN_COOKIE_EXPIRES_IN = '15';
process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN = '30';

// this database for testing (not using for project)
process.env.TEST_DATABASE_URI = 'mongodb+srv://projecettest_db_user:<PASSWORD>@cluster0.lklfwpr.mongodb.net/managetasks?retryWrites=true'.replace(
  '<PASSWORD>',
  'dQQc2cTGQbU5IADk'
);