import axios from "axios";
import cheerio from "cheerio";

export const getFilms = async (text) => {
  const films = [];
  const response = await axios.get(`https://kino-hit.lat/search/?q=${text}`);
  const $ = cheerio.load(response.data);
  $(".short_item").each((index, element) => {
    const href = "https://kino-hit.lat" + $(element).find("a").attr("href");
    const title = $(element).find(".item_title").text();
    const img = "https://kino-hit.lat" + $(element).find("img").attr("src");
    const film = {
      href,
      title,
      img,
    };
    films.push(film);
  });
  return films;
};
