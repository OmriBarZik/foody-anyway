/** development or production, from NODE_ENV. */
export type NodeEnv = "development" | "production";

/** Values the server reads once at startup. */
export type AppConfig = {
  nodeEnv: NodeEnv;
  appOrigin: string;
  databaseUrl: string;
  sessionSecret: string;
  googleClientId: string | null;
  googleClientSecret: string | null;
  geminiApiKey: string | null;
  geminiModel: string;
  adminEmails: string[];
};
