import puppeteer from "puppeteer";
import cheerio from "cheerio";

export const axiosGet = async (url) => {
  return new Promise(async (resolve, reject) => {
    let filmUrl = null;
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1366,
      height: 720,
    });

    page.on("response", async (response) => {
      const requestUrl = response.url();
      if (
        response.request().resourceType() === "xhr" &&
        requestUrl.includes("plground.live:10402/hs") &&
        response.status() === 200
      ) {
        resolve(requestUrl);
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000);
    page.close();
    browser.close();
  });
};
