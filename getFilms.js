import axios from "axios";
import cheerio from "cheerio";

export const getFilms = async (text) => {
  const films = [];
  const response = await axios.get(
    `https://kinovodone3.kinoteatr.cam/search?do=search&subaction=search&q=${text}`
  );
  const $ = cheerio.load(response.data);
  $(".th-item").each((index, element) => {
    const href =
      "https://kinovodone3.kinoteatr.cam" + $(element).find("a").attr("href");
    const title = $(element).find(".title a").text();
    const year = $(element).find(".desk").text();
    const img =
      "https://kinovodone3.kinoteatr.cam" +
      $(element).find("img").attr("srcset");
    const film = {
      href,
      title,
      year,
      img,
    };
    films.push(film);
  });
  return films;
};
