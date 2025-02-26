function validateEnvVariables() {
    const requiredEnvVars = [
      "PORT",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "AWS_REGION",
      "AWS_BUCKET_NAME",
      "APP_API_KEY"
    ];
  
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
    }
  }
  
export default  validateEnvVariables