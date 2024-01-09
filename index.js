import express from "express";
import cors from "cors";
import { axiosGet } from "./axiosGet.js";
import { searchFilms } from "./searchFilms.js";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { generateRoomId } from "./generateRoomId.js";
import { getFilms } from "./getFilms.js";
import axios from "axios";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://yungjabo.github.io/cinemaClient",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

let rooms = [];

app.get("/search-films", async (req, res) => {
  const text = req.query.text;
  const roomId = req.query.roomId;
  const filmData = await searchFilms(text);

  // res.send(filmData);
});
app.get("/upload-film", async (req, res) => {
  const filmUrl = req.query.url;
  console.log(filmUrl);
  const videoUrl = await axiosGet(filmUrl);
  console.log(videoUrl);
  res.send(videoUrl);
});
app.get("/", async (req, res) => {
  res.send("Server is working!");
});

io.on("connection", async (socket) => {
  console.log("Новое подключение");

  socket.on("message:getRoom", () => {
    console.log("Сервер");
    let roomId = generateRoomId();
    while (rooms.some((room) => room.id === roomId)) {
      roomId = generateRoomId();
    }
    const newRoom = {
      id: roomId,
      sockets: [socket],
      state: {
        isPlaying: false,
        time: 0,
        films: [],
        film: "",
      },
    };
    rooms.push(newRoom);
    socket.emit("roomId", newRoom.id);
  });
  socket.on("message:setLocalRoom", (roomId) => {
    console.log("local");
    let isRoom = false;
    let newRoom = {};
    rooms.forEach((room) => {
      if (room.id === roomId) {
        room.sockets.push(socket);
        isRoom = true;
        newRoom = room;
      }
    });
    if (!isRoom) {
      newRoom = {
        id: roomId,
        sockets: [socket],
        state: {
          isPlaying: false,
          time: 0,
          films: [],
          film: "",
        },
      };
    }
    rooms.push(newRoom);
    socket.emit("room:roomState", newRoom.id, newRoom.state);
  });
  socket.on("room:changeRoom", (roomId) => {
    rooms.forEach((room) => {
      room.sockets = room.sockets.filter((sock) => sock !== socket);
      rooms = rooms.filter((room) => room.sockets.length > 0);
    });
    rooms.forEach((room) => {
      if (room.id === roomId) {
        room.sockets.push(socket);
        socket.emit("room:roomState", room.id, room.state);
      }
    });
    console.log(rooms);
  });
  socket.on("player:searchFilms", async (text, roomId) => {
    const filmData = await getFilms(text);
    rooms.forEach((room) => {
      if (room.id === roomId) {
        room.state.films = filmData;
        room.sockets.forEach((socket) => {
          io.to(socket.id).emit("player:films", filmData);
        });
      }
    });
    // const filmData = await searchFilms(text);
    // rooms.forEach((room) => {
    //   if (room.id === roomId) {
    //     room.state.films = filmData;
    //     room.sockets.forEach((socket) => {
    //       io.to(socket.id).emit("player:films", filmData);
    //     });
    //   }
    // });
  });
  socket.on("player:uploadFilm", async (url, roomId) => {
    const videoUrl =
      "https://cdn4572.vb17123filippaaniketos.pw/stream2/cdn-400/d702354572091eed9d51ca58d8155d4a/=wkMxwmWHxGaMJDey0ERFZ3YzIVeadlR0x0MkNDZ5lzMkNzY2llM5UHZHZVdkNUO6RGSKxWWXBjda1GbzJGWNZ3THp0aZRFaqlFVGpmWtZEbNdlVt1EVFFjTEVlMPdlUolFVrhnWUZ1aZJjSr5EVWlWTE5EaOpnSp1ERrRjTyk1dO1WW04ERWpWTEJEbNJTW35kaChWTR1TP:1704406404:95.24.151.214:f9a16da7a2967ff4570edc40215d58f77d7767aad80948e6c341454bd6e418f7/hls/720.m3u8";
    // let videoUrl = await axiosGet(url);
    // videoUrl = videoUrl.slice(0, -10) + "720/index.m3u8";
    console.log(videoUrl);
    rooms.forEach((room) => {
      if (room.id === roomId) {
        room.state.film = videoUrl;
        room.state.isPlaying = false;
        room.state.time = 0;
        room.sockets.forEach((socket) => {
          io.to(socket.id).emit("player:film", videoUrl);
        });
      }
    });
  });

  socket.on("playVideo", (roomId) => {
    console.log("play");
    rooms.forEach((room) => {
      if (room.id === roomId) {
        room.state.isPlaying = true;
        room.sockets.forEach((sock) => {
          if (sock !== socket) {
            io.to(sock.id).emit("player:playVideo");
          }
        });
      }
    });
  });
  socket.on("pauseVideo", (roomId) => {
    console.log("pause");
    rooms.forEach((room) => {
      if (room.id === roomId) {
        room.state.isPlaying = false;
        room.sockets.forEach((sock) => {
          if (sock !== socket) {
            io.to(sock.id).emit("player:pauseVideo");
          }
        });
      }
    });
  });
  socket.on("seekVideo", (roomId, time) => {
    console.log("seek");
    rooms.forEach((room) => {
      if (room.id === roomId) {
        room.state.time = time;
        room.sockets.forEach((sock) => {
          if (sock !== socket) {
            io.to(sock.id).emit("player:seekVideo", time);
          }
        });
      }
    });
  });
  socket.on("disconnect", () => {
    console.log("Отключен");
    rooms.forEach((room) => {
      room.sockets = room.sockets.filter((sock) => sock !== socket);
      rooms = rooms.filter((room) => room.sockets.length > 0);
    });
  });
  // socket.on("message:getRoom", () => {
  //   console.log("Сервер");
  //   let roomId = generateRoomId();
  //   while (rooms.some((room) => room.roomId === roomId)) {
  //     roomId = generateRoomId();
  //   }
  //   socket.roomId = roomId;
  //   rooms.push(socket);
  //   socket.emit("roomId", roomId);
  // });
  // socket.on("message:setLocalRoom", (roomId) => {
  //   console.log("Локал");
  //   socket.roomId = roomId;
  //   rooms.some((room) => {
  //     if (room.roomId === roomId) {
  //       if (room.films) {
  //         socket.emit("player:films", room.films);
  //       }
  //       console.log(room);
  //       if (room.film) {
  //         socket.emit("player:film", room.film);
  //       }
  //       socket.films = room.films ? room.films : [];
  //       socket.film = room.film ? room.film : "";
  //       return true;
  //     }
  //   });
  //   rooms.push(socket);
  // });

  // socket.on("player:searchFilms", async (text, roomId) => {
  //   const filmData = await searchFilms(text);
  //   rooms = rooms.map((room) => {
  //     if (room.id === socket.id) {
  //       return { ...room, films: filmData };
  //     } else {
  //       return room;
  //     }
  //   });
  //   console.log(rooms);
  //   rooms.forEach((room) => {
  //     if (room.roomId === roomId) {
  //       io.to(room.id).emit("player:films", filmData);
  //     }
  //   });
  // });
  // socket.on("player:uploadFilm", async (url, roomId) => {
  //   const videoUrl = await axiosGet(url);
  //   rooms = rooms.map((room) => {
  //     if (room.id === socket.id) {
  //       return { ...room, film: videoUrl };
  //     } else {
  //       return room;
  //     }
  //   });
  //   rooms.forEach((room) => {
  //     if (room.roomId === roomId) {
  //       io.to(room.id).emit("player:film", videoUrl);
  //     }
  //   });
  // });
  // socket.on("room:changeRoom", async (roomId) => {
  //   let isRoom = false;
  //   rooms.forEach((room) => {
  //     if (room.roomId === roomId) {
  //       isRoom = true;
  //     }
  //   });
  //   if (isRoom) {
  //     rooms = rooms.map((room) => {
  //       if (room.id === socket.id) {
  //         return { ...room, roomId: roomId };
  //       } else {
  //         return room;
  //       }
  //     });
  //   }
  //   socket.emit("roomId", roomId);
  // });

  // socket.on("disconnect", () => {
  //   console.log("Отключен");
  //   socket.broadcast.emit("disk", "A user has disconnected");
  //   rooms = rooms.filter((room) => room.id !== socket.id);
  // });
});

// socket.broadcast.to(roomId).emit("message:add", message);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
