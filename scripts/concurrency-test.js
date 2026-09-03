// Fires genuinely concurrent join requests against a real running backend,
// then verifies the results directly — actual proof, not just code review.

const QUEUE_ID = process.argv[2]; // pass your queue ID as a command-line argument
const NUM_CUSTOMERS = 8;
const API_BASE = "http://localhost:4000/api";

async function registerAndLogin(email) {
  await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123", name: email, role: "CUSTOMER" }),
  }).catch(() => {}); // ignore if already registered

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" }),
  });
  const data = await res.json();
  return data.data.token;
}

async function joinQueue(token) {
  const res = await fetch(`${API_BASE}/queues/${QUEUE_ID}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function main() {
  if (!QUEUE_ID) {
    console.error("Usage: node scripts/concurrency-test.js <queueId>");
    process.exit(1);
  }

  console.log(`Preparing ${NUM_CUSTOMERS} test customers...`);
  const tokens = [];
  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const token = await registerAndLogin(`concurrency-test-${i}@test.com`);
    tokens.push(token);
  }

  console.log(`Firing ${NUM_CUSTOMERS} SIMULTANEOUS join requests...`);
  const results = await Promise.all(tokens.map((token) => joinQueue(token)));

  const successfulTokens = results
    .filter((r) => r.success)
    .map((r) => r.data.tokenNumber);

  const uniqueTokens = new Set(successfulTokens);

  console.log("\n=== RESULTS ===");
  console.log("Successful joins:", successfulTokens.length);
  console.log("Token numbers assigned:", successfulTokens.sort((a, b) => a - b));
  console.log("Unique token count:", uniqueTokens.size);

  if (uniqueTokens.size !== successfulTokens.length) {
    console.error("❌ FAIL: Duplicate token numbers detected!");
    process.exit(1);
  } else {
    console.log("✅ PASS: Every token number is unique. No collisions under real concurrent load.");
  }

  const failures = results.filter((r) => !r.success);
  if (failures.length > 0) {
    console.log("\nRejected requests (expected if queue already had waiting entries):");
    failures.forEach((f) => console.log(" -", f.error?.code, f.error?.message));
  }
}

main();