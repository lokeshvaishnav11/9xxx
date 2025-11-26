// import moment from 'moment'
// import React from 'react'
// import { useWebsocketUser } from '../../../context/webSocketUser'
// import IBet from '../../../models/IBet'
// import { RoleType } from '../../../models/User'
// import { selectPlaceBet, setBetCount, setbetlist, setBookMarketList } from '../../../redux/actions/bet/betSlice'
// import { selectUserData } from '../../../redux/actions/login/loginSlice'
// import { selectCurrentMatch } from '../../../redux/actions/sports/sportSlice'
// import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
// import betService from '../../../services/bet.service'
// import { betDateFormat } from '../../../utils/helper'
// import { isMobile } from 'react-device-detect'
// import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice'
// import { useLocation } from 'react-router-dom'

// const MyBetComponent = () => {
//   const [getMyAllBet, setMyAllBet] = React.useState<IBet[]>([])
//   const getPlaceBet = useAppSelector(selectPlaceBet)
//   const getCurrentMatch = useAppSelector(selectCurrentMatch)
//   const getCasinoCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
//   const userState = useAppSelector(selectUserData)
//   const { socketUser } = useWebsocketUser()
//   const dispatch = useAppDispatch()
//   const [betRefresh, setRefreshStatus] = React.useState<any>(false)
//   const location = useLocation();
//   React.useEffect(() => {
//     // console.log(getCurrentMatch,"hello world here is Match id")
//     console.log(getCasinoCurrentMatch?.match_id," getCasinoCurrentMatch hello world here is Match id")

//     if (getCurrentMatch && getCurrentMatch.matchId && location.pathname.includes('/odds') || getCasinoCurrentMatch && getCasinoCurrentMatch.match_id) {
//       const dataMatchId: any = getCurrentMatch && getCurrentMatch.matchId && location.pathname.includes('/odds') ? getCurrentMatch.matchId : (getCasinoCurrentMatch && getCasinoCurrentMatch?.event_data?.match_id ? getCasinoCurrentMatch?.event_data?.match_id : 0)
//       console.log("hello world match")
//       betService
//         .getBets(dataMatchId)
//         .then((bets) => {
//           console.log(bets.data,"chech bet data")
//           bets && bets.data && bets.data.data && setMyAllBet(bets.data.data.bets)
//           dispatch(setbetlist(bets.data.data.bets))
//           dispatch(setBookMarketList(bets.data.data.odds_profit))
//           dispatch(setBetCount(bets.data.data.bets.length))
//         })
//         .catch((e) => {
//           console.log(e.stack)
//         })
//     }
//   }, [getCurrentMatch, getCasinoCurrentMatch, betRefresh])

//   React.useEffect(() => {
//     if (getPlaceBet.bet.marketId) {
//       //setMyAllBet([{ ...getPlaceBet.bet }, ...getMyAllBet])
//       setRefreshStatus(betRefresh ? false : true)
//     }
//   }, [getPlaceBet.bet])

//   React.useEffect(() => {
//     socketUser.on('placedBet', (bet: IBet) => {
//       ///setMyAllBet([bet, ...getMyAllBet])
//       setRefreshStatus(betRefresh ? false : true)
//     })
//     return () => {
//       socketUser.off('placedBet')
//     }
//   }, [getMyAllBet])

//   // React.useEffect(() => {
//   //   socketUser.on('betDelete', ({ betId }) => {
//   //     ///setMyAllBet(getMyAllBet.filter((bet: IBet) => bet._id !== betId))
//   //     setRefreshStatus(betRefresh ? false : true)
//   //     ///dispatch(setBookMarketList({}))
//   //   })
//   //   return () => {
//   //     socketUser.off('betDelete')
//   //   }
//   // }, [getMyAllBet])

//   console.log(getMyAllBet,"get my all bets")

//   return (
//     <div className='table-responsive-new' style={{height:"200px", overflowY:"scroll"}}>
//       <table className='table coupon-table scorall mybet'>
//         <thead>
//           <tr style={{background:"#76d68f"}}>
//             <th>Sr.</th>
//             {userState.user.role !== RoleType.user && <th >Username</th>}
//             <th className='text-left'> Narration</th>
//             <th> Rate</th>
//             <th> Amount</th>

//             <th> Run</th>
//             <th> Mode</th>

//             {/* {!isMobile && <th style={{background:"#76d68f"}}> Place Date</th>} */}
//             {/* {!isMobile && <th style={{background:"#76d68f"}}> Match Date</th>} */}
//             <th style={{background:"#76d68f"}}> Dec</th>
//             {userState.user.role !== RoleType.user && <th> Date</th>}
//           </tr>
//         </thead>
//         <tbody className='scorall'>
//           {getMyAllBet?.filter((b:any)=>b.bet_on !== "MATCH_ODDS")?.map((bet: IBet, index: number , ) => (
//             <tr className={bet.isBack ? 'back' : 'lay'} key={bet._id}>
//               <td className='no-wrap'> {index + 1} </td>
//               {userState.user.role !== RoleType.user && <td>{bet.userName}</td>}
//               <td className='no-wrap'>
//                 {' '}
//                 {bet.selectionName} /{' '}
//                 {bet.marketName === 'Fancy' && bet.gtype !== 'fancy1' ? bet.volume.toFixed(2) : bet.odds.toFixed(2)}{' '}
//               </td>
//               <td className='no-wrap text-center' > { bet.gtype === 'fancy1' ? bet.odds.toFixed(2) : bet?.volume.toFixed(2) }</td>
//               <td className='no-wrap'> {bet.stack} </td>

//               <td className='no-wrap text-center' > { bet.gtype === 'fancy1' ?  bet?.selectionName : bet.odds.toFixed(2) } </td>
//               <td className='no-wrap text-center' > {bet.isBack ? "Yes" : "No"} </td>


//               {/* {!isMobile && (
//                 <td className='no-wrap'> {moment(bet.betClickTime).format(betDateFormat)} </td>
//               )}
//               {!isMobile && (
//                 <td className='no-wrap'> {moment(bet.createdAt).format(betDateFormat)} </td>
//               )} */}
//               <td className='no-wrap text-center' > {bet?.result?.result ? bet?.result?.result  :"YES" } </td>
//               {userState.user.role !== RoleType.user && <td className='no-wrap'>{moment.utc(bet.betClickTime).utcOffset('+05:30').format('DD/MM/YYYY hh:mm:ss A')} </td>}
//             </tr>



//           ))}
//                     <tr>
//   <td colSpan={8} style={{ backgroundColor: "darkgoldenrod", color: "white", padding: "8px 10px", textAlign: "left" }}>
//     Match Bets
//   </td>
// </tr>

//                     {getMyAllBet?.filter((b:any)=>b.bet_on === "MATCH_ODDS").map((bet: IBet, index: number , ) => (
//             <tr className={bet.isBack ? 'back' : 'lay'} key={bet._id}>
//               <td className='no-wrap'> {index + 1} </td>
//               {userState.user.role !== RoleType.user && <td>{bet.userName}</td>}
//               <td className='no-wrap'>
//                 {' '}
//                 {bet.selectionName} /{' '}
//                 {bet.marketName === 'Fancy' && bet.gtype !== 'fancy1' ? bet.volume.toFixed(2) : bet.odds.toFixed(2)}{' '}
//               </td>
//               <td className='no-wrap text-center' > {bet.odds.toFixed(2)} </td>
//               <td className='no-wrap'> {bet.stack} </td>

//               <td className='no-wrap text-center' > {bet?.selectionName} </td>
//               <td className='no-wrap text-center' > {bet.isBack ? "Yes" : "No"} </td>


//               {/* {!isMobile && (
//                 <td className='no-wrap'> {moment(bet.betClickTime).format(betDateFormat)} </td>
//               )}
//               {!isMobile && (
//                 <td className='no-wrap'> {moment(bet.createdAt).format(betDateFormat)} </td>
//               )} */}
//               <td className='no-wrap text-center' > {bet?.result?.result ? bet?.result?.result  :"YES" } </td>
//               {userState.user.role !== RoleType.user && <td className='no-wrap'>{moment.utc(bet.betClickTime).utcOffset('+05:30').format('DD/MM/YYYY hh:mm:ss A')} </td>}
//             </tr>



//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }

// export default MyBetComponent



import moment from 'moment-timezone';

import React from 'react'
import { useWebsocketUser } from '../../../context/webSocketUser'
import IBet from '../../../models/IBet'
import { RoleType } from '../../../models/User'
import { selectPlaceBet, setBetCount, setbetlist, setBookMarketList } from '../../../redux/actions/bet/betSlice'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { selectCurrentMatch } from '../../../redux/actions/sports/sportSlice'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import betService from '../../../services/bet.service'
import { betDateFormat } from '../../../utils/helper'
import { isMobile } from 'react-device-detect'
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice'
import { useLocation } from 'react-router-dom'

const MyBetComponent = () => {
  const [getMyAllBet, setMyAllBet] = React.useState<IBet[]>([])
  const getPlaceBet = useAppSelector(selectPlaceBet)
  const getCurrentMatch = useAppSelector(selectCurrentMatch)
  const getCasinoCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
  const userState = useAppSelector(selectUserData)
  const { socketUser } = useWebsocketUser()
  const dispatch = useAppDispatch()
  const [betRefresh, setRefreshStatus] = React.useState<any>(false)
  const location = useLocation();

  React.useEffect(() => {
    console.log(getCasinoCurrentMatch?.match_id, " getCasinoCurrentMatch hello world here is Match id")

    if (getCurrentMatch && getCurrentMatch.matchId && location.pathname.includes('/odds') || getCasinoCurrentMatch && getCasinoCurrentMatch.match_id) {
      const dataMatchId: any = getCurrentMatch && getCurrentMatch.matchId && location.pathname.includes('/odds') ? getCurrentMatch.matchId : (getCasinoCurrentMatch && getCasinoCurrentMatch?.event_data?.match_id ? getCasinoCurrentMatch?.event_data?.match_id : 0)
      console.log("hello world match")
      betService
        .getBets(dataMatchId)
        .then((bets) => {
          console.log(bets.data, "chech bet data")
          bets && bets.data && bets.data.data && setMyAllBet(bets.data.data.bets)
          dispatch(setbetlist(bets.data.data.bets))
          dispatch(setBookMarketList(bets.data.data.odds_profit))
          dispatch(setBetCount(bets.data.data.bets.length))
        })
        .catch((e) => {
          console.log(e.stack)
        })
    }
  }, [getCurrentMatch, getCasinoCurrentMatch, betRefresh])

  React.useEffect(() => {
    if (getPlaceBet.bet.marketId) {
      setRefreshStatus(betRefresh ? false : true)
    }
  }, [getPlaceBet.bet])

  React.useEffect(() => {
    socketUser.on('placedBet', (bet: IBet) => {
      setRefreshStatus(betRefresh ? false : true)
    })
    return () => {
      socketUser.off('placedBet')
    }
  }, [getMyAllBet])

  console.log(getMyAllBet, "get my all bets")

  // -----------------------------
  // ✅ Group Fancy bets by runnerName (selectionName)
  // -----------------------------
  const fancyBets = getMyAllBet?.filter((b: any) => b.bet_on !== "MATCH_ODDS") || []
  const groupedFancyBets = fancyBets.reduce((acc: any, bet: IBet) => {
    const key = bet.selectionName || "Unknown"
    if (!acc[key]) acc[key] = []
    acc[key].push(bet)
    return acc
  }, {})

  // Match Odds bets remain same
  const matchBets = getMyAllBet?.filter((b: any) => b.bet_on === "MATCH_ODDS") || []

  return (
    <> {getMyAllBet?.length > 0 &&
      <div className='table-responsive-new' style={{ height: "200px", overflowY: "scroll" }}>
        <h6 className='card-title d-inline-block'>My Bet</h6>
        <table className='table coupon-table scorall mybet'>
          <thead>
            <tr style={{ background: "#76d68f" }}>
              <th className='p-2'>Sr.</th>
              {userState.user.role !== RoleType.user && <th className='p-2'>Username</th>}
              <th className='text-left p-2'> Narration</th>
              <th className='p-2'> Rate</th>
              <th className='p-2'> Amount</th>
              <th className='p-2'> Run</th>
              <th className='p-2'> Mode</th>
              <th style={{ background: "#76d68f" }} className='p-2'> Dec</th>
              <th className='p-2'> Date</th>
            </tr>
          </thead>

          <tbody className='scorall'>
           {/* ✅ Match Bets Section (unchanged) */}
            <tr>
              <td colSpan={8} style={{ backgroundColor: "darkgoldenrod", color: "black", padding: "8px 10px", textAlign: "left" }}>
                Match Bets
              </td>
            </tr>

            {matchBets.map((bet: IBet, index: number) => (
              <tr className={bet.isBack ? 'back' : 'lay'} key={bet._id}>
                <td className='no-wrap text-center p-2'> {index + 1} </td>
                {userState.user.role !== RoleType.user && <td className='no-wrap text-center p-2'>{bet.userName}</td>}
                <td className='no-wrap text-center p-2' >
                  {bet.selectionName} / {bet.marketName === 'Fancy' && bet.gtype !== 'fancy1' ? bet.volume.toFixed(2) : (bet.odds*100 - 100).toFixed()}
                </td>
                <td className='no-wrap text-center p-2'> {((bet.odds)*100-100).toFixed()} </td>
                <td className='no-wrap text-center p-2'> {bet.stack} </td>
                <td className='no-wrap text-center p-2'> {bet?.selectionName} </td>
                <td className='no-wrap text-center p-2'> {bet.isBack ? "Yes" : "No"} </td>
                <td className='no-wrap text-center p-2'> {bet?.result?.result ? bet?.result?.result : "YES"} </td>

                {/* <td className='no-wrap text-center p-2'>{moment.utc(bet.betClickTime).utcOffset('+05:30').format('DD/MM/YYYY hh:mm:ss A')} </td> */}
                <td className='no-wrap text-center p-2'>
                  {moment(bet.betClickTime).format("DD/MM/YYYY hh:mm:ss A")}
                </td>


              </tr>
            ))}

            {/* ✅ Grouped Fancy Bets */}
            {Object.keys(groupedFancyBets).map((runnerName: string, groupIndex: number) => (
              <React.Fragment key={runnerName}>
                <tr>
                  <td colSpan={8} style={{ backgroundColor: "rgb(17, 40, 62)", color: "white", padding: "8px 10px", textAlign: "left" }}>
                    {runnerName}
                  </td>
                </tr>
                {groupedFancyBets[runnerName].map((bet: IBet, index: number) => (
                  <tr className={bet.isBack ? 'back' : 'lay'} key={bet._id}>
                    <td className='no-wrap p-2'> {index + 1} </td>
                    {userState.user.role !== RoleType.user && <td>{bet.userName}</td>}
                    <td className='no-wrap p-2'>
                      {bet.selectionName} /{' '}
                      {bet.marketName === 'Fancy' && bet.gtype !== 'fancy1' ? bet.volume.toFixed(2) :(bet.odds*100 - 100).toFixed(2)}{' '}
                    </td>
                    <td className='no-wrap text-center p-2'> {bet.gtype === 'fancy1' ? bet.odds.toFixed(2) : bet?.volume.toFixed(2)} </td>
                    <td className='no-wrap p-2'> {bet.stack} </td>
                    <td className='no-wrap text-center p-2'> {bet.gtype === 'fancy1' ? bet?.selectionName : bet.odds.toFixed(2)} </td>
                    <td className='no-wrap text-center p-2'> {bet.isBack ? "Yes" : "No"} </td>
                    <td className='no-wrap text-center p-2'> {bet?.result?.result ? bet?.result?.result : "YES"} </td>

                    <td className='no-wrap text-center p-2'>
                      {moment(bet.betClickTime).format("DD/MM/YYYY hh:mm:ss A")}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

           
          </tbody>
        </table>
      </div>}</>
  )
}

export default MyBetComponent

