"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Todo = void 0;
const mongoosastic_ts_1 = require("mongoosastic-ts");
const mongoose_1 = __importStar(require("mongoose"));
const elastic_client_1 = __importDefault(require("../util/elastic.client"));
const TodoSchema = new mongoose_1.Schema({
    title: { type: String, es_boost: 2.0 },
    description: { type: String },
});
// @ts-ignore
TodoSchema.plugin(mongoosastic_ts_1.mongoosastic, {
    esClient: elastic_client_1.default,
});
const Todo = (0, mongoose_1.model)('Todo', TodoSchema);
exports.Todo = Todo;
mongoose_1.default.connection
    .on('error', (err) => {
    console.error(err);
})
    .on('open', (err) => {
    const stream = Todo.synchronize({}, { saveOnSynchronize: true });
    stream.on('data', function (err, doc) { });
    stream.on('error', function (err) {
        console.log(err);
    });
});
//# sourceMappingURL=Todo.js.map