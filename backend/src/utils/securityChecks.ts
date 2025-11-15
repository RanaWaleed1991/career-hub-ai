import { isProduction, getMissingEnvVars } from '../config/validateEnv.js';

/**
 * Security status interface
 */
interface SecurityStatus {
  timestamp: string;
  environment: string;
  secure: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Perform security checks and log status
 * Should be called at server startup
 */
export function performSecurityChecks(): SecurityStatus {
  const status: SecurityStatus = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    secure: true,
    warnings: [],
    errors: [],
  };

  console.log('\n🔒 Running security checks...\n');

  // Check 1: Environment variables
  const missingVars = getMissingEnvVars();
  if (missingVars.length > 0) {
    status.errors.push(`Missing required environment variables: ${missingVars.join(', ')}`);
    status.secure = false;
  }

  // Check 2: Production mode checks
  if (isProduction()) {
    // Check HTTPS requirement in production
    if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.startsWith('https://')) {
      status.warnings.push('Frontend URL should use HTTPS in production');
    }

    // Check Supabase URL uses HTTPS
    if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.startsWith('https://')) {
      status.errors.push('Supabase URL must use HTTPS in production');
      status.secure = false;
    }

    // Warn about development ports
    const frontendUrl = process.env.FRONTEND_URL || '';
    if (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
      status.warnings.push('Frontend URL appears to be localhost in production environment');
    }
  }

  // Check 3: API Keys format validation
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    status.warnings.push('Stripe secret key has unexpected format');
  }

  if (process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
    status.warnings.push('Stripe webhook secret has unexpected format');
  }

  // Check 4: Port configuration
  const port = parseInt(process.env.PORT || '3001', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    status.errors.push('Invalid PORT configuration');
    status.secure = false;
  }

  // Check 5: Database connection
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    status.errors.push('Database credentials not configured');
    status.secure = false;
  }

  // Log results
  console.log(`Environment: ${status.environment}`);
  console.log(`Security Status: ${status.secure ? '✅ SECURE' : '❌ INSECURE'}\n`);

  if (status.errors.length > 0) {
    console.error('❌ ERRORS:');
    status.errors.forEach((error) => console.error(`  - ${error}`));
    console.log('');
  }

  if (status.warnings.length > 0) {
    console.warn('⚠️  WARNINGS:');
    status.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    console.log('');
  }

  if (status.secure && status.warnings.length === 0) {
    console.log('✅ All security checks passed!\n');
  }

  return status;
}

/**
 * Log security features enabled
 */
export function logSecurityFeatures(): void {
  console.log('🛡️  Security features enabled:');
  console.log('  ✓ Helmet (Security headers)');
  console.log('  ✓ CORS with origin whitelist');
  console.log('  ✓ Rate limiting (General, AI, Auth, Payment)');
  console.log('  ✓ Request size limits (10MB max)');
  console.log('  ✓ Environment validation');
  console.log('  ✓ Request logging');
  console.log('  ✓ JSON error handling');
  console.log('');
}

/**
 * Check if a string looks like a secret/API key
 * Useful for preventing accidental secret exposure in logs
 */
export function looksLikeSecret(value: string): boolean {
  // Check for common secret patterns
  const secretPatterns = [
    /^sk_/i, // Stripe secret keys
    /^pk_/i, // Stripe public keys
    /^whsec_/i, // Stripe webhook secrets
    /^[A-Za-z0-9_-]{32,}$/, // Long random strings
    /api[_-]?key/i,
    /secret/i,
    /password/i,
    /token/i,
  ];

  return secretPatterns.some((pattern) => pattern.test(value));
}

/**
 * Sanitize error messages to prevent secret exposure
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove potential secrets from error messages
  const sanitized = message
    .replace(/sk_[a-zA-Z0-9_]+/g, 'sk_***')
    .replace(/pk_[a-zA-Z0-9_]+/g, 'pk_***')
    .replace(/whsec_[a-zA-Z0-9_]+/g, 'whsec_***')
    .replace(/Bearer [a-zA-Z0-9_.-]+/g, 'Bearer ***')
    .replace(/password[=:]\s*[^\s&]+/gi, 'password=***');

  return sanitized;
}
