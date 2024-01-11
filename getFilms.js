import axios from "axios";
import cheerio from "cheerio";

export const getFilms = async (text) => {
  try {
    const films = [];
    const response = await axios.get(
      `https://b.kinozadrot5.cc/index.php?do=search&subaction=search&titleonly=3&story=${text}`
    );
    const $ = cheerio.load(response.data);
    $(".th-item").each((index, element) => {
      const href = $(element).find("a").attr("href");
      const title = $(element).find(".th-title").text();
      const img =
        "https://b.kinozadrot5.cc/" +
        $(element).find(".th-img img").attr("src");
      const film = {
        href,
        title,
        img,
      };
      films.push(film);
    });
    return films;
  } catch (error) {
    console.log(error);
  }
};
