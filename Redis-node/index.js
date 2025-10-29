const express = require("express")
const http = require('http');
const { Server } = require('socket.io');

const Redis = require("ioredis");
const mongoose = require("mongoose");
const Match = require('./models/Match.model');
const Market = require("./models/Market.model")
const { default: axios } = require("axios");
const app = express()
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins (for development)
    methods: ["GET", "POST"]
  }
});
// const dsn ="mongodb+srv://365infayou:Jv9lwv6csl7J1Jp5@cluster365.sxln4q8.mongodb.net/infa?retryWrites=true&w=majority&appName=Cluster365&tlsAllowInvalidCertificates=true";
const dsn = "mongodb://admin:Infayou8824@69.62.123.205:27017/infa?retryWrites=true&authSource=admin&replicaSet=rs0"
//  const dsn = "mongodb+srv://infayou:HkrflNhX6UxHLSqC@cluster0.zbf0n.mongodb.net/infa?retryWrites=true&w=majority&appName=Cluster0&tlsAllowInvalidCertificates=true";
const setConnection = async () => {
  await mongoose.connect(dsn).then(() => {
    console.log("DataBase Connected Succesfully")
  }).catch((err) => {
    console.log("error in connecting DataBase", err)
  })
}

setConnection()
app.use(express.json());


// function for checking MatchList that we have data to need 

let MatchIds = []
let MarketIds = []
let MatchData = []
const getMatchid = async () => {
  // const res = await Match.find({active:true})
  const res = await axios.get(`http://195.110.59.236:3000/allMatchUsingSports/4`)
  console.log(res.data.data.t1, "response")
  MatchData = res?.data?.data?.t1
  MatchIds = res?.data?.data?.t1.map(match => match?.gmid)
  console.log(MatchIds, "MatchIds")
  marketIds = []
  for (const m of MatchIds) {
    const markets = await Market.find({ matchId: m });
    const marketIdsForMatch = markets.map(match => match.marketId);
    MarketIds.push(...marketIdsForMatch); // Spread and push all market IDs
  }

  return res;

}


setInterval(getMatchid, 1000 * 60 * 5)
getMatchid().then((res) => {
  // console.log(res,"response is here",res.length)
  // console.log(MatchIds,MarketIds,"MatchIds is here ")
}).catch((err) => {
  console.log("error in fetching data from Match", err)
})




// connnection for publisher hahha 

const publisher = new Redis({
  host: "127.0.0.1",
  port: 6379,
  // password: "yourpassword", // if Redis is secured
});


const FancyData = {}

const getFancyDataApi = () => {
  if (MatchIds.length > 0) {
    MatchIds.forEach((id) => {
      axios.get(`http://195.110.59.236:3000/allMatchData/4/${id}`).then((res) => {
        // ccconsole.log(res.data, "Fancy  data is Here hahaha")
        FancyData[id] = res.data
        // console.log(FancyData,"Fancy Data haaha")
      }).catch((err) => {
        // console.log("error in fetching Fancy data from api",err)
      })
    })
  }
}


// const formattedFancyData = async () => {
//   for (const m of MatchIds) {
//     const data = FancyData[m];
//     if (!data || !data.fancy || data.fancy.length === 0) continue;

//     const fancydata = data.fancy
//       .filter(f => 
//         f.marketType !== "MATCH_ODDS" &&
//         f.marketType !== "The Draw" &&
//         f.marketType !== "BOOKMAKER"
//       )
//       .map(f => ({


//         BackPrice1: f.runsYes,
//         BackPrice2: 0,
//         BackPrice3: 0,
//         BackSize1: f.oddsYes,
//         BackSize2: 0,
//         BackSize3: 0,
//         LayPrice1: f.runsNo,
//         LayPrice2: 0,
//         LayPrice3: 0,
//         LaySize1: f.oddsNo,
//         LaySize2: 0,
//         LaySize3: 0,
//         RunnerName: f.marketName,
//         SelectionId: f?.marketCondition?.marketId.toString(),
//         ballsess: "1",
//         gtype:
//           f.catagory === "SESSIONS"
//             ? "session"
//             : f.catagory === "ODD_EVEN"
//             ? "oddeven"
//             : f.catagory?.toLowerCase(),
//         GameStatus: "",
//         gtstatus: "",
//         max: "50000",
//         min: "100",
//         remm: "",
//         srno: f.sortingOrder.toString(),
//         mname:
//           f.catagory === "SESSIONS"
//             ? "session"
//             : f.catagory === "ODD_EVEN"
//             ? "oddeven"
//             : f.catagory?.toLowerCase() === "w/p/xtra"
//             ? "session"
//             : f?.catagory?.toLowerCase(),
//       }));

//     await publisher.set(`fancy-${m}`, JSON.stringify(fancydata));
//     console.log(`Saved fancy-${m} to Redis ✅`);
//   }
// };




// const formattedFancyData = async () => {
//   for (const m of MatchIds) {
//     const data = FancyData[m];
//     // console.log(data, "data");

//     if (!data || !data?.data || data?.data.length === 0) continue;

//     // const CheckingFancy = data.data.filter(fb =>  fb.mname === "Normal" || fb.mname === "fancy" ||fb.mname === "fancy1")

//     const fancydata = data.data
//       .filter(fb =>  fb.mname === "Normal" || fb.mname === "fancy" ||fb.mname === "fancy1")
//       .flatMap(f =>
//         f.section.map(fa => ({
//           BackPrice1: fa.odds[0]?.odds || 0,
//           BackPrice2: 0,
//           BackPrice3: 0,
//           BackSize1: fa.odds[0]?.size || 0,
//           BackSize2: 0,
//           BackSize3: 0,
//           LayPrice1: fa.odds[1]?.odds || 0,
//           LayPrice2: 0,
//           LayPrice3: 0,
//           LaySize1: fa.odds[1]?.size || 0,
//           LaySize2: 0,
//           LaySize3: 0,
//           RunnerName: fa?.nat,
//           SelectionId: fa?.sid,
//           ballsess: "1",
//           gtype: f?.gtype == "fancy" ? "session":f?.gtype,
//           GameStatus: "",
//           gtstatus: f?.gstatus,
//           max: "50000",
//           min: "100",
//           remm: "",
//           srno: fa?.sno?.toString(),
//           mname: f?.mname,
//         }))
//       );

//     // console.log(fancydata, "fancydata is here");

//     const previousFancyStr = await publisher.get(`fancy-${m}`);

//     let pfancy = null;
//     if (previousFancyStr) {
//       try {
//         pfancy = JSON.parse(previousFancyStr);
//         fancydata.map((item)=>{
//         pfancy.map((pitem)=>{
//            if(item.RunnerName != pitem.RunnerName){
//             console.log("inside the ",item.RunnerName)
//             const fancy = {matchId:m,
//               SelectionId:item.SelectionId,
//               RunnerName:item.RunnerName,
//               gtype :item.gtype === "fancy" ? "session":item.gtype,
//               sr_no :item.srno,
//               ballByBall : ""
//             }
//             io.on("connection",(socket)=>{
//               console.log("socket connected ")
//               socket.emit("newFancyAdded",{fancy,m})
//             })
//            }
//         })  

//         })  
//       } catch (e) {
//         console.error("Invalid JSON for key:", `fancy-${m}`, e);
//       }
//     }
//    // console.log(pfancy,"GHJK")


//     await publisher.set(`fancy-${m}`, JSON.stringify(fancydata));


//     console.log(`Saved fancy-${m} to Redis ✅`);
//   }
// };


// const formattedFancyData = async () => {
//   for (const m of MatchIds) {
//     const data = FancyData[m];
//     if (!data || !data?.data || data?.data.length === 0) continue;

//     const fancydata = data.data
//       .filter(fb => ["Normal", "fancy", "fancy1"].includes(fb.mname))
//       .flatMap(f =>
//         f.section.map(fa => ({
//           BackPrice1: fa.odds[0]?.odds || 0,
//           BackPrice2: 0,
//           BackPrice3: 0,
//           BackSize1: fa.odds[0]?.size || 0,
//           BackSize2: 0,
//           BackSize3: 0,
//           LayPrice1: fa.odds[1]?.odds || 0,
//           LayPrice2: 0,
//           LayPrice3: 0,
//           LaySize1: fa.odds[1]?.size || 0,
//           LaySize2: 0,
//           LaySize3: 0,
//           RunnerName: fa?.nat,
//           SelectionId: fa?.sid,
//           ballsess: "1",
//           gtype: f?.gtype === "fancy" ? "session" : f?.gtype,
//           GameStatus: "",
//           gtstatus: f?.gstatus,
//           max: "50000",
//           min: "100",
//           remm: "",
//           srno: fa?.sno?.toString(),
//           mname: f?.mname,
//         }))
//       );

//     // Fetch previous fancy data
//     const previousFancyStr = await publisher.get(`fancy-${m}`);
//     let pfancy = [];

//     if (previousFancyStr) {
//       try {
//         pfancy = JSON.parse(previousFancyStr);
//       } catch (e) {
//         console.error("Invalid JSON for key:", `fancy-${m}`, e);
//       }
//     }

//     const existingSelectionIds = new Set(pfancy.map(p => p.SelectionId));

//     for (const item of fancydata) {
//       if (!existingSelectionIds.has(item.SelectionId)) {
//         const fancy = {
//           matchId: m,
//           SelectionId: item.SelectionId,
//           RunnerName: item.RunnerName,
//           gtype: item.gtype,
//           sr_no: item.srno,
//           ballByBall: ""
//         };
//         io.emit("newFancyAdded", { fancy, matchId: m });
//         console.log(`Emitted newFancyAdded for match ${m} and selection ${item.SelectionId}`);
//       }
//     }

//     await publisher.set(`fancy-${m}`, JSON.stringify(fancydata));
//     // console.log(`Saved fancy-${m} to Redis ✅`);
//   }
// };



const formattedFancyData = async () => {
  for (const m of MatchIds) {
    const data = FancyData[m];
    if (!data || !data?.data || data?.data.length === 0) continue;

    const fancydata = data.data
      .filter(fb => ["Normal", "fancy", "fancy1"].includes(fb.mname))
      .flatMap(f =>
        f.section.map(fa => ({
          BackPrice1: fa.odds[0]?.odds || 0,
          BackPrice2: 0,
          BackPrice3: 0,
          BackSize1: fa.odds[0]?.size || 0,
          BackSize2: 0,
          BackSize3: 0,
          LayPrice1: fa.odds[1]?.odds || 0,
          LayPrice2: 0,
          LayPrice3: 0,
          LaySize1: fa.odds[1]?.size || 0,
          LaySize2: 0,
          LaySize3: 0,
          RunnerName: fa?.nat,
          SelectionId: fa?.sid,
          ballsess: "1",
          gtype: f?.gtype === "fancy" ? "session" : f?.gtype,
          GameStatus: fa?.gstatus || "",
          gstatus: fa?.gstatus ,
          max: "50000",
          min: "100",
          remm: "",
          srno: fa?.sno?.toString(),
          mname: f?.mname,
        }))
      );

    const previousFancyStr = await publisher.get(`fancy-${m}`);
    let pfancy = [];

    if (previousFancyStr) {
      try {
        pfancy = JSON.parse(previousFancyStr);
      } catch (e) {
        console.error("Invalid JSON for key:", `fancy-${m}`, e);
      }
    }

    const currentSelectionIds = new Set(fancydata.map(item => item.SelectionId));
    const previousSelectionIds = new Set(pfancy.map(item => item.SelectionId));

    for (const item of fancydata) {
      if (!previousSelectionIds.has(item.SelectionId)) {
        const fancy = {
          matchId: m,
          SelectionId: item.SelectionId,
          RunnerName: item.RunnerName,
          gtype: item.gtype,
          sr_no: item.srno,
          ballByBall: ""
        };
        io.emit("newFancyAdded", { fancy, matchId: m });
      }
    }

    // const deactivatedFancies = {};

    // for (const oldItem of pfancy) {
    //   if (!currentSelectionIds.has(oldItem.SelectionId)) {
    //     // Group deactivated SelectionIds by matchId
    //     if (!deactivatedFancies[m]) {
    //       deactivatedFancies[m] = [];
    //     }
    //     deactivatedFancies[m].push(oldItem.SelectionId);

    //     // Emit per-fancy removal to match room
    //     io.emit("deactivateFancy", {
    //       marketId: oldItem.SelectionId,
    //       matchId: m
    //     });

    //     console.log(`🔴 Fancy deactivated: ${oldItem.SelectionId} for match ${m}`);
    //   }
    // }
    const deactivatedFancies = {};

    // Collect all deactivated SelectionIds for this match
    for (const oldItem of pfancy) {
      if (!currentSelectionIds.has(oldItem.SelectionId)) {
        if (!deactivatedFancies[m]) {
          deactivatedFancies[m] = [];
        }
        deactivatedFancies[m].push(oldItem.SelectionId);

        console.log(`🔴 Fancy deactivated: ${oldItem.SelectionId} for match ${m}`);
      }
    }

    // Emit once per match with all deactivated fancies
    if (deactivatedFancies[m]?.length > 0) {
      console.log(deactivatedFancies,"GHJKCGHJKLCHJK")
      io.emit("deactivateFancy", {
        [m]: deactivatedFancies[m]
      })
    }
      // Save updated data to Redis
      await publisher.set(`fancy-${m}`, JSON.stringify(fancydata));
      // console.log(`✅ Saved fancy-${m} to Redis`);
    }
  };








  const MatchOddsData = async () => {
    const promises = MatchIds.map(id =>
      axios.get(`http://195.110.59.236:3000//ssdfgfds/.allMatchData/4/${id}ghjk`)
        .then(res => ({ status: 'fulfilled', data: res.data, marketId: id }))
        .catch(err => ({ status: 'rejected', error: err.message, marketId: id }))
    );

    const results = await Promise.allSettled(promises);

    results.forEach(async (result, index) => {
      if (result.status === 'fulfilled') {
        const { marketId, data } = result.value;
        const Data = data?.[0]
        // console.log(`✅ Market ID: ${marketId}`, Data);

        // const ParseData = {
        //     betDelay:data.betDelay,
        //     bspReconciled:data.bspReconciled,
        //     complete:data.complete,
        //     crossMatching:data.crossMatching,
        //     inplay:data.inplay,
        //     isMarketDataDelayed:data.isMarketDataDelayed,
        //     lastMatchTime:data.lastMatchTime,
        //     marketId:marketId,
        //     numberOfActiveRunners:

        // }

        if (Data) {
          // const jsonMessage = JSON.stringify(Data);
          // console.log(Data.runners[0].ex.availableToBack,Data,"jsonMessage")

          const adjustMarketData = (market) => {
            if (!market.runners) return market;

            market.runners = market.runners.map((runner) => {
              if (!runner.ex) return runner;

              // Adjust back prices: Decrease by 0.3
              runner.ex.availableToBack = (runner.ex.availableToBack || []).map(b => ({
                price: (parseFloat((b.price - 0.3))),
                size: b.size
              }));

              // Adjust lay prices: Increase by 0.3
              runner.ex.availableToLay = (runner.ex.availableToLay || []).map(l => ({
                price: (parseFloat((l.price + 0.3))),
                size: l.size
              }));

              return runner;
            });

            return market;
          };
          const dataone = adjustMarketData(Data)
          // console.log(dataone,"xyz zyz")
          const jsonMessage = JSON.stringify(dataone);


          await publisher.set(`odds-market-${marketId}`, jsonMessage);


          publisher.publish("getMarketData", jsonMessage);
          // console.log("📤 Published:", dataone.runner[0]);
        }

      } else {
        const { marketId, error } = result.reason || result;
        console.error(`❌ Failed to fetch Market ID ${marketId}:`, error);
      }
    });
  };



  // BookMaker Market Odds Mangment 
  const BookMakerOddsData = async () => {
    const promises = MatchIds.map(id =>
      axios.get(`http://195.110.59.236:3000/allMatchData/4/${id}`)
        .then(res => ({ status: 'fulfilled', data: res.data, marketId: id }))
        .catch(err => ({ status: 'rejected', error: err.message, marketId: id }))
    );

    const results = await Promise.allSettled(promises);

    results.forEach(async (result, index) => {
      if (result.status === 'fulfilled') {
        const { marketId, data } = result.value;
        // console.log(data,"data is ")
        const fData = data?.data.filter((m) => m.mname == "Bookmaker")
        const Data = fData?.[0]
        // console.log(Data, "Data is here ")


        if (Data) {
          // const jsonMessage = JSON.stringify(Data);
          // console.log(Data.runners[0].ex.availableToBack,Data,"jsonMessage")

          // const adjustMarketData = (market) => {
          //   if (!market.runners) return market;

          //   market.runners = market.runners.map((runner) => {
          //     if (!runner.ex) return runner;

          //     // Adjust back prices: Decrease by 0.3
          //     runner.ex.availableToBack = (runner.ex.availableToBack || []).map(b => ({
          //       price: (parseFloat((b.price - 0.3))),
          //       size: b.size
          //     }));

          //     // Adjust lay prices: Increase by 0.3
          //     runner.ex.availableToLay = (runner.ex.availableToLay || []).map(l => ({
          //       price: (parseFloat((l.price + 0.3))),
          //       size: l.size
          //     }));

          //     return runner;
          //   });

          //   return market;
          // };
          //  const dataone = adjustMarketData(Data)
          // console.log(dataone,"xyz zyz")

          const transformRunners = (inputRunners) => {
            return {
              runners: inputRunners.map(runner => {
                // Filter out zero-priced odds
                // console.log(runner,"runner is here")
                const backOdds = runner.odds.filter(odd => odd.otype == "back");
                const layOdds = runner.odds.filter(odd => odd.otype == "lay");

                const backoddsmain = backOdds.reverse().map((m) => {
                  return {
                    size: m.size,
                    price: m.odds
                  }
                })

                const layoddsmain = layOdds.map((m) => {
                  return {
                    size: m.size,
                    price: m.odds
                  }
                })
                // console.log(layoddsmain, backoddsmain, "FGHJ")

                // Estimate lastPriceTraded as midpoint between best back and lay
                let lastPriceTraded = null;
                if (backOdds.length > 0 && layOdds.length > 0) {
                  lastPriceTraded = (backOdds[0].price + layOdds[0].price) / 2;
                }

                return {
                  selectionId: runner.sid,
                  status: runner.gstatus,
                  lastPriceTraded: lastPriceTraded,
                  runnerName: runner.nat,
                  totalMatched: 0,
                  ex: {
                    availableToBack: backoddsmain,
                    availableToLay: layoddsmain
                  }
                };
              })
            };
          };
          const output = transformRunners(Data?.section)
          // console.log(output.runners, "output")
          Data.runners = output.runners
          Data.marketName = "Bookmaker"
          Data.marketId = Data.mid.toString();
          Data.matchId = Data.gmid.toString();

          const jsonMessage = JSON.stringify(Data);


          await publisher.set(`odds-market-${Data.marketId}`, jsonMessage);


          publisher.publish("getMarketData", jsonMessage);
          // console.log("📤 Published:", jsonMessage);
        }

      } else {
        const { marketId, error } = result.reason || result;
        // console.error(`❌ Failed to fetch Market ID ${marketId}:`, error);
      }
    });
  };

  setInterval(getFancyDataApi, 1000)

  // setInterval(MatchOddsData,1000)

  setInterval(formattedFancyData, 2000)

  setInterval(BookMakerOddsData, 20000)


  // Fancy Result Hahahahahah
  let FancyList = null

  const setFancyData = async () => {
    if (!Array.isArray(FancyList) || FancyList.length === 0) return;
    
    await Promise.all(
      FancyList.map(async (f) => {
        if (!f) return;
      const fileterMatch = MatchData.filter((M)=>M.gmid == f.matchId)
        try {
            const res = await axios.post(`https://api.cricketid.xyz/placed_bets?key=newdiamond36iuyIug9898&sid=4`, {
            event_id: f?.matchId,
            market_id:f?.selectionId + 2000,
            event_name: fileterMatch[0]?.ename,
            market_name: f?.selectionName,
            market_type: "FANCY",
          });
  
          console.log(`Response for ${f?.selectionName}:`, res.data);
        } catch (error) {
          console.error(`Error posting for ${f?.selectionName}:`, error?.response?.data || error.message);
        }
      })
    );
  };
  
  // https://api.cricketid.xyz/get-result?key=newdiamond36iuyIug9898

  const FancyResult = async () => {
    try {
      
      await Promise.all(
        FancyList.map(async (f) => {
          if (!f) return;
        const fileterMatch = MatchData.filter((M)=>M.gmid == f.matchId)
        
          try {
              const res = await axios.post(`https://api.cricketid.xyz/get-result?key=newdiamond36iuyIug9898&sid=4`, {
              event_id: f?.matchId,
              market_id: f?.rmid,
              event_name: fileterMatch[0]?.ename,
              market_name: f?.selectionName,
              market_type: "FANCY",
            });
    
            // console.log(`Response for ${f?.selectionName}:`, res.data);
            if(res.data?.final_result != ""){
           const data=  { 
              message:"ok",
              result:res?.data?.final_result,
              isRollback:res.data?.is_roleback,
              runnerName:res.data?.market_name,
              matchId:res.data?.event_id
            }
              console.log(data,"after is if")
              const resData = await axios.post("https://api.9xbro.com/api/update-fancy-result",data)
              // console.log(resData,"FGHJKL")
            }
            
          } catch (error) {
            console.error(`Error posting for ${f?.selectionName}:`, error?.response?.data || error.message);
          }
        })
      );

      // console.log("All market results processed successfully.");
    } catch (error) {
      console.error("Error in FancyResult cron job:", error);
    }
  };

  const getFancyList = async () => {
    const res = await axios.get('https://api.9xbro.com/api/get-business-fancy-list')
    console.log(res.data.data.list, "Fancy List is Here")
    FancyList = res.data?.data?.list
  }

  setInterval(getFancyList, 3000 );

  // setInterval(setFancyData, 1000 )
  setInterval(FancyResult,3000)


  publisher.on('connect', () => {
    console.log(` sucessfully connected to redis hahah !`)
  })


  //   setInterval(() => {
  //     const payload = {
  //       type: "getMarketData",
  //       timestamp: new Date().toISOString(),
  //       message: "Hello from publisher"
  //     };

  // const jsonMessage = JSON.stringify(payload);

  // publisher.publish("getMarketData", jsonMessage);
  // console.log("📤 Published:", payload);
  //   }, 3000);

  app.post("/fancy-suspend",(req,res)=>{
    console.log(req.body,"req.body is here bhaiya")
    const fancy = req.body.fancy;
    const type =  req.body.type;
    io.emit("suspendedFancy",{fancy,type})
  })




  const PORT = 3030;

  server.listen(PORT, () => {
    console.log(`server is Listeing on ${PORT}`)
  })