// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import http from "http";
// import { Server, Socket } from "socket.io";
// import { createClient } from "redis";
// import cors from "cors";
// import "./utils/redis";
// import "./SuperNode";
// import { redisReplica } from "./utils/redis";
// import axios from "axios";

// const app = express();

// const options: cors.CorsOptions = {
//   origin: "*",
// };
// app.use(cors(options));
// app.use(express.urlencoded({ extended: true }));

// app.use(express.json({ limit: "50mb" }));
// const server = http.createServer(app);
// export const io = new Server(server, {
//   cors: {
//     origin: ["*"],
//     methods: ["GET", "POST"],
//   },
//   transports: ["websocket", "polling"],
// });

// const redisClient = createClient();
// redisClient.connect();

// redisClient.on("connect", () => {
//   console.log("connected to Redis");
// });

// redisClient.on("error", (err) => {
//   console.error(err);
// });

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });


// app.post("/fancy-suspend",(req,res)=>{
//   console.log("fancy suspend ", req.body);

//  try {

//    const fancy = req.body.fancy;
//    const type =  req.body.type;
//    const matchId = req.body.matchId
  
//    io.to(matchId).emit("suspendedFancy",{fancy,type})
//    res.json({ success: true, message: "Fancy suspended successfully" });
//  } catch (error) {
//   console.error("Error in fancy suspend:", error);
//   res.status(500).send("Internal Server Error");
//  }
// })

// // io.on("connection", (socket: Socket) => {
// //   console.log("a user connected");

// //   socket.on("joinRoomMatchIdWUserId", (room) => {
// //     socket.join(room);
// //   });

// //   socket.on("userRoomJoin", ({ userId }) => {
// //     userId = `user-${userId}`;
// //     socket.join(userId);
// //   });

// //   // socket.on("login", (user: any) => {
// //   //   // Check if user is already online
// //   //   const userId = `user-${user._id}`;
// //   //   socket.join(userId);
// //   //   redisClient
// //   //     .get(userId)
// //   //     .then((data: any) => {
// //   //       const result = data
// //   //         ? JSON.parse(data)
// //   //         : {
// //   //             socketId: null,
// //   //             loggedIn: false,
// //   //             user: { sessionId: null },
// //   //             _id: null,
// //   //           };
// //   //       // User is already online, emit "logout" event to other sockets
// //   //       if (
// //   //         user.role !== "admin" &&
// //   //         user.sessionId !== result?.user?.sessionId
// //   //       ) {
// //   //         io.to(result.socketId).emit("logout", {
// //   //           userId,
// //   //           sessionId: user.sessionId,
// //   //         });
// //   //       }
// //   //       // Set user online status to true in Redis with an expiration time of 60 seconds
// //   //       redisClient
// //   //         .set(
// //   //           userId,
// //   //           JSON.stringify({ socketId: socket.id, loggedIn: true, user }),
// //   //           {
// //   //             EX: 365 * 24 * 60 * 60, // 1 year in seconds (31,536,000)
// //   //           }
// //   //         ) // 2 days expiry
// //   //         .then(() => {
// //   //           console.log(`${userId} is now online`);
// //   //         })
// //   //         .catch((err) => {
// //   //           console.error(err);
// //   //         });
// //   //     })
// //   //     .catch((err) => {
// //   //       console.error(err);
// //   //     });
// //   // });

// // // socket.on("login", async (user: any) => {
// // //   try {
// // //     const userId = user._id;
// // //     const redisKey = `user-${userId}:${socket.id}`;

// // //     // User ke liye ek room join karwana
// // //     socket.join(`user-${userId}`);

// // //     // Agar user admin nahi hai, to purane sessions delete karo
// // //     if (user.role !== "admin") {
// // //       const pattern = `user-${userId}:*`;
// // //       const keys = await redisClient.keys(pattern);

// // //       for (const key of keys) {
// // //         const data = await redisClient.get(key);
// // //         if (data) {
// // //           const session = JSON.parse(data);
// // //           if (session.socketId) {
// // //             io.to(session.socketId).emit("logout", {
// // //               userId,
// // //               reason: "Another device login",
// // //             });
// // //           }
// // //         }
// // //         await redisClient.del(key); // purana session delete
// // //       }
// // //     }

// // //     // Naya session Redis me save karo
// // //     await redisClient.set(
// // //       redisKey,
// // //       JSON.stringify({
// // //         socketId: socket.id,
// // //         loggedIn: true,
// // //         user,
// // //       }),
// // //       { EX: 365 * 24 * 60 * 60 } // 1 year
// // //     );

// // //     console.log(`✅ ${redisKey} is now online`);
// // //   } catch (err) {
// // //     console.error("❌ Login error:", err);
// // //   }
// // // });





// // socket.on("login", (user: any) => {
// //     // Check if user is already online
// //     const userId = `user-${user._id}`;
// //     socket.join(userId);
// //     console.log(user,"GHJK")
// //     redisClient
// //       .get(userId)
// //       .then((data: any) => {
// //         console.log(data,"dataa is here")
// //         const result = data
// //           ? JSON.parse(data)
// //           : {
// //               socketId: null,
// //               loggedIn: false,
// //               user: { sessionId: null },
// //               _id: null,
// //             };
// //         // User is already online, emit "logout" event to other sockets
// //         if (
// //           user.role !== "admin" &&
// //           user.sessionId !== result?.user?.sessionId
// //         ) {
// //           io.to(result.socketId).emit("logout", {
// //             userId,
// //             sessionId: user.sessionId,
// //           });
// //         }
// //         // Set user online status to true in Redis with an expiration time of 60 seconds
// //         redisClient
// //           .set(
// //             userId,
// //             JSON.stringify({ socketId: socket.id, loggedIn: true, user }),
// //             {
// //               EX: 24 * 60 * 60 * 2,
// //             }
// //           ) // 2 days expiry
// //           .then(() => {
// //             console.log(`${userId} is now online`);
// //           })
// //           .catch((err) => {
// //             console.error(err);
// //           });
// //       })
// //       .catch((err) => {
// //         console.error(err);
// //       });
// //   });



// //   socket.on("logout", (userId: string) => {
// //     userId = `user-${userId}`;
// //     // Set user online status to false in Redis
// //     redisClient
// //       .del(userId)
// //       .then(() => {
// //         console.log(`${userId} is now offline`);
// //       }) 
// //       .catch((err) => {
// //         console.error(err);
// //       });
// //   });

// //   // socket.on("logoutAll", () => {
// //   //   console.log("logoutAll is called hahahah")
// //   //       // userId = `user-${userId}`;

// //   //   redisClient
// //   //     .keys("user-*")
// //   //     .then((keys) => {
// //   //       // For each key in Redis, set its value to false to mark the user as offline
// //   //       console.log(keys,"keys")
// //   //       keys.forEach((key) => {
// //   //         redisClient.del(key);
// //   //         // Emit a "logout" event to all connected sockets to notify them that the user has logged out
// //   //         console.log(key,"key is here")
// //   //         socket.broadcast.emit("logout", key);
// //   //       });
// //   //     })
// //   //     .then(() => {
// //   //       console.log("All users have been logged out");
// //   //     })
// //   //     .catch((err) => {
// //   //       console.error(err);
// //   //     });
// //   //   socket.emit("loggedOut", "All user logged out");
// //   // });



// // //   socket.on("logout", async (userId: string) => {
// // //   try {
// // //     const redisKey = `user-${userId}:${socket.id}`;

// // //     await redisClient.del(redisKey);

// // //     socket.leave(`user-${userId}`);

// // //     console.log(`🚪 ${redisKey} is now offline`);
// // //   } catch (err) {
// // //     console.error("❌ Logout error:", err);
// // //   }
// // // });


// // socket.on("logoutAll", async (userId: string) => {
// //   try {
// //     const pattern = `user-${userId}:*`;
// //     const keys = await redisClient.keys(pattern);
// //     console.log(keys,"keys is here")
// //     for (const key of keys) {
// //       const data = await redisClient.get(key);
// //       const session = data ? JSON.parse(data) : null;

// //       if (session?.socketId) {
// //         io.to(session.socketId).emit("logout", {
// //           userId,
// //          });
// //       }

// //       await redisClient.del(key);
// //       console.log(`❌ Session cleared: ${key}`);
// //     }

// //     socket.emit("loggedOut", "All sessions logged out ✅");
// //   } catch (err) {
// //     console.error("❌ LogoutAll error:", err);
// //   }
// // });


// //   socket.on("logoutSp", async (userId) => {
// //   try {
// //     console.log("logoutAll called for user:", userId);

// //     // Redis key pattern for that user's sessions
// //     const pattern = `user-${userId}:*`;

// //     const keys = await redisClient.keys(pattern);

// //     for (const key of keys) {
// //       // Delete session from Redis
// //       await redisClient.del(key);

// //       // Extract sessionId from key (user-123:sessionId)
// //       const sessionId = key.split(":")[1];

// //       // Emit logout event to all sockets with this session
// //       socket.broadcast.emit("logout", { sessionId });

// //       console.log("🔒 Logged out session:", sessionId);
// //     }

// //     socket.emit("loggedOut", `All sessions of user ${userId} logged out`);
// //     console.log("✅ All sessions cleared for user:", userId);
// //   } catch (err) {
// //     console.error("❌ logoutAll Error:", err);
// //   }
// // });


// //   socket.on("place-bet", (bet) => {
// //     if (bet.parentStr) {
// //       bet.parentStr.map((parent: any) => {
// //         socket.to(`${parent}-${bet.matchId}`).emit("placedBet", bet);
// //       });
// //     }
// //   });

// //   socket.on("on-rollback-place-bet", (bet) => {
// //     console.log("rollback call", bet);
// //     if (bet.userId) {
// //       socket.to(`${bet.userId}-${bet.matchId}`).emit("placedBet", bet);
// //     }
// //   });

// //   socket.on("updateExposer", ({ exposer, balance, userId,commision }) => {
// //     console.log("expopppp", exposer, balance, userId);
// //     io.sockets.to(`user-${userId}`).emit("updateExposer", { exposer, balance, commision});
// //   });

// //   socket.on("betDelete", ({ betId, userId }) => {
// //     io.to(`user-${userId}`).emit("betDelete", { betId });
// //   });

// //   socket.on("disconnect", () => {
// //     console.log("user disconnected");
// //   });
// // });




// io.on("connection", (socket: Socket) => {
//   console.log("a user connected");

//   socket.on("joinRoomMatchIdWUserId", (room) => {
//     socket.join(room);
//   });

//   socket.on("userRoomJoin", ({ userId }) => {
//     userId = `user-${userId}`;
//     socket.join(userId);
//   });

//   socket.on("login", (user: any) => {
//     // Check if user is already online
//     const userId = `user-${user._id}`;
//     socket.join(userId);
//     redisClient
//       .get(userId)
//       .then((data: any) => {
//         const result = data
//           ? JSON.parse(data)
//           : {
//               socketId: null,
//               loggedIn: false,
//               user: { sessionId: null },
//               _id: null,
//             };
//         // User is already online, emit "logout" event to other sockets
//         if (
//           user.role !== "admin" &&
//           user.sessionId !== result?.user?.sessionId
//         ) {
//           io.to(result.socketId).emit("logout", {
//             userId,
//             sessionId: user.sessionId,
//           });
//         }
//         // Set user online status to true in Redis with an expiration time of 60 seconds
//         redisClient
//           .set(
//             userId,
//             JSON.stringify({ socketId: socket.id, loggedIn: true, user }),
//             {
//               EX: 24 * 60 * 60 * 2,
//             }
//           ) // 2 days expiry
//           .then(() => {
//             console.log(`${userId} is now online`);
//           })
//           .catch((err) => {
//             console.error(err);
//           });
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   });

//   socket.on("logout", (userId: string) => {
//     userId = `user-${userId}`;
//     console.log("hellow world ",userId)
//     // Set user online status to false in Redis
//     redisClient
//       .del(userId)
//       .then(() => {
//         console.log(`${userId} is now offline`);
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   });

//   socket.on("logoutAll", () => {
//     redisClient
//       .keys("user-*")
//       .then((keys) => {
//         // For each key in Redis, set its value to false to mark the user as offline
//         keys.forEach((key) => {
//           redisClient.del(key);
//           // Emit a "logout" event to all connected sockets to notify them that the user has logged out
//           socket.broadcast.emit("logout", key);
//         });
//       })
//       .then(() => {
//         console.log("All users have been logged out");
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//     socket.emit("loggedOut", "All user logged out");
//   });

//   socket.on("place-bet", (bet) => {
//     if (bet.parentStr) {
//       bet.parentStr.map((parent: any) => {
//         socket.to(`${parent}-${bet.matchId}`).emit("placedBet", bet);
//       });
//     }
//   });

//   socket.on("on-rollback-place-bet", (bet) => {
//     console.log("rollback call", bet);
//     if (bet.userId) {
//       socket.to(`${bet.userId}-${bet.matchId}`).emit("placedBet", bet);
//     }
//   });

//   socket.on("updateExposer", ({ exposer, balance, userId }) => {
//     console.log("expopppp", exposer, balance, userId);
//     io.sockets.to(`user-${userId}`).emit("updateExposer", { exposer, balance });
//   });

//   socket.on("betDelete", ({ betId, userId }) => {
//     io.to(`user-${userId}`).emit("betDelete", { betId });
//   });

//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
// });


// const PORT = process.env.PORT || 3001;

// server.listen(PORT, () => {
//   console.log(`listening on *:${PORT}`);
// });

// redisReplica.subscribe("saveCasinoData", (message: any) => {
//   const data = JSON.parse(message);

//   axios
//     .post(`${process.env.CLIENT_NODE_URL}/save-casino-match`, {
//       data: {
//         mid: data.mid,
//         gameType: data.gameType,
//         ...{ ...data.data, status: "processing" },
//       },
//     })
//     .then(() => {})
//     .catch((err: any) => console.log("save casino match", err.stack));
// });



import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { createClient } from "redis";
import cors from "cors";
import "./utils/redis";
import "./SuperNode";
import { redisReplica } from "./utils/redis";
import axios from "axios";

const app = express();

const options: cors.CorsOptions = {
  origin: "*",
};
app.use(cors(options));
app.use(express.urlencoded({ extended: true }));

app.use(express.json({ limit: "50mb" }));
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ["*"],
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

const redisClient = createClient();
redisClient.connect();

redisClient.on("connect", () => {
  console.log("connected to Redis");
});

redisClient.on("error", (err) => {
  console.error(err);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.post("/fancy-suspend",(req,res)=>{
  console.log("fancy suspend ", req.body);

 try {

   const fancy = req.body.fancy;
   const type =  req.body.type;
   const matchId = req.body.matchId
  
   io.to(matchId).emit("suspendedFancy",{fancy,type})
   res.json({ success: true, message: "Fancy suspended successfully" });
 } catch (error) {
  console.error("Error in fancy suspend:", error);
  res.status(500).send("Internal Server Error");
 }
})

io.on("connection", (socket: Socket) => {
  console.log("a user connected");

  socket.on("joinRoomMatchIdWUserId", (room) => {
    socket.join(room);
  });

  socket.on("userRoomJoin", ({ userId }) => {
    userId = `user-${userId}`;
    socket.join(userId);
  });

  socket.on("login", (user: any) => {
    // Check if user is already online
    const userId = `user-${user._id}`;
    socket.join(userId);
    redisClient
      .get(userId)
      .then((data: any) => {
        const result = data
          ? JSON.parse(data)
          : {
              socketId: null,
              loggedIn: false,
              user: { sessionId: null },
              _id: null,
            };
        // User is already online, emit "logout" event to other sockets
        if (
          user.role !== "admin" &&
          user.sessionId !== result?.user?.sessionId
        ) {
          io.to(result.socketId).emit("logout", {
            userId,
            sessionId: user.sessionId,
          });
        }
        // Set user online status to true in Redis with an expiration time of 60 seconds
        redisClient
          .set(
            userId,
            JSON.stringify({ socketId: socket.id, loggedIn: true, user }),
            {
              EX: 365 * 24 * 60 * 60, // 1 year in seconds (31,536,000)
            }
          ) // 2 days expiry
          .then(() => {
            console.log(`${userId} is now online`);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });

  socket.on("logout", (userId: string) => {
    userId = `user-${userId}`;
    // Set user online status to false in Redis
    redisClient
      .del(userId)
      .then(() => {
        console.log(`${userId} is now offline`);
      }) 
      .catch((err) => {
        console.error(err);
      });
  });

  socket.on("logoutAll", () => {
    redisClient
      .keys("user-*")
      .then((keys) => {
        // For each key in Redis, set its value to false to mark the user as offline
        keys.forEach((key) => {
          redisClient.del(key);
          // Emit a "logout" event to all connected sockets to notify them that the user has logged out
          socket.broadcast.emit("logout", key);
        });
      })
      .then(() => {
        console.log("All users have been logged out");
      })
      .catch((err) => {
        console.error(err);
      });
    socket.emit("loggedOut", "All user logged out");
  });

  socket.on("place-bet", (bet) => {
    if (bet.parentStr) {
      bet.parentStr.map((parent: any) => {
        socket.to(`${parent}-${bet.matchId}`).emit("placedBet", bet);
      });
    }
  });

  socket.on("on-rollback-place-bet", (bet) => {
    console.log("rollback call", bet);
    if (bet.userId) {
      socket.to(`${bet.userId}-${bet.matchId}`).emit("placedBet", bet);
    }
  });

  socket.on("updateExposer", ({ exposer, balance, userId,commision }) => {
    console.log("expopppp", exposer, balance, userId);
    io.sockets.to(`user-${userId}`).emit("updateExposer", { exposer, balance, commision});
  });

  socket.on("betDelete", ({ betId, userId }) => {
    io.to(`user-${userId}`).emit("betDelete", { betId });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});



const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

redisReplica.subscribe("saveCasinoDatahjk", (message: any) => {
  const data = JSON.parse(message);

  axios
    .post(`${process.env.CLIENT_NODE_URL}/save-casino-match`, {
      data: {
        mid: data.mid,
        gameType: data.gameType,
        ...{ ...data.data, status: "processing" },
      },
    })
    .then(() => {})
    .catch((err: any) => console.log("save casino match", err.stack));
});
