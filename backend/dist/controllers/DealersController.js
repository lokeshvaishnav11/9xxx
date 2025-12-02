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
exports.DealersController = void 0;
const AccountStatement_1 = require("../models/AccountStatement");
const Balance_1 = require("../models/Balance");
const Role_1 = require("../models/Role");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const UserBetStake_1 = require("../models/UserBetStake");
const UserChip_1 = require("../models/UserChip");
const Database_1 = require("../providers/Database");
const aggregation_pipeline_pagination_1 = require("../util/aggregation-pipeline-pagination");
const ApiController_1 = require("./ApiController");
const mongoose_2 = require("mongoose");
const FancyController_1 = require("./FancyController");
const user_socket_1 = __importDefault(require("../sockets/user-socket"));
const axios_1 = __importDefault(require("axios"));
const Operation_1 = __importDefault(require("../models/Operation"));
class DealersController extends ApiController_1.ApiController {
    constructor() {
        super();
        // getUserListSuggestion = async (req: Request, res: Response) => {
        //   try {
        //     const { username } = req.body
        //     const regex = new RegExp(username, 'i')
        //     const currentUser: any = req.user
        //     const users = await User.find({
        //       username: { $regex: regex },
        //       parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
        //     })
        //       .select({
        //         _id: 1,
        //         username: 1,
        //         role: 1,
        //       })
        //       .limit(10)
        //     return this.success(res, users)
        //   } catch (e: any) {
        //     return this.fail(res, e)
        //   }
        // }
        this.getUserListSuggestion = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { username } = req.body;
                const regex = new RegExp(username, "i");
                const currentUser = req.user;
                // 🔍 Pehle username se match karne ki koshish karo
                let users = yield User_1.User.find({
                    username: { $regex: regex },
                    parentStr: { $elemMatch: { $eq: mongoose_2.Types.ObjectId(currentUser._id) } },
                })
                    .select({
                    _id: 1,
                    username: 1,
                    role: 1,
                    code: 1, // 👈 include code in response
                })
                    .limit(10);
                // 🔁 Agar username se kuch nahi mila to code field se search karo
                if (users.length === 0) {
                    users = yield User_1.User.find({
                        code: { $regex: regex },
                        parentStr: { $elemMatch: { $eq: mongoose_2.Types.ObjectId(currentUser._id) } },
                    })
                        .select({
                        _id: 1,
                        username: 1,
                        role: 1,
                        code: 1,
                    })
                        .limit(10);
                }
                return this.success(res, users);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.saveGeneralSettings = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionPassword, userId, userSetting } = req.body;
                const { _id, role } = req === null || req === void 0 ? void 0 : req.user;
                const currentUserData = yield User_1.User.findOne({ _id });
                // return await currentUserData
                //   .compareTxnPassword(transactionPassword)
                //   .then(async (isMatch: any) => {
                //     if (!isMatch) {
                //       return this.fail(res, 'Transaction Password not matched')
                //     }
                yield User_1.User.updateMany({
                    $or: [
                        { parentStr: { $elemMatch: { $eq: mongoose_2.Types.ObjectId(_id) } } },
                        { _id: mongoose_2.Types.ObjectId(userId) },
                    ],
                }, { $set: { userSetting } });
                return this.success(res, {}, 'Settings Saved');
                // })
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.resetTransactionPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionPassword, userId } = req.body;
                const { _id, role } = req === null || req === void 0 ? void 0 : req.user;
                const currentUserData = yield User_1.User.findOne({ _id });
                // return await currentUserData
                //   .compareTxnPassword(transactionPassword)
                //   .then(async (isMatch: any) => {
                //     if (!isMatch) {
                //       return this.fail(res, 'Transaction Password not matched')
                //     }
                yield User_1.User.updateOne({ _id: mongoose_2.Types.ObjectId(userId) }, { $set: { changePassAndTxn: false } });
                return this.success(res, {}, 'Settings Saved');
                // })
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.signUp = this.signUp.bind(this);
        this.editComm = this.editComm.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.getUserList = this.getUserList.bind(this);
        this.getUserDetail = this.getUserDetail.bind(this);
        this.getParentUserDetail = this.getParentUserDetail.bind(this);
        // this.saveUserDepositFC = this.saveUserDepositFC.bind(this)
        this.updateUser = this.updateUser.bind(this);
        this.updateUserStatus = this.updateUserStatus.bind(this);
        this.updateUserWallet = this.updateUserWallet.bind(this);
    }
    //   async editComm(req: Request, res: Response): Promise<Response> {
    //     const session = await Database.getInstance().startSession()
    //     try {
    //       session.startTransaction()
    // console.log(req.body,"consoled edit req body")
    //     } catch (e: any) {
    //       await session.abortTransaction()
    //       session.endSession()
    //       return this.fail(res, "server error: " + e.message)
    //     }
    //   }
    editComm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield Database_1.Database.getInstance().startSession();
            console.log(req.body, "req.body");
            try {
                session.startTransaction();
                const { _id, username, code, partnership, share, mcom, scom } = req.body; // Make sure you're sending 'ownPartnership' from frontend
                console.log(req.body, "req.body");
                const userToUpdate = yield User_1.User.findById(_id).session(session);
                console.log(userToUpdate, "usertoupdate");
                if (!userToUpdate) {
                    yield session.abortTransaction();
                    session.endSession();
                    return this.fail(res, "User not found");
                }
                // Only update share
                userToUpdate.share = share;
                userToUpdate.mcom = mcom;
                userToUpdate.scom = scom;
                userToUpdate.code = code;
                //      // Update ownRatio for keys '1' and '2'
                // ['1', '2'].forEach(key => {
                //   if (partnership[key]?.ownRatio !== undefined) {
                //     const newRatio = String(partnership[key].ownRatio); // cast to string
                //     if (!userToUpdate.partnership[key]) {
                //       userToUpdate.partnership[key] = {};
                //     }
                //     userToUpdate.partnership[key].ownRatio = newRatio;
                //     // Notify mongoose that nested object has changed
                //     userToUpdate.markModified(`partnership.${key}.ownRatio`);
                //   }
                // });
                yield userToUpdate.save({ session });
                yield session.commitTransaction();
                session.endSession();
                return this.success(res, {}, "Partnership updated successfully");
            }
            catch (e) {
                yield session.abortTransaction();
                session.endSession();
                return this.fail(res, "Server error: " + e.message);
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield Database_1.Database.getInstance().startSession();
            console.log(req.body, "req.body");
            try {
                session.startTransaction();
                const { _id, username } = req.body; // Make sure you're sending 'ownPartnership' from frontend
                if (!_id) {
                    yield session.abortTransaction();
                    session.endSession();
                    return this.fail(res, "User ID is required");
                }
                console.log(req.body, "req.body");
                const userToDelete = yield User_1.User.findById(_id).session(session);
                console.log(userToDelete, "userToDelete");
                if (!userToDelete) {
                    yield session.abortTransaction();
                    session.endSession();
                    return this.fail(res, "User not found");
                }
                yield userToDelete.deleteOne({ session });
                // Find and delete all users where parentStr array contains _id
                // Convert _id to mongoose.Types.ObjectId
                // @ts-ignore
                const objectId = new mongoose_1.default.Types.ObjectId(_id);
                const usersToDelete = yield User_1.User.find({ parentStr: objectId }).session(session);
                console.log(usersToDelete, "usersToDelete based on parentStr");
                if (usersToDelete.length > 0) {
                    const deleteIds = usersToDelete.map(user => user._id);
                    yield User_1.User.deleteMany({ _id: { $in: deleteIds } }).session(session);
                }
                yield session.commitTransaction();
                session.endSession();
                return this.success(res, {}, "User deleted successfully");
            }
            catch (e) {
                yield session.abortTransaction();
                session.endSession();
                return this.fail(res, "Server error: " + e.message);
            }
        });
    }
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield Database_1.Database.getInstance().startSession();
            let changePassAndTxn = false;
            try {
                session.startTransaction();
                const { password, username, code, share, pshare, mcom, scom, sendamount, parent, partnership, role, fullname, city, phone, creditRefrences, exposerLimit, userSetting,
                // transactionPassword,
                 } = req.body;
                console.log(req.body, "req body for code ");
                const currentUser = req.user;
                const currentUserData = yield User_1.User.findOne({ _id: currentUser._id });
                // return await currentUserData
                //   .compareTxnPassword(transactionPassword)
                //   .then(async (isMatch: any) => {
                //     if (!isMatch) {
                //       return this.fail(res, 'Transaction Password not matched')
                //     }
                const user = yield User_1.User.findOne({ username });
                if (user) {
                    return this.fail(res, 'User already exixts!');
                }
                const parentUser = yield User_1.User.findOne({ username: parent });
                if (!parentUser) {
                    return this.fail(res, 'Parent User not exixts!');
                }
                let updatedUserSetting = {};
                if (role !== Role_1.RoleType.user) {
                    changePassAndTxn = true;
                    let errorMsg = this.validatePartnership(JSON.parse(JSON.stringify(parentUser)), partnership);
                    if (errorMsg) {
                        return this.fail(res, `${errorMsg.game} Partnership should be less then or equal ${errorMsg.parentRatio}`);
                    }
                    updatedUserSetting = this.getUserSetting(userSetting, parentUser.userSetting);
                    console.log(updatedUserSetting, "updated user setting");
                }
                if (role === Role_1.RoleType.user) {
                    if (!exposerLimit)
                        return this.fail(res, 'Exposer Limit is reuired field');
                }
                const newUserParentStr = (parentUser === null || parentUser === void 0 ? void 0 : parentUser.parentStr)
                    ? [...parentUser === null || parentUser === void 0 ? void 0 : parentUser.parentStr, parentUser._id]
                    : [parentUser._id];
                // User Setting
                const userData = {
                    username: code,
                    share,
                    pshare,
                    mcom,
                    scom,
                    code: username,
                    password,
                    role: role,
                    level: parentUser.level + 1,
                    isLogin: true,
                    betLock: true,
                    betLock2: true,
                    parentId: parentUser._id,
                    parentStr: newUserParentStr,
                    fullName: fullname,
                    city: city,
                    phone: phone,
                    creditRefrences,
                    exposerLimit,
                    changePassAndTxn,
                    userSetting: updatedUserSetting,
                };
                const newUser = new User_1.User(userData);
                yield newUser.save({ session });
                if (newUser._id !== undefined && newUser._id !== null) {
                    yield Balance_1.Balance.findOneAndUpdate({ userId: newUser._id }, { balance: 0, exposer: 0, profitLoss: -creditRefrences, mainBalance: 0, commision: 0 }, { new: true, upsert: true, session });
                    if (role === Role_1.RoleType.user) {
                        // const parentStack: any = await UserBetStake.findOne({
                        //   userId: parentUser._id,
                        // }).lean()
                        // delete parentStack._id
                        // delete parentStack.userId
                        yield UserBetStake_1.UserBetStake.findOneAndUpdate({ userId: newUser._id }, Object.assign({}, UserBetStake_1.defaultStack), { new: true, upsert: true, session });
                    }
                }
                if (newUser._id !== undefined && newUser._id !== null && role !== Role_1.RoleType.user) {
                    const partnershipData = this.partnership(partnership, parentUser.partnership, newUser._id);
                    yield User_1.User.findOneAndUpdate({ _id: newUser._id }, { partnership: partnershipData }, { session });
                }
                yield session.commitTransaction();
                session.endSession();
                // const depositReq: Partial<Request> = {
                //   ...req,
                //   user: currentUser, // Pass the original logged-in user (usually the parent or admin)
                //   body: {
                //     userId: newUser._id,
                //     parentUserId: parentUser._id,
                //     amount: sendamount,
                //     narration: 'Initial deposit on signup',
                //     balanceUpdateType: 'D',
                //     // transactionPassword: '123456', // or pass it from signup body if needed
                //   },
                // }
                // const depositRes: Partial<Response> = {
                //   ...res,
                //   status: () => res, // allow chaining like res.status().json()
                //   json: () => res, // dummy implementation for json
                // }
                yield axios_1.default.post("http://localhost:3010/api/user-account-balance", { userId: newUser._id,
                    parentUserId: parentUser._id,
                    amount: sendamount,
                    narration: 'Initial deposit on signup',
                    balanceUpdateType: 'D',
                    transactionPassword: "123456"
                }, {
                    headers: {
                        Authorization: req.headers.authorization || '', // Forward the same JWT token
                    },
                }).then((ress) => {
                    console.log(ress, "res for nwew depost api");
                    return this.success(res, {}, 'New User Added and Funded Successfully');
                }).catch((err) => {
                    console.log(err, "error in adding blance ");
                });
                // })
            }
            catch (e) {
                yield session.abortTransaction();
                session.endSession();
                return this.fail(res, "server error: " + e.message);
            }
        });
    }
    /* this function return this type of object
    "partnership":{
      "exchange":{
          "ownRatio":100,
          "allRatio":[
              {
                  "parent":null,
                  "ratio":100
              }
          ]
      }
    }
    */
    partnership(partnership, parentPartnership, parentId) {
        let partnershipData = {};
        for (let gameType in User_1.GameType) {
            const game = User_1.GameType[gameType];
            let lastParentPopped = this.getLastUserInPartnership(parentPartnership, game);
            let parentRatio = [
                ...parentPartnership[game].allRatio,
                {
                    parent: lastParentPopped.parent,
                    ratio: lastParentPopped.ratio - partnership[game],
                },
                {
                    parent: parentId,
                    ratio: parseInt(partnership[game].toString()),
                },
            ];
            partnershipData[game] = {
                ownRatio: partnership[game],
                allRatio: parentRatio,
            };
        }
        return partnershipData;
    }
    getLastUserInPartnership(parentPartnership, game) {
        return parentPartnership[game].allRatio.pop();
    }
    validatePartnership(parentUser, partnership) {
        for (let gameType in User_1.GameType) {
            const game = User_1.GameType[gameType];
            const checkPartnership = this.getLastUserInPartnership(parentUser.partnership, game);
            if (checkPartnership.ratio - partnership[game] < 0) {
                return { game, parentRatio: checkPartnership.ratio };
            }
        }
        return null;
    }
    // async getUserList(req: Request, res: Response): Promise<Response> {
    //   const { username, page, search, type, status } = req.query
    //   console.log(req.query,"req.query")
    //   const pageNo = page ? (page as string) : '1'
    //   const pageLimit = 20
    //   const currentUser: any = req.user
    //   console.log(currentUser,"curen")
    //   const select = {
    //     _id: 1,
    //     username: 1,
    //     share:1,
    //     mcom:1,
    //     scom:1,
    //     code:1,
    //     parentId: 1,
    //     role: 1,
    //     creditRefrences: 1,
    //     exposerLimit: 1,
    //     isLogin: 1,
    //     betLock: 1,
    //     betLock2: 1,
    //     partnership: 1,
    //     parentStr: 1,
    //     'balance.balance': 1,
    //     'balance.exposer': 1,
    //     'balance.profitLoss': 1,
    //     'balance.mainBalance': 1,
    //     'balance.casinoexposer': 1,
    //   }
    //   const aggregateFilter = [
    //     {
    //       $lookup: {
    //         from: 'balances',
    //         localField: '_id',
    //         foreignField: 'userId',
    //         as: 'balance',
    //       },
    //     },
    //     {
    //       $unwind: '$balance',
    //     },
    //     {
    //       $project: select,
    //     },
    //   ]
    //   let filters: any = []
    //   if (username && search !== 'true') {
    //     const user: IUserModel | null = await this.getUser(username)
    //     console.log(user,"usersss")
    //     filters = paginationPipeLine(
    //       pageNo,
    //       [
    //         {
    //           $match: {
    //             parentId: user?._id,
    //             parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
    //           },
    //         },
    //         ...aggregateFilter,
    //       ],
    //       pageLimit,
    //     )
    //   } else if (search === 'true' && type) {
    //     //if (username) const user: IUserModel | null = await this.getUser(username)
    //     filters = paginationPipeLine(
    //       pageNo,
    //       [
    //         {
    //           $match: {
    //             role: type,
    //             parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
    //           },
    //         },
    //         ...aggregateFilter,
    //       ],
    //       pageLimit,
    //     )
    //   } else if (username && search === 'true') {
    //     filters = paginationPipeLine(
    //       pageNo,
    //       [
    //         {
    //           $match: {
    //             username: new RegExp(username as string, 'i'),
    //             parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
    //           },
    //         },
    //         ...aggregateFilter,
    //       ],
    //       pageLimit,
    //     )
    //   } else {
    //     const { _id, role }: any = req?.user
    //     if (status) {
    //       filters = paginationPipeLine(
    //         pageNo,
    //         [
    //           {
    //             $match: {
    //               parentId: Types.ObjectId(_id),
    //               isLogin: status === 'true',
    //             },
    //           },
    //           ...aggregateFilter,
    //         ],
    //         pageLimit,
    //       )
    //     } else {
    //       if (role !== 'admin') {
    //         filters = paginationPipeLine(
    //           pageNo,
    //           [{ $match: { parentId: Types.ObjectId(_id) } }, ...aggregateFilter],
    //           pageLimit,
    //         )
    //       } else {
    //         console.log(_id)
    //         filters = paginationPipeLine(
    //           pageNo,
    //           [{ $match: { _id: Types.ObjectId(_id) } }, ...aggregateFilter],
    //           pageLimit,
    //         )
    //       }
    //     }
    //   }
    //   const users = await User.aggregate(filters)
    //   return this.success(res, { ...users[0] })
    // } 
    // old code for get Userlist
    getUserList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, page, search, type, status } = req.query;
            console.log(req.query, "req.query");
            const pageNo = page ? page : '1';
            const pageLimit = 999999;
            const currentUser = req.user;
            console.log(currentUser, "curen");
            const select = {
                _id: 1,
                username: 1,
                share: 1,
                password: 1,
                pshare: 1,
                mcom: 1,
                scom: 1,
                code: 1,
                parentId: 1,
                role: 1,
                creditRefrences: 1,
                exposerLimit: 1,
                isLogin: 1,
                betLock: 1,
                betLock2: 1,
                partnership: 1,
                parentStr: 1,
                'balance.balance': 1,
                'balance.exposer': 1,
                'balance.profitLoss': 1,
                'balance.mainBalance': 1,
                'balance.casinoexposer': 1,
                'balance.commision': 1,
            };
            // const aggregateFilter = [
            //   {
            //     $lookup: {
            //       from: 'balances',
            //       localField: '_id',
            //       foreignField: 'userId',
            //       as: 'balance',
            //     },
            //   },
            //   {
            //     $unwind: '$balance',
            //   },
            //   {
            //     $project: select,
            //   },
            // ]
            const aggregateFilter = [
                {
                    $lookup: {
                        from: 'balances',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'balance',
                    },
                },
                {
                    $unwind: '$balance',
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$parentId', '$$userId'] }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'balances',
                                    localField: '_id',
                                    foreignField: 'userId',
                                    as: 'childBalanceData'
                                }
                            },
                            { $unwind: { path: '$childBalanceData', preserveNullAndEmptyArrays: true } },
                            {
                                $group: {
                                    _id: null,
                                    totalChildBalance: { $sum: '$childBalanceData.balance' }
                                }
                            }
                        ],
                        as: 'childBalanceArray'
                    }
                },
                {
                    $addFields: {
                        childBalance: {
                            $ifNull: [{ $arrayElemAt: ['$childBalanceArray.totalChildBalance', 0] }, 0]
                        }
                    }
                },
                {
                    $project: Object.assign(Object.assign({}, select), { childBalance: 1 })
                }
            ];
            let filters = [];
            if (username && search !== 'true') {
                const user = yield this.getUser(username);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                    {
                        $match: {
                            parentStr: { $elemMatch: { $eq: mongoose_2.Types.ObjectId(user._id) } }
                        }
                    },
                    ...aggregateFilter,
                ], pageLimit);
            }
            else if (search === 'true' && type) {
                //if (username) const user: IUserModel | null = await this.getUser(username)
                filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                    {
                        $match: {
                            role: type,
                            parentStr: { $elemMatch: { $eq: mongoose_2.Types.ObjectId(currentUser._id) } },
                        },
                    },
                    ...aggregateFilter,
                ], pageLimit);
            }
            else if (username && search === 'true') {
                filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                    {
                        $match: {
                            username: new RegExp(username, 'i'),
                            parentStr: { $elemMatch: { $eq: mongoose_2.Types.ObjectId(currentUser._id) } },
                        },
                    },
                    ...aggregateFilter,
                ], pageLimit);
            }
            else {
                const { _id, role } = req === null || req === void 0 ? void 0 : req.user;
                if (status) {
                    filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                        {
                            $match: {
                                parentId: mongoose_2.Types.ObjectId(_id),
                                isLogin: status === 'true',
                            },
                        },
                        ...aggregateFilter,
                    ], pageLimit);
                }
                else {
                    if (role !== 'admin') {
                        filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [{ $match: { parentId: mongoose_2.Types.ObjectId(_id) } }, ...aggregateFilter], pageLimit);
                    }
                    else {
                        console.log(_id);
                        filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [{ $match: { _id: mongoose_2.Types.ObjectId(_id) } }, ...aggregateFilter], pageLimit);
                    }
                }
            }
            const users = yield User_1.User.aggregate(filters);
            return this.success(res, Object.assign({}, users[0]));
        });
    }
    getUserList2(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, page, search, type, status } = req.query;
            console.log(req.query, "req.query");
            const pageNo = page ? page : '1';
            const pageLimit = 999999;
            const currentUser = req.user;
            console.log(currentUser, "curen");
            const select = {
                _id: 1,
                username: 1,
                share: 1,
                password: 1,
                pshare: 1,
                mcom: 1,
                scom: 1,
                code: 1,
                parentId: 1,
                role: 1,
                creditRefrences: 1,
                exposerLimit: 1,
                isLogin: 1,
                betLock: 1,
                betLock2: 1,
                partnership: 1,
                parentStr: 1,
                'balance.balance': 1,
                'balance.exposer': 1,
                'balance.profitLoss': 1,
                'balance.mainBalance': 1,
                'balance.casinoexposer': 1,
                'balance.commision': 1,
            };
            // const aggregateFilter = [
            //   {
            //     $lookup: {
            //       from: 'balances',
            //       localField: '_id',
            //       foreignField: 'userId',
            //       as: 'balance',
            //     },
            //   },
            //   {
            //     $unwind: '$balance',
            //   },
            //   {
            //     $project: select,
            //   },
            // ]
            const aggregateFilter = [
                {
                    $lookup: {
                        from: 'balances',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'balance',
                    },
                },
                {
                    $unwind: '$balance',
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$parentId', '$$userId'] }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'balances',
                                    localField: '_id',
                                    foreignField: 'userId',
                                    as: 'childBalanceData'
                                }
                            },
                            { $unwind: { path: '$childBalanceData', preserveNullAndEmptyArrays: true } },
                            {
                                $group: {
                                    _id: null,
                                    totalChildBalance: { $sum: '$childBalanceData.balance' }
                                }
                            }
                        ],
                        as: 'childBalanceArray'
                    }
                },
                {
                    $addFields: {
                        childBalance: {
                            $ifNull: [{ $arrayElemAt: ['$childBalanceArray.totalChildBalance', 0] }, 0]
                        }
                    }
                },
                {
                    $project: Object.assign(Object.assign({}, select), { childBalance: 1 })
                }
            ];
            let filters = [];
            if (username && search !== 'true') {
                const user = yield this.getUser(username);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                    {
                        $match: {
                            parentStr: { $elemMatch: { $eq: mongoose_2.Types.ObjectId(user._id) } }
                        }
                    },
                    ...aggregateFilter,
                ], pageLimit);
            }
            else if (search === 'true' && type) {
                //if (username) const user: IUserModel | null = await this.getUser(username)
                filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                    {
                        $match: {
                            role: type,
                            parentStr: { $elemMatch: { $eq: mongoose_2.Types.ObjectId(currentUser._id) } },
                        },
                    },
                    ...aggregateFilter,
                ], pageLimit);
            }
            else if (username && search === 'true') {
                filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                    {
                        $match: {
                            username: new RegExp(username, 'i'),
                            parentStr: { $elemMatch: { $eq: mongoose_2.Types.ObjectId(currentUser._id) } },
                        },
                    },
                    ...aggregateFilter,
                ], pageLimit);
            }
            else {
                const { _id, role } = req === null || req === void 0 ? void 0 : req.user;
                if (status) {
                    filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                        {
                            $match: {
                                parentId: mongoose_2.Types.ObjectId(_id),
                                isLogin: status === 'true',
                            },
                        },
                        ...aggregateFilter,
                    ], pageLimit);
                }
                else {
                    if (role !== 'admin') {
                        filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [{ $match: { parentId: mongoose_2.Types.ObjectId(_id) } }, ...aggregateFilter], pageLimit);
                    }
                    else {
                        console.log(_id);
                        filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [{ $match: { _id: mongoose_2.Types.ObjectId(_id) } }, ...aggregateFilter], pageLimit);
                    }
                }
            }
            const users = yield User_1.User.aggregate(filters);
            return this.success(res, Object.assign({}, users[0]));
        });
    }
    // ye hai for chil ke childs dekh wala just upar walal
    // async getUserList(req: Request, res: Response): Promise<Response> {
    //   const { username, page, search, type, status } = req.query
    //   console.log(req.query,"req.query")
    //   const pageNo = page ? (page as string) : '1'
    //   const pageLimit = 20
    //   const currentUser: any = req.user
    //   console.log(currentUser,"curen")
    //   const select = {
    //     _id: 1,
    //     username: 1,
    //     share:1,
    //     password:1,
    //     pshare:1,
    //     mcom:1,
    //     scom:1,
    //     code:1,
    //     parentId: 1,
    //     role: 1,
    //     creditRefrences: 1,
    //     exposerLimit: 1,
    //     isLogin: 1,
    //     betLock: 1,
    // betLock2: 1,
    //     partnership: 1,
    //     parentStr: 1,
    //     'balance.balance': 1,
    //     'balance.exposer': 1,
    //     'balance.profitLoss': 1,
    //     'balance.mainBalance': 1,
    //     'balance.casinoexposer': 1,
    //   }
    //   const aggregateFilter = [
    //     {
    //       $lookup: {
    //         from: 'balances',
    //         localField: '_id',
    //         foreignField: 'userId',
    //         as: 'balance',
    //       },
    //     },
    //     {
    //       $unwind: '$balance',
    //     },
    //     {
    //       $project: select,
    //     },
    //   ]
    //   let filters: any = []
    //   if (username && search !== 'true') {
    //     const user: IUserModel | null = await this.getUser(username)
    //     if (!user) {
    //       return res.status(404).json({ message: 'User not found' })
    //     }
    //     filters = paginationPipeLine(
    //       pageNo,
    //       [
    //         {
    //           $match: {
    //             parentId: user?._id,
    //             parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } }
    //           },
    //         },
    //         ...aggregateFilter,
    //       ],
    //       pageLimit,
    //     )
    //   }else if (search === 'true' && type) {
    //     //if (username) const user: IUserModel | null = await this.getUser(username)
    //     filters = paginationPipeLine(
    //       pageNo,
    //       [
    //         {
    //           $match: {
    //             role: type,
    //             parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
    //           },
    //         },
    //         ...aggregateFilter,
    //       ],
    //       pageLimit,
    //     )
    //   } else if (username && search === 'true') {
    //     filters = paginationPipeLine(
    //       pageNo,
    //       [
    //         {
    //           $match: {
    //             username: new RegExp(username as string, 'i'),
    //             parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
    //           },
    //         },
    //         ...aggregateFilter,
    //       ],
    //       pageLimit,
    //     )
    //   } else {
    //     const { _id, role }: any = req?.user
    //     if (status) {
    //       filters = paginationPipeLine(
    //         pageNo,
    //         [
    //           {
    //             $match: {
    //               parentId: Types.ObjectId(_id),
    //               isLogin: status === 'true',
    //             },
    //           },
    //           ...aggregateFilter,
    //         ],
    //         pageLimit,
    //       )
    //     } else {
    //       if (role !== 'admin') {
    //         filters = paginationPipeLine(
    //           pageNo,
    //           [{ $match: { parentId: Types.ObjectId(_id) } }, ...aggregateFilter],
    //           pageLimit,
    //         )
    //       } else {
    //         console.log(_id)
    //         filters = paginationPipeLine(
    //           pageNo,
    //           [{ $match: { _id: Types.ObjectId(_id) } }, ...aggregateFilter],
    //           pageLimit,
    //         )
    //       }
    //     }
    //   }
    //   const users = await User.aggregate(filters)
    //   return this.success(res, { ...users[0] })
    // }
    getUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ username: username });
            return user;
        });
    }
    getUserDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.query;
            const user = yield User_1.User.findOne({ username: username });
            return this.success(res, user);
        });
    }
    getParentUserDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.query;
            const { role } = req === null || req === void 0 ? void 0 : req.user;
            let user;
            if (username === 'superadmin' && role == 'admin') {
                user = yield this.getUserDetailAndBalance(req);
            }
            else {
                user = yield this.getParentDetailAndBalance(req);
            }
            return this.success(res, user);
        });
    }
    getUserDetailAndBalance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.query;
            const select = {
                _id: 1,
                username: 1,
                share: 1,
                password: 1,
                pshare: 1,
                mcom: 1,
                scom: 1,
                code: 1,
                parentId: 1,
                role: 1,
                creditRefrences: 1,
                exposerLimit: 1,
                isLogin: 1,
                betLock: 1,
                betLock2: 1,
                'balance.balance': 1,
                'balance.mainBalance': 1,
                parent: 1,
                'parentBalance.balance': 1,
                userSetting: 1,
            };
            return yield User_1.User.aggregate([
                {
                    $match: { username },
                },
                {
                    $lookup: {
                        from: 'balances',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'balance',
                    },
                },
                {
                    $unwind: '$balance',
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        pipeline: [{ $project: select }],
                        as: 'parent',
                    },
                },
                {
                    $unwind: '$parent',
                },
                {
                    $lookup: {
                        from: 'balances',
                        localField: 'parent._id',
                        foreignField: 'userId',
                        as: 'parentBalance',
                    },
                },
                {
                    $unwind: '$parentBalance',
                },
                {
                    $project: select,
                },
            ]);
        });
    }
    getParentDetailAndBalance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.query;
            const select = {
                _id: 1,
                username: 1,
                parentId: 1,
                role: 1,
                share: 1,
                password: 1,
                pshare: 1,
                mcom: 1,
                scom: 1,
                code: 1,
                creditRefrences: 1,
                exposerLimit: 1,
                isLogin: 1,
                betLock: 1,
                betLock2: 1,
                'balance.balance': 1,
                'balance.mainBalance': 1,
                parent: 1,
                'parentBalance.balance': 1,
                userSetting: 1,
                'balance.commision': 1,
            };
            return yield User_1.User.aggregate([
                {
                    $match: { username },
                },
                {
                    $lookup: {
                        from: 'balances',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'balance',
                    },
                },
                {
                    $unwind: '$balance',
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'parentId',
                        foreignField: '_id',
                        pipeline: [{ $project: select }],
                        as: 'parent',
                    },
                },
                {
                    $unwind: '$parent',
                },
                {
                    $lookup: {
                        from: 'balances',
                        localField: 'parent._id',
                        foreignField: 'userId',
                        as: 'parentBalance',
                    },
                },
                {
                    $unwind: '$parentBalance',
                },
                {
                    $project: select,
                },
            ]);
        });
    }
    getUserSetting(userSettings, parentSettings) {
        let userSettingData = {};
        for (let setting in userSettings) {
            const { minBet, maxBet, delay } = userSettings[setting];
            userSettingData[setting] = {
                minBet: minBet !== '0' || !minBet ? minBet : parentSettings[setting].minBet,
                maxBet: maxBet !== '0' || !maxBet ? maxBet : parentSettings[setting].maxBet,
                delay: delay !== '0' || !delay ? delay : parentSettings[setting].delay,
            };
        }
        return userSettingData;
    }
    saveUserDepositFC(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, narration } = req.body;
                const { _id, role } = req === null || req === void 0 ? void 0 : req.user;
                if (role === 'admin') {
                    const getAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: _id });
                    const getOpenBal = (getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt.closeBal) ? getAccStmt.closeBal : 0;
                    const accountData = {
                        userId: _id,
                        narration,
                        amount,
                        type: AccountStatement_1.ChipsType.fc,
                        txnType: UserChip_1.TxnType.cr,
                        openBal: getOpenBal,
                        closeBal: getOpenBal + +amount,
                    };
                    const newAccStmt = new AccountStatement_1.AccoutStatement(accountData);
                    yield newAccStmt.save();
                    if (newAccStmt._id !== undefined && newAccStmt._id !== null) {
                        yield Balance_1.Balance.findOneAndUpdate({ userId: _id }, { balance: newAccStmt.closeBal }, { new: true, upsert: true });
                    }
                }
                return this.success(res, {}, 'Amount deposited to user');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password, confirmPassword, transactionPassword } = req.body;
                const currentUser = req.user;
                const currentUserData = yield User_1.User.findOne({ _id: currentUser._id });
                console.log(currentUserData, "''fff");
                // return await currentUserData
                //   .compareTxnPassword(transactionPassword)
                //   .then(async (isMatch: any) => {
                //     if (!isMatch) {
                //       return this.fail(res, 'Transaction Password not matched')
                //     }
                const user = yield User_1.User.findOne({ username });
                if (user) {
                    // const salt = bcrypt.genSaltSync(10)
                    // const hash = bcrypt.hashSync(password, salt)
                    let setData = { password };
                    if (user.role !== Role_1.RoleType.admin)
                        setData = Object.assign(Object.assign({}, setData), { changePassAndTxn: false });
                    yield User_1.User.findOneAndUpdate({ _id: user._id }, { $set: setData });
                    if (true) {
                        user_socket_1.default.logoutAll();
                    }
                    else {
                        user_socket_1.default.logout({
                            role: user.role,
                            sessionId: '123',
                            _id: user._id,
                        });
                    }
                    // Create an operation log
                    yield Operation_1.default.create({
                        username: username,
                        operation: "Password Change",
                        doneBy: `${currentUser.username} (${currentUserData.code})`,
                        // description: `OLD status: Login=${user.isLogin}, Bet=${user.betLock}, Bet2=${user.betLock2} | NEW status: Login=${isUserActive}, Bet=${isUserBetActive}, Bet2=${isUserBet2Active}`,
                        description: `OLD password ${user === null || user === void 0 ? void 0 : user.password}, NEW password ${password}`,
                    });
                    return this.success(res, {}, 'User password updated');
                }
                else {
                    return this.fail(res, 'User does not exist!');
                }
                // })
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    // async updateUserStatus(req: Request, res: Response): Promise<Response> {
    //   try {
    //     const { username, isUserActive, isUserBetActive,  isUserBet2Active, transactionPassword, single } = req.body
    //     const currentUser: any = req.user
    //     console.log(req.body,"ressss")
    //     const currentUserData: any = await User.findOne({ _id: currentUser._id })
    //     if (!single) {
    //       // const isMatch = await currentUserData.compareTxnPassword(transactionPassword)
    //       // if (!isMatch) {
    //       //   return this.fail(res, 'Transaction Password not matched')
    //       // }
    //     }
    //     const user = await User.findOne({ username })
    //     if (user) {
    //       await User.updateMany(
    //         {
    //           $or: [
    //             { _id: user._id },
    //             { parentStr: { $elemMatch: { $eq: Types.ObjectId(user._id) } } },
    //           ],
    //         },
    //         {
    //           isLogin: isUserActive,
    //           betLock: isUserBetActive,
    //           betLock2: isUserBet2Active,
    //         },
    //       )
    //       UserSocket.logout({
    //             role: user.role,
    //             sessionId: '123',
    //             _id: user._id,
    //           })
    //           // Create an operation log
    //           await Operation.create({
    //             username: username,
    //             operation: "Status Change",
    //             // doneBy: currentUser.username,
    //             doneBy: `${currentUser.username} (${currentUserData.code})`,
    //             // description: `OLD status: Login=${user.isLogin}, Bet=${user.betLock}, Bet2=${user.betLock2} | NEW status: Login=${isUserActive}, Bet=${isUserBetActive}, Bet2=${isUserBet2Active}`,
    //             description: `OLD status Disable, NEW status Active`,
    //           });
    //       return this.success(res, {}, 'User status updated')
    //     } else {
    //       return this.fail(res, 'User does not exist!')
    //     }
    //   } catch (e: any) {
    //     return this.fail(res, e)
    //   }
    // }
    updateUserStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, isUserActive, isUserBetActive, isUserBet2Active, transactionPassword, single, } = req.body;
                const currentUser = req.user;
                console.log(req.body, "Request body");
                const currentUserData = yield User_1.User.findOne({ _id: currentUser._id });
                if (!single) {
                    // Uncomment this if you want to validate transaction password
                    // const isMatch = await currentUserData.compareTxnPassword(transactionPassword);
                    // if (!isMatch) {
                    //   return this.fail(res, 'Transaction Password not matched');
                    // }
                }
                const user = yield User_1.User.findOne({ username });
                if (!user) {
                    return this.fail(res, 'User does not exist!');
                }
                console.log(currentUserData, "isLogin");
                if (!currentUserData.isLogin) {
                    return this.fail(res, 'You cannot change status ! contact upline');
                }
                // Find all users affected (main user + child users)
                const usersToUpdate = yield User_1.User.find({
                    $or: [
                        { _id: user._id },
                        { parentStr: { $elemMatch: { $eq: mongoose_2.Types.ObjectId(user._id) } } },
                    ],
                });
                if (usersToUpdate.length > 0) {
                    // Update all matched users in the database
                    yield User_1.User.updateMany({ _id: { $in: usersToUpdate.map(u => u._id) } }, {
                        isLogin: isUserActive,
                        betLock: isUserBetActive,
                        betLock2: isUserBet2Active,
                    });
                    // Logout each affected user
                    usersToUpdate.forEach(u => {
                        user_socket_1.default.logout({
                            role: u.role,
                            sessionId: '123',
                            _id: u._id,
                        });
                    });
                    // Create operation log
                    yield Operation_1.default.create({
                        username: username,
                        operation: "Status Change",
                        doneBy: `${currentUser.username} (${currentUserData.code})`,
                        description: `OLD status Disable, NEW status Active`,
                    });
                }
                return this.success(res, {}, 'User status updated');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    updateUserWallet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, amount, walletUpdateType, transactionPassword } = req.body;
                const currentUser = req.user;
                const currentUserData = yield User_1.User.findOne({ _id: currentUser._id });
                // return await currentUserData
                //   .compareTxnPassword(transactionPassword)
                //   .then(async (isMatch: any) => {
                //     if (!isMatch) {
                //       return this.fail(res, 'Transaction Password not matched')
                //     }
                const user = yield User_1.User.findOne({ username });
                let succesMsg;
                if (user) {
                    if (walletUpdateType === 'EXP') {
                        yield User_1.User.findOneAndUpdate({ _id: user._id }, {
                            exposerLimit: amount,
                        });
                        succesMsg = 'User exposure limit updated';
                    }
                    else if (walletUpdateType === 'CRD') {
                        yield User_1.User.findOneAndUpdate({ _id: user._id }, {
                            creditRefrences: amount,
                        });
                        const fancyObj = new FancyController_1.FancyController();
                        yield fancyObj.updateUserAccountStatement([user._id], user.parentStr);
                        succesMsg = 'User credit refrence updated';
                    }
                    return this.success(res, {}, succesMsg);
                }
                else {
                    return this.fail(res, 'User does not exist!');
                }
                // })
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
}
exports.DealersController = DealersController;
//# sourceMappingURL=DealersController.js.map