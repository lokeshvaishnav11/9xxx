"use strict";
// import { model, PopulatedDoc, Schema } from 'mongoose'
// import { IUser } from './User'
// import { Types } from 'mongoose'
// import { IBet } from './Bet'
Object.defineProperty(exports, "__esModule", { value: true });
exports.ledger = void 0;
// interface Iledger extends Document {
//     ParentId: PopulatedDoc<IUser>
//     money: Number
//     ChildId:PopulatedDoc<IUser>
//     username:String,
//     narration:String,
//     commissionlega:Number,
//     commissiondega:Number,
//     Fancy:Boolean
//   }
//   const allledger = new Schema({
//      ParentId:{type: Types.ObjectId, ref: 'User'},
//      money :Number,
//      ChildId:{type:Types.ObjectId,ref:"User"},
//      username:String,
//      betId:{type:Types.ObjectId,ref:"Bet"},
//      commissionlega:Number,
//      commissiondega:Number,
//      narration:String,
//      Fancy:Boolean,
//   })
// // allledger.index({ betId: 1, ChildId: 1, ParentId: 1 }, { unique: true });
// const ledger= model<typeof allledger>('ledger', allledger)
// export { Iledger, ledger }
// //hello worldd
const mongoose_1 = require("mongoose");
const allledger = new mongoose_1.Schema({
    ParentId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    money: Number,
    ChildId: { type: mongoose_1.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: null },
    betId: { type: mongoose_1.Types.ObjectId, ref: 'Bet', default: null },
    commissionlega: Number,
    commissiondega: Number,
    narration: String,
    fammount: Number,
    Fancy: { type: Boolean, default: false },
    settled: { type: Boolean, default: false },
    updown: { type: Number, default: 0 },
    parentName: String,
    Casino: { type: Boolean, default: false },
    umoney: { type: Number },
    profit: { type: Number, default: 0 },
    cname: { type: String, default: null },
    pname: { type: String, default: null },
    iscomSet: { type: Boolean, default: false },
    matchId: { type: String }
}, { timestamps: true });
// allledger.index({ betId: 1, ChildId: 1, ParentId: 1 }, { unique: true });
// allledger.index(
//   { betId: 1, ChildId: 1, ParentId: 1 },
//   {
//     unique: true,
//     partialFilterExpression: { betId: { $type: 'objectId' } }
//   }
// );
const ledger = (0, mongoose_1.model)('ledger', allledger);
exports.ledger = ledger;
//# sourceMappingURL=allledager.js.map