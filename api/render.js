// File: api/render.js
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
  // Cuma terima request POST
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { html } = req.body;
  if (!html) return res.status(400).send('HTML is required');

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 520, height: 1000, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Seleksi class .container buat di-screenshot
    const element = await page.$(".container");
    const buffer = await element.screenshot({ type: "png", omitBackground: true });

    await browser.close();

    // Kirim balik sebagai file gambar PNG murni
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
