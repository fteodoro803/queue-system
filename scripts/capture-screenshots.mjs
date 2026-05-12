import { chromium, devices } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

// 1) Read runtime options and decide whether this run is desktop or mobile.
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = process.env.SCREENSHOT_OUTPUT_DIR ?? "docs/screenshots";
const isMobile = process.argv.includes("--mobile");

// 2) Keep only the two curated screenshots:
//    - desktop run -> admin queue
//    - mobile run  -> patient queue
const targets = isMobile
  ? [
      {
        path: "/patient/queue",
        file: "patient-queue",
        description: "Patient queue (mobile)",
      },
    ]
  : [
      {
        path: "/admin/queue",
        file: "admin-queue",
        description: "Admin queue (desktop)",
      },
    ];

const desktopViewport = { width: 1440, height: 900 };
const mobileDevice = devices["iPhone 14 Pro"];

const filenameFor = (baseName) =>
  isMobile ? `${baseName}-mobile.png` : `${baseName}.png`;

const main = async () => {
  // 3) Ensure screenshot output directory exists.
  await fs.mkdir(outputDir, { recursive: true });

  // 4) Launch browser context with desktop or mobile emulation.
  const browser = await chromium.launch({ headless: true });
  const context = isMobile
    ? await browser.newContext({
        ...mobileDevice,
      })
    : await browser.newContext({
        viewport: desktopViewport,
        deviceScaleFactor: 1,
      });

  const page = await context.newPage();

  // 5) Visit each target route, wait briefly for reactive content, and capture.
  for (const target of targets) {
    const url = new URL(target.path, baseUrl).toString();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);

    const outputFile = path.join(outputDir, filenameFor(target.file));
    await page.screenshot({
      path: outputFile,
      fullPage: true,
    });

    console.log(`Captured ${target.description}: ${outputFile}`);
  }

  // 6) Close resources to avoid hanging processes in CI/local runs.
  await context.close();
  await browser.close();
};

main().catch((error) => {
  console.error("Screenshot capture failed.");
  console.error(error);
  process.exit(1);
});


