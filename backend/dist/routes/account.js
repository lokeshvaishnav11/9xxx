"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRoutes = void 0;
const express_1 = require("express");
const AccountController_1 = require("../controllers/AccountController");
const Passport_1 = __importDefault(require("../passport/Passport"));
const CasinoController_1 = require("../controllers/CasinoController");
const FancyController_1 = require("../controllers/FancyController");
class AccountRoutes {
    constructor() {
        this.AccountController = new AccountController_1.AccountController();
        this.CasinoController = new CasinoController_1.CasinoController();
        this.FancyController = new FancyController_1.FancyController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        // this.router.get(
        //   "/Account",
        //   Passport.authenticateJWT,
        //   this.AccountController.Account
        // );
        // this.router.get("/Account", this.AccountController.Accounts);
        // this.router.post("/Account", this.AccountController.saveAccount);
        this.router.post('/account-statement-list', Passport_1.default.authenticateJWT, this.AccountController.getAccountStmtList);
        this.router.post('/account-statement-list-22', Passport_1.default.authenticateJWT, this.AccountController.getAccountStmtList22);
        this.router.get('/get-casino-games', Passport_1.default.authenticateJWT, this.CasinoController.getCasinoList);
        this.router.get('/get-casino-int-games', Passport_1.default.authenticateJWT, this.CasinoController.getCasinoIntList);
        this.router.get('/disable-casino-games', Passport_1.default.authenticateJWT, this.CasinoController.disableCasinoGame);
        this.router.get('/get-casino-data-by-id/:slug', Passport_1.default.authenticateJWT, this.CasinoController.getCasinoData);
        this.router.get("/html-cards/:type/:roundId", Passport_1.default.authenticateJWT, this.CasinoController.htmlCards);
        this.router.get("/done-results/:type", Passport_1.default.authenticateJWT, this.CasinoController.results);
        this.router.post('/profit-loss', Passport_1.default.authenticateJWT, this.AccountController.profitloss);
        this.router.get("/all-client-ledger/one", Passport_1.default.authenticateJWT, this.AccountController.clinetladger);
        this.router.post("/all-client-ledger/ppone", Passport_1.default.authenticateJWT, this.AccountController.clinetladger22);
        this.router.get("/all-client-ledger/two", Passport_1.default.authenticateJWT, this.AccountController.allClientLedger);
        this.router.post("/settle", Passport_1.default.authenticateJWT, this.AccountController.settelement);
        this.router.post("/settle2", Passport_1.default.authenticateJWT, this.AccountController.settelement2);
        this.router.post("/notice", Passport_1.default.authenticateJWT, this.AccountController.notice);
        this.router.post("/manageodd", Passport_1.default.authenticateJWT, this.AccountController.manage);
        this.router.get("/getodds", Passport_1.default.authenticateJWT, this.AccountController.PerviousOdds);
        this.router.get("/getnotice", Passport_1.default.authenticateJWT, this.AccountController.getNotice);
        this.router.post("/c-reset", Passport_1.default.authenticateJWT, this.FancyController.commissionreset);
        this.router.post("/iframe-url", Passport_1.default.authenticateJWT, this.AccountController.iframeurl);
    }
}
exports.AccountRoutes = AccountRoutes;
//# sourceMappingURL=account.js.map