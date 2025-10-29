"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccoutStatement = exports.ChipsType = void 0;
const mongoose_1 = require("mongoose");
const UserChip_1 = require("./UserChip");
var ChipsType;
(function (ChipsType) {
    ChipsType["fc"] = "fc";
    ChipsType["pnl"] = "pnl";
    ChipsType["stm"] = "stm";
})(ChipsType = exports.ChipsType || (exports.ChipsType = {}));
const AccoutStatementSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', index: true },
    type: {
        type: String,
        enum: ChipsType,
    },
    narration: String,
    txnType: {
        type: String,
        enum: UserChip_1.TxnType,
    },
    amount: Number,
    openBal: Number,
    closeBal: Number,
    betId: { type: mongoose_1.Types.ObjectId, index: true },
    matchId: { type: Number, index: true },
    selectionId: { type: Number, index: true },
    sportId: { type: Number, index: true },
    txnId: { type: mongoose_1.Types.ObjectId },
    txnBy: { type: String, index: true },
    iscom: { type: Boolean, default: false },
}, {
    toJSON: { getters: true },
    timestamps: true,
});
// AccoutStatementSchema.plugin(paginate)
const AccoutStatement = (0, mongoose_1.model)('AccoutStatement', AccoutStatementSchema);
exports.AccoutStatement = AccoutStatement;
//# sourceMappingURL=AccountStatement.js.map