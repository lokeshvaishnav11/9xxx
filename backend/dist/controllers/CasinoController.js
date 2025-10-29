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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasinoController = void 0;
const ApiController_1 = require("./ApiController");
const CasinoMatches_1 = require("../models/CasinoMatches");
const Bet_1 = require("../models/Bet");
const ObjectId = require('mongoose').Types.ObjectId;
const FancyController_1 = require("./FancyController");
const user_socket_1 = __importDefault(require("../sockets/user-socket"));
const mongoose_1 = require("mongoose");
const recachegoose_1 = __importDefault(require("recachegoose"));
const CasinoGameResult_1 = require("../models/CasinoGameResult");
const CasCasino_1 = require("../models/CasCasino");
setInterval(() => {
    try {
        new CasinoController().setResultByTimePeriod();
    }
    catch (e) { }
}, 3000);
class CasinoController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.getCasinoList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const games = yield CasinoMatches_1.Casino.find({ status: { $in: [1] } })
                    .sort({ order: 1 })
                    .select({ match_id: 1, slug: 1, title: 1, image: 1, isDisable: 1, order: 1 });
                // @ts-ignore
                // .cache(0, 'casino-all-new-1')
                this.success(res, games, 'Data Found');
            }
            catch (e) {
                const err = e;
                this.fail(res, err.message);
            }
        });
        this.getCasinoIntList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { type, provider, category } = req === null || req === void 0 ? void 0 : req.query;
            try {
                let slotCat = [];
                var condition = {};
                var providerCondition = {};
                if (type == 'slots') {
                    condition = { game_status: "active", game_slot_status: true, game_name: { $not: /Mobile/i } };
                }
                else if (type == 'live-casino') {
                    condition = { game_status: "active", game_slot_status: false, game_name: { $not: /Mobile/i } };
                }
                else if (type == 'virtual-casino') {
                    const regexPattern = /(20-20 DTL|Bollywood|Lucky 7|Virtual)/i;
                    condition = { game_status: "active", game_slot_status: false, game_name: { $regex: regexPattern, $not: /Mobile/i } };
                }
                else if (type == 'fantasy') {
                    const regexPattern = /(Aviator|Crash)/i;
                    condition = { game_status: "active", game_slot_status: false, game_name: { $regex: regexPattern, $not: /Mobile/i } };
                }
                providerCondition = condition;
                //@ts-ignore
                const providers = yield CasCasino_1.CasCasino.aggregate([{
                        $match: providerCondition
                    }, {
                        $group: {
                            _id: "$game_provider",
                            game_image: { $first: "$game_image" }
                        }
                    }, {
                        $sort: {
                            _id: 1
                        }
                    }]);
                const firstProvider = providers === null || providers === void 0 ? void 0 : providers[0];
                console.log(firstProvider);
                if (provider != "undefined" && provider != "null") {
                    condition = Object.assign(Object.assign({}, condition), { game_provider: provider });
                }
                else {
                    condition = Object.assign(Object.assign({}, condition), { game_provider: firstProvider._id });
                }
                const category = yield CasCasino_1.CasCasino.aggregate([{
                        $match: condition
                    }, {
                        $group: {
                            _id: "$game_category",
                        }
                    }, {
                        $sort: {
                            _id: 1
                        }
                    }]);
                const games = yield CasCasino_1.CasCasino.aggregate([{ $match: condition }, {
                        $group: {
                            _id: "$game_identifier",
                            "identifier": { $first: "$game_identifier" },
                            "game_images": { $first: "$game_image" },
                            "provider_id": { $first: "$game_provider" },
                            "provider": { $first: "$game_name" },
                            "game_name": { $first: "$game_name" },
                            "live_category": { $first: "$game_category" },
                            "slot_category": { $first: "$game_category" },
                            "image_url": { $first: "$game_image" },
                        }
                    }, {
                        $sort: {
                            game_name: 1
                        }
                    }]);
                const providerdata = { "message": "ok", "result": games, "providers": providers, "status": "success", "category": category };
                return res.status(200).json(providerdata);
            }
            catch (e) {
                // console.log(e);
                return res.status(200).json({ "message": "failed", "result": [] });
            }
        });
        this.getCasinoData = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.params;
                const games = yield CasinoMatches_1.Casino.findOne({ slug: body.slug });
                this.success(res, games, 'Data Found');
            }
            catch (e) {
                const err = e;
                this.fail(res, err.message);
            }
        });
        // Todo: If you modified any code in setResult function so you need to change below as well
        this.setResult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { casinoType, matchId, beforeResultSet } = req.params;
                if (!casinoType)
                    this.fail(res, 'Casino type is required field');
                // const resultUrl = beforeResultSet
                //   ? `https://casino.drsgames.io/api/results/${casinoType}/${beforeResultSet}`
                //   : `https://casino.drsgames.io/api/results/${casinoType}`
                // const getPendingResults = await axios.get(`${resultUrl}`)
                yield CasinoGameResult_1.CasinoGameResult.updateMany({ 'data.status': 'pending' }, { $set: { 'data.status': 'processing' } });
                return this.success(res, { processing: true });
                const getPendingResults = yield CasinoGameResult_1.CasinoGameResult.find({ status: 'processing' });
                let getAllMatchIds = getPendingResults.map((m) => m.mid);
                if (matchId)
                    getAllMatchIds = [matchId];
                const bets = yield Bet_1.Bet.find({ marketId: { $in: getAllMatchIds } }).lean();
                const notBetsMatchId = getAllMatchIds.filter((o1) => !bets.some((o2) => o1 === o2.marketId));
                const BetsMatchId = getAllMatchIds.filter((o1) => bets.some((o2) => o1 === o2.marketId));
                notBetsMatchId.map((mid) => __awaiter(this, void 0, void 0, function* () {
                    yield CasinoGameResult_1.CasinoGameResult.updateMany({ mid: mid, gameType: casinoType }, { $set: { 'data.status': 'done', 'data.result-over': 'done' } });
                }));
                // Todo: (isBack===true && selectioId===sid)? profit: ((isBack===false && ?selectioId!==sid)?profit:loss)
                const fancyController = new FancyController_1.FancyController();
                let winnerString = '';
                yield getPendingResults.data.data.map((_a) => __awaiter(this, void 0, void 0, function* () {
                    var { mid: marketId, result: selectionId, resultsids, sid50, overResult } = _a, rest = __rest(_a, ["mid", "result", "resultsids", "sid50", "overResult"]);
                    if (BetsMatchId.indexOf(marketId) > -1) {
                        let winSids = [];
                        if (!selectionId && resultsids && resultsids.length > 0) {
                            if (casinoType === 'fivewicket')
                                winSids = resultsids.split(',').map((i) => +i.replace('SID', ''));
                            else if (casinoType === 'Superover')
                                winSids = [1, 2, 7, 9];
                        }
                        let conditionFilterBet = {
                            status: 'pending',
                            bet_on: Bet_1.BetOn.CASINO,
                            marketId: marketId,
                        };
                        if (overResult) {
                            conditionFilterBet = Object.assign(Object.assign({}, conditionFilterBet), { fancystatus: 'yes' });
                        }
                        const userbet = yield Bet_1.Bet.aggregate([
                            {
                                $match: conditionFilterBet,
                            },
                            {
                                $group: {
                                    _id: '$userId',
                                    allBets: { $push: '$$ROOT' },
                                },
                            },
                        ]);
                        let userIdList = [];
                        const parentIdList = [];
                        const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                            let allbets = Item.allBets;
                            if (rest.gameType === 'fivewicket' || rest.gameType === 'Superover')
                                allbets = Item.allBets.filter((b) => {
                                    if (casinoType === 'fivewicket')
                                        return winSids.indexOf(b.selectionId) > -1;
                                    else if (casinoType === 'Superover')
                                        return winSids.indexOf(b.selectionId) > -1;
                                });
                            const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                                let { profitLoss: profitLossAmt } = this.canculatePnl({
                                    ItemBetList,
                                    selectionId,
                                    sid50,
                                    resultsids: casinoType != 'worlimatka'
                                        ? resultsids
                                            ? resultsids.split(',')
                                            : null
                                        : resultsids,
                                    data: rest,
                                });
                                let type_string = ItemBetList.isBack ? 'Back' : 'Lay';
                                let profitlossStatus = profitLossAmt >= 0 ? 'profit' : 'loss';
                                let narration = ItemBetList.matchName +
                                    ' / Rno-' +
                                    ItemBetList.marketId +
                                    ', ' +
                                    profitlossStatus +
                                    '  [ winner: ' +
                                    (rest === null || rest === void 0 ? void 0 : rest.winnersString) +
                                    '] ';
                                winnerString = rest === null || rest === void 0 ? void 0 : rest.winnersString;
                                // +
                                // ItemBetList.selectionName +
                                // ' / ' +
                                // type_string +
                                // ' / ' +
                                // selectionId
                                //For casino game sport id should be 5000
                                yield fancyController.addprofitlosstouser({
                                    userId: ObjectId(Item._id),
                                    bet_id: ObjectId(ItemBetList._id),
                                    profit_loss: isNaN(profitLossAmt) ? 0 : profitLossAmt,
                                    matchId: ItemBetList.matchId,
                                    narration,
                                    sportsType: ItemBetList.sportId,
                                    selectionId: ItemBetList.marketId,
                                    sportId: 5000,
                                });
                                yield Bet_1.Bet.updateOne({ _id: mongoose_1.Types.ObjectId(ItemBetList._id) }, { $set: { pnl: isNaN(profitLossAmt) ? 0 : profitLossAmt } });
                                if (indexBetList == 0) {
                                    ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                        parentIdList.push(ItemParentStr.parent);
                                        userIdList.push(ObjectId(ItemParentStr.parent));
                                    });
                                }
                                user_socket_1.default.betDelete({ betId: ItemBetList._id, userId: ItemBetList.userId });
                            }));
                            yield Promise.all(settle_single);
                            userIdList.push(ObjectId(Item._id));
                        }));
                        let query = {
                            userId: { $in: userIdList },
                            //matchId: matchId,
                            bet_on: Bet_1.BetOn.CASINO,
                            marketId: marketId,
                        };
                        if (!selectionId && resultsids && resultsids.length > 0) {
                            if (casinoType == 'fivewicket')
                                query['selectionId'] = {
                                    $in: resultsids.split(',').map((i) => +i.replace('SID', '')),
                                };
                            if (casinoType == 'Superover')
                                query['selectionId'] = {
                                    $nin: [1, 2, 7, 9],
                                };
                        }
                        if ((casinoType == 'fivewicket' || casinoType == 'Superover') && winnerString) {
                            // await AccoutStatement.updateMany(
                            //   { selectionId: marketId },
                            //   {
                            //     $set: {
                            //       narration: {
                            //         $regexReplace: {
                            //           input: '$narration',
                            //           find: 'undefined',
                            //           replacement: winnerString,
                            //         },
                            //       },
                            //     },
                            //   },
                            // )
                        }
                        yield Promise.all(declare_result);
                        yield Bet_1.Bet.updateMany(query, { $set: { status: 'completed' } });
                        const unique = [...new Set(userIdList)];
                        if (unique.length > 0) {
                            yield fancyController.updateUserAccountStatementCasino(unique, parentIdList);
                        }
                        yield CasinoGameResult_1.CasinoGameResult.updateMany({ mid: marketId, gameType: casinoType }, { $set: { 'data.status': 'done', 'data.result-over': 'done' } });
                    }
                }));
                this.success(res, {
                    notBetsMatchId: notBetsMatchId.length,
                    getAllMatchIds: getAllMatchIds.length,
                });
            }
            catch (e) {
                const err = e;
                this.fail(res, err.message);
            }
        });
        // Todo: If any code modification so you need to modify above as well
        this.setResultByCron = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bets = yield Bet_1.Bet.find({ status: 'pending', bet_on: Bet_1.BetOn.CASINO }).lean();
                const getAllMatchIds = bets.map((data) => data.marketId);
                if (getAllMatchIds.length <= 0)
                    return;
                const getPendingResults = yield CasinoGameResult_1.CasinoGameResult.find({ mid: { $in: getAllMatchIds } });
                this.setPendingResult(getPendingResults);
                this.success(res, {
                    notBetsMatchId: 0,
                    getAllMatchIds: 0,
                });
            }
            catch (e) {
                const err = e;
                this.fail(res, err.message);
            }
        });
        this.setResultByTimePeriod = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const getPendingResults = yield CasinoGameResult_1.CasinoGameResult.find({
                    'data.status': ['processing'],
                });
                this.setPendingResult(getPendingResults);
            }
            catch (e) { }
        });
        this.setPendingResult = (getPendingResults, redisData = false) => {
            const fancyController = new FancyController_1.FancyController();
            let winnerString = '';
            getPendingResults.map((casinoResultData) => __awaiter(this, void 0, void 0, function* () {
                casinoResultData = redisData ? { data: casinoResultData } : casinoResultData;
                let _a = casinoResultData.data, { mid: marketId, result: selectionId, resultsids, sid50 } = _a, rest = __rest(_a, ["mid", "result", "resultsids", "sid50"]);
                let winSids = [];
                const casinoType = casinoResultData.gameType;
                if (!selectionId && resultsids && resultsids.length > 0) {
                    if (casinoType === 'fivewicket')
                        winSids = resultsids.split(',').map((i) => +i.replace('SID', ''));
                    else if (casinoType === 'Superover')
                        winSids = [1, 2, 7, 9];
                }
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: 'pending',
                            bet_on: Bet_1.BetOn.CASINO,
                            marketId: marketId,
                        },
                    },
                    {
                        $group: {
                            _id: '$userId',
                            allBets: { $push: '$$ROOT' },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    if ((rest.gameType === 'fivewicket' || rest.gameType === 'Superover') && !selectionId) {
                        allbets = Item.allBets.filter((b) => {
                            if (casinoType === 'fivewicket')
                                return winSids.indexOf(b.selectionId) > -1;
                            else if (casinoType === 'Superover')
                                return winSids.indexOf(b.selectionId) > -1;
                        });
                    }
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let { profitLoss: profitLossAmt } = this.canculatePnl({
                            ItemBetList,
                            selectionId,
                            sid50,
                            resultsids: casinoType != 'worlimatka' ? (resultsids ? resultsids.split(',') : null) : resultsids,
                            data: rest,
                        });
                        let type_string = ItemBetList.isBack ? 'Back' : 'Lay';
                        let profitlossStatus = profitLossAmt >= 0 ? 'profit' : 'loss';
                        let narration = ItemBetList.matchName +
                            ' / Rno-' +
                            ItemBetList.marketId +
                            ', ' +
                            profitlossStatus +
                            '  [ winner: ' +
                            (rest === null || rest === void 0 ? void 0 : rest.winnersString) +
                            '] ';
                        winnerString = rest === null || rest === void 0 ? void 0 : rest.winnersString;
                        // +
                        // ItemBetList.selectionName +
                        // ' / ' +
                        // type_string +
                        // ' / ' +
                        // selectionId
                        //For casino game sport id should be 5000
                        yield fancyController.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: isNaN(profitLossAmt) ? 0 : profitLossAmt,
                            matchId: ItemBetList.matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.marketId,
                            sportId: 5000,
                        });
                        yield Bet_1.Bet.updateOne({ _id: mongoose_1.Types.ObjectId(ItemBetList._id) }, { $set: { pnl: isNaN(profitLossAmt) ? 0 : profitLossAmt } });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                        user_socket_1.default.betDelete({ betId: ItemBetList._id, userId: ItemBetList.userId });
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                let query = {
                    userId: { $in: userIdList },
                    //matchId: matchId,
                    bet_on: Bet_1.BetOn.CASINO,
                    marketId: marketId,
                };
                if (!selectionId && resultsids && resultsids.length > 0) {
                    if (casinoType == 'fivewicket')
                        query['selectionId'] = {
                            $in: resultsids.split(',').map((i) => +i.replace('SID', '')),
                        };
                    if (casinoType == 'Superover')
                        query['selectionId'] = {
                            $nin: [1, 2, 7, 9],
                        };
                }
                if ((casinoType == 'fivewicket' || casinoType == 'Superover') && winnerString) {
                    // await AccoutStatement.updateMany(
                    //   { selectionId: marketId },
                    //   {
                    //     $set: {
                    //       narration: {
                    //         $regexReplace: {
                    //           input: '$narration',
                    //           find: 'undefined',
                    //           replacement: winnerString,
                    //         },
                    //       },
                    //     },
                    //   },
                    // )
                }
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany(query, { $set: { status: 'completed' } });
                // const unique = [...new Set(userIdList)]
                const unique = [...new Set(userIdList.map(id => id.toString()))].map(id => ObjectId(id));
                if (unique.length > 0) {
                    // const ObjectId = require("mongoose").Types.ObjectId;
                    console.log("unique user list", unique);
                    const userProfits = yield Promise.all(unique.map((userId) => __awaiter(this, void 0, void 0, function* () {
                        var _b, _c;
                        const bets = yield Bet_1.Bet.find({
                            userId: ObjectId(userId),
                            status: "completed",
                            marketId: casinoResultData.mid,
                            bet_on: Bet_1.BetOn.CASINO,
                        });
                        const totalProfitLoss = bets.reduce((sum, bet) => sum + bet.profitLoss, 0);
                        // return {
                        //   userId,
                        //   totalProfitLoss
                        // };
                        if (bets.length > 0) {
                            yield fancyController.cal9xbro(userId, totalProfitLoss, ((_b = bets === null || bets === void 0 ? void 0 : bets[0]) === null || _b === void 0 ? void 0 : _b.marketId) + ((_c = bets === null || bets === void 0 ? void 0 : bets[0]) === null || _c === void 0 ? void 0 : _c.marketName), casinoResultData.mid, bets[0]._id, Bet_1.BetOn.CASINO);
                        }
                    })));
                    // Optional: log or use the result
                    console.log(userProfits);
                    // Continue with your logic
                }
                if (unique.length > 0) {
                    yield fancyController.updateUserAccountStatementCasino(unique, parentIdList);
                }
                yield CasinoGameResult_1.CasinoGameResult.updateMany({ mid: marketId, gameType: casinoType }, { $set: { 'data.status': 'done', 'data.result-over': 'done' } });
            }));
        };
        this.canculatePnl = ({ ItemBetList, selectionId, sid50, resultsids, data }) => {
            sid50 = sid50 ? sid50.split(',') : '';
            let profit_type = 'loss', profitLossAmt = 0;
            let fancy = false;
            switch (ItemBetList.gtype) {
                case 'queen':
                case 'card32':
                case 'card32a':
                    profit_type =
                        ItemBetList.isBack === true && ItemBetList.selectionId == selectionId
                            ? 'profit'
                            : ItemBetList.isBack === false && ItemBetList.selectionId != selectionId
                                ? 'profit'
                                : 'loss';
                    if (profit_type == 'profit') {
                        if (ItemBetList.isBack === true) {
                            profitLossAmt =
                                (parseFloat(ItemBetList.odds.toString()) - 1) *
                                    parseFloat(ItemBetList.stack.toString());
                        }
                        else if (ItemBetList.isBack === false) {
                            profitLossAmt = parseFloat(ItemBetList.stack.toString());
                        }
                    }
                    else if (profit_type == 'loss') {
                        if (ItemBetList.isBack === true) {
                            profitLossAmt = parseFloat(ItemBetList.stack.toString()) * -1;
                        }
                        else if (ItemBetList.isBack === false) {
                            profitLossAmt =
                                (parseFloat(ItemBetList.odds.toString()) - 1) *
                                    parseFloat(ItemBetList.stack.toString()) *
                                    -1;
                        }
                    }
                    break;
                case 'lucky7':
                case 'lucky7B':
                case 'ddb':
                case 'aaa':
                case 'AAA':
                case 'dt20':
                case 'dt20b':
                case 'dtl20':
                case 'dragontiger1Day':
                case 'cmeter2020':
                case 'card32b':
                case 'warcasino':
                case 'Andarbahar':
                case 'Andarbahar2':
                    if (resultsids) {
                        let totalPoints = 0;
                        profit_type =
                            ItemBetList.isBack === true && resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1
                                ? 'profit'
                                : ItemBetList.isBack === false &&
                                    !(resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1)
                                    ? 'profit'
                                    : 'loss';
                        if (ItemBetList.gtype == 'cmeter2020') {
                            totalPoints = parseInt(data.C1) - parseInt(data.C2);
                            if (Math.abs(totalPoints) > 50)
                                totalPoints = 50;
                            profit_type = `SID${ItemBetList.selectionId}` === data.resultsids ? 'profit' : 'loss';
                            // CMeter20 9HH and 10HH win logic
                            if (ItemBetList.selectionId == 1 && data.C3 == 1) {
                                totalPoints = totalPoints - 18;
                                profit_type = parseInt(data.C1) - 9 > parseInt(data.C2) + 9 ? 'profit' : 'loss';
                            }
                            if (ItemBetList.selectionId == 2 && data.C4 == 1) {
                                totalPoints = totalPoints + 20;
                                profit_type = parseInt(data.C2) - 10 > parseInt(data.C1) + 10 ? 'profit' : 'loss';
                            }
                        }
                        if (profit_type == 'profit') {
                            if (ItemBetList.isBack === true) {
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString());
                            }
                            else {
                                profitLossAmt = parseFloat(ItemBetList.stack.toString());
                            }
                        }
                        else if (profit_type == 'loss') {
                            profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            if (ItemBetList.isBack === false) {
                                profitLossAmt = -((parseFloat(ItemBetList.odds.toString()) - 1) *
                                    parseFloat(ItemBetList.stack.toString()));
                            }
                        }
                        if (sid50 && (ItemBetList.gtype !== 'dt20' || ItemBetList.gtype !== 'dt20b')) {
                            profitLossAmt = sid50.includes(`SID${ItemBetList.selectionId}`)
                                ? (ItemBetList.stack / 2) * -1
                                : profitLossAmt;
                        }
                        if (sid50 && (ItemBetList.gtype === 'dt20' || ItemBetList.gtype === 'dt20b')) {
                            profitLossAmt = sid50.includes(`SID${ItemBetList.selectionId}`)
                                ? (parseFloat(ItemBetList.odds.toString()) - 1) *
                                    parseFloat(ItemBetList.stack.toString())
                                : profitLossAmt;
                        }
                        if (ItemBetList.gtype === 'ddb' &&
                            ItemBetList.selectionId == 7 &&
                            ItemBetList.isBack === false &&
                            data['C1'].slice(0, -2) === 'Q') {
                            profitLossAmt = parseFloat(ItemBetList.stack.toString());
                        }
                        if (ItemBetList.gtype === 'cmeter2020') {
                            if (profit_type == 'profit') {
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString()) *
                                        Math.abs(totalPoints);
                            }
                            else {
                                profitLossAmt =
                                    -(parseFloat(ItemBetList.odds.toString()) - 1.15) *
                                        parseFloat(ItemBetList.stack.toString()) *
                                        Math.abs(totalPoints);
                            }
                            ItemBetList.volume = profit_type === 'profit' ? totalPoints : -Math.abs(totalPoints);
                        }
                    }
                    break;
                case 'baccarat':
                case 'baccarat2':
                    if (resultsids) {
                        profit_type = resultsids.indexOf(`sid${ItemBetList.selectionId}`) > -1 ? 'profit' : 'loss';
                        if (profit_type == 'profit') {
                            profitLossAmt = parseFloat(ItemBetList.pnl);
                            if (ItemBetList.odds == 1)
                                profitLossAmt =
                                    parseFloat(ItemBetList.odds.toString()) * parseFloat(ItemBetList.stack.toString());
                            else if (ItemBetList.odds > 0 || ItemBetList.odds < 1)
                                profitLossAmt =
                                    (parseFloat('1') + parseFloat(ItemBetList.odds.toString())) *
                                        parseFloat(ItemBetList.stack.toString()) -
                                        parseFloat(ItemBetList.stack.toString());
                            else
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString());
                        }
                        else if (profit_type == 'loss') {
                            profitLossAmt = parseFloat(ItemBetList.stack.toString()) * -1;
                        }
                        if (selectionId == 3 && (ItemBetList.selectionId == 1 || ItemBetList.selectionId == 2)) {
                            profitLossAmt = 0;
                            profit_type = 'profit';
                        }
                        if (sid50) {
                            profitLossAmt = sid50.includes(`sid${ItemBetList.selectionId}`)
                                ? ItemBetList.stack / 2
                                : profitLossAmt;
                        }
                    }
                    break;
                case 'onedaypoker':
                case 'onedaypoker20':
                case 'Tp1Day':
                case 'teen20':
                case 'poker6player':
                case 'opentp':
                case 'testtp':
                case 'worliinstant':
                    if (resultsids || selectionId) {
                        if (ItemBetList.gtype === 'worliinstant' && ItemBetList.selectionId > 10) {
                            ItemBetList.odds = 5;
                        }
                        if (ItemBetList.gtype == 'Tp1Day') {
                            ItemBetList.odds = ItemBetList.odds;
                        }
                        if (resultsids && resultsids.length > 0) {
                            profit_type =
                                ItemBetList.isBack === true &&
                                    resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1
                                    ? 'profit'
                                    : ItemBetList.isBack === false &&
                                        !(resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1)
                                        ? 'profit'
                                        : 'loss';
                        }
                        else {
                            profit_type =
                                ItemBetList.isBack === true && ItemBetList.selectionId == selectionId
                                    ? 'profit'
                                    : ItemBetList.isBack === false && ItemBetList.selectionId != selectionId
                                        ? 'profit'
                                        : 'loss';
                        }
                        if (profit_type == 'profit') {
                            if (ItemBetList.isBack === true) {
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString());
                            }
                            else if (ItemBetList.isBack === false)
                                profitLossAmt = parseFloat(ItemBetList.stack.toString());
                            if (ItemBetList.gtype === 'onedaypoker' || ItemBetList.gtype === 'teen20') {
                                if (data.odds) {
                                    const oddsData = data.odds; //JSON.parse(data.odds)
                                    if (oddsData && oddsData[`SID${ItemBetList.selectionId}`]) {
                                        profitLossAmt =
                                            parseFloat(oddsData[`SID${ItemBetList.selectionId}`]) *
                                                parseFloat(ItemBetList.stack.toString());
                                    }
                                }
                            }
                            // profitLossAmt =
                            //   (parseFloat(ItemBetList.odds.toString()) - 1) *
                            //   parseFloat(ItemBetList.stack.toString())
                        }
                        else if (profit_type == 'loss') {
                            if (ItemBetList.isBack === true)
                                profitLossAmt = parseFloat(ItemBetList.stack.toString()) * -1;
                            else {
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString()) *
                                        -1;
                            }
                            if (ItemBetList.gtype == 'worliinstant') {
                                if (ItemBetList.selectionId > 10) {
                                    profitLossAmt =
                                        parseFloat(ItemBetList.odds.toString()) *
                                            parseFloat(ItemBetList.stack.toString()) *
                                            -1;
                                }
                                else {
                                    profitLossAmt = parseFloat(ItemBetList.stack.toString()) * -1;
                                }
                            }
                        }
                        if (data.abandoned) {
                            profitLossAmt = 0;
                            profit_type = 'profit';
                        }
                        if (sid50) {
                            profitLossAmt = sid50.includes(`SID${ItemBetList.selectionId}`)
                                ? ItemBetList.stack / 2
                                : profitLossAmt;
                        }
                    }
                    break;
                case 'race2020':
                    if (ItemBetList.selectionId == 5) {
                        // This logic for total points
                        profit_type =
                            ItemBetList.isBack == false && parseInt(data.totalPoints) < parseInt(ItemBetList.odds)
                                ? 'profit'
                                : profit_type;
                        profit_type =
                            ItemBetList.isBack == true && parseInt(data.totalPoints) >= parseInt(ItemBetList.odds)
                                ? 'profit'
                                : profit_type;
                        fancy = true;
                    }
                    else if (ItemBetList.selectionId == 6) {
                        // This logic for total cards
                        profit_type =
                            ItemBetList.isBack == false && parseInt(data.totalCards) < parseInt(ItemBetList.odds)
                                ? 'profit'
                                : profit_type;
                        profit_type =
                            ItemBetList.isBack == true && parseInt(data.totalCards) >= parseInt(ItemBetList.odds)
                                ? 'profit'
                                : profit_type;
                        fancy = true;
                    }
                    else {
                        profit_type =
                            ItemBetList.isBack === true && resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1
                                ? 'profit'
                                : ItemBetList.isBack === false &&
                                    !(resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1)
                                    ? 'profit'
                                    : 'loss';
                    }
                    if (profit_type == 'profit') {
                        if (fancy) {
                            profitLossAmt = ItemBetList.isBack
                                ? (parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
                                : ItemBetList.stack;
                        }
                        else {
                            profitLossAmt = ItemBetList.isBack
                                ? (parseFloat(ItemBetList.odds.toString()) - 1) *
                                    parseFloat(ItemBetList.stack.toString())
                                : ItemBetList.stack;
                        }
                    }
                    else {
                        if (fancy) {
                            profitLossAmt = ItemBetList.isBack
                                ? -ItemBetList.stack
                                : -(parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100;
                        }
                        else {
                            profitLossAmt = ItemBetList.isBack
                                ? -ItemBetList.stack
                                : -((parseFloat(ItemBetList.odds.toString()) - 1) *
                                    parseFloat(ItemBetList.stack.toString()));
                        }
                    }
                    break;
                case 'Superover':
                case 'fivewicket':
                    // This sids for superover
                    if ([3, 5].indexOf(parseInt(ItemBetList.selectionId.toString())) > -1) {
                        fancy = true;
                    }
                    if (ItemBetList.marketName.indexOf('Fancy Market') > -1 &&
                        ItemBetList.gtype == 'fivewicket') {
                        fancy = true;
                    }
                    if (ItemBetList.marketName.indexOf('Fancy Market') > -1 && resultsids) {
                        profit_type =
                            ItemBetList.isBack === true && parseInt(data.totalRuns) >= parseInt(ItemBetList.odds)
                                ? 'profit'
                                : ItemBetList.isBack === false &&
                                    parseInt(data.totalRuns) < parseInt(ItemBetList.odds)
                                    ? 'profit'
                                    : 'loss';
                        profitLossAmt = this.profitLossCalculation({
                            ItemBetList,
                            profit_type,
                            profitLossAmt,
                            fancy,
                        });
                    }
                    else if (ItemBetList.marketName.indexOf('Fancy1 Market') > -1) {
                        profit_type =
                            ItemBetList.isBack === true && resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1
                                ? 'profit'
                                : ItemBetList.isBack === false &&
                                    !(resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1)
                                    ? 'profit'
                                    : 'loss';
                        profitLossAmt = this.profitLossCalculation({
                            ItemBetList,
                            profit_type,
                            profitLossAmt,
                            fancy,
                        });
                    }
                    else if (selectionId) {
                        profit_type =
                            ItemBetList.isBack === true && ItemBetList.selectionId == selectionId
                                ? 'profit'
                                : ItemBetList.isBack === false && ItemBetList.selectionId != selectionId
                                    ? 'profit'
                                    : 'loss';
                        profitLossAmt = this.profitLossCalculation({
                            ItemBetList,
                            profit_type,
                            profitLossAmt,
                            fancy,
                        });
                    }
                    break;
                case 'Cards3J':
                    const userCards = [ItemBetList.C1, ItemBetList.C2, ItemBetList.C3];
                    const cardValues = {
                        '2': 2,
                        '3': 3,
                        '4': 4,
                        '5': 5,
                        '6': 6,
                        '7': 7,
                        '8': 8,
                        '9': 9,
                        '10': 10,
                        J: 'J',
                        Q: 'Q',
                        K: 'K',
                        A: 1,
                    };
                    const resultCards = [
                        cardValues[data.C1.slice(0, -2)],
                        cardValues[data.C2.slice(0, -2)],
                        cardValues[data.C3.slice(0, -2)],
                    ];
                    const winner = userCards.reduce((isCard, card) => {
                        if (resultCards.includes(card))
                            isCard = true;
                        return isCard;
                    }, false);
                    if (ItemBetList.isBack && winner) {
                        profit_type = 'profit';
                    }
                    else if (ItemBetList.isBack === false && !winner) {
                        profit_type = 'profit';
                    }
                    else {
                        profit_type = 'loss';
                    }
                    if (profit_type == 'profit') {
                        profitLossAmt = ItemBetList.isBack
                            ? (parseFloat(ItemBetList.odds.toString()) - 1) *
                                parseFloat(ItemBetList.stack.toString())
                            : ItemBetList.stack;
                    }
                    else {
                        profitLossAmt = ItemBetList.isBack
                            ? -ItemBetList.stack
                            : -((parseFloat(ItemBetList.odds.toString()) - 1) *
                                parseFloat(ItemBetList.stack.toString()));
                    }
                    break;
                case 'cricket2020':
                    const totalRuns = parseInt(ItemBetList.selectionId.toString()) + 1 + parseInt(selectionId);
                    if (ItemBetList.isBack && totalRuns >= 12) {
                        profit_type = 'profit';
                    }
                    else if (ItemBetList.isBack == false && totalRuns < 12) {
                        profit_type = 'profit';
                    }
                    if (profit_type == 'profit') {
                        profitLossAmt = ItemBetList.isBack
                            ? (parseFloat(ItemBetList.odds.toString()) - 1) *
                                parseFloat(ItemBetList.stack.toString())
                            : ItemBetList.stack;
                    }
                    else {
                        profitLossAmt = ItemBetList.isBack
                            ? -ItemBetList.stack
                            : -((parseFloat(ItemBetList.odds.toString()) - 1) *
                                parseFloat(ItemBetList.stack.toString()));
                    }
                    break;
                case 'worlimatka':
                    const userCardsC1 = ItemBetList.C1;
                    const userCardsC3 = ItemBetList.C3;
                    const resultsData = data.resultsids;
                    if (resultsData[userCardsC3]) {
                    }
                    break;
            }
            return {
                profitLoss: profitLossAmt,
                profit_type,
            };
        };
        this.profitLossCalculation = ({ ItemBetList, profit_type, profitLossAmt, fancy }) => {
            if (profit_type == 'profit') {
                if (fancy) {
                    profitLossAmt = ItemBetList.isBack
                        ? (parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
                        : ItemBetList.stack;
                }
                else {
                    profitLossAmt = ItemBetList.isBack
                        ? (parseFloat(ItemBetList.odds.toString()) - 1) * parseFloat(ItemBetList.stack.toString())
                        : ItemBetList.stack;
                }
            }
            else if (profit_type == 'loss') {
                if (fancy) {
                    profitLossAmt = ItemBetList.isBack
                        ? -ItemBetList.stack
                        : -(parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100;
                }
                else {
                    profitLossAmt = ItemBetList.isBack
                        ? -ItemBetList.stack
                        : -((parseFloat(ItemBetList.odds.toString()) - 1) *
                            parseFloat(ItemBetList.stack.toString()));
                }
            }
            return profitLossAmt;
        };
        this.disableCasinoGame = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { matchId } = req.query;
                console.log('matchId', matchId);
                if (matchId) {
                    const casino = yield CasinoMatches_1.Casino.findOne({ match_id: matchId });
                    if (casino) {
                        // @ts-ignore
                        yield casino.updateOne({ $set: { isDisable: !casino.isDisable } });
                        recachegoose_1.default.clearCache(0, 'casino-all-NEW');
                        return this.success(res, {}, 'Casino game disabled');
                    }
                }
                return this.fail(res, 'Match id required field');
            }
            catch (e) {
                const err = e;
                return this.fail(res, err.message);
            }
        });
        this.saveCasinoMatchData = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = req.body;
                yield CasinoGameResult_1.CasinoGameResult.findOneAndUpdate({ mid: data.mid }, { mid: data.mid, gameType: data.gameType, data: Object.assign(Object.assign({}, data), { status: 'processing' }) }, { new: true, upsert: true });
                this.success(res, {}, 'Save casino match data successfully!');
            }
            catch (e) {
                const err = e;
                return this.fail(res, err.message);
            }
        });
        this.results = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let { type: gameType } = req.params;
            let { filter_date, page, roundId } = req.query;
            try {
                if (gameType === 'AAA')
                    gameType = 'aaa';
                const date = new Date();
                let day = date.getDate();
                let month = date.getMonth() + 1;
                let year = date.getFullYear();
                const dateFilter = filter_date
                    ? new Date(filter_date.toString())
                    : new Date(`${day}-${month}-${year}`);
                let query = {
                    gameType,
                    createdAt: { $gte: dateFilter },
                };
                if (roundId) {
                    query = Object.assign(Object.assign({}, query), { mid: { $regex: roundId } });
                }
                const results = yield CasinoGameResult_1.CasinoGameResult.paginate(query, {
                    page: page ? +page : 1,
                    limit: 50,
                    select: ['mid', 'gameType', 'data'],
                    sort: { createdAt: -1 },
                });
                return this.success(res, results);
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        this.htmlCards = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { type, roundId } = req.params;
            console.log(type, roundId, "ddf");
            try {
                let casinoType = yield CasinoGameResult_1.CasinoGameResult.findOne({ mid: roundId });
                console.log(casinoType, "caisnotype");
                // const html = casinoType?.data?.html old one
                const html = casinoType === null || casinoType === void 0 ? void 0 : casinoType.data;
                return this.success(res, { html });
            }
            catch (e) {
                return this.fail(res, e.stack);
            }
        });
    }
}
exports.CasinoController = CasinoController;
//# sourceMappingURL=CasinoController.js.map