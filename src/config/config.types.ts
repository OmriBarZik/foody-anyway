/** development or production, from NODE_ENV. */
export type NodeEnv = "development" | "production";

/** Values the server reads once at startup. */
export type AppConfig = {
  port: number;
  nodeEnv: NodeEnv;
  appOrigin: string;
  databasePath: string;
  sessionSecret: string;
  secureCookies: boolean;
  googleClientId: string | null;
  googleClientSecret: string | null;
  geminiApiKey: string | null;
  geminiModel: string;
  adminEmails: string[];
};
