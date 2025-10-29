import React from 'react'
import accountService from '../../../services/account.service';
import { AxiosResponse } from 'axios';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import { selectUserData } from '../../../redux/actions/login/loginSlice';

interface LedgerItem {
    parentName: string;
    updown?: number;
    profit?: number;
  }
  
  interface MatchItem {
    ledgers: LedgerItem[];
  }

  type GroupedLedger = {
    username: string;
    cname: string;
    ss: number;
  
    matchPlusMinus: number;
    sessionPlusMinus: number;
    matchcommision: number;
    fancycommmision: number;
  };
  
  type FinalLedgerRow = {
    client: string;
    match: number;
    session: number;
    total: number;
    mCom: number;
    sCom: number;
    tCom: number;
    gTotal: number;
    upDownShare: number;
    balance: number;
    // finalLedger: any;
  };
  
  interface ReportModalProps {
    data: any; // or be more specific if you know the type, e.g., `string` or `User`
  }

const ReportBets = () => {
      const [marketData, setmarketData] = React.useState<MatchItem[]>([]);
     const maid = useParams().id

    //   React.useEffect(() => {
    //     accountService.matchdetail().then((res: AxiosResponse) => {
    //       console.log(res, "marketffffff data");
    //       const allms = res.data.data.matches;

    //       const filtered = allms.filter((m: any) => m.matchId == maid);
    //       console.log(filtered[0].ledgers)

    //       setmarketData(filtered[0].ledgers);
    //     });
    
    //   }, [maid]);




      const [ledgerData, setLedgerData] = React.useState([]);
        const userState = useAppSelector(selectUserData);
        console.log(userState);
      
        const [startDate, setStartDate] = React.useState<string>("");
        const [endDate, setEndDate] = React.useState<string>("");
      
        const handleDateFilter =  async (isFilterApplied = false) => {
          try {
            const res = await accountService.matchdetail()
            // console.log(res, "maatchh commsion report");

            const allms = res.data.data.matches;

            const filtered = allms.filter((m: any) => m.matchId == maid);
            console.log(filtered[0].ledgers)
  
            // setmarketData(filtered[0].ledgers);
            const rawData = filtered[0].ledgers.filter((m:any) => m.parentName == userState.user.username)
      
            const filteredData = rawData;
      
            const grouped: Record<string, GroupedLedger & { updownTotal: number }> =
              {};
      
              filteredData.forEach((item: any) => {
              const childId: string = item.ChildId ? item.ChildId : item.ParentId;
//               const childId: string | null = item.ChildId ? item.ChildId : item.ParentId;

//   // ✅ Skip entry if childId is missing/null/undefined
//   if (!childId) return;
              const isFancy: boolean = item.Fancy;
              const money: number = Number(item.fammount) || 0;
              const commissionn: any = Number(item.commissiondega) || 0;
              const updown: number = Number(item.umoney) || 0;
      
              if (!grouped[childId]) {
                grouped[childId] = {
                  username: item.username,
                  cname: item.cname,
                  ss: item.superShare,
                  matchPlusMinus: 0,
                  sessionPlusMinus: 0,
                  matchcommision: 0,
                  fancycommmision: 0,
                  updownTotal: 0,
                };
              }
      
              if (isFancy) {
                grouped[childId].sessionPlusMinus += money;
                grouped[childId].fancycommmision += commissionn;
              } else {
                grouped[childId].matchPlusMinus += money;
                grouped[childId].matchcommision += commissionn;
              }
              grouped[childId].updownTotal += updown;
            });
      
            const finalTotals = {
              match: 0,
              session: 0,
              mCom: 0,
              sCom: 0,
              tCom: 0,
              gTotal: 0,
              upDownShare: 0,
              balance: 0,
            };
      
            const finalLedger: any = Object.entries(grouped).map(
              ([ChildId, values]) => {
                // const match = values.matchPlusMinus;
                // const session = values.sessionPlusMinus;
                const match = values.matchPlusMinus;
                const session = values.sessionPlusMinus;
                const matchc = values.matchcommision;
                const fancyc = values.fancycommmision;
                const ctotal: any = matchc + fancyc;
                const totall = match + session;
                const total = totall - ctotal;
      
                // ✅ Accumulate totals here
                // finalTotals.match += match;
                // finalTotals.session += session;
                finalTotals.match += match;
                finalTotals.session += session;
                finalTotals.mCom += matchc;
                finalTotals.sCom += fancyc;
                finalTotals.tCom += ctotal;
                finalTotals.gTotal += total;
                finalTotals.upDownShare += values.updownTotal ;
                finalTotals.balance += total + values.updownTotal ;
      
                return {
                  client: values.username,
                  cname: values.cname,
                  ss: values.ss,
                  match,
                  session,
                  totall,
                  mCom: matchc,
                  sCom: fancyc,
                  tCom: ctotal,
                  gTotal: total,
                  upDownShare: values.updownTotal,
                  balance: total + values.updownTotal,
                };
              }
            );
            console.log(finalLedger, "heloo world final ledger is here");
      
            setLedgerTotal(finalTotals);
      
            setLedgerData(finalLedger);
          } catch (err) {
            console.error("Error filtering ledger by date:", err);
          }
        };
      
        const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
      
        const [optionuser, setOptionuser] = React.useState<string>("all");
      
        const [searchTerm, setSearchTerm] = React.useState("");
      
        const [ledgerTotal, setLedgerTotal] = React.useState<any>({});
      
        const showModal = (username: string) => {
          setSelectedUser(username);
        };
      
        const closeModal = () => {
          setSelectedUser(null);
        };
      
        const filteredLedgerData = ledgerData.filter((row: any) => {
          const matchOptionUser = optionuser === "all" || row.client === optionuser;
          const matchSearch = row.client
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          return matchOptionUser && matchSearch;
        });
      
        React.useEffect(() => {
          handleDateFilter(false); // no date filter
        }, [maid]);





  return (
    <> <h2 className="ledger-title">AGENT P/L</h2><div className="container">
        <div className="res-table d-none">
  <table className="table table-striped table-bordered">
    <thead>
      <tr>
        <th></th>
        <th colSpan={9} className="text-center"></th>
       
      </tr>
      <tr>
        <th className="small" style={{ fontWeight: 'bolder' }}>Client</th>
        <th className="small" style={{ fontWeight: 'bolder' }}>M.AMT</th>
        <th className="small" style={{ fontWeight: 'bolder' }}>S.AMT</th>
        <th className="small" style={{ fontWeight: 'bolder' }}>TOT.AMT</th>
        <th className="small" style={{ fontWeight: 'bolder' }}>M.COM</th>
        <th className="small" style={{ fontWeight: 'bolder' }}>S.COM</th>
        <th className="small" style={{ fontWeight: 'bolder' }}>TOT.COM</th>
        <th className="small" style={{ fontWeight: 'bolder' }}>NET.AMT</th>
        <th className="small" style={{ fontWeight: 'bolder' }}>SHR.AMT</th>
        <th className="small" style={{ fontWeight: 'bolder' }}>FINAL</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="small">(CL26547)</td>
        <td className="small text-danger">-5,800</td>
        <td className="small text-danger">-12,250</td>
        <td className="small text-danger">-18,050</td>
        <td className="small text-danger">0</td>
        <td className="small text-danger">-1,160</td>
        <td className="small text-danger">-1,160</td>
        <td className="small text-danger">-19,210</td>
        <td className="small text-danger" style={{ fontWeight: 'bold' }}>-14,600</td>
        <td className="small text-danger">-4,610</td>
      </tr>
      <tr>
        <td className="text-right">TOTAL</td>
        <td className="small text-danger" style={{ fontWeight: 'bold' }}>-5,800</td>
        <td className="small text-danger" style={{ fontWeight: 'bold' }}>-12,250</td>
        <td className="small text-danger" style={{ fontWeight: 'bold' }}>-18,050</td>
        <td className="small text-danger" style={{ fontWeight: 'bold' }}>0</td>
        <td className="small text-danger" style={{ fontWeight: 'bold' }}>-1,160</td>
        <td className="small text-danger" style={{ fontWeight: 'bold' }}>-1,160</td>
        <td className="small text-danger" style={{ fontWeight: 'bold' }}>-19,210</td>
        <td className="small text-danger" style={{ fontWeight: 'bold' }}>-14,600</td>
        <td className="small text-danger" style={{ fontWeight: 'bold' }}>-4,610</td>
      </tr>
    </tbody>
  </table>
</div>



<div className="control-group mt-2 selectize-control single">
        <div className="row p-2 d-none">
          <div className="col-4 mt-1">
            <label className="small"> Start Date</label>
            <input
              type="date"
              className="form-control start_date"
              name="start_date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-4 mt-1">
            <label className="small"> End Date</label>
            <input
              type="date"
              className="form-control end_date"
              name="end_date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-4 mt-2" style={{ paddingTop: 20 }}>
            <button className="btn btn-info" onClick={() => handleDateFilter(true)}>
              Submit
            </button>
          </div>
        </div>

        <select
          id="select-tools-sa"
          className="selectized selectize-input ng-valid ng-not-empty ng-dirty ng-valid-parse ng-touched d-none"
          value={optionuser}
          onChange={(e) => setOptionuser(e.target.value)}
        >
          <option value="all">All Clients</option>
          {ledgerData.map((row: any, index) => (
            <option key={index} value={row.client}>
              {row.client}
            </option>
          ))}
        </select>

        <div className="row mt-2 d-none">
          <div className="col-sm-12 col-md-6"></div>
          <div className="col-sm-12 col-md-6">
            <div id="DataTables_Table_0_filter" className="dataTables_filter">
              <label>
                Search:
                <input
                  type="search"
                  className="form-control form-control-sm"
                  placeholder=""
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluidh mt-2">
        <div className="row">
          <div className="col-sm-12 overflow-auto h-screen">
            <table
              className="table table-striped table-bordered ledger-list downlinepandl dataTable no-footer"
              style={{ width: "100%" }}
              id="DataTables_Table_3"
              role="grid"
            >
              <thead className="small">
                <tr role="row">
                  <th
                    className="navbar-bet99 text-dark pt-2 pb-2 small ng-binding sorting_disabled"
                    rowSpan={1}
                    colSpan={1}
                    style={{ width: "93px" }}
                  >
                    Client
                  </th>
                  <th
                    className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                    rowSpan={1}
                    colSpan={1}
                    style={{ width: "59px" }}
                  >
                    M.AMT
                  </th>
                  <th
                    className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                    rowSpan={1}
                    colSpan={1}
                    style={{ width: "61px" }}
                  >
                    S.AMT
                  </th>
                  <th
                    className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                    rowSpan={1}
                    colSpan={1}
                    style={{ width: "55px" }}
                  >
                    TOT.AMT
                  </th>
                  <th
                    className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                    rowSpan={1}
                    colSpan={1}
                    style={{ width: "36px" }}
                  >
                    M.COM
                  </th>
                  <th
                    className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                    rowSpan={1}
                    colSpan={1}
                    style={{ width: "34px" }}
                  >
                    S.COM
                  </th>
                  <th
                    className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                    rowSpan={1}
                    colSpan={1}
                    style={{ width: "33px" }}
                  >
                    TOT.COM
                  </th>
                  <th
                    className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                    rowSpan={1}
                    colSpan={1}
                    style={{ width: "55px" }}
                  >
                    NET.AMT
                  </th>
                  <th
                    className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                    rowSpan={1}
                    colSpan={1}
                    style={{ width: "69px" }}
                  >
                   SHR.AMT
                  </th>
                  <th
                    className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                    rowSpan={1}
                    colSpan={1}
                    style={{ width: "55px" }}
                  >
                    FINAL
                  </th>
                  
                </tr>
              </thead>

              <tbody className="small">
                {filteredLedgerData.length > 0 ? (
                  filteredLedgerData.map((row: any, index) => (
                    <tr
                      role="row"
                      className={index % 2 === 0 ? "even" : "odd"}
                      key={index}
                    >
                      <td className="ng-scope">
                        {row.client}
                        {`(${row.cname})`}
                      </td>

                      <td className="ng-scope">
                        <span
                          className={
                            row.match < 0 ? "text-danger" : "text-success"
                          }
                        >
                          {`${row.match.toFixed(2)}`}
                        </span>
                      </td>

                      <td className="ng-scope">
                        <span
                          className={
                            row.session < 0 ? "text-danger" : "text-success"
                          }
                        >
                          {`${row.session.toFixed(2)}`}
                        </span>
                      </td>

                      <td className="ng-scope">
                        <span
                          className={
                            row.total < 0 ? "text-danger" : "text-success"
                          }
                        >
                          {row.totall}
                        </span>
                      </td>

                      <td className="ng-scope">
                        <span className="text-danger">{row.mCom}</span>
                      </td>
                      <td className="ng-scope">
                        <span className="text-danger">{row.sCom}</span>
                      </td>
                      <td className="ng-scope">
                        <span className="text-danger">{row.tCom}</span>
                      </td>

                      <td className="ng-scope">
                        <span
                          className={
                            row.gTotal < 0 ? "text-danger" : "text-success"
                          }
                        >
                          {row.gTotal.toFixed(2)}
                        </span>
                      </td>

                      <td className="ng-scope">
                        <span
                          className={
                            row.upDownShare < 0 ? "text-danger" : "text-success"
                          }
                        >
                          {userState.user.role == "dl"
                            ? `${row.gTotal.toFixed(2)}`
                            : `${row.upDownShare.toFixed(2)}`}
                        </span>
                      </td>

                      <td className="ng-scope">
                        <span
                          className={
                            row.balance < 0 ? "text-danger" : "text-success"
                          }
                        >
                          {userState.user.role == "dl"
                            ? `${row.gTotal.toFixed(2)}`
                            : `${row.balance.toFixed(2)}`}
                        </span>
                      </td>

                      <td className="d-none">
                        <button
                          onClick={() => showModal(row.client)}
                          title="Details"
                          className="btn-view-details btn btn-warning btn-sm small m-0"
                        >
                          <i className="fas fa-window-maximize"></i>
                        </button>
                      </td>

                      {selectedUser && (
                        <div className="absolute w-full container-fluidx top-0 left-0 bg-white z-50 p-3 border shadow-lg">
                          <button
                            onClick={closeModal}
                            type="button"
                            className="close"
                            data-dismiss="modal"
                            aria-label="Close"
                          >
                            <span aria-hidden="true">×</span>
                          </button>
                          {/* <ReportModal data={selectedUser} /> */}
                        </div>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center text-muted">
                      No user found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        className="card-body bg-light p-0"
        style={{
          position: "fixed",
          zIndex: "50",
          bottom: "0px",
          left: "0px",
          width: "100%",
          overflow: "auto",
        }}
      >
        <table
          className="table table-striped table-bordered p-0 m-0"
          style={{ width: "100%" }}
        >
          <thead className="small">
            <tr>
              <th className="navbar-bet99 text-dark pt-1 pb-1 small">-</th>
              <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                Match (+/-)
              </th>
              <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                Session (+/-)
              </th>
              <th className="navbar-bet99 text-dark pt-1 pb-1 small">Total</th>
              <th className="navbar-bet99 text-dark pt-1 pb-1 small">M.Com</th>
              <th className="navbar-bet99 text-dark pt-1 pb-1 small">S.Com</th>
              <th className="navbar-bet99 text-dark pt-1 pb-1 small">T.Com</th>
              <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                G. Total
              </th>
              <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                UP. Share
              </th>
              <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                Final
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pt-1 pb-1">
                <strong>TOTAL</strong>
              </td>
              <td className="pt-1 pb-1">
                <span
                  ng-class="totalPandL.net_p_l_odds > 0 ? 'text-success' : 'text-danger'"
                  className="ng-binding text-success"
                >
                  {ledgerTotal?.match?.toFixed(2)}
                </span>
              </td>
              <td className="pt-1 pb-1">
                <span
                  ng-class="totalPandL.net_p_l_session > 0 ? 'text-success' : 'text-danger'"
                  className="ng-binding text-danger"
                >
                  {ledgerTotal?.session?.toFixed(2)}
                </span>
              </td>
              <td className="pt-1 pb-1">
                <span
                  ng-class="totalPandL.total_pandl > 0 ? 'text-success' : 'text-danger'"
                  className="ng-binding text-success"
                >
                  {(ledgerTotal?.match + ledgerTotal?.session).toFixed(2)}
                </span>
              </td>
              <td className="pt-1 pb-1">
                <span
                  ng-class="totalPandL.match_comm > 0 ? 'text-danger' : 'text-danger'"
                  className="ng-binding text-danger"
                >
                  {ledgerTotal?.mCom?.toFixed(2)}
                </span>
              </td>
              <td className="pt-1 pb-1">
                <span
                  ng-class="totalPandL.sess_comm > 0 ? 'text-danger' : 'text-danger'"
                  className="ng-binding text-danger"
                >
                  {ledgerTotal?.sCom?.toFixed(2)}
                </span>
              </td>
              <td className="pt-1 pb-1">
                <span
                  ng-class="totalPandL.total_comm > 0 ? 'text-danger' : 'text-danger'"
                  className="ng-binding text-danger"
                >
                  {ledgerTotal?.tCom?.toFixed(2)}
                </span>
              </td>
              <td className="pt-1 pb-1">
                <span
                  ng-class="totalPandL.total_amount > 0 ? 'text-success' : 'text-danger'"
                  className="ng-binding text-danger"
                >
                  {ledgerTotal?.gTotal?.toFixed(2)}
                </span>
              </td>
              <td className="pt-1 pb-1">
                <span
                  ng-class="totalPandL.my_share > 0 ? 'text-success' : 'text-danger'"
                  className="ng-binding text-danger"
                >
                  {ledgerTotal?.upDownShare?.toFixed(2)}
                </span>
              </td>
              <td className="pt-1 pb-1">
                <span
                  ng-class="totalPandL.net_amt > 0 ? 'text-success' : 'text-danger'"
                  className="ng-binding text-danger"
                >
                  {ledgerTotal?.balance?.toFixed(2)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      </div></>
  )
}

export default ReportBets