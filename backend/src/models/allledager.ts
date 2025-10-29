// import { model, PopulatedDoc, Schema } from 'mongoose'
// import { IUser } from './User'
// import { Types } from 'mongoose'
// import { IBet } from './Bet'

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



import { model, PopulatedDoc, Schema, Types, Document } from 'mongoose';
import { IUser } from './User';
import { IBet } from './Bet';

interface Iledger extends Document {
  ParentId: PopulatedDoc<IUser>;
  money: number;
  ChildId: PopulatedDoc<IUser>;
  username: string | null;
  narration: string;
  fammount: number;
  commissionlega: number;
  commissiondega: number;
  Fancy: boolean;
  betId: PopulatedDoc<IBet> | null;
  settled: boolean;
  updown:number;
  parentName:string;
  Casino:boolean;
  umoney:number;
  profit:number;
  cname:string | null;
  pname:string |null;
  iscomSet: boolean; 
  matchId:string;
}

const allledger = new Schema<Iledger>({
  ParentId: { type: Types.ObjectId, ref: 'User' },
  money: Number,
  ChildId: { type: Types.ObjectId, ref: 'User' ,default:null},
  username: { type: String, default: null },
  betId: { type: Types.ObjectId, ref: 'Bet', default: null },
  commissionlega: Number,
  commissiondega: Number,
  narration: String,
  fammount:Number,
  Fancy: { type: Boolean, default: false },
  settled: { type: Boolean, default: false },
  updown:{type:Number,default:0},
  parentName:String,
  Casino: { type: Boolean, default: false },
  umoney:{type:Number},
  profit:{type:Number,default:0},
  cname:{type:String, default : null},
  pname:{type:String, default : null},
  iscomSet: { type: Boolean, default: false },
  matchId:{type:String}

},{timestamps:true});

// allledger.index({ betId: 1, ChildId: 1, ParentId: 1 }, { unique: true });

// allledger.index(
//   { betId: 1, ChildId: 1, ParentId: 1 },
//   {
//     unique: true,
//     partialFilterExpression: { betId: { $type: 'objectId' } }
//   }
// );


const ledger = model<Iledger>('ledger', allledger);

export { Iledger, ledger };