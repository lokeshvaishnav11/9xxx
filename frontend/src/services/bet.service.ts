import api, { fancyApi } from "../utils/api";
import IBet from "../models/IBet";

class BetService {
  postsettelement(data: any) {
    // throw new Error("Method not implemented.");
    return api.post("settle", data)
  }

  postsettelement2(data: any) {
    // throw new Error("Method not implemented.");
    return api.post("settle2", data)
  }
  notice(data: any) {
    // throw new Error("Method not implemented.");
    return api.post("notice", data)
  }


  manageodd(data: any) {
    // throw new Error("Method not implemented.");
    return api.post("manageodd", data)
  }

  prevodds() {
    // throw new Error("Method not implemented.");
    return api.get("getodds",)
  }

  

  getnotice() {
    // throw new Error("Method not implemented.");
    return api.get("getnotice")
  }
  getPlaceBet(betData: IBet) {
    return fancyApi.post("placebet", betData);
  }
  lenadena() {
    return fancyApi.get("lena-dena");
  }

  comreset(name:any){
    return api.post("c-reset", name)
  }

  oneledger() {
    return api.get("all-client-ledger/one");
  }

 

  pponeledger(sendId: string | undefined) {
    return api.post("all-client-ledger/ppone",  { sendId });
  }
 
  iframeUrl(data:any){
    return api.post("iframe-url",data)
  }

  twoledger() {
    return api.get("all-client-ledger/two");
  }


  getBets(matchId: number) {
    return fancyApi.get(`bets?matchId=${matchId}`);
  }
 
  getMarketAnalysis() {
    return api.get(`get-market-analysis`);
  }
  getBetListByIds(betIds: Array<string>, page: number) {
    return api.post(`get-bet-list-by-ids`, { betIds, page });
  }
  deleteCurrentBet(id: string) {
    return api.delete(`delete-current-bet/${id}`);
  }
  betLock(data: any) {
    return api.post(`bet-lock`, data);
  }
  getChildUserList(matchId: number, username?: string) {
    return api.get(
      `get-child-user-list?username=${username}&matchId=${matchId}`
    );
  }
  deleteBets(data: { ids: Array<string> }) {
    return api.post(`delete-bets`, data);
  }

  usersLockClientList(data: {
    ids: Array<string>;
    lock: boolean;
    type: string;
  }) {
    return api.post(`users-lock`, data);
  }
}
export default new BetService();
