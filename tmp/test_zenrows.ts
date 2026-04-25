import { config } from "dotenv";
config({ path: ".env.local" });

import { ZenRows } from "zenrows";

async function main() {
  const client = new ZenRows(process.env.ZENROWS_API_KEY!);
  console.log("Fetching safcoconstructions...");
  try {
    const response = await client.get("https://safcoconstructions.com/", {
      js_render: false,
      premium_proxy: false,
    });
    
    console.log("typeof response:", typeof response);
    if (typeof response === "object" && response !== null) {
      console.log("Keys in response:", Object.keys(response));
      console.log("typeof response.data:", typeof (response as any).data);
      if (typeof (response as any).data === "string") {
        console.log("Length of response.data:", ((response as any).data as string).length);
        console.log("Snippet:", ((response as any).data as string).slice(0, 100));
      }
    } else {
      console.log("response:", response);
    }
  } catch (err) {
    console.error("Zenrows error:", err);
  }
}
main();
