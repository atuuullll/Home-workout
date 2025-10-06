// Google Cloud Storage Configuration
const gcsConfig = {
  projectId: 'YOUR_PROJECT_ID',
  bucket: 'YOUR_BUCKET_NAME',
  // Add your service account key JSON here
  credentials: {
    client_email: 'YOUR_CLIENT_EMAIL',
    private_key: 'YOUR_PRIVATE_KEY',
  }
};

export default gcsConfig;