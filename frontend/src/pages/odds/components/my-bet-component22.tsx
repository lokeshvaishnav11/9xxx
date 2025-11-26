import moment from 'moment'
import React from 'react'
import { useWebsocketUser } from '../../../context/webSocketUser'
import IBet from '../../../models/IBet'
import { RoleType } from '../../../models/User'
import { selectPlaceBet, setBetCount, setbetlist, setBookMarketList } from '../../../redux/actions/bet/betSlice'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { selectCurrentMatch } from '../../../redux/actions/sports/sportSlice'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { betDateFormat } from '../../../utils/helper'
import { isMobile } from 'react-device-detect'
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice'
import { useLocation } from 'react-router-dom'
import accountService from '../../../services/account.service'

const MyBetComponent22 = () => {
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
    // console.log(getCurrentMatch,"hello world here is Match id")
    console.log(getCasinoCurrentMatch?.match_id," getCasinoCurrentMatch hello world here is Match id")

    if (getCurrentMatch && getCurrentMatch.matchId && location.pathname.includes('/odds') || getCasinoCurrentMatch && getCasinoCurrentMatch.match_id) {
      const dataMatchId: any = getCurrentMatch && getCurrentMatch.matchId && location.pathname.includes('/odds') ? getCurrentMatch.matchId : (getCasinoCurrentMatch && getCasinoCurrentMatch?.event_data?.match_id ? getCasinoCurrentMatch?.event_data?.match_id : 0)
      console.log("hello world match")
      accountService
        .getBets22(dataMatchId)
        .then((bets) => {
          console.log(bets.data,"chech bet dataggfgf")
          bets && bets.data && bets.data.data && setMyAllBet(bets.data.data.bets)
          // dispatch(setbetlist(bets.data.data.bets))
          // dispatch(setBookMarketList(bets.data.data.odds_profit))
          // dispatch(setBetCount(bets.data.data.bets.length))
        })
        .catch((e) => {
          console.log(e.stack)
        })
    }
  }, [getCurrentMatch, getCasinoCurrentMatch, betRefresh])

  // ✅ Group bets by selectionName
const groupedMyAllBet = getMyAllBet?.reduce((acc: any, bet: any) => {
  const key = bet.selectionName || "Unknown"
  if (!acc[key]) acc[key] = []
  acc[key].push(bet)
  return acc
}, {}) || {}


  React.useEffect(() => {
    if (getPlaceBet.bet.marketId) {
      //setMyAllBet([{ ...getPlaceBet.bet }, ...getMyAllBet])
      setRefreshStatus(betRefresh ? false : true)
    }
  }, [getPlaceBet.bet])

  React.useEffect(() => {
    socketUser.on('placedBet', (bet: IBet) => {
      ///setMyAllBet([bet, ...getMyAllBet])
      setRefreshStatus(betRefresh ? false : true)
    })
    return () => {
      socketUser.off('placedBet')
    }
  }, [getMyAllBet])

  React.useEffect(() => {
    socketUser.on('betDelete', ({ betId }) => {
      ///setMyAllBet(getMyAllBet.filter((bet: IBet) => bet._id !== betId))
      setRefreshStatus(betRefresh ? false : true)
      ///dispatch(setBookMarketList({}))
    })
    return () => {
      socketUser.off('betDelete')
    }
  }, [getMyAllBet])

  return (
   <>{getMyAllBet?.length > 0 &&  <div className='table-responsive-new' style={{height:"200px", overflowY:"scroll"}}>
     <h6 className="p-2 w-100 m-0 bg-info text-white text-center">Declared Bets</h6>
      <table className='table coupon-table scorall mybet'>
        <thead>
          <tr style={{background:"#76d68f"}}>
            <th> Sr. </th>
            {userState.user.role !== RoleType.user && <th>Username</th>}
            <th className='text-center'> Narration</th>
            <th> Rate</th>
            <th> Amount</th>
            <th> Run</th>
            <th> Mode</th>


            {/* {!isMobile && <th style={{background:"#76d68f"}}> Place Date</th>} */}
            {/* {!isMobile && <th style={{background:"#76d68f"}}> Match Date</th>} */}
            <th className='text-center'> Dec</th>
            <th>Date</th>
          </tr>
        </thead>
      <tbody className='scorall'>
      {Object.keys(groupedMyAllBet).map((runnerName: string, groupIndex: number) => (
    <React.Fragment key={runnerName}>
      {/* Group Header Row */}
      <tr>
        <td colSpan={8} style={{ backgroundColor:"rgb(17, 40, 62)", color: "white", padding: "8px 10px", textAlign: "left" }}>
          {runnerName}
        </td>
      </tr>

      {/* Grouped Bets */}
      {groupedMyAllBet[runnerName]?.map((bet: any, index: number) => (
        <tr
          key={bet._id}
          className={Number(bet.profitLoss?.$numberDecimal) < 0 ? 'bg-danger text-white' : 'bg-success'}
        >
          <td className='no-wrap'>{index + 1}</td>
          {userState.user.role !== RoleType.user && <td>{bet?.userName}</td>}

          <td className='no-wrap'>
            {bet?.selectionName} /{' '}
            {bet?.marketName === 'Fancy' && bet.gtype !== 'fancy1'
              ? bet.volume.toFixed(2)
              : (bet.odds*100 - 100).toFixed(2)}
          </td>

          <td className='no-wrap text-center'>
            {bet.marketName === 'Fancy' && bet.gtype !== 'fancy1'
              ? bet.volume.toFixed(2)
              : (bet.odds*100 - 100).toFixed(2)}
          </td>

          <td className='no-wrap'>
            {Math.abs(Number(bet?.profitLoss?.$numberDecimal)).toFixed(2)}
          </td>

          <td className='no-wrap text-center'>
            {bet.marketName === 'Fancy' && bet.gtype !== 'fancy1' ? bet.odds : "-"}
          </td>

          <td className='no-wrap text-center'>{bet.isBack ? "Yes" : "No"}</td>

          <td className='no-wrap text-center'>
            {bet?.result?.result ? bet?.result?.result : "YES"}
          </td>

          <td className='no-wrap'>
            {moment
              .utc(bet.betClickTime)
              .format('DD/MM/YYYY hh:mm:ss A')}
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

export default MyBetComponent22
