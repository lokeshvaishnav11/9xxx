

import React, { MouseEvent } from 'react'
import { toast } from 'react-toastify'
import moment from 'moment'
import mobileSubheader from '../_layout/elements/mobile-subheader'
import { isMobile } from 'react-device-detect'
import userService from '../../../services/user.service'


const DeletedBets = ({ hideHeader, matchId }: any) => {
  


 
  const [betHistory, setBetHistory] = React.useState([]);

  React.useEffect(() => {
    const fetchBetHistory = async () => {
      try {
        const res = await userService.getUsercompletedbets22();
        console.log(res, "res bet history");
        setBetHistory(res.data.data); // Or setBetHistory(res.data) depending on your API response
      } catch (e: any) {
        const error = e?.response?.data?.message || "Something went wrong";
        toast.error(error);
      }
    };

    fetchBetHistory();
  }, []); 



  return (
    <>
    <h2 className="ledger-title">Deleted Bet History</h2>
      <div className='container-fluid'>

      

      <div className="container mt-4">
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-sm table-striped" style={{ backgroundColor: "#f8f9fa" }}>
          <thead className="thead-dark">
            <tr>
              <th>Parent</th>
              <th>User Name</th>
              <th>Event Name</th>
              <th>Nation</th>
              <th>Game Name</th>
              <th>Bet On</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>P/L</th>
              <th>Place Date</th>
            </tr>
          </thead>
          <tbody>
            {betHistory?.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center">No deleted bets found.</td>
              </tr>
            ) : (
              betHistory?.map((bet: any, index: number) => (
                <tr key={index}>
                  <td>{bet.parentNameStr || '-'}</td>
                  <td>{bet.userName || '-'}</td>
                  <td>{bet.matchName || '-'}</td>
                  <td>{bet.selectionName || '-'}</td>
                  <td>{bet.gtype || '-'}</td>
                  <td>{bet.bet_on || '-'}</td>
                  <td>{bet.odds ?? '-'}</td>
                  <td>{bet.stack ?? '-'}</td>
                  <td>{bet.pnl ?? '-'}</td>
                  <td>{new Date(bet.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
      </div>
    </>
  )
}
export default DeletedBets
