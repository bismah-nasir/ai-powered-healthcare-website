// Settings the API cannot run without (see backend/.env.example)
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];

export const getMissingEnv = () => REQUIRED_ENV.filter((name) => !process.env[name]);
