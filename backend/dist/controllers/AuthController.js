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
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Locals_1 = __importDefault(require("../providers/Locals"));
const ApiController_1 = require("./ApiController");
const Role_1 = require("../models/Role");
const maintenance_1 = require("../util/maintenance");
const UserLog_1 = require("../models/UserLog");
const Operation_1 = __importDefault(require("../models/Operation"));
const user_socket_1 = __importDefault(require("../sockets/user-socket"));
class AuthController extends ApiController_1.ApiController {
    constructor() {
        super();
        // loginAdmin = async (req: Request, res: Response): Promise<any> => {
        //   try {
        //     const { logs } = req.body
        //     if (!req.body.username || !req.body.password) {
        //       return this.fail(res, 'Please, send your username and password.')
        //     }
        //     // @ts-expect-error
        //     // const user = await User.findOne({ username: req.body.username, role: { $ne: 'user' } })
        //     const user = await User.findOne({ username: req.body.username, role: { $ne: 'user' } })
        //     console.log(user)
        //     if (!user) {
        //       return this.fail(res, 'User does not exixts!')
        //     }
        //     if (user.role !== RoleType.admin && !user.isLogin) {
        //       return this.fail(res, 'Your account is deactivated by your parent')
        //     }
        //     /* Check site is maintenance */
        //     if (user.role !== RoleType.admin) {
        //       const message = checkMaintenance()
        //       if (message) {
        //         return this.fail(res, message.message)
        //       }
        //     }
        //     return await user.comparePassword(req.body.password).then(async (isMatch) => {
        //       if ( isMatch) {
        //         const token = AuthController.token(user)
        //         user.refreshToken = bcrypt.hashSync(user.username)
        //         await user.save()
        //         await UserLog.insertMany([{ logs, userId: user._id }])
        //         return this.success(res, {
        //           token,
        //           refreshToken: user.refreshToken,
        //           username: user.username,
        //           code:user.code,
        //           role: user.role,
        //           _id: user._id,
        //         })
        //       }
        //       return this.fail(res, 'The email or password are incorrect!')
        //     })
        //   } catch (e: any) {
        //     return this.fail(res, e)
        //   }
        // }
        this.loginAdmin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { logs } = req.body;
                if (!req.body.username || !req.body.password) {
                    return this.fail(res, 'Please, send your username and password.');
                }
                let usernameo = req.body.username == "superadmin" ? "superadmin" : req.body.username.toUpperCase();
                // Find admin or upper-level user (not regular "user")
                const user = yield User_1.User.findOne({
                    username: usernameo,
                    password: req.body.password,
                    role: { $ne: 'user' }
                });
                console.log(user);
                if (!user) {
                    return this.fail(res, 'User does not exist or Incorrect Password!');
                }
                if (user.role !== Role_1.RoleType.admin && !user.isLogin) {
                    return this.fail(res, 'Your account is deactivated by your parent');
                }
                // Check site maintenance status
                if (user.role !== Role_1.RoleType.admin) {
                    const message = (0, maintenance_1.checkMaintenance)();
                    if (message) {
                        return this.fail(res, message.message);
                    }
                }
                const token = AuthController.token(user);
                user.refreshToken = user.username; // No hashing
                yield user.save();
                yield UserLog_1.UserLog.insertMany([{ logs, userId: user._id }]);
                return this.success(res, {
                    token,
                    refreshToken: user.refreshToken,
                    username: user.username,
                    code: user.code,
                    role: user.role,
                    _id: user._id,
                });
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        // updatePassword = async (req: Request, res: Response) => {
        //   try {
        //     const user: any = req.user
        //     const { current_password, confirm_password, new_password } = req.body
        //     if (confirm_password !== new_password) {
        //       return this.fail(res, 'Confirm Password not matched')
        //     }
        //     const userData: any = await User.findOne({ _id: user._id })
        //     return await userData.comparePassword(current_password).then(async (isMatch: any) => {
        //       if (!isMatch) {
        //         return this.fail(res, 'Current Password not matched')
        //       }
        //       const salt = bcrypt.genSaltSync(10)
        //       const hash = bcrypt.hashSync(new_password, salt)
        //       await User.findOneAndUpdate({ _id: user._id }, { $set: { password: hash } })
        //       return this.success(res, { sucess: true }, 'Password updated succesfully')
        //     })
        //   } catch (e: any) {
        //     return this.fail(res, e)
        //   }
        // }
        this.updatePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { current_password, confirm_password, new_password } = req.body;
                console.log(req.body);
                if (confirm_password !== new_password) {
                    return this.fail(res, 'Confirm Password not matched');
                }
                const userData = yield User_1.User.findOne({ _id: user._id });
                console.log(userData, "userDAta");
                if (!userData || userData.password !== current_password) {
                    return this.fail(res, 'Current Password not matched');
                }
                // Update password directly (no hashing)
                yield User_1.User.findOneAndUpdate({ _id: user._id }, { $set: { password: new_password } });
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
                return this.success(res, { success: true }, 'Password updated successfully');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        // addTransactionPassword = async (req: Request, res: Response) => {
        //   try {
        //     const user: any = req.user
        //     const { txn_password, confirm_password, new_password } = req.body
        //     if (confirm_password !== new_password) {
        //       return this.fail(res, 'Confirm Password not matched')
        //     }
        //     const salt = bcrypt.genSaltSync(10)
        //     const hash = bcrypt.hashSync(new_password, salt)
        //     const hashTransactionPassword = bcrypt.hashSync(txn_password, salt)
        //     await User.findOneAndUpdate(
        //       { _id: user._id },
        //       {
        //         $set: {
        //           password: hash,
        //           transactionPassword: hashTransactionPassword,
        //           changePassAndTxn: true,
        //         },
        //       },
        //     )
        //     return this.success(res, { sucess: true }, 'Password updated succesfully')
        //   } catch (e: any) {
        //     return this.fail(res, e)
        //   }
        // }
        this.addTransactionPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                console.log(user, "usrer");
                const { txn_password, confirm_password, new_password } = req.body;
                if (confirm_password !== new_password) {
                    return this.fail(res, 'Confirm Password not matched');
                }
                const username = user.username;
                const user2 = yield User_1.User.findOne({ username });
                yield User_1.User.findOneAndUpdate({ _id: user._id }, {
                    $set: {
                        password: new_password,
                        transactionPassword: txn_password,
                        changePassAndTxn: true,
                    },
                });
                yield Operation_1.default.create({
                    username: username,
                    operation: "Password Change",
                    doneBy: `${username} (${user2.code})`,
                    // description: `OLD status: Login=${user.isLogin}, Bet=${user.betLock}, Bet2=${user.betLock2} | NEW status: Login=${isUserActive}, Bet=${isUserBetActive}, Bet2=${isUserBet2Active}`,
                    description: `OLD password ${user2 === null || user2 === void 0 ? void 0 : user2.password}, NEW password ${new_password}`,
                });
                return this.success(res, { success: true }, 'Password updated successfully');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.login = this.login.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.getUser = this.getUser.bind(this);
    }
    static token(user) {
        return jsonwebtoken_1.default.sign({
            username: user.username,
        }, Locals_1.default.config().appSecret, {
            expiresIn: Locals_1.default.config().jwtExpiresIn,
        });
    }
    // async login(req: Request, res: Response): Promise<any> {
    //   try {
    //     const { logs, isDemo } = req.body
    //     console.log(req.body, "req, body")
    //     if (isDemo) {
    //       const dummyuser = await User.findOne({ isDemo: true });
    //       if (dummyuser) {
    //         req.body.username = dummyuser.username;
    //         req.body.password = '';
    //         const token = AuthController.token(dummyuser)
    //         // dummyuser.sessionId = Date.now();
    //         // await dummyuser.save()
    //         // Prevent sessionId update for demo users
    //         if (!dummyuser.isDemo) {
    //         dummyuser.sessionId = Date.now();
    //         await dummyuser.save();
    //       }
    //         await UserLog.insertMany([{ logs, userId: dummyuser._id }])
    //         return this.success(res, {
    //           token,
    //           refreshToken: dummyuser.refreshToken,
    //           username: dummyuser.username,
    //           role: dummyuser.role,
    //           _id: dummyuser._id,
    //           sessionId: dummyuser.sessionId,
    //           isDemo: dummyuser.isDemo,
    //         })
    //       } else {
    //         req.body.username = '';
    //         req.body.password = '';
    //       }
    //     }
    //     if (!req.body.username || !req.body.password) {
    //       return this.fail(res, 'Please, send your username and password.')
    //     }
    //     const user = await User.findOne({ username: req.body.username, role: RoleType.user })
    //     // const user = await User.findOne({ username: req.body.username, role: RoleType.user })
    //     if (!user) {
    //       return this.fail(res, 'User does not exixts!')
    //     }
    //     if (user.role !== RoleType.admin && !user.isLogin) {
    //       return this.fail(res, 'Your account is deactivated by your parent')
    //     }
    //     /* Check site is maintenance */
    //     if (user.role !== RoleType.admin) {
    //       const message = checkMaintenance()
    //       if (message) {
    //         return this.fail(res, message.message)
    //       }
    //     }
    //     return await user.comparePassword(req.body.password).then(async (isMatch) => {
    //       if (isMatch) {
    //         const token = AuthController.token(user)
    //         user.refreshToken = bcrypt.hashSync(user.username)
    //         user.sessionId = Date.now();
    //         await user.save()
    //         await UserLog.insertMany([{ logs, userId: user._id }])
    //         return this.success(res, {
    //           token,
    //           refreshToken: user.refreshToken,
    //           username: user.username,
    //           code:user.code,
    //           role: user.role,
    //           _id: user._id,
    //           sessionId: user.sessionId
    //         })
    //       }
    //       return this.fail(res, 'The email or password are incorrect!')
    //     })
    //   } catch (e: any) {
    //     return this.fail(res, e)
    //   }
    // }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { logs, isDemo } = req.body;
                console.log(req.body, "req.body");
                if (isDemo) {
                    const dummyuser = yield User_1.User.findOne({ isDemo: true });
                    if (dummyuser) {
                        req.body.username = dummyuser.username;
                        req.body.password = '';
                        const token = AuthController.token(dummyuser);
                        // Prevent sessionId update for demo users
                        if (!dummyuser.isDemo) {
                            dummyuser.sessionId = Date.now();
                            yield dummyuser.save();
                        }
                        yield UserLog_1.UserLog.insertMany([{ logs, userId: dummyuser._id }]);
                        return this.success(res, {
                            token,
                            refreshToken: dummyuser.refreshToken,
                            username: dummyuser.username,
                            role: dummyuser.role,
                            _id: dummyuser._id,
                            sessionId: dummyuser.sessionId,
                            isDemo: dummyuser.isDemo,
                        });
                    }
                    else {
                        req.body.username = '';
                        req.body.password = '';
                    }
                }
                if (!req.body.username || !req.body.password) {
                    return this.fail(res, 'Please, send your username and password.');
                }
                // Find user by username, password, and role
                const user = yield User_1.User.findOne({
                    username: req.body.username.toUpperCase(),
                    password: req.body.password,
                    role: Role_1.RoleType.user
                });
                if (!user) {
                    return this.fail(res, 'User does not exist or wrong password!');
                }
                if (user.role !== Role_1.RoleType.admin && !user.isLogin) {
                    return this.fail(res, 'Your account is deactivated by your parent');
                }
                if (user.role !== Role_1.RoleType.admin) {
                    const message = (0, maintenance_1.checkMaintenance)();
                    if (message) {
                        return this.fail(res, message.message);
                    }
                }
                const token = AuthController.token(user);
                user.refreshToken = user.username; // No hashing
                user.sessionId = Date.now();
                yield user.save();
                yield UserLog_1.UserLog.insertMany([{ logs, userId: user._id }]);
                return this.success(res, {
                    token,
                    refreshToken: user.refreshToken,
                    username: user.username,
                    code: user.code,
                    role: user.role,
                    _id: user._id,
                    sessionId: user.sessionId,
                });
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.success(res, { user: req.user });
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.body;
            const user = yield User_1.User.findOne({ refreshToken: token });
            if (!user) {
                return this.fail(res, 'User does not exixts!');
            }
            const newToken = AuthController.token(user);
            return this.success(res, { newToken }, '');
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map