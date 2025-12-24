import { Request, Response } from "express";
import { Balance, IBalance } from "../models/Balance";
import { Bet, BetOn, IBet } from "../models/Bet";
import { Match } from "../models/Match";
import { IUser, User } from "../models/User";
import { ApiController } from "./ApiController";
import { Market } from "../models/Market";
import { sportsApi } from "../util/api";
import { Types } from "mongoose";
import { RoleType } from "../models/Role";
import UserSocket from "../sockets/user-socket";
import { Casino } from "../models/CasinoMatches";
import { BetLock } from "../models/BetLock";
import axios from "axios";
import { Fancy } from "../models/Fancy";
import { any } from "bluebird";
import { ledger } from "../models/allledager";
const ObjectId = Types.ObjectId;
const default_settings: any = { minBet: 100, maxBet: 100, delay: 0 };
const defaultRatio: any = {
  ownRatio: 100,
  allRatio: [
    {
      parent: ObjectId("63382d9bfbb3a573110c1ba5"),
      ratio: 100,
    },
  ],
};
export class BetController extends ApiController {
  checkMarketOddsConditions = async ({
    market_id,
    market_name,
    selectionId,
    isBack,
    odds,
    selectionName,
  }: any) => {
    let current_odds = await this.getcurrentodds(market_id, market_name);

    if (
      !current_odds ||
      (current_odds && !current_odds.sports) ||
      (current_odds && current_odds.sports && !current_odds.sports[0])
    ) {
      return "Bet is not acceptable.";
    } else {
      let currentsports: any = current_odds.sports[0];
      let current_runners = currentsports.runners;
      let filter_runners = current_runners.filter(
        (Item: any) => Item.selectionId == selectionId
      );
      if (filter_runners && filter_runners[0]) {
        let market_status: string = filter_runners[0].status;
        if (market_status == "ACTIVE" || market_status == "OPEN") {
          let oddsdata = isBack
            ? filter_runners[0].ex.availableToBack
            : filter_runners[0].ex.availableToLay;
          if (oddsdata.length > 0) {
            let max = 0;
            oddsdata.map(
              (Itemn: any) => (max = Itemn.price > max ? Itemn.price : max)
            );
            if (odds > max) {
              return odds + " is not valid.";
            }
          }
        } else if (market_status == "SUSPENDED") {
          market_status = "Is Suspended";
          return selectionName + " market " + market_status;
        } else if (market_status == "CLOSED") {
          market_status = "Is Closed";
          return selectionName + " market " + market_status;
        }
      } else {
        return "Market Suspended";
      }
    }
  };

  // fancybetListSelection = async (
  //   req: Request,
  //   res: Response
  // ): Promise<Response> => {
  //   try {
  //     const bets: Array<any> = await Bet.find(
  //       {
  //         bet_on: BetOn.FANCY,
  //         status: "pending",
  //       },
  //       {
  //         matchId: 1,
  //         selectionId: 1,
  //         id: -1,
  //         _id: -1,
  //         selectionName: 1,
  //         rmid:1
  //       }
  //     );
  //     return this.success(res, { list: bets });
  //   } catch (e: any) {
  //     return this.fail(res, e);
  //   }
  // };


  fancybetListSelection = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const bets = await Bet.aggregate([
        {
          $match: {
            bet_on: BetOn.FANCY,
            status: "pending"
          }
        },
        {
          $group: {
            _id: "$selectionName", // group unique by selectionName
            matchId: { $first: "$matchId" },
            selectionId: { $first: "$selectionId" },
            rmid: { $first: "$rmid" },
            originalId: { $first: "$_id" },  // original Mongo _id
            customId: { $first: "$id" }      // agar tere doc me id naam ka field hai
          }
        },
        {
          $project: {
            _id: 0,
            selectionName: "$_id",
            matchId: 1,
            selectionId: 1,
            rmid: 1,
            originalId: 1,
            customId: 1
          }
        }
      ]);

      return this.success(res, { list: bets });
    } catch (e: any) {
      console.log(e, "FGHJKL")
      return this.fail(res, e);
    }
  };




  checkFancyOddsConditions = async ({
    match_id,
    selectionId,
    isBack,
    odds,
    selectionName,
  }: any) => {
    let current_odds = await this.getcurrentfancyodds(match_id, selectionId);
    if (
      !current_odds ||
      (current_odds && !current_odds.sports) ||
      (current_odds && current_odds.sports && !current_odds.sports[0])
    ) {
      return "Bet is not acceptable.";
    } else {
      let currentsports: any = current_odds.sports[0];
      let market_status: string = currentsports.GameStatus;
      if (market_status == "") {
        let oddsdata = isBack
          ? currentsports.BackPrice1
          : currentsports.LayPrice1;
        if (isBack && odds > oddsdata) {
          return odds + " is not valid.";
        }
        if (!isBack && odds < oddsdata) {
          return odds + " is not valid.";
        }
      } else if (market_status == "SUSPENDED") {
        market_status = "Is Suspended";
      } else if (market_status == "Ball Running") {
        market_status = "Is Ball Running";
      }
      if (market_status != "") {
        return selectionName + " market " + market_status;
      }
    }
  };
  placebet = async (req: Request, res: Response): Promise<Response> => {
    try {
      const betData = req.body;
      if (betData.stack != undefined) {
        const user: any = req.user;
        const userId: any = user._id;
        betData["user_id"] = userId;
        const start = performance.now();
        const response = await axios.post(
          "http://127.0.0.1:5000/api/placebet",
          betData
        );
        const end = performance.now();
        console.log(response);
        return this.success(
          res,
          { bet: betData, time: end - start, ...response.data },
          "PLace Bet Successfully"
        );
      } else {
        return this.fail(res, "");
      }
    } catch (e: any) {
      return this.fail(res, e.stack);
    }
  };
  placebetold = async (req: Request, res: Response): Promise<Response> => {
    try {
      const betData = req.body;
      if (betData.stack != undefined) {
        const user: any = req.user;
        const userId: any = user._id;
        const userInfo: IUser | null | any = await User.findOne({
          _id: ObjectId(user._id),
        });
        const parentinfo: IUser | null = await User.findOne({
          _id: ObjectId(userInfo.parentId),
        });
        let event_id = betData.eventId;
        let bet_On = betData.betOn;

        const settings: any =
          userInfo != null &&
            userInfo.userSetting != undefined &&
            bet_On !== BetOn.CASINO
            ? userInfo.userSetting[event_id]
            : parentinfo != null &&
              parentinfo.userSetting != undefined &&
              bet_On == BetOn.CASINO
              ? parentinfo.userSetting[event_id]
              : default_settings;
        const partnership: any =
          parentinfo != null &&
            parentinfo.partnership != undefined &&
            bet_On !== BetOn.CASINO
            ? parentinfo.partnership[event_id]
            : parentinfo != null &&
              parentinfo.partnership != undefined &&
              bet_On == BetOn.CASINO
              ? parentinfo.partnership[4]
              : defaultRatio;
        const delay = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));
        const betClickTime = new Date();

        const userBlance: IBalance | null = await Balance.findOne({
          userId: ObjectId(user._id),
        });
        let stake = betData.stack;
        let profit = parseFloat(betData.pnl);
        let odds = parseFloat(betData.odds);
        let match_id = betData.matchId;
        let market_id = betData.marketId;
        let market_name = betData.marketName;
        let loss = parseFloat(betData.exposure);
        let selectionName = betData.selectionName;
        let selectionId = betData.selectionId;
        let isBack = betData.isBack;
        let ipAddress = betData.ipAddress;

        const betLock: any = await BetLock.findOne({
          matchId: parseInt(match_id),
          userId: { $eq: undefined },
        });
        const betLockUser: any = await BetLock.findOne({
          matchId: parseInt(match_id),
          userId: ObjectId(user._id),
        });
        /// console.log(betLock)

        if (parseInt(stake) >= 99999999) {
          return this.fail(res, stake + " is not valid.");
        }
        if (userBlance && userBlance.balance <= parseInt(stake)) {
          return this.fail(res, " Low Balance.");
        }

        if (!stake || !profit || !Math.abs(loss) || !odds) {
          ///return this.fail(res, 'Bet is not acceptable.')
        }

        if (!userInfo || (userInfo && !userInfo.betLock)) {
          return this.fail(res, "Bet is not acceptable.Please contact upline");
        }

        if (
          (betLock && betLock.betFair && market_name == "Match Odds") ||
          (betLockUser && betLockUser.betFair && market_name == "Match Odds")
        ) {
          return this.fail(res, "Bet is not acceptable.Please contact upline");
        }
        if (
          (betLock && betLock.book && market_name == "Bookmaker") ||
          (betLockUser && betLockUser.book && market_name == "Bookmaker")
        ) {
          return this.fail(res, "Bet is not acceptable.Please contact upline");
        }
        if (
          (betLock && betLock.fancy && market_name == "Fancy") ||
          (betLockUser && betLockUser.fancy && market_name == "Fancy")
        ) {
          return this.fail(res, "Bet is not acceptable.Please contact upline");
        }

        if (
          (settings && settings.minBet > stake) ||
          (settings && settings.maxBet < stake)
        ) {
          return this.fail(res, "Check Maximum or Minimum Bet Limit");
        }

        if (market_name == "Match Odds") {
          await delay((parseInt(settings.delay) - 5) * 1000);
        }
        if (market_name != "Fancy" && bet_On != BetOn.CASINO) {
          const errors = await this.checkMarketOddsConditions({
            market_id,
            market_name,
            selectionId,
            isBack,
            odds,
            selectionName,
          });
          if (errors) return this.fail(res, errors);
        } else if (bet_On == BetOn.CASINO) {
          /// perform casino validation
          // const errors = await this.checkFancyOddsConditions({
          //   match_id,
          //   selectionId,
          //   isBack,
          //   odds,
          //   selectionName,
          // })
          // if (errors) return this.fail(res, errors)
        } else {
          const errors = await this.checkFancyOddsConditions({
            match_id,
            selectionId,
            isBack,
            odds,
            selectionName,
          });
          if (errors) return this.fail(res, errors);
        }

        let matchName = "";
        let runners = [];
        if (bet_On == BetOn.CASINO) {
          const matchdata: any = await Casino.findOne({ match_id: match_id });
          matchName = matchdata != null ? matchdata.title : "";
          if (matchdata.status == 0) {
            return this.fail(res, "Match Is Not In Play");
          }
          const marketRunnerFinder = matchdata.event_data.market.filter(
            (ItemMarket: any) => ItemMarket.MarketName == market_name
          )[0];
          runners = marketRunnerFinder?.Runners || [];
        } else {
          const matchdata: any = await Match.findOne({ matchId: match_id });
          matchName = matchdata != null ? matchdata.name : "";
          if (!matchdata.active) {
            return this.fail(res, "Match Is Not In Play");
          }
          const market_current_bet: any = await Market.findOne(
            { marketId: market_id, matchId: match_id },
            { _id: 1, runners: 1 }
          );
          runners =
            market_current_bet != null ? market_current_bet.runners : [];
        }

        let json: IBet = {
          sportId: event_id,
          userId: ObjectId(user._id),
          userName: userInfo.username,
          betClickTime,
          matchId: match_id,
          marketId: market_id,
          selectionId: selectionId,
          selectionName: selectionName,
          matchName: matchName,
          odds: odds,
          volume: betData.volume,
          stack: stake,
          pnl: profit,
          marketName: market_name,
          isBack: isBack,
          matchedDate: new Date(),
          matchedOdds: odds,
          matchedInfo: "",
          userIp: ipAddress,
          loss: loss,
          parentStr: userInfo.parentStr,
          ratioStr: partnership,
          bet_on:
            market_name == "Fancy"
              ? BetOn.FANCY
              : bet_On == BetOn.CASINO
                ? bet_On
                : BetOn.MATCH_ODDS,
          runners: runners,
          //Todo: This is for fancy1 if fancy1 volume is grater then 100000
          gtype:
            (betData.gtype && betData.volume >= 100000) || BetOn.CASINO
              ? betData.gtype
              : "",
          C1: betData?.C1,
          C2: betData?.C2,
          C3: betData?.C3,
          fancystatus: betData?.fancystatus,
          rmid: Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000,
        };
        const bet = new Bet(json);
        if (bet_On != BetOn.CASINO) {
          let exposer = await this.getexposerfunction(user, false, json);
          if (exposer != "failed") {
            let available_balance =
              userBlance && userBlance.balance ? userBlance.balance : -exposer;
            if (available_balance && available_balance < parseInt(exposer)) {
              return this.fail(res, " Max limit Exceed.");
            }
            await bet.save(function (err) {
              if (err) throw err;
            });
            const expoMain: any = await Balance.findOneAndUpdate(
              { userId: user._id },
              { $set: { exposer } }
            );
            // balance event here

            const bets: Array<IBet | null> = await Bet.find({
              userId: userId,
              matchId: match_id,
              status: "pending",
            }).sort({
              createdAt: -1,
            });
            const markets: any = await Market.find({
              matchId: match_id,
            });
            const profitlist = this.getoddsprofit(bets, markets);

            const ex = exposer + +expoMain?.casinoexposer || 0;
            return this.success(
              res,
              { bet, bets, exposer: ex, profitlist },
              "PLace Bet Successfully"
            );
          } else {
            return this.fail(res, "Invalid Data");
          }
        } else {
          let casinoexposer = await this.getcasinoexposerfunction(
            user,
            false,
            json
          );
          if (casinoexposer != "failed") {
            let available_balance =
              userBlance && userBlance.balance
                ? userBlance.balance
                : -casinoexposer;
            if (
              available_balance &&
              available_balance < parseInt(casinoexposer)
            ) {
              return this.fail(res, " Max limit Exceed.");
            }
            await bet.save(function (err) {
              if (err) throw err;
            });
            const expofull: any = await Balance.findOneAndUpdate(
              { userId: user._id },
              { $set: { casinoexposer } }
            );
            // balance event here

            const bets: Array<IBet | null> = await Bet.find({
              userId: userId,
              matchId: match_id,
              status: "pending",
              bet_on: BetOn.CASINO,
            }).sort({
              createdAt: -1,
            });
            const markets: any = await Casino.findOne({
              match_id: match_id,
            });
            console.log(markets, "marketsmarketsmarkets");
            const profitlist = this.getcasinooddsprofit(
              bets,
              markets?.event_data?.market,
              markets
            );
            return this.success(
              res,
              {
                bet,
                bets,
                exposer: casinoexposer + +expofull?.exposer,
                profitlist,
              },
              "PLace Bet Successfully"
            );
          } else {
            return this.fail(res, "Invalid Data");
          }
        }
      } else {
        return this.fail(res, "Invalid Data");
      }
    } catch (e: any) {
      return this.fail(res, e.stack);
    }
  };

  getexposer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user: any = req.user;
      const userbet: any = await Bet.find(
        { status: "pending", userId: ObjectId(user._id) },
        { _id: 1, matchId: 1 }
      );
      const event_id: any = [];
      userbet.map((Item: any) => {
        if (event_id.indexOf(Item.matchId) <= -1) {
          event_id.push(Item.matchId);
        }
      });
      if (event_id.length > 0) {
        const match_list = await Match.find({ matchId: { $in: event_id } });
        let new_match_list: any = [];
        const market_grab = await match_list.map(async (Item: any) => {
          let markets = await Market.find({ matchId: Item.matchId });
          Item["markets"] = markets;
          new_match_list.push(Item);
        });
        await Promise.all(market_grab);
        let fancy_expo: number = 0;
        var main_expo: any = 0;
        const exposer_list = await new_match_list.map(async (Item: any) => {
          let profit: any = {};
          let fancypl: any = {};
          const event_data = Item.markets;
          if (event_data.length > 0) {
            event_data.map(async (ItemEvent: any) => {
              let betlist: any = await Bet.find({
                status: "pending",
                userId: ObjectId(user._id),
                matchId: Item.matchId,
                bet_on: BetOn.MATCH_ODDS,
                marketId: ItemEvent.marketId,
              });
              let profit = await this.getmatchoddsexposer(betlist, Item);
              let expo_li: any = [];
              Object.values(profit).forEach((key, index) => {
                let o_key: any = key;
                if (parseFloat(o_key) < 0) {
                  expo_li.push(key);
                }
              });
              main_expo = main_expo + Math.abs(Math.min(expo_li));
            });
          }
          let fancybetlist: any = await Bet.find({
            status: "pending",
            userId: ObjectId(user._id),
            matchId: Item.matchId,
            bet_on: BetOn.FANCY,
          });
          fancypl = await this.getfancysexposer(fancybetlist);
          Object.values(fancypl).forEach((key, index) => {
            let o_key: any = key;
            fancy_expo += Math.abs(o_key);
          });
        });
        await Promise.all(exposer_list);
        let totalexposer = fancy_expo + main_expo;
        let update_ob = { exposer: totalexposer };
        const exposer = await Balance.findOneAndUpdate(
          { userId: ObjectId(user._id) },
          update_ob,
          {
            new: true,
            upsert: true,
          }
        );
        return this.success(
          res,
          {
            exposer: totalexposer,
            fancy_expo: fancy_expo,
            main_expo: main_expo,
          },
          "Found"
        );
      } else {
        return this.success(res, {}, "Not Found");
      }
    } catch (e: any) {
      return this.fail(res, e.message);
    }
  };

  getexposerfunction = async (
    user: any,
    updatestaus: boolean,
    currenbet: IBet
  ): Promise<any> => {
    try {
      const userbet: any = await Bet.find(
        { status: "pending", userId: ObjectId(user._id) },
        { _id: 1, matchId: 1 }
      );

      const event_id: any = [];

      [...userbet, currenbet].map((Item: any) => {
        if (event_id.indexOf(Item.matchId) <= -1) {
          event_id.push(Item.matchId);
        }
      });

      let completeBetlist: any = await Bet.find({
        status: "pending",
        userId: ObjectId(user._id),
      });
      completeBetlist.push(currenbet);

      if (event_id.length > 0) {
        const match_list = await Match.find({ matchId: { $in: event_id } });
        let new_match_list: any = [];
        const market_grab = await match_list.map(async (Item: any) => {
          let markets = await Market.find({ matchId: Item.matchId });
          Item["markets"] = markets;
          new_match_list.push(Item);
        });
        await Promise.all(market_grab);
        let fancy_expo: number = 0;
        var main_expo: number = 0;
        const exposer_list = await new_match_list.map(async (Item: any) => {
          let fancypl: any = {};

          const event_data = Item.markets;
          if (event_data.length > 0) {
            const promismatchodds = event_data.map(async (ItemEvent: any) => {
              let betlist: any = completeBetlist.filter(
                (ItemBetList: any) =>
                  ItemBetList.matchId == Item.matchId &&
                  ItemBetList.bet_on == BetOn.MATCH_ODDS &&
                  ItemBetList.marketId == ItemEvent.marketId
              );
              let profit = await this.getmatchoddsexposer(betlist, Item);
              let expo_li: any = [];
              Object.values(profit).forEach((key, index) => {
                let o_key: any = key;
                if (parseFloat(o_key) < 0) {
                  if (expo_li.indexOf(key) <= -1) {
                    expo_li.push(key);
                  }
                }
              });

              main_expo +=
                expo_li.length > 0 ? Math.abs(Math.min(...expo_li)) : 0;
            });
            await Promise.all(promismatchodds);
          }
          let fancybetlist: any = completeBetlist.filter(
            (ItemBetList: any) =>
              ItemBetList.matchId == Item.matchId &&
              ItemBetList.bet_on == BetOn.FANCY
          );
          fancypl = await this.getfancysexposer(fancybetlist);
          Object.values(fancypl).forEach((key, index) => {
            let o_key: any = key;
            fancy_expo += Math.abs(o_key);
          });
        });

        await Promise.all(exposer_list);
        let totalexposer: number = fancy_expo + +main_expo;
        if (updatestaus) {
          let update_ob = { exposer: totalexposer };
          const exposer = await Balance.findOneAndUpdate(
            { userId: ObjectId(user._id) },
            update_ob,
            { new: true, upsert: true }
          );
          UserSocket.setExposer({
            exposer: totalexposer,
            balance: exposer.balance,
            userId: user._id,
          });
        }
        return totalexposer;
        /// return this.success(res, { exposer: totalexposer, fancy_expo: fancy_expo, main_expo: main_expo }, "Found");
      } else {
        return "failed";
        ///   return this.success(res, {}, "Not Found");
      }
    } catch (e: any) {
      console.log(e);
      return "failed";
      /// return this.fail(res, e.message);
    }
  };

  getcasinoexposerfunction = async (
    user: any,
    updatestaus: boolean,
    currenbet: IBet
  ): Promise<any> => {
    try {
      const userbet: any = await Bet.find(
        { status: "pending", userId: ObjectId(user._id), bet_on: BetOn.CASINO },
        { _id: 1, matchId: 1, marketId: 1 }
      );

      const event_id: any = [];
      [...userbet, currenbet].map((Item: any) => {
        if (event_id.indexOf(Item.matchId) <= -1) {
          event_id.push(Item.matchId);
        }
      });

      const roundid: any = [];
      [...userbet, currenbet].map((Item: any) => {
        const checkalready = roundid.filter(
          (ItemN: any) => ItemN.roundid == Item.marketId
        );
        if (checkalready.length <= 0) {
          roundid.push({ match_id: Item.matchId, roundid: Item.marketId });
        }
      });

      let completeBetlist: any = await Bet.find({
        status: "pending",
        userId: ObjectId(user._id),
        bet_on: BetOn.CASINO,
      });
      completeBetlist.push(currenbet);
      if (event_id.length > 0) {
        const match_list = await Casino.find({ match_id: { $in: event_id } });
        const matchData = match_list && match_list != null ? match_list : [];
        var main_expo: number = 0;
        const exposer_list = await matchData.map(async (Item: any) => {
          const event_data = Item.event_data.market;
          const filterround = roundid.filter(
            (ItemRound: any) => ItemRound.match_id == Item.match_id
          );
          if (event_data.length > 0 && filterround.length > 0) {
            const promismatchodds = event_data.map(async (ItemEvent: any) => {
              const promise2 = filterround.map(async (ItemRoundWise: any) => {
                let betlist: any = completeBetlist.filter(
                  (ItemBetList: any) =>
                    ItemBetList.matchId == Item.match_id &&
                    ItemBetList.bet_on == BetOn.CASINO &&
                    ItemBetList.marketName == ItemEvent.MarketName &&
                    ItemBetList.marketId == ItemRoundWise.roundid
                );
                if (betlist.length > 0) {
                  let profit;
                  if (Item.match_id == 33) {
                    profit = await this.getCmetercasinoexposer(betlist, Item);
                  } else {
                    profit = await this.getmatchcasinoexposer(betlist, Item);
                  }
                  console.log(profit, "profitprofitprofit");
                  let expo_li: any = [];
                  Object.values(profit).forEach((key, index) => {
                    let o_key: any = key;
                    if (parseFloat(o_key) < 0) {
                      if (expo_li.indexOf(key) <= -1) {
                        expo_li.push(key);
                      }
                    }
                  });
                  /// console.log(expo_li, "expo_li"+ItemRoundWise.roundid)
                  ///  console.log(betlist, "expo_li"+ItemRoundWise.roundid)
                  main_expo +=
                    expo_li.length > 0 ? Math.abs(Math.min(...expo_li)) : 0;
                }
              });
              await Promise.all(promise2);
            });
            await Promise.all(promismatchodds);
          }
        });
        await Promise.all(exposer_list);
        console.log(main_expo);
        let totalexposer: number = main_expo;
        if (updatestaus) {
          let update_ob = { casinoexposer: totalexposer };
          const exposer = await Balance.findOneAndUpdate(
            { userId: ObjectId(user._id) },
            update_ob,
            { new: true, upsert: true }
          );
          console.log(
            totalexposer + +exposer?.exposer,
            "totalexposer + + exposer?.exposertotalexposer + + exposer?.exposerx"
          );
          UserSocket.setExposer({
            exposer: totalexposer + +exposer?.exposer,
            balance: exposer.balance,
            userId: user._id,
          });
        }
        return totalexposer;
        /// return this.success(res, { exposer: totalexposer, fancy_expo: fancy_expo, main_expo: main_expo }, "Found");
      } else {
        return "failed";
        ///   return this.success(res, {}, "Not Found");
      }
    } catch (e: any) {
      console.log(e);
      return "failed";
      /// return this.fail(res, e.message);
    }
  };
  /********this is for match odd / bookmaker exposer calculation*/
  getmatchoddsexposer = async (betlist: any, match_data: any) => {
    let profit: any = {};
    betlist.map((ItemBets: any) => {
      let runner_data_check = match_data.markets.filter(
        (ItemRunn: any) => ItemRunn.marketId == ItemBets.marketId
      );
      if (runner_data_check[0] == undefined) return;
      const runner_data: any = runner_data_check[0].runners;
      runner_data.map((ItemRunners: any) => {
        if (
          profit[ItemBets["marketId"] + "_" + ItemRunners["selectionId"]] ==
          undefined
        ) {
          profit[ItemBets["marketId"] + "_" + ItemRunners["selectionId"]] = 0;
        }
        if (ItemBets["bet_on"] == BetOn.MATCH_ODDS) {
          if (ItemBets["isBack"] == true) {
            if (ItemBets["selectionId"] == ItemRunners["selectionId"]) {
              profit[ItemBets["marketId"] + "_" + ItemRunners["selectionId"]] +=
                ItemBets["pnl"];
            } else {
              profit[ItemBets["marketId"] + "_" + ItemRunners["selectionId"]] +=
                ItemBets["loss"];
            }
          } else {
            if (ItemBets["selectionId"] == ItemRunners["selectionId"]) {
              profit[ItemBets["marketId"] + "_" + ItemRunners["selectionId"]] +=
                ItemBets["loss"];
            } else {
              profit[ItemBets["marketId"] + "_" + ItemRunners["selectionId"]] +=
                ItemBets["pnl"];
            }
          }
        }
      });
    });
    return profit;
  };

  getmatchcasinoexposer = async (betlist: any, match_data: any) => {
    let profit: any = {};
    betlist.map((ItemBets: any) => {
      let runner_data_check = match_data.event_data.market.filter(
        (ItemRunn: any) => ItemRunn.MarketName == ItemBets.marketName
      );
      if (runner_data_check[0] == undefined) return;
      const runner_data: any = runner_data_check[0].Runners;
      runner_data.map((ItemRunners: any) => {
        if (
          profit[ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]] ==
          undefined
        ) {
          profit[ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]] = 0;
        }
        if (ItemBets["bet_on"] == BetOn.CASINO) {
          if (ItemBets["isBack"] == true) {
            if (ItemBets["fancystatus"] == "yes") {
              const filterbets =
                betlist && betlist.length > 0
                  ? betlist.filter((ItemN: any) => {
                    console.log(ItemN.marketId, " ItemN.marketId");
                    return (
                      ItemN.bet_on == BetOn.CASINO &&
                      ItemN.marketId == ItemBets.marketId &&
                      !ItemN.isBack
                    );
                  })
                  : [];
              if (ItemBets["selectionId"] == ItemRunners["SelectionId"]) {
                if (ItemBets["isBack"]) {
                  profit[
                    ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                  ] =
                    profit[
                    ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                    ] +
                    (filterbets.length > 0 ? ItemBets.pnl : -ItemBets.stack);
                } else {
                  profit[
                    ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                  ] =
                    profit[
                    ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                    ] + ItemBets.loss;
                }
              } else {
                if (ItemBets["isBack"]) {
                  profit[
                    ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                  ] =
                    profit[
                    ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                    ] +
                    (filterbets.length > 0 ? ItemBets.pnl : -ItemBets.stack);
                } else {
                  profit[
                    ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                  ] =
                    profit[
                    ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                    ] + ItemBets.loss;
                }
              }
            } else {
              if (ItemBets["selectionId"] == ItemRunners["SelectionId"]) {
                profit[
                  ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                ] +=
                  runner_data.length == 1 ? ItemBets["loss"] : ItemBets["pnl"];
              } else {
                profit[
                  ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                ] += ItemBets["loss"];
              }
            }
          } else {
            if (ItemBets["fancystatus"] == "yes") {
              if (ItemBets.marketName === "Fancy1 Market") {
                profit[
                  ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                ] += -1 * (ItemBets.odds * ItemBets.stack - ItemBets.stack);
              } else {
                let amt: any =
                  (parseInt(ItemBets["stack"]) * parseInt(ItemBets["volume"])) /
                  100;
                profit[
                  ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                ] += -amt;
              }
            } else {
              if (ItemBets["selectionId"] == ItemRunners["SelectionId"]) {
                profit[
                  ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                ] += ItemBets["loss"];
              } else {
                profit[
                  ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]
                ] += ItemBets["pnl"];
              }
            }
          }
        }
      });
    });
    return profit;
  };
  getCmetercasinoexposer = async (betlist: any, match_data: any) => {
    let profit: any = {};
    betlist.map((ItemBets: any) => {
      let runner_data_check = match_data.event_data.market.filter(
        (ItemRunn: any) => ItemRunn.MarketName == ItemBets.marketName
      );
      if (runner_data_check[0] == undefined) return;
      const runner_data: any = runner_data_check[0].Runners;
      runner_data.map((ItemRunners: any) => {
        if (
          profit[ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]] ==
          undefined
        ) {
          profit[ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]] = 0;
        }
        if (ItemBets["bet_on"] == BetOn.CASINO) {
          if (ItemBets["isBack"] == true) {
            if (ItemBets["selectionId"] == ItemRunners["SelectionId"]) {
              profit[ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]] +=
                ItemBets["loss"];
            }
          } else {
            if (ItemBets["selectionId"] == ItemRunners["SelectionId"]) {
              profit[ItemBets["marketId"] + "_" + ItemRunners["SelectionId"]] +=
                ItemBets["loss"];
            }
          }
        }
      });
    });
    return profit;
  };
  /********this is for Current odds from odds api*/
  getcurrentodds = async (marketid: any, type: string) => {
    let url: string = !type.includes("Bookmaker")
      ? `/get-odds?MarketID=${marketid}`
      : `/get-bookmaker-odds?marketId=${marketid}`;
    const response = await sportsApi
      .get(`${url}`)
      .then(async (response: any) => {
        return response.data;
      });
    return response;
  };

  getcurrentfancyodds = async (marketid: any, selectionId: any) => {
    const response = await sportsApi
      .get(`/get-single-session?MatchID=${marketid}&SelectionId=${selectionId}`)
      .then(async (response: any) => {
        return response.data;
      });
    return response;
  };

  /********this is for fancy exposer calculation*/
  getfancysexposer = async (fancybetlist: any) => {
    let fancypl: any = {};
    fancybetlist.map((ItemBets: any) => {
      if (fancypl[ItemBets["selectionId"]] == undefined) {
        fancypl[ItemBets["selectionId"]] = 0;
      }
      if (ItemBets["isBack"] == true) {
        if (ItemBets["volume"] > 100) {
          if (ItemBets.gtype === "fancy1") {
            fancypl[ItemBets["selectionId"]] += -ItemBets.stack;
            //fancypl[ItemBets['selectionId']] += ItemBets.odds * ItemBets.stack - ItemBets.stack
          } else {
            fancypl[ItemBets["selectionId"]] +=
              (ItemBets["stack"] * ItemBets["volume"]) / 100;
          }
        } else {
          fancypl[ItemBets["selectionId"]] += ItemBets["stack"];
        }
      } else {
        if (ItemBets["volume"] > 100) {
          if (ItemBets.gtype === "fancy1") {
            fancypl[ItemBets["selectionId"]] +=
              -1 * (ItemBets.odds * ItemBets.stack - ItemBets.stack);
          } else {
            let amt: any =
              (parseInt(ItemBets["stack"]) * parseInt(ItemBets["volume"])) /
              100;
            fancypl[ItemBets["selectionId"]] += amt;
          }
        } else {
          fancypl[ItemBets["selectionId"]] += ItemBets["stack"];
        }
      }
    });
    return fancypl;
  };

  betList = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user: any = req.user;
      const { matchId } = req.query;
      let userId: any = { userId: ObjectId(user._id) };
      if (user.role !== RoleType.user)
        userId = { parentStr: { $in: ObjectId(user._id) } };
      const bets: Array<IBet | null> = await Bet.find({
        ...userId,
        matchId,
        status: "pending",

      }).sort({
        createdAt: -1,
      });
      if (bets.length > 0) {
        const betFirst = bets[0];
        if (betFirst?.bet_on != "CASINO") {
          const markets: any = await Market.find({
            matchId,
          });
          const profitlist = this.getoddsprofit(bets, markets);
          return this.success(res, { bets: bets, odds_profit: profitlist });
        } else {
          const markets: any = await Casino.findOne({
            match_id: matchId,
          });
          console.log(JSON.stringify(markets), "marketsmarketsmarketsmarkets");
          const profitlist = this.getcasinooddsprofit(
            bets,
            markets.event_data.market,
            markets
          );
          return this.success(res, { bets: bets, odds_profit: profitlist });
        }
      } else {
        return this.success(res, { bets: [], odds_profit: [] });
      }
    } catch (e: any) {
      return this.fail(res, e);
    }
  };

  // betList22 = async (req: Request, res: Response): Promise<Response> => {
  //   console.log(req.body, req.query, req.user, "req.bod");
  //   try {
  //     const user: any = req.user;
  //     const { matchId } = req.query;
  //     let userId: any = { userId: ObjectId(user._id) };
  //     if (user.role !== RoleType.user)
  //       userId = { parentStr: { $in: ObjectId(user._id) } };
  //     const bets: Array<IBet | null> = await Bet.find({
  //       ...userId,
  //       matchId,
  //       status: "completed",
  //     }).sort({
  //       createdAt: -1,
  //     });
  //     console.log(bets, "cheeek bets completed");
  //     const enhancedBets = [];

  //     for (const bet of bets) {
  //       const plainBet = bet || bet;

  //       if (bet?.bet_on?.toLowerCase() === "fancy" && bet.selectionName) {
  //         const fancyResult = await Fancy.findOne({
  //           fancyName: bet.selectionName,
  //         });
  //         plainBet.result = fancyResult || null;
  //       }

  //       enhancedBets.push(plainBet);
  //     }
  //     if (bets.length > 0) {
  //       const betFirst = bets[0];
  //       if (betFirst?.bet_on != "CASINO") {
  //         const markets: any = await Market.find({
  //           matchId,
  //         });
  //         console.log(markets, "marktesss");
  //         const profitlist = this.getoddsprofit(bets, markets);
  //         return this.success(res, { bets: bets, odds_profit: profitlist });
  //       } else {
  //         const markets: any = await Casino.findOne({
  //           match_id: matchId,
  //         });
  //         console.log(JSON.stringify(markets), "marketsmarketsmarketsmarkets");
  //         const profitlist = this.getcasinooddsprofit(
  //           bets,
  //           markets.event_data.market,
  //           markets
  //         );
  //         return this.success(res, { bets: bets, odds_profit: profitlist });
  //       }
  //     } else {
  //       return this.success(res, { bets: [], odds_profit: [] });
  //     }
  //   } catch (e: any) {
  //     return this.fail(res, e);
  //   }
  // };

  // betList22 = async (req: Request, res: Response): Promise<Response> => {
  //   console.log(req.body,req.query,req.user,"req.bod")
  //   try {
  //     const user: any = req.user
  //     const { matchId } = req.query
  //     let userId: any = { userId: ObjectId(user._id) }
  //     if (user.role !== RoleType.user) userId = { parentStr: { $in: ObjectId(user._id) } }
  //     const bets: Array<IBet | null> = await Bet.find({
  //       ...userId,
  //       matchId,
  //       status: 'completed',
  //     }).sort({
  //       createdAt: -1,
  //     })

  //     console.log(bets,"bets in betlist22")
  //     if (bets.length > 0) {
  //       const betFirst = bets[0]
  //       if (betFirst?.bet_on != 'CASINO') {
  //         const markets: any = await Market.find({
  //           matchId,
  //         })
  //         console.log(markets,"marktesss")
  //         const profitlist = this.getoddsprofit(bets, markets)
  //         const Result = Fancy.find({fancyName:betFirst.selectionName})
  //         return this.success(res, { bets: bets, odds_profit: profitlist,Result })
  //       } else {
  //         const markets: any = await Casino.findOne({
  //           match_id: matchId,
  //         })
  //         // const result :any =  await find
  //         console.log(JSON.stringify(markets), 'marketsmarketsmarketsmarkets')
  //         const profitlist = this.getcasinooddsprofit(bets, markets.event_data.market, markets)
  //         return this.success(res, { bets: bets, odds_profit: profitlist })
  //       }
  //     } else {
  //       return this.success(res, { bets: [], odds_profit: [] })
  //     }
  //   } catch (e: any) {
  //     return this.fail(res, e)
  //   }
  // }

  // betList22 = async (req: Request, res: Response): Promise<Response> => {
  //   console.log(req.body, req.query, req.user, "req.bod")

  //   try {
  //     const user: any = req.user
  //     const { matchId } = req.query

  //     let userFilter: any = { userId: new ObjectId(user._id) }
  //     if (user.role !== RoleType.user) {
  //       userFilter = { parentStr: { $in: new ObjectId(user._id) } }
  //     }

  //     const bets: Array<IBet & { result?: any }> = await Bet.find({
  //       ...userFilter,
  //       matchId,
  //       status: 'completed',
  //     }).sort({ createdAt: -1 })

  //     console.log(bets, "bets in betList22")

  //     // Add `result` to each fancy bet
  //     for (const bet of bets) {
  //       if (bet?.bet_on?.toLowerCase() === 'fancy' && bet.selectionName) {
  //         const fancyResult = await Fancy.findOne({ fancyName: bet.selectionName })
  //         bet.result = fancyResult || null
  //       }
  //     }

  //     if (bets.length > 0) {
  //       const firstBet = bets[0]

  //       if (firstBet?.bet_on !== 'CASINO') {
  //         const markets = await Market.find({ matchId })
  //         const odds_profit = this.getoddsprofit(bets, markets)

  //         return this.success(res, {
  //           bets,
  //           odds_profit,
  //         })
  //       } else {
  //         const casinoMarket = await Casino.findOne({ match_id: matchId })

  //         if (!casinoMarket) {
  //           return this.success(res, {
  //             bets,
  //             odds_profit: [],
  //           })
  //         }

  //         const odds_profit = this.getcasinooddsprofit(
  //           bets,
  //           casinoMarket?.event_data?.market,
  //           casinoMarket
  //         )

  //         return this.success(res, {
  //           bets,
  //           odds_profit,
  //         })
  //       }
  //     } else {
  //       return this.success(res, {
  //         bets: [],
  //         odds_profit: [],
  //       })
  //     }
  //   } catch (e: any) {
  //     return this.fail(res, e)
  //   }
  // }

  betList22 = async (req: Request, res: Response): Promise<Response> => {
    console.log(req.body, req.query, req.user, "req.bod");
    try {
      const user: any = req.user;
      const { matchId } = req.query;
      let userId: any = { userId: ObjectId(user._id) };
      if (user.role !== RoleType.user)
        userId = { parentStr: { $in: ObjectId(user._id) } };

      // Use `.lean()` here to get plain JS objects
      const bets: Array<IBet> = await Bet.find({
        ...userId,
        matchId,
        status: "completed",
      })
        .sort({ createdAt: -1 })
        .lean();

      console.log(bets, "cheeek bets completed");

      // Add 'result' field to bets where bet_on = 'fancy'
      for (const bet of bets) {
        if (bet.bet_on?.toLowerCase() === "fancy" && bet.selectionName) {
          const fancyResult = await Fancy.findOne({
            fancyName: bet.selectionName,
            matchId: matchId,
          }).lean();
          bet.result = fancyResult || null; // safe to add field now
        }
      }

      if (bets.length > 0) {
        const betFirst = bets[0];
        if (betFirst.bet_on !== "CASINO") {
          const markets: any = await Market.find({ matchId }).lean();
          console.log(markets, "marktesss");

          const profitlist = this.getoddsprofit(bets, markets);
          return this.success(res, { bets, odds_profit: profitlist });
        } else {
          const markets: any = await Casino.findOne({
            match_id: matchId,
          }).lean();
          console.log(JSON.stringify(markets), "marketsmarketsmarketsmarkets");

          const profitlist = this.getcasinooddsprofit(
            bets,
            markets.event_data.market,
            markets
          );
          return this.success(res, { bets, odds_profit: profitlist });
        }
      } else {
        return this.success(res, { bets: [], odds_profit: [] });
      }
    } catch (e: any) {
      return this.fail(res, e);
    }
  };

  betList32 = async (req: Request, res: Response): Promise<Response> => {
    console.log(req.body, "req.body");

    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }



      // Agar admin ya subadmin hai to unke child users ke bets


      // Sirf pending bets leke aa
      const bets = await Bet.find({
        userId: ObjectId(userId),
        status: "pending",
      })
        .sort({ createdAt: -1 })
        .lean();

      console.log(bets, "Pending bets fetched");

      return res.status(200).json({
        success: true,
        bets,
      });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: e.message || "Something went wrong",
      });
    }
  };



  // marketDetails = async (req: Request, res: Response): Promise<Response> => {
  //   // console.log(req.body, req.query, req.user, "reqqqqqbcvvvod");

  //   function convertDecimalFields(obj: any): any {
  //     const converted = { ...obj };

  //     for (const key in converted) {
  //       const val = converted[key];
  //       if (val && typeof val === "object" && val._bsontype === "Decimal128") {
  //         converted[key] = parseFloat(val.toString());
  //       }
  //     }

  //     return converted;
  //   }

  //   try {
  //     const user: any = req.user;
  //     // const bets = await Bet.find({bet_on! === "CASINO"})

  //     // Step 1: Find users whose parentStr contains current user ID and have role "user"
  //     const usersWithThisAsParent = await User.find({
  //       parentStr: ObjectId(user._id),
  //       role: "user" as RoleType,
  //     });

  //     // Step 2: Extract their _id into an array
  //     const userIds = usersWithThisAsParent.map((u) => u._id);

  //     // Step 3: Fetch bets for those users, where betOn !== "CASINO"
  //     const bets = await Bet.find({
  //       userId: { $in: userIds },
  //       bet_on: { $ne: "CASINO" as BetOn },
  //       status: { $ne: "deleted" },
  //     });

  //     const matches = await  Match.find({});
  //     // console.log(matches,"maatches")

  //     // Step 5: Combine bets into matches
  //     const matchesWithBets = await Promise.all(matches.map( async (match:any) => {
  //       //@ts-ignore
  //       const relatedBets = bets.filter((bet) => bet.matchId === match.matchId);
  //       // ✅ Extract _id from relatedBets
  //       // console.log( relatedBets, `Related b:`);
  //       const fancyy = relatedBets.map((bet) => bet.selectionName);

  //       // console.log(fancyy,"fancyyyy")
  //       let matchIdone = match.matchId
  //       const resultBets = await Fancy.find({
  //         fancyName:{ $in: fancyy},
  //         matchId: matchIdone,
  //       })

  //       // console.log(resultBets,"result bets")

  //       const fancyLookup = resultBets.reduce((acc, fancy:any) => {
  //         acc[fancy.fancyName] = fancy;
  //         return acc;
  //       }, {} as Record<string, any>);

  //       // console.log(fancyLookup,"fancy lokkk")

  //       const enrichedBets = relatedBets.map((bet) => {
  //         const plainBet = bet.toObject();
  //         const cleanedBet = convertDecimalFields(plainBet);
  //         const fancyRaw = fancyLookup[cleanedBet.selectionName];
  //         const cleanedFancy = fancyRaw ? convertDecimalFields(fancyRaw.toObject()) : undefined;

  //         return {
  //           ...cleanedBet,
  //           fancy: cleanedFancy,
  //         };
  //       });

  //       // console.log(enrichedBets,"enrichedd")




  //       // console.log(`Related bet IDs for match :`, relatedBetIds);


  //       // try {
  //         const user = req.user;
  //         const id = user["_id"];

  //         // Get all children of the current user
  //         const childData = await User.find({ parentId: id });
  //         const childIds = childData.map(child => child._id);

  //         // Create a map of childId to their share
  //         const shareMap = new Map();
  //         childData.forEach(child => {
  //           shareMap.set(child._id.toString(), child.share); // Ensure _id is string for comparison
  //         });

  //         // Fetch all ledger data for children
  //         let ldata = await ledger.find({ ChildId: { $in: childIds } });

  //         if (ldata.length === 0) {
  //           ldata = await ledger.find({ ParentId: { $in: childIds } });
  //         }

  //         // Attach each child's share as superShare
  //         const updatedLdata = ldata.map(entry => {
  //           const obj = entry.toObject();
  //           const share = shareMap.get(obj.ChildId?.toString()) || 0;
  //           return {
  //             ...obj,
  //             superShare: share
  //           };
  //         });


  //       //@ts-ignore
  //       const relatedBetIds = relatedBets.map((bet) => bet.id);


  //       const ledgersForTheseBets = updatedLdata.filter(entry =>
  //         relatedBetIds.includes(entry.betId?.toString())
  //       );



  //       //   return this.success(res, updatedLdata);

  //       // } catch (error) {
  //       //   console.error("Error fetching ledger data:", error);
  //       //   return res.status(500).json({ success: false, message: "Internal server error" });
  //       // }





  //       // // ✅ Step: Find ledgers where betId in relatedBetIds
  //       // const ledgersForTheseBets = await ledger.find({
  //       //   betId: { $in: relatedBetIds },
  //       // });


  //       // console.log( ledgersForTheseBets,`Ledgers for match `,);

  //       return {
  //         ...match.toObject(),
  //         bets: enrichedBets,
  //         ledgers: ledgersForTheseBets,
  //       };
  //     }));

  //     // console.log(bets,"betsts")

  //     return this.success(res, {
  //       status: true,
  //       // users: usersWithThisAsParent,
  //       // userIds,
  //       // bets,
  //       matches: matchesWithBets,
  //     });

  //     // // const { matchId } = req.query;
  //     // let userId: any = { userId: ObjectId(user._id) };
  //     // // if (user.role !== RoleType.user)
  //     //   userId = { parentStr: { $in: ObjectId(user._id) } };
  //     // console.log(userId)

  //     // console.log(usersWithThisAsParent)

  //     // // Use `.lean()` here to get plain JS objects
  //     // const bets: Array<IBet> = await Bet.find({
  //     //   ...userId,
  //     //   matchId,
  //     //   status: "completed",
  //     // })
  //     //   .sort({ createdAt: -1 })
  //     //   .lean();

  //     // console.log(bets, "cheeek bets completed");

  //     // // Add 'result' field to bets where bet_on = 'fancy'
  //     // for (const bet of bets) {
  //     //   if (bet.bet_on?.toLowerCase() === "fancy" && bet.selectionName) {
  //     //     const fancyResult = await Fancy.findOne({ fancyName: bet.selectionName, matchId:matchId }).lean();
  //     //     bet.result = fancyResult || null; // safe to add field now
  //     //   }
  //     // }

  //     // if (bets.length > 0) {
  //     //   const betFirst = bets[0];
  //     //   if (betFirst.bet_on !== "CASINO") {
  //     //     const markets: any = await Market.find({ matchId }).lean();
  //     //     console.log(markets, "marktesss");

  //     //     const profitlist = this.getoddsprofit(bets, markets);
  //     //     return this.success(res, { bets, odds_profit: profitlist });
  //     //   } else {
  //     //     const markets: any = await Casino.findOne({ match_id: matchId }).lean();
  //     //     console.log(JSON.stringify(markets), "marketsmarketsmarketsmarkets");

  //     //     const profitlist = this.getcasinooddsprofit(bets, markets.event_data.market, markets);
  //     //     return this.success(res, { bets, odds_profit: profitlist });
  //     //   }
  //     // } else {
  //     //   return this.success(res, { bets: [], odds_profit: [] });
  //     // }
  //   } catch (e: any) {
  //     return this.fail(res, e);
  //   }
  // };




  // marketDetails = async (req: Request, res: Response): Promise<Response> => {
  //   function convertDecimalFields(obj: any): any {
  //     const converted = { ...obj };
  //     for (const key in converted) {
  //       const val = converted[key];
  //       if (val && typeof val === "object" && val._bsontype === "Decimal128") {
  //         converted[key] = parseFloat(val.toString());
  //       }
  //     }
  //     return converted;
  //   }

  //   try {
  //     const user: any = req.user;

  //     const usersWithThisAsParent = await User.find({
  //       parentStr: ObjectId(user._id),
  //       role: "user" as RoleType,
  //     });

  //     const userIds = usersWithThisAsParent.map((u) => u._id);

  //     // const [bets, matches, childData] = await Promise.all([
  //     //   Bet.find({
  //     //     userId: { $in: userIds },
  //     //     bet_on: { $ne: "CASINO" as BetOn },
  //     //     status: { $ne: "deleted" },
  //     //   }),
  //     //   Match.find({}),
  //     //   User.find({ parentId: user._id }),
  //     // ]);
  //     const [bets, matches, childData] = await Promise.all([
  //       Bet.aggregate([
  //         {
  //           $match: {
  //             userId: { $in: userIds },
  //             bet_on: { $ne: "CASINO" },
  //             status: { $ne: "deleted" },
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: "users",
  //             let: { parentIds: "$parentStr" },
  //             pipeline: [
  //               {
  //                 $match: {
  //                   $expr: {
  //                     $in: [
  //                       "$_id",
  //                       {
  //                         $map: {
  //                           input: "$$parentIds",
  //                           as: "id",
  //                           in: { $toObjectId: "$$id" },
  //                         },
  //                       },
  //                     ],
  //                   },
  //                 },
  //               },
  //               { $project: { _id: 0, username: 1 } },
  //             ],
  //             as: "parentData",
  //           },
  //         },
  //         {
  //           $addFields: {
  //             parentData: {
  //               $map: { input: "$parentData", as: "p", in: "$$p.username" },
  //             },
  //           },
  //         },
  //       ]),
  //       Match.find({}),
  //       User.find({ parentId: user._id }),
  //     ]);
  //     // const bets = betsRaw.map(b => new Bet(b));

  //    console.log("bets",bets)
  //     //@ts-ignore
  //     const matchIds = matches.map((m) => m.matchId);
  //     const allFancyNames = bets.map((b) => b.selectionName).filter(Boolean);

  //     const [fancyResults, ledgerDataRaw] = await Promise.all([
  //       Fancy.find({ matchId: { $in: matchIds }, fancyName: { $in: allFancyNames } }),
  //       ledger.find({ ChildId: { $in: childData.map(c => c._id) } })
  //     ]);

  //     const shareMap = new Map(childData.map(c => [c._id, c.share || 0]));

  //     // If no child ledger data, fallback to parent
  //     let ledgerData = ledgerDataRaw;
  //     if (ledgerData.length === 0) {
  //       ledgerData = await ledger.find({ ParentId: { $in: childData.map(c => ObjectId(c._id)) } });
  //     }

  //     const updatedLedgerData = ledgerData.map((entry) => {
  //       const obj = entry.toObject();
  //       const share = shareMap.get(obj.ChildId?.toString()) || 0;
  //       return {
  //         ...obj,
  //         superShare: share,
  //       };
  //     });

  //     // Build maps for quick access
  //     const betsByMatch = new Map();
  //     const ledgersByBetId = new Map();
  //     const fancyMap = new Map();

  //     bets.forEach((bet) => {
  //       const mId = bet.matchId;
  //       if (!betsByMatch.has(mId)) betsByMatch.set(mId, []);
  //       betsByMatch.get(mId).push(bet);
  //     });

  //     updatedLedgerData.forEach((ledgerEntry) => {
  //       const betId = ledgerEntry.betId;
  //       if (!ledgersByBetId.has(betId)) ledgersByBetId.set(betId, []);
  //       ledgersByBetId.get(betId).push(ledgerEntry);
  //     });

  //     fancyResults.forEach((fancy: any) => {
  //       fancyMap.set(`${fancy.matchId}_${fancy.fancyName}`, convertDecimalFields(fancy.toObject()));
  //     });

  //     const matchesWithBets = matches.map((match: any) => {
  //       const relatedBets = betsByMatch.get(match.matchId) || [];

  //       const enrichedBets = relatedBets.map((bet) => {
  //         const cleanedBet = convertDecimalFields(bet);
  //         const fancyKey = `${cleanedBet.matchId}_${cleanedBet.selectionName}`;
  //         return {
  //           ...cleanedBet,
  //           fancy: fancyMap.get(fancyKey),
  //         };
  //       });

  //       const relatedBetIds = relatedBets.map((b) => b.id);
  //       const ledgers = relatedBetIds.flatMap((id) => ledgersByBetId.get(id) || []);

  //       return {
  //         ...match.toObject(),
  //         bets: enrichedBets,
  //         ledgers,
  //       };
  //     });

  //     return this.success(res, {
  //       status: true,
  //       users: usersWithThisAsParent,
  //       userIds,
  //       bets,
  //       matches: matchesWithBets,
  //     });

  //   } catch (e: any) {
  //     return this.fail(res, e);
  //   }
  // };



  marketDetailstwo = async (req: Request, res: Response): Promise<Response> => {
    function convertDecimalFields(obj: any): any {
      const converted = { ...obj };
      for (const key in converted) {
        const val = converted[key];
        if (val && typeof val === "object" && val._bsontype === "Decimal128") {
          converted[key] = parseFloat(val.toString());
        }
      }
      return converted;
    }

    try {
      const user: any = req.user;

      // 🔹 Get child users of this user
      const usersWithThisAsParent = await User.find({
        parentStr: ObjectId(user._id),
        role: "user" as RoleType,
      });

      const userIds = usersWithThisAsParent.map((u) => u._id);

      // 🔹 Aggregation version (bets = plain objects)
      // const [bets, matches, childData] = await Promise.all([
      //   Bet.aggregate([
      //     {
      //       $match: {
      //         userId: { $in: userIds },
      //         bet_on: { $ne: "CASINO" },
      //         status: { $ne: "deleted" },
      //       },
      //     },
      //     { $sort: { createdAt: -1 } },
      //     {
      //       $lookup: {
      //         from: "users",
      //         let: { parentIds: "$parentStr" },
      //         pipeline: [
      //           {
      //             $match: {
      //               $expr: {
      //                 $in: [
      //                   "$_id",
      //                   {
      //                     $map: {
      //                       input: "$$parentIds",
      //                       as: "id",
      //                       in: { $toObjectId: "$$id" },
      //                     },
      //                   },
      //                 ],
      //               },
      //             },
      //           },
      //           { $project: { username: 1, _id: 0 } },
      //         ],
      //         as: "parentData",
      //       },
      //     },
      //     {
      //       $addFields: {
      //         parentData: {
      //           $map: { input: "$parentData", as: "p", in: "$$p.username" },
      //         },
      //       },
      //     },
      //   ]),
      //   Match.find({}).lean(),
      //   User.find({ parentId: user._id }).lean(),
      // ]);

      const [bets, matches, childData] = await Promise.all([
        Bet.aggregate([
          {
            $match: {
              userId: { $in: userIds },
              bet_on: { $ne: "CASINO" },
              status: { $ne: "deleted" },
            },
          },

          { $sort: { createdAt: -1 } },

          // ===== PARENT LOOKUP =====
          {
            $lookup: {
              from: "users",
              let: { parentIds: "$parentStr" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: [
                        "$_id",
                        {
                          $map: {
                            input: "$$parentIds",
                            as: "id",
                            in: { $toObjectId: "$$id" },
                          },
                        },
                      ],
                    },
                  },
                },
                { $project: { username: 1, _id: 0 } },
              ],
              as: "parentData",
            },
          },

          {
            $addFields: {
              parentData: {
                $map: { input: "$parentData", as: "p", in: "$$p.username" },
              },
            },
          },

          // ===== NEW LOOKUP: userCode from users collection =====
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userInfo",
            },
          },

          // Extract only one object
          {
            $addFields: {
              userInfo: { $arrayElemAt: ["$userInfo", 0] }
            }
          },

          // Add userCode field
          {
            $addFields: {
              userCode: "$userInfo.code"
            }
          },

          // OPTIONAL: remove full userInfo if not needed
          {
            $project: {
              userInfo: 0
            }
          }
        ]),

        Match.find({}).lean(),
        User.find({ parentId: user._id }).lean(),
      ]);


      console.log("✅ Bets are plain objects now");

      // 🔹 Collect IDs and fancy names
      const matchIds = matches.map((m: any) => m.matchId);
      const allFancyNames = bets.map((b) => b.selectionName).filter(Boolean);

      // 🔹 Fancy + Ledger fetch
      const [fancyResults, ledgerDataRaw] = await Promise.all([
        Fancy.find({
          matchId: { $in: matchIds },
          fancyName: { $in: allFancyNames },
        }).lean(),
        ledger.find({ ChildId: { $in: childData.map((c) => c._id) } }).lean(),
      ]);

      const shareMap = new Map(childData.map((c) => [c._id.toString(), c.share || 0]));

      // 🔹 Ledger fallback (ParentId search)
      let ledgerData = ledgerDataRaw;
      if (ledgerData.length === 0) {
        ledgerData = await ledger
          .find({ ParentId: { $in: childData.map((c) => ObjectId(c._id)) } })
          .lean();
      }

      // 🔹 Add superShare field
      const updatedLedgerData = ledgerData.map((entry) => {
        const share = shareMap.get(entry.ChildId?.toString()) || 0;
        return { ...entry, superShare: share };
      });

      // 🔹 Build Maps
      const betsByMatch = new Map<string, any[]>();
      const ledgersByBetId = new Map<string, any[]>();
      const fancyMap = new Map<string, any>();

      bets.forEach((bet) => {
        const mId = bet.matchId?.toString();
        if (!betsByMatch.has(mId)) betsByMatch.set(mId, []);
        betsByMatch.get(mId)!.push(bet);
      });

      updatedLedgerData.forEach((ledgerEntry) => {
        const betId = ledgerEntry.betId?.toString();
        if (!ledgersByBetId.has(betId)) ledgersByBetId.set(betId, []);
        ledgersByBetId.get(betId)!.push(ledgerEntry);
      });

      fancyResults.forEach((fancy: any) => {
        fancyMap.set(
          `${fancy.matchId}_${fancy.fancyName}`,
          convertDecimalFields(fancy)
        );
      });

      // 🔹 Merge Bets, Ledgers & Fancy with Matches
      const matchesWithBets = matches.map((match: any) => {
        const relatedBets = betsByMatch.get(match.matchId?.toString()) || [];

        const enrichedBets = relatedBets.map((bet) => {
          const cleanedBet = convertDecimalFields(bet);
          const fancyKey = `${cleanedBet.matchId}_${cleanedBet.selectionName}`;
          return {
            ...cleanedBet,
            fancy: fancyMap.get(fancyKey),
          };
        });

        const relatedBetIds = relatedBets.map((b) => b._id?.toString());
        const ledgers = relatedBetIds.flatMap(
          (id) => ledgersByBetId.get(id) || []
        );

        return {
          ...match,
          bets: enrichedBets,
          ledgers,
        };
      });

      // ✅ Final API Response
      return this.success(res, {
        status: true,
        users: usersWithThisAsParent,
        userIds,
        bets,
        matches: matchesWithBets,
      });
    } catch (e: any) {
      console.error("❌ marketDetails error:", e);
      return this.fail(res, e);
    }
  };

marketDetails = async (req: Request, res: Response): Promise<Response> => {

  // 🔹 Decimal128 → number converter
  function convertDecimalFields(obj: any): any {
    const converted = { ...obj };
    for (const key in converted) {
      const val = converted[key];
      if (val && typeof val === "object" && val._bsontype === "Decimal128") {
        converted[key] = parseFloat(val.toString());
      }
    }
    return converted;
  }

  try {
    const user: any = req.user;

    // 🔹 Pagination params (MATCH based)
    const page = parseInt(req.query.page as string) || 2;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // 🔹 Get child users
    const usersWithThisAsParent = await User.find({
      parentStr: ObjectId(user._id),
      role: "user" as RoleType,
    }).lean();

    const userIds = usersWithThisAsParent.map(u => u._id);

    // 🔹 STEP 1: Paginated MATCHES
    const [matches, totalMatches] = await Promise.all([
      Match.find({})
        .sort({ createdAt: -1 })   // change if needed
        .skip(skip)
        .limit(limit)
        .lean(),

      Match.countDocuments({}),
    ]);

    const matchIds = matches.map((m: any) => m.matchId);

    // 🔹 STEP 2: ALL bets of these matches
    const bets = await Bet.aggregate([
      {
        $match: {
          matchId: { $in: matchIds },
          userId: { $in: userIds },
          bet_on: { $ne: "CASINO" },
          status: { $ne: "deleted" },
        },
      },

      { $sort: { createdAt: -1 } },

      // ===== PARENT LOOKUP =====
      {
        $lookup: {
          from: "users",
          let: { parentIds: "$parentStr" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    "$_id",
                    {
                      $map: {
                        input: "$$parentIds",
                        as: "id",
                        in: { $toObjectId: "$$id" },
                      },
                    },
                  ],
                },
              },
            },
            { $project: { username: 1, _id: 0 } },
          ],
          as: "parentData",
        },
      },

      {
        $addFields: {
          parentData: {
            $map: { input: "$parentData", as: "p", in: "$$p.username" },
          },
        },
      },

      // ===== USER CODE =====
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $addFields: { userInfo: { $arrayElemAt: ["$userInfo", 0] } } },
      { $addFields: { userCode: "$userInfo.code" } },
      { $project: { userInfo: 0 } },
    ]);

    // 🔹 STEP 3: Fancy + Ledger
    const allFancyNames = bets.map(b => b.selectionName).filter(Boolean);

    const [fancyResults, ledgerRaw] = await Promise.all([
      Fancy.find({
        matchId: { $in: matchIds },
        fancyName: { $in: allFancyNames },
      }).lean(),

      ledger.find({
        matchId: { $in: matchIds },
      }).lean(),
    ]);

    // 🔹 Share map
    const shareMap = new Map(
      usersWithThisAsParent.map(c => [c._id.toString(), c.share || 0])
    );

    // 🔹 Ledger + superShare
    const ledgerData = ledgerRaw.map(l => ({
      ...l,
      superShare: shareMap.get(l.ChildId?.toString()) || 0,
    }));

    // 🔹 Maps
    const betsByMatch = new Map<string, any[]>();
    const ledgersByBetId = new Map<string, any[]>();
    const fancyMap = new Map<string, any>();

    bets.forEach(bet => {
      const mId = bet.matchId?.toString();
      if (!betsByMatch.has(mId)) betsByMatch.set(mId, []);
      betsByMatch.get(mId)!.push(bet);
    });

    ledgerData.forEach(l => {
      const betId = l.betId?.toString();
      if (!ledgersByBetId.has(betId)) ledgersByBetId.set(betId, []);
      ledgersByBetId.get(betId)!.push(l);
    });

    fancyResults.forEach((f:any) => {
      fancyMap.set(
        `${f.matchId}_${f.fancyName}`,
        convertDecimalFields(f)
      );
    });

    // 🔹 STEP 4: Merge everything match-wise
    const matchesWithBets = matches.map((match: any) => {
      const relatedBets = betsByMatch.get(match.matchId?.toString()) || [];

      const enrichedBets = relatedBets.map(bet => {
        const cleaned = convertDecimalFields(bet);
        const fancyKey = `${cleaned.matchId}_${cleaned.selectionName}`;
        return {
          ...cleaned,
          fancy: fancyMap.get(fancyKey),
        };
      });

      const relatedBetIds = relatedBets.map(b => b._id?.toString());
      const ledgers = relatedBetIds.flatMap(
        id => ledgersByBetId.get(id) || []
      );

      return {
        ...match,
        bets: enrichedBets,
        ledgers,
      };
    });

    // ✅ FINAL RESPONSE
    return this.success(res, {
      status: true,
      page,
      limit,
      totalMatches,
      totalPages: Math.ceil(totalMatches / limit),
      matches: matchesWithBets.reverse(),
    });

  } catch (e: any) {
    console.error("❌ marketDetails error:", e);
    return this.fail(res, e);
  }
};







  completedgames = async (req: Request, res: Response): Promise<Response> => {
    // console.log(req.body, req.query, req.user, "reqqqqqbcvvvod");

    function convertDecimalFields(obj: any): any {
      const converted = { ...obj };

      for (const key in converted) {
        const val = converted[key];
        if (val && typeof val === "object" && val._bsontype === "Decimal128") {
          converted[key] = parseFloat(val.toString());
        }
      }

      return converted;
    }

    try {
      const user: any = req.user;
      // const bets = await Bet.find({bet_on! === "CASINO"})

      // Step 1: Find users whose parentStr contains current user ID and have role "user"
      const usersWithThisAsParent = await User.find({
        parentStr: ObjectId(user._id),
        role: "user" as RoleType,
      });

      // Step 2: Extract their _id into an array
      const userIds = usersWithThisAsParent.map((u) => u._id);

      // Step 3: Fetch bets for those users, where betOn !== "CASINO"
      const bets = await Bet.find({
        userId: ObjectId(user._id),
        bet_on: { $ne: "CASINO" as BetOn },
        status: { $ne: "deleted" },
      });

      const matches = await Match.find({});
      // console.log(matches,"maatches")

      // Step 5: Combine bets into matches
      const matchesWithBets = await Promise.all(matches.map(async (match) => {
        //@ts-ignore
        const relatedBets = bets.filter((bet) => bet.matchId === match.matchId);
        // ✅ Extract _id from relatedBets
        // console.log( relatedBets, `Related b:`);
        const fancyy = relatedBets.map((bet) => bet.selectionName);

        // console.log(fancyy,"fancyyyy")

        const resultBets = await Fancy.find({
          fancyName: { $in: fancyy },
        })

        // console.log(resultBets,"result bets")

        const fancyLookup = resultBets.reduce((acc, fancy: any) => {
          acc[fancy.fancyName] = fancy;
          return acc;
        }, {} as Record<string, any>);

        // console.log(fancyLookup,"fancy lokkk")

        const enrichedBets = relatedBets.map((bet) => {
          const plainBet = bet.toObject();
          const cleanedBet = convertDecimalFields(plainBet);
          const fancyRaw = fancyLookup[cleanedBet.selectionName];
          const cleanedFancy = fancyRaw ? convertDecimalFields(fancyRaw.toObject()) : undefined;

          return {
            ...cleanedBet,
            fancy: cleanedFancy,
          };
        });

        // console.log(enrichedBets,"enrichedd")




        // console.log(`Related bet IDs for match :`, relatedBetIds);


        // try {
        const user = req.user;
        const id = user["_id"];

        // Get all children of the current user
        const childData = await User.find({ parentId: id });
        const childIds = childData.map(child => child._id);

        // Create a map of childId to their share
        const shareMap = new Map();
        childData.forEach(child => {
          shareMap.set(child._id.toString(), child.share); // Ensure _id is string for comparison
        });

        // Fetch all ledger data for children
        let ldata = await ledger.find({ ChildId: { $in: childIds } });

        if (ldata.length === 0) {
          ldata = await ledger.find({ ParentId: { $in: childIds } });
        }

        // Attach each child's share as superShare
        const updatedLdata = ldata.map(entry => {
          const obj = entry.toObject();
          const share = shareMap.get(obj.ChildId?.toString()) || 0;
          return {
            ...obj,
            superShare: share
          };
        });


        //@ts-ignore
        const relatedBetIds = relatedBets.map((bet) => bet.id);


        const ledgersForTheseBets = updatedLdata.filter(entry =>
          relatedBetIds.includes(entry.betId?.toString())
        );



        //   return this.success(res, updatedLdata);

        // } catch (error) {
        //   console.error("Error fetching ledger data:", error);
        //   return res.status(500).json({ success: false, message: "Internal server error" });
        // }





        // // ✅ Step: Find ledgers where betId in relatedBetIds
        // const ledgersForTheseBets = await ledger.find({
        //   betId: { $in: relatedBetIds },
        // });


        // console.log( ledgersForTheseBets,`Ledgers for match `,);

        return {
          ...match.toObject(),
          bets: enrichedBets,
          ledgers: ledgersForTheseBets,
        };
      }));

      // console.log(bets,"betsts")

      return this.success(res, {
        status: true,
        users: usersWithThisAsParent,
        userIds,
        bets,
        matches: matchesWithBets,
      });

      // // const { matchId } = req.query;
      // let userId: any = { userId: ObjectId(user._id) };
      // // if (user.role !== RoleType.user)
      //   userId = { parentStr: { $in: ObjectId(user._id) } };
      // console.log(userId)

      // console.log(usersWithThisAsParent)

      // // Use `.lean()` here to get plain JS objects
      // const bets: Array<IBet> = await Bet.find({
      //   ...userId,
      //   matchId,
      //   status: "completed",
      // })
      //   .sort({ createdAt: -1 })
      //   .lean();

      // console.log(bets, "cheeek bets completed");

      // // Add 'result' field to bets where bet_on = 'fancy'
      // for (const bet of bets) {
      //   if (bet.bet_on?.toLowerCase() === "fancy" && bet.selectionName) {
      //     const fancyResult = await Fancy.findOne({ fancyName: bet.selectionName, matchId:matchId }).lean();
      //     bet.result = fancyResult || null; // safe to add field now
      //   }
      // }

      // if (bets.length > 0) {
      //   const betFirst = bets[0];
      //   if (betFirst.bet_on !== "CASINO") {
      //     const markets: any = await Market.find({ matchId }).lean();
      //     console.log(markets, "marktesss");

      //     const profitlist = this.getoddsprofit(bets, markets);
      //     return this.success(res, { bets, odds_profit: profitlist });
      //   } else {
      //     const markets: any = await Casino.findOne({ match_id: matchId }).lean();
      //     console.log(JSON.stringify(markets), "marketsmarketsmarketsmarkets");

      //     const profitlist = this.getcasinooddsprofit(bets, markets.event_data.market, markets);
      //     return this.success(res, { bets, odds_profit: profitlist });
      //   }
      // } else {
      //   return this.success(res, { bets: [], odds_profit: [] });
      // }
    } catch (e: any) {
      return this.fail(res, e);
    }
  };



  completedgamescasino = async (req: Request, res: Response): Promise<Response> => {
    // console.log(req.body, req.query, req.user, "reqqqqqbcvvvod");

    function convertDecimalFields(obj: any): any {
      const converted = { ...obj };

      for (const key in converted) {
        const val = converted[key];
        if (val && typeof val === "object" && val._bsontype === "Decimal128") {
          converted[key] = parseFloat(val.toString());
        }
      }

      return converted;
    }

    try {
      const user: any = req.user;
      // const bets = await Bet.find({bet_on! === "CASINO"})

      // Step 1: Find users whose parentStr contains current user ID and have role "user"
      const usersWithThisAsParent = await User.find({
        parentStr: ObjectId(user._id),
        role: "user" as RoleType,
      });

      // Step 2: Extract their _id into an array
      const userIds = usersWithThisAsParent.map((u) => u._id);

      // Step 3: Fetch bets for those users, where betOn !== "CASINO"
      const bets = await Bet.find({
        userId: ObjectId(user._id),
        bet_on: "CASINO" as BetOn,
        status: { $ne: "deleted" },
      });

      console.log(bets, "bets in completed games casino")

      const matches = await Match.find({});
      // console.log(matches,"maatches")

      // Step 5: Combine bets into matches
      const matchesWithBets = await Promise.all(matches.map(async (match) => {
        //@ts-ignore
        const relatedBets = bets.filter((bet) => bet.matchId === match.matchId);
        // ✅ Extract _id from relatedBets
        // console.log( relatedBets, `Related b:`);
        const fancyy = relatedBets.map((bet) => bet.selectionName);

        // console.log(fancyy,"fancyyyy")

        const resultBets = await Fancy.find({
          fancyName: { $in: fancyy },
        })

        // console.log(resultBets,"result bets")

        const fancyLookup = resultBets.reduce((acc, fancy: any) => {
          acc[fancy.fancyName] = fancy;
          return acc;
        }, {} as Record<string, any>);

        // console.log(fancyLookup,"fancy lokkk")

        const enrichedBets = relatedBets.map((bet) => {
          const plainBet = bet.toObject();
          const cleanedBet = convertDecimalFields(plainBet);
          const fancyRaw = fancyLookup[cleanedBet.selectionName];
          const cleanedFancy = fancyRaw ? convertDecimalFields(fancyRaw.toObject()) : undefined;

          return {
            ...cleanedBet,
            fancy: cleanedFancy,
          };
        });

        // console.log(enrichedBets,"enrichedd")




        // console.log(`Related bet IDs for match :`, relatedBetIds);


        // try {
        const user = req.user;
        const id = user["_id"];

        // Get all children of the current user
        const childData = await User.find({ parentId: id });
        const childIds = childData.map(child => child._id);

        // Create a map of childId to their share
        const shareMap = new Map();
        childData.forEach(child => {
          shareMap.set(child._id.toString(), child.share); // Ensure _id is string for comparison
        });

        // Fetch all ledger data for children
        let ldata = await ledger.find({ ChildId: { $in: childIds } });

        if (ldata.length === 0) {
          ldata = await ledger.find({ ParentId: { $in: childIds } });
        }

        // Attach each child's share as superShare
        const updatedLdata = ldata.map(entry => {
          const obj = entry.toObject();
          const share = shareMap.get(obj.ChildId?.toString()) || 0;
          return {
            ...obj,
            superShare: share
          };
        });


        //@ts-ignore
        const relatedBetIds = relatedBets.map((bet) => bet.id);


        const ledgersForTheseBets = updatedLdata.filter(entry =>
          relatedBetIds.includes(entry.betId?.toString())
        );



        //   return this.success(res, updatedLdata);

        // } catch (error) {
        //   console.error("Error fetching ledger data:", error);
        //   return res.status(500).json({ success: false, message: "Internal server error" });
        // }





        // // ✅ Step: Find ledgers where betId in relatedBetIds
        // const ledgersForTheseBets = await ledger.find({
        //   betId: { $in: relatedBetIds },
        // });


        // console.log( ledgersForTheseBets,`Ledgers for match `,);

        return {
          ...match.toObject(),
          bets: enrichedBets,
          ledgers: ledgersForTheseBets,
        };
      }));

      // console.log(bets,"betsts")

      return this.success(res, {
        status: true,
        // users: usersWithThisAsParent,
        // userIds,
        bets,
        // matches: matchesWithBets,
      });

      // // const { matchId } = req.query;
      // let userId: any = { userId: ObjectId(user._id) };
      // // if (user.role !== RoleType.user)
      //   userId = { parentStr: { $in: ObjectId(user._id) } };
      // console.log(userId)

      // console.log(usersWithThisAsParent)

      // // Use `.lean()` here to get plain JS objects
      // const bets: Array<IBet> = await Bet.find({
      //   ...userId,
      //   matchId,
      //   status: "completed",
      // })
      //   .sort({ createdAt: -1 })
      //   .lean();

      // console.log(bets, "cheeek bets completed");

      // // Add 'result' field to bets where bet_on = 'fancy'
      // for (const bet of bets) {
      //   if (bet.bet_on?.toLowerCase() === "fancy" && bet.selectionName) {
      //     const fancyResult = await Fancy.findOne({ fancyName: bet.selectionName, matchId:matchId }).lean();
      //     bet.result = fancyResult || null; // safe to add field now
      //   }
      // }

      // if (bets.length > 0) {
      //   const betFirst = bets[0];
      //   if (betFirst.bet_on !== "CASINO") {
      //     const markets: any = await Market.find({ matchId }).lean();
      //     console.log(markets, "marktesss");

      //     const profitlist = this.getoddsprofit(bets, markets);
      //     return this.success(res, { bets, odds_profit: profitlist });
      //   } else {
      //     const markets: any = await Casino.findOne({ match_id: matchId }).lean();
      //     console.log(JSON.stringify(markets), "marketsmarketsmarketsmarkets");

      //     const profitlist = this.getcasinooddsprofit(bets, markets.event_data.market, markets);
      //     return this.success(res, { bets, odds_profit: profitlist });
      //   }
      // } else {
      //   return this.success(res, { bets: [], odds_profit: [] });
      // }
    } catch (e: any) {
      return this.fail(res, e);
    }
  };



  marketCasino = async (req: Request, res: Response): Promise<Response> => {
    // console.log(req.body, req.query, req.user, "reqqqqqbcvvvod");

    // function convertDecimalFields(obj: any): any {
    //   const converted = { ...obj };

    //   for (const key in converted) {
    //     const val = converted[key];
    //     if (val && typeof val === "object" && val._bsontype === "Decimal128") {
    //       converted[key] = parseFloat(val.toString());
    //     }
    //   }

    //   return converted;
    // }

    try {
      const user: any = req.user;
      // const bets = await Bet.find({bet_on! === "CASINO"})

      // Step 1: Find users whose parentStr contains current user ID and have role "user"
      const usersWithThisAsParent = await User.find({
        parentStr: ObjectId(user._id),
        role: "user" as RoleType,
      });

      // Step 2: Extract their _id into an array
      const userIds = usersWithThisAsParent.map((u) => u._id);
      // console.log(userIds,"user ids in market casino")

      // Step 3: Fetch bets for those users, where betOn !== "CASINO"
      // const bets = await Bet.find({
      //   userId: { $in: userIds },
      //   bet_on: "CASINO" as BetOn,
      //   status: { $ne: "deleted" },
      // });

      const bets = await Bet.aggregate([
        {
          $match: {
            userId: { $in: userIds },
            bet_on: "CASINO",
            status: { $ne: "deleted" },
          },
        },
        {
          $lookup: {
            from: "users",
            let: { parentIds: "$parentStr" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [
                      "$_id",
                      {
                        $map: {
                          input: "$$parentIds",
                          as: "id",
                          in: { $toObjectId: "$$id" },
                        },
                      },
                    ],
                  },
                },
              },
              { $project: { _id: 0, username: 1 } },
            ],
            as: "parentData",
          },
        },
        {
          $addFields: {
            parentData: {
              $map: { input: "$parentData", as: "p", in: "$$p.username" },
            },
          },
        },
        // 👇 Add this to sort newest first
        { $sort: { createdAt: 1 } },
      ]);



      // const matches = await  Match.find({});
      // console.log(matches,"maatches")

      // Step 5: Combine bets into matches
      // const matchesWithBets = await Promise.all(matches.map( async (match) => {
      //   //@ts-ignore
      //   const relatedBets = bets.filter((bet) => bet.matchId === match.matchId);
      //   // ✅ Extract _id from relatedBets
      //   // console.log( relatedBets, `Related b:`);
      //   const fancyy = relatedBets.map((bet) => bet.selectionName);

      //   // console.log(fancyy,"fancyyyy")

      //   const resultBets = await Fancy.find({
      //     fancyName:{ $in: fancyy},
      //   })

      //   // console.log(resultBets,"result bets")

      //   const fancyLookup = resultBets.reduce((acc, fancy:any) => {
      //     acc[fancy.fancyName] = fancy;
      //     return acc;
      //   }, {} as Record<string, any>);

      //   // console.log(fancyLookup,"fancy lokkk")

      //   const enrichedBets = relatedBets.map((bet) => {
      //     const plainBet = bet.toObject();
      //     const cleanedBet = convertDecimalFields(plainBet);
      //     const fancyRaw = fancyLookup[cleanedBet.selectionName];
      //     const cleanedFancy = fancyRaw ? convertDecimalFields(fancyRaw.toObject()) : undefined;

      //     return {
      //       ...cleanedBet,
      //       fancy: cleanedFancy,
      //     };
      //   });

      //   // console.log(enrichedBets,"enrichedd")




      //   // console.log(`Related bet IDs for match :`, relatedBetIds);


      //   // try {
      //     const user = req.user;
      //     const id = user["_id"];

      //     // Get all children of the current user
      //     const childData = await User.find({ parentId: id });
      //     const childIds = childData.map(child => child._id);

      //     // Create a map of childId to their share
      //     const shareMap = new Map();
      //     childData.forEach(child => {
      //       shareMap.set(child._id.toString(), child.share); // Ensure _id is string for comparison
      //     });

      //     // Fetch all ledger data for children
      //     let ldata = await ledger.find({ ChildId: { $in: childIds } });

      //     if (ldata.length === 0) {
      //       ldata = await ledger.find({ ParentId: { $in: childIds } });
      //     }

      //     // Attach each child's share as superShare
      //     const updatedLdata = ldata.map(entry => {
      //       const obj = entry.toObject();
      //       const share = shareMap.get(obj.ChildId?.toString()) || 0;
      //       return {
      //         ...obj,
      //         superShare: share
      //       };
      //     });


      //   //@ts-ignore
      //   const relatedBetIds = relatedBets.map((bet) => bet.id);


      //   const ledgersForTheseBets = updatedLdata.filter(entry =>
      //     relatedBetIds.includes(entry.betId?.toString())
      //   );



      //   //   return this.success(res, updatedLdata);

      //   // } catch (error) {
      //   //   console.error("Error fetching ledger data:", error);
      //   //   return res.status(500).json({ success: false, message: "Internal server error" });
      //   // }





      //   // // ✅ Step: Find ledgers where betId in relatedBetIds
      //   // const ledgersForTheseBets = await ledger.find({
      //   //   betId: { $in: relatedBetIds },
      //   // });


      //   // console.log( ledgersForTheseBets,`Ledgers for match `,);

      //   return {
      //     ...match.toObject(),
      //     bets: enrichedBets,
      //     ledgers: ledgersForTheseBets,
      //   };
      // }));

      // console.log(bets,"betsts")

      return this.success(res, {
        status: true,
        // users: usersWithThisAsParent,
        // userIds,
        bets,
        // matches: matchesWithBets,
      });

      // // const { matchId } = req.query;
      // let userId: any = { userId: ObjectId(user._id) };
      // // if (user.role !== RoleType.user)
      //   userId = { parentStr: { $in: ObjectId(user._id) } };
      // console.log(userId)

      // console.log(usersWithThisAsParent)

      // // Use `.lean()` here to get plain JS objects
      // const bets: Array<IBet> = await Bet.find({
      //   ...userId,
      //   matchId,
      //   status: "completed",
      // })
      //   .sort({ createdAt: -1 })
      //   .lean();

      // console.log(bets, "cheeek bets completed");

      // // Add 'result' field to bets where bet_on = 'fancy'
      // for (const bet of bets) {
      //   if (bet.bet_on?.toLowerCase() === "fancy" && bet.selectionName) {
      //     const fancyResult = await Fancy.findOne({ fancyName: bet.selectionName, matchId:matchId }).lean();
      //     bet.result = fancyResult || null; // safe to add field now
      //   }
      // }

      // if (bets.length > 0) {
      //   const betFirst = bets[0];
      //   if (betFirst.bet_on !== "CASINO") {
      //     const markets: any = await Market.find({ matchId }).lean();
      //     console.log(markets, "marktesss");

      //     const profitlist = this.getoddsprofit(bets, markets);
      //     return this.success(res, { bets, odds_profit: profitlist });
      //   } else {
      //     const markets: any = await Casino.findOne({ match_id: matchId }).lean();
      //     console.log(JSON.stringify(markets), "marketsmarketsmarketsmarkets");

      //     const profitlist = this.getcasinooddsprofit(bets, markets.event_data.market, markets);
      //     return this.success(res, { bets, odds_profit: profitlist });
      //   }
      // } else {
      //   return this.success(res, { bets: [], odds_profit: [] });
      // }
    } catch (e: any) {
      return this.fail(res, e);
    }
  };







  getoddsprofit = (bets: any, markets: any) => {
    var odds_profit: any = {};
    const filterbets =
      bets && bets.length > 0
        ? bets.filter((Item: any) => Item.bet_on == BetOn.MATCH_ODDS)
        : [];
    const promiseprofit = filterbets.map((Item: any) => {
      const selectionIdBet = Item.selectionId;
      const getBetType = Item.isBack;
      const lossAmt = Item.stack;
      const getOdds = Item.odds;

      let profitAmt: number = (parseFloat(getOdds) - 1) * parseFloat(lossAmt);
      let filtermarket =
        markets && markets.length > 0
          ? markets.filter(
            (ItemMarket: any) => ItemMarket.marketId == Item.marketId
          )
          : [];
      const filtermarketdata: any =
        filtermarket && filtermarket.length > 0 ? filtermarket[0] : {};
      if (filtermarketdata) {
        filtermarketdata.runners.map((mData: any, mIndex: number) => {
          var SelectionId = mData.selectionId;
          if (
            odds_profit[filtermarketdata.marketId + "_" + SelectionId] ==
            undefined
          ) {
            odds_profit[filtermarketdata.marketId + "_" + SelectionId] = 0;
          }

          if (SelectionId == selectionIdBet) {
            if (getBetType) {
              odds_profit[filtermarketdata.marketId + "_" + SelectionId] =
                odds_profit[filtermarketdata.marketId + "_" + SelectionId] +
                profitAmt;
            } else {
              odds_profit[filtermarketdata.marketId + "_" + SelectionId] =
                odds_profit[filtermarketdata.marketId + "_" + SelectionId] -
                profitAmt;
            }
          } else {
            if (getBetType) {
              odds_profit[filtermarketdata.marketId + "_" + SelectionId] =
                odds_profit[filtermarketdata.marketId + "_" + SelectionId] -
                lossAmt;
            } else {
              odds_profit[filtermarketdata.marketId + "_" + SelectionId] =
                odds_profit[filtermarketdata.marketId + "_" + SelectionId] +
                lossAmt;
            }
          }
        });
      }
    });
    Promise.all(promiseprofit);
    const filterbetsFancy =
      bets && bets.length > 0
        ? bets.filter((Item: any) => Item.bet_on == BetOn.FANCY)
        : [];

    var fancy_profit: any = {};
    const promiseprofitFancy = filterbetsFancy.map((Item: any) => {
      if (fancy_profit[Item.selectionId] == undefined) {
        fancy_profit[Item.selectionId] = 0;
      }
      if (Item.isBack) {
        if (Item["volume"] > 100) {
          if (Item.gtype === "fancy1") {
            //fancy_profit[Item['selectionId']] += Item.odds * Item.stack - Item.stack
            fancy_profit[Item["selectionId"]] += -Item.stack;
          } else {
            fancy_profit[Item["selectionId"]] += -Item["stack"];
          }
        } else {
          fancy_profit[Item["selectionId"]] += -Item["stack"];
        }
        ///fancy_profit[Item['selectionId']] += -(Item['stack'] * Item['volume']) / 100
      } else {
        if (Item["volume"] > 100) {
          if (Item.gtype === "fancy1") {
            fancy_profit[Item["selectionId"]] +=
              -1 * (Item.odds * Item.stack - Item.stack);
          } else {
            let amt: any =
              (parseInt(Item["stack"]) * parseInt(Item["volume"])) / 100;
            fancy_profit[Item["selectionId"]] += -amt;
          }
        } else {
          fancy_profit[Item["selectionId"]] += -Item["stack"];
        }

        /// fancy_profit[Item['selectionId']] +=
        ///  -(parseInt(Item['stack']) * parseInt(Item['volume'])) / 100
      }
    });
    Promise.all(promiseprofitFancy);

    odds_profit = { ...odds_profit, ...fancy_profit };
    return odds_profit;
  };

  getcasinooddsprofit = (bets: any, markets: any, matchInfo: any) => {
    var odds_profit: any = {};
    const filterbets =
      bets && bets.length > 0
        ? bets.filter((Item: any) => Item.bet_on == BetOn.CASINO)
        : [];
    const promiseprofit = filterbets.map((Item: any) => {
      const selectionIdBet = Item.selectionId;
      const getBetType = Item.isBack;
      const lossAmt = Item.matchId == 33 ? Item.stack : Item.loss;
      const getOdds = Item.odds;
      let profitAmt: number = 0;
      if (Item.fancystatus == "yes") {
        profitAmt = Item.pnl;
      } else {
        profitAmt = (parseFloat(getOdds) - 1) * parseFloat(lossAmt);
      }
      let filtermarket =
        markets && markets.length > 0
          ? markets.filter(
            (ItemMarket: any) => ItemMarket.MarketName == Item.marketName
          )
          : [];
      const filtermarketdata: any =
        filtermarket && filtermarket.length > 0
          ? filtermarket[0]
          : { Runners: [] };
      if (filtermarketdata) {
        filtermarketdata.Runners.map((mData: any, mIndex: number) => {
          var SelectionId = mData.SelectionId;
          if (odds_profit[Item.marketId + "_" + SelectionId] == undefined) {
            odds_profit[Item.marketId + "_" + SelectionId] = 0;
          }
          console.log(matchInfo.match_id);
          if (matchInfo.match_id == 33) {
            //// specific condition for cmeter game
            if (SelectionId == selectionIdBet) {
              if (getBetType) {
                odds_profit[Item.marketId + "_" + SelectionId] =
                  odds_profit[Item.marketId + "_" + SelectionId] + lossAmt;
              } else {
                odds_profit[Item.marketId + "_" + SelectionId] =
                  odds_profit[Item.marketId + "_" + SelectionId] - profitAmt;
              }
            }
          } else if (matchInfo.match_id == 46) {
            // race2020
            if (SelectionId == selectionIdBet) {
              if (getBetType) {
                odds_profit[Item.marketId + "_" + SelectionId] =
                  odds_profit[Item.marketId + "_" + SelectionId] + lossAmt;
              } else {
                odds_profit[Item.marketId + "_" + SelectionId] =
                  odds_profit[Item.marketId + "_" + SelectionId] + lossAmt;
              }
            }
          } else if (Item.fancystatus == "yes") {
            // all fancy cases
            const filterbets =
              bets && bets.length > 0
                ? bets.filter((ItemN: any) => {
                  console.log(ItemN.marketId, " ItemN.marketId");
                  return (
                    ItemN.bet_on == BetOn.CASINO &&
                    ItemN.marketId == Item.marketId &&
                    !ItemN.isBack
                  );
                })
                : [];
            if (SelectionId == selectionIdBet) {
              if (getBetType) {
                odds_profit[Item.marketId + "_" + SelectionId] =
                  odds_profit[Item.marketId + "_" + SelectionId] +
                  (filterbets.length > 0 ? Item.pnl : -Item.stack);
              } else {
                odds_profit[Item.marketId + "_" + SelectionId] =
                  odds_profit[Item.marketId + "_" + SelectionId] + lossAmt;
              }
            }
          } else {
            if (SelectionId == selectionIdBet) {
              if (getBetType) {
                odds_profit[Item.marketId + "_" + SelectionId] =
                  odds_profit[Item.marketId + "_" + SelectionId] + profitAmt;
              } else {
                odds_profit[Item.marketId + "_" + SelectionId] =
                  odds_profit[Item.marketId + "_" + SelectionId] - profitAmt;
              }
            } else {
              if (getBetType) {
                odds_profit[Item.marketId + "_" + SelectionId] =
                  odds_profit[Item.marketId + "_" + SelectionId] - lossAmt;
              } else {
                odds_profit[Item.marketId + "_" + SelectionId] =
                  odds_profit[Item.marketId + "_" + SelectionId] + lossAmt;
              }
            }
          }
        });
      }
    });
    Promise.all(promiseprofit);
    console.log(odds_profit, "odds_profit");
    /// odds_profit = { ...odds_profit }
    return odds_profit;
  };

  alluserbetList = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { page }: any = req.query;
      let {
        reportType,
        startDate,
        endDate,
        userId,
        name,
        type,
        status,
        matchId,
      }: any = req.body;
      const user: any = req.user;

      if (user.role === RoleType.user && status == "deleted") {
        // Fake data for user
        return this.success(res, {
          docs: [],
          hasNextPage: false,
          hasPrevPage: false,
          limit: 20,
          nextPage: null,
          page: 1,
          pagingCounter: 1,
          prevPage: null,
          totalDocs: 0,
          totalPages: 0,
        });
      }
      const options = {
        page: page ? page : 1,
        limit: 20,
        sort: { createdAt: -1 },
      };
      const useridmap: any = [];
      if (userId) {
        useridmap.push(userId);
      } else {
        const userChilds = await User.find(
          {
            parentStr: { $elemMatch: { $eq: ObjectId(user._id) } },
            role: RoleType.user,
          },
          { _id: 1 }
        );
        useridmap.push(ObjectId(user._id));
        userChilds.map((Item) => useridmap.push(ObjectId(Item._id)));
      }

      var filter: any = {
        userId: { $in: useridmap },
        status: type ? "deleted" : status,
      };
      if (matchId) {
        filter = { ...filter, matchId: parseInt(matchId) };
      }

      // if (startDate && startDate != "") {
      //   startDate = startDate.includes("T")
      //     ? `${startDate.replace("T", " ")}:00`
      //     : `${startDate} 00:00:00`;
      //   endDate = endDate.includes("T")
      //     ? `${endDate.replace("T", " ")}:00`
      //     : `${endDate} 23:59:59`;
      //   filter = {
      //     ...filter,
      //     ...{
      //       createdAt: {
      //         $gte: new Date(startDate),
      //         $lte: new Date(endDate),
      //       },
      //     },
      //   };
      // }
      if (startDate && startDate !== "") {
        // Normalize format
        const formatDate = (dateStr, isEnd = false) => {
          // Agar "T" hai to HTML datetime-local ka format hai (YYYY-MM-DDTHH:mm:ss)
          if (dateStr.includes("T")) {
            // HTML format ko space-based datetime me convert karo
            return dateStr.replace("T", " ");
          } else {
            // Agar "T" nahi hai to seconds ke hisab se default add karo
            return isEnd ? `${dateStr} 23:59:59` : `${dateStr} 00:00:00`;
          }
        };

        const formattedStart = formatDate(startDate);
        const formattedEnd = formatDate(endDate, true);

        filter = {
          ...filter,
          createdAt: {
            $gte: new Date(formattedStart),
            $lte: new Date(formattedEnd),
          },
        };
      }

      if (reportType && reportType != "") {
        filter = {
          ...filter,
          sportId: { $in: [parseInt(reportType), reportType] },
        };
      }
      if (name) {
        filter = {
          ...filter,
          $or: [
            { selectionName: new RegExp(name, "i") },
            { matchName: new RegExp(name, "i") },
          ],
        };
      }

      console.log(filter);
      const bets = await Bet.paginate(filter, options);
      return this.success(res, bets);
    } catch (e: any) {
      return this.fail(res, e);
    }
  };


  alluserbetList22 = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Only get deleted bets from all users
      const filter = { status: 'deleted' };

      console.log("Filter:", filter);

      const deletedBets = await Bet.find(filter).sort({ createdAt: -1 });
      return this.success(res, deletedBets);
    } catch (e: any) {
      return this.fail(res, e);
    }
  };


  getExposerEvent = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user: any = req.user;
      var filter: any = [
        {
          $match: {
            userId: Types.ObjectId(user._id),
            status: "pending",
          },
        },
        {
          $group: {
            _id: "$matchId",
            matchName: { $first: "$matchName" },
            myCount: { $sum: 1 },
            matchslug: { $first: "$matchDetails.slug" },
            matchId: { $first: "$matchDetails.matchId" },
          },
        },
      ];
      const bets = await Bet.aggregate([
        {
          $match: {
            userId: Types.ObjectId(user._id),
            status: "pending",
          },
        },
        {
          $group: {
            _id: "$matchId",
            matchName: { $first: "$matchName" },
            myCount: { $sum: 1 },
            sportId: { $first: "$sportId" },
            matchId: { $first: "$matchId" },
          },
        },
      ]);

      // const bets = await Bet.aggregate([
      //   {
      //     $match: {
      //       userId: Types.ObjectId(user._id),
      //       status: 'pending',
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: '$matchId',
      //       matchName: { $first: '$matchName' },
      //       myCount: { $sum: 1 },
      //       betOn: { $first: '$bet_on' }, // Preserve the bet_on field for conditional lookup
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: 'casinomatches', // Collection to lookup if bet_on is 'CASINO'
      //       localField: '_id',
      //       foreignField: '_id',
      //       as: 'matchDetails',
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: 'matches', // Collection to lookup if bet_on is not 'CASINO'
      //       localField: '_id',
      //       foreignField: '_id',
      //       as: 'matchDetails',
      //     },
      //   },
      //   {
      //     $unwind: '$matchDetails',
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       matchName: 1,
      //       myCount: 1,
      //       matchslug: '$matchDetails.slug',
      //       matchId: '$matchDetails.matchId',
      //       betOn: 1, // Include the preserved bet_on field in the result
      //     },
      //   },
      // ]);

      return this.success(res, bets);
    } catch (e: any) {
      return this.fail(res, e);
    }
  };
  getBetListByIds = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { betIds, page } = req.body;
      const ids = betIds instanceof Array ? betIds : [betIds];
      const options = {
        page: page ? page : 1,
        limit: 10,
        sort: { createdAt: -1 },
      };
      const bets = await Bet.paginate(
        { _id: { $in: ids }, status: { $nin: ["pending", "deleted"] } },
        options
      );
      return this.success(res, bets);
    } catch (e: any) {
      return this.fail(res, e);
    }
  };

  // deleteCurrentBet = async (req: Request, res: Response): Promise<Response> => {
  //   try {
  //     let status: string = "deleted";
  //     const userbet: any = await Bet.findOneAndUpdate(
  //       { _id: ObjectId(req.params.id) },
  //       { $set: { status } }
  //     );
  //     const json: any = {};
  //     let exposer = await this.getexposerfunction(
  //       { _id: userbet.userId },
  //       true,
  //       json
  //     );
  //     // balance event here
  //     return this.success(res, { success: true }, "Bet deleted successfully");
  //   } catch (e: any) {
  //     return this.fail(res, e);
  //   }
  // };



  deleteCurrentBet = async (req: Request, res: Response): Promise<Response> => {
    try {
      let status: string = 'deleted'
      const userbet: any = await Bet.findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $set: { status } },
      )
      console.log(userbet, "userbet")
      const betAmount = parseFloat(userbet?.loss.toString())
      console.log(betAmount, "Bet ammount HHHHH")
      const userId = userbet.userId


      const json: any = {}
      let exposer = await this.getexposerfunction({ _id: userbet.userId }, true, json)
      let exposer2 = await this.getcasinoexposerfunction({ _id: userbet.userId }, true, json)

      // balance event here
      return this.success(res, { success: true }, 'Bet deleted successfully')
    } catch (e: any) {
      console.log(e)
      return this.fail(res, e)
    }
  }

  deleteBets = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { ids } = req.body;
      const userIds = await Bet.find({ _id: { $in: ids } })
        .select({ userId: 1 })
        .distinct("userId")
        .lean();

      let status: string = "deleted";
      await Bet.updateMany({ _id: { $in: ids } }, { $set: { status } });
      if (userIds.length > 0) {
        userIds.map(async (userId) => {
          const json: any = {};
          await this.getexposerfunction({ _id: userId }, true, json);
        });
      }
      // balance event here
      return this.success(res, { success: true }, "Bet deleted successfully");
    } catch (e: any) {
      return this.fail(res, e);
    }
  };
}
