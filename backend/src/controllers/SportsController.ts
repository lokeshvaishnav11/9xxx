import { Request, Response } from 'express'
import { Fancy, IFancy } from '../models/Fancy'
import { IMarket, Market, OddsType } from '../models/Market'
import { IMatch, Match } from '../models/Match'
import { ISeries, Series } from '../models/Series'
import { Sport } from '../models/Sport'
import sportsService from '../services/sports.service'
import { sportsApi } from '../util/api'
import { ApiController } from './ApiController'
import axios from 'axios'
import { UserBetStake } from '../models/UserBetStake'
import { SportSetting } from '../models/SportSetting'
import { BetLock } from '../models/BetLock'

const setMatchData = async () => {
  const response = await axios.get("http://185.211.4.99:3000/")
}

class SportsController extends ApiController {
  constructor() {
    super()
    this.getSportList = this.getSportList.bind(this)
    this.saveSeries = this.saveSeries.bind(this)
    this.saveMatch = this.saveMatch.bind(this)

    this.getMatchList = this.getMatchList.bind(this)
    this.getMarketList = this.getMarketList.bind(this)
    this.getFancyList = this.getFancyList.bind(this)
    this.addFancyToDb = this.addFancyToDb.bind(this)
    this.saveMatchResyncCron = this.saveMatchResyncCron.bind(this)
  }

  async getSportList(req: Request, res: Response): Promise<Response> {
    try {
      // @ts-ignore
      const sports = await Sport.find({})
      return this.success(res, sports)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async saveSeries(req: Request, res: Response): Promise<Response> {
    try {
      const { sportId, seriesId, seriesName, region, marketCount } = req.body
      const series: ISeries = {
        sportId,
        seriesId,
        seriesName,
        region,
        marketCount,
      }
      const nesSeries = new Series(series)
      await nesSeries.save()
      return this.success(res, nesSeries)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async saveMatch(req: Request, res: Response): Promise<Response> {
    try {
      const matches = req.body.data
      const syncData = req.body.syncData

      const matchArray: any = matches.map((match: any) => match.matchId)
      let matchData: any = []
      if (matches && Object.keys(matches[0]).length === 1) {
        matchData = await Match.find({ matchId: { $in: matchArray } })
          .select({
            matchId: 1,
            sportId: 1,
            seriesId: 1,
            name: 1,
            _id: 0,
          })
          .lean()
      }
      if (matchData.length <= 0) matchData = matches

      const matchDataRedis = matchData.map((match: any) => ({
        ...match,
        matchId: match.matchId.toString(),
        sportId: match.sportId.toString(),
      }))

      // axios
      //   .post(`${process.env.OD_NODE_URL}save-match`, { matches: matchDataRedis })
      //   .catch((e: any) => {
      //     console.log(e.response)
      //   })
      axios
        .post(`${process.env.SUPER_NODE_URL}api/save-match`, { matches: matchDataRedis })
        .catch((e: any) => {
          console.log(e.response)
        })

      await matchData.map(async (match: any) => {
        await this.marketesData(match, syncData)
        const isFancy = await this.fancyData(match)
        const isBookMaker = await this.bookmakermarketesData(match)
        let isT10 = false
        let isT10Fancy = false
        if (match.name.includes('T10')) {
          isT10 = await this.t10MarketesData(match)
          isT10Fancy = await this.t10FancyData(match)
        }
        const sportSettings = await SportSetting.findOne({ sportId: match.sportId })
          .select({
            inPlayMinLimit: 1,
            inPlayMaxLimit: 1,
            inPlayFancyMinLimit: 1,
            inPlayFancyMaxLimit: 1,
            offPlayMinLimit: 1,
            offPlayMaxLimit: 1,
            offPlayFancyMinLimit: 1,
            offPlayFancyMaxLimit: 1,
            inPlayBookMinLimit: 1,
            inPlayBookMaxLimit: 1,
            offPlayBookMinLimit: 1,
            offPlayBookMaxLimit: 1,
          })
          .lean()
        // @ts-ignore
        if (sportSettings?._id) delete sportSettings?._id
        let saveMatchData = {
          ...match,
          isFancy: isT10Fancy || isFancy,
          isBookMaker,
          isT10: isT10 || isT10Fancy,
          resultstring: ""
        }

        if (!syncData) {
          saveMatchData = { ...saveMatchData, ...sportSettings }
        }
        await Match.findOneAndUpdate({ matchId: match.matchId }, saveMatchData, {
          new: true,
          upsert: true,
        })
      })

      return this.success(res, {})
    } catch (e: any) {
      return this.fail(res, e)
    }
  }


  async saveMatchResyncCron(req: Request, res: Response): Promise<Response> {
    try {
      const market = await Market.find({ isActive: true, sportId: 4, marketName: "Bookmaker" }).distinct("matchId")
      const matches = await Match.find({ active: true, sportId: 4, matchId: { $nin: market } }, {
        matchId: 1,
        sportId: 1,
        seriesId: 1,
        name: 1,
        _id: 0,
      })


      const matchArray: any = matches.map((match: any) => match.matchId)
      let matchData: any = []
      if (matches && Object.keys(matches[0]).length === 1) {
        matchData = await Match.find({ matchId: { $in: matchArray } })
          .select({
            matchId: 1,
            sportId: 1,
            seriesId: 1,
            name: 1,
            _id: 0,
          })
          .lean()
      }
      if (matchData.length <= 0) matchData = matches

      const matchDataRedis = matchData.map((match: any) => ({
        ...match,
        matchId: match.matchId.toString(),
        sportId: match.sportId.toString(),
      }))

      axios
        .post(`${process.env.SUPER_NODE_URL}api/save-match`, { matches: matchDataRedis })
        .catch((e: any) => {
          console.log(e.response)
        })
      let syncData = true
      await matchData.map(async (match: any) => {
        await this.marketesData(match, syncData)
        const isFancy = await this.fancyData(match)
        // const isBookMaker = await this.bookmakermarketesData(match)
        let isT10 = false
        let isT10Fancy = false
        if (match.name.includes('T10')) {
          isT10 = await this.t10MarketesData(match)
          isT10Fancy = await this.t10FancyData(match)
        }
        const sportSettings = await SportSetting.findOne({ sportId: match.sportId })
          .select({
            inPlayMinLimit: 1,
            inPlayMaxLimit: 1,
            inPlayFancyMinLimit: 1,
            inPlayFancyMaxLimit: 1,
            offPlayMinLimit: 1,
            offPlayMaxLimit: 1,
            offPlayFancyMinLimit: 1,
            offPlayFancyMaxLimit: 1,
            inPlayBookMinLimit: 1,
            inPlayBookMaxLimit: 1,
            offPlayBookMinLimit: 1,
            offPlayBookMaxLimit: 1,
          })
          .lean()
        // @ts-ignore
        if (sportSettings?._id) delete sportSettings?._id
        let saveMatchData = {
          ...match,
          isFancy: isT10Fancy || isFancy,
          // isBookMaker,
          isT10: isT10 || isT10Fancy,
        }

        if (!syncData) {
          saveMatchData = { ...saveMatchData, ...sportSettings }
        }
        await Match.findOneAndUpdate({ matchId: match.matchId }, saveMatchData, {
          new: true,
          upsert: true,
        })
      })

      return this.success(res, {})
    } catch (e: any) {
      return this.fail(res, e)
    }
  }


  async marketesData(match: IMatch, syncData: boolean) {
    const markets = await sportsService.getMarkets(match)

    if (markets?.data?.sports?.length > 0)
      await markets.data.sports.map(async (market: any) => {
        if (market.marketId) {
          const marketsData: IMarket = {
            seriesId: match.seriesId,
            sportId: match.sportId,
            matchId: match.matchId,
            marketId: market.marketId,
            marketName: market.marketName,
            marketStartTime: market.marketStartTime,
            runners: market.runners,
            isActive: false,
            oddsType: OddsType.B,
          }

          if (!syncData) marketsData.isActive = false
          if (
            !syncData &&
            market.marketName.toLowerCase().trim().replace(/\s+/g, '') === 'tiedmatch'
          ) {
            marketsData.isActive = false
            console.log(market.marketName, 'market')
          } else {
            console.log(market.marketName, 'marketnotmatch')
          }
          if (
            !syncData &&
            market.marketName.toLowerCase().trim().replace(/\s+/g, '') === 'completedmatch'
          ) {
            marketsData.isActive = false
          }
          if (
            !syncData &&
            market.marketName.toLowerCase().trim().replace(/\s+/g, '') === 'towinthetoss'
          ) {
            marketsData.isActive = false
          }
          if (
            !syncData &&
            market.marketName.toLowerCase().trim().replace(/\s+/g, '') === 'matchoddsincludingtie'
          ) {
            marketsData.isActive = false
          }

          await Market.findOneAndUpdate(
            { marketId: market.marketId, matchId: match.matchId },
            marketsData,
            {
              new: true,
              upsert: true,
            },
          )
        }
      })
  }

  async  bookmakermarketesData(match: IMatch) {
    const markets = await sportsService.getBookmakerMarkets(match)
    console.log(markets, "markets data from backend ibn ths codew sw")
    if (markets?.data?.sports?.length > 0) {
      let i = 0
      if(i < 1){
      await markets.data.sports.map(async (market: any) => {
        let marketName = market.marketName
        if (market.marketName === 'Bookmaker') {
          i++
          marketName = i > 1 ? `${market.marketName}${i}` : market.marketName
        }
        const marketsData: IMarket = {
          seriesId: match.seriesId,
          sportId: match.sportId,
          matchId: match.matchId,
          marketId: market.marketId,
          marketName: marketName,
          marketStartTime: market.marketStartTime,
          runners: market.runners.sort((a: any, b: any) => a.sortPriority - b.sortPriority),
          isActive: i == 1 ? true :false,
          oddsType: OddsType.BM,
        }
        if(i == 1){
        await Market.findOneAndUpdate(
          { marketId: market.marketId, matchId: match.matchId },
          marketsData,
          {
            new: true,
            upsert: true,
          },
        )
      }
      })
    }
    
      return markets.data.sports.length > 0
    }
    return false
  }

  async t10MarketesData(match: IMatch) {
    const markets = await sportsService.getT10Markets(match.matchId)
    if (markets.data.sports) {
      await markets.data.sports.map(async (market: any) => {
        const marketsData: IMarket = {
          seriesId: match.seriesId,
          sportId: match.sportId,
          matchId: match.matchId,
          marketId: market.marketId,
          marketName: market.marketName.trim(),
          marketStartTime: match.matchDateTime,
          runners: market.runners.sort((a: any, b: any) => a.sortPriority - b.sortPriority),
          isActive: true,
          oddsType: OddsType.T10,
        }
        await Market.findOneAndUpdate(
          { marketId: market.marketId, matchId: match.matchId },
          marketsData,
          {
            new: true,
            upsert: true,
          },
        )
      })
      return markets.data.sports.length > 0
    }
    return false
  }

  async fancyData(match: IMatch) {
    const fancy = await sportsService.getSession(match.matchId, match.sportId)
    const fancyone = fancy?.data?.sports?.filter((m: any) =>
      (m.gtype === "session" || m.gtype === "fancy1") &&
      (m.RunnerName && !m.RunnerName.includes(" run bhav ")) && (m.RunnerName && !m.RunnerName.includes(" Caught out ")) && (m.RunnerName && !m.RunnerName.includes(" ball No ")) && (m.RunnerName && !m.RunnerName.includes(" Run bhav ")) && (m.RunnerName && !m.RunnerName.includes(" run bhav")) && (m.RunnerName.includes(".3 over ")) &&(m.RunnerName && m.RunnerName.includes(" 2")) && (m.RunnerName && m.RunnerName.includes(' ball run '))
    )

    if (fancy.data.sports) {
      await fancyone.map(async (market: any) => {
        let type = ''
        if (market.RunnerName.includes(' ball run ')) {
          type = 'ballRun'
        }
        if (
          /^Only/.test(market.RunnerName) ||
          market.RunnerName.includes(' ball No ') ||
          market.RunnerName.includes(' over run ')
        ) {
          type = 'overBallNo'
        }
        const fancyData: IFancy = {
          sportId: match.sportId,
          matchId: match.matchId,
          marketId: market.SelectionId,
          fancyName: market.RunnerName,
          gtype: market.gtype,
          sr_no: market.sr_no ? market.sr_no : market.srno ? parseInt(market.srno) : 1,
          ballByBall: type,
        }
        await Fancy.findOneAndUpdate(
          {
            // sportId: match.sportId,
            matchId: match.matchId,
            marketId: market.SelectionId,
          },
          { ...fancyData, active: type != "ballRun" ? false : false },
          {
            new: true,
            upsert: true,
          },
        )
      })
      return fancy.data.sports.length > 0
    }
    return false
  }

  async t10FancyData(match: IMatch) {
    const fancy = await sportsService.getSessionT10(match.matchId)

    if (fancy.data.sports) {
      await fancy.data.sports.map(async (market: any) => {
        let type = ''
        if (market.RunnerName.includes(' ball run ')) {
          type = 'ballRun'
        }
        if (
          /^Only/.test(market.RunnerName) ||
          market.RunnerName.includes(' ball No ') ||
          market.RunnerName.includes(' over run ')
        ) {
          type = 'overBallNo'
        }
        const fancyData: IFancy = {
          sportId: match.sportId,
          matchId: match.matchId,
          marketId: market.SelectionId,
          fancyName: market.RunnerName,
          gtype: 'session',
          sr_no: market.sr_no ? market.sr_no : market.srno ? parseInt(market.srno) : 1,
          ballByBall: type,
        }
        await Fancy.findOneAndUpdate(
          {
            // sportId: match.sportId,
            matchId: match.matchId,
            marketId: market.SelectionId,
          },
          { ...fancyData, active: false },
          {
            new: true,
            upsert: true,
          },
        )
      })
      return fancy.data.sports.length > 0
    }
    return false
  }

  // Get Match List








  async getMatchList(req: Request, res: Response): Promise<Response> {
    try {
      const { sportId, status, limit }: any = req.query


      let matchQuery: any = { $match: { active: true } }
      console.log(matchQuery, "match Query")
      if (sportId && sportId !== 'all' && status !== 'in-play') {
        matchQuery = { $match: { sportId: parseInt(sportId), active: true } }
      }
      if (sportId && status === 'all' && status !== 'in-play') {
        matchQuery = { $match: { sportId: parseInt(sportId), active: true } }
      } else if (sportId && status === 'in-play') {
        matchQuery = {
          $match: { sportId: parseInt(sportId), matchDateTime: { $lte: new Date() }, active: true },
        }
      }

      let query: any = [
        matchQuery,
        {
          $lookup: {
            from: 'markets', // collection name in db
            localField: 'matchId',
            foreignField: 'matchId',
            pipeline: [{ $match: { marketName: { $in: ['Match Odds', 'Winner'] } } }],
            as: 'markets',
          },
        },
        { $sort: { matchDateTime: 1 } },
      ]

      if (limit) {
        query.push({ $limit: parseInt(limit) })
      }
      const match = await Match.aggregate(query)

      // console.log(match,"match from this database site")
      return this.success(res, match)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  getMatchById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { matchId } = req.query
      const user: any = req.user
      // @ts-ignore
      //.cache(0, 'Matchd-' + matchId)
      const match = await Match.findOne({ matchId })
      const stake = await UserBetStake.findOne({ userId: user?._id })
        .select(['-createdAt', '-updatedAt', '-userId', '-_id'])
        // @ts-ignore
        .cache(0, 'user-stack-' + user?._id)
      return this.success(res, { match, stake })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  // Get Market List
  async getMarketList(req: Request, res: Response): Promise<Response> {
    try {
      const { matchId } = req.query
      const user: any = req.user
      // @ts-ignore
      const stake = await UserBetStake.findOne({ userId: user._id }).cache(
        0,
        'user-stack-' + user?._id,
      )
      // const marketMatchOddsFirst = await Market.findOne({
      //   matchId,
      //   marketName: { $eq: 'Match Odds' },
      //   isActive: true,
      //   $or: [{ isDelete: null }, { isDelete: false }],
      // })
      // // @ts-ignore
      // //.cache(0, 'Markets-Match-Odds-' + matchId)

      // const market = await Market.find({
      //   matchId,
      //   marketName: { $ne: 'Match Odds' },
      //   isActive: true,
      //   $or: [{ isDelete: null }, { isDelete: false }],
      // })
      // @ts-ignore
      //.cache(0, 'Markets-ne-Match-Odds-' + matchId)

      const markets = await Market.aggregate([
        {
          $match: {
            matchId: +matchId!,
            isActive: true,
            $or: [{ isDelete: null }, { isDelete: false }],
          },
        },
        {
          $addFields: {
            sortKey: {
              $switch: {
                branches: [
                  {
                    case: {
                      $regexMatch: {
                        input: '$marketName',
                        regex: new RegExp('^Match Odds'),
                      },
                    },
                    then: 0,
                  },
                  {
                    case: {
                      $regexMatch: {
                        input: '$marketName',
                        regex: new RegExp('^Bookmaker'),
                      },
                    },
                    then: 1,
                  },
                  {
                    case: {
                      $regexMatch: {
                        input: '$marketName',
                        regex: new RegExp('^Tied Match'),
                      },
                    },
                    then: 2,
                  },
                ],
                default: 3,
              },
            },
          },
        },
        {
          $sort: {
            sortKey: 1,
          },
        },
      ])

      return this.success(res, {
        markets,
        stake,
      })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  // Get Fancy List
  async getFancyList(req: Request, res: Response): Promise<Response> {
    try {
      const { matchId, gtype }: any = req.query
      const strings = ['wkt', 'Wkts', 'Fours', 'Sixes']

      const filters = {
        $nor: strings.map((string) => ({ fancyName: { $regex: string } })),
        gtype,
      }
      let filter: any = { gtype }

      if (gtype == 'session') {
        filter = filters
      } else if (gtype == 'fancy1') {
        filter = { gtype }
      } else if (gtype === 'wkt') {
        filter = {
          $or: [{ fancyName: { $regex: gtype } }, { fancyName: { $regex: strings[1] } }],
          gtype: { $ne: 'fancy1' },
        }
      } else if (!gtype?.includes(strings)) {
        filter = { fancyName: { $regex: gtype }, gtype: { $ne: 'fancy1' } }
      }

      const fancy = await Fancy.find({
        matchId,
        active: true,
        // ...filter,
      })
        .sort({ sr_no: 1, marketId: 1 })

      const priorityOrder = [
        ' over runs ',
        ' over run ',
        ' fall of wicket ',
        '  run',
        ' boundaries',
        ' pship boundaries ',
      ];
      // const  fancy = await Fancy.find()

      // console.log(fancy,"hello worldz")
      const sortedFancy = fancy.sort((a :any, b:any) => {
        const indexA = priorityOrder.findIndex((name) => a?.fancyName?.includes(name));
        const indexB = priorityOrder.findIndex((name) => b?.fancyName?.includes(name));

        const rankA = indexA === -1 ? 999 : indexA;
        const rankB = indexB === -1 ? 999 : indexB;

        return rankA - rankB;
      });

      return this.success(res, sortedFancy)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  // async addFancyToDb(req: Request, res: Response): Promise<Response> {
  //   try {
  //     console.log(req.params)
  //     const id = req.params.id
  //     // const { fancy } = req.body
  //     const fancyDataOne:any =  await axios.get(`http://185.211.4.99:3000/allMatchData/4/${id}`)
  //     const fancy:any = fancyDataOne.data.data;
  //     console.log(fancy,"fancys");

  //     fancy.map(Promise.all()=>{
  //     let type = ''
  //     if (fancy.RunnerName.includes(' ball run ')) {
  //       type = 'ballRun'
  //     }
  //     if (
  //       /^Only/.test(fancy.RunnerName) ||
  //       fancy.RunnerName.includes(' ball No ') ||
  //       fancy.RunnerName.includes(' over run ')
  //     ) {
  //       type = 'overBallNo'
  //     }
  //     const fancyData: IFancy = {
  //       sportId: 4,
  //       matchId: fancy.matchId,
  //       marketId: fancy.SelectionId,
  //       active: true,
  //       fancyName: fancy.RunnerName,
  //       gtype: fancy.gtype ? fancy.gtype : 'session',
  //       sr_no: fancy.sr_no,
  //       ballByBall: type,
  //     }
  //     const fancyNew = await Fancy.findOneAndUpdate(
  //       { marketId: fancy.SelectionId, matchId: fancy.matchId },
  //       fancyData,
  //       {
  //         new: true,
  //         upsert: true,
  //       },
  //     )

  //   })
  //     return this.success(res, fancyNew, 'fancy added')
  //   } catch (e: any) {
  //     return this.fail(res, e)
  //   }
  // }

  // async addFancyToDb(req: Request, res: Response): Promise<Response> {
  //   try {
  //     console.log(req.params)
  //     const id = req.params.id
  //     // const { fancy } = req.body
  //     const fancyDataOne: any = await axios.get(`http://185.211.4.99:3000/allMatchData/4/${id}`)
  //     const fancy: any = fancyDataOne.data.data;
  //     console.log(fancy, "fancys");

  //     // Wrap the map logic inside Promise.all to handle async operations correctly
  //     const updatePromises = fancy.map(async (item: any) => {

  //       item.map(async(p:any)=>{
  //         let type = ''
  //       if (item.section.nat.includes(' ball run ')) {
  //         type = 'ballRun'
  //       }
  //       if (
  //         /^Only/.test(item.section.nat) ||
  //         item.section.nat.includes(' ball No ') ||
  //         item.section.nat.includes(' over run ')
  //       ) {
  //         type = 'overBallNo'
  //       }
  //       const fancyData: IFancy = {
  //         sportId: 4,
  //         matchId: item.gmid,
  //         marketId: item.mid,
  //         active: true,
  //         fancyName: item.section.nat,
  //         gtype: item.gtype ? item.gtype : 'session',
  //         sr_no: item.sno,
  //         // ballByBall: type,
  //       }
  //       // Ensure that the update or insert happens and store the result
  //       return await Fancy.findOneAndUpdate(
  //         { marketId: item.SelectionId, matchId: item.matchId },
  //         fancyData,
  //         {
  //           new: true,
  //           upsert: true,
  //         },
  //       )
  //     })
  //       })


  //     // Wait for all promises to resolve
  //     const fancyNew = await Promise.all(updatePromises);

  //     // Since we have multiple updated objects, decide what to return (e.g., last one or all)
  //     return this.success(res, fancyNew, 'Fancy added');
  //   } catch (e: any) {
  //     return this.fail(res, e);
  //   }
  // }

  // async addFancyToDb(req: Request, res: Response): Promise<Response> {
  //   try {
  //     console.log(req.params);
  //     const id = req.params.id;

  //     const fancyDataOne: any = await axios.get(`http://185.211.4.99:3000/allMatchData/4/${id}`);
  //     const fancy: any = fancyDataOne.data.data;
  //     // sconsole.log(fancy, "fancy");

  //     // Wrap the map logic inside Promise.all to handle async operations correctly
  //     const updatePromises = fancy.map(async (item: any) => {
  //       // Assuming each item can have multiple sections
  //       const innerPromises = item.section.map(async (p: any) => {
  //         let type = '';

  //         if (p.nat.includes(' ball run ')) {
  //           type = 'ballRun';
  //         }
  //         if (
  //           /^Only/.test(p.nat) ||
  //           p.nat.includes(' ball No ') ||
  //           p.nat.includes(' over run ')
  //         ) {
  //           type = 'overBallNo';
  //         }

  //         console.log(p,"p  is here hello world for this side ")

  //         const fancyData: IFancy = {
  //           sportId: 4,
  //           matchId: item.gmid,
  //           marketId: p?.sid?.toString(),
  //           active: true,
  //           fancyName: p.nat,
  //           gtype: item.gtype ? item.gtype : 'session',
  //           sr_no: item.sno,
  //           ballByBall: type, 
  //         };


  //         console.log(fancyData,"fancyData hello this is  fancy Data")

  //         // Ensure that the update or insert happens and store the result
  //         return await Fancy.findOneAndUpdate(
  //           { marketId: item.mid, matchId: item.gmid },  // Fixed the query to match the correct field
  //           fancyData,
  //           {
  //             new: true,
  //             upsert: true,
  //           },
  //         );
  //       });

  //       // Wait for all inner promises to resolve for each item
  //       return await Promise.all(innerPromises);
  //     });

  //     // Wait for all outer promises to resolve
  //     const fancyNew = await Promise.all(updatePromises);

  //     // Since we have multiple updated objects, decide what to return (e.g., last one or all)
  //     return this.success(res, fancyNew, 'Fancy added');
  //   } catch (e: any) {
  //     return this.fail(res, e);
  //   }
  // }

  async addFancyToDb(req: Request, res: Response): Promise<Response> {
    try {
      const { fancy } = req.body
      if (fancy.gtype == "khado" || fancy.gtype == "oddeven" || fancy.gtype == "meter" || fancy.RunnerName.includes(' run bhav ') || fancy.RunnerName.includes(" Caught out ") || fancy.RunnerName.includes(' ball No ') || fancy.RunnerName.includes(' Run bhav ') || fancy.RunnerName.includes(' run bhav') || fancy.RunnerName.includes('.3 over ') || fancy.RunnerName.includes(' 2') || fancy.RunnerName.includes(' ball run ') ) {
        return this.fail(res, 'not fancy added')
      }
      let type = ''
      if (fancy.RunnerName.includes(' ball run ')) {
        type = 'ballRun'
      }
      if (
        /^Only/.test(fancy.RunnerName) ||
        fancy.RunnerName.includes(' ball No ') ||
        fancy.RunnerName.includes(' over run ')
      ) {
        type = 'overBallNo'
      }
      const fancyData: IFancy = {
        sportId: 4,
        matchId: fancy.matchId,
        marketId: fancy.SelectionId,
        active: type != "ballRun" ? true : true,
        fancyName: fancy.RunnerName,
        gtype: fancy.gtype ? fancy.gtype : 'session',
        sr_no: fancy.sr_no,
        ballByBall: type,
      }
      const fancyNew = await Fancy.findOneAndUpdate(
        { marketId: fancy.SelectionId, matchId: fancy.matchId },
        fancyData,
        {
          new: true,
          upsert: true,
        },
      )
      return this.success(res, fancyNew, 'fancy added')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }



  deactivateMarkets = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { market } = req.body
      console.log("ghjklhjk", req.body)
      let matchDelete = false
      let matchId = null
      if (market && market.marketId) {
        const marketData: any = await Market.findOne({ marketId: market.marketId })

        matchId = marketData?.matchId
        if (matchId) {
          if (market?.runners) {
            const winnerSid = market.runners.reduce((sid: number, runner: any) => {
              if (runner.status == 'WINNER') {
                sid = runner.selectionId
              }
              return sid
            }, -1)
            const winnerName = marketData.runners.reduce((win: any, name: any) => {
              if (name.selectionId == winnerSid) win = name.runnerName
              return win
            }, '')
            console.log(winnerSid, "winnerSidwinnerSidwinnerSidwinnerSid")
            if (winnerSid) {
              axios
                .get(
                  `http://localhost:${process.env.PORT}/api/result-market-auto?selectionId=${winnerSid}&matchId=${marketData.matchId}&marketId=${market.marketId}`,
                )
                .catch((err) => console.log(err.stack))
              // await Market.updateOne(
              //   { matchId, marketId: marketData.marketId },
              //   { result: winnerSid, resultDelcare: 'processing' },
              // )

              if (marketData.marketName == 'Match Odds') {
                // await Match.updateOne({ matchId }, { active: false ,resultstring:winnerName})
                await Match.updateOne(
                  { matchId },
                  {
                    $set: {
                      active: false,
                      resultstring: winnerName,
                    },
                  }
                );

                //Bookmaker result
                const BookMarketData: any = await Market.find({
                  matchId,
                  // marketName: { $in: ['Bookmaker', 'Tied Match'] },
                  oddsType: OddsType.BM,
                })

                if (BookMarketData?.length > 0) {
                  BookMarketData.map(async (bmMarket: IMarket) => {
                    let bmSid = null
                    if (bmMarket.marketName === 'Tied Match') {
                      bmSid = bmMarket.runners.reduce((win: any, name: any) => {
                        if (name.runnerName.includes('NO')) win = name.selectionId
                        return win
                      }, null)
                    } else {
                      bmSid = bmMarket.runners.reduce((win: any, name: any) => {
                        if (name.runnerName.includes(winnerName)) win = name.selectionId

                        return win
                      }, null)
                    }

                    axios
                      .get(
                        `http://localhost:${process.env.PORT}/api/result-market-auto?selectionId=${bmSid}&matchId=${marketData.matchId}&marketId=${bmMarket.marketId}`,
                      )
                      .catch((err) => console.log(err.stack))

                    // await Market.updateOne(
                    //   { matchId, marketId: bmMarket.marketId },
                    //   { result: bmSid, resultDelcare: 'processing' },
                    // )
                  })
                }
              }
            }
          }

          const ress = await Market.updateMany(
            { marketId: { $regex: `.*${market.marketId}.*` } },
            { $set: { isActive: false } },
          )

          const activeMarkets: any = await Market.countDocuments({
            matchId: matchId,
            isActive: true,
          })
          if (activeMarkets === 0) {
            matchDelete = true

            await Match.updateMany({ matchId }, { $set: { active: false, inPlay: false } })
            await Fancy.updateMany({ matchId }, { $set: { active: false } })
            await BetLock.deleteMany({ matchId })
          }

          return this.success(res, { matchDelete, matchId }, 'markets deactivated')
        }
        return this.fail(res, 'market not deactivated')
      } else if (market && market.matchId) {
        await Match.updateMany(
          { matchId: market.matchId },
          { $set: { active: false, inPlay: false } },
        )
        await Fancy.updateMany({ matchId: market.matchId }, { $set: { active: false } })
        await BetLock.deleteMany({ matchId: market.matchId })
        return this.success(res, { matchDelete, matchId: market.matchId }, 'markets deactivated')
      } else {
        return this.fail(res, 'market is required')
      }
    } catch (e: any) {
      return this.fail(res, e.stack)
    }
  }

  activateMarkets = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { marketIds } = req.body
      if (marketIds) {
        const marketId = Array.isArray(marketIds) ? marketIds : [marketIds]
        await Market.updateMany({ marketId: { $in: marketId } }, { isActive: true })

        return this.success(res, {}, 'markets activated')
      } else {
        return this.fail(res, 'MarketIds is required')
      }
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  deactivateFancy = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { fancies } = req.body
      if (fancies) {
        Object.keys(fancies).map(async (matchId) => {
          await Fancy.updateMany(
            { matchId, marketId: { $in: fancies[matchId] } },
            { active: false },
          )
        })
      }
      return this.success(res, {}, 'fancy deactivated')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
  getSeriesWithMarketNew = async (req: Request, res: Response): Promise<any> => {
    try {
      const { EventTypeID } = req.query
      if (!EventTypeID) return this.fail(res, 'EventTypeID is required field')
      const responseData = await sportsApi.get(`/get-series-redis/${EventTypeID}`)
      const alreadyAdded = await Match.find({ active: true }, { matchId: 1 })
      const matchIds = alreadyAdded.map((match: any) => match.matchId)
      return this.success(res, { data: responseData?.data?.data, matchAdded: matchIds }, '')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }


  getSeriesWithMarket = async (req: Request, res: Response): Promise<any> => {
    try {
      const { EventTypeID } = req.query
      if (!EventTypeID) return this.fail(res, 'EventTypeID is required field')
      const alreadyAdded = await Match.find({ active: true }, { matchId: 1 })
      const matchIds = alreadyAdded.map((match: any) => match.matchId)
      const response = await sportsApi
        .get(`/get-series-redis/${EventTypeID}`)
        .then(async (series: any) => {
          console.log(series,"series is here hahhahahahahahaha")
          const getMatches = series.data.data.map(async (s: any) => {
            return s.match.map((fm: any) => {
              fm.series = s.competition
              fm.matchId = fm.event.id
              fm.matchDateTime = fm.event.openDate
              fm.name = fm.event.name
              fm.seriesId = s.competition?.id
              fm.sportId = EventTypeID
              fm.active = matchIds.indexOf(parseInt(fm.event.id)) > -1 ? true : false
              return fm
            })
          })
          return Promise.all([...getMatches])
        })
        .then((m) => {
          return m
            .filter((element: any) => {
              return !Array.isArray(element) || element.length !== 0
            })
            .flat()
        })
        .catch((e) => console.log('error', e))

      return this.success(res, response, '')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }


  // getSeriesWithMarket = async (req: Request, res: Response): Promise<any> => {
  //   try {
  //     const { EventTypeID } = req.query
  //     if (!EventTypeID) return this.fail(res, 'EventTypeID is required field')
  //     const alreadyAdded = await Match.find({ active: true }, { matchId: 1 })
  //     console.log(alreadyAdded, "Hello  World")
  //     const matchIds = alreadyAdded.map((match: any) => match.matchId)
  //     // const response = await sportsApi
  //     //   .get(`/get-series-redis/${EventTypeID}`)
  //     // const response  = await axios.get(`http://69.62.123.205:7000/api/v/events?id=${EventTypeID}`)
  //     // .then(async (series: any) => {
  //     //   console.log(series,"series from api")
  //     //   const getMatches = series?.data?.competition?.map(async (s: any) => {
  //     //     // return s.match.map((fm: any) => {
  //     //     //   fm.series = s.competition
  //     //     //   fm.matchId = fm.event.id
  //     //     //   fm.matchDateTime = fm.event.openDate
  //     //     //   fm.name = fm.event.name
  //     //     //   fm.seriesId = s.competition?.id
  //     //     //   fm.sportId = EventTypeID
  //     //     //   fm.active = matchIds.indexOf(parseInt(fm.event.id)) > -1 ? true : false
  //     //     //   return fm
  //     //     // })

  //     //     const xyz =   s?.markets?.map(async (t:any)=>{

  //     //       event:{
  //     //         "id":t.gmid,
  //     //         "name":t.ename,
  //     //         "timezone":"GMT",
  //     //         "openDate":t.stime,

  //     //       },
  //     //      series:{
  //     //       "id":t.cid.toString(),
  //     //       "name":t.cname,

  //     //      },
  //     //      "matchId":t.gmid,
  //     //      "matchDateTime":t.time,
  //     //      "name"t.ename,
  //     //      "seriesId":t.cid.toString(),
  //     //      "sportId":EventTypeID,
  //     //      "active ":matchIds.indexOf(parseInt(s.gmid)) > -1 ? true : false

  //     //       })

  //     //     // return{  event:{
  //     //     //     "id":s.gmid,
  //     //     //     "name":s.ename,
  //     //     //     "timezone":"GMT",
  //     //     //     "openDate":s.stime,

  //     //     //   },
  //     //     //  series:{
  //     //     //   "id":s.cid.toString(),
  //     //     //   "name":s.cname,

  //     //     //  },
  //     //     //  "matchId":s.gmid,
  //     //     //  "matchDateTime":s.time,
  //     //     //  "name":s.ename,
  //     //     //  "seriesId":s.cid.toString(),
  //     //     //  "sportId":EventTypeID,
  //     //     //  "active ":matchIds.indexOf(parseInt(s.gmid)) > -1 ? true : false
  //     //     // }
  //     // })
  //     //   return Promise.all([...getMatches])
  //     // })
  //     // .then((m) => {
  //     //   return m
  //     //     .filter((element: any) => {
  //     //       return !Array.isArray(element) || element.length !== 0
  //     //     })
  //     //     .flat()
  //     // })
  //     // .catch((e) => console.log('error', e))
  //     const response = await axios.get(`http://195.110.59.236:3000/allMatchUsingSports/${EventTypeID}`)
  //       .then(async (series: any) => {
  //         console.log(series, "series from api");

  //         const getMatches = series?.data?.data?.t1?.flatMap((s: any) => {
  //           return{
  //             event: {
  //               id: s.gmid,
  //               name: s.ename,
  //               timezone: "GMT",
  //               openDate: s.stime,
  //             },
  //             series: {
  //               id: s.cid.toString(),
  //               name: s.cname,
  //             },
  //             matchId: s.gmid,
  //             matchDateTime: s.stime,
  //             name: s.ename,
  //             seriesId: s.cid.toString(),
  //             sportId: EventTypeID,
  //             active: matchIds.includes(parseInt(s.gmid)),
  //           }
  //         }) || [];

  //         return Promise.all([...getMatches]);
  //       })
  //       .then((matches) => {
  //         return matches.filter(Boolean); // remove undefined/null if any
  //       })
  //       .catch((e) => {
  //         console.log('error', e);
  //         return [];
  //       });
  //     console.log(response, "response is here")

  //     return this.success(res, response, '')
  //   } catch (e: any) {
  //     return this.fail(res, e)
  //   }
  // }

  getSeriesWithMarketWithDate = async (req: Request, res: Response): Promise<any> => {
    try {
      const { EventTypeID } = req.query
      if (!EventTypeID) return this.fail(res, 'EventTypeID is required field')
      const response = await sportsApi
        .get(`/get-series?EventTypeID=${EventTypeID}`)
        .then(async (series: any) => {
          const getMatches = series.data.sports.map(async (s: any) => {
            const matches = await sportsApi
              .get(`/get-matches?EventTypeID=${EventTypeID}&CompetitionID=${s.competition.id}`)
              .then((m) => {
                return m.data.sports.map((fm: any) => {
                  return fm
                })
              })
            s.matches = matches
            return s
          })

          return Promise.all(getMatches)
        })
        .then((m) => {
          return m
            .filter((element) => {
              return !Array.isArray(element.matches) || element.matches.length !== 0
            })
            .flat()
        })

      return this.success(res, response, '')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  inplayMarket = async (req: Request, res: Response): Promise<any> => {
    try {
      const { marketIds } = req.body
      if (marketIds) {
        const matchIds = await Market.find({
          marketId: { $in: marketIds },
        })
          .select({
            matchId: 1,
          })
          .distinct('matchId')

        await Match.updateMany({ matchId: { $in: matchIds } }, { inPlay: true })
        return this.success(res, matchIds, 'inplay true')
      }
      return this.success(res, {}, 'fancy deactivated')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  getMatchSuggestion = async (req: Request, res: Response): Promise<any> => {
    try {
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
}
export default SportsController
