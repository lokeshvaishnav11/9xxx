"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetRoute = void 0;
const express_1 = require("express");
const BetController_1 = require("../controllers/BetController");
const BetLockController_1 = require("../controllers/BetLockController");
const Http_1 = __importDefault(require("../middlewares/Http"));
const Passport_1 = __importDefault(require("../passport/Passport"));
const bet_lock_validation_1 = require("../validations/bet-lock.validation");
class BetRoute {
    constructor() {
        this.betController = new BetController_1.BetController();
        this.betLockController = new BetLockController_1.BetLockController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/placebet', Passport_1.default.authenticateJWT, this.betController.placebet);
        this.router.post('/getexposer', Passport_1.default.authenticateJWT, this.betController.getexposer);
        this.router.get('/bets', Passport_1.default.authenticateJWT, this.betController.betList);
        this.router.get('/bets22', Passport_1.default.authenticateJWT, this.betController.betList22);
        this.router.post('/bet32', Passport_1.default.authenticateJWT, this.betController.betList32);
        this.router.get('/matchdetail', Passport_1.default.authenticateJWT, this.betController.marketDetails);
        this.router.get('/matchdetail-two', Passport_1.default.authenticateJWT, this.betController.marketDetailstwo);
        this.router.get('/completedgames', Passport_1.default.authenticateJWT, this.betController.completedgames);
        this.router.get('/completedgamescasino', Passport_1.default.authenticateJWT, this.betController.completedgamescasino);
        this.router.get('/marketcasino', Passport_1.default.authenticateJWT, this.betController.marketCasino);
        this.router.post('/get-bet-list-by-ids', Passport_1.default.authenticateJWT, this.betController.getBetListByIds);
        this.router.post('/alluserbetList', Passport_1.default.authenticateJWT, this.betController.alluserbetList);
        this.router.get('/alluserbetList22', Passport_1.default.authenticateJWT, this.betController.alluserbetList22);
        this.router.get('/get-exposer-event', Passport_1.default.authenticateJWT, this.betController.getExposerEvent);
        this.router.delete('/delete-current-bet/:id', Passport_1.default.authenticateJWT, this.betController.deleteCurrentBet);
        this.router.post('/delete-bets', Passport_1.default.authenticateJWT, this.betController.deleteBets);
        this.router.post('/bet-lock', bet_lock_validation_1.betLockValidation, Http_1.default.validateRequest, Passport_1.default.authenticateJWT, this.betLockController.betLock);
        this.router.get('/get-child-user-list', Passport_1.default.authenticateJWT, this.betLockController.getChildUserList);
        this.router.post('/users-lock', Passport_1.default.authenticateJWT, this.betLockController.usersLock);
    }
}
exports.BetRoute = BetRoute;
//# sourceMappingURL=bet.js.map