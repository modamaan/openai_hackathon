import { ZenRows } from "zenrows";

const client = new ZenRows("99b7fae1346065561a3597b69b59616d00b1a13b"); // using a temp dummy key just to simulate structure
// We will just use native fetch to test what safcoconstructions.com returns

async function test() {
  try {
    const res = await fetch("https://safcoconstructions.com/");
    const html = await res.text();
    console.log("Status:", res.status);
    console.log("HTML length:", html.length);
    console.log("HTML snippet:", html.slice(0, 500));
  } catch (err) {
    console.error(err);
  }
}
test();
