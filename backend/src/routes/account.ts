import { Router } from 'express'
import { AccountController } from '../controllers/AccountController'
import Passport from '../passport/Passport'
import { CasinoController } from '../controllers/CasinoController'
import { FancyController } from '../controllers/FancyController'

export class AccountRoutes {
  public router: Router
  public AccountController: AccountController = new AccountController()
  public CasinoController: CasinoController = new CasinoController()
  public FancyController: FancyController = new FancyController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    // this.router.get(
    //   "/Account",
    //   Passport.authenticateJWT,
    //   this.AccountController.Account
    // );
    // this.router.get("/Account", this.AccountController.Accounts);
    // this.router.post("/Account", this.AccountController.saveAccount);
    this.router.post(
      '/account-statement-list',
      Passport.authenticateJWT,
      this.AccountController.getAccountStmtList,
    )

    this.router.post(
      '/account-statement-list-22',
      Passport.authenticateJWT,
      this.AccountController.getAccountStmtList22,
    )
    this.router.get(
      '/get-casino-games',
      Passport.authenticateJWT,
      this.CasinoController.getCasinoList,
    )
    this.router.get(
      '/get-casino-int-games',
      Passport.authenticateJWT,
      this.CasinoController.getCasinoIntList,
    )
    this.router.get(
      '/disable-casino-games',
      Passport.authenticateJWT,
      this.CasinoController.disableCasinoGame,
    )

    this.router.get(
      '/get-casino-data-by-id/:slug',
      Passport.authenticateJWT,
      this.CasinoController.getCasinoData,
    )

    this.router.get("/html-cards/:type/:roundId", Passport.authenticateJWT, this.CasinoController.htmlCards);

    this.router.get("/done-results/:type", Passport.authenticateJWT, this.CasinoController.results);


    this.router.post('/profit-loss', Passport.authenticateJWT, this.AccountController.profitloss)

    this.router.get("/all-client-ledger/one",Passport.authenticateJWT,this.AccountController.clinetladger) 
    this.router.post("/all-client-ledger/ppone",Passport.authenticateJWT,this.AccountController.clinetladger22) 

    this.router.get("/all-client-ledger/two",Passport.authenticateJWT,this.AccountController.allClientLedger) 

    this.router.post("/settle",Passport.authenticateJWT,this.AccountController.settelement)
    this.router.post("/settle2",Passport.authenticateJWT,this.AccountController.settelement2)
    this.router.post("/notice",Passport.authenticateJWT,this.AccountController.notice)
    this.router.post("/manageodd",Passport.authenticateJWT,this.AccountController.manage)
    this.router.get("/getodds",Passport.authenticateJWT,this.AccountController.PerviousOdds)


    this.router.get("/getnotice",Passport.authenticateJWT,this.AccountController.getNotice)




    this.router.post("/c-reset",Passport.authenticateJWT,this.FancyController.commissionreset)
    this.router.post("/iframe-url",Passport.authenticateJWT,this.AccountController.iframeurl)

    
  }
}
