import { model, Schema, PopulatedDoc, Types } from 'mongoose'
import cachegoose from 'recachegoose'
import { IUser } from './User'

interface IUserBetStake {
  userId: PopulatedDoc<IUser>
  name1: string
  value1: number
  name2: string
  value2: number
  name3: string
  value3: number
  name4: string
  value4: number
  name5: string
  value5: number
  name6: string
  value6: number
  name7: string
  value7: number
  name8: string
  value8: number
  name9: string
  value9: number
  name10: string
  value10: number
  name11: string
  value11: number
  name12: string
  value12: number
  name13: string
  value13: number
}

// const defaultStack: any = {
//   name1: '1000',
//   value1: 1000,
//   name2: '2000',
//   value2: 2000,
//   name3: '5000',
//   value3: 5000,
//   name4: '10000',
//   value4: 10000,
//   name5: '20000',
//   value5: 20000,
//   name6: '25000',
//   value6: 25000,
//   name7: '50000',
//   value7: 50000,
//   name8: '100000',
//   value8: 100000,
//   name9: '150000',
//   value9: 150000,
//   name10: '200000',
//   value10: 200000,
// name11: '200000',
//   value11: 200000,
// }

const defaultStack: any = {
  name1: '100',
  value1: 100,
  name2: '200',
  value2: 200,
  name3: '500',
  value3: 500,
  name4: '1K',
  value4: 1000,
  name5: '2K',
  value5: 2000,
  name6: '3K',
  value6: 3000,
  name7: '5K',
  value7: 5000,
  name8: '10K',
  value8: 10000,
  name9: '20K',
  value9: 20000,
  name10: '25K',
  value10: 25000,
  name11: '50K',
  value11: 50000,
  name12: '100K',
  value12: 100000,
  name13: '200K',
  value13: 200000,
}

interface IUserBetStakeModel extends IUserBetStake, Document {}

const UserBetStakeSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    name1: String,
    value1: Number,
    name2: String,
    value2: Number,
    name3: String,
    value3: Number,
    name4: String,
    value4: Number,
    name5: String,
    value5: Number,
    name6: String,
    value6: Number,
    name7: String,
    value7: Number,
    name8: String,
    value8: Number,
    name9: String,
    value9: Number,
    name10: String,
    value10: Number,
    name11: String,
    value11: Number,
    name12: String,
    value12: Number,
    name13: String,
    value13: Number,
  },
  {
    timestamps: true,
  },
)

UserBetStakeSchema.pre('findOneAndUpdate', async function () {
  // @ts-ignore
  const query = this.getQuery()
  if (query.userId) {
    cachegoose.clearCache('user-stack-' + query.userId, () => {})
  }
})

const UserBetStake = model<typeof UserBetStakeSchema>('UserBetStake', UserBetStakeSchema)

export { IUserBetStake, UserBetStake, defaultStack }
