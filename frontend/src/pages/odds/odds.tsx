import React, { useReducer } from 'react'
import IMarket from '../../models/IMarket'
import LFancy from '../../models/LFancy'
import sportsService from '../../services/sports.service'
import { useParams } from 'react-router-dom'
import IMatch from '../../models/IMatch'
import { IUserBetStake } from '../../models/IUserStake'
import { useDispatch } from 'react-redux'
import { betPopup, selectFancyType } from '../../redux/actions/bet/betSlice'
import IBet from '../../models/IBet'
import { setCurrentMatch } from '../../redux/actions/sports/sportSlice'
import Score from './components/score'
import { useWebsocketUser } from '../../context/webSocketUser'
import { useAppSelector } from '../../redux/hooks'
import { selectUserData } from '../../redux/actions/login/loginSlice'
import { isMobile } from 'react-device-detect'
import MatchDetail from './components/match-detail'
import MatchDetailMobile from './components/match-detail-mobile'
import axios from 'axios'
import { RoleType } from '../../models/User'
import authService from '../../services/auth.service'
import { selectInitApp } from '../../redux/actions/common/commonSlice'
import { typographyClasses } from '@mui/material'
import betService from '../../services/bet.service'
import { io } from "socket.io-client";
import ClientBetsUser from '../../admin-app/pages/SportsDetail/ClientBetsUser'
import moment from 'moment'


// const isMobile = true;

type MarketData = {
  markets: IMarket[]
  fancies: LFancy[]
  currentMatch: IMatch
  stake: IUserBetStake
}


// const isMobile = true
const Odds = () => {
  const [marketDataList, setMarketDataList] = React.useState<MarketData>({} as MarketData)
  const [t10Channel, setT10Chanel] = React.useState<any>()
  const [isTvShow, setIsTvShow] = React.useState<boolean>(false)
  const userState = useAppSelector(selectUserData)
  const { matchId } = useParams()
  console.log(matchId, "matchid inn spots ")
  const dispatch = useDispatch()
  const selectFancyT = useAppSelector(selectFancyType)
  const initApp = useAppSelector(selectInitApp)

  const { socketUser } = useWebsocketUser()
  // React.useEffect(()=>{
  //   const fancyadd =async()=>{
  //     console.log("hello world")
  //     try {
  //      const res =await axios.post(`http://localhost:3010/api/add-new-fancy/${matchId}`)
  //      console.log(res,"hello world")
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }

  //   fancyadd();

  // },[matchId])






  const fetchOddsDetail = async () => {
    try {
      axios
        .all([
          sportsService.getMatchById(matchId!),
          sportsService.getMarketList(matchId!),
          sportsService.getFancyList(matchId!),
        ])
        .then(
          axios.spread((currentMatch, marketData, fancyData) => {
            dispatch(setCurrentMatch(currentMatch.data.data.match))
            setMarketDataList({
              currentMatch: currentMatch.data.data.match,
              fancies: fancyData.data.data,
              markets: marketData.data.data.markets,
              stake: currentMatch.data.data.stake,
            })
          }),
        )
    } catch (error) {
      console.log(error)
      fetchOddsDetail()
    }
  }

  React.useEffect(() => {
    return () => {
      dispatch(betPopup({ isOpen: false, betData: {} as IBet }))
    }
  }, [])

  React.useEffect(() => {
    if (initApp.event) {
      sportsService
        .getFancyList(matchId!, selectFancyT)
        .then((fancyData) => {
          // setMarketDataList({ ...marketDataList, fancies: fancyData.data.data })
        })
        .catch((e) => console.log(e.message))
    }
  }, [initApp])

  React.useEffect(() => {
    fetchOddsDetail()
  }, [matchId])

  const fetchT10Stream = async () => {
    if (currentMatch?.isT10) {
      const resp = await authService.gett10Streams()
      if (resp?.data) {
        const dataFilter = resp?.data?.filter(
          (Item: any) => parseInt(Item.gameId) == currentMatch?.matchId,
        )
        setT10Chanel(dataFilter?.[0]?.channel)
      }
    }
  }

  React.useEffect(() => {
    ; (async () => {
      if (selectFancyT && Object.keys(marketDataList).length > 0) {
        const fancyData = await sportsService.getFancyList(matchId!, selectFancyT)
        setMarketDataList({ ...marketDataList, fancies: fancyData.data.data })
      }
    })()
  }, [selectFancyT])

  React.useEffect(() => {
    if (userState.user._id) {
      socketUser.emit('joinRoomMatchIdWUserId', `${userState.user._id}-${matchId}`)
      socketUser.on('connect', () => {
        socketUser.emit('joinRoomMatchIdWUserId', `${userState.user._id}-${matchId}`)
      })
    }
  }, [userState.user])

  React.useEffect(() => {
    fetchT10Stream()
  }, [marketDataList])



  const scoreBoard = () => {
    if (currentMatch && currentMatch.sportId == '4333')
      return <Score matchId={currentMatch?.matchId} isT10={currentMatch?.isT10 || false} />
    else if (currentMatch)
      return (
        <iframe
          style={{ width: '100%', height: 'auto', }}
          src={`https://card.hr08bets.in/api/getScoreData?event_id=${currentMatch?.matchId}`}
        ></iframe>
      )
  }

  const t10Tv = (height: string) => {
    if (currentMatch && currentMatch.isT10)
      return (
        <div className='t10-iframe'>
          <iframe
            style={{ height: `${height}px` }}
            src={`https://alpha-n.qnsports.live/route/rih.php?id=${t10Channel}`}
          ></iframe>
        </div>
      )
    else <div></div>
  }

  const otherTv = () => {
    const tvUrl =
      currentMatch && currentMatch.sportId == '4'
        ? 'https://livestream-v3-iframe.akamaized.uk/?eventid='
        : 'https://livestream-v3-iframe.akamaized.uk/?eventid='
    // : 'https://hr08bets.in/sports-stream-live/index.html?eventid='
    return (
      !currentMatch?.isT10 && (
        <div className='card m-b-10' style={{ border: '0px none' }}>
          {!isMobile ? (
            <div className='card-header'>
              <h6 onClick={() => setIsTvShow(!isTvShow)} className='card-title'>
                Live Match
                <span className='float-right'>
                  <i className='fa fa-tv' /> live stream started
                </span>
              </h6>
            </div>
          ) : (
            ''
          )}
          {!isMobile && isTvShow && (
            <div className='card-body p0'>
              <iframe
                style={{ width: '100%', height: '250px' }}
                // src={`${tvUrl}${currentMatch?.matchId}`}
                // src={`https://playg3.livestream11.com/user/526414545/unknown/27.0.178.13/c590458e-6d81-450e-8a6d-119bc2234267`}
                src={`https://livestream-v3-iframe.akamaized.uk/?eventid=${currentMatch?.matchId}`}
              ></iframe>
              LIVE TV
            </div>
          )}
          {isMobile && (
            <div className='card-body p0'>
              <iframe
                style={{ width: '100%', height: '250px' }}
                // src={`${tvUrl}${currentMatch?.matchId}`}
                src={`https://livestream-v3-iframe.akamaized.uk/?eventid=${currentMatch?.matchId}`}
              ></iframe>

            </div>
          )}
        </div>
      )
    )
  }
  const { currentMatch, markets, fancies } = marketDataList

  const id: any = currentMatch?.matchId;

  React.useEffect(() => {
    if (!id) return; // prevent firing if id is undefined

    betService.iframeUrl(id)
      .then((res) => {
        console.log(res, "res of data");
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);


  const options = {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: true,
  };

  //   React.useEffect(()=>{
  //     const socket = io("https://d-score.scoreswift.xyz", options); 

  //     socket.on("connect", () => {
  //       console.log("Connected to server");

  //       // this number is 462034047 oldgmid which you can get from "Match details endpoint"
  //       socket.emit("subscribe", { type: 1, rooms: [currentMatch?.matchId] });
  //       console.log("data has been send, waiting for score update");
  //     });



  // socket.on("disconnect", () => {
  //   console.log("Disconnected from server");
  // });

  // // Error handling
  // socket.on("connect_error", (error:any) => {
  //   console.error("Connection error:", error);
  // });

  // socket.on("connect_timeout", () => {
  //   console.error("Connection timeout");
  // });


  // // score udpate will came here
  // socket.on("update", (data:any) => {
  //   console.log("score update has been arrived", data);
  // });

  // // Clean up on application exit
  // // process.on("SIGINT", () => {
  // //   console.log("Closing socket connection");
  // //   socket.close();
  // //   process.exit();
  // // });


  //   },[])





  const getSimilarity = (str1: any, str2: any) => {
    if (!str1 || !str2) return 0;
    str1 = str1.toLowerCase().replace(/[^a-z]/g, '');
    str2 = str2.toLowerCase().replace(/[^a-z]/g, '');

    let matches = 0;
    for (let char of str1) {
      if (str2.includes(char)) matches++;
    }

    const longerLength = Math.max(str1.length, str2.length);
    return matches / longerLength;
  };

  const [matcheddata, setMatcheddata] = React.useState<any>({});
  const [matchedMatch, setMatchedMatch] = React.useState<any>({});
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);



  // React.useEffect(()=>{
  //   axios.get('https://cricket-apis.onrender.com/api/live-matches').then((res)=>{
  //     console.log(res,"recent matches ")
  //     const im = res?.data?.data



  //     const matchTitle:string = currentMatch?.name; // e.g. "Sri Lanka v Bangladesh"
  //     if (!matchTitle) return;


  //     const [team1, team2] = matchTitle?.split(" v ").map(t => t.trim());

  //     const found = im.find((item:any) => {
  //       const a = item.team_a || "";
  //       const b = item.team_b || "";

  //       const score1a = getSimilarity(team1, a);
  //       const score2b = getSimilarity(team2, b);

  //       const score1b = getSimilarity(team1, b);
  //       const score2a = getSimilarity(team2, a);

  //       return (
  //         (score1a > 0.7 && score2b > 0.7) || // A-B order
  //         (score1b > 0.7 && score2a > 0.7)    // B-A order
  //       );
  //     });

  //     setMatcheddata(found || null);
  //     console.log(found, "matched match hdhdhdh match found");





  //     // console.log(fim,"filtred mathes")
  //   })
  // },[currentMatch?.name])

  // React.useEffect(() => {
  //   if (!matcheddata?.match_id) return;

  //   const fetchLiveMatch = async () => {
  //     try {
  //       const response = await axios.post('https://cricket-apis.onrender.com/api/live-match', {
  //         match_id: matcheddata?.match_id
  //       });

  //       const newData = response?.data?.data;
  //       setMatchedMatch(newData);
  //       console.log("Live match data updated", newData);
  //     } catch (error) {
  //       console.error("Error fetching live match:", error);
  //     }
  //   };

  //   // Initial call
  //   fetchLiveMatch();

  //   // Setup polling every 5 seconds
  //   intervalRef.current = setInterval(fetchLiveMatch, 1000);

  //   // Cleanup on unmount or match_id change
  //   return () => {
  //     if (intervalRef.current) clearInterval(intervalRef.current);
  //   };
  // }, [matcheddata?.match_id]);






  return !isMobile || (isMobile && userState?.user?.role != RoleType.user) ? (
    <><MatchDetail
      currentMatch={currentMatch}
      fancies={
        moment().isSame(moment(currentMatch?.matchDateTime), "day") &&
          moment().isAfter(moment(currentMatch?.matchDateTime))
          ? fancies
          : []
      }
      // fancies={fancies}
      scoreBoard={scoreBoard}
      marketDataList={marketDataList}
      matchId={matchId}
      markets={markets}
      t10Tv={t10Tv}
      userRole = {userState?.user?.role}
      matchedMatch={matchedMatch}
      otherTv={otherTv} />

      {userState?.user?.role != RoleType.user ? <ClientBetsUser /> : <></>}
    </>

  ) : (
    <><MatchDetailMobile
      currentMatch={currentMatch}
      fancies={
        moment().isSame(moment(currentMatch?.matchDateTime), "day") &&
          moment().isAfter(moment(currentMatch?.matchDateTime))
          ? fancies
          : []
      }
      // fancies={fancies}
      scoreBoard={scoreBoard}
      marketDataList={marketDataList}
      matchId={matchId}
      t10Tv={t10Tv}
      markets={markets}
      matchedMatch={matchedMatch}
      otherTv={otherTv} /> {userState?.user?.role != RoleType.user ? <ClientBetsUser /> : <></>}</>
  )
}
export default React.memo(Odds)
