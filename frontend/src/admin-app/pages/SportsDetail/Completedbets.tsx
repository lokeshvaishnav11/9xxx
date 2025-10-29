import React from 'react'
import { useParams } from 'react-router-dom'
import accountService from '../../../services/account.service';
import { AxiosResponse } from 'axios';

const Completedbets = () => {
    const maid = useParams().id
      const [marketdata, setmarketData] = React.useState<any>([]);
    

     React.useEffect(() => {
        accountService.matchdetail().then((res: AxiosResponse) => {
          console.log(res, "marketffffff data");
          const allBets = res.data.data.bets;
          console.log(allBets,"alllbets")
          const filteredBets = allBets.filter((bet: any) => bet.matchId == maid && bet.status === "completed");
          console.log(filteredBets,"filterreerre")
          setmarketData(filteredBets);
        });
      }, [maid]);



  return (
    <div className='container-fluid'>
    <h2 className="ledger-title">Completed Bets </h2>
    <div className="row">
         	 
    <div className="col-md-12">
  <table className="table table-striped table-bordered" style={{ width: "100%" }}>
    <thead>
      <tr>
        <th className="pt-0 pb-0">Client</th>
        <th className="pt-0 pb-0">Market</th>
        <th className="pt-0 pb-0">Team</th>
        <th className="pt-0 pb-0">-</th>
        <th className="text-center pt-0 pb-0">-</th>
        <th className="pt-0 pb-0">Amount</th>
        <th className="pt-0 pb-0">Result</th>
        <th className="pt-0 pb-0">Created</th>
      </tr>
    </thead>
    <tbody>
      {marketdata.map((bet:any, index:any) => (
        <tr key={index}>
          <td className="p-1 small">{bet.userName}</td>
          <td className="p-1">{bet.selectionName}</td>
          <td className="p-1">{bet.selectionName}</td>
          <td className="p-1">{bet.odds}</td>
          <td className="text-center p-1">
            {bet.isBack ? (
              <button
                style={{ textAlign: "left", fontSize: "xx-small" }}
                className="btn-yes btn btn-sm"
              >
                YES{" "}
                
              </button> ): "NO"
            }
          </td>
          <td className="p-1">{bet.stack}</td>
          <td className="p-1">{bet.pnl}</td>
          <td style={{ fontSize: "xx-small" }} className="p-1">
            {new Date(bet.createdAt).toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

           </div>
    </div>
  )
}

export default Completedbets
