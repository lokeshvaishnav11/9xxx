import { Request, Response } from 'express'
import { Types } from 'mongoose'
import {
  AccoutStatement,
  ChipsType,
  IAccoutStatement,
  IAccoutStatementModel,
} from '../models/AccountStatement'
import { Balance } from '../models/Balance'
import { TxnType } from '../models/UserChip'
import { ApiController } from './ApiController'
import { paginationPipeLine } from '../util/aggregation-pipeline-pagination'
import { IUserModel, User } from '../models/User'
import { RoleType } from '../models/Role'
import UserSocket from '../sockets/user-socket'
import { ledger } from '../models/allledager'
import { chdir } from 'node:process'
import axios from 'axios'
import Operation from '../models/Operation'
import Notice from '../models/Notice'
import ManageOdds from '../models/ManageOdds'
import { ChildProcess } from 'node:child_process'
const mongoose = require('mongoose');

export class AccountController extends ApiController {
  constructor() {
    super()
    this.saveUserDepositFC = this.saveUserDepositFC.bind(this)
  }

  async saveUserDepositFC(req: Request, res: Response): Promise<Response> {
    try { 
      const { userId, parentUserId, amount, narration, balanceUpdateType, transactionPassword } =
        req.body
      const { _id, role }: any = req?.user

      console.log(req.user ,"request user of deposit")


      console.log(req.body ,"request body of deposit")

      const parentBal: any = await Balance.findOne({ userId: Types.ObjectId(parentUserId) })
      // const userData = await User.findOne({
      //   parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUserId) } },
      //   _id: Types.ObjectId(userId),
      // })
      const select = {
        _id: 1,
        username: 1,
        parent: 1,
      }
      let userData: any = await User.aggregate([
        {
          $match: {
            _id: Types.ObjectId(userId),
            parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUserId) } },
          },
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
          $project: select,
        },
      ])

      userData = userData.length > 0 ? userData[0] : { _id: null }

      if (!userData?._id && role !== RoleType.admin) {
        return this.fail(res, 'Not a valid parent')
      }

      if (
        balanceUpdateType === 'D' &&
        parentBal.balance - parentBal.exposer < amount &&
        role !== RoleType.admin
      ) {
        return this.fail(res, 'Insufficient amount')
      }

      const currentUserData: any = await User.findOne({ _id })
      // return await currentUserData
      //   // .compareTxnPassword(transactionPassword)
      //   .then(async (isMatch: any) => {
      //     // if (!isMatch) {
          //   return this.fail(res, 'Transaction Password noth matched')
          // }

          let userAccBal
          let successMsg

          if (role === 'admin' && userId == _id) {
            if (balanceUpdateType === 'D') {
              userAccBal = await this.depositAdminAccountBalance(req, userData)
              successMsg = 'Amount deposited to user'
            } else if (balanceUpdateType === 'W') {
              userAccBal = await this.withdrawAdminAccountBalance(req, userData)
              successMsg = 'Successfully withdrawl of amount'
            }
          } else {
            if (balanceUpdateType === 'D') {
              userAccBal = await this.depositAccountBalance(req, userData)
              successMsg = 'Amount deposited to user'
            } else if (balanceUpdateType === 'W') {
              const { userId, amount } = req.body
              const getBalWithExp: any = await Balance.findOne({ userId })
              if (getBalWithExp.balance - getBalWithExp.exposer < amount) {
                return this.fail(res, 'Insufficient amount to withdrawl')
              }
              userAccBal = await this.withdrawAccountBalance(req, userData)
              successMsg = 'Successfully withdrawl of amount'
            }
          }
          UserSocket.setExposer({
            balance: userAccBal,
            userId: userId,
          })
          const pnlData: any = await this.calculatepnl(userId, balanceUpdateType)
          return this.success(res, { balance: userAccBal, profitLoss: pnlData }, successMsg)
        // })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async depositAdminAccountBalance(req: Request, userData: any) {
    const { _id, username }: any = req?.user
    let userAccBal

    const { amount, narration } = req.body

    const getAccStmt = await AccoutStatement.findOne({ userId: _id }, null, {
      sort: { createdAt: -1 },
    })

    const getOpenBal = getAccStmt?.closeBal ? getAccStmt.closeBal : 0

    const accountData: IAccoutStatement = {
      userId: _id,
      narration,
      amount,
      type: ChipsType.fc,
      txnType: TxnType.cr,
      openBal: getOpenBal,
      closeBal: getOpenBal + +amount,
      txnBy: `${username}/${userData.username}`,
    }

    const newAccStmt = new AccoutStatement(accountData)
    await newAccStmt.save()

    if (newAccStmt._id !== undefined && newAccStmt._id !== null) {
      const mbal = await this.getUserDepWithBalance(_id)

      await Balance.findOneAndUpdate(
        { userId: _id },
        { balance: newAccStmt.closeBal, mainBalance: mbal },
        { new: true, upsert: true },
      )

      userAccBal = newAccStmt.closeBal
    }
    return userAccBal
  }

  async getUserBalance(userId: string) {
    const ac = await AccoutStatement.aggregate([
      { $match: { userId: Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])
    const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0
    return Balance_
  }

  async getUserDepWithBalance(userId: string) {
    const ac = await AccoutStatement.aggregate([
      { $match: { userId: Types.ObjectId(userId), type: ChipsType.fc } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])
    const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0
    return Balance_
  }

  async depositAccountBalance(req: Request, userData: any) {
    const { userId, parentUserId, amount, narration } = req.body
    const { _id, username }: any = req.user

    let userAccBal

    // const getAccStmt = await AccoutStatement.findOne({ userId: userId }, null, {
    //   sort: { createdAt: -1 },
    // })

    const getParentAccStmt = await AccoutStatement.findOne({ userId: parentUserId }, null, {
      sort: { createdAt: -1 },
    })

    const getOpenBal = await this.getUserBalance(userId)

    const userAccountData: IAccoutStatement = {
      userId,
      narration,
      amount,
      type: ChipsType.fc,
      txnType: TxnType.cr,
      openBal: getOpenBal,
      closeBal: getOpenBal + +amount,
      txnBy: `${username}/${userData.parent.username}`, //parent username here
    }

    const newUserAccStmt = new AccoutStatement(userAccountData)
    await newUserAccStmt.save()

    if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
      const pnlData = await this.calculatepnl(userId, 'd')
      const mbal = await this.getUserDepWithBalance(userId)
      await Balance.findOneAndUpdate(
        { userId },
        { balance: newUserAccStmt.closeBal, profitLoss: pnlData + +amount, mainBalance: mbal },
        { new: true, upsert: true },
      )

      userAccBal = newUserAccStmt.closeBal
    }

    const getParentOpenBal = getParentAccStmt?.closeBal ? getParentAccStmt.closeBal : 0
    const parentAmt = -amount
    const parentUserAccountData: IAccoutStatement = {
      userId: parentUserId,
      narration,
      amount: parentAmt,
      type: ChipsType.fc,
      txnType: TxnType.dr,
      openBal: getParentOpenBal,
      closeBal: getParentOpenBal - +amount,
      txnId: newUserAccStmt._id,
      txnBy: `${username}/${userData.username}`,
    }

    const newParentUserAccStmt = new AccoutStatement(parentUserAccountData)
    await newParentUserAccStmt.save()

    if (newParentUserAccStmt._id !== undefined && newParentUserAccStmt._id !== null) {
      const mbal = await this.getUserDepWithBalance(parentUserId)
      await Balance.findOneAndUpdate(
        { userId: parentUserId },
        { balance: newParentUserAccStmt.closeBal, mainBalance: mbal },
        { new: true, upsert: true },
      )
      await AccoutStatement.updateOne(
        { _id: Types.ObjectId(newUserAccStmt._id) },
        { $set: { txnId: Types.ObjectId(newParentUserAccStmt._id) } },
      )
    }

    // await User.updateOne({_id:userId})
    return userAccBal
  }

  async withdrawAdminAccountBalance(req: Request, userData: any) {
    const { _id, username }: any = req?.user

    const { amount, narration } = req.body

    let userAccBal

    const getAccStmt: any = await AccoutStatement.findOne({ userId: _id }, null, {
      sort: { createdAt: -1 },
    })

    try {
      if ((getAccStmt?._id !== undefined && getAccStmt?._id !== null) || getAccStmt !== null) {
        const getPrevCloseBal = await this.getUserBalance(_id)

        const accountData: IAccoutStatement = {
          userId: _id,
          narration,
          amount: -amount,
          type: ChipsType.fc,
          txnType: TxnType.dr,
          openBal: getPrevCloseBal,
          closeBal: getPrevCloseBal - +amount,
          txnBy: `${username}/${userData.username}`,
        }

        const newAccStmt = new AccoutStatement(accountData)
        await newAccStmt.save()

        if (newAccStmt._id !== undefined && newAccStmt._id !== null) {
          const mbal = await this.getUserDepWithBalance(_id)
          await Balance.findOneAndUpdate(
            { userId: _id },
            { balance: newAccStmt.closeBal, mainBalance: mbal },
            { new: true, upsert: true },
          )

          userAccBal = newAccStmt.closeBal
        }

        return userAccBal
      } else {
        throw Error('Withdrawal is not possible due to unsufficient balance')
      }
    } catch (e: any) {
      throw Error(e.message)
    }
  }

  async withdrawAccountBalance(req: Request,  userData: any) {
    const { userId, parentUserId, amount, narration } = req.body
    const user: any = req.user
    let userAccBal

    const getAccStmt = await AccoutStatement.findOne({ userId: userId }, null, {
      sort: { createdAt: -1 },
    })
    const getParentAccStmt = await AccoutStatement.findOne({ userId: parentUserId }, null, {
      sort: { createdAt: -1 },
    })

    if ((getAccStmt?._id !== undefined && getAccStmt?._id !== null) || getAccStmt !== null) {
      const getPrevCloseBal = await this.getUserBalance(userId)

      const userAccountData: IAccoutStatement = {
        userId,
        narration,
        amount: -amount,
        type: ChipsType.fc,
        txnType: TxnType.dr,
        openBal: getPrevCloseBal,
        closeBal: getPrevCloseBal - +amount,
        txnBy: `${user.username}/${userData.parent.username}`, //parent username here
      }

      const newUserAccStmt = new AccoutStatement(userAccountData)
      await newUserAccStmt.save()

      if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
        const pnlData: any = await this.calculatepnl(userId, 'w')
        const mbal = await this.getUserDepWithBalance(userId)

        const userBalance = await Balance.findOne({ userId });

       const commission = userBalance?.commision || 0;
       const updatedBalance = newUserAccStmt.closeBal;

        await Balance.findOneAndUpdate(
          { userId },
          { balance: updatedBalance, profitLoss: pnlData - +amount, mainBalance: mbal },
          { new: true, upsert: true },
        )

        userAccBal = updatedBalance
      }

      // Parent checking for balance
      /// const getParentPrevCloseBal = getParentAccStmt?.closeBal ? getParentAccStmt.closeBal : 0
      const getParentPrevCloseBal = await this.getUserBalance(parentUserId)

      const parentUserAccountData: IAccoutStatement = {
        userId: parentUserId,
        narration,
        amount,
        type: ChipsType.fc,
        txnType: TxnType.cr,
        openBal: getParentPrevCloseBal,
        closeBal: getParentPrevCloseBal + +amount,
        txnBy: `${user.username}/${userData.username}`,
      }

      const newParentUserAccStmt = new AccoutStatement(parentUserAccountData)
      await newParentUserAccStmt.save()

      if (newParentUserAccStmt._id !== undefined && newParentUserAccStmt._id !== null) {
        const mbal = await this.getUserDepWithBalance(parentUserId)
        await Balance.findOneAndUpdate(
          { userId: parentUserId },
          { balance: newParentUserAccStmt.closeBal, mainBalance: mbal },
          { new: true, upsert: true },
        )
      }

      return userAccBal
    } else {
      throw Error('Withdrawal is not possible due to unsufficient balance')
    }
  }

  calculatepnl = async (userId: any, type: string = 'W') => {
    // const parent = await User.findOne(
    //   {
    //     parentStr: { $elemMatch: { $eq: Types.ObjectId(userId) } },
    //     role: RoleType.user,
    //   },
    //   { _id: 1 },
    // )
    //   .distinct('_id')
    //   .lean()

    // if (user.role == RoleType.user) {
    //   parent.push(userId)
    // }
    // const pnl = await AccoutStatement.aggregate([
    //   { $match: { userId: { $in: parent }, betId: { $ne: null } } },
    //   {
    //     $group: {
    //       _id: null,
    //       totalAmount: { $sum: '$amount' },
    //     },
    //   },
    // ]);
    const bal = await Balance.findOne({ userId: userId }).select({ profitLoss: 1 })

    // const withdrawlsum = await AccoutStatement.aggregate([
    //   {
    //     $match: {
    //       userId: Types.ObjectId(userId),
    //       betId: { $eq: null },
    //       txnId: { $eq: null },
    //       txnType: TxnType.dr,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalAmount: { $sum: '$amount' },
    //     },
    //   },
    // ])
    // const withdAmt = withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0
    // //const pnl_ = pnl && pnl.length > 0 ? pnl[0].totalAmount + withdAmt : 0
    // const pnl_ = bal?.profitLoss ? bal?.profitLoss + withdAmt : 0
    return bal?.profitLoss ? bal?.profitLoss : 0
  }
  getUserBalanceWithExposer = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const bal: any = await Balance.findOne({ userId: user._id })
        .select({
          balance: 1,
          exposer: 1,
          casinoexposer: 1,
          commision:1,
        })
        .lean()
      bal.exposer = bal?.exposer + (bal?.casinoexposer || 0)
      return this.success(res, bal)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  depositWithdraw = async (req: Request, { role, _id }: IUserModel) => {
    let { userId, parentUserId, amount, balanceUpdateType } = req.body
    const parentBal: any = await Balance.findOne({ userId: Types.ObjectId(parentUserId) })
    // const userData = await User.findOne({
    //   parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUserId) } },
    //   _id: Types.ObjectId(userId),
    // })
    if (balanceUpdateType == 'ST') {
      if (amount > 0) {
        balanceUpdateType = 'D'
      } else {
        amount = Math.abs(amount)
        balanceUpdateType = 'W'
      }
    }

    const select = {
      _id: 1,
      username: 1,
      parent: 1,
    }
    let userData: any = await User.aggregate([
      {
        $match: {
          _id: Types.ObjectId(userId),
          parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUserId) } },
        },
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
        $project: select,
      },
    ])

    userData = userData.length > 0 ? userData[0] : { _id: null }

    if (!userData?._id && role !== RoleType.admin) {
      throw Error('Not a valid parent')
    }

    if (
      balanceUpdateType === 'D' &&
      parentBal.balance - parentBal.exposer < amount &&
      role !== RoleType.admin
    ) {
      throw Error('Insufficient amount')
    }

    let userAccBal
    let successMsg

    if (role === 'admin' && userId == _id) {
      if (balanceUpdateType === 'D') {
        userAccBal = await this.depositAdminAccountBalance(req, userData)
        successMsg = 'Amount deposited to user'
      } else if (balanceUpdateType === 'W') {
        userAccBal = await this.withdrawAdminAccountBalance(req, userData)
        successMsg = 'Successfully withdrawl of amount'
      }
    } else {
      if (balanceUpdateType === 'D') {
        userAccBal = await this.depositAccountBalance(req, userData)
        successMsg = 'Amount deposited to user'
      } else if (balanceUpdateType === 'W') {
        const { userId, amount } = req.body
        console.log('amount', amount)
        const getBalWithExp: any = await Balance.findOne({ userId })
        if (getBalWithExp.balance - getBalWithExp.exposer < amount) {
          throw Error('Insufficient amount to withdrawal, Due to pending exposure or less amount')
        }
        userAccBal = await this.withdrawAccountBalance(req, userData)
        successMsg = 'Successfully withdrawal of amount'
      }
    }
    UserSocket.setExposer({
      balance: userAccBal,
      userId: userId,
    })
    const pnlData: any = await this.calculatepnl(userId, balanceUpdateType)

    return {
      successMsg,
      userAccBal,
      pnlData,
    }
  }
  
  getAccountStmtList = async (req: Request, res: Response) => {
    try {
      const { page }: any = req.query
      const { startDate, endDate, reportType, userId }: any = req.body
      console.log(req.user, "statemt")
      const user: any = req.user
      const options = {
        page: page ? page : 1,
        limit: 20,
      }
      const userid = userId ? Types.ObjectId(userId) : Types.ObjectId(user._id)
      var filter: any = {
        userId: userid,
        createdAt: {
          $gte: new Date(`${startDate} 00:00:00`),
          $lte: new Date(`${endDate} 23:59:59`),
        },
      }
      if (reportType == 'game') {
        filter = { ...filter, ...{ betId: { $ne: null } } }
      }
      if (reportType == 'chip') {
        filter = { ...filter, ...{ betId: null } }
      }

      const matchfilter = {
        $match: filter,
      }

      
      const aggregateFilter = [
        {
          $addFields: {
            convertedId: {
              $toObjectId: '$betId',
            },
          },
        },
        {
          $lookup: {
            from: 'bets',
            localField: 'convertedId',
            foreignField: '_id',
            as: 'result',
          },
        },
        {
          $lookup: {
            from: 'balances',
            localField: 'userId',
            foreignField: 'userId',
            as: 'balanceData',
          },
        },
        {
          $unwind: {
            path: '$balanceData',
            preserveNullAndEmptyArrays: true,
          },
        },
        matchfilter,
        {
          $facet: {
            nonNullSelections: [
              {
                $match: {
                  convertedId: { $ne: null },
                },
              },
              {
                $group: {
                  _id: {
                    matchId: '$matchId',
                    marketId: '$result.marketId',
                  },
                  userId: { $first: '$userId' },
                  selectionId: { $first: '$selectionId' },
                  matchId: { $first: '$matchId' },
                  amount: { $sum: '$amount' },
                  txnType: { $first: '$txnType' },
                  txnBy: { $first: '$txnBy' },
                  openBal: { $first: '$openBal' },
                  narration: { $first: '$narration' },
                  createdAt: { $first: '$createdAt' },
                  type: { $first: '$type' },
                  balance: { $first: '$balanceData.balance' }, // include balance
                  allBets: { $push: '$$ROOT' },
                },
              },
            ],
            nullSelections: [
              {
                $match: {
                  convertedId: null,
                },
              },
              {
                $addFields: {
                  balance: '$balanceData.balance', // include balance
                },
              },
            ],
          },
        },
        {
          $sort: { createdAt: 1 },
        },
        {
          $project: {
            data: {
              $concatArrays: ['$nonNullSelections', '$nullSelections'],
            },
          },
        },
        {
          $unwind: '$data',
        },
        {
          $replaceRoot: {
            newRoot: '$data',
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
      ]
      

      const pageNo = page ? (page as string) : '1'
      var accountStatement = await AccoutStatement.aggregate(aggregateFilter)
      const datasort = accountStatement?.sort((a: any, b: any) => a.createdAt - b.createdAt)
      var accountStatementNew = { items: datasort }
      const openingBalance = await AccoutStatement.aggregate([
        {
          $match: {
            userId: userid,
            createdAt: {
              $lte: new Date(`${startDate} 00:00:00`),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ])
      return this.success(res, {
        ...accountStatementNew,
        openingBalance: openingBalance?.[0]?.total || 0,
      })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  // getAccountStmtList = async (req: Request, res: Response) => {
  //   try {
  //     const { page }: any = req.query;
  //     const { startDate, endDate, reportType, userId }: any = req.body;
  //     console.log(req.user, "statemt");
  //     const user: any = req.user;
  //     const options = {
  //       page: page ? page : 1,
  //       limit: 20,
  //     };
  //     const userid = userId ? Types.ObjectId(userId) : Types.ObjectId(user._id);
  //     console.log(userid,":ffffffff")
  
  //     let filter: any = {
  //       userId: userid,
  //       createdAt: {
  //         $gte: new Date(`${startDate} 00:00:00`),
  //         $lte: new Date(`${endDate} 23:59:59`),
  //       },
  //     };
  
  //     if (reportType === 'game') {
  //       filter = { ...filter, betId: { $ne: null } };
  //     }
  //     if (reportType === 'chip') {
  //       filter = { ...filter, betId: null };
  //     }
  
  //     const matchfilter = {
  //       $match: filter,
  //     };
  
  //     const aggregateFilter = [
  //       {
  //         $addFields: {
  //           convertedId: {
  //             $toObjectId: '$betId',
  //           },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: 'bets',
  //           localField: 'convertedId',
  //           foreignField: '_id',
  //           as: 'result',
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: 'balances',
  //           localField: 'userId',
  //           foreignField: 'userId',
  //           as: 'balanceData',
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: '$balanceData',
  //           preserveNullAndEmptyArrays: true,
  //         },
  //       },
  //       // New lookup to get commission from ledger collection
  //       {
  //         $lookup: {
  //           from: 'ledgers',
  //           let: { childId: '$ChildId', betId: '$betId' },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $and: [
  //                     { $eq: ['$userId', '$$childId'] },  // should this be 'ChildId'? See below.
  //                     { $eq: ['$betId', '$$betId'] },
  //                   ],
  //                 },
  //               },
  //             },
  //             {
  //               $project: { commissionlega: 1, _id: 0 },
  //             },
  //             { $limit: 1 },
  //           ],
  //           as: 'ledgerCommission',
  //         },
  //       },
  //       {
  //         $addFields: {
  //           commission: { $arrayElemAt: ['$ledgerCommission.commissionlega', 0] },
  //         },
  //       },
        
  //       {
  //         $addFields: {
  //           commission: { $arrayElemAt: ['$ledgerCommission.commissionlega', 0] },
  //         },
  //       },
  //       {
  //         $project: {
  //           ledgerCommission: 0,
  //         },
  //       },
  //       matchfilter,
  //       {
  //         $facet: {
  //           nonNullSelections: [
  //             {
  //               $match: {
  //                 convertedId: { $ne: null },
  //               },
  //             },
  //             {
  //               $group: {
  //                 _id: {
  //                   matchId: '$matchId',
  //                   marketId: '$result.marketId',
  //                 },
  //                 userId: { $first: '$userId' },
  //                 selectionId: { $first: '$selectionId' },
  //                 matchId: { $first: '$matchId' },
  //                 amount: { $sum: '$amount' },
  //                 txnType: { $first: '$txnType' },
  //                 txnBy: { $first: '$txnBy' },
  //                 openBal: { $first: '$balanceData.balance' },
  //                 narration: { $first: '$narration' },
  //                 createdAt: { $first: '$createdAt' },
  //                 type: { $first: '$type' },
  //                 balance: { $first: '$balanceData.balance' },
  //                 commission: { $first: '$commission' }, // include commission in grouped results
  //                 allBets: { $push: '$$ROOT' },
  //               },
  //             },
  //           ],
  //           nullSelections: [
  //             {
  //               $match: {
  //                 convertedId: null,
  //               },
  //             },
  //             {
  //               $addFields: {
  //                 balance: '$balanceData.balance',
  //                 commission: '$commission', // include commission here too
  //               },
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         $sort: { createdAt: 1 },
  //       },
  //       {
  //         $project: {
  //           data: {
  //             $concatArrays: ['$nonNullSelections', '$nullSelections'],
  //           },
  //         },
  //       },
  //       {
  //         $unwind: '$data',
  //       },
  //       {
  //         $replaceRoot: {
  //           newRoot: '$data',
  //         },
  //       },
  //       {
  //         $sort: {
  //           createdAt: -1,
  //         },
  //       },
  //     ];
  
  //     const pageNo = page ? (page as string) : '1';
  //     const accountStatement = await AccoutStatement.aggregate(aggregateFilter);
  
  //     const datasort = accountStatement?.sort(
  //       (a: any, b: any) => a.createdAt - b.createdAt
  //     );
  
  //     const accountStatementNew = { items: datasort };
  
  //     const openingBalance = await AccoutStatement.aggregate([
  //       {
  //         $match: {
  //           userId: userid,
  //           createdAt: {
  //             $lte: new Date(`${startDate} 00:00:00`),
  //           },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: null,
  //           total: { $sum: '$amount' },
  //         },
  //       },
  //     ]);
  
  //     return this.success(res, {
  //       ...accountStatementNew,
  //       openingBalance: openingBalance?.[0]?.total || 0,
  //     });
  //   } catch (e: any) {
  //     return this.fail(res, e);
  //   }
  // };


  



  
  getAccountStmtList22 = async (req: Request, res: Response) => {
    try {
      const { _id }: any = req.user;
      const userObjectId = new mongoose.Types.ObjectId(_id);
  
      // Step 1: Fetch all account statements for the user
      const list = await AccoutStatement.find({ userId: userObjectId });
  
      // Step 2: Add commission from ledger for each item
      const enrichedList = await Promise.all(
        list.map(async (item) => {
          const itemObj = item.toObject(); // Convert to plain object
          
  
          if (!itemObj.betId) {
            return { ...itemObj, commission: 0 }; // No betId, just return with 0 commission
          }
  
          // Step 3: Find matching ledgers by userId (ChildId) and betId
          const matchingLedgers = await ledger.find({
            ChildId: userObjectId,
            betId: itemObj.betId,
          });
  console.log(matchingLedgers,"itemmobj")
          // Step 4: Sum up commissionlega values
          const commission = matchingLedgers.reduce(
            (sum, entry) => sum + (entry.commissionlega || 0),
            0
          );


          // ... after enrichedList is ready



          
  
          return {
            ...itemObj,
            commission,
          };
        })
      );

      const uniqueBySelectionId = enrichedList.filter((item, index, self) =>
        index === self.findIndex((t) => t.selectionId?.toString() === item.selectionId?.toString())
      );


  
      return res.json({ success: true, data: uniqueBySelectionId });
  
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  };
  


  

  

  profitloss = async (req: Request, res: Response) => {
    try {
      const { page }: any = req.query
      const { startDate, endDate, userId }: any = req.body
      const pageNo = page ? (page as string) : '1'
      const user: any = req.user
      const aggregateFilter = [
        {
          $group: {
            _id: '$matchId',
            total: { $sum: '$amount' },
            narration: { $first: '$narration' },
            type: { $first: '$type' },
            sportId: { $first: '$sportId' },
          },
        },
      ]
      var filter: any = {
        userId: userId ? Types.ObjectId(userId) : Types.ObjectId(user._id),
        betId: { $ne: null },
        createdAt: {
          $gte: new Date(`${startDate} 00:00:00`),
          $lte: new Date(`${endDate} 23:59:59`),
        },
      }
      const matchfilter = {
        $match: filter,
      }
      const accountStatement = await AccoutStatement.aggregate(
        paginationPipeLine(pageNo, [matchfilter, ...aggregateFilter]),
      )
      return this.success(res, { ...accountStatement[0] })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }





  clinetladger = async (req:Request,res:Response)=>{
    try {
      let user = req.user
      let id = user["_id"]
      // const ddata = await ledger.find({ChildId:id})
      const ldata = await ledger.find({ParentId:id})
      const ddata= await ledger.find({ChildId:id})
      // const arr = [ddata,ldata]
      return this.success(res, [ldata,ddata])
  
    } catch (error) {
      
    }
  }

  clinetladger22 = async (req:Request,res:Response)=>{
    console.log(req.body,"seocndd ledgerr")
    try {
      // let user = req.user
      // let id = user["_id"]
      const id = req.body.sendId
      const user = await User.findOne({ _id: id });
      console.log(user,"ffff")

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }


      // const ddata = await ledger.find({ChildId:id})
      const ldata = await ledger.find({ParentId:id})
      const ddata= await ledger.find({ChildId:id})
      // const arr = [ddata,ldata]
      return this.success(res, [ldata,ddata, {user}])
  
    } catch (error) {
      
    }
  }

  iframeurl = async (req:Request,res:Response)=>{
    try {
      const id = req.body.id
      console.log(id,'req.body.id dhjdhjdkjhfjkfhfdjfj')
    const data =  await axios.get(`http://89.116.20.218:8085/api/live-score?eventid=${id}`)
    console.log(data,"asdfgerty")
      return this.success(res, data)
  
    } catch (error) {
      console.log(error)
      return this.success(res, error)

      
    }
  }

  //  allClientLedger = async (req: Request, res: Response) => {
  //   try {
  //     const user = req.user;
  //     const id = user["_id"];
  
  //     // Get all children of the current user
  //     const childData = await User.find({ parentId: id });
  //     const childIds = childData.map(child => child._id);
  
  //     console.log(childIds, "child IDs");
  
  //     // Fetch all ledger data for children
  //     var ldata = await ledger.find({ ChildId: { $in: childIds } });
  //     console.log(ldata,"upper")
  //     if(ldata.length == 0){
  //       var ldata = await ledger.find({ ParentId: { $in: childIds } });
  //       console.log(ldata)

  //     }
  
  //     return this.success(res, ldata);
  
  //   } catch (error) {
  //     console.error("Error fetching ledger data:", error);
  //     return res.status(500).json({ success: false, message: "Internal server error" });
  //   }
  // };
    

  allClientLedger = async (req: Request, res: Response) => {
    try {
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
  
      return this.success(res, updatedLdata);
  
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  settelement = async(req:Request,res:Response)=>{
    console.log(req.body,"data from settelement hahhahahah")

    let  user = req.user
    // let PaentId = user["_id"]
    let ChildId = req.body.ChildId
    let Paentdata = await User.findOne({_id:ChildId})
    let PaentId = Paentdata.parentId
    console.log(PaentId,ChildId,"parentid")
    let amount = req.body.settleamount
    let remark = req.body.remark 
    let type = req.body.type

   

    try {
    

      console.log(user,PaentId,ChildId,amount,"vhgjkl;hgjkl")
      await ledger.create ({
  
        ParentId:PaentId,
        ChildId,
        money:amount,
        narration:"Settlement",
        umoney:amount,
        settled:true
      })
      await ledger.create ({
  
        ParentId:ChildId,
        ChildId,
        money:amount,
        narration:"Settlement",
        umoney : amount,
        settled:true
      })
      return this.success(res, {msg:"sucess"})
    } catch (error) {
      return this.success(res, {error:error})

    }
  }

  settelement2 = async(req:Request,res:Response)=>{
    console.log(req.body,"data from settelement hahhahahah")
    const username = req.body.data



    try {
    
      const operations = await Operation.find({ username }).sort({ createdAt: -1 });
      console.log(operations,"opp")

      if (!operations.length) {
        return res.status(404).json({ success: false, message: "No operations found for this username." });
      }


      return this.success(res, {msg:"sucess", operations})
    } catch (error) {
      return this.success(res, {error:error})

    }
  }


  notice = async(req:Request,res:Response)=>{
    console.log(req.body,"data from settelement hahhahahah")
   try {
     const { userNotice, adminNotice } = req.body;
     let notice = await Notice.findOne();
 
 
     if (notice) {
       // Update the existing document
       notice.fnotice = userNotice;
       notice.bnotice = adminNotice;
       await notice.save();
     } else {
       // Create a new notice document if it doesn't exist
       notice = await Notice.create({
         fnotice: userNotice,
         bnotice: adminNotice,
       });
     }
 
 
     return this.success(res, {message: "Notice saved successfully", data: notice})
   } catch (error) {
    console.error("Error saving notice:", error);
    return this.success(res, {error:error})

    
   }
  



    
  }


  manage = async(req:Request,res:Response)=>{
    console.log(req.body,"data from settelement hahhahahah")
   try {
     const { uback, ulay } = req.body;
     let od = await ManageOdds.findOne();
 
 
     if (od) {
       // Update the existing document
       od.Backs = uback;
       od.Lays = ulay;
       await od.save();
     } else {
       // Create a new notice document if it doesn't exist
       od = await ManageOdds.create({
        Backs: uback,
        Lays: ulay,
       });
     }
 
 
     return this.success(res, {message: "Odds Update successfully", data: od})
   } catch (error) {
    console.error("Error saving odds:", error);
    return this.success(res, {error:error})

    
   }
  



    
  }



  PerviousOdds = async(req:Request,res:Response)=>{
    const data  = await ManageOdds.find({})
    try {
      if(data){
        return this.success(res, data)
      }else{
        return this.success(res, {msg:"No data avalibale"})
      }
    } catch (error) {
      return this.success(res, error)
    }
  }


   // API to fetch current notices
   getNotice = async (req: Request, res: Response) => {
    try {
      const notice = await Notice.findOne();

      if (!notice) {
        return res.json({ success: true, message: "No notices found", data: {} });
      }

      return res.json({ success: true, data: notice });
    } catch (error) {
      console.error("Error fetching notice:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };

 
  


}
