import puppeteer from "puppeteer";

export const searchFilms = async (text) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1500,
    height: 768,
  });
  await page.goto("https://kino.kinolord1.pics/?ysclid=lqmtvz6fvm62926282");
  await page.type("input#story", text);
  await page.keyboard.press("Enter");
  await page.waitForSelector(".th-item");

  const filmData = await page.evaluate(() => {
    const films = [];
    const items = document.querySelectorAll(".th-item");

    items.forEach((item) => {
      const title = item.querySelector(".th-title").textContent;
      const href = item.querySelector("a.th-in").getAttribute("href");
      const imageSrc = item
        .querySelector("meta[itemprop='image']")
        .getAttribute("content");

      films.push({ title, href, imageSrc });
    });

    return films;
  });
  return filmData;
};
