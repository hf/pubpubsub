# PubPubSub

A ready-made AWS Lambda function you can invoke to publish messages into
Google's PubSub system.

It's really useful for bridging AWS compute with Firebase or other Google Cloud
projects.

## Setup

Follow the guide to setup [Workload Identity
Federation][gcp-workload-identity-federation] in your Google Cloud projects.

Then you can deploy the code in this repository as a Node.js Lambda function in
your AWS account.

Check out the Releases section for packages and instructions.

Hosted versions are available out of my personal AWS account, should you need
to get running quickly. You're encouraged to host it on your own accounts and
service is provided without any guarantees or warranty express or implied.

CloudFormation:

```
https://github-com-hf-pubpubsub-<region>.s3.amazonaws.com/release/cloudformation/<release>
```

Lambda:

```
https://github-com-hf-pubpubsub-<region>.s3.amazonaws.com/release/lambda/<release>
```

Currently available in: `us-east-1`, `eu-west-1`. Open an issue to
request availability in other regions.

Note that you're only allowed to access the S3 object, not the bucket itself.
You must do it using AWS credentials, and your identity will be visible in my
CloudTrail account.

### Configuration

The Lambda function expects these environment variables:

- `GOOGLE_CLOUD_PROJECT_NUMBER` GCP project number where the Workload Identity
  Federation provider resides
- `GOOGLE_CLOUD_WEB_IDENTITY_POOL` ID of the web identity pool
- `GOOGLE_CLOUD_WEB_IDENTITY_POOL_AWS_PROVIDER` ID of the AWS provider in the
  web identity pool
- `GOOGLE_CLOUD_SERVICE_ACCOUNT_EMAIL` Service account email to impersonate
- `GOOGLE_CLOUD_DEFAULT_PROJECT_ID` (Optional) Project ID where messages
  without a `projectId` property will be directed to

## Use

The Lambda function can be invoked synchronously or asynchronously.

It accepts a JSON object with the following structure:

- `topic` Pub/Sub topic to which to publish
- `message` A string representing the message to be published
- `base64` (Optional) A boolean whether the `mesasge` is encoded in Base64
- `projectId` (Optional) GCP project ID where the `topic` lives

It outputs a JSON object with the following structure:

- `topic` Pub/Sub topic where the message was published
- `projectId` GCP project ID where the `topic` lives
- `messageId` ID of the message in the `topic`

## License

Copyright &copy; 2022 Stojan Dimitrovski. Some rights reserved.

Licensed under the MIT X11 License. You can find a copy of it under `LICENSE`.

[gcp-workload-identity-federation]: https://cloud.google.com/iam/docs/configuring-workload-identity-federation#aws
