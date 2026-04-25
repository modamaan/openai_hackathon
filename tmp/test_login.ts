async function test() {
  const r = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "google" }),
  });
  console.log("Status:", r.status);
  const text = await r.text();
  console.log("Response:", text.substring(0, 200));
}
test();
