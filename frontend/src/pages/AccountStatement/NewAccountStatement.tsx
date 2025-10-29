import moment from "moment";
import React, { MouseEvent, useState } from "react";
// import ReactPaginate from 'react-paginate'
import { toast } from "react-toastify";
import accountService from "../../services/account.service";
import { dateFormat } from "../../utils/helper";
import { isMobile } from "react-device-detect";
import mobileSubheader from "../_layout/elements/mobile-subheader";
import { AccoutStatement } from "../../models/AccountStatement";
import { AxiosResponse } from "axios";
import betService from "../../services/bet.service";
import ReactModal from "react-modal";
import BetListComponent from "../../admin-app/pages/UnsetteleBetHistory/bet-list.component";
import { useAppSelector } from "../../redux/hooks";
import { selectLoader } from "../../redux/actions/common/commonSlice";
import ReactPaginate from "react-paginate";

import "./newaccount.css";
import { reverse } from "lodash";

const NewAccountStatement = () => {
  const loadingState = useAppSelector(selectLoader);

  const [accountStmt, setAccountStmt] = React.useState<any>([]);
  const [parseAccountStmt, setparseAccountStmt] = React.useState<any>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [betHistory, setBetHistory] = React.useState<any>({});
  const [selectedStmt, setSelectedStmt] = React.useState<AccoutStatement>(
    {} as AccoutStatement
  );
  const [pageBet, setPageBet] = React.useState(1);
  const [openBalance, setOpenBalance] = React.useState(0);
  const [closeBalance, setCloseBalance] = React.useState(0);
  const [filterdata, setfilterdata] = React.useState<any>({
    startDate: "",
    endDate: "",
    reportType: "All",
  });
  const [page, setPage] = React.useState(0);

  const [currentItems, setCurrentItems] = useState<any>([]);
  const [pageCount, setPageCount] = useState<any>(0);
  const [itemOffset, setItemOffset] = useState<any>(0);
  const [itemsPerPage] = useState<any>(50);
  React.useEffect(() => {
    const filterObj = filterdata;
    filterObj.startDate = moment().subtract(7, "days").format("YYYY-MM-DD");
    filterObj.endDate = moment().format("YYYY-MM-DD");
    setfilterdata(filterObj);
    getAccountStmt(0);
  }, []);

  React.useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(parseAccountStmt.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(parseAccountStmt.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, parseAccountStmt]);

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % parseAccountStmt.length;
    setItemOffset(newOffset);
    setPage(event.selected);
  };
  const getAccountStmt = (page: number) => {
    accountService
      .getAccountList(page, filterdata)
      .then((res) => {
        if (res?.data?.data) setAccountStmt(res?.data?.data?.items || []);
        if (res?.data?.data?.items && page == 0)
          setOpenBalance(res?.data?.data?.openingBalance || 0);
        setparseAccountStmt(
          dataformat(
            res?.data?.data?.items || [],
            res?.data?.data?.openingBalance || 0
          )
        );
        setPage(page);
      })
      .catch((e) => {
        console.log(e);
        // const error = e.response.data.message
        toast.error("error");
      });
  };
  const handleformchange = (event: any) => {
    const filterObj = filterdata;
    filterObj[event.target.name] = event.target.value;
    setfilterdata(filterObj);
  };
  const handleSubmitform = (event: any) => {
    event.preventDefault();
    getAccountStmt(0);
  };

  const createSrNo = (index: number) => {
    return (page - 1) * itemsPerPage || 0 + index + 1;
  };

  const handlePageClickBets = (event: any) => {
    getBetsData(selectedStmt, event.selected + 1);
  };

  React.useEffect(() => {
    if (isOpen) getBetsData(selectedStmt, pageBet);
  }, [selectedStmt, pageBet, isOpen]);

  const getBetsData = (stmt: any, pageNumber: number) => {
    const allBetsid: any = [];
    const allbets = stmt?.allBets || [];
    if (allbets.length > 0) {
      allbets.map((Item: any) => {
        allBetsid.push(Item.betId);
      });
      const betIds = allBetsid;
      betService
        .getBetListByIds(betIds, pageNumber)
        .then((res: AxiosResponse) => {
          setBetHistory(res.data.data);
          setPageBet(pageNumber);
        });
    }
  };
  const getBets = (
    e: MouseEvent<HTMLTableCellElement>,
    stmt: AccoutStatement
  ) => {
    e.preventDefault();
    setSelectedStmt(stmt);
    setPageBet(1);
    setIsOpen(true);
  };
  // const getAcHtml = () => {
  //   let closingbalance: number = page == 1 ? openBalance : closeBalance;
  //   const achtml =
  //     currentItems &&
  //     currentItems.map((stmt: any, index: number) => {
  //       closingbalance = closingbalance + stmt.amount;
  //       return (
  //         {stmt.narration.length>0 && (

  //           <tr key={`${stmt._id}${index}`}>
  //           {/* <td>{stmt.sr_no}</td> */}
  //           {/* <td className='wnwrap'>{stmt.date}</td> */}

  //           <td
  //             className=""
  //             style={{ fontWeight: "bold", color: "#007bff" }}
  //             onClick={(e: MouseEvent<HTMLTableCellElement>) =>
  //               getBets(e, stmt.stmt)
  //             }
  //           >
  //             {stmt.narration}
  //           </td>
  //           <td>
  //             <span
  //               className="badge badge-primary p-1 ng-binding"
  //               style={{ fontSize: "xx-small" }}
  //             >

  //               <i style={{fontSize:"10px"}} className="fas fa-trophy "></i> N/A
  //             </span>
  //           </td>
  //           <td className="green wnwrap">
  //             {stmt.credit >= 0 && stmt.credit.toFixed(2)}
  //           </td>
  //           <td className="red wnwrap">
  //             {stmt.credit < 0 && stmt.credit.toFixed(2)}
  //           </td>
  //           <td className="green wnwrap">{stmt.closing}</td>
  //         </tr>

  //         )}

  //       );
  //     });
  //   return achtml;
  // };

  // const [openn, setOpenn] = React.useState<any>("");

  // const getAcHtml = () => {
  //   let closingbalance: number = page === 1 ? openBalance : closeBalance;

  //   return currentItems?.map((stmt: any, index: number) => {
  //     closingbalance = closingbalance + stmt.amount;
  //     console.log(currentItems,"first")

  //     if (stmt.narration.length === 0) return null; // skip if no narration
  //     if (!stmt?.stmt?.allBets) return null;
  //     return (

  //       <tr key={`${stmt._id}${index}`}>
  //         <td
  //           className="d-non"
  //           style={{ fontWeight: "bold", color: "#007bff" }}
  //           onClick={(e: React.MouseEvent<HTMLTableCellElement>) =>
  //             getBets(e, stmt.stmt)
  //           }
  //         >
  //           {stmt.narration === "Initial deposit on signup" ? "" : stmt.narration}jjh

  //         </td>

  //         <td onClick={() => setOpenn(stmt.narration)} >
  //          <p className="custom-link">{stmt.narration}</p>
  //         </td>
  //         <td>
  //           <span
  //             className="badge badge-primary p-1 ng-binding"
  //             style={{ fontSize: "xx-small" }}
  //           >
  //             <i style={{ fontSize: "10px" }} className="fas fa-trophy"></i> N/A
  //           </span>
  //         </td>
  //         <td className="green wnwrap">
  //           {stmt.credit >= 0 ? stmt.credit.toFixed(2) : ""}
  //         </td>
  //         <td className="red wnwrap">
  //           {stmt.credit < 0 ? stmt.credit.toFixed(2) : ""}
  //         </td>
  //         <td className="green wnwrap">{stmt.closing}</td>
  //       </tr>
  //     );
  //   });
  // };

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // const getAcHtml = () => {
  //   let grouped: any = {};

  //   currentItems?.forEach((stmt: any) => {
  //     if (!stmt?.narration || !stmt?.stmt?.allBets) return;
  //     console.log(currentItems,"firstt")

  //     const gameName = stmt.narration.split(" /")[0]?.trim();
  //     const rawDate = moment(stmt.date, "MMM DD, YYYY hh:mm A").format("YYYY-MM-DD");

  //     if (!grouped[gameName]) grouped[gameName] = {};
  //     if (!grouped[gameName][rawDate]) grouped[gameName][rawDate] = [];

  //     grouped[gameName][rawDate].push(stmt);
  //   });

  //   // Render grouped table
  //   const tableRows: any[] = [];
  //   let balance = 0;

  //   Object.entries(grouped).forEach(([gameName, dates]: any) => {
  //     Object.entries(dates).forEach(([date, stmts]: any) => {

  //       let totalCredit = 0;
  //       let totalDebit = 0;
  //       let closing = "";
  //       let credit = 0
  //       const betCount = stmts.length;

  //       stmts.forEach((stmt: any ,  index: number) => {
  //         console.log(stmts,"ddd")
  //         totalCredit += stmt.credit;
  //         totalDebit += stmt.credit;
  //         closing = stmt.closing; // take latest one (you can sort if needed)
  //         credit += stmt.credit
  //         // const credit = totalCredit;

  //         if (index === 0) {
  //           // First row sets initial balance using credit
  //           balance = credit;
  //         } else {
  //           balance += credit;
  //           console.log(balance)
  //         }

  //       });

  //       tableRows.push(
  //         <tr key={`${gameName}-${date}`}>
  //           {/* <td className="custom-link"
  //            onClick={() => setOpenn(gameName+(date))}> {gameName}({date})</td> */}

  // <td className="custom-link"
  //     onClick={() => setSelectedGroup(gameName + date)}>
  //   {gameName}({date})
  // </td>

  //           <td><span
  //               className="badge badge-primary p-1 ng-binding"
  //               style={{ fontSize: "xx-small" }}
  //             >
  //               <i style={{ fontSize: "10px" }} className="fas fa-trophy"></i> N/A
  //             </span></td>
  //           <td className="green">{totalCredit >= 0 ? totalCredit.toFixed(2) : 0}</td>
  //           <td className="red"> {totalDebit < 0 ? totalDebit.toFixed(2) : 0}</td>
  //           {/* <td className="green">{closing}</td> */}
  //           <td className={balance >= 0 ? "green" : "red"}>{balance.toFixed(2)}</td>

  //         </tr>
  //       );
  //     });
  //   });

  //   return tableRows;
  // };

  // const getAcHtml22 = () => {
  //   // const [showc, setShowc] = useState<any>()
  //   let closingbalance: number = page === 1 ? openBalance : closeBalance;

  //   console.log(currentItems, "current items lisst ");

  //   let totalPnl = 0;

  //   const rows = currentItems?.map((stmt: any, index: number) => {
  //     closingbalance = closingbalance + stmt.amount;

  //     // const pnlString = stmt?.stmt?.allBets ?  stmt?.stmt?.allBets?.[0]?.result?.[0]?.pnl?.$numberDecimal  : 0;
  //     const pnlString = stmt?.stmt?.allBets?.[0]?.result?.[0]?.pnl?.$numberDecimal;

  //     const pnl = parseFloat(pnlString) || 0;
  //     totalPnl += pnl
  //     // setShowc(totalPnl)

  //     console.log(currentItems,"current itmesss")

  //     if (stmt.narration.length === 0) return null; // skip if no narration

  //     return (
  //       <><tr key={`${stmt._id}${index}`}>
  //         <td className="">{stmt?.stmt?.allBets ? stmt?.stmt?.selectionId : ""}</td>

  //         <td className="">{stmt?.stmt?.allBets ? stmt?.stmt?.allBets[0]?.result[0]?.marketName : ''}</td>

  //         <td className="">{stmt?.stmt.allBets ? stmt?.stmt.allBets[0].result[0].odds : ''}</td>

  //         <td className="">{stmt?.stmt.allBets ? stmt?.stmt.allBets[0].result[0].stack : ''}</td>

  //         <td className="">
  //           {stmt?.stmt.allBets ? stmt?.narration?.match(/,([^[]+)\[/)?.[1]?.trim() : ''}
  //         </td>

  //         <td className="">
  //           {stmt?.stmt.allBets ? stmt?.narration?.match(/winner:\s*([^,\[\]]+)?/)?.[1]?.trim() :
  //             ""}
  //         </td>

  //         <td>{stmt?.stmt?.allBets ? stmt?.stmt?.allBets[0]?.result[0]?.pnl?.$numberDecimal : ''}</td>
  //         <td className="green wnwrap d-none">{stmt?.stmt?.allBets ? stmt.closing : ''}</td>

  //       </tr> </>
  //     );

  //   });

  //   // Return rows and totalPnl in one fragment
  // return (
  //   <>
  //     {rows}
  //     <tr>
  //       <td colSpan={8}><strong className={`${totalPnl < 0 ? "total2" : "total"}`}> You {totalPnl < 0 ? "lost" : "won"} {(totalPnl)} coins</strong></td>
  //     </tr>
  //   </>
  // );
  // };

  const getAcHtml = () => {
    let grouped: any = {};
    console.log(currentItems, "drrerer");

    currentItems?.forEach((stmt: any) => {
      if (!stmt?.narration || !stmt?.stmt?.allBets) return;

      const gameName = stmt.narration.split(" /")[0]?.trim();
      const rawDate = moment(stmt.date, "MMM DD, YYYY hh:mm A").format(
        "YYYY-MM-DD"
      );

      if (!grouped[gameName]) grouped[gameName] = {};
      if (!grouped[gameName][rawDate]) grouped[gameName][rawDate] = [];

      grouped[gameName][rawDate].push(stmt);
    });

    // Render grouped table
    const tableRows: any[] = [];
    let runningBalance = 0;

    // Sort the groups for chronological balance tracking
    const sortedEntries = Object.entries(grouped)
      .flatMap(([gameName, dates]: any) => {
        return Object.entries(dates).map(([date, stmts]: any) => ({
          gameName,
          date,
          stmts,
          sortDate: moment(date).format("YYYY-MM-DD"), // for sorting
        }));
      })
      .sort((a, b) => moment(a.sortDate).diff(moment(b.sortDate)));

    sortedEntries.forEach(({ gameName, date, stmts }) => {
      let totalCredit = 0;
      let totalDebit = 0;

      stmts.forEach((stmt: any) => {
        totalCredit += stmt.credit;
        totalDebit += stmt.credit;
      });

      runningBalance += totalCredit;

      tableRows.unshift(
        <tr key={`${gameName}-${date}`}>
          <td
            className="custom-link"
            onClick={() => setSelectedGroup(gameName + date)}
            style={{
              cursor: "pointer",
              color: "#007bff",
              textDecoration: "underline",
            }}
          >
            {gameName}({date})
          </td>
          <td>
            <span
              className="badge badge-primary p-1 ng-binding"
              style={{ fontSize: "xx-small" }}
            >
              <i style={{ fontSize: "10px" }} className="fas fa-trophy"></i> N/A
            </span>
          </td>
          <td className="green">
            {totalCredit >= 0 ? totalCredit.toFixed(2) : "0.00"}
          </td>
          <td className="red">
            {totalDebit < 0 ? totalDebit.toFixed(2) : "0.00"}
          </td>
          <td className={runningBalance >= 0 ? "green" : "green"}>
            {runningBalance.toFixed(2)}
          </td>
        </tr>
      );
    });

    return tableRows;
  };

  const getAcHtml22 = () => {
    let closingbalance: number = page === 1 ? openBalance : closeBalance;

    let totalPnl = 0;

    // Extract gameName and date from narration and filter
    const filteredItems = currentItems?.filter((stmt: any) => {
      if (!stmt?.narration) return false;
      const gameName = stmt.narration.split(" /")[0]?.trim();
      const rawDate = moment(stmt.date, "MMM DD, YYYY hh:mm A").format(
        "YYYY-MM-DD"
      );
      return selectedGroup === gameName + rawDate;
    });

    const rows = filteredItems?.map((stmt: any, index: number) => {
      closingbalance = closingbalance + stmt.amount;

      const pnlString = stmt?.credit;
      const pnl = parseFloat(pnlString) || 0;
      totalPnl += pnl;

      if (stmt.narration.length === 0) return null;

      return (
        <tr key={`${stmt._id}${index}`}>
          <td>{stmt?.stmt?.allBets ? stmt?.stmt?.selectionId : ""}</td>
          <td>
            {stmt?.stmt?.allBets
              ? stmt?.stmt?.allBets[0]?.result[0]?.marketName
              : ""}
          </td>
          <td>
            {stmt?.stmt?.allBets ? stmt?.stmt?.allBets[0]?.result[0]?.odds : ""}
          </td>
          <td>
            {stmt?.stmt?.allBets
              ? stmt.stmt.allBets.reduce((sum: number, bet: any) => {
                  const stack = parseFloat(bet?.result?.[0]?.stack) || 0;
                  return sum + stack;
                }, 0)
              : ""}
          </td>

          <td>
            {stmt?.stmt?.allBets
              ? stmt?.narration?.match(/,([^[]+)\[/)?.[1]?.trim()
              : ""}
          </td>
          <td>
            {stmt?.stmt?.allBets
              ? stmt?.narration?.match(/winner:\s*([^,\[\]]+)?/)?.[1]?.trim()
              : ""}
          </td>
          <td>{stmt?.stmt?.allBets ? stmt?.credit : ""}</td>
          <td className="green wnwrap d-none">
            {stmt?.stmt?.allBets ? stmt.closing : ""}
          </td>
        </tr>
      );
    });

    return (
      <>
        {rows}
        <tr>
          <td colSpan={8}>
            <strong className={`${totalPnl < 0 ? "total2" : "total"}`}>
              You {totalPnl < 0 ? "lost" : "won"} {totalPnl.toFixed(2)} coins
            </strong>
          </td>
        </tr>
      </>
    );
  };

  const dataformat = (response: any, closingbalance: any) => {
    const aryNewFormat: any = [];

    response &&
      response.map((stmt: any, index: number) => {
        closingbalance = closingbalance + stmt.amount;
        aryNewFormat.push({
          _id: stmt._id,
          // eslint-disable-next-line camelcase
          sr_no: index + 1,
          date: moment(stmt.createdAt).format("lll"),
          credit: stmt.amount,
          debit: stmt.amount,
          closing: closingbalance.toFixed(2),
          narration: stmt.narration,
          stmt: stmt,
        });
      });
    return aryNewFormat;
  };

  return (
    <>
      {mobileSubheader.subheader("MY LEDGER ")}
      <div className={!isMobile ? " mt-1" : "padding-custom"}>
        <div className="body-wrap">
          <div className="back-main-menu my-3">
            <a href="/">BACK TO MAIN MENU</a>
          </div>

          <div className="">
            {mobileSubheader.subheaderdesktop("MY LEDGER")}
            <div className="card-body p0">
              {/* <form
                className="ng-pristine ng-valid ng-touched mb-0"
                method="post"
                onSubmit={handleSubmitform}
              >
                <div className="row row5">
                  <div className="col-6 col-lg-2 mbc-5">
                    <div className="form-group mb-0">
                      <div className="mx-datepicker">
                        <div className="mx-input-wrapper">
                          <input
                            name="startDate"
                            type="date"
                            autoComplete="off"
                            onChange={handleformchange}
                            defaultValue={filterdata.startDate}
                            placeholder="Select Date"
                            className="mx-input ng-pristine ng-valid ng-touched"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-lg-2 mbc-5">
                    <div className="form-group mb-0">
                      <div className="mx-datepicker">
                        <div className="mx-input-wrapper">
                          <input
                            name="endDate"
                            type="date"
                            autoComplete="off"
                            defaultValue={filterdata.endDate}
                            onChange={handleformchange}
                            placeholder="Select Date"
                            className="mx-input ng-untouched ng-pristine ng-valid"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-2 mbc-5">
                    <div className="form-group mb-0">
                      <select
                        name="reportType"
                        onChange={handleformchange}
                        className="custom-select ng-untouched ng-pristine ng-valid"
                      >
                        <option value="ALL">All </option>
                        <option value="chip">Deposit/Withdraw </option>
                        <option value="game">Game Report </option>
                      </select>
                    </div>
                  </div>
                  <div className="col-12 col-lg-1 mbc-5">
                    <button type="submit" className="btn btn-primary btn-block">
                      Submit
                    </button>
                  </div>
                </div>
              </form> */}

              {selectedGroup ? (
                <div>
                  <div className="match-name text-center ng-binding">
                    {/* {openn?.match(/^(\w+)\s*\/\s*Rno-/)?.[1] || ""}{" "}
                    {(() => {
                      const rno = openn?.match(/Rno-(\d+)/)?.[1] || "";
                      const datePart = rno.slice(3, 9); // Get digits 4 to 9
                      if (datePart.length === 6) {
                        const dd = datePart.slice(0, 2);
                        const mm = datePart.slice(2, 4);
                        const yy = datePart.slice(4, 6);
                        return `${yy}-${mm}-${dd}`;
                      }
                      return "";
                    })()} */}
                    {selectedGroup}
                  </div>

                  <div className="table-responsive">
                    <table className="text-center" id="customers1">
                      <thead>
                        <tr>
                          <th style={{ width: "45%", textAlign: "center" }}>
                            Event ID
                          </th>

                          <th style={{ width: "45%", textAlign: "center" }}>
                            Number
                          </th>

                          <th style={{ width: "45%", textAlign: "center" }}>
                            Rate
                          </th>

                          <th style={{ width: "45%", textAlign: "center" }}>
                            Amount
                          </th>

                          <th style={{ width: "45%", textAlign: "center" }}>
                            Status
                          </th>

                          <th style={{ width: "45%", textAlign: "center" }}>
                            Result
                          </th>

                          <th style={{ width: "10%", textAlign: "center" }}>
                            PL{" "}
                          </th>

                          <th
                            className="d-none"
                            style={{ width: "10%", textAlign: "center" }}
                          >
                            BALANCE
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseAccountStmt.length <= 0 ||
                          (parseAccountStmt.length > 0 &&
                            parseAccountStmt.length <= 0 && (
                              <tr>
                                <td colSpan={8} className="text-center">
                                  No Result Found
                                </td>
                              </tr>
                            ))}
                        {parseAccountStmt.length > 0 &&
                          parseAccountStmt.length > 0 &&
                          page == 0 && (
                            <tr key={parseAccountStmt[0]._id}>
                              {/* <td>-</td> */}
                              {/* <td className='wnwrap'>
                        {moment(parseAccountStmt[0].createdAt).format(dateFormat)}
                      </td> */}
                              {/* <td>-</td>
                      <td>-</td>
                      <td className='wnwrap'>{openBalance?.toFixed(2)}</td>
                      <td className='wnwrap'>Opening Balance</td> */}
                            </tr>
                          )}

                        {getAcHtml22()}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="text-center" id="customers1">
                    <thead>
                      <tr>
                        {/* <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      Sr No.
                    </th> */}
                        {/* <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      Date{' '}
                    </th> */}
                        <th
                          className="d-none"
                          style={{ width: "45%", textAlign: "center" }}
                        >
                          MATCH NAME
                        </th>

                        <th style={{ width: "45%", textAlign: "center" }}>
                          MATCH NAME
                        </th>

                        <th style={{ width: "45%", textAlign: "center" }}>
                          WON BY
                        </th>

                        <th style={{ width: "10%", textAlign: "center" }}>
                          WON{" "}
                        </th>
                        <th style={{ width: "10%", textAlign: "center" }}>
                          LOST
                        </th>
                        <th style={{ width: "10%", textAlign: "center" }}>
                          BALANCE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseAccountStmt.length <= 0 ||
                        (parseAccountStmt.length > 0 &&
                          parseAccountStmt.length <= 0 && (
                            <tr>
                              <td colSpan={8} className="text-center">
                                No Result Found
                              </td>
                            </tr>
                          ))}
                      {parseAccountStmt.length > 0 &&
                        parseAccountStmt.length > 0 &&
                        page == 0 && (
                          <tr key={parseAccountStmt[0]._id}>
                            {/* <td>-</td> */}
                            {/* <td className='wnwrap'>
                        {moment(parseAccountStmt[0].createdAt).format(dateFormat)}
                      </td> */}
                            {/* <td>-</td>
                      <td>-</td>
                      <td className='wnwrap'>{openBalance?.toFixed(2)}</td>
                      <td className='wnwrap'>Opening Balance</td> */}
                          </tr>
                        )}

                      {getAcHtml()}
                    </tbody>
                  </table>
                </div>
              )}
              <ReactPaginate
                breakLabel="..."
                nextLabel=">>"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={pageCount}
                containerClassName={"pagination"}
                activeClassName={"active"}
                previousLabel={"<<"}
                breakClassName={"break-me"}
              />
            </div>
          </div>

          <div className="back-main-menu my-2">
            <a href="/">BACK TO MAIN MENU</a>
          </div>
        </div>
      </div>
      <ReactModal
        isOpen={isOpen}
        onAfterClose={() => setIsOpen(false)}
        onRequestClose={(e: any) => {
          setIsOpen(false);
        }}
        contentLabel="Set Max Bet Limit"
        className={"col-md-12"}
        ariaHideApp={false}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5>Bets</h5>
            <button
              onClick={() => setIsOpen(false)}
              className="close float-right"
            >
              <i className="fa fa-times-circle"></i>
            </button>
          </div>
          <div className="modal-body">
            {!loadingState && (
              <BetListComponent
                bethistory={betHistory}
                handlePageClick={handlePageClickBets}
                page={page}
                isTrash={false}
              />
            )}
          </div>
        </div>
      </ReactModal>
    </>
  );
};
export default NewAccountStatement;
