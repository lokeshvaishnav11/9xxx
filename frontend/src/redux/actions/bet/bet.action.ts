import { createAsyncThunk } from '@reduxjs/toolkit'
import IBet from '../../../models/IBet'
import betService from '../../../services/bet.service'
import { setExposer } from '../balance/balanceSlice'
import { setbetlist, setBookMarketList } from './betSlice'
import { toast } from 'react-toastify'

// Utility function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const getPlaceBetAction = createAsyncThunk(
  'bet/placebet',
  async (data: IBet, { rejectWithValue, dispatch }) => {
    try {
      // Frontend delay of 2 seconds
      await delay(1000)

      const res = await betService.getPlaceBet(data)

      dispatch(setExposer(res.data.data.exposer))
      dispatch(setBookMarketList(res.data.data.profitlist))
      dispatch(setbetlist(res.data.data.bet))
      toast.success('Bet Placed Successfully')

      return res.data.data.bet
    } catch (e: any) {
      return rejectWithValue(e.response.data.message)
    }
  },
)

