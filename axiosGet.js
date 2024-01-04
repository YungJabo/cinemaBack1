import puppeteer from "puppeteer";

export const axiosGet = async (url) => {
  return new Promise(async (resolve, reject) => {
    let filmUrl = null;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
      width: 1366,
      height: 720,
    });

    page.on("response", async (response) => {
      const requestUrl = response.url();
      // console.log(requestUrl);
      if (
        response.request().resourceType() === "xhr" &&
        requestUrl.includes("vb17123filippaaniketos.pw/stream2") &&
        response.status() === 200
      ) {
        const regex = /hls\/\d+\.m3u8/g;
        await page.goto(requestUrl);
        const resolutions = await page.content();
        const matches = resolutions.match(regex);
        console.log(matches);
        // filmUrl = requestUrl;
        // console.log(filmUrl);
        // resolve(filmUrl);
      }
    });

    await page.goto(
      url,
      { timeout: 7000 }

      // () => {
      //   page.close();
      //   browser.close();
      // }
    );
    await page.evaluate(() => {
      window.scrollTo(0, 1000);
    });
  });
};
