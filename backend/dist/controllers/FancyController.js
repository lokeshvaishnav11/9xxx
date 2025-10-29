"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FancyController = void 0;
const axios_1 = __importDefault(require("axios"));
const Fancy_1 = require("../models/Fancy");
const ApiController_1 = require("./ApiController");
const Bet_1 = require("../models/Bet");
const Match_1 = require("../models/Match");
const BetController_1 = require("./BetController");
const User_1 = require("../models/User");
const AccountStatement_1 = require("../models/AccountStatement");
const UserChip_1 = require("../models/UserChip");
const Balance_1 = require("../models/Balance");
const mongoose_1 = require("mongoose");
const user_socket_1 = __importDefault(require("../sockets/user-socket"));
const Role_1 = require("../models/Role");
const Market_1 = require("../models/Market");
const CasCasino_1 = require("../models/CasCasino");
const allledager_1 = require("../models/allledager");
var ObjectId = require("mongoose").Types.ObjectId;
class FancyController extends ApiController_1.ApiController {
    constructor() {
        // activeFancies = async (req: Request, res: Response): Promise<Response> => {
        //   try {
        //     const { matchId, gtype }: any = req.query;
        //     if (!matchId) return this.fail(res, "matchId is required field");
        super(...arguments);
        //     // const strings = ["wkt", "Wkts", "Fours", "Sixes"];
        //     const strings = ["wkt", "Fours", "Sixes"];
        //     const filters = {
        //       $nor: [
        //         ...strings.map((string) => ({ fancyName: { $regex: string } })),
        //         { ballByBall: "ballRun" },
        //       ],
        //       gtype,
        //     };
        //     let filter: any = { gtype };
        //     switch (gtype) {
        //       case "session":
        //         filter = filters;
        //         break;
        //       case "fancy1":
        //         filter = { gtype };
        //         break;
        //       case "wkt":
        //         filter = {
        //           $or: [
        //             { fancyName: { $regex: gtype } },
        //             { fancyName: { $regex: strings[1] } },
        //           ],
        //           gtype: { $ne: "fancy1" },
        //         };
        //         break;
        //       case "ballRun":
        //         filter = { ballByBall: "ballRun" };
        //         break;
        //     }
        //     if (strings.find((str) => str.includes(gtype))) {
        //       filter = { fancyName: { $regex: gtype }, gtype: { $ne: "fancy1" } };
        //     }
        //     const bets = await Bet.find({ matchId, bet_on: BetOn.FANCY }).select({
        //       selectionId: 1,
        //     });
        //     let allBets: any = {};
        //     if (bets.length) {
        //       bets.forEach((bet) => {
        //         allBets[`${bet.selectionId}`] = true;
        //       });
        //     }
        //     let fancy = await Fancy.find({
        //       matchId,
        //       ...filter,
        //     })
        //       .sort({ active: -1 })
        //       .lean();
        //     fancy = fancy
        //       .map((f: any) => {
        //         f.bet = allBets[f.marketId] ? true : false;
        //         return f;
        //       })
        //       .sort((a, b) => b.bet - a.bet);
        //     return this.success(res, fancy);
        //   } catch (e: any) {
        //     return this.fail(res, e);
        //   }
        // };
        this.activeFancies = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId, gtype } = req.query;
                if (!matchId)
                    return this.fail(res, "matchId is required field");
                // Get all selectionIds of fancy bets for this match
                const bets = yield Bet_1.Bet.find({ matchId, bet_on: Bet_1.BetOn.FANCY }).select({ selectionId: 1 });
                const allBets = {};
                bets.forEach(bet => {
                    allBets[`${bet.selectionId}`] = true;
                });
                let fancy;
                if (gtype === "session") {
                    // In case of "session", fetch all types of fancies for the match
                    fancy = yield Fancy_1.Fancy.find({ matchId }).sort({ active: -1 }).lean();
                }
                else {
                    // For other gtypes, filter strictly by gtype
                    fancy = yield Fancy_1.Fancy.find({ matchId, gtype }).sort({ active: -1 }).lean();
                }
                // Mark fancies where user has bets
                fancy = fancy
                    .map((f) => {
                    f.bet = !!allBets[f.marketId];
                    return f;
                })
                    .sort((a, b) => Number(b.bet) - Number(a.bet));
                return this.success(res, fancy);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.suspendFancy = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketId, matchId, type } = req.query;
                const newFancy = yield Fancy_1.Fancy.findOne({
                    marketId: `${marketId}`,
                    matchId,
                });
                if (newFancy && type) {
                    newFancy[type] = !newFancy[type];
                    if (type !== "active")
                        newFancy.GameStatus = newFancy[type] ? "SUSPENDED" : "";
                    newFancy.save();
                }
                console.log(newFancy, type, matchId);
                axios_1.default
                    .post(`${process.env.OD_NODE_URL}fancy-suspend`, {
                    fancy: newFancy,
                    type,
                    matchId,
                })
                    .then((res) => console.log(res.data))
                    .catch((e) => {
                    console.log(e.response.data);
                });
                return this.success(res, newFancy);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.rollbackfancyresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketId, matchId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: "completed",
                            bet_on: Bet_1.BetOn.FANCY,
                            marketId: marketId,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: "$userId",
                            allBets: { $push: "$$ROOT" },
                        },
                    },
                    {
                        $addFields: {
                            allBets: {
                                $map: {
                                    input: "$allBets",
                                    as: "bet",
                                    in: {
                                        $mergeObjects: [
                                            "$$bet",
                                            {
                                                odds: { $toString: "$$bet.odds" },
                                                volume: { $toString: "$$bet.volume" },
                                                stack: { $toString: "$$bet.stack" },
                                                pnl: { $toString: "$$bet.pnl" },
                                                commission: { $toString: "$$bet.commission" },
                                                matchedOdds: { $toString: "$$bet.matchedOdds" },
                                                loss: { $toString: "$$bet.loss" },
                                                profitLoss: { $toString: "$$bet.profitLoss" },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        user_socket_1.default.onRollbackPlaceBet(ItemBetList);
                        yield AccountStatement_1.AccoutStatement.deleteMany({
                            betId: ObjectId(ItemBetList._id),
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    selectionId: marketId,
                    bet_on: Bet_1.BetOn.FANCY,
                }, { $set: { status: "pending" } });
                const unique = [...new Set(userIdList)];
                const processLedgers = () => __awaiter(this, void 0, void 0, function* () {
                    const promises = userbet.flatMap((betGroup) => betGroup.allBets.map((singleBet) => __awaiter(this, void 0, void 0, function* () {
                        const result = yield allledager_1.ledger.deleteMany({ betId: singleBet._id });
                        return { betId: singleBet._id, deletedCount: result.deletedCount };
                    })));
                    const result = yield Promise.all(promises);
                    console.log("Deleted ledgers summary:", result);
                });
                yield processLedgers();
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Fancy_1.Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: "" } });
                return this.success(res, userbet, "");
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.rollbackfancyresultbyapi = ({ marketId, matchId }) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: "completed",
                            bet_on: Bet_1.BetOn.FANCY,
                            marketId: marketId,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: "$userId",
                            allBets: { $push: "$$ROOT" },
                        },
                    },
                    {
                        $addFields: {
                            allBets: {
                                $map: {
                                    input: "$allBets",
                                    as: "bet",
                                    in: {
                                        $mergeObjects: [
                                            "$$bet",
                                            {
                                                odds: { $toString: "$$bet.odds" },
                                                volume: { $toString: "$$bet.volume" },
                                                stack: { $toString: "$$bet.stack" },
                                                pnl: { $toString: "$$bet.pnl" },
                                                commission: { $toString: "$$bet.commission" },
                                                matchedOdds: { $toString: "$$bet.matchedOdds" },
                                                loss: { $toString: "$$bet.loss" },
                                                profitLoss: { $toString: "$$bet.profitLoss" },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        user_socket_1.default.onRollbackPlaceBet(ItemBetList);
                        yield AccountStatement_1.AccoutStatement.deleteMany({
                            betId: ObjectId(ItemBetList._id),
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    selectionId: marketId,
                    bet_on: Bet_1.BetOn.FANCY,
                }, { $set: { status: "pending" } });
                const unique = [...new Set(userIdList)];
                const processLedgers = () => __awaiter(this, void 0, void 0, function* () {
                    const promises = userbet.flatMap((betGroup) => betGroup.allBets.map((singleBet) => __awaiter(this, void 0, void 0, function* () {
                        const result = yield allledager_1.ledger.deleteMany({ betId: singleBet._id });
                        return { betId: singleBet._id, deletedCount: result.deletedCount };
                    })));
                    const result = yield Promise.all(promises);
                    console.log("Deleted ledgers summary:", result);
                });
                yield processLedgers();
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Fancy_1.Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: "" } });
                return true;
            }
            catch (e) {
                return false;
            }
        });
        this.updatefancyresultapi = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                if (data.result != "" && data.message == "ok") {
                    const findFancy = yield Fancy_1.Fancy.findOne({
                        fancyName: data.runnerName,
                        matchId: data.matchId,
                    });
                    if ((findFancy === null || findFancy === void 0 ? void 0 : findFancy._id) && !data.isRollback) {
                        this.declarefancyresultAuto({
                            matchId: findFancy.matchId,
                            marketId: findFancy.marketId,
                            result: data.result,
                        });
                    }
                    else if (findFancy === null || findFancy === void 0 ? void 0 : findFancy._id) {
                        this.rollbackfancyresultbyapi({
                            matchId: findFancy.matchId,
                            marketId: findFancy.marketId,
                        });
                    }
                    return this.success(res, {});
                }
                else {
                    return this.success(res, { message: "result not found" });
                }
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.declarefancyresultAuto = ({ marketId, matchId, result }) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: "pending",
                            bet_on: Bet_1.BetOn.FANCY,
                            marketId: marketId,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: "$userId",
                            allBets: { $push: "$$ROOT" },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let profit_type = "loss";
                        profit_type =
                            ItemBetList.isBack == false &&
                                parseInt(result) < parseInt(ItemBetList.odds)
                                ? "profit"
                                : profit_type;
                        profit_type =
                            ItemBetList.isBack == true &&
                                parseInt(result) >= parseInt(ItemBetList.odds)
                                ? "profit"
                                : profit_type;
                        let profitLossAmt = 0;
                        if (ItemBetList.gtype === "fancy1") {
                            profit_type =
                                ItemBetList.isBack == true && parseInt(result) == 1
                                    ? "profit"
                                    : profit_type;
                            profit_type =
                                ItemBetList.isBack == false && parseInt(result) == 0
                                    ? "profit"
                                    : profit_type;
                        }
                        if (profit_type == "profit") {
                            if (ItemBetList.gtype === "fancy1") {
                                profitLossAmt = ItemBetList.isBack
                                    ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
                                    : ItemBetList.stack;
                            }
                            else {
                                profitLossAmt = ItemBetList.isBack
                                    ? (parseFloat(ItemBetList.volume) *
                                        parseFloat(ItemBetList.stack)) /
                                        100
                                    : ItemBetList.stack;
                            }
                        }
                        else if (profit_type == "loss") {
                            if (ItemBetList.gtype === "fancy1") {
                                profitLossAmt = ItemBetList.isBack
                                    ? -ItemBetList.stack
                                    : -1 *
                                        (ItemBetList.odds * ItemBetList.stack - ItemBetList.stack);
                            }
                            else {
                                profitLossAmt = ItemBetList.isBack
                                    ? -ItemBetList.stack
                                    : -(parseFloat(ItemBetList.volume) *
                                        parseFloat(ItemBetList.stack)) / 100;
                            }
                        }
                        let type_string = ItemBetList.isBack ? "Yes" : "No";
                        if (result == -1) {
                            profitLossAmt = 0;
                        }
                        let narration = ItemBetList.matchName +
                            " / " +
                            ItemBetList.selectionName +
                            " / " +
                            type_string +
                            " / " +
                            (result == -1 ? "Abandoned" : result);
                        yield this.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: profitLossAmt,
                            matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.selectionId,
                            sportId: ItemBetList.sportId,
                        });
                        yield this.cal9xbro(Item._id, profitLossAmt, narration, matchId, ItemBetList._id, Bet_1.BetOn.FANCY);
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                        user_socket_1.default.betDelete({
                            betId: ItemBetList._id,
                            userId: ItemBetList.userId,
                        });
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    selectionId: marketId,
                    bet_on: Bet_1.BetOn.FANCY,
                }, { $set: { status: "completed" } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Fancy_1.Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: result } });
                return true;
            }
            catch (e) {
                return false;
            }
        });
        this.updateUserAccountStatement = (userIds, parentIdList) => __awaiter(this, void 0, void 0, function* () {
            if (userIds.length > 0) {
                const betController = new BetController_1.BetController();
                const json = {};
                const promiseStatment = userIds.map((ItemUserId) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    let exposer = 0;
                    let cexposer = 0;
                    let balancePnl = 0;
                    const blanceData = yield this.updateUserBal(ItemUserId, parentIdList);
                    // if (parentIdList.indexOf(ItemUserId) == -1) {
                    //   exposer = await betController.getexposerfunction(
                    //     { _id: ItemUserId.toString() },
                    //     false,
                    //     json,
                    //   )
                    //   balancePnl = blanceData.pnl_
                    // } else {
                    //   balancePnl = blanceData.pnl_
                    // }
                    if (parentIdList.indexOf(ItemUserId) == -1) {
                        exposer = yield betController.getexposerfunction({ _id: ItemUserId.toString() }, false, json);
                        cexposer = yield betController.getcasinoexposerfunction({ _id: ItemUserId.toString() }, false, json);
                        const result = yield allledager_1.ledger.aggregate([
                            { $match: { ChildId: ItemUserId } },
                            {
                                $group: {
                                    _id: null,
                                    totalCommissionLega: { $sum: "$commissiondega" },
                                },
                            },
                        ]);
                        var totalCommissionLega = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalCommissionLega) || 0;
                        balancePnl = blanceData.pnl_;
                        var blancedata = blanceData.Balance_ + 0;
                        console.log("balance Pnl", blancedata, blanceData.Balance_);
                    }
                    else {
                        balancePnl = blanceData.pnl_;
                        blancedata = blanceData.Balance_;
                    }
                    let totalexp = blancedata - exposer - cexposer;
                    const data = yield Balance_1.Balance.findOneAndUpdate({ userId: ItemUserId }, {
                        balance: blancedata,
                        exposer: exposer,
                        profitLoss: balancePnl,
                        commision: totalCommissionLega,
                    }, { new: true, upsert: true });
                    console.log(data, "blacnedata", totalCommissionLega);
                    user_socket_1.default.setExposer({
                        // balance: blanceData.Balance_,
                        balance: blancedata,
                        exposer: exposer,
                        userId: ItemUserId,
                        commision: totalCommissionLega,
                    });
                }));
                yield Promise.all(promiseStatment);
            }
        });
        this.updateUserAccountStatementCasino = (userIds, parentIdList) => __awaiter(this, void 0, void 0, function* () {
            if (userIds.length > 0) {
                console.log("hello world inside ");
                const betController = new BetController_1.BetController();
                const json = {};
                const promiseStatment = userIds.map((ItemUserId) => __awaiter(this, void 0, void 0, function* () {
                    var _b;
                    let exposer = 0;
                    let mexposer = 0;
                    let balancePnl = 0;
                    let blancedata = 0;
                    const blanceData = yield this.updateUserBal(ItemUserId, parentIdList);
                    if (parentIdList.indexOf(ItemUserId) == -1) {
                        exposer = yield betController.getcasinoexposerfunction({ _id: ItemUserId.toString() }, false, json);
                        mexposer = yield betController.getexposerfunction({ _id: ItemUserId.toString() }, false, json);
                        var result = yield allledager_1.ledger.aggregate([
                            { $match: { ChildId: ItemUserId } },
                            {
                                $group: {
                                    _id: null,
                                    totalCommissionLega: { $sum: "$commissiondega" },
                                },
                            },
                        ]);
                        var totalCommissionLega = ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.totalCommissionLega) || 0;
                        balancePnl = blanceData.pnl_;
                        blancedata = blanceData.Balance_ + 0;
                        var totalexpr = blancedata - exposer - mexposer;
                        console.log("balance Pnl", blancedata, blanceData.Balance_);
                        var updateUserBal = yield Balance_1.Balance.findOneAndUpdate({ userId: ItemUserId }, {
                            balance: blancedata,
                            casinoexposer: exposer,
                            profitLoss: balancePnl,
                            commision: totalCommissionLega,
                        }, { new: true, upsert: true });
                        console.log(updateUserBal, "upodate");
                    }
                    else {
                        balancePnl = blanceData.pnl_;
                        blancedata = blanceData.Balance_;
                        console.log(blancedata, "in the elso i want");
                    }
                    console.log("blance is here ", typeof blancedata, blancedata);
                    // var updateUserBal = await Balance.findOneAndUpdate(
                    //   { userId: ItemUserId },
                    //   {
                    //     balance: blancedata,
                    //     casinoexposer: exposer,
                    //     profitLoss: balancePnl,
                    //   },
                    //   { new: true, upsert: true }
                    // );
                    console.log(updateUserBal, "update userrer bala");
                    // { balance: blanceData.Balance_ , casinoexposer: exposer, profitLoss: balancePnl },
                    user_socket_1.default.setExposer({
                        balance: blancedata,
                        exposer: exposer + +(updateUserBal === null || updateUserBal === void 0 ? void 0 : updateUserBal.exposer),
                        userId: ItemUserId,
                        commision: totalCommissionLega,
                    });
                }));
                yield Promise.all(promiseStatment);
            }
        });
        this.declarefancyresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketId, matchId, result } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: "pending",
                            bet_on: Bet_1.BetOn.FANCY,
                            marketId: marketId,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: "$userId",
                            allBets: { $push: "$$ROOT" },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let profit_type = "loss";
                        profit_type =
                            ItemBetList.isBack == false &&
                                parseInt(result) < parseInt(ItemBetList.odds)
                                ? "profit"
                                : profit_type;
                        profit_type =
                            ItemBetList.isBack == true &&
                                parseInt(result) >= parseInt(ItemBetList.odds)
                                ? "profit"
                                : profit_type;
                        let profitLossAmt = 0;
                        if (ItemBetList.gtype === "fancy1") {
                            profit_type =
                                ItemBetList.isBack == true && parseInt(result) == 1
                                    ? "profit"
                                    : profit_type;
                            profit_type =
                                ItemBetList.isBack == false && parseInt(result) == 0
                                    ? "profit"
                                    : profit_type;
                        }
                        if (profit_type == "profit") {
                            if (ItemBetList.gtype === "fancy1") {
                                profitLossAmt = ItemBetList.isBack
                                    ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
                                    : ItemBetList.stack;
                            }
                            else {
                                profitLossAmt = ItemBetList.isBack
                                    ? (parseFloat(ItemBetList.volume) *
                                        parseFloat(ItemBetList.stack)) /
                                        100
                                    : ItemBetList.stack;
                            }
                        }
                        else if (profit_type == "loss") {
                            if (ItemBetList.gtype === "fancy1") {
                                profitLossAmt = ItemBetList.isBack
                                    ? -ItemBetList.stack
                                    : -1 *
                                        (ItemBetList.odds * ItemBetList.stack - ItemBetList.stack);
                            }
                            else {
                                profitLossAmt = ItemBetList.isBack
                                    ? -ItemBetList.stack
                                    : -(parseFloat(ItemBetList.volume) *
                                        parseFloat(ItemBetList.stack)) / 100;
                            }
                        }
                        let type_string = ItemBetList.isBack ? "Yes" : "No";
                        if (result == -1) {
                            profitLossAmt = 0;
                        }
                        let narration = ItemBetList.matchName +
                            " / " +
                            ItemBetList.selectionName +
                            " / " +
                            type_string +
                            " / " +
                            (result == -1 ? "Abandoned" : result);
                        yield this.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: profitLossAmt,
                            matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.selectionId,
                            sportId: ItemBetList.sportId,
                        });
                        yield this.cal9xbro(Item._id, profitLossAmt, narration, matchId, ItemBetList._id, Bet_1.BetOn.FANCY);
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                        user_socket_1.default.betDelete({
                            betId: ItemBetList._id,
                            userId: ItemBetList.userId,
                        });
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    selectionId: marketId,
                    bet_on: Bet_1.BetOn.FANCY,
                    status: "pending",
                }, { $set: { status: "completed" } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Fancy_1.Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: result } });
                return this.success(res, userbet, "");
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.setT10FancyResult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const pendingFanciesMatchs = yield Fancy_1.Fancy.aggregate([
                { $match: { status: { $eq: undefined } } },
                { $group: { _id: "$matchId" } },
                { $project: { matchId: 1 } },
            ]);
            pendingFanciesMatchs.map((item) => {
                axios_1.default
                    .get(`${process.env.SUPER_NODE_URL}api/get-t10-fancy-result?matchId=${item._id}`)
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    yield new FancyController().declarefancyresultauto(response.data);
                }))
                    .catch((e) => console.log(e.message));
            });
            return this.success(res, {});
        });
        this.declarefancyresultauto = ({ marketIdList, matchId, }) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pendingFancies = yield Fancy_1.Fancy.find({ status: { $eq: undefined }, matchId: matchId }, { marketId: 1 });
                const finalArray = pendingFancies.map((ItemPending) => ItemPending.marketId);
                const declareResultList = marketIdList.filter((ItemSet) => finalArray.indexOf(ItemSet.marketId) > -1);
                const dataPromise = declareResultList.map((ItemResult) => __awaiter(this, void 0, void 0, function* () {
                    const { marketId, result } = ItemResult;
                    const userbet = yield Bet_1.Bet.aggregate([
                        {
                            $match: {
                                status: "pending",
                                bet_on: Bet_1.BetOn.FANCY,
                                marketId: marketId,
                                matchId: parseInt(matchId),
                            },
                        },
                        {
                            $group: {
                                _id: "$userId",
                                allBets: { $push: "$$ROOT" },
                            },
                        },
                    ]);
                    let userIdList = [];
                    const parentIdList = [];
                    const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                        let allbets = Item.allBets;
                        const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                            let profit_type = "loss";
                            profit_type =
                                ItemBetList.isBack == false &&
                                    parseInt(result) < parseInt(ItemBetList.odds)
                                    ? "profit"
                                    : profit_type;
                            profit_type =
                                ItemBetList.isBack == true &&
                                    parseInt(result) >= parseInt(ItemBetList.odds)
                                    ? "profit"
                                    : profit_type;
                            let profitLossAmt = 0;
                            if (ItemBetList.gtype === "fancy1") {
                                profit_type =
                                    ItemBetList.isBack == true && parseInt(result) == 1
                                        ? "profit"
                                        : profit_type;
                                profit_type =
                                    ItemBetList.isBack == false && parseInt(result) == 0
                                        ? "profit"
                                        : profit_type;
                            }
                            if (profit_type == "profit") {
                                if (ItemBetList.gtype === "fancy1") {
                                    profitLossAmt = ItemBetList.isBack
                                        ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
                                        : ItemBetList.stack;
                                }
                                else {
                                    profitLossAmt = ItemBetList.isBack
                                        ? (parseFloat(ItemBetList.volume) *
                                            parseFloat(ItemBetList.stack)) /
                                            100
                                        : ItemBetList.stack;
                                }
                            }
                            else if (profit_type == "loss") {
                                if (ItemBetList.gtype === "fancy1") {
                                    profitLossAmt = ItemBetList.isBack
                                        ? -ItemBetList.stack
                                        : -1 *
                                            (ItemBetList.odds * ItemBetList.stack -
                                                ItemBetList.stack);
                                }
                                else {
                                    profitLossAmt = ItemBetList.isBack
                                        ? -ItemBetList.stack
                                        : -(parseFloat(ItemBetList.volume) *
                                            parseFloat(ItemBetList.stack)) / 100;
                                }
                            }
                            let type_string = ItemBetList.isBack ? "Yes" : "No";
                            let narration = ItemBetList.matchName +
                                " / " +
                                ItemBetList.selectionName +
                                " / " +
                                type_string +
                                " / " +
                                result;
                            yield this.addprofitlosstouser({
                                userId: ObjectId(Item._id),
                                bet_id: ObjectId(ItemBetList._id),
                                profit_loss: profitLossAmt,
                                matchId,
                                narration,
                                sportsType: ItemBetList.sportId,
                                selectionId: ItemBetList.selectionId,
                                sportId: ItemBetList.sportId,
                            });
                            if (indexBetList == 0) {
                                ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                    parentIdList.push(ItemParentStr.parent);
                                    userIdList.push(ObjectId(ItemParentStr.parent));
                                });
                            }
                            user_socket_1.default.betDelete({
                                betId: ItemBetList._id,
                                userId: ItemBetList.userId,
                            });
                        }));
                        yield Promise.all(settle_single);
                        userIdList.push(ObjectId(Item._id));
                    }));
                    yield Promise.all(declare_result);
                    yield Bet_1.Bet.updateMany({
                        userId: { $in: userIdList },
                        matchId: matchId,
                        selectionId: marketId,
                        bet_on: Bet_1.BetOn.FANCY,
                    }, { $set: { status: "completed" } });
                    const unique = [...new Set(userIdList)];
                    if (unique.length > 0) {
                        yield this.updateUserAccountStatement(unique, parentIdList);
                    }
                    yield Fancy_1.Fancy.updateOne({ matchId: parseInt(matchId), marketId: marketId }, { $set: { result: result, status: "completed" } });
                }));
                yield Promise.all(dataPromise);
                return true;
            }
            catch (e) {
                return false;
            }
        });
        this.updateUserBal = (userId, parentIdList) => __awaiter(this, void 0, void 0, function* () {
            const ac = yield AccountStatement_1.AccoutStatement.aggregate([
                { $match: { userId: mongoose_1.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$amount" },
                    },
                },
            ]);
            const parent = yield User_1.User.findOne({
                parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(userId) } },
                role: Role_1.RoleType.user,
            }, { _id: 1 })
                .distinct("_id")
                .lean();
            if (parentIdList.indexOf(userId) == -1) {
                parent.push(userId);
            }
            const pnl = yield AccountStatement_1.AccoutStatement.aggregate([
                { $match: { userId: { $in: parent }, betId: { $ne: null } } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$amount" },
                    },
                },
            ]);
            const withdrawlsum = yield AccountStatement_1.AccoutStatement.aggregate([
                {
                    $match: {
                        userId: mongoose_1.Types.ObjectId(userId),
                        betId: { $eq: null },
                        txnId: { $eq: null },
                        txnType: UserChip_1.TxnType.dr,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$amount" },
                    },
                },
            ]);
            const depositesum = yield AccountStatement_1.AccoutStatement.aggregate([
                {
                    $match: {
                        userId: mongoose_1.Types.ObjectId(userId),
                        betId: { $eq: null },
                        txnId: { $ne: null },
                        txnType: UserChip_1.TxnType.cr,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$amount" },
                    },
                },
            ]);
            const userCr = yield User_1.User.findOne({ _id: ObjectId(userId) }).select({
                creditRefrences: 1,
            });
            const withdAmt = withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0;
            const depositeAmt = depositesum && depositesum.length > 0 ? depositesum[0].totalAmount : 0;
            const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0;
            console.log(Balance_, "Blance GHJKGHJKLVJK");
            const pnl_ = pnl && pnl.length > 0
                ? pnl[0].totalAmount +
                    withdAmt +
                    depositeAmt -
                    (userCr && userCr.creditRefrences
                        ? parseInt(userCr.creditRefrences)
                        : 0)
                : withdAmt +
                    depositeAmt -
                    (userCr && userCr.creditRefrences
                        ? parseInt(userCr.creditRefrences)
                        : 0);
            ////const bal = await Balance.findOne({ userId: userId }).select({ profitLoss: 1 })
            //// const pnl_ = bal?.profitLoss ? bal?.profitLoss : 0
            return { Balance_, pnl_ };
        });
        this.declarematchresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { selectionId, matchId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: "pending",
                            bet_on: Bet_1.BetOn.MATCH_ODDS,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: "$userId",
                            allBets: { $push: "$$ROOT" },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let profit_type = "loss";
                        if (parseInt(selectionId) == ItemBetList.selectionId) {
                            profit_type = ItemBetList.isBack == true ? "profit" : profit_type;
                        }
                        else {
                            profit_type = ItemBetList.isBack == true ? profit_type : "profit";
                        }
                        let profitLossAmt = 0;
                        if (ItemBetList.isBack) {
                            if (profit_type == "profit") {
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString());
                            }
                            else if (profit_type == "loss") {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        else {
                            if (profit_type == "profit") {
                                profitLossAmt = ItemBetList.stack;
                            }
                            else if (profit_type == "loss") {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        let type_string = ItemBetList.isBack ? "Back" : "Lay";
                        let narration = ItemBetList.matchName +
                            " / " +
                            ItemBetList.selectionName +
                            " / " +
                            type_string +
                            " / " +
                            selectionId;
                        yield this.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: profitLossAmt,
                            matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.selectionId,
                            sportId: ItemBetList.sportId,
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                }, { $set: { status: "completed" } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    // const ObjectId = require("mongoose").Types.ObjectId;
                    const userProfits = yield Promise.all(unique.map((userId) => __awaiter(this, void 0, void 0, function* () {
                        var _c, _d, _e;
                        const bets = yield Bet_1.Bet.find({
                            userId: ObjectId(userId),
                            status: "completed",
                            matchId: matchId,
                            bet_on: Bet_1.BetOn.MATCH_ODDS
                        });
                        // return {
                        //   userId,
                        //   totalProfitLoss
                        // };
                        if (bets.length > 0) {
                            const totalProfitLoss = yield bets.reduce((sum, bet) => sum + bet.profitLoss, 0);
                            yield this.cal9xbro(userId, totalProfitLoss, ((_c = bets === null || bets === void 0 ? void 0 : bets[0]) === null || _c === void 0 ? void 0 : _c.marketId.toString()) + ((_d = bets === null || bets === void 0 ? void 0 : bets[0]) === null || _d === void 0 ? void 0 : _d.marketName), matchId, (_e = bets[0]) === null || _e === void 0 ? void 0 : _e._id, Bet_1.BetOn.MATCH_ODDS);
                        }
                    })));
                    // Optional: log or use the result
                    console.log(userProfits);
                    // Continue with your logic
                }
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Match_1.Match.updateOne({ matchId: parseInt(matchId) }, { $set: { result_delare: true, result: selectionId } });
                return this.success(res, userbet, "");
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.declaremarketresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { selectionId, matchId, marketId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: "pending",
                            bet_on: Bet_1.BetOn.MATCH_ODDS,
                            matchId: parseInt(matchId),
                            marketId: marketId,
                        },
                    },
                    {
                        $group: {
                            _id: "$userId",
                            allBets: { $push: "$$ROOT" },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let profit_type = "loss";
                        if (parseInt(selectionId) == ItemBetList.selectionId) {
                            profit_type = ItemBetList.isBack == true ? "profit" : profit_type;
                        }
                        else {
                            profit_type = ItemBetList.isBack == true ? profit_type : "profit";
                        }
                        let profitLossAmt = 0;
                        if (ItemBetList.isBack) {
                            if (profit_type == "profit") {
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString());
                            }
                            else if (profit_type == "loss") {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        else {
                            if (profit_type == "profit") {
                                profitLossAmt = ItemBetList.stack;
                            }
                            else if (profit_type == "loss") {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        if (selectionId == -1) {
                            profitLossAmt = 0;
                        }
                        let type_string = ItemBetList.isBack ? "Back" : "Lay";
                        let narration = ItemBetList.matchName +
                            " / " +
                            ItemBetList.selectionName +
                            " / " +
                            type_string +
                            " / " +
                            (selectionId == -1 ? "Abandoned" : selectionId);
                        yield this.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: profitLossAmt,
                            matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.selectionId,
                            sportId: ItemBetList.sportId,
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                    marketId: marketId,
                }, { $set: { status: "completed" } });
                // const unique = [...new Set(userIdList)];
                const unique = [...new Set(userIdList.map(id => id.toString()))].map(id => ObjectId(id));
                if (unique.length > 0) {
                    // const ObjectId = require("mongoose").Types.ObjectId;
                    const userProfits = yield Promise.all(unique.map((userId) => __awaiter(this, void 0, void 0, function* () {
                        var _f, _g;
                        const bets = yield Bet_1.Bet.find({
                            userId: ObjectId(userId),
                            status: "completed",
                            marketId: marketId,
                            bet_on: Bet_1.BetOn.MATCH_ODDS
                        });
                        const totalProfitLoss = bets.reduce((sum, bet) => sum + bet.profitLoss, 0);
                        // return {
                        //   userId,
                        //   totalProfitLoss
                        // };
                        if (bets.length > 0) {
                            yield this.cal9xbro(userId, totalProfitLoss, ((_f = bets === null || bets === void 0 ? void 0 : bets[0]) === null || _f === void 0 ? void 0 : _f.marketId) + ((_g = bets === null || bets === void 0 ? void 0 : bets[0]) === null || _g === void 0 ? void 0 : _g.marketName), matchId, bets[0]._id, Bet_1.BetOn.MATCH_ODDS);
                        }
                    })));
                    // Optional: log or use the result
                    console.log(userProfits);
                    // Continue with your logic
                }
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Match_1.Match.updateOne({ matchId: parseInt(matchId) }, { $set: { result_delare: true, result: selectionId } });
                yield Market_1.Market.updateOne({ marketId: marketId, matchId: parseInt(matchId) }, { $set: { resultDelcare: "yes", result: selectionId } });
                return this.success(res, userbet, "");
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.declaremarketresultAuto = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { selectionId, matchId, marketId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: "pending",
                            bet_on: Bet_1.BetOn.MATCH_ODDS,
                            matchId: parseInt(matchId),
                            marketId: marketId,
                        },
                    },
                    {
                        $group: {
                            _id: "$userId",
                            allBets: { $push: "$$ROOT" },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let profit_type = "loss";
                        if (parseInt(selectionId) == ItemBetList.selectionId) {
                            profit_type = ItemBetList.isBack == true ? "profit" : profit_type;
                        }
                        else {
                            profit_type = ItemBetList.isBack == true ? profit_type : "profit";
                        }
                        let profitLossAmt = 0;
                        if (ItemBetList.isBack) {
                            if (profit_type == "profit") {
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString());
                            }
                            else if (profit_type == "loss") {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        else {
                            if (profit_type == "profit") {
                                profitLossAmt = ItemBetList.stack;
                            }
                            else if (profit_type == "loss") {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        if (selectionId == -1) {
                            profitLossAmt = 0;
                        }
                        let type_string = ItemBetList.isBack ? "Back" : "Lay";
                        let narration = ItemBetList.matchName +
                            " / " +
                            ItemBetList.selectionName +
                            " / " +
                            type_string +
                            " / " +
                            (selectionId == -1 ? "Abandoned" : selectionId);
                        yield this.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: profitLossAmt,
                            matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.selectionId,
                            sportId: ItemBetList.sportId,
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                        user_socket_1.default.betDelete({
                            betId: ItemBetList._id,
                            userId: ItemBetList.userId,
                        });
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                    marketId: marketId,
                }, { $set: { status: "completed" } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    // const ObjectId = require("mongoose").Types.ObjectId;
                    const userProfits = yield Promise.all(unique.map((userId) => __awaiter(this, void 0, void 0, function* () {
                        var _h, _j, _k;
                        const bets = yield Bet_1.Bet.find({
                            userId: ObjectId(userId),
                            status: "completed",
                            matchId: matchId,
                            bet_on: Bet_1.BetOn.MATCH_ODDS
                        });
                        const totalProfitLoss = bets.reduce((sum, bet) => sum + bet.profitLoss, 0);
                        // return {
                        //   userId,
                        //   totalProfitLoss
                        // };
                        if (bets.length > 0) {
                            yield this.cal9xbro(userId, totalProfitLoss, ((_h = bets === null || bets === void 0 ? void 0 : bets[0]) === null || _h === void 0 ? void 0 : _h.marketId) + ((_j = bets === null || bets === void 0 ? void 0 : bets[0]) === null || _j === void 0 ? void 0 : _j.marketName), matchId, (_k = bets[0]) === null || _k === void 0 ? void 0 : _k._id, Bet_1.BetOn.MATCH_ODDS);
                        }
                    })));
                    // Optional: log or use the result
                    console.log(userProfits);
                    // Continue with your logic
                }
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Market_1.Market.updateOne({ marketId: marketId }, { $set: { resultDelcare: "yes", result: selectionId, isActive: false } });
                return this.success(res, userbet, "");
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.rollbackmarketresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: "completed",
                            bet_on: Bet_1.BetOn.MATCH_ODDS,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: "$userId",
                            allBets: { $push: "$$ROOT" },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        yield AccountStatement_1.AccoutStatement.deleteMany({
                            betId: ObjectId(ItemBetList._id),
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                }, { $set: { status: "pending" } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Match_1.Match.updateOne({ matchId: parseInt(matchId) }, { $set: { result_delare: false, result: "" } });
                yield Market_1.Market.updateOne({ matchId: parseInt(matchId) }, { $set: { resultDelcare: "no" } });
                return this.success(res, userbet, "");
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        // market wise karna h
        this.rollbackmarketwiseresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId, marketId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: "completed",
                            bet_on: Bet_1.BetOn.MATCH_ODDS,
                            matchId: parseInt(matchId),
                            marketId: marketId,
                        },
                    },
                    {
                        $group: {
                            _id: "$userId",
                            allBets: { $push: "$$ROOT" },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        yield AccountStatement_1.AccoutStatement.deleteMany({
                            betId: ObjectId(ItemBetList._id),
                        });
                        yield AccountStatement_1.AccoutStatement.deleteMany({ userId: ItemBetList.userId, matchId, iscom: true });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                    marketId: marketId,
                }, { $set: { status: "pending" } });
                yield allledager_1.ledger.deleteMany({
                    $and: [{ Fancy: false }, { matchId }]
                });
                // await AccoutStatement.deleteMany({})
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Market_1.Market.updateOne({ marketId: marketId, matchId: parseInt(matchId) }, { $set: { resultDelcare: "no" } });
                return this.success(res, userbet, "");
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.addprofitlosstouser = ({ userId, bet_id, profit_loss, matchId, narration, sportsType, selectionId, sportId, }) => __awaiter(this, void 0, void 0, function* () {
            var _l, _m, _o, _p;
            const user = yield User_1.User.findOne({ _id: userId });
            const user_parent = yield User_1.User.findOne({ _id: user === null || user === void 0 ? void 0 : user.parentId });
            const parent_ratio = sportId == 5000
                ? (_m = (_l = user_parent === null || user_parent === void 0 ? void 0 : user_parent.partnership) === null || _l === void 0 ? void 0 : _l[4]) === null || _m === void 0 ? void 0 : _m.allRatio
                : (_p = (_o = user_parent === null || user_parent === void 0 ? void 0 : user_parent.partnership) === null || _o === void 0 ? void 0 : _o[sportsType]) === null || _p === void 0 ? void 0 : _p.allRatio;
            let scommision = 0;
            const betdata = yield Bet_1.Bet.findOne({ _id: bet_id });
            if (betdata && betdata.bet_on == "FANCY") {
                const userdata = yield User_1.User.findOne({ _id: userId });
                scommision = betdata.stack * (userdata.scom / 100);
            }
            const reference_id = yield this.sendcreditdebit(userId, narration, profit_loss, matchId, bet_id, selectionId, sportId, scommision);
            const updateplToBet = yield Bet_1.Bet.updateOne({ _id: bet_id }, { $set: { profitLoss: profit_loss } });
            if (parent_ratio && parent_ratio.length > 0) {
                const accountforparent = parent_ratio.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let pl = (Math.abs(profit_loss) * Item.ratio) / 100;
                    const final_amount = profit_loss > 0 ? -pl : pl;
                    yield this.sendcreditdebit(Item.parent, narration, final_amount, matchId, bet_id, selectionId, sportId, 0);
                }));
                yield Promise.all(accountforparent);
            }
        });
        this.sendcreditdebit = (userId, narration, profit_loss, matchId, betId, selectionId, sportId, scommision) => __awaiter(this, void 0, void 0, function* () {
            const getAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: userId })
                .sort({ createdAt: -1 })
                .lean();
            // let scommision = 0;
            const getOpenBal = (getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt.closeBal) ? getAccStmt.closeBal : 0;
            const userAccountData = {
                userId,
                narration: narration,
                amount: profit_loss + scommision,
                type: AccountStatement_1.ChipsType.pnl,
                txnType: profit_loss + scommision > 0 ? UserChip_1.TxnType.cr : UserChip_1.TxnType.dr,
                openBal: getOpenBal,
                closeBal: getOpenBal + +profit_loss + scommision,
                matchId: matchId,
                betId: betId,
                selectionId,
                sportId,
            };
            const entryCheck = yield AccountStatement_1.AccoutStatement.findOne({
                txnType: profit_loss > 0 ? UserChip_1.TxnType.cr : UserChip_1.TxnType.dr,
                betId: betId,
                userId: userId,
            });
            if (!entryCheck) {
                const newUserAccStmt = new AccountStatement_1.AccoutStatement(userAccountData);
                yield newUserAccStmt.save();
                if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
                    return newUserAccStmt._id;
                }
                else {
                    return null;
                }
            }
            else {
                return entryCheck._id;
            }
        });
        this.updateaccountstatement = (userId, betid) => __awaiter(this, void 0, void 0, function* () { });
        this.apiupdateUserBal = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.body;
            const userInfo = yield User_1.User.findOne({ _id: ObjectId(userId) });
            const ac = yield AccountStatement_1.AccoutStatement.aggregate([
                { $match: { userId: mongoose_1.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$amount" },
                    },
                },
            ]);
            const parent = yield User_1.User.findOne({
                parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(userId) } },
                role: Role_1.RoleType.user,
            }, { _id: 1 })
                .distinct("_id")
                .lean();
            if ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) == Role_1.RoleType.user) {
                parent.push(ObjectId(userId));
            }
            const pnl = yield AccountStatement_1.AccoutStatement.aggregate([
                { $match: { userId: { $in: parent }, betId: { $ne: null } } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$amount" },
                    },
                },
            ]);
            const withdrawlsum = yield AccountStatement_1.AccoutStatement.aggregate([
                {
                    $match: {
                        userId: mongoose_1.Types.ObjectId(userId),
                        betId: { $eq: null },
                        txnId: { $eq: null },
                        txnType: UserChip_1.TxnType.dr,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$amount" },
                    },
                },
            ]);
            const depositesum = yield AccountStatement_1.AccoutStatement.aggregate([
                {
                    $match: {
                        userId: mongoose_1.Types.ObjectId(userId),
                        betId: { $eq: null },
                        txnId: { $ne: null },
                        txnType: UserChip_1.TxnType.cr,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$amount" },
                    },
                },
            ]);
            const userCr = yield User_1.User.findOne({ _id: ObjectId(userId) }).select({
                creditRefrences: 1,
            });
            const withdAmt = withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0;
            const depositeAmt = depositesum && depositesum.length > 0 ? depositesum[0].totalAmount : 0;
            const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0;
            const pnl_ = pnl && pnl.length > 0
                ? pnl[0].totalAmount +
                    withdAmt +
                    depositeAmt -
                    (userCr && userCr.creditRefrences
                        ? parseInt(userCr.creditRefrences)
                        : 0)
                : 0;
            ////const bal = await Balance.findOne({ userId: userId }).select({ profitLoss: 1 })
            //// const pnl_ = bal?.profitLoss ? bal?.profitLoss : 0
            return this.success(res, { Balance_, pnl_, depositesum, withdrawlsum, pnl }, "");
        });
        this.getCasPlayUrl = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { lobby_url, isMobile, ipAddress } = req.body;
            const userInfo = req.user;
            const gameInfo = yield CasCasino_1.CasCasino.findOne({
                game_identifier: lobby_url,
            });
            if (gameInfo) {
                const payload = {
                    user: userInfo.username,
                    token: "NOt_AVIALBEL",
                    partner_id: "NOt_AVIALBEL",
                    platform: isMobile ? "GPL_MOBILE" : "GPL_DESKTOP",
                    lobby_url: lobby_url,
                    lang: "en",
                    ip: ipAddress,
                    game_id: lobby_url,
                    game_code: lobby_url,
                    currency: "INR",
                    id: userInfo._id,
                    balance: "0.00",
                };
                console.log(JSON.stringify(payload));
                return axios_1.default.post("PROVIDER_URL", payload).then((resData) => {
                    var _a;
                    const data = resData === null || resData === void 0 ? void 0 : resData.data;
                    if ((data === null || data === void 0 ? void 0 : data.message) != "failed") {
                        this.success(res, { gameInfo: gameInfo, payload: payload, url: (_a = resData === null || resData === void 0 ? void 0 : resData.data) === null || _a === void 0 ? void 0 : _a.url }, "Data Found");
                    }
                    else {
                        this.fail(res, "Game Not Found");
                    }
                });
            }
            else {
                this.fail(res, "Game Not Found");
            }
        });
        this.commissionreset = (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.body, "chekkrestevbnmm");
            const { name } = req.body;
            if (!name) {
                return res.json({ msg: "Don't Get User Id", status: false });
            }
            try {
                const result = yield allledager_1.ledger.updateMany({ username: name }, { $set: { iscomSet: true } });
                return res.json({ msg: "Commission reset successfully", status: true });
            }
            catch (error) {
                console.error("Error resetting commissions:", error);
                return res
                    .status(500)
                    .json({ msg: "Internal Server Error", status: false });
            }
        });
    }
    //9xledger calculation
    //   async cal9xbro(userId,bet_id,profit_loss,matchId,narration,selectionId,sportId){
    //     try {
    //       let betdata = await Bet.findOne({_id:bet_id})
    //       let betstatus = betdata.bet_on =="FANCY"? true:false
    //       console.log("bet data",bet_id)
    //             console.log("hhello world hahahahahahhahahhah insidecal9xbro")
    //                 const bId = await ledger.find({betId:bet_id})
    //                 if(bId.length>0){
    //                   console.log("hello world")
    //                   return  "hello world"
    //                 }
    //                 else{
    //                 try {
    //                   let mainledgerBalance:number = 0;
    //                     // Fetch the current ledger balance
    //                     const ledgerData:any = await ledger.findOne({ ChildId: userId });
    //                     const userData = await User.findOne({_id:userId})
    //                     let p1info = await User.findOne({_id:userData.parentId})
    //                     if(p1info?.parentId){
    //                     let partnresip =  p1info.partnership;
    //                     // console.log(partnresip,"hello world for this partnership")
    //                     const currentBalance:any = ledgerData ? ledgerData.money : 0;
    //                     let multix;
    //                     if(betdata.bet_on == "CASINO" || betdata.bet_on=="MATCH_ODDS"){
    //                       multix = partnresip["1"]["ownRatio"]
    //                     }
    //                     else{
    //                       multix = partnresip["2"]["ownRatio"]
    //                     }
    //                      let fammount = -(profit_loss)
    //                     let commissionlegaf = profit_loss > 0 && ! betstatus ?  0:(betdata.stack* multix)/100
    //                     let commissiondegaf= 0;
    //                     const updatedLedgerp = await ledger.create(
    //                       {    ChildId: userId ,
    //                             ParentId: userData?.parentId,
    //                             money: fammount,
    //                             username :userData?.username,
    //                             commissionlega:commissionlegaf,
    //                             commissiondega:commissiondegaf,
    //                             narration,
    //                             betId:bet_id,
    //                             Fancy:betstatus,
    //                             updown :fammount,
    //                     },)
    //                     let multi;
    //                     if(betdata.bet_on == "CASINO" || betdata.bet_on=="MATCH_ODDS"){
    //                       multi = partnresip["1"]["ownRatio"]
    //                     }
    //                     else{
    //                       multi = partnresip["2"]["ownRatio"]
    //                     }
    //                     const ledgerDatap1:any = await ledger.findOne({ ChildId: p1info._id });
    //                     const currentBalancep1:any = ledgerDatap1 ? ledgerDatap1.money : 0;
    //                     let ammount = profit_loss > 0 && ! betstatus ? -(profit_loss) : -(profit_loss) // profit_loss - betdata.stack*multi
    //                     let commissionlega = profit_loss > 0 && ! betstatus ?  0:(betdata.stack* multi)/100
    //                     let commissiondega = 0;
    //                     let finalammount = ammount - commissiondega - ammount*(p1info?.share)/100;
    //                     console.log(finalammount,"finalammount herer")
    //                     console.log(finalammount,"finalammount herer")
    //                     console.log(finalammount,"finalammount herer")
    //                     console.log(finalammount,"finalammount herer")
    //                     console.log(finalammount,"finalammount herer")
    //                     mainledgerBalance = finalammount;
    //                     let updown = mainledgerBalance*(p1info?.share)/100
    //                     // let commissionlega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*lmulti)/100
    //                     // let commissiondega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*dmulti)/100
    //                     const updatedLedger = await ledger.create(
    //                       {    ChildId: userData.parentId ,
    //                             ParentId: p1info?.parentId,
    //                             money: finalammount,
    //                             username :p1info.username,
    //                             commissionlega,
    //                             commissiondega,
    //                             narration,
    //                             betId:bet_id,
    //                             Fancy:betstatus,
    //                             updown,
    //                     },  // Add to current balance
    //                   );
    //                     }
    //                     let p2info = await User.findOne({_id:p1info?.parentId})
    //                     if(p2info?.parentId){
    //                       let partnresip =  p2info.partnership;
    //                       let lmulti,dmulti;
    //                       if(betdata.bet_on == "CASINO" || betdata.bet_on=="MATCH_ODDS"){
    //                         lmulti = partnresip["1"]["ownRatio"];
    //                         dmulti =p1info?.partnership["1"]["ownRatio"]
    //                       }
    //                       else{
    //                         lmulti = partnresip["2"]["ownRatio"]
    //                         dmulti =p1info?.partnership["2"]["ownRatio"]
    //                       }
    //                       const ledgerDatap2:any = await ledger.findOne({ ChildId: p2info._id });
    //                       const currentBalancep2:any = ledgerDatap2 ? ledgerDatap2.money : 0;
    //                       let ammoun = - (profit_loss) - (betdata.stack*dmulti)/100
    //                       let ammount = profit_loss > 0 && ! betstatus ? -(profit_loss) : ammoun // profit_loss - betdata.stack*multi
    //                       let commissionlega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*lmulti)/100
    //                       let commissiondega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*dmulti)/100
    //                       let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p2info?.share)/100;
    //                       let updown = mainledgerBalance*(p2info?.share)/100
    //                        mainledgerBalance = finalammount;
    //                        console.log(finalammount,"finalammount herer")
    //                     console.log(finalammount,"finalammount herer")
    //                     console.log(finalammount,"finalammount herer")
    //                     console.log(finalammount,"finalammount herer")
    //                     console.log(finalammount,"finalammount herer")
    //                       const updatedLedger = await ledger.create(
    //                         { ChildId: p1info?.parentId ,
    //                               ParentId: p2info?.parentId,
    //                               money: finalammount,
    //                               username :p2info.username,
    //                               commissiondega,
    //                               commissionlega,
    //                               narration,
    //                               betId:bet_id,
    //                               Fancy:betstatus,
    //                               updown,
    //                           }
    //                     );
    //                       }
    //                       let p3info = await User.findOne({_id:p2info?.parentId})
    //                     if(p3info?.parentId){
    //                       let partnresip =  p3info.partnership;
    //                       let lmulti,dmulti;
    //                       if(betdata.bet_on == "CASINO" || betdata.bet_on=="MATCH_ODDS"){
    //                         lmulti = partnresip["1"]["ownRatio"];
    //                         dmulti =p2info?.partnership["1"]["ownRatio"]
    //                       }
    //                       else{
    //                         lmulti = partnresip["2"]["ownRatio"]
    //                         dmulti =p1info?.partnership["2"]["ownRatio"]
    //                       }
    //                       const ledgerDatap2:any = await ledger.findOne({ ChildId: p3info._id });
    //                       const currentBalancep2:any = ledgerDatap2 ? ledgerDatap2.money : 0;
    //                       let ammoun = - (profit_loss) - betdata.stack*dmulti/100
    //                       let ammount = profit_loss > 0 && ! betstatus ? -(profit_loss) : ammoun // profit_loss - betdata.stack*multi
    //                       let commissionlega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*lmulti)/100
    //                       let commissiondega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*dmulti)/100
    //                       let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p3info?.share)/100;
    //                        mainledgerBalance = finalammount;
    //                        let updown = mainledgerBalance*(p3info?.share)/100
    //                       const updatedLedger = await ledger.create(
    //                         { ChildId: p2info?.parentId ,
    //                               ParentId: p3info?.parentId,
    //                               money:  finalammount,
    //                               username :p3info.username,
    //                               commissiondega,
    //                               commissionlega,
    //                               narration,
    //                               betId:bet_id,
    //                               Fancy:betstatus,
    //                               updown
    //                           }
    //                     );
    //                       }
    //                       let p4info = await User.findOne({_id:p3info?.parentId})
    //                     if(p4info?.parentId){
    //                       let partnresip =  p4info.partnership;
    //                       let lmulti,dmulti;
    //                       if(betdata.bet_on == "CASINO" || betdata.bet_on=="MATCH_ODDS"){
    //                         lmulti = partnresip["1"]["ownRatio"];
    //                         dmulti =p3info?.partnership["1"]["ownRatio"]
    //                       }
    //                       else{
    //                         lmulti = partnresip["2"]["ownRatio"]
    //                         dmulti =p1info?.partnership["2"]["ownRatio"]
    //                       }
    //                       const ledgerDatap2:any = await ledger.findOne({ ChildId: p4info._id });
    //                       const currentBalancep2:any = ledgerDatap2 ? ledgerDatap2.money : 0;
    //                        let ammoun = - (profit_loss) - betdata.stack*dmulti/100
    //                        let ammount = profit_loss > 0 && ! betstatus ? -(profit_loss) : ammoun // profit_loss - betdata.stack*multi
    //                        let commissionlega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*lmulti)/100
    //                        let commissiondega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*dmulti)/100
    //                        let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p4info?.share)/100;
    //                        mainledgerBalance = finalammount;
    //                        let updown = mainledgerBalance*(p4info?.share)/100
    //                       const updatedLedger = await ledger.create(
    //                         { ChildId:p3info?.parentId ,
    //                               ParentId: p4info?.parentId,
    //                               money:  finalammount,
    //                               username :p4info.username,
    //                               commissiondega,
    //                               commissionlega,
    //                               narration,
    //                               betId:bet_id,
    //                               Fancy:betstatus,
    //                               updown,
    //                           }
    //                     );
    //                       }
    //                       let p5info = await User.findOne({_id:p4info?.parentId})
    //                       if(p5info?.parentId){
    //                         let partnresip =  p5info.partnership;
    //                         let lmulti,dmulti;
    //                       if(betdata.bet_on == "CASINO" || betdata.bet_on=="MATCH_ODDS"){
    //                         lmulti = partnresip["1"]["ownRatio"];
    //                         dmulti =p4info?.partnership["1"]["ownRatio"]
    //                       }
    //                       else{
    //                         lmulti = partnresip["2"]["ownRatio"]
    //                         dmulti =p1info?.partnership["2"]["ownRatio"]
    //                       }
    //                         const ledgerDatap2:any = await ledger.findOne({ ChildId: p4info._id });
    //                         const currentBalancep2:any = ledgerDatap2 ? ledgerDatap2.money : 0;
    //                         let ammoun = - (profit_loss) - betdata.stack*dmulti/100
    //                         let ammount = profit_loss > 0 && ! betstatus ? -(profit_loss) : ammoun // profit_loss - betdata.stack*multi
    //                         let commissionlega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*lmulti)/100
    //                         let commissiondega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*dmulti)/100
    //                         let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p5info?.share)/100;
    //                         let updown = mainledgerBalance*(p5info?.share)/100
    //                         const updatedLedger = await ledger.create(
    //                           { ChildId: p4info?.parentId ,
    //                                 ParentId: p5info?.parentId,
    //                                 money: finalammount,
    //                                 username :p5info.username,
    //                                 commissiondega,
    //                                 commissionlega,
    //                                 narration,
    //                                 betId:bet_id,
    //                                 Fancy:betstatus,
    //                                 updown
    //                             }
    //                       );
    //                       mainledgerBalance = 0;
    //                         }
    //                 } catch (error) {
    //                     console.error('Error updating ledger for user:', userId, error);
    //                 }
    //               }
    //         return "success";
    //     } catch (error) {
    //         console.error('Error in allClientLedger:', error);
    //         // res.status(500).send({ error: 'Internal server error' });
    //         // return this.success(res,"hello world")
    //     }
    // }
    // async addcommission(id :any, commission:any){
    //   await Balance.findByIdAndUpdate(
    //     id,
    //     { $inc: { mainbalance: commission } }, // increment mainbalance by commission
    //     { new: true } // return the updated document
    //   );
    // }
    // async cal9xbro(
    //   userId,
    //   bet_id,
    //   profit_loss,
    //   matchId,
    //   narration,
    //   selectionId,
    //   sportId
    // ) {
    //   try {
    //     let betdata = await Bet.findOne({ _id: bet_id });
    //     let betstatus = betdata.bet_on == "FANCY" ? true : false;
    //     console.log("bet data", bet_id);
    //     console.log("hhello world hahahahahahhahahhah insidecal9xbro");
    //     const bId = await ledger.find({ betId: bet_id });
    //     if (bId.length > 0) {
    //       console.log("hello world");
    //       return "hello world";
    //     } else {
    //       try {
    //         let mainledgerBalance: number = 0;
    //         let calvalue: number = 0;
    //         // Fetch the current ledger balance
    //         const ledgerData: any = await ledger.findOne({ ChildId: userId });
    //         const userData = await User.findOne({ _id: userId });
    //         let p1info = await User.findOne({ _id: userData.parentId });
    //         if (p1info?.parentId) {
    //           let partnresip = p1info?.partnership;
    //           let p2infoj = await User.findOne({ _id: p1info?.parentId });
    //           mainledgerBalance = -profit_loss;
    //           // console.log(partnresip,"hello world for this partnership")
    //           const currentBalance: any = ledgerData ? ledgerData.money : 0;
    //           let multix;
    //           let dmultixu;
    //           if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
    //             multix = p1info?.mcom || 0;
    //             dmultixu = userData?.mcom || 0;
    //           } else {
    //             multix = p1info?.scom || 0;
    //             dmultixu = userData?.scom || 0;
    //           }
    //           var commissionlegaf =
    //             profit_loss > 0 && !betstatus
    //               ? 0
    //               : (betdata.stack * multix) / 100;
    //           let commissiondegaf =
    //             profit_loss > 0 && !betstatus
    //               ? 0
    //               : (betdata.stack * dmultixu) / 100;
    //           let share = -profit_loss * (p1info?.share / 100);
    //           // let fammount = -(profit_loss) - commissionlegaf-commissiondegaf;
    //           // console.log(share ,"share hjklphjkl;hjkl")
    //           let fammount = mainledgerBalance;
    //           mainledgerBalance =
    //             -profit_loss -
    //             share -
    //             commissionlegaf * ((100 - p1info?.share) / 100);
    //           calvalue = -profit_loss - commissionlegaf;
    //           let profit =
    //             calvalue * (p1info?.share / 100) +
    //             commissionlegaf -
    //             commissiondegaf;
    //           await ledger.create({
    //             ParentId: userData?._id,
    //             money: -profit_loss,
    //             umoney: -profit_loss,
    //             username: userData?.username,
    //             parentName: p1info.username,
    //             commissionlega: commissiondegaf,
    //             commissiondega: 0,
    //             narration,
    //             betId: bet_id,
    //             Fancy: betstatus,
    //             updown: -profit_loss,
    //             profit: commissionlegaf,
    //             cname: userData?.code,
    //             pname: p1info?.code,
    //           });
    //           const updatedLedgerp = await ledger.create({
    //             ChildId: userId,
    //             ParentId: userData?.parentId,
    //             money: fammount,
    //             umoney: mainledgerBalance,
    //             username: userData?.username,
    //             parentName: p1info.username,
    //             commissionlega: commissionlegaf,
    //             commissiondega: commissiondegaf,
    //             narration,
    //             betId: bet_id,
    //             Fancy: betstatus,
    //             updown: share,
    //             profit,
    //             cname: userData?.code,
    //             pname: p1info?.code,
    //           });
    //           // const result =   await Balance.findOneAndUpdate(
    //           //     { userId :userId },
    //           //     { $inc: { mainbalance: commissionlegaf } },
    //           //   );
    //           let multi;
    //           let lmulti;
    //           let p2infoh = await User.findOne({ _id: p1info?.parentId });
    //           if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
    //             multi = p1info?.mcom || 0;
    //             lmulti = p2infoh?.mcom || 0;
    //           } else {
    //             multi = p1info.scom || 0;
    //             lmulti = p2infoh.scom || 0;
    //           }
    //           const ledgerDatap1: any = await ledger.findOne({
    //             ChildId: p1info._id,
    //           });
    //           // const currentBalancep1:any = ledgerDatap1 ? ledgerDatap1.money : 0;
    //           let ammount =
    //             profit_loss > 0 && !betstatus ? -profit_loss : -profit_loss; // profit_loss - betdata.stack*multi
    //           let commissiondega =
    //             profit_loss > 0 && !betstatus ? 0 : (betdata.stack * multi) / 100;
    //           let commissionlega =
    //             profit_loss > 0 && !betstatus
    //               ? 0
    //               : (betdata.stack * lmulti) / 100;
    //           let money = mainledgerBalance;
    //           // mainledgerBalance = finalammount;
    //           // let updown = -(profit_loss-commissionlegaf)*(p2infoh?.share - p1info?.share)/100
    //           let updown = (calvalue * (p2infoh?.share - p1info?.share)) / 100;
    //           let profitone = updown + commissionlega - commissiondega;
    //           let umoney = mainledgerBalance - updown;
    //           mainledgerBalance = umoney;
    //           // let commissionlega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*lmulti)/100
    //           // let commissiondega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*dmulti)/100
    //           const updatedLedger = await ledger.create(
    //             {
    //               ChildId: userData.parentId,
    //               ParentId: p1info?.parentId,
    //               money,
    //               username: p1info.username,
    //               parentName: p2infoh.username,
    //               commissionlega,
    //               commissiondega,
    //               narration,
    //               betId: bet_id,
    //               Fancy: betstatus,
    //               updown,
    //               umoney,
    //               profit: profitone,
    //               cname: p1info?.code,
    //               pname: p2infoh?.code,
    //             } // Add to current balance
    //           );
    //         }
    //         let p2info = await User.findOne({ _id: p1info?.parentId });
    //         if (p2info?.parentId) {
    //           let p3info = await User.findOne({ _id: p2info.parentId });
    //           let partnresip = p2info.partnership;
    //           let money = mainledgerBalance;
    //           let lmulti, dmulti;
    //           if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
    //             lmulti = p3info.mcom || 0;
    //             dmulti = p2info?.mcom || 0;
    //           } else {
    //             lmulti = p3info.scom || 0;
    //             dmulti = p2info.scom || 0;
    //           }
    //           // const ledgerDatap2:any = await ledger.findOne({ ChildId: p2info._id });
    //           // const currentBalancep2:any = ledgerDatap2 ? ledgerDatap2.money : 0;
    //           let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
    //           let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
    //           let commissionlega =
    //             profit_loss > 0 && !betstatus
    //               ? 0
    //               : (betdata.stack * lmulti) / 100;
    //           let commissiondega =
    //             profit_loss > 0 && !betstatus
    //               ? 0
    //               : (betdata.stack * dmulti) / 100;
    //           // let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p2info?.share)/100;
    //           // let updown = -(profit_loss)*(p3info?.share -p2info?.share)/100
    //           let updown = (calvalue * (p3info?.share - p2info?.share)) / 100;
    //           let profitone = updown + commissionlega - commissiondega;
    //           let umoney = mainledgerBalance - updown;
    //           mainledgerBalance = umoney;
    //           const updatedLedger = await ledger.create({
    //             ChildId: p1info?.parentId,
    //             ParentId: p2info?.parentId,
    //             money,
    //             username: p2info.username,
    //             commissiondega,
    //             commissionlega,
    //             narration,
    //             betId: bet_id,
    //             Fancy: betstatus,
    //             updown,
    //             umoney,
    //             parentName: p3info.username,
    //             profit: profitone,
    //             cname: p2info?.code,
    //             pname: p3info?.code,
    //           });
    //         }
    //         let p3info = await User.findOne({ _id: p2info?.parentId });
    //         if (p3info?.parentId) {
    //           let p4info = await User.findOne({ _id: p3info?.parentId });
    //           let partnresip = p3info.partnership;
    //           let lmulti, dmulti;
    //           if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
    //             lmulti = p4info.mcom || 0;
    //             dmulti = p3info.mcom || 0;
    //           } else {
    //             lmulti = p4info.scom || 0;
    //             dmulti = p3info.scom || 0;
    //           }
    //           const ledgerDatap2: any = await ledger.findOne({
    //             ChildId: p3info._id,
    //           });
    //           const currentBalancep2: any = ledgerDatap2 ? ledgerDatap2.money : 0;
    //           let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
    //           let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
    //           let commissionlega =
    //             profit_loss > 0 && !betstatus
    //               ? 0
    //               : (betdata.stack * lmulti) / 100;
    //           let commissiondega =
    //             profit_loss > 0 && !betstatus
    //               ? 0
    //               : (betdata.stack * dmulti) / 100;
    //           let money = mainledgerBalance;
    //           // let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p3info?.share)/100;
    //           //  mainledgerBalance = finalammount;
    //           //  let updown = -(profit_loss)*(p4info?.share - p3info?.share)/100
    //           let updown = (calvalue * (p4info?.share - p3info?.share)) / 100;
    //           let profitone = updown + commissionlega - commissiondega;
    //           let umoney = mainledgerBalance - updown;
    //           mainledgerBalance = umoney;
    //           const updatedLedger = await ledger.create({
    //             ChildId: p2info?.parentId,
    //             ParentId: p3info?.parentId,
    //             money,
    //             username: p3info.username,
    //             commissiondega,
    //             commissionlega,
    //             narration,
    //             betId: bet_id,
    //             Fancy: betstatus,
    //             updown,
    //             umoney,
    //             parentName: p4info.username,
    //             profit: profitone,
    //             cname: p3info?.code,
    //             pname: p4info?.code,
    //           });
    //         }
    //         let p4info = await User.findOne({ _id: p3info?.parentId });
    //         if (p4info?.parentId) {
    //           let p5info = await User.findOne({ _id: p4info?.parentId });
    //           let partnresip = p4info.partnership;
    //           let lmulti, dmulti;
    //           if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
    //             lmulti = p5info?.mcom || 0;
    //             dmulti = p4info?.mcom || 0;
    //           } else {
    //             lmulti = p5info?.scom || 0;
    //             dmulti = p4info?.scom || 0;
    //           }
    //           // const ledgerDatap2:any = await ledger.findOne({ ChildId: p4info._id });
    //           // const currentBalancep2:any = ledgerDatap2 ? ledgerDatap2.money : 0;
    //           let money = mainledgerBalance;
    //           let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
    //           let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
    //           let commissionlega =
    //             profit_loss > 0 && !betstatus
    //               ? 0
    //               : (betdata.stack * lmulti) / 100;
    //           let commissiondega =
    //             profit_loss > 0 && !betstatus
    //               ? 0
    //               : (betdata.stack * dmulti) / 100;
    //           //  let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p4info?.share)/100;
    //           //  mainledgerBalance = finalammount;
    //           //  let updown = -(profit_loss)*(p5info?.share - p4info?.share)/100
    //           let updown = (calvalue * (p5info?.share - p4info?.share)) / 100;
    //           let profitone = updown + commissionlega - commissiondega;
    //           let umoney = mainledgerBalance - updown;
    //           mainledgerBalance = money;
    //           const updatedLedger = await ledger.create({
    //             ChildId: p3info?.parentId,
    //             ParentId: p4info?.parentId,
    //             money,
    //             username: p4info.username,
    //             commissiondega,
    //             commissionlega,
    //             narration,
    //             betId: bet_id,
    //             Fancy: betstatus,
    //             updown,
    //             umoney,
    //             parentName: p5info.username,
    //             profit: profitone,
    //             cname: p4info?.code,
    //             pname: p5info?.code,
    //           });
    //           mainledgerBalance = 0;
    //         }
    //         // await Balance.findOneAndUpdate(
    //         //   { userId },
    //         //   { $inc: { mainbalance: commissionlegaf } },
    //         //   { new: true }
    //         // );
    //       } catch (error) {
    //         console.error("Error updating ledger for user:", userId, error);
    //       }
    //     }
    //     return "success";
    //   } catch (error) {
    //     console.error("Error in allClientLedger:", error);
    //     // res.status(500).send({ error: 'Internal server error' });
    //     // return this.success(res,"hello world")
    //   }
    // }
    cal9xbro(userId, profit_loss, narration, matchId, bet_id, bet_on) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(userId, profit_loss, narration, matchId, bet_on, "details inside cal9xbro");
                let betdata = { bet_on };
                let betstatus = bet_on == "FANCY" ? true : false;
                let commission_value;
                if (betstatus) {
                    let betdetails = yield Bet_1.Bet.findById(bet_id);
                    commission_value = betdetails === null || betdetails === void 0 ? void 0 : betdetails.stack;
                }
                else {
                    commission_value = -profit_loss;
                }
                console.log("bet data", bet_id);
                console.log("hhello world hahahahahahhahahhah insidecal9xbro");
                // const bId = await ledger.find({});
                if (false) {
                    console.log("hello world");
                    return "hello world";
                }
                else {
                    try {
                        let mainledgerBalance = 0;
                        let calvalue = 0;
                        // Fetch the current ledger balance
                        const ledgerData = yield allledager_1.ledger.findOne({ ChildId: userId });
                        const userData = yield User_1.User.findOne({ _id: userId });
                        let p1info = yield User_1.User.findOne({ _id: userData.parentId });
                        console.log(p1info, "FGH");
                        if (p1info === null || p1info === void 0 ? void 0 : p1info.parentId) {
                            console.log(p1info, "FGHkjjjj");
                            let partnresip = p1info === null || p1info === void 0 ? void 0 : p1info.partnership;
                            let p2infoj = yield User_1.User.findOne({ _id: p1info === null || p1info === void 0 ? void 0 : p1info.parentId });
                            mainledgerBalance = -profit_loss;
                            // console.log(partnresip,"hello world for this partnership")
                            const currentBalance = ledgerData ? ledgerData.money : 0;
                            let multix;
                            let dmultixu;
                            if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
                                multix = (p1info === null || p1info === void 0 ? void 0 : p1info.mcom) || 0;
                                dmultixu = (userData === null || userData === void 0 ? void 0 : userData.mcom) || 0;
                            }
                            else {
                                multix = (p1info === null || p1info === void 0 ? void 0 : p1info.scom) || 0;
                                dmultixu = (userData === null || userData === void 0 ? void 0 : userData.scom) || 0;
                            }
                            var commissionlegaf = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * multix) / 100;
                            let commissiondegaf = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * dmultixu) / 100;
                            // let share = -profit_loss * (p1info?.share / 100);
                            calvalue = -profit_loss - commissionlegaf;
                            let share = calvalue * ((p1info === null || p1info === void 0 ? void 0 : p1info.share) / 100);
                            // let fammount = -(profit_loss) - commissionlegaf-commissiondegaf;
                            // console.log(share ,"share hjklphjkl;hjkl")
                            var fammount = mainledgerBalance;
                            mainledgerBalance = ((-profit_loss - commissionlegaf) * (100 - (p1info === null || p1info === void 0 ? void 0 : p1info.share))) / 100;
                            let profit = calvalue * ((p1info === null || p1info === void 0 ? void 0 : p1info.share) / 100) +
                                commissionlegaf -
                                commissiondegaf;
                            console.log(profit, "profit is here");
                            const xyz = yield allledager_1.ledger.create({
                                ParentId: userData === null || userData === void 0 ? void 0 : userData._id,
                                money: -profit_loss,
                                umoney: -profit_loss,
                                username: userData === null || userData === void 0 ? void 0 : userData.username,
                                parentName: p1info.username,
                                commissionlega: commissiondegaf,
                                commissiondega: 0,
                                narration,
                                fammount,
                                betId: bet_id,
                                Fancy: betstatus,
                                updown: -profit_loss,
                                profit: commissionlegaf,
                                cname: userData === null || userData === void 0 ? void 0 : userData.code,
                                pname: p1info === null || p1info === void 0 ? void 0 : p1info.code,
                                matchId
                            }, { new: true, upset: true });
                            console.log(xyz, "xyz");
                            // commission  entry in account statementes 
                            if (bet_on != "FANCY" && commissiondegaf > 0) {
                                const getAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: userId })
                                    .sort({ createdAt: -1 })
                                    .lean();
                                const getOpenBal = (getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt.closeBal) ? getAccStmt.closeBal : 0;
                                const userAccountData = {
                                    userId,
                                    narration: "commission",
                                    amount: commissiondegaf,
                                    type: AccountStatement_1.ChipsType.pnl,
                                    txnType: commissiondegaf > 0 ? UserChip_1.TxnType.cr : UserChip_1.TxnType.dr,
                                    openBal: getOpenBal,
                                    closeBal: getOpenBal + +commissiondegaf,
                                    matchId: matchId,
                                    // betId: bet_id,
                                    iscom: true,
                                    // selectionId,
                                    // sportId,
                                };
                                const newUserAccStmt = new AccountStatement_1.AccoutStatement(userAccountData);
                                yield newUserAccStmt.save();
                            }
                            const updatedLedgerp = yield allledager_1.ledger.create({
                                ChildId: userId,
                                ParentId: userData === null || userData === void 0 ? void 0 : userData.parentId,
                                money: fammount,
                                umoney: mainledgerBalance,
                                username: userData === null || userData === void 0 ? void 0 : userData.username,
                                parentName: p1info.username,
                                commissionlega: commissionlegaf,
                                commissiondega: commissiondegaf,
                                narration,
                                fammount,
                                betId: bet_id,
                                Fancy: betstatus,
                                updown: share,
                                profit,
                                cname: userData === null || userData === void 0 ? void 0 : userData.code,
                                pname: p1info === null || p1info === void 0 ? void 0 : p1info.code,
                                matchId
                            });
                            // const result =   await Balance.findOneAndUpdate(
                            //     { userId :userId },
                            //     { $inc: { mainbalance: commissionlegaf } },
                            //   );
                            let multi;
                            let lmulti;
                            let p2infoh = yield User_1.User.findOne({ _id: p1info === null || p1info === void 0 ? void 0 : p1info.parentId });
                            if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
                                multi = (p1info === null || p1info === void 0 ? void 0 : p1info.mcom) || 0;
                                lmulti = (p2infoh === null || p2infoh === void 0 ? void 0 : p2infoh.mcom) || 0;
                            }
                            else {
                                multi = p1info.scom || 0;
                                lmulti = p2infoh.scom || 0;
                            }
                            const ledgerDatap1 = yield allledager_1.ledger.findOne({
                                ChildId: p1info._id,
                            });
                            // const currentBalancep1:any = ledgerDatap1 ? ledgerDatap1.money : 0;
                            let ammount = profit_loss > 0 && !betstatus ? -profit_loss : -profit_loss; // profit_loss - betdata.stack*multi
                            let commissiondega = profit_loss > 0 && !betstatus ? 0 : (commission_value * multi) / 100;
                            let commissionlega = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * lmulti) / 100;
                            let money = mainledgerBalance;
                            // mainledgerBalance = finalammount;
                            // let updown = -(profit_loss-commissionlegaf)*(p2infoh?.share - p1info?.share)/100
                            let updown = (calvalue * ((p2infoh === null || p2infoh === void 0 ? void 0 : p2infoh.share) - (p1info === null || p1info === void 0 ? void 0 : p1info.share))) / 100;
                            let umoney = ((-profit_loss - commissionlega) * (100 - (p2infoh === null || p2infoh === void 0 ? void 0 : p2infoh.share))) / 100;
                            let profitone = mainledgerBalance - umoney;
                            mainledgerBalance = umoney;
                            // let commissionlega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*lmulti)/100
                            // let commissiondega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*dmulti)/100
                            const updatedLedger = yield allledager_1.ledger.create({
                                ChildId: userData.parentId,
                                ParentId: p1info === null || p1info === void 0 ? void 0 : p1info.parentId,
                                money,
                                username: p1info.username,
                                parentName: p2infoh.username,
                                commissionlega,
                                commissiondega,
                                narration,
                                fammount,
                                betId: bet_id,
                                Fancy: betstatus,
                                updown,
                                umoney,
                                profit: profitone,
                                cname: p1info === null || p1info === void 0 ? void 0 : p1info.code,
                                pname: p2infoh === null || p2infoh === void 0 ? void 0 : p2infoh.code,
                                matchId
                            } // Add to current balance
                            );
                        }
                        let p2info = yield User_1.User.findOne({ _id: p1info === null || p1info === void 0 ? void 0 : p1info.parentId });
                        if (p2info === null || p2info === void 0 ? void 0 : p2info.parentId) {
                            let p3info = yield User_1.User.findOne({ _id: p2info.parentId });
                            let partnresip = p2info.partnership;
                            let money = mainledgerBalance;
                            let lmulti, dmulti;
                            if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
                                lmulti = p3info.mcom || 0;
                                dmulti = (p2info === null || p2info === void 0 ? void 0 : p2info.mcom) || 0;
                            }
                            else {
                                lmulti = p3info.scom || 0;
                                dmulti = p2info.scom || 0;
                            }
                            // const ledgerDatap2:any = await ledger.findOne({ ChildId: p2info._id });
                            // const currentBalancep2:any = ledgerDatap2 ? ledgerDatap2.money : 0;
                            // let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
                            // let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
                            let commissionlega = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * lmulti) / 100;
                            let commissiondega = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * dmulti) / 100;
                            // let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p2info?.share)/100;
                            // let updown = -(profit_loss)*(p3info?.share -p2info?.share)/100
                            let updown = (calvalue * ((p3info === null || p3info === void 0 ? void 0 : p3info.share) - (p2info === null || p2info === void 0 ? void 0 : p2info.share))) / 100;
                            // let profitone = updown + commissionlega - commissiondega;
                            let umoney = ((-profit_loss - commissionlega) * (100 - (p3info === null || p3info === void 0 ? void 0 : p3info.share))) / 100;
                            let profitone = mainledgerBalance - umoney;
                            mainledgerBalance = umoney;
                            const updatedLedger = yield allledager_1.ledger.create({
                                ChildId: p1info === null || p1info === void 0 ? void 0 : p1info.parentId,
                                ParentId: p2info === null || p2info === void 0 ? void 0 : p2info.parentId,
                                money,
                                username: p2info.username,
                                commissiondega,
                                commissionlega,
                                narration,
                                fammount,
                                betId: bet_id,
                                Fancy: betstatus,
                                updown,
                                umoney,
                                parentName: p3info.username,
                                profit: profitone,
                                cname: p2info === null || p2info === void 0 ? void 0 : p2info.code,
                                pname: p3info === null || p3info === void 0 ? void 0 : p3info.code,
                                matchId
                            });
                        }
                        let p3info = yield User_1.User.findOne({ _id: p2info === null || p2info === void 0 ? void 0 : p2info.parentId });
                        if (p3info === null || p3info === void 0 ? void 0 : p3info.parentId) {
                            let p4info = yield User_1.User.findOne({ _id: p3info === null || p3info === void 0 ? void 0 : p3info.parentId });
                            let partnresip = p3info.partnership;
                            let lmulti, dmulti;
                            if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
                                lmulti = p4info.mcom || 0;
                                dmulti = p3info.mcom || 0;
                            }
                            else {
                                lmulti = p4info.scom || 0;
                                dmulti = p3info.scom || 0;
                            }
                            const ledgerDatap2 = yield allledager_1.ledger.findOne({
                                ChildId: p3info._id,
                            });
                            const currentBalancep2 = ledgerDatap2 ? ledgerDatap2.money : 0;
                            // let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
                            // let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
                            let commissionlega = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * lmulti) / 100;
                            let commissiondega = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * dmulti) / 100;
                            let money = mainledgerBalance;
                            // let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p3info?.share)/100;
                            //  mainledgerBalance = finalammount;
                            //  let updown = -(profit_loss)*(p4info?.share - p3info?.share)/100
                            let updown = (calvalue * ((p4info === null || p4info === void 0 ? void 0 : p4info.share) - (p3info === null || p3info === void 0 ? void 0 : p3info.share))) / 100;
                            // let profitone = updown + commissionlega - commissiondega;
                            let umoney = ((-profit_loss - commissionlega) * (100 - (p4info === null || p4info === void 0 ? void 0 : p4info.share))) / 100;
                            let profitone = mainledgerBalance - umoney;
                            mainledgerBalance = umoney;
                            const updatedLedger = yield allledager_1.ledger.create({
                                ChildId: p2info === null || p2info === void 0 ? void 0 : p2info.parentId,
                                ParentId: p3info === null || p3info === void 0 ? void 0 : p3info.parentId,
                                money,
                                username: p3info.username,
                                commissiondega,
                                commissionlega,
                                narration,
                                fammount,
                                betId: bet_id,
                                Fancy: betstatus,
                                updown,
                                umoney,
                                parentName: p4info.username,
                                profit: profitone,
                                cname: p3info === null || p3info === void 0 ? void 0 : p3info.code,
                                pname: p4info === null || p4info === void 0 ? void 0 : p4info.code,
                                matchId
                            });
                        }
                        let p4info = yield User_1.User.findOne({ _id: p3info === null || p3info === void 0 ? void 0 : p3info.parentId });
                        if (p4info === null || p4info === void 0 ? void 0 : p4info.parentId) {
                            let p5info = yield User_1.User.findOne({ _id: p4info === null || p4info === void 0 ? void 0 : p4info.parentId });
                            let partnresip = p4info.partnership;
                            let lmulti, dmulti;
                            if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
                                lmulti = (p5info === null || p5info === void 0 ? void 0 : p5info.mcom) || 0;
                                dmulti = (p4info === null || p4info === void 0 ? void 0 : p4info.mcom) || 0;
                            }
                            else {
                                lmulti = (p5info === null || p5info === void 0 ? void 0 : p5info.scom) || 0;
                                dmulti = (p4info === null || p4info === void 0 ? void 0 : p4info.scom) || 0;
                            }
                            // const ledgerDatap2:any = await ledger.findOne({ ChildId: p4info._id });
                            // const currentBalancep2:any = ledgerDatap2 ? ledgerDatap2.money : 0;
                            let money = mainledgerBalance;
                            // let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
                            // let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
                            let commissionlega = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * lmulti) / 100;
                            let commissiondega = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * dmulti) / 100;
                            //  let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p4info?.share)/100;
                            //  mainledgerBalance = finalammount;
                            //  let updown = -(profit_loss)*(p5info?.share - p4info?.share)/100
                            let updown = (calvalue * ((p5info === null || p5info === void 0 ? void 0 : p5info.share) - (p4info === null || p4info === void 0 ? void 0 : p4info.share))) / 100;
                            // let umoney = mainledgerBalance - updown;
                            let umoney = ((-profit_loss - commissionlega) * (100 - (p5info === null || p5info === void 0 ? void 0 : p5info.share))) / 100;
                            let profitone = mainledgerBalance - umoney;
                            mainledgerBalance = umoney;
                            const updatedLedger = yield allledager_1.ledger.create({
                                ChildId: p3info === null || p3info === void 0 ? void 0 : p3info.parentId,
                                ParentId: p4info === null || p4info === void 0 ? void 0 : p4info.parentId,
                                money,
                                username: p4info.username,
                                commissiondega,
                                commissionlega,
                                narration,
                                fammount,
                                betId: bet_id,
                                Fancy: betstatus,
                                updown,
                                umoney,
                                parentName: p5info.username,
                                profit: profitone,
                                cname: p4info === null || p4info === void 0 ? void 0 : p4info.code,
                                pname: p5info === null || p5info === void 0 ? void 0 : p5info.code,
                                matchId
                            });
                            // mainledgerBalance = 0;
                        }
                        let p41info = yield User_1.User.findOne({ _id: p4info === null || p4info === void 0 ? void 0 : p4info.parentId });
                        if (p41info === null || p41info === void 0 ? void 0 : p41info.parentId) {
                            let p51info = yield User_1.User.findOne({ _id: p41info === null || p41info === void 0 ? void 0 : p41info.parentId });
                            let partnresip = p41info.partnership;
                            let lmulti, dmulti;
                            if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
                                lmulti = (p51info === null || p51info === void 0 ? void 0 : p51info.mcom) || 0;
                                dmulti = (p41info === null || p41info === void 0 ? void 0 : p41info.mcom) || 0;
                            }
                            else {
                                lmulti = (p51info === null || p51info === void 0 ? void 0 : p51info.scom) || 0;
                                dmulti = (p41info === null || p41info === void 0 ? void 0 : p41info.scom) || 0;
                            }
                            // const ledgerDatap2:any = await ledger.findOne({ ChildId: p4info._id });
                            // const currentBalancep2:any = ledgerDatap2 ? ledgerDatap2.money : 0;
                            let money = mainledgerBalance;
                            // let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
                            // let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
                            let commissionlega = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * lmulti) / 100;
                            let commissiondega = profit_loss > 0 && !betstatus
                                ? 0
                                : (commission_value * dmulti) / 100;
                            //  let finalammount = mainledgerBalance - commissiondega - mainledgerBalance*(p4info?.share)/100;
                            //  mainledgerBalance = finalammount;
                            //  let updown = -(profit_loss)*(p5info?.share - p4info?.share)/100
                            let updown = (calvalue * ((p51info === null || p51info === void 0 ? void 0 : p51info.share) - (p41info === null || p41info === void 0 ? void 0 : p41info.share))) / 100;
                            // let umoney = mainledgerBalance - updown;
                            let umoney = ((-profit_loss - commissionlega) * (100 - (p51info === null || p51info === void 0 ? void 0 : p51info.share))) / 100;
                            let profitone = mainledgerBalance - umoney;
                            mainledgerBalance = money;
                            const updatedLedger = yield allledager_1.ledger.create({
                                ChildId: p4info === null || p4info === void 0 ? void 0 : p4info.parentId,
                                ParentId: p41info === null || p41info === void 0 ? void 0 : p41info.parentId,
                                money,
                                username: p41info.username,
                                commissiondega,
                                commissionlega,
                                narration,
                                betId: bet_id,
                                Fancy: betstatus,
                                updown,
                                umoney,
                                parentName: p51info.username,
                                profit: profitone,
                                cname: p41info === null || p41info === void 0 ? void 0 : p41info.code,
                                pname: p51info === null || p51info === void 0 ? void 0 : p51info.code,
                                fammount,
                                matchId
                            });
                            mainledgerBalance = 0;
                        }
                        // await Balance.findOneAndUpdate(
                        //   { userId },
                        //   { $inc: { mainbalance: commissionlegaf } },
                        //   { new: true }
                        // );
                    }
                    catch (error) {
                        console.error("Error updating ledger for user:", userId, error);
                        return error;
                    }
                }
                return "success";
            }
            catch (error) {
                console.error("Error in allClientLedger:", error);
                // res.status(500).send({ error: 'Internal server error' });
                // return this.success(res,"hello world")
                return error;
            }
        });
    }
}
exports.FancyController = FancyController;
// import axios from "axios";
// import { Request, Response } from "express";
// import { IFancy, IFancyModel, Fancy } from "../models/Fancy";
// import { ApiController } from "./ApiController";
// import { Bet, BetOn, BetType, IBet } from "../models/Bet";
// import { IMatch, Match } from "../models/Match";
// import { BetController } from "./BetController";
// import { User } from "../models/User";
// import {
//   AccoutStatement,
//   ChipsType,
//   IAccoutStatement,
// } from "../models/AccountStatement";
// import { TxnType } from "../models/UserChip";
// import { Balance } from "../models/Balance";
// import { ObjectId, Types } from "mongoose";
// import UserSocket from "../sockets/user-socket";
// import { RoleType } from "../models/Role";
// import { Market } from "../models/Market";
// import { CasCasino } from "../models/CasCasino";
// import { ledger } from "../models/allledager";
// var ObjectId = require("mongoose").Types.ObjectId;
// export class FancyController extends ApiController {
//   activeFancies = async (req: Request, res: Response): Promise<Response> => {
//     try {
//       const { matchId, gtype }: any = req.query;
//       if (!matchId) return this.fail(res, "matchId is required field");
//       const strings = ["wkt", "Wkts", "Fours", "Sixes"];
//       const filters = {
//         $nor: [
//           ...strings.map((string) => ({ fancyName: { $regex: string } })),
//           { ballByBall: "ballRun" },
//         ],
//         gtype,
//       };
//       let filter: any = { gtype };
//       switch (gtype) {
//         case "session":
//           filter = filters;
//           break;
//         case "fancy1":
//           filter = { gtype };
//           break;
//         case "wkt":
//           filter = {
//             $or: [
//               { fancyName: { $regex: gtype } },
//               { fancyName: { $regex: strings[1] } },
//             ],
//             gtype: { $ne: "fancy1" },
//           };
//           break;
//         case "ballRun":
//           filter = { ballByBall: "ballRun" };
//           break;
//       }
//       if (strings.find((str) => str.includes(gtype))) {
//         filter = { fancyName: { $regex: gtype }, gtype: { $ne: "fancy1" } };
//       }
//       const bets = await Bet.find({ matchId, bet_on: BetOn.FANCY }).select({
//         selectionId: 1,
//       });
//       let allBets: any = {};
//       if (bets.length) {
//         bets.forEach((bet) => {
//           allBets[`${bet.selectionId}`] = true;
//         });
//       }
//       let fancy = await Fancy.find({
//         matchId,
//         ...filter,
//       })
//         .sort({ active: -1 })
//         .lean();
//       fancy = fancy
//         .map((f: any) => {
//           f.bet = allBets[f.marketId] ? true : false;
//           return f;
//         })
//         .sort((a, b) => b.bet - a.bet);
//       return this.success(res, fancy);
//     } catch (e: any) {
//       return this.fail(res, e);
//     }
//   };
//   suspendFancy = async (req: Request, res: Response): Promise<Response> => {
//     try {
//       const { marketId, matchId, type }: any = req.query;
//       const newFancy: any = await Fancy.findOne({
//         marketId: `${marketId}`,
//         matchId,
//       });
//       if (newFancy && type) {
//         newFancy[type] = !newFancy[type];
//         if (type !== "active")
//           newFancy.GameStatus = newFancy[type] ? "SUSPENDED" : "";
//         newFancy.save();
//       }
//       axios
//         .post(`${process.env.OD_NODE_URL}fancy-suspend`, {
//           fancy: newFancy,
//           type,
//         })
//         .then((res) => console.log(res.data))
//         .catch((e: any) => {
//           console.log(e.response.data);
//         });
//       return this.success(res, newFancy);
//     } catch (e: any) {
//       return this.fail(res, e);
//     }
//   };
//   rollbackfancyresult = async (
//     req: Request,
//     res: Response
//   ): Promise<Response> => {
//     try {
//       const { marketId, matchId }: any = req.query;
//       const userbet: any = await Bet.aggregate([
//         {
//           $match: {
//             status: "completed",
//             bet_on: BetOn.FANCY,
//             marketId: marketId,
//             matchId: parseInt(matchId),
//           },
//         },
//         {
//           $group: {
//             _id: "$userId",
//             allBets: { $push: "$$ROOT" },
//           },
//         },
//         {
//           $addFields: {
//             allBets: {
//               $map: {
//                 input: "$allBets",
//                 as: "bet",
//                 in: {
//                   $mergeObjects: [
//                     "$$bet",
//                     {
//                       odds: { $toString: "$$bet.odds" },
//                       volume: { $toString: "$$bet.volume" },
//                       stack: { $toString: "$$bet.stack" },
//                       pnl: { $toString: "$$bet.pnl" },
//                       commission: { $toString: "$$bet.commission" },
//                       matchedOdds: { $toString: "$$bet.matchedOdds" },
//                       loss: { $toString: "$$bet.loss" },
//                       profitLoss: { $toString: "$$bet.profitLoss" },
//                     },
//                   ],
//                 },
//               },
//             },
//           },
//         },
//       ]);
//       let userIdList: any = [];
//       const parentIdList: any = [];
//       const declare_result = userbet.map(async (Item: any) => {
//         let allbets: any = Item.allBets;
//         const settle_single = allbets.map(
//           async (ItemBetList: any, indexBetList: number) => {
//             UserSocket.onRollbackPlaceBet(ItemBetList);
//             await AccoutStatement.deleteMany({
//               betId: ObjectId(ItemBetList._id),
//             });
//             if (indexBetList == 0) {
//               ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
//                 parentIdList.push(ItemParentStr.parent);
//                 userIdList.push(ObjectId(ItemParentStr.parent));
//               });
//             }
//           }
//         );
//         Promise.all(settle_single);
//         userIdList.push(ObjectId(Item._id));
//       });
//       await Promise.all(declare_result);
//       await Bet.updateMany(
//         {
//           userId: { $in: userIdList },
//           matchId: matchId,
//           selectionId: marketId,
//           bet_on: BetOn.FANCY,
//         },
//         { $set: { status: "pending" } }
//       );
//       const unique = [...new Set(userIdList)];
//       if (unique.length > 0) {
//         await this.updateUserAccountStatement(unique, parentIdList);
//       }
//       await Fancy.updateOne(
//         { matchId: matchId, marketId: marketId },
//         { $set: { result: "" } }
//       );
//       return this.success(res, userbet, "");
//     } catch (e: any) {
//       return this.fail(res, e);
//     }
//   };
//   rollbackfancyresultbyapi = async ({ marketId, matchId }: any) => {
//     try {
//       const userbet: any = await Bet.aggregate([
//         {
//           $match: {
//             status: "completed",
//             bet_on: BetOn.FANCY,
//             marketId: marketId,
//             matchId: parseInt(matchId),
//           },
//         },
//         {
//           $group: {
//             _id: "$userId",
//             allBets: { $push: "$$ROOT" },
//           },
//         },
//         {
//           $addFields: {
//             allBets: {
//               $map: {
//                 input: "$allBets",
//                 as: "bet",
//                 in: {
//                   $mergeObjects: [
//                     "$$bet",
//                     {
//                       odds: { $toString: "$$bet.odds" },
//                       volume: { $toString: "$$bet.volume" },
//                       stack: { $toString: "$$bet.stack" },
//                       pnl: { $toString: "$$bet.pnl" },
//                       commission: { $toString: "$$bet.commission" },
//                       matchedOdds: { $toString: "$$bet.matchedOdds" },
//                       loss: { $toString: "$$bet.loss" },
//                       profitLoss: { $toString: "$$bet.profitLoss" },
//                     },
//                   ],
//                 },
//               },
//             },
//           },
//         },
//       ]);
//       let userIdList: any = [];
//       const parentIdList: any = [];
//       const declare_result = userbet.map(async (Item: any) => {
//         let allbets: any = Item.allBets;
//         const settle_single = allbets.map(
//           async (ItemBetList: any, indexBetList: number) => {
//             UserSocket.onRollbackPlaceBet(ItemBetList);
//             await AccoutStatement.deleteMany({
//               betId: ObjectId(ItemBetList._id),
//             });
//             if (indexBetList == 0) {
//               ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
//                 parentIdList.push(ItemParentStr.parent);
//                 userIdList.push(ObjectId(ItemParentStr.parent));
//               });
//             }
//           }
//         );
//         Promise.all(settle_single);
//         userIdList.push(ObjectId(Item._id));
//       });
//       await Promise.all(declare_result);
//       await Bet.updateMany(
//         {
//           userId: { $in: userIdList },
//           matchId: matchId,
//           selectionId: marketId,
//           bet_on: BetOn.FANCY,
//         },
//         { $set: { status: "pending" } }
//       );
//       const unique = [...new Set(userIdList)];
//       if (unique.length > 0) {
//         await this.updateUserAccountStatement(unique, parentIdList);
//       }
//       await Fancy.updateOne(
//         { matchId: matchId, marketId: marketId },
//         { $set: { result: "" } }
//       );
//       return true;
//     } catch (e: any) {
//       return false;
//     }
//   };
//   updatefancyresultapi = async (
//     req: Request,
//     res: Response
//   ): Promise<Response> => {
//     try {
//       const data = req.body;
//       if (data.result != "" && data.message == "ok") {
//         const findFancy: any = await Fancy.findOne({
//           fancyName: data.runnerName,
//           matchId: data.matchId,
//         });
//         if (findFancy?._id && !data.isRollback) {
//           this.declarefancyresultAuto({
//             matchId: findFancy.matchId,
//             marketId: findFancy.marketId,
//             result: data.result,
//           });
//         } else if (findFancy?._id) {
//           this.rollbackfancyresultbyapi({
//             matchId: findFancy.matchId,
//             marketId: findFancy.marketId,
//           });
//         }
//         return this.success(res, {});
//       } else {
//         return this.success(res, { message: "result not found" });
//       }
//     } catch (e: any) {
//       return this.fail(res, e);
//     }
//   };
//   declarefancyresultAuto = async ({ marketId, matchId, result }: any) => {
//     try {
//       const userbet: any = await Bet.aggregate([
//         {
//           $match: {
//             status: "pending",
//             bet_on: BetOn.FANCY,
//             marketId: marketId,
//             matchId: parseInt(matchId),
//           },
//         },
//         {
//           $group: {
//             _id: "$userId",
//             allBets: { $push: "$$ROOT" },
//           },
//         },
//       ]);
//       let userIdList: any = [];
//       const parentIdList: any = [];
//       const declare_result = userbet.map(async (Item: any) => {
//         let allbets: any = Item.allBets;
//         const settle_single = allbets.map(
//           async (ItemBetList: any, indexBetList: number) => {
//             let profit_type: string = "loss";
//             profit_type =
//               ItemBetList.isBack == false &&
//               parseInt(result) < parseInt(ItemBetList.odds)
//                 ? "profit"
//                 : profit_type;
//             profit_type =
//               ItemBetList.isBack == true &&
//               parseInt(result) >= parseInt(ItemBetList.odds)
//                 ? "profit"
//                 : profit_type;
//             let profitLossAmt: number = 0;
//             if (ItemBetList.gtype === "fancy1") {
//               profit_type =
//                 ItemBetList.isBack == true && parseInt(result) == 1
//                   ? "profit"
//                   : profit_type;
//               profit_type =
//                 ItemBetList.isBack == false && parseInt(result) == 0
//                   ? "profit"
//                   : profit_type;
//             }
//             if (profit_type == "profit") {
//               if (ItemBetList.gtype === "fancy1") {
//                 profitLossAmt = ItemBetList.isBack
//                   ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
//                   : ItemBetList.stack;
//               } else {
//                 profitLossAmt = ItemBetList.isBack
//                   ? (parseFloat(ItemBetList.volume) *
//                       parseFloat(ItemBetList.stack)) /
//                     100
//                   : ItemBetList.stack;
//               }
//             } else if (profit_type == "loss") {
//               if (ItemBetList.gtype === "fancy1") {
//                 profitLossAmt = ItemBetList.isBack
//                   ? -ItemBetList.stack
//                   : -1 *
//                     (ItemBetList.odds * ItemBetList.stack - ItemBetList.stack);
//               } else {
//                 profitLossAmt = ItemBetList.isBack
//                   ? -ItemBetList.stack
//                   : -(
//                       parseFloat(ItemBetList.volume) *
//                       parseFloat(ItemBetList.stack)
//                     ) / 100;
//               }
//             }
//             let type_string: string = ItemBetList.isBack ? "Yes" : "No";
//             if (result == -1) {
//               profitLossAmt = 0;
//             }
//             let narration: string =
//               ItemBetList.matchName +
//               " / " +
//               ItemBetList.selectionName +
//               " / " +
//               type_string +
//               " / " +
//               (result == -1 ? "Abandoned" : result);
//             await this.addprofitlosstouser({
//               userId: ObjectId(Item._id),
//               bet_id: ObjectId(ItemBetList._id),
//               profit_loss: profitLossAmt,
//               matchId,
//               narration,
//               sportsType: ItemBetList.sportId,
//               selectionId: ItemBetList.selectionId,
//               sportId: ItemBetList.sportId,
//             });
//             if (indexBetList == 0) {
//               ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
//                 parentIdList.push(ItemParentStr.parent);
//                 userIdList.push(ObjectId(ItemParentStr.parent));
//               });
//             }
//             UserSocket.betDelete({
//               betId: ItemBetList._id,
//               userId: ItemBetList.userId,
//             });
//           }
//         );
//         await Promise.all(settle_single);
//         userIdList.push(ObjectId(Item._id));
//       });
//       await Promise.all(declare_result);
//       await Bet.updateMany(
//         {
//           userId: { $in: userIdList },
//           matchId: matchId,
//           selectionId: marketId,
//           bet_on: BetOn.FANCY,
//         },
//         { $set: { status: "completed" } }
//       );
//       const unique = [...new Set(userIdList)];
//       if (unique.length > 0) {
//         await this.updateUserAccountStatement(unique, parentIdList);
//       }
//       await Fancy.updateOne(
//         { matchId: matchId, marketId: marketId },
//         { $set: { result: result } }
//       );
//       return true;
//     } catch (e: any) {
//       return false;
//     }
//   };
//   updateUserAccountStatement = async (
//     userIds: any,
//     parentIdList: any
//   ): Promise<void> => {
//     if (userIds.length > 0) {
//       const betController = new BetController();
//       const json: any = {};
//       const promiseStatment = userIds.map(async (ItemUserId: any) => {
//         let exposer: number = 0;
//         let balancePnl: number = 0;
//         const blanceData = await this.updateUserBal(ItemUserId, parentIdList);
//         if (parentIdList.indexOf(ItemUserId) == -1) {
//           exposer = await betController.getexposerfunction(
//             { _id: ItemUserId.toString() },
//             false,
//             json
//           );
//           balancePnl = blanceData.pnl_;
//         } else {
//           balancePnl = blanceData.pnl_;
//         }
//         await Balance.findOneAndUpdate(
//           { userId: ItemUserId },
//           {
//             balance: blanceData.Balance_,
//             exposer: exposer,
//             profitLoss: balancePnl,
//           },
//           { new: true, upsert: true }
//         );
//         UserSocket.setExposer({
//           balance: blanceData.Balance_,
//           exposer: exposer,
//           userId: ItemUserId,
//         });
//       });
//       await Promise.all(promiseStatment);
//     }
//   };
//   updateUserAccountStatementCasino = async (
//     userIds: any,
//     parentIdList: any
//   ): Promise<void> => {
//     if (userIds.length > 0) {
//       const betController = new BetController();
//       const json: any = {};
//       const promiseStatment = userIds.map(async (ItemUserId: any) => {
//         let exposer: number = 0;
//         let balancePnl: number = 0;
//         const blanceData = await this.updateUserBal(ItemUserId, parentIdList);
//         if (parentIdList.indexOf(ItemUserId) == -1) {
//           exposer = await betController.getcasinoexposerfunction(
//             { _id: ItemUserId.toString() },
//             false,
//             json
//           );
//           balancePnl = blanceData.pnl_;
//         } else {
//           balancePnl = blanceData.pnl_;
//         }
//         const updateUserBal = await Balance.findOneAndUpdate(
//           { userId: ItemUserId },
//           {
//             balance: blanceData.Balance_,
//             casinoexposer: exposer,
//             profitLoss: balancePnl,
//           },
//           { new: true, upsert: true }
//         );
//         UserSocket.setExposer({
//           balance: blanceData.Balance_,
//           exposer: exposer + +updateUserBal?.exposer,
//           userId: ItemUserId,
//         });
//       });
//       await Promise.all(promiseStatment);
//     }
//   };
//   declarefancyresult = async (
//     req: Request,
//     res: Response
//   ): Promise<Response> => {
//     try {
//       const { marketId, matchId, result }: any = req.query;
//       const userbet: any = await Bet.aggregate([
//         {
//           $match: {
//             status: "pending",
//             bet_on: BetOn.FANCY,
//             marketId: marketId,
//             matchId: parseInt(matchId),
//           },
//         },
//         {
//           $group: {
//             _id: "$userId",
//             allBets: { $push: "$$ROOT" },
//           },
//         },
//       ]);
//       let userIdList: any = [];
//       const parentIdList: any = [];
//       const declare_result = userbet.map(async (Item: any) => {
//         let allbets: any = Item.allBets;
//         const settle_single = allbets.map(
//           async (ItemBetList: any, indexBetList: number) => {
//             let profit_type: string = "loss";
//             profit_type =
//               ItemBetList.isBack == false &&
//               parseInt(result) < parseInt(ItemBetList.odds)
//                 ? "profit"
//                 : profit_type;
//             profit_type =
//               ItemBetList.isBack == true &&
//               parseInt(result) >= parseInt(ItemBetList.odds)
//                 ? "profit"
//                 : profit_type;
//             let profitLossAmt: number = 0;
//             if (ItemBetList.gtype === "fancy1") {
//               profit_type =
//                 ItemBetList.isBack == true && parseInt(result) == 1
//                   ? "profit"
//                   : profit_type;
//               profit_type =
//                 ItemBetList.isBack == false && parseInt(result) == 0
//                   ? "profit"
//                   : profit_type;
//             }
//             if (profit_type == "profit") {
//               if (ItemBetList.gtype === "fancy1") {
//                 profitLossAmt = ItemBetList.isBack
//                   ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
//                   : ItemBetList.stack;
//               } else {
//                 profitLossAmt = ItemBetList.isBack
//                   ? (parseFloat(ItemBetList.volume) *
//                       parseFloat(ItemBetList.stack)) /
//                     100
//                   : ItemBetList.stack;
//               }
//             } else if (profit_type == "loss") {
//               if (ItemBetList.gtype === "fancy1") {
//                 profitLossAmt = ItemBetList.isBack
//                   ? -ItemBetList.stack
//                   : -1 *
//                     (ItemBetList.odds * ItemBetList.stack - ItemBetList.stack);
//               } else {
//                 profitLossAmt = ItemBetList.isBack
//                   ? -ItemBetList.stack
//                   : -(
//                       parseFloat(ItemBetList.volume) *
//                       parseFloat(ItemBetList.stack)
//                     ) / 100;
//               }
//             }
//             let type_string: string = ItemBetList.isBack ? "Yes" : "No";
//             if (result == -1) {
//               profitLossAmt = 0;
//             }
//             let narration: string =
//               ItemBetList.matchName +
//               " / " +
//               ItemBetList.selectionName +
//               " / " +
//               type_string +
//               " / " +
//               (result == -1 ? "Abandoned" : result);
//             await this.addprofitlosstouser({
//               userId: ObjectId(Item._id),
//               bet_id: ObjectId(ItemBetList._id),
//               profit_loss: profitLossAmt,
//               matchId,
//               narration,
//               sportsType: ItemBetList.sportId,
//               selectionId: ItemBetList.selectionId,
//               sportId: ItemBetList.sportId,
//             });
//             if (indexBetList == 0) {
//               ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
//                 parentIdList.push(ItemParentStr.parent);
//                 userIdList.push(ObjectId(ItemParentStr.parent));
//               });
//             }
//             UserSocket.betDelete({
//               betId: ItemBetList._id,
//               userId: ItemBetList.userId,
//             });
//           }
//         );
//         await Promise.all(settle_single);
//         userIdList.push(ObjectId(Item._id));
//       });
//       await Promise.all(declare_result);
//       await Bet.updateMany(
//         {
//           userId: { $in: userIdList },
//           matchId: matchId,
//           selectionId: marketId,
//           bet_on: BetOn.FANCY,
//         },
//         { $set: { status: "completed" } }
//       );
//       const unique = [...new Set(userIdList)];
//       if (unique.length > 0) {
//         await this.updateUserAccountStatement(unique, parentIdList);
//       }
//       await Fancy.updateOne(
//         { matchId: matchId, marketId: marketId },
//         { $set: { result: result } }
//       );
//       return this.success(res, userbet, "");
//     } catch (e: any) {
//       return this.fail(res, e);
//     }
//   };
//   setT10FancyResult = async (
//     req: Request,
//     res: Response
//   ): Promise<Response> => {
//     const pendingFanciesMatchs = await Fancy.aggregate([
//       { $match: { status: { $eq: undefined } } },
//       { $group: { _id: "$matchId" } },
//       { $project: { matchId: 1 } },
//     ]);
//     pendingFanciesMatchs.map((item) => {
//       axios
//         .get(
//           `${process.env.SUPER_NODE_URL}api/get-t10-fancy-result?matchId=${item._id}`
//         )
//         .then(async (response) => {
//           await new FancyController().declarefancyresultauto(response.data);
//         })
//         .catch((e) => console.log(e.message));
//     });
//     return this.success(res, {});
//   };
//   declarefancyresultauto = async ({
//     marketIdList,
//     matchId,
//   }: any): Promise<boolean> => {
//     try {
//       const pendingFancies = await Fancy.find(
//         { status: { $eq: undefined }, matchId: matchId },
//         { marketId: 1 }
//       );
//       const finalArray = pendingFancies.map(
//         (ItemPending: any) => ItemPending.marketId
//       );
//       const declareResultList = marketIdList.filter(
//         (ItemSet: any) => finalArray.indexOf(ItemSet.marketId) > -1
//       );
//       const dataPromise = declareResultList.map(async (ItemResult: any) => {
//         const { marketId, result }: any = ItemResult;
//         const userbet: any = await Bet.aggregate([
//           {
//             $match: {
//               status: "pending",
//               bet_on: BetOn.FANCY,
//               marketId: marketId,
//               matchId: parseInt(matchId),
//             },
//           },
//           {
//             $group: {
//               _id: "$userId",
//               allBets: { $push: "$$ROOT" },
//             },
//           },
//         ]);
//         let userIdList: any = [];
//         const parentIdList: any = [];
//         const declare_result = userbet.map(async (Item: any) => {
//           let allbets: any = Item.allBets;
//           const settle_single = allbets.map(
//             async (ItemBetList: any, indexBetList: number) => {
//               let profit_type: string = "loss";
//               profit_type =
//                 ItemBetList.isBack == false &&
//                 parseInt(result) < parseInt(ItemBetList.odds)
//                   ? "profit"
//                   : profit_type;
//               profit_type =
//                 ItemBetList.isBack == true &&
//                 parseInt(result) >= parseInt(ItemBetList.odds)
//                   ? "profit"
//                   : profit_type;
//               let profitLossAmt: number = 0;
//               if (ItemBetList.gtype === "fancy1") {
//                 profit_type =
//                   ItemBetList.isBack == true && parseInt(result) == 1
//                     ? "profit"
//                     : profit_type;
//                 profit_type =
//                   ItemBetList.isBack == false && parseInt(result) == 0
//                     ? "profit"
//                     : profit_type;
//               }
//               if (profit_type == "profit") {
//                 if (ItemBetList.gtype === "fancy1") {
//                   profitLossAmt = ItemBetList.isBack
//                     ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
//                     : ItemBetList.stack;
//                 } else {
//                   profitLossAmt = ItemBetList.isBack
//                     ? (parseFloat(ItemBetList.volume) *
//                         parseFloat(ItemBetList.stack)) /
//                       100
//                     : ItemBetList.stack;
//                 }
//               } else if (profit_type == "loss") {
//                 if (ItemBetList.gtype === "fancy1") {
//                   profitLossAmt = ItemBetList.isBack
//                     ? -ItemBetList.stack
//                     : -1 *
//                       (ItemBetList.odds * ItemBetList.stack -
//                         ItemBetList.stack);
//                 } else {
//                   profitLossAmt = ItemBetList.isBack
//                     ? -ItemBetList.stack
//                     : -(
//                         parseFloat(ItemBetList.volume) *
//                         parseFloat(ItemBetList.stack)
//                       ) / 100;
//                 }
//               }
//               let type_string: string = ItemBetList.isBack ? "Yes" : "No";
//               let narration: string =
//                 ItemBetList.matchName +
//                 " / " +
//                 ItemBetList.selectionName +
//                 " / " +
//                 type_string +
//                 " / " +
//                 result;
//               await this.addprofitlosstouser({
//                 userId: ObjectId(Item._id),
//                 bet_id: ObjectId(ItemBetList._id),
//                 profit_loss: profitLossAmt,
//                 matchId,
//                 narration,
//                 sportsType: ItemBetList.sportId,
//                 selectionId: ItemBetList.selectionId,
//                 sportId: ItemBetList.sportId,
//               });
//               if (indexBetList == 0) {
//                 ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
//                   parentIdList.push(ItemParentStr.parent);
//                   userIdList.push(ObjectId(ItemParentStr.parent));
//                 });
//               }
//               UserSocket.betDelete({
//                 betId: ItemBetList._id,
//                 userId: ItemBetList.userId,
//               });
//             }
//           );
//           await Promise.all(settle_single);
//           userIdList.push(ObjectId(Item._id));
//         });
//         await Promise.all(declare_result);
//         await Bet.updateMany(
//           {
//             userId: { $in: userIdList },
//             matchId: matchId,
//             selectionId: marketId,
//             bet_on: BetOn.FANCY,
//           },
//           { $set: { status: "completed" } }
//         );
//         const unique = [...new Set(userIdList)];
//         if (unique.length > 0) {
//           await this.updateUserAccountStatement(unique, parentIdList);
//         }
//         await Fancy.updateOne(
//           { matchId: parseInt(matchId), marketId: marketId },
//           { $set: { result: result, status: "completed" } }
//         );
//       });
//       await Promise.all(dataPromise);
//       return true;
//     } catch (e: any) {
//       return false;
//     }
//   };
//   updateUserBal = async (userId: any, parentIdList: any) => {
//     const ac = await AccoutStatement.aggregate([
//       { $match: { userId: Types.ObjectId(userId) } },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//     ]);
//     const parent = await User.findOne(
//       {
//         parentStr: { $elemMatch: { $eq: Types.ObjectId(userId) } },
//         role: RoleType.user,
//       },
//       { _id: 1 }
//     )
//       .distinct("_id")
//       .lean();
//     if (parentIdList.indexOf(userId) == -1) {
//       parent.push(userId);
//     }
//     const pnl = await AccoutStatement.aggregate([
//       { $match: { userId: { $in: parent }, betId: { $ne: null } } },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//     ]);
//     const withdrawlsum = await AccoutStatement.aggregate([
//       {
//         $match: {
//           userId: Types.ObjectId(userId),
//           betId: { $eq: null },
//           txnId: { $eq: null },
//           txnType: TxnType.dr,
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//     ]);
//     const depositesum = await AccoutStatement.aggregate([
//       {
//         $match: {
//           userId: Types.ObjectId(userId),
//           betId: { $eq: null },
//           txnId: { $ne: null },
//           txnType: TxnType.cr,
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//     ]);
//     const userCr = await User.findOne({ _id: ObjectId(userId) }).select({
//       creditRefrences: 1,
//     });
//     const withdAmt =
//       withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0;
//     const depositeAmt =
//       depositesum && depositesum.length > 0 ? depositesum[0].totalAmount : 0;
//     const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0;
//     const pnl_ =
//       pnl && pnl.length > 0
//         ? pnl[0].totalAmount +
//           withdAmt +
//           depositeAmt -
//           (userCr && userCr.creditRefrences
//             ? parseInt(userCr.creditRefrences)
//             : 0)
//         : withdAmt +
//           depositeAmt -
//           (userCr && userCr.creditRefrences
//             ? parseInt(userCr.creditRefrences)
//             : 0);
//     ////const bal = await Balance.findOne({ userId: userId }).select({ profitLoss: 1 })
//     //// const pnl_ = bal?.profitLoss ? bal?.profitLoss : 0
//     return { Balance_, pnl_ };
//   };
//   declarematchresult = async (
//     req: Request,
//     res: Response
//   ): Promise<Response> => {
//     try {
//       const { selectionId, matchId }: any = req.query;
//       const userbet: any = await Bet.aggregate([
//         {
//           $match: {
//             status: "pending",
//             bet_on: BetOn.MATCH_ODDS,
//             matchId: parseInt(matchId),
//           },
//         },
//         {
//           $group: {
//             _id: "$userId",
//             allBets: { $push: "$$ROOT" },
//           },
//         },
//       ]);
//       let userIdList: any = [];
//       const parentIdList: any = [];
//       const declare_result = userbet.map(async (Item: any) => {
//         let allbets: any = Item.allBets;
//         const settle_single = allbets.map(
//           async (ItemBetList: any, indexBetList: number) => {
//             let profit_type: string = "loss";
//             if (parseInt(selectionId) == ItemBetList.selectionId) {
//               profit_type = ItemBetList.isBack == true ? "profit" : profit_type;
//             } else {
//               profit_type = ItemBetList.isBack == true ? profit_type : "profit";
//             }
//             let profitLossAmt: number = 0;
//             if (ItemBetList.isBack) {
//               if (profit_type == "profit") {
//                 profitLossAmt =
//                   (parseFloat(ItemBetList.odds.toString()) - 1) *
//                   parseFloat(ItemBetList.stack.toString());
//               } else if (profit_type == "loss") {
//                 profitLossAmt = parseFloat(ItemBetList.loss.toString());
//               }
//             } else {
//               if (profit_type == "profit") {
//                 profitLossAmt = ItemBetList.stack;
//               } else if (profit_type == "loss") {
//                 profitLossAmt = parseFloat(ItemBetList.loss.toString());
//               }
//             }
//             let type_string: string = ItemBetList.isBack ? "Back" : "Lay";
//             let narration: string =
//               ItemBetList.matchName +
//               " / " +
//               ItemBetList.selectionName +
//               " / " +
//               type_string +
//               " / " +
//               selectionId;
//             await this.addprofitlosstouser({
//               userId: ObjectId(Item._id),
//               bet_id: ObjectId(ItemBetList._id),
//               profit_loss: profitLossAmt,
//               matchId,
//               narration,
//               sportsType: ItemBetList.sportId,
//               selectionId: ItemBetList.selectionId,
//               sportId: ItemBetList.sportId,
//             });
//             if (indexBetList == 0) {
//               ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
//                 parentIdList.push(ItemParentStr.parent);
//                 userIdList.push(ObjectId(ItemParentStr.parent));
//               });
//             }
//           }
//         );
//         await Promise.all(settle_single);
//         userIdList.push(ObjectId(Item._id));
//       });
//       await Promise.all(declare_result);
//       await Bet.updateMany(
//         {
//           userId: { $in: userIdList },
//           matchId: matchId,
//           bet_on: BetOn.MATCH_ODDS,
//         },
//         { $set: { status: "completed" } }
//       );
//       const unique = [...new Set(userIdList)];
//       if (unique.length > 0) {
//         await this.updateUserAccountStatement(unique, parentIdList);
//       }
//       await Match.updateOne(
//         { matchId: parseInt(matchId) },
//         { $set: { result_delare: true, result: selectionId } }
//       );
//       return this.success(res, userbet, "");
//     } catch (e: any) {
//       return this.fail(res, e);
//     }
//   };
//   declaremarketresult = async (
//     req: Request,
//     res: Response
//   ): Promise<Response> => {
//     try {
//       const { selectionId, matchId, marketId }: any = req.query;
//       const userbet: any = await Bet.aggregate([
//         {
//           $match: {
//             status: "pending",
//             bet_on: BetOn.MATCH_ODDS,
//             matchId: parseInt(matchId),
//             marketId: marketId,
//           },
//         },
//         {
//           $group: {
//             _id: "$userId",
//             allBets: { $push: "$$ROOT" },
//           },
//         },
//       ]);
//       let userIdList: any = [];
//       const parentIdList: any = [];
//       const declare_result = userbet.map(async (Item: any) => {
//         let allbets: any = Item.allBets;
//         const settle_single = allbets.map(
//           async (ItemBetList: any, indexBetList: number) => {
//             let profit_type: string = "loss";
//             if (parseInt(selectionId) == ItemBetList.selectionId) {
//               profit_type = ItemBetList.isBack == true ? "profit" : profit_type;
//             } else {
//               profit_type = ItemBetList.isBack == true ? profit_type : "profit";
//             }
//             let profitLossAmt: number = 0;
//             if (ItemBetList.isBack) {
//               if (profit_type == "profit") {
//                 profitLossAmt =
//                   (parseFloat(ItemBetList.odds.toString()) - 1) *
//                   parseFloat(ItemBetList.stack.toString());
//               } else if (profit_type == "loss") {
//                 profitLossAmt = parseFloat(ItemBetList.loss.toString());
//               }
//             } else {
//               if (profit_type == "profit") {
//                 profitLossAmt = ItemBetList.stack;
//               } else if (profit_type == "loss") {
//                 profitLossAmt = parseFloat(ItemBetList.loss.toString());
//               }
//             }
//             if (selectionId == -1) {
//               profitLossAmt = 0;
//             }
//             let type_string: string = ItemBetList.isBack ? "Back" : "Lay";
//             let narration: string =
//               ItemBetList.matchName +
//               " / " +
//               ItemBetList.selectionName +
//               " / " +
//               type_string +
//               " / " +
//               (selectionId == -1 ? "Abandoned" : selectionId);
//             await this.addprofitlosstouser({
//               userId: ObjectId(Item._id),
//               bet_id: ObjectId(ItemBetList._id),
//               profit_loss: profitLossAmt,
//               matchId,
//               narration,
//               sportsType: ItemBetList.sportId,
//               selectionId: ItemBetList.selectionId,
//               sportId: ItemBetList.sportId,
//             });
//             if (indexBetList == 0) {
//               ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
//                 parentIdList.push(ItemParentStr.parent);
//                 userIdList.push(ObjectId(ItemParentStr.parent));
//               });
//             }
//           }
//         );
//         await Promise.all(settle_single);
//         userIdList.push(ObjectId(Item._id));
//       });
//       await Promise.all(declare_result);
//       await Bet.updateMany(
//         {
//           userId: { $in: userIdList },
//           matchId: matchId,
//           bet_on: BetOn.MATCH_ODDS,
//           marketId: marketId,
//         },
//         { $set: { status: "completed" } }
//       );
//       const unique = [...new Set(userIdList)];
//       if (unique.length > 0) {
//         await this.updateUserAccountStatement(unique, parentIdList);
//       }
//       await Match.updateOne(
//         { matchId: parseInt(matchId) },
//         { $set: { result_delare: true, result: selectionId } }
//       );
//       await Market.updateOne(
//         { marketId: marketId },
//         { $set: { resultDelcare: "yes", result: selectionId } }
//       );
//       return this.success(res, userbet, "");
//     } catch (e: any) {
//       return this.fail(res, e);
//     }
//   };
//   declaremarketresultAuto = async (
//     req: Request,
//     res: Response
//   ): Promise<Response> => {
//     try {
//       const { selectionId, matchId, marketId }: any = req.query;
//       const userbet: any = await Bet.aggregate([
//         {
//           $match: {
//             status: "pending",
//             bet_on: BetOn.MATCH_ODDS,
//             matchId: parseInt(matchId),
//             marketId: marketId,
//           },
//         },
//         {
//           $group: {
//             _id: "$userId",
//             allBets: { $push: "$$ROOT" },
//           },
//         },
//       ]);
//       let userIdList: any = [];
//       const parentIdList: any = [];
//       const declare_result = userbet.map(async (Item: any) => {
//         let allbets: any = Item.allBets;
//         const settle_single = allbets.map(
//           async (ItemBetList: any, indexBetList: number) => {
//             let profit_type: string = "loss";
//             if (parseInt(selectionId) == ItemBetList.selectionId) {
//               profit_type = ItemBetList.isBack == true ? "profit" : profit_type;
//             } else {
//               profit_type = ItemBetList.isBack == true ? profit_type : "profit";
//             }
//             let profitLossAmt: number = 0;
//             if (ItemBetList.isBack) {
//               if (profit_type == "profit") {
//                 profitLossAmt =
//                   (parseFloat(ItemBetList.odds.toString()) - 1) *
//                   parseFloat(ItemBetList.stack.toString());
//               } else if (profit_type == "loss") {
//                 profitLossAmt = parseFloat(ItemBetList.loss.toString());
//               }
//             } else {
//               if (profit_type == "profit") {
//                 profitLossAmt = ItemBetList.stack;
//               } else if (profit_type == "loss") {
//                 profitLossAmt = parseFloat(ItemBetList.loss.toString());
//               }
//             }
//             if (selectionId == -1) {
//               profitLossAmt = 0;
//             }
//             let type_string: string = ItemBetList.isBack ? "Back" : "Lay";
//             let narration: string =
//               ItemBetList.matchName +
//               " / " +
//               ItemBetList.selectionName +
//               " / " +
//               type_string +
//               " / " +
//               (selectionId == -1 ? "Abandoned" : selectionId);
//             await this.addprofitlosstouser({
//               userId: ObjectId(Item._id),
//               bet_id: ObjectId(ItemBetList._id),
//               profit_loss: profitLossAmt,
//               matchId,
//               narration,
//               sportsType: ItemBetList.sportId,
//               selectionId: ItemBetList.selectionId,
//               sportId: ItemBetList.sportId,
//             });
//             if (indexBetList == 0) {
//               ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
//                 parentIdList.push(ItemParentStr.parent);
//                 userIdList.push(ObjectId(ItemParentStr.parent));
//               });
//             }
//             UserSocket.betDelete({
//               betId: ItemBetList._id,
//               userId: ItemBetList.userId,
//             });
//           }
//         );
//         await Promise.all(settle_single);
//         userIdList.push(ObjectId(Item._id));
//       });
//       await Promise.all(declare_result);
//       await Bet.updateMany(
//         {
//           userId: { $in: userIdList },
//           matchId: matchId,
//           bet_on: BetOn.MATCH_ODDS,
//           marketId: marketId,
//         },
//         { $set: { status: "completed" } }
//       );
//       const unique = [...new Set(userIdList)];
//       if (unique.length > 0) {
//         await this.updateUserAccountStatement(unique, parentIdList);
//       }
//       await Market.updateOne(
//         { marketId: marketId },
//         { $set: { resultDelcare: "yes", result: selectionId, isActive: false } }
//       );
//       return this.success(res, userbet, "");
//     } catch (e: any) {
//       return this.fail(res, e);
//     }
//   };
//   rollbackmarketresult = async (
//     req: Request,
//     res: Response
//   ): Promise<Response> => {
//     try {
//       const { matchId }: any = req.query;
//       const userbet: any = await Bet.aggregate([
//         {
//           $match: {
//             status: "completed",
//             bet_on: BetOn.MATCH_ODDS,
//             matchId: parseInt(matchId),
//           },
//         },
//         {
//           $group: {
//             _id: "$userId",
//             allBets: { $push: "$$ROOT" },
//           },
//         },
//       ]);
//       let userIdList: any = [];
//       const parentIdList: any = [];
//       const declare_result = userbet.map(async (Item: any) => {
//         let allbets: any = Item.allBets;
//         const settle_single = allbets.map(
//           async (ItemBetList: any, indexBetList: number) => {
//             await AccoutStatement.deleteMany({
//               betId: ObjectId(ItemBetList._id),
//             });
//             if (indexBetList == 0) {
//               ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
//                 parentIdList.push(ItemParentStr.parent);
//                 userIdList.push(ObjectId(ItemParentStr.parent));
//               });
//             }
//           }
//         );
//         await Promise.all(settle_single);
//         userIdList.push(ObjectId(Item._id));
//       });
//       await Promise.all(declare_result);
//       await Bet.updateMany(
//         {
//           userId: { $in: userIdList },
//           matchId: matchId,
//           bet_on: BetOn.MATCH_ODDS,
//         },
//         { $set: { status: "pending" } }
//       );
//       const unique = [...new Set(userIdList)];
//       if (unique.length > 0) {
//         await this.updateUserAccountStatement(unique, parentIdList);
//       }
//       await Match.updateOne(
//         { matchId: parseInt(matchId) },
//         { $set: { result_delare: false, result: "" } }
//       );
//       await Market.updateOne(
//         { matchId: parseInt(matchId) },
//         { $set: { resultDelcare: "no" } }
//       );
//       return this.success(res, userbet, "");
//     } catch (e: any) {
//       return this.fail(res, e);
//     }
//   };
//   /// market wise karna h
//   rollbackmarketwiseresult = async (
//     req: Request,
//     res: Response
//   ): Promise<Response> => {
//     try {
//       const { matchId, marketId }: any = req.query;
//       const userbet: any = await Bet.aggregate([
//         {
//           $match: {
//             status: "completed",
//             bet_on: BetOn.MATCH_ODDS,
//             matchId: parseInt(matchId),
//             marketId: marketId,
//           },
//         },
//         {
//           $group: {
//             _id: "$userId",
//             allBets: { $push: "$$ROOT" },
//           },
//         },
//       ]);
//       let userIdList: any = [];
//       const parentIdList: any = [];
//       const declare_result = userbet.map(async (Item: any) => {
//         let allbets: any = Item.allBets;
//         const settle_single = allbets.map(
//           async (ItemBetList: any, indexBetList: number) => {
//             await AccoutStatement.deleteMany({
//               betId: ObjectId(ItemBetList._id),
//             });
//             if (indexBetList == 0) {
//               ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
//                 parentIdList.push(ItemParentStr.parent);
//                 userIdList.push(ObjectId(ItemParentStr.parent));
//               });
//             }
//           }
//         );
//         await Promise.all(settle_single);
//         userIdList.push(ObjectId(Item._id));
//       });
//       await Promise.all(declare_result);
//       await Bet.updateMany(
//         {
//           userId: { $in: userIdList },
//           matchId: matchId,
//           bet_on: BetOn.MATCH_ODDS,
//           marketId: marketId,
//         },
//         { $set: { status: "pending" } }
//       );
//       const unique = [...new Set(userIdList)];
//       if (unique.length > 0) {
//         await this.updateUserAccountStatement(unique, parentIdList);
//       }
//       await Market.updateOne(
//         { marketId: marketId },
//         { $set: { resultDelcare: "no" } }
//       );
//       return this.success(res, userbet, "");
//     } catch (e: any) {
//       return this.fail(res, e);
//     }
//   };
//   //9xledger calculation
//   async cal9xbro(
//     userId,
//     bet_id,
//     profit_loss,
//     matchId,
//     narration,
//     selectionId,
//     sportId) {
//     try {
//       let betdata = await Bet.findOne({ _id: bet_id });
//       let betstatus = betdata.bet_on == "FANCY" ? true : false;
//       console.log("bet data", bet_id);
//       console.log("hhello world hahahahahahhahahhah insidecal9xbro");
//       const bId = await ledger.find({ betId: bet_id });
//       if (bId.length > 0) {
//         console.log("hello world");
//         return "hello world";
//       } else {
//         try {
//           let mainledgerBalance: number = 0;
//           // Fetch the current ledger balance
//           const ledgerData: any = await ledger.findOne({ ChildId: userId });
//           const userData = await User.findOne({ _id: userId });
//           let p1info = await User.findOne({ _id: userData.parentId });
//           if (p1info?.parentId) {
//             let partnresip = p1info.partnership;
//             // console.log(partnresip,"hello world for this partnership")
//             const currentBalance: any = ledgerData ? ledgerData.money : 0;
//             let multix;
//             let dmultixu;
//             if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
//               multix = partnresip["1"]["ownRatio"];
//               dmultixu = userData?.partnership["1"]["ownRatio"] || 0;
//             } else {
//               multix = partnresip["2"]["ownRatio"];
//               dmultixu = userData?.partnership["2"]["ownRatio"] || 0;
//             }
//             let commissionlegaf =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * multix) / 100;
//             let commissiondegaf =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * dmultixu) / 100;
//             let fammount = -profit_loss - commissiondegaf;
//             mainledgerBalance = fammount;
//             const updatedLedgerp = await ledger.create({
//               ChildId: userId,
//               ParentId: userData?.parentId,
//               money: fammount,
//               username: userData?.username,
//               commissionlega: commissionlegaf,
//               commissiondega: commissiondegaf,
//               narration,
//               betId: bet_id,
//               Fancy: betstatus,
//               updown: fammount,
//             });
//             let multi;
//             let lmulti;
//             let p2infoh = await User.findOne({ _id: p1info?.parentId });
//             if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
//               multi = partnresip["1"]["ownRatio"];
//               lmulti = p2infoh?.partnership["1"]["ownRatio"];
//             } else {
//               multi = partnresip["2"]["ownRatio"];
//               lmulti = p2infoh?.partnership["2"]["ownRatio"];
//             }
//             const ledgerDatap1: any = await ledger.findOne({
//               ChildId: p1info._id,
//             });
//             const currentBalancep1: any = ledgerDatap1 ? ledgerDatap1.money : 0;
//             let ammount =
//               profit_loss > 0 && !betstatus ? -profit_loss : -profit_loss; // profit_loss - betdata.stack*multi
//             let commissiondega =
//               profit_loss > 0 && !betstatus ? 0 : (betdata.stack * multi) / 100;
//             let commissionlega =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * lmulti) / 100;
//             let finalammount =
//               ammount - commissiondega - (ammount * p1info?.share) / 100;
//             console.log(finalammount, "finalammount herer");
//             console.log(finalammount, "finalammount herer");
//             console.log(finalammount, "finalammount herer");
//             console.log(finalammount, "finalammount herer");
//             console.log(finalammount, "finalammount herer");
//             mainledgerBalance = finalammount;
//             let updown = (mainledgerBalance * p1info?.share) / 100;
//             // let commissionlega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*lmulti)/100
//             // let commissiondega = profit_loss > 0 && ! betstatus ? 0:(betdata.stack*dmulti)/100
//             const updatedLedger = await ledger.create(
//               {
//                 ChildId: userData.parentId,
//                 ParentId: p1info?.parentId,
//                 money: finalammount,
//                 username: p1info.username,
//                 commissionlega,
//                 commissiondega,
//                 narration,
//                 betId: bet_id,
//                 Fancy: betstatus,
//                 updown,
//               } // Add to current balance
//             );
//           }
//           let p2info = await User.findOne({ _id: p1info?.parentId });
//           if (p2info?.parentId) {
//             let partnresip = p2info.partnership;
//             let lmulti, dmulti;
//             if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
//               lmulti = partnresip["1"]["ownRatio"];
//               dmulti = p1info?.partnership["1"]["ownRatio"];
//             } else {
//               lmulti = partnresip["2"]["ownRatio"];
//               dmulti = p1info?.partnership["2"]["ownRatio"];
//             }
//             const ledgerDatap2: any = await ledger.findOne({
//               ChildId: p2info._id,
//             });
//             const currentBalancep2: any = ledgerDatap2 ? ledgerDatap2.money : 0;
//             let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
//             let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
//             let commissionlega =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * lmulti) / 100;
//             let commissiondega =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * dmulti) / 100;
//             let finalammount =
//               mainledgerBalance -
//               commissiondega -
//               (mainledgerBalance * p2info?.share) / 100;
//             let updown = (mainledgerBalance * p2info?.share) / 100;
//             mainledgerBalance = finalammount;
//             console.log(finalammount, "finalammount herer");
//             console.log(finalammount, "finalammount herer");
//             console.log(finalammount, "finalammount herer");
//             console.log(finalammount, "finalammount herer");
//             console.log(finalammount, "finalammount herer");
//             const updatedLedger = await ledger.create({
//               ChildId: p1info?.parentId,
//               ParentId: p2info?.parentId,
//               money: finalammount,
//               username: p2info.username,
//               commissiondega,
//               commissionlega,
//               narration,
//               betId: bet_id,
//               Fancy: betstatus,
//               updown,
//             });
//           }
//           let p3info = await User.findOne({ _id: p2info?.parentId });
//           if (p3info?.parentId) {
//             let partnresip = p3info.partnership;
//             let lmulti, dmulti;
//             if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
//               lmulti = partnresip["1"]["ownRatio"];
//               dmulti = p2info?.partnership["1"]["ownRatio"];
//             } else {
//               lmulti = partnresip["2"]["ownRatio"];
//               dmulti = p1info?.partnership["2"]["ownRatio"];
//             }
//             const ledgerDatap2: any = await ledger.findOne({
//               ChildId: p3info._id,
//             });
//             const currentBalancep2: any = ledgerDatap2 ? ledgerDatap2.money : 0;
//             let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
//             let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
//             let commissionlega =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * lmulti) / 100;
//             let commissiondega =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * dmulti) / 100;
//             let finalammount =
//               mainledgerBalance -
//               commissiondega -
//               (mainledgerBalance * p3info?.share) / 100;
//             mainledgerBalance = finalammount;
//             let updown = (mainledgerBalance * p3info?.share) / 100;
//             const updatedLedger = await ledger.create({
//               ChildId: p2info?.parentId,
//               ParentId: p3info?.parentId,
//               money: finalammount,
//               username: p3info.username,
//               commissiondega,
//               commissionlega,
//               narration,
//               betId: bet_id,
//               Fancy: betstatus,
//               updown,
//             });
//           }
//           let p4info = await User.findOne({ _id: p3info?.parentId });
//           if (p4info?.parentId) {
//             let partnresip = p4info.partnership;
//             let lmulti, dmulti;
//             if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
//               lmulti = partnresip["1"]["ownRatio"];
//               dmulti = p3info?.partnership["1"]["ownRatio"];
//             } else {
//               lmulti = partnresip["2"]["ownRatio"];
//               dmulti = p1info?.partnership["2"]["ownRatio"];
//             }
//             const ledgerDatap2: any = await ledger.findOne({
//               ChildId: p4info._id,
//             });
//             const currentBalancep2: any = ledgerDatap2 ? ledgerDatap2.money : 0;
//             let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
//             let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
//             let commissionlega =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * lmulti) / 100;
//             let commissiondega =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * dmulti) / 100;
//             let finalammount =
//               mainledgerBalance -
//               commissiondega -
//               (mainledgerBalance * p4info?.share) / 100;
//             mainledgerBalance = finalammount;
//             let updown = (mainledgerBalance * p4info?.share) / 100;
//             const updatedLedger = await ledger.create({
//               ChildId: p3info?.parentId,
//               ParentId: p4info?.parentId,
//               money: finalammount,
//               username: p4info.username,
//               commissiondega,
//               commissionlega,
//               narration,
//               betId: bet_id,
//               Fancy: betstatus,
//               updown,
//             });
//           }
//           let p5info = await User.findOne({ _id: p4info?.parentId });
//           if (p5info?.parentId) {
//             let partnresip = p5info.partnership;
//             let lmulti, dmulti;
//             if (betdata.bet_on == "CASINO" || betdata.bet_on == "MATCH_ODDS") {
//               lmulti = partnresip["1"]["ownRatio"];
//               dmulti = p4info?.partnership["1"]["ownRatio"];
//             } else {
//               lmulti = partnresip["2"]["ownRatio"];
//               dmulti = p1info?.partnership["2"]["ownRatio"];
//             }
//             const ledgerDatap2: any = await ledger.findOne({
//               ChildId: p4info._id,
//             });
//             const currentBalancep2: any = ledgerDatap2 ? ledgerDatap2.money : 0;
//             let ammoun = -profit_loss - (betdata.stack * dmulti) / 100;
//             let ammount = profit_loss > 0 && !betstatus ? -profit_loss : ammoun; // profit_loss - betdata.stack*multi
//             let commissionlega =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * lmulti) / 100;
//             let commissiondega =
//               profit_loss > 0 && !betstatus
//                 ? 0
//                 : (betdata.stack * dmulti) / 100;
//             let finalammount =
//               mainledgerBalance -
//               commissiondega -
//               (mainledgerBalance * p5info?.share) / 100;
//             let updown = (mainledgerBalance * p5info?.share) / 100;
//             const updatedLedger = await ledger.create({
//               ChildId: p4info?.parentId,
//               ParentId: p5info?.parentId,
//               money: finalammount,
//               username: p5info.username,
//               commissiondega,
//               commissionlega,
//               narration,
//               betId: bet_id,
//               Fancy: betstatus,
//               updown,
//             });
//             mainledgerBalance = 0;
//           }
//         } catch (error) {
//           console.error("Error updating ledger for user:", userId, error);
//         }
//       }
//       return "success";
//     } catch (error) {
//       console.error("Error in allClientLedger:", error);
//       // res.status(500).send({ error: 'Internal server error' });
//       // return this.success(res,"hello world")
//     }
//   }
//   addprofitlosstouser = async ({
//     userId,
//     bet_id,
//     profit_loss,
//     matchId,
//     narration,
//     sportsType,
//     selectionId,
//     sportId,
//   }: {
//     userId: ObjectId;
//     bet_id: ObjectId;
//     profit_loss: number;
//     matchId: number;
//     narration: string;
//     sportsType: number;
//     selectionId: number;
//     sportId: number;
//   }): Promise<void> => {
//     const user = await User.findOne({ _id: userId });
//     const user_parent = await User.findOne({ _id: user?.parentId });
//     const parent_ratio =
//       sportId == 5000
//         ? user_parent?.partnership?.[4]?.allRatio
//         : user_parent?.partnership?.[sportsType]?.allRatio;
//     const reference_id = await this.sendcreditdebit(
//       userId,
//       narration,
//       profit_loss,
//       matchId,
//       bet_id,
//       selectionId,
//       sportId
//     );
//     const updateplToBet = await Bet.updateOne(
//       { _id: bet_id },
//       { $set: { profitLoss: profit_loss } }
//     );
//     await this.cal9xbro(
//       userId,
//       bet_id,
//       profit_loss,
//       matchId,
//       narration,
//       selectionId,
//       sportId
//     );
//     if (parent_ratio && parent_ratio.length > 0) {
//       const accountforparent = parent_ratio.map(async (Item) => {
//         let pl = (Math.abs(profit_loss) * Item.ratio) / 100;
//         const final_amount: number = profit_loss > 0 ? -pl : pl;
//         await this.sendcreditdebit(
//           Item.parent,
//           narration,
//           final_amount,
//           matchId,
//           bet_id,
//           selectionId,
//           sportId
//         );
//       });
//       await Promise.all(accountforparent);
//     }
//   };
//   sendcreditdebit = async (
//     userId: any,
//     narration: string,
//     profit_loss: number,
//     matchId: number,
//     betId: ObjectId,
//     selectionId: number,
//     sportId: number
//   ): Promise<any> => {
//     const getAccStmt = await AccoutStatement.findOne({ userId: userId })
//       .sort({ createdAt: -1 })
//       .lean();
//     const getOpenBal = getAccStmt?.closeBal ? getAccStmt.closeBal : 0;
//     const userAccountData: IAccoutStatement = {
//       userId,
//       narration: narration,
//       amount: profit_loss,
//       type: ChipsType.pnl,
//       txnType: profit_loss > 0 ? TxnType.cr : TxnType.dr,
//       openBal: getOpenBal,
//       closeBal: getOpenBal + +profit_loss,
//       matchId: matchId,
//       betId: betId,
//       selectionId,
//       sportId,
//     };
//     const entryCheck = await AccoutStatement.findOne({
//       txnType: profit_loss > 0 ? TxnType.cr : TxnType.dr,
//       betId: betId,
//       userId: userId,
//     });
//     if (!entryCheck) {
//       const newUserAccStmt = new AccoutStatement(userAccountData);
//       await newUserAccStmt.save();
//       if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
//         return newUserAccStmt._id;
//       } else {
//         return null;
//       }
//     } else {
//       return entryCheck._id;
//     }
//   };
//   updateaccountstatement = async (
//     userId: ObjectId,
//     betid: ObjectId
//   ): Promise<any> => {};
//   apiupdateUserBal = async (req: Request, res: Response): Promise<Response> => {
//     const { userId } = req.body;
//     const userInfo = await User.findOne({ _id: ObjectId(userId) });
//     const ac = await AccoutStatement.aggregate([
//       { $match: { userId: Types.ObjectId(userId) } },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//     ]);
//     const parent = await User.findOne(
//       {
//         parentStr: { $elemMatch: { $eq: Types.ObjectId(userId) } },
//         role: RoleType.user,
//       },
//       { _id: 1 }
//     )
//       .distinct("_id")
//       .lean();
//     if (userInfo?.role == RoleType.user) {
//       parent.push(ObjectId(userId));
//     }
//     const pnl = await AccoutStatement.aggregate([
//       { $match: { userId: { $in: parent }, betId: { $ne: null } } },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//     ]);
//     const withdrawlsum = await AccoutStatement.aggregate([
//       {
//         $match: {
//           userId: Types.ObjectId(userId),
//           betId: { $eq: null },
//           txnId: { $eq: null },
//           txnType: TxnType.dr,
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//     ]);
//     const depositesum = await AccoutStatement.aggregate([
//       {
//         $match: {
//           userId: Types.ObjectId(userId),
//           betId: { $eq: null },
//           txnId: { $ne: null },
//           txnType: TxnType.cr,
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//     ]);
//     const userCr = await User.findOne({ _id: ObjectId(userId) }).select({
//       creditRefrences: 1,
//     });
//     const withdAmt =
//       withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0;
//     const depositeAmt =
//       depositesum && depositesum.length > 0 ? depositesum[0].totalAmount : 0;
//     const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0;
//     const pnl_ =
//       pnl && pnl.length > 0
//         ? pnl[0].totalAmount +
//           withdAmt +
//           depositeAmt -
//           (userCr && userCr.creditRefrences
//             ? parseInt(userCr.creditRefrences)
//             : 0)
//         : 0;
//     ////const bal = await Balance.findOne({ userId: userId }).select({ profitLoss: 1 })
//     //// const pnl_ = bal?.profitLoss ? bal?.profitLoss : 0
//     return this.success(
//       res,
//       { Balance_, pnl_, depositesum, withdrawlsum, pnl },
//       ""
//     );
//   };
//   getCasPlayUrl = async (req: Request, res: Response) => {
//     const { lobby_url, isMobile, ipAddress } = req.body;
//     const userInfo: any = req.user;
//     const gameInfo: any = await CasCasino.findOne({
//       game_identifier: lobby_url,
//     });
//     if (gameInfo) {
//       const payload = {
//         user: userInfo.username,
//         token: "NOt_AVIALBEL",
//         partner_id: "NOt_AVIALBEL",
//         platform: isMobile ? "GPL_MOBILE" : "GPL_DESKTOP",
//         lobby_url: lobby_url,
//         lang: "en",
//         ip: ipAddress,
//         game_id: lobby_url,
//         game_code: lobby_url,
//         currency: "INR",
//         id: userInfo._id,
//         balance: "0.00",
//       };
//       console.log(JSON.stringify(payload));
//       return axios.post("PROVIDER_URL", payload).then((resData) => {
//         const data = resData?.data;
//         if (data?.message != "failed") {
//           this.success(
//             res,
//             { gameInfo: gameInfo, payload: payload, url: resData?.data?.url },
//             "Data Found"
//           );
//         } else {
//           this.fail(res, "Game Not Found");
//         }
//       });
//     } else {
//       this.fail(res, "Game Not Found");
//     }
//   };
// }
//# sourceMappingURL=FancyController.js.map