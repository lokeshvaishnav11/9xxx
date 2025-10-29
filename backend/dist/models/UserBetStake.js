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
exports.defaultStack = exports.UserBetStake = void 0;
const mongoose_1 = require("mongoose");
const recachegoose_1 = __importDefault(require("recachegoose"));
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
const defaultStack = {
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
};
exports.defaultStack = defaultStack;
const UserBetStakeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
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
}, {
    timestamps: true,
});
UserBetStakeSchema.pre('findOneAndUpdate', function () {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const query = this.getQuery();
        if (query.userId) {
            recachegoose_1.default.clearCache('user-stack-' + query.userId, () => { });
        }
    });
});
const UserBetStake = (0, mongoose_1.model)('UserBetStake', UserBetStakeSchema);
exports.UserBetStake = UserBetStake;
//# sourceMappingURL=UserBetStake.js.map