import { AxiosResponse } from 'axios';
import React from 'react'
import accountService from '../../services/account.service';
import moment from 'moment';

const CompletedCasino = () => {

    const [casinoData, setCasinoData] = React.useState<any>([]);

    const [filteredData, setFilteredData] = React.useState<any>([]);
    const [openMatch, setOpenMatch] = React.useState<string | null>(null);

    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");

    

    React.useEffect(() => {
        accountService.comgamescasino().then((res: AxiosResponse) => {
            console.log(res, "marketffffff data");
            const allData = res?.data?.data?.bets?.reverse() || [];
            setCasinoData(allData);
            setFilteredData(allData); //
        });
    }, []);

    const groupedData = filteredData.reduce((acc: any, bet: any) => {
        const key = bet.matchName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(bet);
        return acc;
      }, {});


    const handleFilter = () => {
        if (!startDate || !endDate) return;

        const start = moment(startDate).startOf("day");
        const end = moment(endDate).endOf("day");

        const filtered = casinoData.filter((item: any) => {
            const betTime = moment(item.betClickTime);
            return betTime.isBetween(start, end, undefined, "[]"); // inclusive
        });

        setFilteredData(filtered);
    };

    return (
        <div className='px-2'>

            <div className="back-main-menu my-2">
                <a>Casino Completed Games</a>
            </div>


            <div style={{ fontSize: "12px" }} className="d-flex gap-2 align-items-end mb-3  flex-wrap">
                <div className='me-1'>
                    <label className="form-label mb-1 ">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        className="form-control p-1"
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className='me-1'>
                    <label className="form-label mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        className="form-control p-1"
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div>
                    <button className="btn btn-primary" onClick={handleFilter}>
                        Filter
                    </button>
                </div>
            </div>



            {/* <div className="table-responsive ">
                <table className="table table-sm table-bordered text-nowrap mb-0">
                    <thead className="table-dark text-center">
                        <tr>
                            <th>Match</th>
                            <th>Type</th>
                            <th>Rate</th>
                            <th>Amount</th>
                            <th>PnL</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData?.map((b: any, i: number) => (
                            filteredData.length > 0 ?
                                <tr key={i} className="text-center align-middle">
                                    <td>{b?.matchName}</td>
                                    <td>{b?.selectionName}</td>
                                    <td>
                                        {b?.odds}
                                    </td>
                                    <td>
                                        {b?.stack}
                                    </td>
                                    <td className={b?.profitLoss >= 0 ? "text-success" : "text-danger"}>
                                        {b?.profitLoss.toFixed()}
                                    </td>

                                    <td className="text-center">
                                        <span
                                            className={`badge rounded-pill text-light ${b?.profitLoss >= 0 ? "bg-success" : "bg-danger"
                                                }`}
                                            style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                                        >
                                            {b?.profitLoss >= 0 ? "Win" : "Lost"}
                                        </span>
                                    </td>

                                    <td>{moment(b?.betClickTime).format('MM/DD/YYYY  h:mm a')}
                                    </td>

                                </tr> : "no data"
                        ))}
                    </tbody>
                </table>
            </div> */}


<div className="table-responsive">
      <table className="table table-sm table-bordered text-nowrap mb-0">
        <thead className="table-dark text-center">
          {/* <tr>
            <th>Match</th>
            <th>Total PnL</th>
            <th>Status</th>
            <th>Toggle</th>
          </tr> */}
        </thead>
        <tbody>
          {Object.entries(groupedData).map(([matchName, bets]: [string, any[]], i) => {
            const totalPnL = bets.reduce((sum, b) => sum + b.profitLoss, 0);
            const isPositive = totalPnL >= 0;

            return (
              <React.Fragment key={i}>
                {/* Summary Row */}
                <tr className="text-center bg-light align-middle" onClick={() => setOpenMatch(openMatch === matchName ? null : matchName)} style={{ cursor: "pointer" }}>
                  <td>{matchName}</td>
                  <td className={isPositive ? "text-success" : "text-danger"}>
                    {totalPnL.toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${isPositive ? "bg-success" : "bg-danger"}`}>
                      {isPositive ? "Win" : "Lost"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary">
                      {openMatch === matchName ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>

                {/* Expanded Details */}
                {openMatch === matchName && (
                  <tr>
                    <td colSpan={4}>
                      <div className="table-responsive">
                        <table className="table table-sm table-striped mb-0">
                          <thead className="table-secondary text-center">
                            <tr>
                              <th>Type</th>
                              <th>Rate</th>
                              <th>Amount</th>
                              <th>PnL</th>
                              <th>Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bets.map((b: any, j: number) => (
                              <tr key={j} className="text-center align-middle">
                                <td>{b?.selectionName}</td>
                                <td>{b?.odds}</td>
                                <td>{b?.stack}</td>
                                <td className={b?.profitLoss >= 0 ? "text-success" : "text-danger"}>
                                  {b?.profitLoss.toFixed(2)}
                                </td>
                                <td>
                                  <span className={`badge rounded-pill text-light ${b?.profitLoss >= 0 ? "bg-success" : "bg-danger"}`}>
                                    {b?.profitLoss >= 0 ? "Win" : "Lost"}
                                  </span>
                                </td>
                                <td>{moment(b?.betClickTime).format("MM/DD/YYYY h:mm:ss a")}</td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>





        </div>
    )
}

export default CompletedCasino
