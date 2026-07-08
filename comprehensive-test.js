const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authTokens = {};
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

const log = (emoji, message) => console.log(`${emoji} ${message}`);
const pass = (test) => { testResults.passed++; log('✅', test); };
const fail = (test, error) => {
  testResults.failed++;
  testResults.errors.push({ test, error: error.message });
  log('❌', `${test}: ${error.message}`);
};

async function runTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   COMPREHENSIVE APP TEST SUITE             ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // 1. Health Checks
  console.log('📊 HEALTH CHECKS\n');

  try {
    const health = await axios.get(`${API_BASE}/health`);
    if (health.data.status === 'ok') pass('Backend health check');
    else fail('Backend health check', new Error('Status not ok'));
  } catch (err) {
    fail('Backend health check', err);
  }

  try {
    const dbTest = await axios.get(`${API_BASE}/test-db`);
    if (dbTest.data.status === 'ok') pass('Database connection');
    else fail('Database connection', new Error('DB not connected'));
  } catch (err) {
    fail('Database connection', err);
  }

  // 2. Authentication Tests
  console.log('\n🔐 AUTHENTICATION TESTS\n');

  const users = [
    { identifier: 'white_demo', password: 'White123!', role: 'white_collar' },
    { identifier: 'employer_demo', password: 'Employer123!', role: 'employer' },
    { identifier: 'blue_demo', password: 'Blue123!', role: 'blue_collar' },
    { identifier: 'admin', password: 'Admin123!', role: 'admin' }
  ];

  for (const user of users) {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        identifier: user.identifier,
        password: user.password
      });

      if (res.data.success && res.data.data.token) {
        authTokens[user.role] = res.data.data.token;
        pass(`Login as ${user.role}`);
      } else {
        fail(`Login as ${user.role}`, new Error('No token returned'));
      }
    } catch (err) {
      fail(`Login as ${user.role}`, err);
    }
  }

  // Test invalid login
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'invalid',
      password: 'wrong'
    });
    fail('Invalid login rejection', new Error('Should have been rejected'));
  } catch (err) {
    if (err.response && err.response.status === 401) {
      pass('Invalid login rejection');
    } else {
      fail('Invalid login rejection', err);
    }
  }

  // 3. Profile Tests
  console.log('\n👤 PROFILE TESTS\n');

  for (const [role, token] of Object.entries(authTokens)) {
    try {
      const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.user_id) {
        pass(`Get profile for ${role}`);
      } else {
        fail(`Get profile for ${role}`, new Error('No profile data'));
      }
    } catch (err) {
      fail(`Get profile for ${role}`, err);
    }
  }

  // 4. Jobs Tests
  console.log('\n💼 JOBS TESTS\n');

  try {
    const res = await axios.get(`${API_BASE}/jobs/public`);
    if (res.data.success !== undefined) {
      pass('Get public jobs list');
    } else {
      fail('Get public jobs list', new Error('Invalid response format'));
    }
  } catch (err) {
    fail('Get public jobs list', err);
  }

  // Test authenticated jobs endpoint
  try {
    const res = await axios.get(`${API_BASE}/jobs`, {
      headers: { Authorization: `Bearer ${authTokens.white_collar}` }
    });
    if (res.data.success !== undefined) {
      pass('Get authenticated jobs list');
    } else {
      fail('Get authenticated jobs list', new Error('Invalid response'));
    }
  } catch (err) {
    fail('Get authenticated jobs list', err);
  }

  // 5. Authorization Tests
  console.log('\n🔒 AUTHORIZATION TESTS\n');

  try {
    await axios.get(`${API_BASE}/profile`, {
      headers: { Authorization: 'Bearer invalid_token' }
    });
    fail('Invalid token rejection', new Error('Should have been rejected'));
  } catch (err) {
    if (err.response && err.response.status === 401) {
      pass('Invalid token rejection');
    } else {
      fail('Invalid token rejection', err);
    }
  }

  try {
    await axios.get(`${API_BASE}/profile`);
    fail('No token rejection', new Error('Should have been rejected'));
  } catch (err) {
    if (err.response && err.response.status === 401) {
      pass('No token rejection');
    } else {
      fail('No token rejection', err);
    }
  }

  // 6. Performance Tests
  console.log('\n⚡ PERFORMANCE TESTS\n');

  const startTime = Date.now();
  try {
    await axios.get(`${API_BASE}/health`);
    const responseTime = Date.now() - startTime;
    if (responseTime < 100) {
      pass(`Response time: ${responseTime}ms (Excellent)`);
    } else if (responseTime < 500) {
      pass(`Response time: ${responseTime}ms (Good)`);
    } else {
      fail('Response time', new Error(`Too slow: ${responseTime}ms`));
    }
  } catch (err) {
    fail('Response time test', err);
  }

  // 7. Concurrent Requests Test
  console.log('\n🔄 LOAD TESTS\n');

  try {
    const promises = Array(10).fill().map(() =>
      axios.get(`${API_BASE}/health`)
    );
    await Promise.all(promises);
    pass('Handle 10 concurrent requests');
  } catch (err) {
    fail('Handle 10 concurrent requests', err);
  }

  // Final Results
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║           TEST RESULTS                     ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║  Total Tests: ${testResults.passed + testResults.failed}                              ║`);
  console.log(`║  ✅ Passed: ${testResults.passed}                               ║`);
  console.log(`║  ❌ Failed: ${testResults.failed}                                ║`);
  console.log(`║  Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%                        ║`);
  console.log('╚════════════════════════════════════════════╝\n');

  if (testResults.errors.length > 0) {
    console.log('❌ ERRORS:\n');
    testResults.errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err.test}`);
      console.log(`   ${err.error}\n`);
    });
  } else {
    console.log('🎉 ALL TESTS PASSED! APP IS READY!\n');
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
