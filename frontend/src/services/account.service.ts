import api from '../utils/api'

class AccountService {
  getAccountList(page: number, filter: any) {
    return api.post(`account-statement-list?page=${page}`, filter)
  }

  getBets22(matchId: number) {
    return api.get(`bets22?matchId=${matchId}`);
  }

  matchdetail() {
    return api.get(`matchdetail`);
  }

  comgames(){
    return api.get('completedgames')
  }

  comgamescasino(){
    return api.get('completedgamescasino')
  }


  marketcasino() {
    return api.get('marketcasino')
  }

  getAccountList22() {
    return api.post(`account-statement-list-22`)
  }
  getProfitLoss(page: number, filter: any) {
    return api.post(`profit-loss?page=${page}`, filter)
  }
}
export default new AccountService()
