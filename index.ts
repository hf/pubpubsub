import "source-map-support/register";
import * as fs from "fs";
import { PubSub } from "@google-cloud/pubsub";

const setupGoogleCloudCredentials = () => {
  const gcloudServiceAccountCredentials = {
    type: "external_account",
    subject_token_type: "urn:ietf:params:aws:token-type:aws4_request",
    credential_source: {
      environment_id: "aws1",
      region_url:
        "http://169.254.169.254/latest/meta-data/placement/availability-zone",
      url: "http://169.254.169.254/latest/meta-data/iam/security-credentials",
      regional_cred_verification_url:
        "https://sts.{region}.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15",
    },
    token_url: "https://sts.googleapis.com/v1/token",
    audience: `//iam.googleapis.com/projects/${process.env.GOOGLE_CLOUD_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${process.env.GOOGLE_CLOUD_WEB_IDENTITY_POOL}/providers/${process.env.GOOGLE_CLOUD_WEB_IDENTITY_POOL_AWS_PROVIDER}`,
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  };

  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    "/tmp/gcloud-service-account-credentials.json";

  fs.writeFileSync(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    JSON.stringify(gcloudServiceAccountCredentials)
  );

  console.log(
    "Google Cloud Service Account Credentials",
    gcloudServiceAccountCredentials
  );
};

const clients: { readonly [projectId: string]: PubSub } = (() => {
  const underlying: any = {};
  let credentialsSetup = false;

  const projectIdRegexp = /^[a-z][a-z-0-9-]{4,28}[a-z0-9]$/;

  return new Proxy(underlying, {
    get: (_, projectId) => {
      if ("string" !== typeof projectId) {
        return underlying[projectId];
      }

      if (!projectIdRegexp.test(projectId)) {
        throw new Error(`Invalid project id '${projectId}'`);
      }

      if (!credentialsSetup) {
        setupGoogleCloudCredentials();

        credentialsSetup = true;
      }

      if (!underlying[projectId]) {
        underlying[projectId] = new PubSub({ projectId });
      }

      return underlying[projectId];
    },
    set: () => {
      throw new Error("Read only object!");
    },
  });
})();

export const handler = async (event: {
  topic: string;
  message: string;
  projectId?: string;
  base64?: boolean;
}) => {
  const projectId =
    event.projectId || process.env.GOOGLE_CLOUD_DEFAULT_PROJECT_ID || "";

  try {
    const messageId = await clients[projectId]
      .topic(event.topic)
      .publish(Buffer.from(event.message, event.base64 ? "base64" : "utf-8"));

    return {
      messageId,
      projectId,
      topic: event.topic,
    };
  } catch (e) {
    console.error(
      `Unable to publish message to topic '${event.topic}' on project '${projectId}'`,
      e
    );

    throw e;
  }
};
