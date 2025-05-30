import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 4000;

const API_URL = "https://api.browser-use.com/api/v1/run-task";
const BEARER_TOKEN = "bu_zr6ICGIUP_DqaaUxElFbHfvC0Eu4K5Z7GKslFZMGiQ4";

app.use(cors());
app.use(express.json());

app.post("/run-task", async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: "Missing origin or destination" });
  }

  const prompt = `
// open web
browser.open("https://ecomm.one-line.com/one-ecom/");

// Login
browser.wait_for_element("#avatar-icon");
browser.click("#avatar-icon");
browser.wait_for_element("a:has-text('Login')");
browser.click("a:has-text('Login')");
browser.wait_for_element("#capture_signIn_userId");
browser.send_keys("#capture_signIn_userId", "PORTXUSER");
browser.send_keys("#capture_signIn_currentPassword", "XUP5uvy9yxy.hjw_vpz");
browser.click("#signInSubmitButton");
browser.wait_for_element("a:has-text('Schedule')");

// Login success
browser.wait_for_element("#avatar-icon");
browser.click("#avatar-icon");
browser.wait_for_element("div:has-text('Tomonari Ishida')");

// Open booking quick page
browser.open("https://ecomm.one-line.com/one-ecom/booking/quick-booking");
browser.wait_for_url_contains("/booking/quick-booking");
browser.wait_for_element("h1:has-text('Quick Booking')");

// Search booking
browser.wait_for_element("input[name='origin']");
browser.send_keys("input[name='origin']", "${origin}");
browser.wait_for_element("li");
browser.evaluate(() => {
  const items = Array.from(document.querySelectorAll("li"));
  const target = items.find(el => el.textContent.includes("(CY)"));
  if (target) target.click();
});

browser.wait_for_element("input[name='destination']");
browser.send_keys("input[name='destination']", "${destination}");
browser.wait_for_element("li");
browser.evaluate(() => {
  const items = Array.from(document.querySelectorAll("li"));
  const target = items.find(el => el.textContent.includes("(CY)"));
  if (target) target.click();
});

browser.wait_for_element("#headlessui-listbox-button-\\:rg7\\:");
browser.click("#headlessui-listbox-button-\\:rg7\\:");

browser.wait_for_element("span:has-text('No Contract')");
browser.click("span:has-text('No Contract')");

browser.wait_for_element("button:has-text('Search')");
browser.click("button:has-text('Search')");
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      body: JSON.stringify({
        task: prompt,
        secrets: {},
        allowed_domains: ["ecomm.one-line.com"],
        save_browser_data: true,
        structured_output_json: "{}",
        llm_model: "gemini-2.0-flash",
        use_adblock: true,
        use_proxy: true,
        highlight_elements: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
