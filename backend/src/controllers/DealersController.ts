import { Request, Response } from 'express'
import { AccoutStatement, ChipsType, IAccoutStatement } from '../models/AccountStatement'
import { Balance } from '../models/Balance'
import { RoleType } from '../models/Role'
import mongoose from 'mongoose';

import {
  User,
  IUser,
  GameType,
  IUserBetInfo,
  PartnershipType,
  PartnershipAllRatioType,
  IUserModel,
} from '../models/User'
import { UserBetStake, defaultStack } from '../models/UserBetStake'
import { TxnType } from '../models/UserChip'
import { Database } from '../providers/Database'
import { paginationPipeLine } from '../util/aggregation-pipeline-pagination'
import { ApiController } from './ApiController'
import bcrypt from 'bcrypt-nodejs'
import { Types, ObjectId } from 'mongoose'
import { FancyController } from './FancyController'
import UserSocket from '../sockets/user-socket'
import axios from 'axios';
import Operation from '../models/Operation';

export class DealersController extends ApiController {
  constructor() {
    super()
    this.signUp = this.signUp.bind(this)
    this.editComm = this.editComm.bind(this)
    this.deleteUser = this.deleteUser.bind(this)


    this.getUserList = this.getUserList.bind(this)
    this.getUserDetail = this.getUserDetail.bind(this)
    this.getParentUserDetail = this.getParentUserDetail.bind(this)
    // this.saveUserDepositFC = this.saveUserDepositFC.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.updateUserStatus = this.updateUserStatus.bind(this)
    this.updateUserWallet = this.updateUserWallet.bind(this)
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


async editComm(req: Request, res: Response): Promise<Response> {
  const session = await Database.getInstance().startSession();
  console.log(req.body, "req.body");

  try {
    session.startTransaction();
    const { _id, username, code,partnership, share , mcom , scom  } = req.body; // Make sure you're sending 'ownPartnership' from frontend

    console.log(req.body, "req.body")
    const userToUpdate: any = await User.findById(_id).session(session);
    console.log(userToUpdate,"usertoupdate")
    if (!userToUpdate) {
      await session.abortTransaction();
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


  
    await userToUpdate.save({ session });

    await session.commitTransaction();
    session.endSession();
    return this.success(res, {}, "Partnership updated successfully");
  } catch (e: any) {
    await session.abortTransaction();
    session.endSession();
    return this.fail(res, "Server error: " + e.message);
  }
}



async deleteUser(req: Request, res: Response): Promise<Response> {
  const session = await Database.getInstance().startSession();
  console.log(req.body, "req.body");

  try {
    session.startTransaction();
    const { _id, username  } = req.body; // Make sure you're sending 'ownPartnership' from frontend

    if (!_id) {
      await session.abortTransaction();
      session.endSession();
      return this.fail(res, "User ID is required");
    }

    console.log(req.body, "req.body")
    const userToDelete: any = await User.findById(_id).session(session);
    console.log(userToDelete,"userToDelete")
    if (!userToDelete) {
      await session.abortTransaction();
      session.endSession();
      return this.fail(res, "User not found");
    }


    await userToDelete.deleteOne({ session });

    // Find and delete all users where parentStr array contains _id
    // Convert _id to mongoose.Types.ObjectId
    // @ts-ignore
    const objectId = new mongoose.Types.ObjectId(_id);
    const usersToDelete = await User.find({parentStr: objectId  } as any).session(session);
    console.log(usersToDelete, "usersToDelete based on parentStr");

      if (usersToDelete.length > 0) {
        const deleteIds = usersToDelete.map(user => user._id);
        await User.deleteMany({ _id: { $in: deleteIds } }).session(session);
      }


   

    await session.commitTransaction();
    session.endSession();
    return this.success(res, {}, "User deleted successfully");

  } catch (e: any) {
    await session.abortTransaction();
    session.endSession();
    return this.fail(res, "Server error: " + e.message);
  }
}

  async signUp(req: Request, res: Response): Promise<Response> {
    const session = await Database.getInstance().startSession()
    let changePassAndTxn:any = false;
    try {
      session.startTransaction()
      const {
        password,
        username,
        code,
        share,
        pshare,
        mcom,
        scom,
        sendamount,
        parent,
        partnership,
        role,
        fullname,
        city,
        
        phone,
        creditRefrences,
        exposerLimit,
        userSetting,
        // transactionPassword,
      } = req.body

      console.log(req.body, "req body for code ")
      const currentUser: any = req.user
      const currentUserData: any = await User.findOne({ _id: currentUser._id })
      // return await currentUserData
      //   .compareTxnPassword(transactionPassword)
      //   .then(async (isMatch: any) => {
      //     if (!isMatch) {
      //       return this.fail(res, 'Transaction Password not matched')
      //     }

          const user = await User.findOne({ username })
          if (user) {
            return this.fail(res, 'User already exixts!')
          }

          const parentUser: any = await User.findOne({ username: parent })

          if (!parentUser) {
            return this.fail(res, 'Parent User not exixts!')
          }
          let updatedUserSetting = {}
          if (role !== RoleType.user) {
            changePassAndTxn = true;
            let errorMsg = this.validatePartnership(
              JSON.parse(JSON.stringify(parentUser)),
              partnership,
            )

            if (errorMsg) {
              return this.fail(
                res,
                `${errorMsg.game} Partnership should be less then or equal ${errorMsg.parentRatio}`,
              )
            }
            updatedUserSetting = this.getUserSetting(userSetting, parentUser.userSetting)
            console.log(updatedUserSetting, "updated user setting")
          }

          if (role === RoleType.user) {
            if (!exposerLimit) return this.fail(res, 'Exposer Limit is reuired field')
          }

          const newUserParentStr: string[] = parentUser?.parentStr
            ? [...parentUser?.parentStr, parentUser._id]
            : [parentUser._id]

          // User Setting

          const userData: IUser = {
            username:code,
            share,
            pshare,
            mcom,
            scom,
            code:username,
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
          }

          const newUser = new User(userData)
          await newUser.save({ session })

          if (newUser._id !== undefined && newUser._id !== null) {
            await Balance.findOneAndUpdate(
              { userId: newUser._id },
              { balance: 0, exposer: 0, profitLoss: -creditRefrences, mainBalance: 0 , commision:0 },
              { new: true, upsert: true, session },
            )
            if (role === RoleType.user) {
              // const parentStack: any = await UserBetStake.findOne({
              //   userId: parentUser._id,
              // }).lean()

              // delete parentStack._id
              // delete parentStack.userId

              await UserBetStake.findOneAndUpdate(
                { userId: newUser._id },
                { ...defaultStack },
                { new: true, upsert: true, session },
              )
            }
          }

          if (newUser._id !== undefined && newUser._id !== null && role !== RoleType.user) {
            const partnershipData = this.partnership(
              partnership,
              parentUser.partnership!,
              newUser._id,
            )
            await User.findOneAndUpdate(
              { _id: newUser._id },
              { partnership: partnershipData },
              { session },
            )
          }
          await session.commitTransaction()
          session.endSession()



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

       await axios.post("http://localhost:3010/api/user-account-balance", { userId: newUser._id,
            parentUserId: parentUser._id,
            amount: sendamount,
            narration: 'Initial deposit on signup',
            balanceUpdateType: 'D',
            transactionPassword: "123456"
          },
            {
              headers: {
                Authorization: req.headers.authorization || '', // Forward the same JWT token
              },
            }

            
          
          ).then((ress)=>{
            console.log(ress,"res for nwew depost api")
            return this.success(res, {}, 'New User Added and Funded Successfully')

          }).catch((err)=>{
            console.log(err,"error in adding blance ")
          })


        // })
    } catch (e: any) {
      await session.abortTransaction()
      session.endSession()
      return this.fail(res, "server error: " + e.message)
    }
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
  partnership(
    partnership: { [key: string]: number },
    parentPartnership: PartnershipType,
    parentId: string,
  ): PartnershipType {
    let partnershipData: PartnershipType = {}

    for (let gameType in GameType) {
      const game = GameType[gameType as keyof typeof GameType]
      let lastParentPopped: PartnershipAllRatioType = this.getLastUserInPartnership(
        parentPartnership,
        game,
      )

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
      ]

      partnershipData[game] = {
        ownRatio: partnership[game],
        allRatio: parentRatio,
      }
    }
    return partnershipData
  }

  getLastUserInPartnership(parentPartnership: PartnershipType, game: string) {
    return parentPartnership[game].allRatio.pop()!
  }

  validatePartnership(parentUser: IUser, partnership: { [key: string]: number }) {
    for (let gameType in GameType) {
      const game = GameType[gameType as keyof typeof GameType]
      const checkPartnership = this.getLastUserInPartnership(parentUser.partnership!, game)
      if (checkPartnership.ratio - partnership[game] < 0) {
        return { game, parentRatio: checkPartnership.ratio }
      }
    }
    return null
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



  async getUserList(req: Request, res: Response): Promise<Response> {
    const { username, page, search, type, status } = req.query
    console.log(req.query,"req.query")
    const pageNo = page ? (page as string) : '1'
    const pageLimit = 999999

    const currentUser: any = req.user
    console.log(currentUser,"curen")

    const select = {
      _id: 1,
      username: 1,
      share:1,
      password:1,
      pshare:1,
      mcom:1,
      scom:1,
      code:1,
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
      'balance.commision':1,
    }

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
    $project: {
      ...select,
      childBalance: 1
    }
  }
];

    let filters: any = []

    if (username && search !== 'true') {
      const user: IUserModel | null = await this.getUser(username)
    
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
    
      filters = paginationPipeLine(
        pageNo,
        [
          {
            $match: {
              parentStr: { $elemMatch: { $eq: Types.ObjectId(user._id) } }
            }
          },
          ...aggregateFilter,
        ],
        pageLimit,
      )
    }else if (search === 'true' && type) {
      //if (username) const user: IUserModel | null = await this.getUser(username)
      filters = paginationPipeLine(
        pageNo,
        [
          {
            $match: {
              role: type,
              parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
            },
          },
          ...aggregateFilter,
        ],
        pageLimit,
      )
    } else if (username && search === 'true') {
      filters = paginationPipeLine(
        pageNo,
        [
          {
            $match: {
              username: new RegExp(username as string, 'i'),
              parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
            },
          },
          ...aggregateFilter,
        ],
        pageLimit,
      )
    } else {
      const { _id, role }: any = req?.user
      if (status) {
        filters = paginationPipeLine(
          pageNo,
          [
            {
              $match: {
                parentId: Types.ObjectId(_id),
                isLogin: status === 'true',
              },
            },
            ...aggregateFilter,
          ],
          pageLimit,
        )
      } else {
        if (role !== 'admin') {
          filters = paginationPipeLine(
            pageNo,
            [{ $match: { parentId: Types.ObjectId(_id) } }, ...aggregateFilter],
            pageLimit,
          )
        } else {
          console.log(_id)
          filters = paginationPipeLine(
            pageNo,
            [{ $match: { _id: Types.ObjectId(_id) } }, ...aggregateFilter],
            pageLimit,
          )
        }
      }
    }
    const users = await User.aggregate(filters)
    
    return this.success(res, { ...users[0] })
  }


   async getUserList2(req: Request, res: Response): Promise<Response> {
    const { username, page, search, type, status } = req.query
    console.log(req.query,"req.query")
    const pageNo = page ? (page as string) : '1'
    const pageLimit = 999999

    const currentUser: any = req.user
    console.log(currentUser,"curen")

    const select = {
      _id: 1,
      username: 1,
      share:1,
      password:1,
      pshare:1,
      mcom:1,
      scom:1,
      code:1,
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
      'balance.commision':1,
    }

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
    $project: {
      ...select,
      childBalance: 1
    }
  }
];

    let filters: any = []

    if (username && search !== 'true') {
      const user: IUserModel | null = await this.getUser(username)
    
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
    
      filters = paginationPipeLine(
        pageNo,
        [
          {
            $match: {
              parentStr: { $elemMatch: { $eq: Types.ObjectId(user._id) } }
            }
          },
          ...aggregateFilter,
        ],
        pageLimit,
      )
    }else if (search === 'true' && type) {
      //if (username) const user: IUserModel | null = await this.getUser(username)
      filters = paginationPipeLine(
        pageNo,
        [
          {
            $match: {
              role: type,
              parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
            },
          },
          ...aggregateFilter,
        ],
        pageLimit,
      )
    } else if (username && search === 'true') {
      filters = paginationPipeLine(
        pageNo,
        [
          {
            $match: {
              username: new RegExp(username as string, 'i'),
              parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
            },
          },
          ...aggregateFilter,
        ],
        pageLimit,
      )
    } else {
      const { _id, role }: any = req?.user
      if (status) {
        filters = paginationPipeLine(
          pageNo,
          [
            {
              $match: {
                parentId: Types.ObjectId(_id),
                isLogin: status === 'true',
              },
            },
            ...aggregateFilter,
          ],
          pageLimit,
        )
      } else {
        if (role !== 'admin') {
          filters = paginationPipeLine(
            pageNo,
            [{ $match: { parentId: Types.ObjectId(_id) } }, ...aggregateFilter],
            pageLimit,
          )
        } else {
          console.log(_id)
          filters = paginationPipeLine(
            pageNo,
            [{ $match: { _id: Types.ObjectId(_id) } }, ...aggregateFilter],
            pageLimit,
          )
        }
      }
    }
    const users = await User.aggregate(filters)
    
    return this.success(res, { ...users[0] })
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





  async getUser(username: any) {
    const user = await User.findOne({ username: username })
    return user
  }

  async getUserDetail(req: Request, res: Response): Promise<Response> {
    const { username }: any = req.query
    const user = await User.findOne({ username: username })
    return this.success(res, user)
  }

  async getParentUserDetail(req: Request, res: Response): Promise<Response> {
    const { username }: any = req.query
    const { role }: any = req?.user

    let user: any

    if (username === 'superadmin' && role == 'admin') {
      user = await this.getUserDetailAndBalance(req)
    } else {
      user = await this.getParentDetailAndBalance(req)
    }

    return this.success(res, user)
  }

  async getUserDetailAndBalance(req: Request) {
    const { username }: any = req.query

    const select = {
      _id: 1,
      username: 1,
      share:1,
      password:1,
      pshare:1,
      mcom:1,
      scom:1,
      code:1,
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
    }

    return await User.aggregate([
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
    ])
  }

  async getParentDetailAndBalance(req: Request) {
    const { username }: any = req.query

    const select = {
      _id: 1,
      username: 1,
      parentId: 1,
      role: 1,
      share:1,
      password:1,
      pshare:1,
      mcom:1,
      scom:1,
      code:1,
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
      'balance.commision':1,
    }

    return await User.aggregate([
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
    ])
  }

  getUserSetting(userSettings: any, parentSettings: any) {
    let userSettingData: IUserBetInfo = {}

    for (let setting in userSettings) {
      const { minBet, maxBet, delay } = userSettings[setting]
      userSettingData[setting] = {
        minBet: minBet !== '0' || !minBet ? minBet : parentSettings[setting].minBet,
        maxBet: maxBet !== '0' || !maxBet ? maxBet : parentSettings[setting].maxBet,
        delay: delay !== '0' || !delay ? delay : parentSettings[setting].delay,
      }
    }
    return userSettingData
  }

  async saveUserDepositFC(req: Request, res: Response): Promise<Response> {
    try {
      const { amount, narration } = req.body

      const { _id, role }: any = req?.user

      if (role === 'admin') {
        const getAccStmt = await AccoutStatement.findOne({ userId: _id })

        const getOpenBal = getAccStmt?.closeBal ? getAccStmt.closeBal : 0

        const accountData: IAccoutStatement = {
          userId: _id,
          narration,
          amount,
          type: ChipsType.fc,
          txnType: TxnType.cr,
          openBal: getOpenBal,
          closeBal: getOpenBal + +amount,
        }

        const newAccStmt = new AccoutStatement(accountData)
        await newAccStmt.save()

        if (newAccStmt._id !== undefined && newAccStmt._id !== null) {
          await Balance.findOneAndUpdate(
            { userId: _id },
            { balance: newAccStmt.closeBal },
            { new: true, upsert: true },
          )
        }
      }

      return this.success(res, {}, 'Amount deposited to user')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password, confirmPassword, transactionPassword } = req.body
      const currentUser: any = req.user
      const currentUserData: any = await User.findOne({ _id: currentUser._id })
      console.log(currentUserData,"''fff")
      // return await currentUserData
      //   .compareTxnPassword(transactionPassword)
      //   .then(async (isMatch: any) => {
      //     if (!isMatch) {
      //       return this.fail(res, 'Transaction Password not matched')
      //     }

          const user = await User.findOne({ username })
          if (user) {
            // const salt = bcrypt.genSaltSync(10)
            // const hash = bcrypt.hashSync(password, salt)

            let setData: any = { password }
            if (user.role !== RoleType.admin) setData = { ...setData, changePassAndTxn: false }

            await User.findOneAndUpdate({ _id: user._id }, { $set: setData })
            if(true){
              UserSocket.logoutAll()
            }else{
            UserSocket.logout({
              role: user.role,
              sessionId: '123',
              _id: user._id,
            })
          }

            // Create an operation log
            await Operation.create({
              username: username,
              operation: "Password Change",
              doneBy: `${currentUser.username} (${currentUserData.code})`,
              // description: `OLD status: Login=${user.isLogin}, Bet=${user.betLock}, Bet2=${user.betLock2} | NEW status: Login=${isUserActive}, Bet=${isUserBetActive}, Bet2=${isUserBet2Active}`,

              description: `OLD password ${user?.password}, NEW password ${password}`,
            });

            return this.success(res, {}, 'User password updated')
          } else {
            return this.fail(res, 'User does not exist!')
          }
        // })
    } catch (e: any) {
      return this.fail(res, e)
    }
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


  async updateUserStatus(req: Request, res: Response): Promise<Response> {
  try {
    const {
      username,
      isUserActive,
      isUserBetActive,
      isUserBet2Active,
      transactionPassword,
      single,
    } = req.body;

    const currentUser: any = req.user;
    console.log(req.body, "Request body");

    const currentUserData: any = await User.findOne({ _id: currentUser._id });

    if (!single) {
      // Uncomment this if you want to validate transaction password
      // const isMatch = await currentUserData.compareTxnPassword(transactionPassword);
      // if (!isMatch) {
      //   return this.fail(res, 'Transaction Password not matched');
      // }
    }

    const user = await User.findOne({ username });
    if (!user) {
      return this.fail(res, 'User does not exist!');

    }

    console.log(currentUserData,"isLogin")
    if( !currentUserData.isLogin){
      return this.fail(res, 'You cannot change status ! contact upline');

    }
    // Find all users affected (main user + child users)
    const usersToUpdate = await User.find({
      $or: [
        { _id: user._id },
        { parentStr: { $elemMatch: { $eq: Types.ObjectId(user._id) } } },
      ],
    });

    if (usersToUpdate.length > 0) {
      // Update all matched users in the database
      await User.updateMany(
        { _id: { $in: usersToUpdate.map(u => u._id) } },
        {
          isLogin: isUserActive,
          betLock: isUserBetActive,
          betLock2: isUserBet2Active,
        }
      );

      // Logout each affected user
      usersToUpdate.forEach(u => {
        UserSocket.logout({
          role: u.role,
          sessionId: '123', // You may want to replace this with the real sessionId
          _id: u._id,
        });
      });

      // Create operation log
      await Operation.create({
        username: username,
        operation: "Status Change",
        doneBy: `${currentUser.username} (${currentUserData.code})`,
        description: `OLD status Disable, NEW status Active`,
      });
    }

    return this.success(res, {}, 'User status updated');
  } catch (e: any) {
    return this.fail(res, e);
  }
}
  

  async updateUserWallet(req: Request, res: Response): Promise<Response> {
    try {
      const { username, amount, walletUpdateType, transactionPassword } = req.body

      const currentUser: any = req.user
      const currentUserData: any = await User.findOne({ _id: currentUser._id })
      // return await currentUserData
      //   .compareTxnPassword(transactionPassword)
      //   .then(async (isMatch: any) => {
      //     if (!isMatch) {
      //       return this.fail(res, 'Transaction Password not matched')
      //     }

          const user = await User.findOne({ username })
          let succesMsg
          if (user) {
            if (walletUpdateType === 'EXP') {
              await User.findOneAndUpdate(
                { _id: user._id },
                {
                  exposerLimit: amount,
                },
              )
              succesMsg = 'User exposure limit updated'
            } else if (walletUpdateType === 'CRD') {
              await User.findOneAndUpdate(
                { _id: user._id },
                {
                  creditRefrences: amount,
                },
              )

              const fancyObj = new FancyController()
              await fancyObj.updateUserAccountStatement([user._id], user.parentStr)
              succesMsg = 'User credit refrence updated'
            }

            return this.success(res, {}, succesMsg)
          } else {
            return this.fail(res, 'User does not exist!')
          }
        // })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

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

  getUserListSuggestion = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const regex = new RegExp(username, "i");
    const currentUser: any = req.user;

    // 🔍 Pehle username se match karne ki koshish karo
    let users = await User.find({
      username: { $regex: regex },
      parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
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
      users = await User.find({
        code: { $regex: regex },
        parentStr: { $elemMatch: { $eq: Types.ObjectId(currentUser._id) } },
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
  } catch (e: any) {
    return this.fail(res, e);
  }
};


  saveGeneralSettings = async (req: Request, res: Response) => {
    try {
      const { transactionPassword, userId, userSetting } = req.body

      const { _id, role }: any = req?.user
      const currentUserData: any = await User.findOne({ _id })
      // return await currentUserData
      //   .compareTxnPassword(transactionPassword)
      //   .then(async (isMatch: any) => {
      //     if (!isMatch) {
      //       return this.fail(res, 'Transaction Password not matched')
      //     }

          await User.updateMany(
            {
              $or: [
                { parentStr: { $elemMatch: { $eq: Types.ObjectId(_id) } } },
                { _id: Types.ObjectId(userId) },
              ],
            },
            { $set: { userSetting } },
          )

          return this.success(res, {}, 'Settings Saved')
        // })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  resetTransactionPassword = async (req: Request, res: Response) => {
    try {
      const { transactionPassword, userId } = req.body
      const { _id, role }: any = req?.user
      const currentUserData: any = await User.findOne({ _id })
      // return await currentUserData
      //   .compareTxnPassword(transactionPassword)
      //   .then(async (isMatch: any) => {
      //     if (!isMatch) {
      //       return this.fail(res, 'Transaction Password not matched')
      //     }

          await User.updateOne(
            { _id: Types.ObjectId(userId) },
            { $set: { changePassAndTxn: false } },
          )

          return this.success(res, {}, 'Settings Saved')
        // })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
}
