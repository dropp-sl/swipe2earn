import 'dotenv/config';

type RootConfig = {
  server: {
    port: number;
    sessionSecret: string;
    sessionSalt: string;
  };
  storagePlatform: string;
  oci: {
    tenancyId: string;
    userId: string;
    fingerprint: string;
    privateKey: string;
    region: string;
    bucketName: string;
    namespace: string;
    preAuthBaseUrl: string;
  };
  huggingfaceApiKey: string;
};
const EnvVariables: RootConfig = {
  server: {
    port: Number(process.env.PORT as string),
    sessionSecret: process.env.SESSION_SECRET,
    sessionSalt: process.env.SESSION_SALT,
  },
  oci: {
    tenancyId: process.env.OCI_TENANCY_ID,
    userId: process.env.OCI_USER_ID,
    fingerprint: process.env.OCI_FINGERPRINT,
    privateKey: process.env.OCI_PRIVATE_KEY,
    region: process.env.OCI_REGION,
    bucketName: process.env.OCI_BUCKET_NAME,
    namespace: process.env.OCI_NAMESPACE,
    preAuthBaseUrl: process.env.OCI_PRE_AUTH_URL,
  },
  storagePlatform: process.env.STORAGE_PLATFORM,
  huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
};

export { EnvVariables };
