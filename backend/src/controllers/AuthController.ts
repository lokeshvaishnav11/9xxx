import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User, IUserModel } from '../models/User'
import Locals from '../providers/Locals'
import { ApiController } from './ApiController'
import bcrypt from 'bcrypt-nodejs'
import { RoleType } from '../models/Role'
import { checkMaintenance } from '../util/maintenance'
import { UserLog } from '../models/UserLog'
import Operation from '../models/Operation'
import UserSocket from '../sockets/user-socket'

export class AuthController extends ApiController {
  constructor() {
    super()
    this.login = this.login.bind(this)
    this.refreshToken = this.refreshToken.bind(this)
    this.getUser = this.getUser.bind(this)
  }

  static token(user: any) {
    return jwt.sign(
      {
        username: user.username,
      },
      Locals.config().appSecret,
      {
        expiresIn: Locals.config().jwtExpiresIn,
      },
    )
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

  async login(req: Request, res: Response): Promise<any> {
    try {
      const { logs, isDemo } = req.body;

      console.log(req.body, "req.body");

      if (isDemo) {
        const dummyuser = await User.findOne({ isDemo: true });
        if (dummyuser) {
          req.body.username = dummyuser.username;
          req.body.password = '';

          const token = AuthController.token(dummyuser);

          // Prevent sessionId update for demo users
          if (!dummyuser.isDemo) {
            dummyuser.sessionId = Date.now();
            await dummyuser.save();
          }

          await UserLog.insertMany([{ logs, userId: dummyuser._id }]);

          return this.success(res, {
            token,
            refreshToken: dummyuser.refreshToken,
            username: dummyuser.username,
            role: dummyuser.role,
            _id: dummyuser._id,
            sessionId: dummyuser.sessionId,
            isDemo: dummyuser.isDemo,
          });
        } else {
          req.body.username = '';
          req.body.password = '';
        }
      }

      if (!req.body.username || !req.body.password) {
        return this.fail(res, 'Please, send your username and password.');
      }

      // Find user by username, password, and role
      const user = await User.findOne({
        username: req.body.username.toUpperCase(),
        password: req.body.password,
        role: RoleType.user
      });

      if (!user) {
        return this.fail(res, 'User does not exist or wrong password!');
      }

      if (user.role !== RoleType.admin && !user.isLogin) {
        return this.fail(res, 'Your account is deactivated by your parent');
      }

      if (user.role !== RoleType.admin) {
        const message = checkMaintenance();
        if (message) {
          return this.fail(res, message.message);
        }
      }

      const token = AuthController.token(user);
      user.refreshToken = user.username; // No hashing
      user.sessionId = Date.now();
      await user.save();

      await UserLog.insertMany([{ logs, userId: user._id }]);

      return this.success(res, {
        token,
        refreshToken: user.refreshToken,
        username: user.username,
        code: user.code,
        role: user.role,
        _id: user._id,
        sessionId: user.sessionId,
      });

    } catch (e: any) {
      return this.fail(res, e);
    }
  }


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

  loginAdmin = async (req: Request, res: Response): Promise<any> => {
    try {
      const { logs } = req.body;

      if (!req.body.username || !req.body.password) {
        return this.fail(res, 'Please, send your username and password.');
      }
     let usernameo = req.body.username == "superadmin" ? "superadmin" : req.body.username.toUpperCase()

      // Find admin or upper-level user (not regular "user")
      const user = await User.findOne({
        username:usernameo,
        password: req.body.password,
        role: { $ne: 'user' } as any
      });

      console.log(user);

      if (!user) {
        return this.fail(res, 'User does not exist or Incorrect Password!');
      }

      if (user.role !== RoleType.admin && !user.isLogin) {
        return this.fail(res, 'Your account is deactivated by your parent');
      }

      // Check site maintenance status
      if (user.role !== RoleType.admin) {
        const message = checkMaintenance();
        if (message) {
          return this.fail(res, message.message);
        }
      }

      const token = AuthController.token(user);
      user.refreshToken = user.username; // No hashing
      await user.save();

      await UserLog.insertMany([{ logs, userId: user._id }]);

      return this.success(res, {
        token,
        refreshToken: user.refreshToken,
        username: user.username,
        code: user.code,
        role: user.role,
        _id: user._id,
      });

    } catch (e: any) {
      return this.fail(res, e);
    }
  };


  async getUser(req: Request, res: Response): Promise<Response> {
    return this.success(res, { user: req.user })
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    const { token } = req.body

    const user = await User.findOne({ refreshToken: token })

    if (!user) {
      return this.fail(res, 'User does not exixts!')
    }

    const newToken = AuthController.token(user)

    return this.success(res, { newToken }, '')
  }

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

  updatePassword = async (req: Request, res: Response) => {
    try {
      const user: any = req.user;
      const { current_password, confirm_password, new_password } = req.body;
      console.log(req.body)

      if (confirm_password !== new_password) {
        return this.fail(res, 'Confirm Password not matched');
      }

      const userData = await User.findOne({ _id: user._id });
      console.log(userData, "userDAta")
      if (!userData || userData.password !== current_password) {
        return this.fail(res, 'Current Password not matched');
      }

      // Update password directly (no hashing)
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: { password: new_password } }
      );
      if (true) {
        UserSocket.logoutAll()
      } else {
        UserSocket.logout({
          role: user.role,
          sessionId: '123',
          _id: user._id,
        })
      }

      return this.success(res, { success: true }, 'Password updated successfully');
    } catch (e: any) {
      return this.fail(res, e);
    }
  };


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

  addTransactionPassword = async (req: Request, res: Response) => {
    try {
      const user: any = req.user;
      console.log(user, "usrer")
      const { txn_password, confirm_password, new_password } = req.body;

      if (confirm_password !== new_password) {
        return this.fail(res, 'Confirm Password not matched');
      }

      const username = user.username

      const user2 = await User.findOne({ username })

      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            password: new_password,
            transactionPassword: txn_password,
            changePassAndTxn: true,
          },
        }
      );

      await Operation.create({
        username: username,
        operation: "Password Change",
        doneBy: `${username} (${user2.code})`,
        // description: `OLD status: Login=${user.isLogin}, Bet=${user.betLock}, Bet2=${user.betLock2} | NEW status: Login=${isUserActive}, Bet=${isUserBetActive}, Bet2=${isUserBet2Active}`,

        description: `OLD password ${user2?.password}, NEW password ${new_password}`,
      });

      return this.success(res, { success: true }, 'Password updated successfully');
    } catch (e: any) {
      return this.fail(res, e);
    }
  }

}
