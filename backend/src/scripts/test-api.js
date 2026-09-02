import http from 'http';
import app from '../server.js';
import { readJSON } from '../models/db.js';

let server;
let port;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : null;
            resolve({ status: res.statusCode, body: parsed, raw: data });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('🚀 Iniciando suite de pruebas automatizadas del backend...');

  // 1. Start server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Test server running on ${baseUrl}`);
      resolve();
    });
  });

  try {
    // --- 1. AUTH TESTS ---
    console.log('\n--- 1. Testing Authentication ---');

    // Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@coders.app',
      password: 'Admin123!',
    });
    assert(adminLogin.status === 200, 'Admin login returns 200');
    assert(adminLogin.body.ok === true, 'Admin login response ok === true');
    assert(adminLogin.body.data.user.role === 'admin', 'Admin user has role "admin"');
    assert(!adminLogin.body.data.user.password, 'Admin password is not exposed');
    const adminToken = adminLogin.body.data.token;

    // TL Login
    const tlLogin = await request('POST', '/api/auth/login', {
      email: 'alex.tl@coders.app',
      password: 'Tl123!',
    });
    assert(tlLogin.status === 200, 'Team Leader login returns 200');
    assert(tlLogin.body.data.user.role === 'teamLeader', 'TL user has role "teamLeader"');
    const tlToken = tlLogin.body.data.token;
    const tlId = tlLogin.body.data.user.id;

    // Coder Login
    const coderLogin = await request('POST', '/api/auth/login', {
      email: 'elena@coders.app',
      password: 'Coder123!',
    });
    assert(coderLogin.status === 200, 'Coder login returns 200');
    assert(coderLogin.body.data.user.role === 'coder', 'Coder user has role "coder"');
    const coderToken = coderLogin.body.data.token;
    const coderId = coderLogin.body.data.user.id;

    // Bad Credentials
    const badLogin = await request('POST', '/api/auth/login', {
      email: 'admin@coders.app',
      password: 'WrongPassword!',
    });
    assert(badLogin.status === 401, 'Bad credentials return 401');

    // Register new Coder
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Carlos Test',
      email: 'carlos.test@coders.app',
      password: 'Password123!',
    });
    assert(regRes.status === 201, 'Register new coder returns 201');
    assert(regRes.body.data.user.email === 'carlos.test@coders.app', 'Registered coder email matches');
    const newCoderToken = regRes.body.data.token;
    const newCoderId = regRes.body.data.user.id;

    // /api/auth/me
    const meAdmin = await request('GET', '/api/auth/me', null, adminToken);
    assert(meAdmin.status === 200 && meAdmin.body.data.email === 'admin@coders.app', 'Admin getMe returns profile');

    const meCoder = await request('GET', '/api/auth/me', null, coderToken);
    assert(meCoder.status === 200 && meCoder.body.data.role === 'coder', 'Coder getMe returns profile with clan');

    // --- 2. CODERS CRUD & RBAC ---
    console.log('\n--- 2. Testing Coders CRUD & RBAC ---');
    const listCoders = await request('GET', '/api/coders', null, coderToken);
    assert(listCoders.status === 200, 'Coder can list coders');
    assert(Array.isArray(listCoders.body.data), 'Coders list is an array');

    // Coder tries to create coder -> 403
    const forbiddenCreate = await request(
      'POST',
      '/api/coders',
      { name: 'Hacker', email: 'hacker@test.com', password: 'password123' },
      coderToken
    );
    assert(forbiddenCreate.status === 403, 'Coder creating coder is forbidden (403)');

    // Admin creates coder
    const createdCoder = await request(
      'POST',
      '/api/coders',
      { name: 'Lucas Developer', email: 'lucas@coders.app', password: 'Password123!' },
      adminToken
    );
    assert(createdCoder.status === 201, 'Admin can create coder (201)');
    const testCoderId = createdCoder.body.data.id;

    // Update coder
    const updatedCoder = await request(
      'PUT',
      `/api/coders/${testCoderId}`,
      { name: 'Lucas Updated' },
      tlToken
    );
    assert(updatedCoder.status === 200 && updatedCoder.body.data.name === 'Lucas Updated', 'TL can update coder');

    // --- 3. CLANS CRUD & BUSINESS RULES ---
    console.log('\n--- 3. Testing Clans CRUD & 2-Clan Rule ---');
    // Create 1st clan for Alex TL (he already has 1: Cyber Dragons)
    const clan2Res = await request(
      'POST',
      '/api/clans',
      { name: 'Neon Shadows', description: 'Backend and security', teamLeader: tlId },
      adminToken
    );
    assert(clan2Res.status === 201, 'Can assign second clan to TL');
    const clan2Id = clan2Res.body.data.id;

    // Try to create 3rd clan for Alex TL -> should fail with 400 (max 2 clans)
    const clan3Fail = await request(
      'POST',
      '/api/clans',
      { name: 'Over Limit Clan', description: 'Over limit', teamLeader: tlId },
      adminToken
    );
    assert(clan3Fail.status === 400, 'Assigning 3rd clan to TL fails with 400 limit rule');

    // --- 4. TEAM LEADERS & PROMOTE / DEMOTE ---
    console.log('\n--- 4. Testing Team Leaders Promote & Demote ---');
    // Promote Carlos Test to TL
    const promoteRes = await request(
      'POST',
      '/api/team-leaders/promote',
      { coderId: newCoderId },
      adminToken
    );
    assert(promoteRes.status === 201, 'Promoting coder returns 201');
    assert(promoteRes.body.data.role === 'teamLeader', 'Promoted user has role teamLeader');
    const promotedTLId = promoteRes.body.data.id;

    // Demote Carlos TL back to Coder
    const demoteRes = await request(
      'POST',
      '/api/team-leaders/demote',
      { tlId: promotedTLId },
      adminToken
    );
    assert(demoteRes.status === 200, 'Demoting TL returns 200');
    assert(demoteRes.body.data.role === 'coder', 'Demoted user has role coder');

    // --- 5. TASKS CRUD & KANBAN WORKFLOW ---
    console.log('\n--- 5. Testing Tasks & Kanban State Transitions ---');
    // Create new Task assigned to Elena (coder)
    const taskRes = await request(
      'POST',
      '/api/tasks',
      {
        title: 'Build automated tests',
        description: 'Implement integration testing suite',
        priority: 'high',
        assigneeId: coderId,
        clanId: clan2Id,
      },
      tlToken
    );
    assert(taskRes.status === 201, 'TL can create task');
    assert(taskRes.body.data.status === 'pending', 'New task status is pending');
    const taskId = taskRes.body.data.id;

    // Transition: pending -> review by assignee (Elena)
    const toReview = await request(
      'PATCH',
      `/api/tasks/${taskId}/status`,
      { status: 'review' },
      coderToken
    );
    assert(toReview.status === 200 && toReview.body.data.status === 'review', 'Assignee moves task to review');

    // Invalid transition: review -> pending (not allowed directly)
    const invalidTrans = await request(
      'PATCH',
      `/api/tasks/${taskId}/status`,
      { status: 'pending' },
      tlToken
    );
    assert(invalidTrans.status === 400, 'Invalid transition review -> pending rejected (400)');

    // Transition: review -> rejected by TL
    const toRejected = await request(
      'PATCH',
      `/api/tasks/${taskId}/status`,
      { status: 'rejected' },
      tlToken
    );
    assert(toRejected.status === 200 && toRejected.body.data.status === 'rejected', 'TL rejects task');

    // Reopen: rejected -> pending by TL
    const toPending = await request(
      'PATCH',
      `/api/tasks/${taskId}/status`,
      { status: 'pending' },
      tlToken
    );
    assert(toPending.status === 200 && toPending.body.data.status === 'pending', 'TL reopens rejected task to pending');

    // Pending -> Review -> Approved
    await request('PATCH', `/api/tasks/${taskId}/status`, { status: 'review' }, coderToken);
    const toApproved = await request(
      'PATCH',
      `/api/tasks/${taskId}/status`,
      { status: 'approved' },
      tlToken
    );
    assert(toApproved.status === 200 && toApproved.body.data.status === 'approved', 'TL approves task');

    // Approved is final state -> cannot change
    const afterApproved = await request(
      'PATCH',
      `/api/tasks/${taskId}/status`,
      { status: 'review' },
      adminToken
    );
    assert(afterApproved.status === 400, 'Approved task cannot transition (terminal state)');

    // Soft delete task (admin)
    const softDel = await request('DELETE', `/api/tasks/${taskId}`, null, adminToken);
    assert(softDel.status === 200, 'Admin can soft delete task');

    // Get deleted tasks
    const deletedList = await request('GET', '/api/tasks/deleted', null, adminToken);
    assert(deletedList.status === 200, 'Admin can list deleted tasks');
    assert(deletedList.body.data.some((t) => t.id === taskId), 'Deleted task appears in deleted list');

    // Restore task
    const restoreRes = await request('POST', `/api/tasks/${taskId}/restore`, null, adminToken);
    assert(restoreRes.status === 200 && restoreRes.body.data.id === taskId, 'Admin can restore task');

    // Cleanup created test clan
    await request('DELETE', `/api/clans/${clan2Id}`, null, adminToken);
    await request('DELETE', `/api/coders/${testCoderId}`, null, adminToken);

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% Functional.');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  if (server) server.close();
  process.exit(1);
});
