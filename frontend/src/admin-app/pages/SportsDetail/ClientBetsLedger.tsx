import React from "react";
import accountService from "../../../services/account.service";
import { AxiosResponse } from "axios";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../redux/hooks";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import { dateFormat } from "../../../utils/helper";
import moment from "moment";
import { isMobile } from "react-device-detect";
import UserService from "../../../services/user.service";

// const isMobile = true;
//

interface LedgerItem {
  parentName: string;
  updown?: number;
  profit?: number;
}

interface MatchItem {
  parentNameStr: any;
  volume: any;
  profitLoss: any;
  matchDateTime: any;
  isBack: any;
  selectionId: any;
  ledgers: LedgerItem[];
  name: string;
  client: any;
  amount: any;
  rate: any;
  action: any;
  userName: any;
  userIp: any;
  stack: any;
  odds: any;
  betClickTime: any;
  selectionName: any;
  matchedDate: any;
  resultstring:any;
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

const ClientBetsLedger = () => {
  const [marketData, setmarketData] = React.useState<MatchItem[]>([]);
  const [marketonlymatch, setMarketonlymatch] = React.useState<MatchItem[]>([]);
  const [marketonlyf, setMarketonlyf] = React.useState<MatchItem[]>([]);

  const [marketData2, setmarketData2] = React.useState<MatchItem[]>([]);
  const [sendid, setSendid] = React.useState(null);
  const [stack, setStack] = React.useState<any[]>([]);

  const maid = useParams().id;

  React.useEffect(() => {
    accountService.matchdetail().then((res: AxiosResponse) => {
      // console.log(res, "marketffffff data");
      const allms = res.data.data.matches;

      const filtered = allms.filter((m: any) => m.matchId == maid);
      console.log(filtered, "filttreddd");

      const bmbets = filtered[0].bets.filter(
        (b: any) => b.bet_on === "MATCH_ODDS" && b.marketName === "Bookmaker"
      );
      console.log(bmbets, "book aker bets");
      setMarketonlymatch(bmbets);
      const bmbetf = filtered[0].bets.filter(
        (b: any) => b.bet_on !== "MATCH_ODDS" && b.marketName !== "Bookmaker"
      );

      setMarketonlyf(bmbetf);

      const runners = bmbets[0]?.runners || [];
      console.log(runners, "mathced bets");

      const result = runners.map((runner: any) => {
        const { selectionId, runnerName } = runner;

        // Step 4: Filter bets for this selectionId
        const matchedBets = bmbets.filter(
          (bet: any) => bet.selectionId === selectionId
        );

          // Match bets for opposite team
  const oppositeBets = bmbets.filter((bet: any) => bet.selectionId !== selectionId);

        // Step 5: Sum up the stack values
        // const totalStack = matchedBets.reduce(
        //   (sum: number, bet: any) => sum + (bet.stack || 0),
        //   0
        // );

        console.log(matchedBets, "matched bets for this selection");

        const totalStack = matchedBets?.reduce(
          (sum: number, bet: any) =>
            sum +
            (bet?.isBack
              ? -((bet?.stack || 0)  * (1 - bet?.odds))
              : (bet?.stack || 0) * (1 - bet?.odds)),
          0
  
        );

        const oppositeProfitLoss = oppositeBets.reduce(
          (sum: number, bet: any) =>
            sum + (bet?.isBack ? ((-bet?.stack) || 0 ) : (bet?.stack || 0)),
          0
        );
      


        console.log(totalStack, "sum of stack")

        // Step 6: Return structured object
        return {
          selectionId,
          runnerName,
          totalStack,
          profitLoss: oppositeProfitLoss,
        };
      });

      console.log(result, "resulllttttt");
      setStack(result);

      setmarketData(filtered[0].bets);

      setmarketData2(filtered);
    });
  }, [maid]);

  // console.log(marketData, "fmsjnsdjfksgdfjgksd");

  const [ledgerData, setLedgerData] = React.useState([]);

  const userState = useAppSelector(selectUserData);
  console.log(userState, "isususus");

  const [shared, setShared] = React.useState<any>();

  React.useEffect(() => {
    // const userState = useAppSelector<{ user: User }>(selectUserData);
    const username: any = userState?.user?.username;

    console.log(username, "testagentmaster");
    UserService.getParentUserDetail(username).then(
      (res: AxiosResponse<any>) => {
        console.log(res, "check balance for parent");
        const thatb = res.data?.data[0];
        // setDetail(thatb)
        // setNewbalance(thatb.balance.balance);
        setShared(thatb?.share);
      }
    );
  }, [userState]);

  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  const handleDateFilter = async (isFilterApplied = false) => {
    try {
      const res = await accountService.matchdetail();
      // console.log(res, "maatchh commsion report");

      const allms = res.data.data.matches;

      const filtered = allms.filter((m: any) => m.matchId == maid);
      // console.log(filtered,"filterretedbets")
      // console.log(filtered[0].ledgers);

      // setmarketData(filtered[0].ledgers);
      const rawData = filtered[0].ledgers.filter(
        (m: any) => m.parentName == userState.user.username
      );

      const filteredData = filtered[0].ledgers;

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
          finalTotals.upDownShare += values.updownTotal;
          finalTotals.balance += total + values.updownTotal;

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

  React.useEffect(() => {
    handleDateFilter(false); // no date filter
  }, [maid]);

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

  const [showmatch, setShowmatch] = React.useState(false);
  const [session, setSession] = React.useState(false);
  const [plus, setPlus] = React.useState(false);

  React.useEffect(() => {
    if (!isMobile) {
      setShowmatch(true);
      setSession(true);
      setPlus(true);
    }
  }, [isMobile]);

  return (
    <>
      <h5 style={{ fontSize: "20px" }} className="text-center  m-0">
        {" "}
        {marketData2[0]?.name}
      </h5>

      <h6 style={{ fontSize: "20px" }} className="text-center mt-2">
        <span className="text-center small bg-info text-white p-1">
          {" "}
          {/* ( {new Date(marketData2[0]?.matchDateTime).toLocaleTimeString()} ) */}
          {moment(marketData2[0]?.matchDateTime).format(dateFormat)}
        </span>

        
      </h6>


      <h6 style={{ fontSize: "20px" }} className="text-center mt-3">
        <span className="text-center small bg-secondary  text-white p-1">
        <i className="fas fa-trophy"></i>  {(marketData2[0]?.resultstring ? marketData2[0]?.resultstring : "" )}
        </span>
        </h6>
        
    

    
     

      <div className="container">
        <div className="res-table d-none"></div>

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
              <button
                className="btn btn-info"
                onClick={() => handleDateFilter(true)}
              >
                Submit
              </button>
            </div>
          </div>

          <select
            id="select-tools-sa"
            className="selectized selectize-input ng-valid ng-not-empty ng-dirty ng-valid-parse ng-touched d-non"
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

        <div className="row">
          <div className="col-md-6">
            <table
              className="table table-striped table-bordered"
              style={{ width: "100%" }}
            >
              <thead>
                <tr>
                  <th className="pt-1 pb-1">Team</th>
                  <th className="pt-1 pb-1">Amount</th>
                </tr>
              </thead>
              <tbody>
                {stack && (
                  <>
                    {stack?.map((team, index) => (
                      <tr key={index}>
                        <td className="pt-1 pb-1">{team?.runnerName}</td>
                        <td
                          className={`pt-1 pb-1 ${(((team?.totalStack || 0) + (team?.profitLoss || 0)) * (shared * 0.01)) > 0 
                              ? "text-red-500"
                              : "text-green-500"
                            }`}
                        >
                        {/* <p>{team?.profitLoss}</p> */}
                        {(((team?.totalStack || 0) + (team?.profitLoss || 0)) * (shared * 0.01)).toFixed(2)}

                        </td>{" "}
                        {/* Or any amount if available */}
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:flex grid gap-2 md:mb-40 mb-2 ">
          <div className="card md:mt-0 ">
            {isMobile ? (
              <button
                onClick={() => setShowmatch(!showmatch)}
                className="card-header p-0 text-center"
              >
                Display Match Bet
              </button>
            ) : (
              <div className="card-header p-0 text-center">MATCH</div>
            )}
            {showmatch ? (
              <div
                style={{ height: "30vh" }}
                className="card-body p-0 overflow-x-scroll overflow-y-scroll"
              >
                <table className="table table-striped table-bordered table-hover">
                  <thead className="small">
                    <tr>
                      <th className="pt-0 pb-0">Client</th>
                      <th className="pt-0 pb-0">Amount</th>
                      <th className="pt-0 pb-0">Rate</th>
                      <th className="pt-0 pb-0">-</th>
                      <th className="pt-0 pb-0">PnL</th>

                      <th className="pt-0 pb-0">Date</th>
                      <th className="pt-0 pb-0">IP</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {marketonlymatch?.map((bet, index) => (
                      <tr key={index}>
                        <td className="p-1 pt-2 small pr-0">{bet?.userName}/{bet?.parentNameStr}</td>
                        <td
                          className={`pt-2 pb-1 ${bet?.profitLoss < 0
                              ? "text-red-500"
                              : "text-green-500"
                            }`}
                        >
                          {bet?.stack}
                        </td>
                        <td className="pt-2 pb-1">{bet?.odds.toFixed(2)}</td>
                        <td className="pt-2 pb-1">
                          {bet?.isBack ? (
                            <button
                              className="btn-yes btn btn-sm p-1 ng-scope gap-1 d-flex"
                              style={{ fontSize: "xx-small" }}
                            >
                              <span
                                className="badge badge-light"
                                style={{ fontSize: "xx-small" }}
                              >
                                L
                              </span>
                              <span
                                className="badge badge-light"
                                style={{ fontSize: "xx-small" }}
                              >
                                {bet.selectionName}
                              </span>
                            </button>
                          ) : (
                            <button
                              className="btn-not btn btn-sm p-1 gap-1 d-flex"
                              style={{ fontSize: "xx-small" }}
                            >
                              <span
                                className="badge badge-light"
                                style={{ fontSize: "xx-small" }}
                              >
                                K
                              </span>
                              <span
                                className="badge badge-light"
                                style={{ fontSize: "xx-small" }}
                              >
                                {bet.selectionName}
                              </span>{" "}
                            </button>
                          )}
                        </td>

                        {/* <td className="text-center pt-1 pb-1">
              {bet.action === 0 && (
                <button className="btn-yes btn btn-sm p-1" style={{ fontSize: 'xx-small' }}>
                  <span className="badge badge-action" style={{ fontSize: 'xx-small' }}>L</span>
                  <span className="badge badge-light" style={{ fontSize: 'xx-small' }}>{bet.team}</span>
                </button>
              )}
              {bet.action === 1 && (
                <button className="btn-not btn btn-sm p-1" style={{ fontSize: 'xx-small' }}>
                  <span className="badge badge-action" style={{ fontSize: 'xx-small' }}>K</span>
                  <span className="badge badge-light" style={{ fontSize: 'xx-small' }}>{bet.team}</span>
                </button>
              )}
            </td> */}

<td
                                      className={`pt-2 pb-1 ${bet?.profitLoss < 0
                                          ? "text-red-500"
                                          : "text-green-500"
                                        }`}
                                    >
                                      {(bet?.profitLoss).toFixed()}
                                    </td>
                        <td
                          className="pt-2 pb-1 text-nowrap"
                          style={{ fontSize: "xx-small" }}
                        >
                          {moment(bet?.betClickTime).format(dateFormat)} 
                        </td>
                        <td
                          className="pt-2 pb-1"
                          style={{ fontSize: "xx-small" }}
                        >
                          {bet?.userIp?.split(":").slice(0, 4).join(":")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              ""
            )}
          </div>

          <div>
            {isMobile ? (
              <button
                onClick={() => setSession(!session)}
                className="card-header p-0 text-center w-100"
              >
                Display Session Bet
              </button>
            ) : (
              ""
            )}

            {session ? (
              <div className="card-heade p-0 mb-20 " id="headig">
                {[
                  //@ts-expect-error
                  ...new Map(
                    marketonlyf?.map((item) => [item?.selectionId, item])
                  ).values(),
                ].map((bet, index) => (
                  <>
                    <h6 className="mb-2" key={bet?.selectionId}>
                      <button
                        onClick={() =>
                          setSendid((prev) =>
                            prev === bet?.selectionId ? null : bet?.selectionId
                          )
                        }
                        className="p-2 small badge navbar-bet99 w-100 text-left border text-dark ng-binding"
                      >
                        {bet?.selectionName}
                        <span className="badge badge-light float-right ng-binding ng-scope">
                          {/* {bet?.declared === 1 && ( */}
                          <i className="fas fa-trophy"></i>
                          {bet?.fancy?.result
                            ? bet?.fancy?.result
                            : bet?.oppsiteVol}
                          {/* // )} */}
                        </span>
                      </button>
                    </h6>
                    {sendid === bet?.selectionId && (
                      <div className="card mb-2">
                        <div className="card-body p-0">
                          <table className="table table-striped table-bordered table-hover">
                            <thead className="small">
                              <tr>
                                <th className="pt-0 pb-0">Client</th>
                                <th className="pt-0 pb-0">Yes/Not</th>
                                <th className="pt-0 pb-0">Rate</th>

                                <th className="pt-0 pb-0">-</th>
                                <th className="pt-0 pb-0">Amount</th>
                                <th className="pt-0 pb-0">PnL</th>

                                <th className="pt-0 pb-0">Created</th>
                                <th className="pt-0 pb-0">IP</th>
                              </tr>
                            </thead>
                            <tbody className="small">
                              {marketonlyf
                                ?.filter((bet) => bet?.selectionId === sendid)
                                .map((bet, index) => (
                                  <tr key={index}>
                                    <td className="p-1 pt-2 small pr-0">
                                      {bet.userName}/{bet?.parentNameStr}
                                    </td>
                                    <td className="pt-2 pb-1">{bet?.odds}</td>
                                    <td className="pt-2 pb-1">{bet?.volume}</td>

                                    <td className="pt-2 pb-1">
                                      {bet?.isBack ? (
                                        <button
                                          className="btn-yes btn btn-sm p-1 ng-scope"
                                          style={{ fontSize: "xx-small" }}
                                        >
                                          <span
                                            className="badge badge-light"
                                            style={{ fontSize: "xx-small" }}
                                          >
                                            YES
                                          </span>
                                        </button>
                                      ) : (
                                        <button
                                          className="btn-not btn btn-sm p-1 ng-scope"
                                          style={{ fontSize: "xx-small" }}
                                        >
                                          <span
                                            className="badge badge-light"
                                            style={{ fontSize: "xx-small" }}
                                          >
                                            NOT
                                          </span>
                                        </button>
                                      )}
                                    </td>

                                    {/* <td className="text-center pt-1 pb-1">
      {bet.action === 0 && (
        <button className="btn-yes btn btn-sm p-1" style={{ fontSize: 'xx-small' }}>
          <span className="badge badge-action" style={{ fontSize: 'xx-small' }}>L</span>
          <span className="badge badge-light" style={{ fontSize: 'xx-small' }}>{bet.team}</span>
        </button>
      )}
      {bet.action === 1 && (
        <button className="btn-not btn btn-sm p-1" style={{ fontSize: 'xx-small' }}>
          <span className="badge badge-action" style={{ fontSize: 'xx-small' }}>K</span>
          <span className="badge badge-light" style={{ fontSize: 'xx-small' }}>{bet.team}</span>
        </button>
      )}
    </td> */}
                                    <td
                                      className={`pt-2 pb-1 ${bet?.profitLoss < 0
                                          ? "text-red-500"
                                          : "text-green-500"
                                        }`}
                                    >
                                      {bet?.stack}
                                    </td>

                                    <td
                                      className={`pt-2 pb-1 ${bet?.profitLoss < 0
                                          ? "text-red-500"
                                          : "text-green-500"
                                        }`}
                                    >
                                      {bet?.profitLoss}
                                    </td>

                                    <td
                                      className="pt-2 pb-1 text-nowrap"
                                      style={{ fontSize: "xx-small" }}
                                    >
                                      {moment(bet?.betClickTime).format(dateFormat)} 
                                      {/* ( {new Date(bet?.betClickTime).toLocaleTimeString()}) */}
                                    </td>
                                    <td
                                      className="pt-2 pb-1"
                                      style={{ fontSize: "xx-small" }}
                                    >
                                      {bet?.userIp
                                        ?.split(":")
                                        ?.slice(0, 4)
                                        ?.join(":")}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                ))}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>

        <div>
          {isMobile ? (
            <button
              onClick={() => setPlus(!plus)}
              className="card-header p-0 text-center w-100"
            >
              Match & Session Plus Minus
            </button>
          ) : (
            ""
          )}

          {plus ? (
            <div>
              <div className="container-fluidh mt-2">
                <div className="row">
                  <div
                    style={{ height: "200px" }}
                    className="col-sm-12 overflow-auto "
                  >
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
                            Match (+/-)
                          </th>
                          <th
                            className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: "61px" }}
                          >
                            Session (+/-)
                          </th>
                          <th
                            className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: "55px" }}
                          >
                            Total
                          </th>
                          <th
                            className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: "36px" }}
                          >
                            M.Com
                          </th>
                          <th
                            className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: "34px" }}
                          >
                            S.Com
                          </th>
                          <th
                            className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: "33px" }}
                          >
                            T.Com
                          </th>
                          <th
                            className="navbar-bet99 text-dark pt-2 pb-2 small sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: "55px" }}
                          >
                            G.Total
                          </th>
                          {/* <th
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
                  </th> */}
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
                                    row.match < 0
                                      ? "text-danger"
                                      : "text-success"
                                  }
                                >
                                  {`${row.match.toFixed(2)}`}
                                </span>
                              </td>

                              <td className="ng-scope">
                                <span
                                  className={
                                    row.session < 0
                                      ? "text-danger"
                                      : "text-success"
                                  }
                                >
                                  {`${row.session.toFixed(2)}`}
                                </span>
                              </td>

                              <td className="ng-scope">
                                <span
                                  className={
                                    row.total < 0
                                      ? "text-danger"
                                      : "text-success"
                                  }
                                >
                                  {row.totall.toFixed(2)}
                                </span>
                              </td>

                              <td className="ng-scope">
                                <span className="text-danger">
                                  {row.mCom.toFixed(2)}
                                </span>
                              </td>
                              <td className="ng-scope">
                                <span className="text-danger">
                                  {row.sCom.toFixed(2)}
                                </span>
                              </td>
                              <td className="ng-scope">
                                <span className="text-danger">
                                  {row.tCom.toFixed(2)}
                                </span>
                              </td>

                              <td className="ng-scope">
                                <span
                                  className={
                                    row.gTotal < 0
                                      ? "text-danger"
                                      : "text-success"
                                  }
                                >
                                  {row.gTotal.toFixed(2)}
                                </span>
                              </td>

                              {/* <td className="ng-scope">
                        <span
                          className={
                            row.upDownShare < 0 ? "text-danger" : "text-success"
                          }
                        >
                          {userState.user.role == "dl"
                            ? `${row.gTotal.toFixed(2)}`
                            : `${row.upDownShare.toFixed(2)}`}
                        </span>
                      </td> */}

                              {/* <td className="ng-scope">
                        <span
                          className={
                            row.balance < 0 ? "text-danger" : "text-success"
                          }
                        >
                          {userState.user.role == "dl"
                            ? `${row.gTotal.toFixed(2)}`
                            : `${row.balance.toFixed(2)}`}
                        </span>
                      </td> */}

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
                      <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                        -
                      </th>
                      <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                        Match (+/-)
                      </th>
                      <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                        Session (+/-)
                      </th>
                      <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                        Total
                      </th>
                      <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                        M.Com
                      </th>
                      <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                        S.Com
                      </th>
                      <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                        T.Com
                      </th>
                      <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                        G. Total
                      </th>
                      {/* <th className="navbar-bet99 text-dark pt-1 pb-1 small">
                        UP. Share
                      </th> */}
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
                          {(ledgerTotal?.match + ledgerTotal?.session).toFixed(
                            2
                          )}
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
                      {/* <td className="pt-1 pb-1">
                        <span
                          ng-class="totalPandL.my_share > 0 ? 'text-success' : 'text-danger'"
                          className="ng-binding text-danger"
                        >
                          {ledgerTotal?.upDownShare?.toFixed(2)}
                        </span>
                      </td> */}
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
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default ClientBetsLedger;
