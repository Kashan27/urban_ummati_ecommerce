// Note: We'll use fetch directly since we just need to hit the ShipStation API
// We rely on the environment variables already present in the workspace

async function registerWebhook() {
  const key = process.env.SHIPSTATION_API_KEY;
  const secret = process.env.SHIPSTATION_API_SECRET;
  const targetUrl = "https://urban-ummati.vercel.app/api/integrations/shipstation/webhook";

  if (!key || !secret) {
    console.error("Error: SHIPSTATION_API_KEY or SHIPSTATION_API_SECRET is missing from environment variables.");
    process.exit(1);
  }

  console.log(`Registering webhook for: ${targetUrl}`);

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  try {
    const response = await fetch("https://ssapi.shipstation.com/webhooks/subscribe", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        target_url: targetUrl,
        event: "SHIP_NOTIFY",
        friendly_name: "Real-Time Tracking Webhook (Portal)"
      })
    });

    const data = (await response.json().catch(() => null)) as any;

    if (response.ok) {
      console.log("Success! Webhook registered successfully.");
      console.log("Webhook ID:", data.id || data.webHookId);
    } else {
      console.error("Failed to register webhook.");
      console.error("Status:", response.status);
      console.error("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("An error occurred during registration:", error);
  }
}

registerWebhook();
