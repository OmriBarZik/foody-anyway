/** development or production, from NODE_ENV. */
export type NodeEnv = "development" | "production";

/** Where this server runs: a Vercel production or preview deployment, or a local machine. */
export type Deployment = "production" | "preview" | "local";

/** Values the server reads once at startup. */
export type AppConfig = {
  nodeEnv: NodeEnv;
  deployment: Deployment;
  appOrigin: string;
  /** The production site that runs Google's callback for preview deployments. */
  productionOrigin: string;
  databaseUrl: string;
  sessionSecret: string;
  googleClientId: string | null;
  googleClientSecret: string | null;
  geminiApiKey: string | null;
  geminiModel: string;
  adminEmails: string[];
};
