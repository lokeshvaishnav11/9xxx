// import { Request, Response } from "express";
// import { ApiController } from "./ApiController";
// import { redisReplica } from "../../database/redis";
// import { eventJson, types } from "../../utils/casino-types";
// import { marketFormatter } from "../../utils/helper";
// import axios from "axios";
// import { result } from "lodash";
// import { AnyRecord } from "dns";

// const fetchData = async (type: string) => {
//   try {
//     console.log("i am inside fetching function",type)
//     type = type === "lucky7B" ? "lucky7eu" : type;
//     type = type === "Tp1Day" ? "teen" : type;
//     type = type === "testtp" ? "teen9" : type;
//     type = type === "opentp" ? "teen8" : type;
//     type = type === "ddb" ? "btable" : type;

//     type = type === "onedaypoker20" ? "poker20" : type;
//     type = type === "onedaypoker" ? "poker" : type;
//     type = type === "poker6player" ? "poker6" : type;
//     type = type === "cmeter2020" ? "cmeter" : type;
//     type = type === "cricket2020" ? "cmatch20" : type;
//     type = type === "Cards3J" ? "3cardj" : type;
//     type = type === "fivewicket" ? "cricketv3" : type;
//     type = type ==="warcasino"? "war":type
//     type = type === "race2020" ? "race20" : type;
//     type = type ===  "Andarbahar"? "ab20":type;
//     type  = type === 'dt20b'? "dt202":type;
//     type = type === 'dragontiger1Day'? "dt6":type
//     type = type === 'card32b'? "card32eu":type
//     type = type === "worliinstant" ? "worli":type
//     type = type === "1-CARD-ONE-DAY" ? "teen1":type
//     type = type === "1-CARD-ONE-DAY" ? "teen1":type
//     type = type  === "fivewicket" ? "cricketv3"  :type

//     // type = type ===  ""

//     const tableDataResponse = await axios.get(`http://69.62.123.205:3000/tabledata2/${type}`);
//     const iframeResponse = await axios.get(`http://69.62.123.205:3000/iframe2/${type}`);
//     // const casinoResultResponse = await axios.get(`http://69.62.123.205:3000/casinoresult2/${type}`);

//     // console.log(tableDataResponse.data, "Table Data Response");
//     // console.log(iframeResponse.data, "Iframe Response");
//     // console.log(casinoResultResponse.data, "Casino Result Response");

//     return {
//       tableData: tableDataResponse.data,
//       iframeData: iframeResponse.data,
//       // casinoResult: casinoResultResponse.data
//     };
//     // const data = await axios.get(`http://69.62.123.205:3000/tabledata/${type}`)
//     // console.log(data,"datafvcd fvbghnbgvfjk")
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return null;
//   }
// };

// function extractRdescItems(rdesc :string ): string[] {
//   const result: string[] = [];
//   const cardValues = ['J', 'Q', 'K', 'A', '1','2','3','4','5','6','7','8','9','10'];

//   const parts: string[] = rdesc.split('|').map(part => part.trim());

//   for (const part of parts) {
//     const segments: string[] = part.split('#');

//     for (const seg of segments) {
//       if (seg.includes('D :') || seg.includes('T :')) {
//         const [type, val] = seg.split(':');
//         const value = val.trim();
//         const entity = type.trim() === 'D' ? 'Dragon' : 'Tiger';

//         if (cardValues.includes(value)) {
//           result.push(`${entity} Card ${value}`);
//         } else {
//           result.push(`${entity} ${value}`);
//         }

//       } else {
//         const cleanSeg = seg.trim();
//         if (cleanSeg === 'Dragon') {
//           result.push('Dragon'); // If this is a typo you're keeping intentionally
//         } else if (cleanSeg !== 'No') {
//           result.push(cleanSeg);
//         }
//       }
//     }
//   }

//   return result;
// }

// function parseRdesc(rdesc: string): string[] {
//   // Extract the player label before the #
//   if(rdesc != ""){
//   const [playerInfo, rest] = rdesc?.split('#');
//   const playerLabel: string = playerInfo?.trim();

//   const [aInfo, bInfo] = rest.split('|');
//   if (!aInfo || !bInfo) return [playerLabel];

//   // A side
//   const [aLabel, aHand] = aInfo.split(':').map(s => s.trim());
//   // B side
//   const [bLabel, bHand] = bInfo.split(':').map(s => s.trim());

//   return [
//     playerLabel,
//     `${aHand} ${aLabel}`,  // e.g., "Flush A"
//     `${bHand} ${bLabel}`   // e.g., "One Pair B"
//   ];
// }
// else{
//   return []
// }
// }

// let sidarr:any;

// const resultArr: { mid: string; slug: string; Result: boolean }[] = [];
// const sids = async (data: any, type: any) => {

//   let xyz:any = type
//   //  console.log(slug,xyz,"xyz","slug")
//     xyz = xyz=== "lucky7eu" ?"lucky7B" :xyz
//     xyz = xyz=== "teen" ? "Tp1Day" : xyz;
//     xyz =  xyz === "teen8" ? "opentp" : xyz;
//     xyz = xyz === "poker6" ? "poker6player" : xyz;
//     xyz =xyz === "cmatch20" ? "cricket2020" : xyz;
//     xyz =xyz === "3cardj" ? "Cards3J" : xyz;
//     xyz = xyz === "cricketv3" ? "fivewicket" : xyz;
//     xyz = xyz === "war" ? "warcasino" : xyz;
//     xyz = xyz === "race20" ? "race2020" : xyz;
//     xyz = xyz === "ab20" ? "Andarbahar" : xyz;
//     xyz = xyz ==="dt202" ? "dt20b":xyz
//     xyz = xyz ==="dt6"? "dragontiger1Day":xyz
//     xyz = xyz === "poker" ? "onedaypoker":xyz
//     xyz = xyz === "poker20" ? "onedaypoker20":xyz
//     xyz = xyz === "card32eu"? "card32b" :xyz
//     xyz = xyz ==="btable" ? "ddb" :xyz
//     xyz = xyz ==="worli" ? "worliinstant" :xyz
//     xyz = xyz ==="teen1" ? "1-CARD-ONE-DAY":xyz

//       // console.log(xyz,"xyz")

//     let str;
//       //  if(xyz == "dt20b" || "dt20" || "dtl20"){
//       //   sidarr =  extractRdescItems(data.rdesc as string)

//       //  }
//       //  else if(xyz == "onedaypoker20" || "poker"){
//       //   sidarr = parseRdesc(data.rdesc)
//       //   console.log(sidarr,"hello world for this ")
//       //  }
//       //  else {
//       //    str = `${data.rdesc.replace(/#/g, ',')}`;
//       //    sidarr = str.split(",");
//       //  }
//       if (xyz === "dt20b" || xyz === "dt20" || xyz === "dtl20") {
//         sidarr = extractRdescItems(data.newdesc as string);
//       } else if (xyz === "onedaypoker20" || xyz === "poker") {
//         sidarr = parseRdesc(data.newdesc);
//         console.log(sidarr, "hello world for this");
//       } else {
//         const str = `${data?.newdesc.replace(/#/g, ',')}`;
//         sidarr = str.split(",");
//       }

//   // console.log(str);

//   // Split the string by commas to get an array of runner names

//   console.log(sidarr,"hellooooooo");

//   // Fetch jsonData asynchronously
//   const jsonData = await eventJson[xyz]();

//   // Clone the jsonData to avoid mutating the original
//   const cloneJsonDataOne = JSON.parse(JSON.stringify(jsonData.default));

//   // Process the sidarr and map through the data
//   const consArr = ['Q',"K","A","J",'1','2','3','4','5','6','7','8','9','10']

//   const arrData = sidarr.map((item: any) => {
//     let sid = null;  // Initialize sid to store the result
//     console.log(item,"item")
//      if(consArr.includes(item)){
//       item = `Card`+` ${item}`
//       console.log(item)
//      }
//     // Loop through market and runners to find the correct SelectionId
//     cloneJsonDataOne.event_data.market.forEach((market: any) => {

//       market.Runners.forEach((runner: any) => {
//         if (runner.RunnerName === item && market?.MarketName == item) {
//           console.log(item,runner.RunnerName,"ghjkcghjkghbjn")
//           console.log(`SID: ${runner.SelectionId}`);
//           sid = `SID${runner.SelectionId}`;
//         }
//       });
//     });

//     return sid;  // Return the SID for the current item
//   });

//   // const arrData = [ 'SID1', 'SID4', 'SID5', 'SID11', null ];

// // Step 1: Remove `null` values from the array
// const filteredArr = arrData.filter((item :any)=> item !== null);

// // Step 2: Join the remaining values into a string
// const resultString = filteredArr.join(',');
// return resultString
// };

// const resultDetail = async (slug: string, mid: string): Promise<boolean> => {
//   try {
//     // const res = await axios.get(`http://69.62.123.205:3000/detailresult2/${slug}/${mid}`);
//     const res = await axios.get(`http://69.62.123.205:7000/api/v/casino/result?mid=${mid}`);
//     // http://69.62.123.205:7000/api/v/casino/result?mid=106250611180237

//     console.log(res.data, "Response for resultDetails");

//     let xyz:any = slug
//     //  console.log(slug,xyz,"xyz","slug")
//       xyz = xyz=== "lucky7eu" ?"lucky7B" :xyz
//       xyz = xyz=== "teen" ? "Tp1Day" : xyz;
//       xyz =  xyz === "teen8" ? "opentp" : xyz;
//       xyz = xyz === "poker6" ? "poker6player" : xyz;
//       xyz =xyz === "cmatch20" ? "cricket2020" : xyz;
//       xyz =xyz === "3cardj" ? "Cards3J" : xyz;
//       xyz = xyz === "cricketv3" ? "fivewicket" : xyz;
//       xyz = xyz === "war" ? "warcasino" : xyz;
//       xyz = xyz === "race20" ? "race2020" : xyz;
//       xyz = xyz === "ab20" ? "Andarbahar" : xyz;
//       xyz = xyz ==="dt202" ? "dt20b":xyz
//       xyz = xyz ==="dt6"? "dragontiger1Day":xyz
//       xyz = xyz === "poker" ? "onedaypoker":xyz
//       xyz = xyz === "poker20" ? "onedaypoker20":xyz
//       xyz = xyz === "card32eu"? "card32b" :xyz
//       xyz = xyz ==="btable" ? "ddb" :xyz
//       xyz =xyz === "aaa"? "AAA":xyz
//       xyz = xyz ==="worli" ? "worliinstant" :xyz
//       xyz = xyz ==="teen1" ? "1-CARD-ONE-DAY":xyz

//     if (res.data.success) {
//       // Success: return true
//           console.log(res.data.data, "Response for resultDetails");
//           // console.log("hhhhhhhhhhhhhh",res.data.data.t1)
//            let t1= res.data.data[0]
//            console.log(t1,res.data,"hello world")
//            const sidsstring = await sids(t1,slug)
//           //  console.log(sidarr)
//           const convertResult = {
//             mid: t1?.mid, // Assuming 'rid' is the 'mid' in the target format
//             data: {
//               mid: t1?.mid, // Same as above
//               gameType: xyz, // Assuming the game type is always 'lucky7'
//               autotime: "0", // Fixed value (you can modify this if needed)
//               gtype: xyz, // Assuming the game type is 'lucky7' as per the second format
//               min: "5", // Assuming this is a fixed value (modify if needed)
//               max: "10000", // Assuming this is a fixed value (modify if needed)
//               ...t1.cards.split(',').reduce((acc:any, card:any, index:any) => {
//                 acc[`C${index + 1}`] = card; // Dynamically create C1, C2, C3, etc.
//                 return acc;
//               }, {}),
//               resultsids: sidsstring, // Assuming this is empty, modify if necessary
//               sid50: "", // Empty field, modify if needed
//               // winnersString: `${t1.rdesc.replace(/#/g, ', ')}`, // Replace '#' with commas and spaces
//               winnersString: `${sidarr.join(",")}`, // Replace '#' with commas and spaces

//               result: t1.win, // Assuming 'win' from the first structure maps to 'result' in the target
//               winnerName: t1.winnat, // Assuming 'winnat' corresponds to the 'winnerName'

//             },
//             gameType: slug, // Assuming the game type is always 'lucky7'

//           }

//           console.log(convertResult,"convert result")

//           // await axios.post("http://localhost:3010/api/save-casino-match",convertResult)
//           await axios.post("https://api.9xbro.com/api/save-casino-match",convertResult)

//       return true;
//     } else {
//       // Failure (non-200 status): return false
//       return false;
//     }
//   } catch (error) {
//     console.error("Error in resultDetail API call:", error);
//     // In case of error, return false
//     return false;
//   }
// };

// const processResults = async () => {
//   // Using Promise.all to call APIs concurrently
//   const promises = resultArr.map(async (entry) => {
//     const { mid, slug } = entry;
//     const result = await resultDetail(slug, mid);
//     // console.log(result,"result hahhahahah")

//     if (result) {
//       // If API call is successful, update the entry to `Result: true`
//       entry.Result = true;
//       // console.log(result?.data?.data.>t1)

//       // axios.post("http://localhost:3010/api/save-match")
//       // console.log(`Result for mid ${mid} updated to true. Removing from array.`);
//     }

//     return entry;
//   });

//   // Wait for all API calls to complete
//   const updatedResults = await Promise.all(promises);

//   // Filter out the entries where Result is true
//   const filteredResults = updatedResults.filter(entry => entry.Result === false);

//   // Update the global resultArr with only those entries that haven't been marked as Result: true
//   resultArr.length = 0; // Clear the original array
//   resultArr.push(...filteredResults); // Push back the non-removed items

//   // console.log("Updated Results Array (filtered): ", resultArr);
// };

// setInterval(() => {
//   processResults();
// }, 3000);

// export default class CasinoController extends ApiController {
// //   getCasinoMarket = async (req: Request, res: Response) => {
// //     let { type, selectionId } = req.params;
// //     try {
// //       if (!type) this.fail(res, "type is required field");

// //       //let casinoType: any = new DynamicClass(type, {});

// //       if (type === "AAA") type = "aaa";

// //         // const data: any = await CasinoRedisController.casinoGameFetch(
// //         //   types[type] as any
// //         // );
// //       // let data: any = await redisReplica.get(types[type]);

// //         function dataparser(data:any){
// //           const cardValues = data.card ? data.card.split(",") : [];
// //           let cardData: { [key: string]: string } = {}; // Explicit type definition

// //          cardValues.forEach((card: string, index: number) => {
// //         cardData[`C${index + 1}`] = card;
// //           });
// //           return{

// //             autotime:data.lt.toString(),

// //             ...cardData,
// //             desc:data.card,
// //             slug:data.gtype,
// //             status:"1",
// //             title:data.gtype,
// //             match_id:data.mid,
// //             mid:data.mid,

// //             event_data:{
// //               autotime:data.lt.toString(),

// //               market:data.sub.map((data:any) =>({
// //                 MarketName:data?.nat,
// //                 Runners:[{
// //                   b1:data.b,
// //                   gstatus:data.gstatus ==="open"? "1":"0",
// //                   max:data.max,
// //                   min:data.min,
// //                   mid:data.mid,
// //                   runnerName:data.nat,
// //                   nat:data.nat,
// //                   sid:data.sid,
// //                   rate:data.b
// //                 }]
// //               }))

// //             }

// //           }
// //         }

// //       console.log("i am inside this api")

// // console.log("type",type)

// //     //   let data :any = await axios.get(`http://69.62.123.205:3000/tabledata/lucky7`).then((res)=>{
// //     //     console.log(data.json(),"result from api")

// //     //   })
// //     //  let xyx : any = await axios.get(`http://69.62.123.205:3000/iframe/${type}`)
// //     //  let resultnow : any =await axios.get(`http://185.211.99:3000/casinoresult/${type}`)
// //     // console.log(xyx)

// //     //   let xyz:any = xyx.data.tv_url

// //       // data = data ? { data: JSON.parse(data) } : { data: [] };

// //       async function fetchData(type: string) {
// //         try {
// //           let data: any = await axios.get(`http://69.62.123.205:3000/tabledata/${type}`);
// //           console.log(data.data, "result from API");

// //           let xyx: any = await axios.get(`http://69.62.123.205:3000/iframe/${type}`);
// //           let resultnow: any = await axios.get(`http://185.211.99:3000/casinoresult/${type}`);

// //           console.log(xyx.data, "iframe response");
// //           console.log(resultnow.data, "casino result");

// //           return { tableData: data.data, iframeData: xyx.data, casinoResult: resultnow.data };
// //         } catch (error) {
// //           console.error("Error fetching data:", error);
// //         }
// //       }

// //       // Call the function
// //       fetchData("lucky7").then((result) => {
// //         if (!result) {
// //           console.error("Failed to fetch data");
// //           return;
// //         }

// //         console.log(result); // Debugging: Ensure result is not undefined

// //         var data: any = result.tableData;
// //         var resultnow: any = result.casinoResult;
// //         var iframe:any=result.iframeData;

// //         console.log("Table Data:", data);
// //         console.log("Casino Result:", resultnow);
// //       });

// //       let markets: any = [];
// //       let results: any = [];
// //       // let t1: any = {};
// //       let t3: any = null;
// //       let t4: any = null;
// //       let scoreCards: any = undefined;
// //       let tv = ;
// //       // console.log(tv,"tv ishere ")

// //       if(resultnow?.data) results =resultnow
// //       // if (data?.data?.t2) markets = [...data?.data?.t2];
// //       // if (data?.data?.t3) {
// //       //   markets = [...markets, ...data?.data?.t3];
// //       //   t3 = data?.data?.t3;
// //       // }
// //       // if (data?.data?.t4) {
// //       //   markets = [...markets, ...data?.data?.t4];
// //       //   t4 = data?.data?.t4;
// //       // }
// //       // if (data?.data?.bf) markets = [...data?.data?.bf];
// //       // if (data?.data?.results) results = [...data?.data?.results];
// //       // if (data?.data?.t1) t1 = data?.data?.t1?.[0];
// //       // if (data?.data?.tv) tv = xyz;
// //       return eventJson[type]()
// //         .then(async (jsonData: any) => {
// //           const cloneJsonData = JSON.parse(JSON.stringify(jsonData.default));
// //           if (type != "testtp") {
// //             // Todo: For score
// //             if (type === "fivewicket") {
// //               const scoreData = await redisReplica.hGetAll(
// //                 `fivewicket-t1-${t1.mid}`
// //               );
// //               if (scoreData) {
// //                 const { scoreCard } = scoreData;
// //                 if (scoreCard) scoreCards = JSON.parse(scoreCard);
// //               }
// //             }
// //             if (type === "Superover") {
// //               const scoreData = await redisReplica.hGetAll(
// //                 `Superover-t1-${t1.mid}`
// //               );
// //               if (scoreData) {
// //                 const { scoreCards: scoreCard } = scoreData;
// //                 scoreCards = JSON.parse(scoreCard).scoreCard;
// //               }
// //             }
// //             const marketData = marketFormatter(markets, cloneJsonData);

// //             let eventData = {
// //               ...cloneJsonData,
// //               ...t1,
// //               match_id: t1.mid,
// //               results,
// //               tv :xyz,
// //               defaultMarkets: cloneJsonData.event_data.market,
// //               scoreCard: scoreCards,
// //             };
// //             if (type === "Tp1Day" && data?.data?.bf) {
// //               const {
// //                 C1: C1A,
// //                 C2: C2A,
// //                 C3: C3A,
// //                 marketId: mid,
// //                 min,
// //                 max,
// //               } = data.data.bf[0];
// //               const { C1: C1B, C2: C2B, C3: C3B } = data.data.bf[1];
// //               eventData = {
// //                 ...eventData,
// //                 C1A,
// //                 C2A,
// //                 C3A,
// //                 C1B,
// //                 C2B,
// //                 C3B,
// //                 mid,
// //                 match_id: mid,
// //                 min,
// //                 max,
// //               };
// //             }
// //             eventData.event_data.market = marketData;

// //             // console.log(data?.data, marketData);
// //             return this.success(res, { ...eventData, t3, t4 });
// //           } else {
// //             const eventData = {
// //               ...cloneJsonData,
// //               ...t1,
// //               match_id: t1.mid,
// //               results,
// //               tv,
// //               defaultMarkets: cloneJsonData.event_data.market,
// //               t3,
// //               t4,
// //             };
// //             eventData.event_data.market = dataparser(data?.data);
// //             return this.success(res, { ...eventData });
// //           }
// //         })
// //         .catch((e: any) => {
// //           return this.fail(res, e.stack);
// //         });
// //     } catch (e: any) {
// //       return this.fail(res, "");
// //     }
// //   };

// // getCasinoMarket = async (req: Request, res: Response) => {
// //   let { type, selectionId } = req.params;

// //   if (!type) {
// //     return res.status(400).json({ error: "Type is a required field" });
// //   }

// //   type = type === "AAA" ? "aaa" : type;

// //   const result = await fetchData(type);
// //   if (!result) {
// //     return res.status(500).json({ error: "Failed to fetch data" });
// //   }

// //   const { tableData, iframeData, casinoResult } = result;
// //   let markets: any[] = [];
// //   let results: any[] = [];
// //   let t3: any = null;
// //   let t4: any = null;
// //   let scoreCards: any | undefined = undefined;
// //   let tv = iframeData?.data?.tv_url || "";

// //   if (casinoResult?.data) {
// //     console.log(casinoResult.data.res,"casino Result ")
// //     results = casinoResult?.data?.res.map((item:any)=>{
// //       return{
// //         "mid":item.mid.toString(),
// //         "result":item.win.toString()
// //       }
// //     });

// //     console.log(results,"rresult ")
// //   }

// //   function dataparser(data: any,match_id:any) {
// //     const cardValues = data?.card ? data.card.split(",") : [];
// //     let cardData: { [key: string]: string } = {};

// //     cardValues.forEach((card: string, index: number) => {
// //       cardData[`C${index + 1}`] = card;
// //     });

// //     return {
// //       autotime: data?.lt?.toString() || "",
// //       ...cardData,
// //       desc: data?.card || "",
// //       "slug": data?.gtype || "",
// //       status: "1",
// //       title: data?.gtype || "",

// //       "mid": String(data?.mid || ""),
// //       "max":50000,
// //       "min":100,
// //       event_data: {
// //         match_id: match_id.toString() || "",
// //         autotime: data?.lt?.toString() || "",
// //         market: data?.sub?.map((subData: any) => ({
// //           MarketName: subData?.nat || "",
// //           Runners: [
// //             {
// //               b1: subData?.b || "",
// //               gstatus: subData?.gstatus == "OPEN" ? "1" : "0",
// //               max: subData?.max || 0,
// //               min: subData?.min || 0,
// //               mid: data?.mid.toString() || "",
// //               runnerName: subData?.nat || "",
// //               nat: subData?.nat || "",
// //               sid: subData?.sid || "",
// //               rate: subData?.b || ""
// //             }
// //           ]
// //         }))
// //       }
// //     };
// //   }

// //   try {
// //     const jsonData = await eventJson[type]();
// //     const cloneJsonData = JSON.parse(JSON.stringify(jsonData.default));

// //     let eventData = {
// //       ...cloneJsonData,
// //       match_id: cloneJsonData?.match_id .toString()|| "",
// //       results,
// //       tv,
// //       defaultMarkets: cloneJsonData?.event_data?.market || [],
// //       t3,
// //       t4
// //     };

// //     if (type === "Tp1Day" && tableData?.bf) {
// //       const { C1: C1A, C2: C2A, C3: C3A, marketId: mid, min, max } = tableData.bf[0];
// //       const { C1: C1B, C2: C2B, C3: C3B } = tableData.bf[1];

// //       eventData = {
// //         ...eventData,
// //         C1A,
// //         C2A,
// //         C3A,
// //         C1B,
// //         C2B,
// //         C3B,
// //         mid,
// //         match_id: mid,
// //         min,
// //         max
// //       };
// //     }

// //   const  eventDatap = dataparser(tableData?.data,cloneJsonData?.match_id);
// //     // .event_data.market
// //     // console.log(eventData.event_data)
// //     return res.status(200).json({ ...eventData,...eventDatap });
// //   } catch (error) {
// //     console.error("Error processing event data:", error);
// //     return res.status(500).json({ error: "Internal Server Error" });
// //   }
// // };

// getCasinoMarket = async (req: Request, res: Response) => {
//   let { type, selectionId } = req.params;
//   console.log(type,selectionId,"dhjfjldj")

//   if (!type) {
//     return res.status(400).json({ error: "Type is a required field" });
//   }

//   type = type === "AAA" ? "aaa" : type;

//   const result = await fetchData(type);
//   if (!result) {
//     return res.status(500).json({ error: "Failed to fetch data" });
//   }

//   const { tableData, iframeData } = result;
//   let markets: any[] = [];
//   let results: any[] = [];
//   let t3: any = null;
//   let t4: any = null;
//   let scoreCards: any | undefined = undefined;
//   let tv = iframeData?.tv_url || "";

//   // if (casinoResult?.data) {
//   //   //
//   //   // console.log(casinoResult.data.res,"casino Result ")
//   //   results = casinoResult?.data?.res.map((item:any)=>{
//   //     return{
//   //       "mid":item.mid.toString(),
//   //       "result":item.win.toString()
//   //     }
//   //   });

//   //   // console.log(results,"rresult ")
//   // }

//   async function dataparser(data1: any, match_id: any) {
//     let data: any;

//     if (data1 && data1["t1"]?.gtype === "cricketv3") {
//       data = data1.t1;
//     } else {
//       data = data1;
//     }

//     const cardValues = data?.card ? data.card.split(",") : [];
//     let cardData: { [key: string]: string } = {};
//     cardValues.forEach((card: string, index: number) => {
//       cardData[`C${index + 1}`] = card;
//     });

//     // Normalize slug (xyz)
//     let xyz: any = data?.gtype;
//     xyz = xyz === "lucky7eu" ? "lucky7B" : xyz;
//     xyz = xyz === "teen" ? "Tp1Day" : xyz;
//     xyz = xyz === "teen8" ? "opentp" : xyz;
//     xyz = xyz === "poker6" ? "poker6player" : xyz;
//     xyz = xyz === "cmatch20" ? "cricket2020" : xyz;
//     xyz = xyz === "3cardj" ? "Cards3J" : xyz;
//     xyz = xyz === "cricketv3" ? "fivewicket" : xyz;
//     xyz = xyz === "war" ? "warcasino" : xyz;
//     xyz = xyz === "race20" ? "race2020" : xyz;
//     xyz = xyz === "ab20" ? "Andarbahar" : xyz;
//     xyz = xyz === "dt202" ? "dt20b" : xyz;
//     xyz = xyz === "dt6" ? "dragontiger1Day" : xyz;
//     xyz = xyz === "poker" ? "onedaypoker" : xyz;
//     xyz = xyz === "poker20" ? "onedaypoker20" : xyz;
//     xyz = xyz === "card32eu" ? "card32b" : xyz;
//     xyz = xyz === "aaa" ? "AAA" : xyz;
//     xyz = xyz === "btable" ? "ddb" : xyz;
//     xyz = xyz === "worli" ? "worliinstant" : xyz;
//     xyz = xyz === "teen1" ? "1-CARD-ONE-DAY" : xyz;

//     // Prevent duplicates
//     const newItem = { mid: data?.mid?.toString(), slug: data?.gtype, Result: false };
//     const exists = resultArr.some(item => item.mid === newItem.mid && item.slug === newItem.slug);
//     if (!exists) resultArr.push(newItem);

//     // Format market data using template
//     const getFormattedMarkets = async (slug: any, apiRunners = []) => {
//       // console.log(apiRunners,"appi runners")
//       type RunnerData = {
//         sid?: string | number;
//         b?: string;
//         l?: string;
//         gstatus?: string;
//         max?: number;
//         min?: number;
//         mid?: string;
//       };

//       const jsonData = await eventJson[slug](); // ← Make sure this maps to correct file
//       const templates = JSON.parse(JSON.stringify(jsonData.default)) || [];
//       // console.log(templates,"ghjkltyghjkl;tyukl")

//       return templates.event_data.market.map((market: any) => ({
//         MarketName: market.MarketName,
//         Runners: market.Runners.map((templateRunner: any) => {
//           const live: RunnerData =
//             apiRunners.find(
//               (r: any) => r?.sid?.toString() === templateRunner.SelectionId?.toString()
//             ) || {};

//             // console.log("live",live ,"rtyuihojghjki")
//             // console.log({
//             //   RunnerName: templateRunner.RunnerName,
//             //   SelectionId: templateRunner.SelectionId,
//             //   b1: live.b || "0.00",
//             //   l1: live.l || "0.00",
//             //   gstatus: live.gstatus === "OPEN" ? "1" : "0",
//             //   max: live.max || 100000,
//             //   min: live.min || 100,
//             //   mid: live.mid || data?.mid?.toString() || "",
//             //   rate: live.b || "0.00",
//             //   sid: live?.sid?.toString() || templateRunner.SelectionId,
//             //   nat: templateRunner.RunnerName,
//             //   runnerName: templateRunner.RunnerName,
//             // },"hello world yuijok")

//           return {
//             RunnerName: templateRunner.RunnerName,
//             SelectionId: templateRunner.SelectionId,
//             b1: live.b || "0.00",
//             l1: live.l || "0.00",
//             gstatus: live.gstatus === "OPEN" ? "1" : "0",
//             max: live.max || 100000,
//             min: live.min || 100,
//             mid: live.mid || data?.mid?.toString() || "",
//             rate: live.b || "0.00",
//             sid: live?.sid?.toString() || templateRunner.SelectionId,
//             nat: templateRunner.RunnerName,
//             runnerName: templateRunner.RunnerName,
//           };
//         }),
//       }));
//     };

//     // Final formatted markets from templates + live
//     const marketsxyzz = await getFormattedMarkets(xyz, data?.sub || []);
//     // console.log(marketsxyzz[0],"formatedd data")

//     // Return full object
//     return {
//       autotime: data?.lt?.toString() || "",
//       ...cardData,
//       desc: data?.card || "",
//       slug: xyz || "",
//       status: "1",
//       title: xyz || "",
//       match_id: data?.mid?.toString() || "",
//       mid: String(data?.mid || ""),
//       max: 50000,
//       min: 100,
//       event_data: {
//         autotime: data?.lt?.toString() || "",
//         match_id: match_id?.toString() || "",
//         remark: "",
//         market: marketsxyzz,
//       },
//     };
//   }

//   try {
//     // type == "aaa" ? "AAA" :type
//     const jsonData = await eventJson[type]();
//     const cloneJsonData = JSON.parse(JSON.stringify(jsonData.default));
//     console.log(cloneJsonData?.match_id .toString()|| "","hello world dhkafkal;jcl;ajol")

//     let eventData = {
//       ...cloneJsonData,
//       match_id: tableData?.data.data|| "",
//       results,
//       tv,
//       defaultMarkets: cloneJsonData?.event_data?.market || [],
//       t3,
//       t4
//     };

//     // if (type === "Tp1Day" && tableData?.bf) {
//     //   const { C1: C1A, C2: C2A, C3: C3A, marketId: mid, min, max } = tableData.bf[0];
//     //   const { C1: C1B, C2: C2B, C3: C3B } = tableData.bf[1];

//     //   eventData = {
//     //     ...eventData,
//     //     C1A,
//     //     C2A,
//     //     C3A,
//     //     C1B,
//     //     C2B,
//     //     C3B,
//     //     mid,
//     //     match_id: mid,
//     //     min,
//     //     max
//     //   };
//     // }

//   const  eventDatap = await dataparser(tableData?.data,cloneJsonData?.match_id );
//     // .event_data.market
//     // console.log(eventDatap)
//     return res.status(200).json({ ...eventData,...eventDatap });
//   } catch (error) {
//     console.error("Error processing event data:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// getSingleMarket = async (req: Request, res: Response) => {
//   let { type, selectionId } = req.params;
//   console.log(req.params, "getsinglemarket");
//   type = type === "lucky7B" ? "lucky7eu" : type;
//     type = type === "Tp1Day" ? "teen" : type;
//     type = type === "testtp" ? "teen9" : type;
//     type = type === "opentp" ? "teen8" : type;
//     type = type === "ddb" ? "btable" : type;

//     type = type === "onedaypoker20" ? "poker20" : type;
//     type = type === "onedaypoker" ? "poker" : type;
//     type = type === "poker6player" ? "poker6" : type;
//     type = type === "cmeter2020" ? "cmeter" : type;
//     type = type === "cricket2020" ? "cmatch20" : type;
//     type = type === "Cards3J" ? "3cardj" : type;
//     type = type === "fivewicket" ? "cricketv3" : type;
//     type = type ==="warcasino"? "war":type
//     type = type === "race2020" ? "race20" : type;
//     type = type === "Andarbahar"? "ab20":type
//     type = type ==="dt20b" ? "dt202":type
//     type = type === "dragontiger1Day" ? "dt6":type
//     type = type  === "card32b"  ? "card32eu" :type
//     type = type === "worliinstant" ? "worli":type
//    type = type === "1-CARD-ONE-DAY" ? "teen1":type

//   try {
//     if (!type) return this.fail(res, "type is a required field");
//     console.log("type",type)
//     if (!selectionId) return this.fail(res, "selectionId is a required field");

//     if (type === "AAA") type = "aaa";

//     let response = await axios.get(`http://69.62.123.205:3000/tabledata2/${type}`);
//     let data = response.data;

//     console.log(data,'data hjkl')

//     let pdata = data?.data?.sub ?? [];
//     let markets: any = pdata;
//     console.log(markets, "markets");

//     interface Market {
//       sid?: string | undefined;  // Ensure sid is always a string (no undefined allowed)
//       nat?: string | undefined;
//       b?: number;
//       max: number;
//       min: number;
//       gstatus?: string | undefined;
//       b1?: number; // Optional if missing in API
//       runnerName?: string | undefined;
//       title?: string;
//     }

//     let singleMarket: Market | null = null;

//     if (markets.length > 0 && selectionId) {
//       let sidStr = "sid";
//       switch (type.toLowerCase()) {
//         case "testtp":
//           sidStr = "tsection";
//           break;
//         case "tp1day":
//           sidStr = "sectionId";
//           break;
//       }

//       const matchedRecord = markets.filter(
//         (market: any) => market[sidStr] == selectionId
//       );

//       if (matchedRecord.length > 0) {
//         singleMarket = matchedRecord[0] as Market;
//       }
//     }

//     console.log(singleMarket, "singleMarket");

//     // Ensure singleMarketData has all required properties, with default values where needed
//     let singleMarketData: Market | null = singleMarket
//       ? {
//           sid: singleMarket?.sid ?? "defaultSid",  // Default value for sid
//           nat: singleMarket?.nat ?? "",  // Default empty string for optional string fields
//           b1: singleMarket?.b ?? 0,  // Default 0 for numbers
//           max: singleMarket?.max ?? 0,
//           min: singleMarket?.min ?? 0,
//           gstatus: singleMarket?.gstatus ?? "",
//           runnerName: singleMarket?.nat ?? "",  // Default empty string
//           title: singleMarket?.title ?? "",  // Default empty string
//         }
//       : null;

//     // Add min/max from the API if available
//     if (data?.data?.t1?.length > 0 && data?.data?.t1[0].min) {
//       const min: number = data?.data?.t1[0].min ?? 0;
//       const max: number = data?.data?.t1[0].max ?? 0;
//       singleMarketData = { ...singleMarketData, min, max }
//     }
//      console.log("single market Data",singleMarketData)
//     return this.success(res, { ...singleMarketData });
//   } catch (e: any) {
//     return this.fail(res, e.stack);
//   }
// };

// }

import { Request, Response } from "express";
import { ApiController } from "./ApiController";
import { redisReplica } from "../../database/redis";
import { eventJson, types } from "../../utils/casino-types";
import { marketFormatter } from "../../utils/helper";
import axios from "axios";
import { result } from "lodash";
import { AnyRecord } from "dns";

const fetchData = async (type: string) => {
  try {
    console.log("i am inside fetching function", type);
    type = type === "lucky7B" ? "lucky7eu" : type;
    type = type === "Tp1Day" ? "teen" : type;
    type = type === "testtp" ? "teen9" : type;
    type = type === "opentp" ? "teen8" : type;
    type = type === "ddb" ? "btable" : type;

    type = type === "onedaypoker20" ? "poker20" : type;
    type = type === "onedaypoker" ? "poker" : type;
    type = type === "poker6player" ? "poker6" : type;
    type = type === "cmeter2020" ? "cmeter" : type;
    type = type === "cricket2020" ? "cmatch20" : type;
    type = type === "Cards3J" ? "3cardj" : type;
    type = type === "fivewicket" ? "cricketv3" : type;
    type = type === "warcasino" ? "war" : type;
    type = type === "race2020" ? "race20" : type;
    type = type === "Andarbahar" ? "ab20" : type;
    type = type === "dt20b" ? "dt202" : type;
    type = type === "dragontiger1Day" ? "dt6" : type;
    type = type === "card32b" ? "card32eu" : type;
    type = type === "worliinstant" ? "worli" : type;
    type = type === "1-CARD-ONE-DAY" ? "teen1" : type;
    type = type === "1-CARD-ONE-DAY" ? "teen1" : type;
    type = type === "fivewicket" ? "cricketv3" : type;

    // type = type ===  ""

    const tableDataResponse = await axios.get(
      `http://69.62.123.205:3000/tabledata2/${type}`
    );
    // const iframeResponse = await axios.get(`http://69.62.123.205:3000/iframe/${type}`);
    const casinoResultResponse = await axios.get(
      `http://69.62.123.205:3000/casinoresult2/${type}`
    );
    const iframeResponse: any = {};

    // console.log(tableDataResponse.data, "Table Data Response");
    // console.log(iframeResponse.data, "Iframe Response");
    // console.log(casinoResultResponse.data, "Casino Result Response");

    return {
      tableData: tableDataResponse?.data,
      iframeData: iframeResponse?.data,
      casinoResult: casinoResultResponse?.data || {},
    };
    // const data = await axios.get(`http://69.62.123.205:3000/tabledata/${type}`)
    // console.log(data,"datafvcd fvbghnbgvfjk")
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

function extractRdescItems(rdesc: string): string[] {
  const result: string[] = [];
  const cardValues = [
    "J",
    "Q",
    "K",
    "A",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
  ];

  const parts: string[] = rdesc.split("|").map((part) => part.trim());

  for (const part of parts) {
    const segments: string[] = part.split("#");

    for (const seg of segments) {
      if (seg.includes("D :") || seg.includes("T :")) {
        const [type, val] = seg.split(":");
        const value = val.trim();
        const entity = type.trim() === "D" ? "Dragon" : "Tiger";

        if (cardValues.includes(value)) {
          result.push(`${entity} Card ${value}`);
        } else {
          result.push(`${entity} ${value}`);
        }
      } else {
        const cleanSeg = seg.trim();
        if (cleanSeg === "Dragon") {
          result.push("Dragon"); // If this is a typo you're keeping intentionally
        } else if (cleanSeg !== "No") {
          result.push(cleanSeg);
        }
      }
    }
  }

  return result;
}

function parseRdesc(rdesc: string): string[] {
  // Extract the player label before the #
  if (rdesc != "") {
    const [playerInfo, rest] = rdesc?.split("#");
    const playerLabel: string = playerInfo?.trim();

    const [aInfo, bInfo] = rest.split("|");
    if (!aInfo || !bInfo) return [playerLabel];

    // A side
    const [aLabel, aHand] = aInfo.split(":").map((s) => s.trim());
    // B side
    const [bLabel, bHand] = bInfo.split(":").map((s) => s.trim());

    return [
      playerLabel,
      `${aHand} ${aLabel}`, // e.g., "Flush A"
      `${bHand} ${bLabel}`, // e.g., "One Pair B"
    ];
  } else {
    return [];
  }
}

let sidarr: any;

const resultArr: { mid: string; slug: string; Result: boolean }[] = [];
const sids = async (data: any, type: any) => {
  let xyz: any = type;
  //  console.log(slug,xyz,"xyz","slug")
  xyz = xyz === "lucky7eu" ? "lucky7B" : xyz;
  xyz = xyz === "teen" ? "Tp1Day" : xyz;
  xyz = xyz === "teen8" ? "opentp" : xyz;
  xyz = xyz === "poker6" ? "poker6player" : xyz;
  xyz = xyz === "cmatch20" ? "cricket2020" : xyz;
  xyz = xyz === "3cardj" ? "Cards3J" : xyz;
  xyz = xyz === "cricketv3" ? "fivewicket" : xyz;
  xyz = xyz === "war" ? "warcasino" : xyz;
  xyz = xyz === "race20" ? "race2020" : xyz;
  xyz = xyz === "ab20" ? "Andarbahar" : xyz;
  xyz = xyz === "dt202" ? "dt20b" : xyz;
  xyz = xyz === "dt6" ? "dragontiger1Day" : xyz;
  xyz = xyz === "poker" ? "onedaypoker" : xyz;
  xyz = xyz === "poker20" ? "onedaypoker20" : xyz;
  xyz = xyz === "card32eu" ? "card32b" : xyz;
  xyz = xyz === "btable" ? "ddb" : xyz;
  xyz = xyz === "worli" ? "worliinstant" : xyz;
  xyz = xyz === "teen1" ? "1-CARD-ONE-DAY" : xyz;

  // console.log(xyz,"xyz")

  let str;
  //  if(xyz == "dt20b" || "dt20" || "dtl20"){
  //   sidarr =  extractRdescItems(data.rdesc as string)

  //  }
  //  else if(xyz == "onedaypoker20" || "poker"){
  //   sidarr = parseRdesc(data.rdesc)
  //   console.log(sidarr,"hello world for this ")
  //  }
  //  else {
  //    str = `${data.rdesc.replace(/#/g, ',')}`;
  //    sidarr = str.split(",");
  //  }
  if (xyz === "dt20b" || xyz === "dt20" || xyz === "dtl20") {
    sidarr = extractRdescItems(data.rdesc as string);
  } else if (xyz === "onedaypoker20" || xyz === "poker") {
    sidarr = parseRdesc(data.rdesc);
    console.log(sidarr, "hello world for this");
  } else {
    const str = `${data.rdesc.replace(/#/g, ",")}`;
    sidarr = str.split(",");
  }

  // console.log(str);

  // Split the string by commas to get an array of runner names

  console.log(sidarr, "hellooooooo");

  // Fetch jsonData asynchronously
  const jsonData = await eventJson[xyz]();

  // Clone the jsonData to avoid mutating the original
  const cloneJsonDataOne = JSON.parse(JSON.stringify(jsonData.default));

  // Process the sidarr and map through the data
  const consArr = [
    "Q",
    "K",
    "A",
    "J",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
  ];

  const arrData = sidarr.map((item: any) => {
    let sid = null; // Initialize sid to store the result
    console.log(item, "item");
    if (consArr.includes(item)) {
      item = `Card` + ` ${item}`;
      console.log(item);
    }
    // Loop through market and runners to find the correct SelectionId
    cloneJsonDataOne.event_data.market.forEach((market: any) => {
      market.Runners.forEach((runner: any) => {
        if (runner.RunnerName === item && market?.MarketName == item) {
          console.log(item, runner.RunnerName, "ghjkcghjkghbjn");
          console.log(`SID: ${runner.SelectionId}`);
          sid = `SID${runner.SelectionId}`;
        }
      });
    });

    return sid; // Return the SID for the current item
  });

  // const arrData = [ 'SID1', 'SID4', 'SID5', 'SID11', null ];

  // Step 1: Remove `null` values from the array
  const filteredArr = arrData.filter((item: any) => item !== null);

  // Step 2: Join the remaining values into a string
  const resultString = filteredArr.join(",");
  return resultString;
};

const resultDetail = async (slug: string, mid: string): Promise<boolean> => {
  try {
    const res = await axios.get(
      `http://69.62.123.205:3000/detailresult2/${slug}/${mid}`
    );
    console.log(res.data, "Response for resultDetails");

    let xyz: any = slug;
    //  console.log(slug,xyz,"xyz","slug")
    xyz = xyz === "lucky7eu" ? "lucky7B" : xyz;
    xyz = xyz === "teen" ? "Tp1Day" : xyz;
    xyz = xyz === "teen8" ? "opentp" : xyz;
    xyz = xyz === "poker6" ? "poker6player" : xyz;
    xyz = xyz === "cmatch20" ? "cricket2020" : xyz;
    xyz = xyz === "3cardj" ? "Cards3J" : xyz;
    xyz = xyz === "cricketv3" ? "fivewicket" : xyz;
    xyz = xyz === "war" ? "warcasino" : xyz;
    xyz = xyz === "race20" ? "race2020" : xyz;
    xyz = xyz === "ab20" ? "Andarbahar" : xyz;
    xyz = xyz === "dt202" ? "dt20b" : xyz;
    xyz = xyz === "dt6" ? "dragontiger1Day" : xyz;
    xyz = xyz === "poker" ? "onedaypoker" : xyz;
    xyz = xyz === "poker20" ? "onedaypoker20" : xyz;
    xyz = xyz === "card32eu" ? "card32b" : xyz;
    xyz = xyz === "btable" ? "ddb" : xyz;
    xyz = xyz === "aaa" ? "AAA" : xyz;
    xyz = xyz === "worli" ? "worliinstant" : xyz;
    xyz = xyz === "teen1" ? "1-CARD-ONE-DAY" : xyz;

    if (res.data?.msg?.toLowerCase() === "success" && res.data.data.t1.rdesc.length > 0) {
      // Success: return true
      // console.log(res.data.data, "Response for resultDetails");
      // console.log("hhhhhhhhhhhhhh",res.data.data.t1)
      let t1 = res.data.data.t1;
      console.log(t1, res.data, "hello world");
      const sidsstring = await sids(t1, slug);
      //  console.log(sidarr)
      const convertResult = {
        mid: t1.rid, // Assuming 'rid' is the 'mid' in the target format
        data: {
          mid: t1.rid, // Same as above
          gameType: xyz, // Assuming the game type is always 'lucky7'
          autotime: "0", // Fixed value (you can modify this if needed)
          gtype: xyz, // Assuming the game type is 'lucky7' as per the second format
          min: "5", // Assuming this is a fixed value (modify if needed)
          max: "10000", // Assuming this is a fixed value (modify if needed)
          ...t1.card.split(",").reduce((acc: any, card: any, index: any) => {
            acc[`C${index + 1}`] = card; // Dynamically create C1, C2, C3, etc.
            return acc;
          }, {}),
          resultsids: sidsstring, // Assuming this is empty, modify if necessary
          sid50: "", // Empty field, modify if needed
          // winnersString: `${t1.rdesc.replace(/#/g, ', ')}`, // Replace '#' with commas and spaces
          winnersString: `${sidarr.join(",")}`, // Replace '#' with commas and spaces

          result: t1.win, // Assuming 'win' from the first structure maps to 'result' in the target
          winnerName: t1.winnat, // Assuming 'winnat' corresponds to the 'winnerName'
        },
        gameType: slug, // Assuming the game type is always 'lucky7'
      };

      // console.log(convertResult,"convert result",convertResult)

      // await axios.post("http://localhost:3010/api/save-casino-match",convertResult)
      await axios.post(
        "https://api.taj44.com/api/save-casino-match",
        convertResult
      );

      return true;
    } else {
      // Failure (non-200 status): return false
      return false;
    }
  } catch (error) {
    console.error("Error in resultDetail API call:", error);
    // In case of error, return false
    return false;
  }
};

const processResults = async () => {
  // Using Promise.all to call APIs concurrently
  const promises = resultArr.map(async (entry) => {
    const { mid, slug } = entry;
    const result = await resultDetail(slug, mid);
    // console.log(result,"result hahhahahah")

    if (result) {
      // If API call is successful, update the entry to `Result: true`
      entry.Result = true;
      // console.log(result?.data?.data.>t1)

      // axios.post("http://localhost:3010/api/save-match")
      // console.log(`Result for mid ${mid} updated to true. Removing from array.`);
    }

    return entry;
  });

  // Wait for all API calls to complete
  const updatedResults = await Promise.all(promises);

  // Filter out the entries where Result is true
  const filteredResults = updatedResults.filter(
    (entry) => entry.Result === false
  );

  // Update the global resultArr with only those entries that haven't been marked as Result: true
  resultArr.length = 0; // Clear the original array
  resultArr.push(...filteredResults); // Push back the non-removed items

  // console.log("Updated Results Array (filtered): ", resultArr);
};

setInterval(() => {
  processResults();
}, 3000);

export default class CasinoController extends ApiController {
  //   getCasinoMarket = async (req: Request, res: Response) => {
  //     let { type, selectionId } = req.params;
  //     try {
  //       if (!type) this.fail(res, "type is required field");

  //       //let casinoType: any = new DynamicClass(type, {});

  //       if (type === "AAA") type = "aaa";

  //         // const data: any = await CasinoRedisController.casinoGameFetch(
  //         //   types[type] as any
  //         // );
  //       // let data: any = await redisReplica.get(types[type]);

  //         function dataparser(data:any){
  //           const cardValues = data.card ? data.card.split(",") : [];
  //           let cardData: { [key: string]: string } = {}; // Explicit type definition

  //          cardValues.forEach((card: string, index: number) => {
  //         cardData[`C${index + 1}`] = card;
  //           });
  //           return{

  //             autotime:data.lt.toString(),

  //             ...cardData,
  //             desc:data.card,
  //             slug:data.gtype,
  //             status:"1",
  //             title:data.gtype,
  //             match_id:data.mid,
  //             mid:data.mid,

  //             event_data:{
  //               autotime:data.lt.toString(),

  //               market:data.sub.map((data:any) =>({
  //                 MarketName:data?.nat,
  //                 Runners:[{
  //                   b1:data.b,
  //                   gstatus:data.gstatus ==="open"? "1":"0",
  //                   max:data.max,
  //                   min:data.min,
  //                   mid:data.mid,
  //                   runnerName:data.nat,
  //                   nat:data.nat,
  //                   sid:data.sid,
  //                   rate:data.b
  //                 }]
  //               }))

  //             }

  //           }
  //         }

  //       console.log("i am inside this api")

  // console.log("type",type)

  //     //   let data :any = await axios.get(`http://69.62.123.205:3000/tabledata/lucky7`).then((res)=>{
  //     //     console.log(data.json(),"result from api")

  //     //   })
  //     //  let xyx : any = await axios.get(`http://69.62.123.205:3000/iframe/${type}`)
  //     //  let resultnow : any =await axios.get(`http://185.211.99:3000/casinoresult/${type}`)
  //     // console.log(xyx)

  //     //   let xyz:any = xyx.data.tv_url

  //       // data = data ? { data: JSON.parse(data) } : { data: [] };

  //       async function fetchData(type: string) {
  //         try {
  //           let data: any = await axios.get(`http://69.62.123.205:3000/tabledata/${type}`);
  //           console.log(data.data, "result from API");

  //           let xyx: any = await axios.get(`http://69.62.123.205:3000/iframe/${type}`);
  //           let resultnow: any = await axios.get(`http://185.211.99:3000/casinoresult/${type}`);

  //           console.log(xyx.data, "iframe response");
  //           console.log(resultnow.data, "casino result");

  //           return { tableData: data.data, iframeData: xyx.data, casinoResult: resultnow.data };
  //         } catch (error) {
  //           console.error("Error fetching data:", error);
  //         }
  //       }

  //       // Call the function
  //       fetchData("lucky7").then((result) => {
  //         if (!result) {
  //           console.error("Failed to fetch data");
  //           return;
  //         }

  //         console.log(result); // Debugging: Ensure result is not undefined

  //         var data: any = result.tableData;
  //         var resultnow: any = result.casinoResult;
  //         var iframe:any=result.iframeData;

  //         console.log("Table Data:", data);
  //         console.log("Casino Result:", resultnow);
  //       });

  //       let markets: any = [];
  //       let results: any = [];
  //       // let t1: any = {};
  //       let t3: any = null;
  //       let t4: any = null;
  //       let scoreCards: any = undefined;
  //       let tv = ;
  //       // console.log(tv,"tv ishere ")

  //       if(resultnow?.data) results =resultnow
  //       // if (data?.data?.t2) markets = [...data?.data?.t2];
  //       // if (data?.data?.t3) {
  //       //   markets = [...markets, ...data?.data?.t3];
  //       //   t3 = data?.data?.t3;
  //       // }
  //       // if (data?.data?.t4) {
  //       //   markets = [...markets, ...data?.data?.t4];
  //       //   t4 = data?.data?.t4;
  //       // }
  //       // if (data?.data?.bf) markets = [...data?.data?.bf];
  //       // if (data?.data?.results) results = [...data?.data?.results];
  //       // if (data?.data?.t1) t1 = data?.data?.t1?.[0];
  //       // if (data?.data?.tv) tv = xyz;
  //       return eventJson[type]()
  //         .then(async (jsonData: any) => {
  //           const cloneJsonData = JSON.parse(JSON.stringify(jsonData.default));
  //           if (type != "testtp") {
  //             // Todo: For score
  //             if (type === "fivewicket") {
  //               const scoreData = await redisReplica.hGetAll(
  //                 `fivewicket-t1-${t1.mid}`
  //               );
  //               if (scoreData) {
  //                 const { scoreCard } = scoreData;
  //                 if (scoreCard) scoreCards = JSON.parse(scoreCard);
  //               }
  //             }
  //             if (type === "Superover") {
  //               const scoreData = await redisReplica.hGetAll(
  //                 `Superover-t1-${t1.mid}`
  //               );
  //               if (scoreData) {
  //                 const { scoreCards: scoreCard } = scoreData;
  //                 scoreCards = JSON.parse(scoreCard).scoreCard;
  //               }
  //             }
  //             const marketData = marketFormatter(markets, cloneJsonData);

  //             let eventData = {
  //               ...cloneJsonData,
  //               ...t1,
  //               match_id: t1.mid,
  //               results,
  //               tv :xyz,
  //               defaultMarkets: cloneJsonData.event_data.market,
  //               scoreCard: scoreCards,
  //             };
  //             if (type === "Tp1Day" && data?.data?.bf) {
  //               const {
  //                 C1: C1A,
  //                 C2: C2A,
  //                 C3: C3A,
  //                 marketId: mid,
  //                 min,
  //                 max,
  //               } = data.data.bf[0];
  //               const { C1: C1B, C2: C2B, C3: C3B } = data.data.bf[1];
  //               eventData = {
  //                 ...eventData,
  //                 C1A,
  //                 C2A,
  //                 C3A,
  //                 C1B,
  //                 C2B,
  //                 C3B,
  //                 mid,
  //                 match_id: mid,
  //                 min,
  //                 max,
  //               };
  //             }
  //             eventData.event_data.market = marketData;

  //             // console.log(data?.data, marketData);
  //             return this.success(res, { ...eventData, t3, t4 });
  //           } else {
  //             const eventData = {
  //               ...cloneJsonData,
  //               ...t1,
  //               match_id: t1.mid,
  //               results,
  //               tv,
  //               defaultMarkets: cloneJsonData.event_data.market,
  //               t3,
  //               t4,
  //             };
  //             eventData.event_data.market = dataparser(data?.data);
  //             return this.success(res, { ...eventData });
  //           }
  //         })
  //         .catch((e: any) => {
  //           return this.fail(res, e.stack);
  //         });
  //     } catch (e: any) {
  //       return this.fail(res, "");
  //     }
  //   };

  // getCasinoMarket = async (req: Request, res: Response) => {
  //   let { type, selectionId } = req.params;

  //   if (!type) {
  //     return res.status(400).json({ error: "Type is a required field" });
  //   }

  //   type = type === "AAA" ? "aaa" : type;

  //   const result = await fetchData(type);
  //   if (!result) {
  //     return res.status(500).json({ error: "Failed to fetch data" });
  //   }

  //   const { tableData, iframeData, casinoResult } = result;
  //   let markets: any[] = [];
  //   let results: any[] = [];
  //   let t3: any = null;
  //   let t4: any = null;
  //   let scoreCards: any | undefined = undefined;
  //   let tv = iframeData?.data?.tv_url || "";

  //   if (casinoResult?.data) {
  //     console.log(casinoResult.data.res,"casino Result ")
  //     results = casinoResult?.data?.res.map((item:any)=>{
  //       return{
  //         "mid":item.mid.toString(),
  //         "result":item.win.toString()
  //       }
  //     });

  //     console.log(results,"rresult ")
  //   }

  //   function dataparser(data: any,match_id:any) {
  //     const cardValues = data?.card ? data.card.split(",") : [];
  //     let cardData: { [key: string]: string } = {};

  //     cardValues.forEach((card: string, index: number) => {
  //       cardData[`C${index + 1}`] = card;
  //     });

  //     return {
  //       autotime: data?.lt?.toString() || "",
  //       ...cardData,
  //       desc: data?.card || "",
  //       "slug": data?.gtype || "",
  //       status: "1",
  //       title: data?.gtype || "",

  //       "mid": String(data?.mid || ""),
  //       "max":50000,
  //       "min":100,
  //       event_data: {
  //         match_id: match_id.toString() || "",
  //         autotime: data?.lt?.toString() || "",
  //         market: data?.sub?.map((subData: any) => ({
  //           MarketName: subData?.nat || "",
  //           Runners: [
  //             {
  //               b1: subData?.b || "",
  //               gstatus: subData?.gstatus == "OPEN" ? "1" : "0",
  //               max: subData?.max || 0,
  //               min: subData?.min || 0,
  //               mid: data?.mid.toString() || "",
  //               runnerName: subData?.nat || "",
  //               nat: subData?.nat || "",
  //               sid: subData?.sid || "",
  //               rate: subData?.b || ""
  //             }
  //           ]
  //         }))
  //       }
  //     };
  //   }

  //   try {
  //     const jsonData = await eventJson[type]();
  //     const cloneJsonData = JSON.parse(JSON.stringify(jsonData.default));

  //     let eventData = {
  //       ...cloneJsonData,
  //       match_id: cloneJsonData?.match_id .toString()|| "",
  //       results,
  //       tv,
  //       defaultMarkets: cloneJsonData?.event_data?.market || [],
  //       t3,
  //       t4
  //     };

  //     if (type === "Tp1Day" && tableData?.bf) {
  //       const { C1: C1A, C2: C2A, C3: C3A, marketId: mid, min, max } = tableData.bf[0];
  //       const { C1: C1B, C2: C2B, C3: C3B } = tableData.bf[1];

  //       eventData = {
  //         ...eventData,
  //         C1A,
  //         C2A,
  //         C3A,
  //         C1B,
  //         C2B,
  //         C3B,
  //         mid,
  //         match_id: mid,
  //         min,
  //         max
  //       };
  //     }

  //   const  eventDatap = dataparser(tableData?.data,cloneJsonData?.match_id);
  //     // .event_data.market
  //     // console.log(eventData.event_data)
  //     return res.status(200).json({ ...eventData,...eventDatap });
  //   } catch (error) {
  //     console.error("Error processing event data:", error);
  //     return res.status(500).json({ error: "Internal Server Error" });
  //   }
  // };

  getCasinoMarket = async (req: Request, res: Response) => {
    let { type, selectionId } = req.params;
    console.log(type, selectionId, "dhjfjldj");

    if (!type) {
      return res.status(400).json({ error: "Type is a required field" });
    }

    type = type === "AAA" ? "aaa" : type;

    const result = await fetchData(type);
    if (!result) {
      return res.status(500).json({ error: "Failed to fetch data" });
    }

    const { tableData, iframeData, casinoResult } = result;
    let markets: any[] = [];
    let results: any[] = [];
    let t3: any = null;
    let t4: any = null;
    let scoreCards: any | undefined = undefined;
    // let tv = iframeData?.tv_url || ""; bihari
    let tv = iframeData?.data?.tv_url || "";

    if (casinoResult?.data) {
      //
      // console.log(casinoResult.data.res,"casino Result ")
      results = casinoResult?.data?.res.map((item: any) => {
        return {
          mid: item.mid.toString(),
          result: item.win.toString(),
        };
      });

      // console.log(results,"rresult ")
    }

    async function dataparser(data1: any, match_id: any) {
      let data: any;

      if (data1 && data1["t1"]?.gtype === "cricketv3") {
        data = data1.t1;
      } else {
        data = data1;
      }

      const cardValues = data?.card ? data.card.split(",") : [];
      let cardData: { [key: string]: string } = {};
      cardValues.forEach((card: string, index: number) => {
        cardData[`C${index + 1}`] = card;
      });

      // Normalize slug (xyz)
      let xyz: any = data?.gtype;
      xyz = xyz === "lucky7eu" ? "lucky7B" : xyz;
      xyz = xyz === "teen" ? "Tp1Day" : xyz;
      xyz = xyz === "teen8" ? "opentp" : xyz;
      xyz = xyz === "poker6" ? "poker6player" : xyz;
      xyz = xyz === "cmatch20" ? "cricket2020" : xyz;
      xyz = xyz === "3cardj" ? "Cards3J" : xyz;
      xyz = xyz === "cricketv3" ? "fivewicket" : xyz;
      xyz = xyz === "war" ? "warcasino" : xyz;
      xyz = xyz === "race20" ? "race2020" : xyz;
      xyz = xyz === "ab20" ? "Andarbahar" : xyz;
      xyz = xyz === "dt202" ? "dt20b" : xyz;
      xyz = xyz === "dt6" ? "dragontiger1Day" : xyz;
      xyz = xyz === "poker" ? "onedaypoker" : xyz;
      xyz = xyz === "poker20" ? "onedaypoker20" : xyz;
      xyz = xyz === "card32eu" ? "card32b" : xyz;
      xyz = xyz === "aaa" ? "AAA" : xyz;
      xyz = xyz === "btable" ? "ddb" : xyz;
      xyz = xyz === "worli" ? "worliinstant" : xyz;
      xyz = xyz === "teen1" ? "1-CARD-ONE-DAY" : xyz;

      // Prevent duplicates
      const newItem = {
        mid: data?.mid?.toString(),
        slug: data?.gtype,
        Result: false,
      };
      const exists = resultArr.some(
        (item) => item.mid === newItem.mid && item.slug === newItem.slug
      );
      if (!exists) resultArr.push(newItem);

      // Format market data using template
      const getFormattedMarkets = async (slug: any, apiRunners = []) => {
        // console.log(apiRunners,"appi runners")
        type RunnerData = {
          sid?: string | number;
          b?: string;
          l?: string;
          gstatus?: string;
          max?: number;
          min?: number;
          mid?: string;
        };

        const jsonData = await eventJson[slug](); // ← Make sure this maps to correct file
        const templates = JSON.parse(JSON.stringify(jsonData.default)) || [];
        // console.log(templates,"ghjkltyghjkl;tyukl")

        return templates.event_data.market.map((market: any) => ({
          MarketName: market.MarketName,
          Runners: market.Runners.map((templateRunner: any) => {
            const live: RunnerData =
              apiRunners.find(
                (r: any) =>
                  r?.sid?.toString() === templateRunner.SelectionId?.toString()
              ) || {};

            // console.log("live",live ,"rtyuihojghjki")
            // console.log({
            //   RunnerName: templateRunner.RunnerName,
            //   SelectionId: templateRunner.SelectionId,
            //   b1: live.b || "0.00",
            //   l1: live.l || "0.00",
            //   gstatus: live.gstatus === "OPEN" ? "1" : "0",
            //   max: live.max || 100000,
            //   min: live.min || 100,
            //   mid: live.mid || data?.mid?.toString() || "",
            //   rate: live.b || "0.00",
            //   sid: live?.sid?.toString() || templateRunner.SelectionId,
            //   nat: templateRunner.RunnerName,
            //   runnerName: templateRunner.RunnerName,
            // },"hello world yuijok")
            let bhav: any = live?.b;
            // console.log(xyz,"inside teen pattu ")

            if (xyz == "lucky7") {
              if (
                templateRunner.RunnerName === "High Card" ||
                templateRunner.RunnerName === "Low Card"
              ) {
                bhav = parseFloat(bhav) - 0.03;
              } else if (templateRunner.RunnerName === "Even") {
                bhav = parseFloat(bhav) - 0.13;
              } else if (templateRunner.RunnerName == "Odd") {
                bhav = parseFloat(bhav) - 0.01;
              } else if (templateRunner.RunnerName.includes("Card ")) {
                bhav = parseFloat(bhav) - 1;
              }
            } else if (xyz == "dt20" || xyz == "dt20b") {
              let name = templateRunner.RunnerName;
              if (name == "Dragon" || name == "Tiger") {
                bhav = parseFloat(bhav) - 0.03;
              } else if (name == "Dragon Even") {
                bhav = parseFloat(bhav) - 0.15;
              } else if (name == "Dragon Odd") {
                bhav = parseFloat(bhav) - 0.01;
              } else if (name == "Tiger Even") {
                bhav = parseFloat(bhav) - 0.15;
              } else if (name == "Tiger Odd") {
                bhav = parseFloat(bhav) - 0.01;
              } else if (name.includes(" Card ")) {
                bhav = parseFloat(bhav) - 1;
              }else if (name == "Tie"){
                bhav = parseFloat(bhav) - 5
              }
            }else if (xyz == "teen20"){
              let name = templateRunner.RunnerName;
              // console.log("Hahahahhahah",name)
              if(name == "Player A"){
                // console.log(name,"fghjkfghjklghjkl")
                bhav = parseFloat(bhav) - 0.01;
                // console.log(bhav,"bhva of player a")
              }else if( name == "Player B"){
                bhav = parseFloat(bhav) - 0.03;
            }
          }

            return {
              RunnerName: templateRunner.RunnerName,
              SelectionId: templateRunner.SelectionId,
              // b1: bhav > 0 ? bhav?.toString() : "0.00" || "0.00",
              b1: bhav > 0 ? bhav.toFixed(2) : "0.00",

              l1: live.l || "0.00",
              gstatus: live.gstatus === "OPEN" ? "1" : "0",
              max: live.max || 100000,
              min: live.min || 100,
              mid: live.mid || data?.mid?.toString() || "",
              rate: live.b || "0.00",
              sid: live?.sid?.toString() || templateRunner.SelectionId,
              nat: templateRunner.RunnerName,
              runnerName: templateRunner.RunnerName,
            };
          }),
        }));
      };

      // Final formatted markets from templates + live
      const marketsxyzz = await getFormattedMarkets(xyz, data?.sub || []);
      // console.log(marketsxyzz[0],"formatedd data")

      // Return full object
      return {
        autotime: data?.lt?.toString() || "",
        ...cardData,
        desc: data?.card || "",
        slug: xyz || "",
        status: "1",
        title: xyz || "",
        match_id: data?.mid?.toString() || "",
        mid: String(data?.mid || ""),
        max: 50000,
        min: 100,
        event_data: {
          autotime: data?.lt?.toString() || "",
          match_id: match_id?.toString() || "",
          remark: "",
          market: marketsxyzz,
        },
      };
    }

    try {
      // type == "aaa" ? "AAA" :type
      const jsonData = await eventJson[type]();
      const cloneJsonData = JSON.parse(JSON.stringify(jsonData.default));
      console.log(
        cloneJsonData?.match_id.toString() || "",
        "hello world dhkafkal;jcl;ajol"
      );

      let eventData = {
        ...cloneJsonData,
        match_id: tableData?.data.data || "",
        results,
        tv,
        defaultMarkets: cloneJsonData?.event_data?.market || [],
        t3,
        t4,
      };

      // if (type === "Tp1Day" && tableData?.bf) {
      //   const { C1: C1A, C2: C2A, C3: C3A, marketId: mid, min, max } = tableData.bf[0];
      //   const { C1: C1B, C2: C2B, C3: C3B } = tableData.bf[1];

      //   eventData = {
      //     ...eventData,
      //     C1A,
      //     C2A,
      //     C3A,
      //     C1B,
      //     C2B,
      //     C3B,
      //     mid,
      //     match_id: mid,
      //     min,
      //     max
      //   };
      // }

      const eventDatap = await dataparser(
        tableData?.data,
        cloneJsonData?.match_id
      );
      // .event_data.market
      // console.log(eventDatap)
      return res.status(200).json({ ...eventData, ...eventDatap });
    } catch (error) {
      console.error("Error processing event data:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getSingleMarket = async (req: Request, res: Response) => {
    let { type, selectionId } = req.params;
    console.log(req.params, "getsinglemarket");
    type = type === "lucky7B" ? "lucky7eu" : type;
    type = type === "Tp1Day" ? "teen" : type;
    type = type === "testtp" ? "teen9" : type;
    type = type === "opentp" ? "teen8" : type;
    type = type === "ddb" ? "btable" : type;

    type = type === "onedaypoker20" ? "poker20" : type;
    type = type === "onedaypoker" ? "poker" : type;
    type = type === "poker6player" ? "poker6" : type;
    type = type === "cmeter2020" ? "cmeter" : type;
    type = type === "cricket2020" ? "cmatch20" : type;
    type = type === "Cards3J" ? "3cardj" : type;
    type = type === "fivewicket" ? "cricketv3" : type;
    type = type === "warcasino" ? "war" : type;
    type = type === "race2020" ? "race20" : type;
    type = type === "Andarbahar" ? "ab20" : type;
    type = type === "dt20b" ? "dt202" : type;
    type = type === "dragontiger1Day" ? "dt6" : type;
    type = type === "card32b" ? "card32eu" : type;
    type = type === "worliinstant" ? "worli" : type;
    type = type === "1-CARD-ONE-DAY" ? "teen1" : type;

    try {
      if (!type) return this.fail(res, "type is a required field");
      console.log("type", type);
      if (!selectionId)
        return this.fail(res, "selectionId is a required field");

      if (type === "AAA") type = "aaa";

      let response = await axios.get(
        `http://69.62.123.205:3000/tabledata2/${type}`
      );
      let data = response.data;

      console.log(data, "data hjkl");

      let pdata = data?.data?.sub ?? [];
      let markets: any = pdata;
      // console.log(markets, "markets");

      interface Market {
        sid?: string | undefined; // Ensure sid is always a string (no undefined allowed)
        nat?: string | undefined;
        b?: number;
        l?:number | 0;
        max: number;
        min: number;
        gstatus?: string | undefined;
        b1?: number; // Optional if missing in API
        l1?:any;
        runnerName?: string | undefined;
        title?: string;
      }

      // let l :any;

      let singleMarket: Market | null = null;

      if (markets.length > 0 && selectionId) {
        let sidStr = "sid";
        switch (type.toLowerCase()) {
          case "testtp":
            sidStr = "tsection";
            break;
          case "tp1day":
            sidStr = "sectionId";
            break;
        }

        const matchedRecord = markets.filter(
          (market: any) => market[sidStr] == selectionId
        );

        if (matchedRecord.length > 0) {
          singleMarket = matchedRecord[0] as Market;
        }
      }

      console.log(singleMarket, "singleMarket");
      let bhav: any = singleMarket?.b;

      if (type === "lucky7" ) {
        if (
          singleMarket?.nat === "High Card" ||
          singleMarket?.nat === "Low Card"
        ) {
          bhav = parseFloat(bhav) - 0.03;
        } else if (singleMarket?.nat === "Even") {
          bhav = parseFloat(bhav) - 0.13; // ✅ updated from 0.05 → 0.13
        } else if (singleMarket?.nat === "Odd") {
          bhav = parseFloat(bhav) - 0.01;
        } else if (
          singleMarket &&
          singleMarket.nat &&
          singleMarket?.nat.includes("Card ")
        ) {
          bhav = parseFloat(bhav) - 1;
        }
      } else if (type === "dt20"|| type==="dt202") {
        let name = singleMarket?.nat;
        if (name === "Dragon" || name === "Tiger") {
          bhav = parseFloat(bhav) - 0.03;
        } else if (name === "Dragon Even") {
          bhav = parseFloat(bhav) - 0.15; // ✅ updated from 0.04 → 0.15
        } else if (name === "Dragon Odd") {
          bhav = parseFloat(bhav) - 0.01;
        } else if (name === "Tiger Even") {
          bhav = parseFloat(bhav) - 0.15; // ✅ updated from 0.04 → 0.15
        } else if (name === "Tiger Odd") {
          bhav = parseFloat(bhav) - 0.01;
        } else if (name && name.includes(" Card ")) {
          bhav = parseFloat(bhav) - 1;
        }else if(name && name == "Tie"){
          bhav = parseFloat(bhav) - 5;
        }
      }
      else if (type === "teen20"){
        let name = singleMarket?.nat;
        if(name == "Player A"){
          bhav = parseFloat(bhav) - 0.01;
        }else if( name == "Player B"){
          bhav = parseFloat(bhav) - 0.03;
      }
     }


      // Ensure singleMarketData has all required properties, with default values where needed
      let singleMarketData: Market | null = singleMarket
        ? {
          sid: singleMarket?.sid ?? "defaultSid", // Default value for sid
          nat: singleMarket?.nat ?? "", // Default empty string for optional string fields
          b1: bhav.toString() ?? 0,
          l1:singleMarket?.l?.toString(),// Default 0 for numbers
          max: singleMarket?.max ?? 0,
          min: singleMarket?.min ?? 0,
          gstatus: singleMarket?.gstatus ?? "",
          runnerName: singleMarket?.nat ?? "", // Default empty string
          title: singleMarket?.title ?? "", // Default empty string
        }
        : null;

      // Add min/max from the API if available
      if (data?.data?.t1?.length > 0 && data?.data?.t1[0].min) {
        const min: number = data?.data?.t1[0].min ?? 0;
        const max: number = data?.data?.t1[0].max ?? 0;
        singleMarketData = { ...singleMarketData, min, max };
      }
      console.log("single market Data", singleMarketData);
      return this.success(res, { ...singleMarketData });
    } catch (e: any) {
      return this.fail(res, e.stack);
    }
  };

  getTvurl = async (req: Request, res: Response) => {
    let type: any = req.params.type;
    type = type === "lucky7B" ? "lucky7eu" : type;
    type = type === "Tp1Day" ? "teen" : type;
    type = type === "testtp" ? "teen9" : type;
    type = type === "opentp" ? "teen8" : type;
    type = type === "ddb" ? "btable" : type;

    type = type === "onedaypoker20" ? "poker20" : type;
    type = type === "onedaypoker" ? "poker" : type;
    type = type === "poker6player" ? "poker6" : type;
    type = type === "cmeter2020" ? "cmeter" : type;
    type = type === "cricket2020" ? "cmatch20" : type;
    type = type === "Cards3J" ? "3cardj" : type;
    type = type === "fivewicket" ? "cricketv3" : type;
    type = type === "warcasino" ? "war" : type;
    type = type === "race2020" ? "race20" : type;
    type = type === "Andarbahar" ? "ab20" : type;
    type = type === "dt20b" ? "dt202" : type;
    type = type === "dragontiger1Day" ? "dt6" : type;
    type = type === "card32b" ? "card32eu" : type;
    type = type === "worliinstant" ? "worli" : type;
    type = type === "1-CARD-ONE-DAY" ? "teen1" : type;
    type = type === "1-CARD-ONE-DAY" ? "teen1" : type;
    type = type === "fivewicket" ? "cricketv3" : type;
    type = type === "AAA"? "aaa":type

    try {
      // const iframeResponse = await axios.get(
      //   `http://69.62.123.205:3000/iframe2/${type}`
      // );
      // console.log(iframeResponse.data, "ifrmmmamamamamam");
      return res.status(200).json({ tv: `https://live.cricketid.xyz/casino-tv?id=${type}`});
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
