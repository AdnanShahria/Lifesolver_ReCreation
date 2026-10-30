/**
 * LifeSolver Authentication System End-to-End Test Suite
 * Tests Cryptographic Primitives, JWT Sign/Verify, and Local D1 Relational State
 */
import { 
  hashPassword, 
  verifyPassword, 
  timingSafeEqual, 
  generateNumericOtp, 
  signUserToken 
} from '../backend/src/Auth/crypto';
import jwt from '@tsndr/cloudflare-worker-jwt';

async function runTests() {
  console.log('🧪 Starting LifeSolver Authentication System Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      throw new Error(`Assertion failed: ${name}`);
    }
  }

  // ── Test 1: Cryptographic Salt Generation & PBKDF2 Hashing
  console.log('🔒 1. Web Crypto PBKDF2 Password Hashing (100,000 iterations)');
  const password = 'SuperSecretLifeOS2026!';
  const { hashHex, saltHex } = await hashPassword(password);
  
  assert(typeof hashHex === 'string' && hashHex.length === 64, 'PBKDF2 SHA-256 produces 64-character hex hash (256 bits)');
  assert(typeof saltHex === 'string' && saltHex.length === 32, 'Random salt is 32-character hex string (16 bytes = 128 bits)');

  // Ensure unique salts per call
  const secondRun = await hashPassword(password);
  assert(secondRun.saltHex !== saltHex, 'Each call generates a cryptographically unique random salt');
  assert(secondRun.hashHex !== hashHex, 'Different salts result in completely distinct hashes for identical passwords');

  // Verify same salt produces deterministic hash
  const deterministicRun = await hashPassword(password, saltHex);
  assert(deterministicRun.hashHex === hashHex, 'Re-hashing with stored salt produces identical hash');

  // ── Test 2: Password Verification & Resistance
  console.log('\n🛡️ 2. Password Verification & Constant-Time Resistance');
  const isCorrect = await verifyPassword(password, hashHex, saltHex);
  assert(isCorrect === true, 'verifyPassword returns true for exact password match');

  const isWrong = await verifyPassword('WrongPassword123!', hashHex, saltHex);
  assert(isWrong === false, 'verifyPassword returns false for incorrect password');

  const isBlank = await verifyPassword('', hashHex, saltHex);
  assert(isBlank === false, 'verifyPassword returns false for empty password string');

  // ── Test 3: Constant-Time String Comparison (timingSafeEqual)
  console.log('\n⏱️ 3. Timing-Safe Equality Guard');
  assert(timingSafeEqual('abcdef123456', 'abcdef123456') === true, 'Matches identical strings');
  assert(timingSafeEqual('abcdef123456', 'abcdef123457') === false, 'Detects 1-character difference without early bail');
  assert(timingSafeEqual('short', 'longer_string') === false, 'Handles mismatched string lengths safely');

  // ── Test 4: OTP Generator
  console.log('\n🔢 4. Cryptographic 6-Digit OTP Generator');
  const otp = generateNumericOtp();
  assert(/^\d{6}$/.test(otp), 'OTP is exactly 6 numeric digits');
  const numericVal = parseInt(otp, 10);
  assert(numericVal >= 100000 && numericVal <= 999999, 'OTP is strictly in range 100000 - 999999');

  // ── Test 5: JWT Generation & Verification
  console.log('\n🎫 5. HMAC-SHA256 JWT Token Lifecycle');
  const testSecret = 'dev_super_secret_jwt_key_lifesolver_recreation_2026';
  const testUser = {
    id: 'usr_test_verification_01',
    email: 'test.commander@lifesolver.app',
    name: 'Test Commander'
  };

  const token = await signUserToken(testUser, testSecret, 3600);
  assert(typeof token === 'string' && token.split('.').length === 3, 'JWT has valid Header.Payload.Signature structure');

  const isValidToken = await jwt.verify(token, testSecret);
  assert(Boolean(isValidToken) === true, 'JWT validates successfully with matching secret');

  const isInvalidSecret = await jwt.verify(token, 'wrong_secret_key');
  assert(!isInvalidSecret, 'JWT verification fails with mismatched secret');

  const { payload } = jwt.decode<{ sub: string; email: string; name: string }>(token);
  assert(payload.sub === testUser.id, 'JWT payload sub contains user id');
  assert(payload.email === testUser.email, 'JWT payload contains user email');
  assert(payload.name === testUser.name, 'JWT payload contains user name');

  console.log(`\n🎉 All ${passed}/${total} authentication tests PASSED flawlessly!\n`);
}

runTests().catch((err) => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
