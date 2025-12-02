import React from "react";
import betService from "../../../services/bet.service";
import { AxiosResponse } from "axios";
import IMatch from "../../../models/IMatch";
import accountService from "../../../services/account.service";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { CustomLink } from "../../../pages/_layout/elements/custom-link";
import { useAppSelector } from "../../../redux/hooks";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import {CloseButton, } from "react-bootstrap";
import moment from "moment";
import { dateFormat } from "../../../utils/helper";
import userService from "../../../services/user.service";

interface LedgerItem {
  parentName: string;
  updown?: number;
  profit?: number;
}

interface MatchItem {
  ledgers: LedgerItem[];

}

const SportsDetails = () => {
  const [marketData, setmarketData] = React.useState<MatchItem[]>([]);
  const [close, setClose] = React.useState<string | null>(null);

  const userState = useAppSelector(selectUserData);
  console.log(userState, "dffdfdfdf");

  const [shared, setShared] = React.useState<any>();
  
  React.useEffect(() => {
    // const userState = useAppSelector<{ user: User }>(selectUserData);
    const username: any = userState?.user?.username;

    console.log(username, "testagentmaster");
    userService.getParentUserDetail(username).then(
      (res: AxiosResponse<any>) => {
        console.log(res, "check balance for parent");
        const thatb = res.data?.data[0];
        // setDetail(thatb)
        // setNewbalance(thatb.balance.balance);
        setShared(thatb?.share);
      }
    );
  }, [userState]);

  React.useEffect(() => {
    betService.getMarketAnalysis().then((res: AxiosResponse) => {
      // setmarketData(res.data.data);
      // console.log(res, "market data");
    });
  }, []);

  React.useEffect(() => {
    accountService.matchdetail().then((res: AxiosResponse) => {
      console.log(res, "marketffffff data");
      // setmarketData(res.data.data.matches ? res.data.data.matches.reverse() : []);
      setmarketData(res?.data?.data?.matches ? res?.data?.data?.matches?.filter((match:any) => match?.bets && match?.bets?.length > 0).reverse()
          : []
      );
      
    });

  }, []);


  const grandUpdown = React.useMemo(() => {
    if (!marketData || !Array.isArray(marketData)) return 0;
  
    return marketData.reduce((total, match,) => {
      const matchTotal = match.ledgers
        ?.filter((l) => l?.parentName === userState.user.username && l?.updown !== undefined)
        ?.reduce((sum:any, l:any) => sum + l.updown, 0) || 0;
  
      return total + matchTotal;
    }, 0);
  }, [marketData, userState.user.username]);

  const grandpl = React.useMemo(() => {
    if (!marketData || !Array.isArray(marketData)) return 0;
  
    return marketData.reduce((total, match,) => {
      const matchTotal = match.ledgers
        ?.filter((l) => l?.parentName === userState.user.username && l?.profit !== undefined)
        ?.reduce((sum:any, l:any) => sum + l?.fammount, 0) || 0;
       
      return total + matchTotal;
    }, 0);
    
  }, [marketData, userState.user.username]);

  console.log(grandpl,"hello world pl")


 

  // const dropdownRef = React.useRef<HTMLDivElement>(null);
  const tdRef = React.useRef<HTMLTableDataCellElement | null>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tdRef.current && !tdRef.current.contains(event.target as Node)) {
        setClose(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (itemId: string) => {
    setClose((prev) => (prev === itemId ? null : itemId));
  };

  const listItem = () => {
    const htmlRender: any = [];
    marketData.map((Item: any, index: number) => {
      const htmlOutput = (
        <tr key={index} className="row container-fluid ">
          {/* <td>
                <div>
                  <a href={`/admin/odds/${Item.matchId}`}>
                    {Item.matchName} ({Item.betCount})
                    <div className="">
                      <a href={`/admin/odds/${Item.matchId}`}>
                        <h5 className="">{Item.matchName}</h5>
                        <p style={{ color: "green" }}>
                          <svg
                            className="text-success Blink"
                            style={{ width: "12px", height: "12px" }}
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                          >
                            <path
                              fill="currentColor"
                              d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"
                            />
                          </svg>
                          INPLAY
                        </p>
    
                        <p className="ng-binding">yy</p>
                        <p>Declared : No</p>
                      </a>
                    </div>
                  </a>
                </div>
              </td> */}

          <div className="col-md-6 event-row mb-3 float-left p-1">
            {/* <a href={`/admin/odds/${Item.matchId}`}>
                    {Item.matchName} ({Item.betCount})
                  </a> */}

            <a
              href="/live-report/34164556"
              title="Thailand Women v Bangladesh Women"
              style={{ color: "#000", textDecoration: "none" }}
            >
              <div className="card w-100" style={{ cursor: "pointer" }}>
                <div
                  className="card-header font-weight-bolder text-center bg-warning p-1 h6 small"
                  style={{ color: "#fff" }}
                >
                  {Item.matchName}
                </div>
                <div className="card-body pt-1 pb-0">
                  <div className="row p-0">
                    <div style={{ marginLeft: "20px" }} className="col-9 p-0 ">
                      <div className="h6 small pl-1 mb-1 pt-1 d-flex align-items-center">
                        {/* <FaCircle className="text-success Blink" /> */}o
                        <span className="ml-1">IN PLAY</span>
                      </div>
                      <div className="badge badger-light">
                        04/10/2025 10:00:00 AM
                      </div>
                    </div>
                    <div className="col-3 text-right"></div>
                  </div>
                </div>
              </div>
            </a>
          </div>
          <td>
            <div className="table-borderedless table-responsive">
              <table className="table">
                <tbody>
                  {marketlist(
                    Item.filterMarketByMatch,
                    Item.matchWiseMarket,
                    Item.completemarket_list
                  )}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      );

      htmlRender.push(htmlOutput);
    });
    return htmlRender;
  };
  const marketlist = (market: any, userbook: any, marketallow: any) => {
    return market.map((ItemMarket: any, index: number) => {
      return (
        marketallow.indexOf(ItemMarket.marketId) > -1 && (
          <tr className="" key={index}>
            <td colSpan={4} style={{ whiteSpace: "nowrap" }}>
              {ItemMarket.marketName}
            </td>
            {ItemMarket.runners.map((ItemRunners: any, indexn: number) => {
              return (
                <td key={indexn}>
                  {ItemRunners.runnerName} :{" "}
                  <span
                    className={
                      -userbook[
                        `${ItemMarket.marketId}_${ItemRunners.selectionId}`
                      ] > 0
                        ? "green"
                        : "red"
                    }
                  >
                    {userbook[
                      `${ItemMarket.marketId}_${ItemRunners.selectionId}`
                    ] != null
                      ? -userbook[
                          `${ItemMarket.marketId}_${ItemRunners.selectionId}`
                        ].toFixed(2)
                      : ""}
                  </span>
                </td>
              );
            })}
          </tr>
        )
      );
    });
  };


 

  return (
    <div className="container-fluid">
      <h2 className="ledger-title">Sports Details</h2>

      <div style={{ overflowX: "auto", width: "100%" }} className="">
        <table className="table table">
          <thead>
            <tr>
              <th className="" style={{ padding: "10px" }}></th>
              <th className="" style={{ padding: "10px" }}></th>
            </tr>
          </thead>
          {/* <tbody>{listItem()}</tbody> */}
        </table>
      </div>

      <table
        className="table  table-striped bg-white table-bordered account-list dataTable no-footer"
        style={{ width: "100%" }}
        id="DataTables_Table_0"
        role="grid"
      >
        <thead style={{ width: "100%", overflowX: "auto" }} className="small">
          <tr role="row">
            <th
              className="sorting_disabled"
              rowSpan={1}
              colSpan={1}
              style={{ width: "8px" }}
            >
              -
            </th>
            <th
              className="sorting_disabled"
              rowSpan={1}
              colSpan={1}
              style={{ width: "63px" }}
            >
              Date
            </th>
            <th
              className="sorting_disabled"
              rowSpan={1}
              colSpan={1}
              style={{ width: "205px" }}
            >
              Name
            </th>
            <th
              className="sorting_disabled"
              rowSpan={1}
              colSpan={1}
              style={{ width: "174px" }}
            >
              Winner
            </th>
            <th
              className="sorting_disabled"
              rowSpan={1}
              colSpan={1}
              style={{ width: "60px" }}
            >
              My Share P/L
            </th>
            <th
              className="sorting_disabled"
              rowSpan={1}
              colSpan={1}
              style={{ width: "53px" }}
            >
              Total P/L
            </th>
          </tr>
        </thead>
        <tbody className="small">
          {/* <tr role="row" className="odd">
            <td className="ng-scope">
              <ul
                className="nav nav-pills w-100"
                style={{ fontSize: "xx-large" }}
              >
                <li className="nav-item dropdown">
                  <a
                    className="nav-link hidden dropdown-toggle p-0"
                    style={{ height: "20px" }}
                    data-toggle="dropdown"
                    // href="javascript:void(0);"
                    // role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  ></a>
                  <div className="dropdown-menu">
                    <a
                      className="dropdown-item small text-white call-event navbar-bet99"
                    //   href="/plus-minus-report/34160852"
                    >
                      <svg
                        className="svg-inline--fa fa-futbol fa-w-16"
                        aria-hidden="true"
                        data-prefix="fa"
                        data-icon="futbol"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        data-fa-i2svg=""
                      >
                        <path
                          fill="currentColor"
                          d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zm-48 0l-.003-.282-26.064 22.741-62.679-58.5 16.454-84.355 34.303 3.072c-24.889-34.216-60.004-60.089-100.709-73.141l13.651 31.939L256 139l-74.953-41.525 13.651-31.939c-40.631 13.028-75.78 38.87-100.709 73.141l34.565-3.073 16.192 84.355-62.678 58.5-26.064-22.741-.003.282c0 43.015 13.497 83.952 38.472 117.991l7.704-33.897 85.138 10.447 36.301 77.826-29.902 17.786c40.202 13.122 84.29 13.148 124.572 0l-29.902-17.786 36.301-77.826 85.138-10.447 7.704 33.897C442.503 339.952 456 299.015 456 256zm-248.102 69.571l-29.894-91.312L256 177.732l77.996 56.527-29.622 91.312h-96.476z"
                        ></path>
                      </svg>
                      <i className="fa fa-futbol"></i> Match &amp; Session Plus
                      Minus
                    </a>
                    <div className="dropdown-divider"></div>
                    <a
                      className="dropdown-item small text-white call-event navbar-bet99"
                      href="/session-bets/34160852"
                    >
                      <svg
                        className="svg-inline--fa fa-eye fa-w-18"
                        aria-hidden="true"
                        data-prefix="fa"
                        data-icon="eye"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        data-fa-i2svg=""
                      >
                        <path
                          fill="currentColor"
                          d="M569.354 231.631C512.969 135.949 407.81 72 288 72 168.14 72 63.004 135.994 6.646 231.631a47.999 47.999 0 0 0 0 48.739C63.031 376.051 168.19 440 288 440c119.86 0 224.996-63.994 281.354-159.631a47.997 47.997 0 0 0 0-48.738zM288 392c-75.162 0-136-60.827-136-136 0-75.162 60.826-136 136-136 75.162 0 136 60.826 136 136 0 75.162-60.826 136-136 136zm104-136c0 57.438-46.562 104-104 104s-104-46.562-104-104c0-17.708 4.431-34.379 12.236-48.973l-.001.032c0 23.651 19.173 42.823 42.824 42.823s42.824-19.173 42.824-42.823c0-23.651-19.173-42.824-42.824-42.824l-.032.001C253.621 156.431 270.292 152 288 152c57.438 0 104 46.562 104 104z"
                        ></path>
                      </svg>
                      <i className="fa fa-eye"></i> completed Bet
                    </a>
                    <div className="dropdown-divider"></div>
                    <a
                      className="dropdown-item small text-white call-event navbar-bet99"
                      href="/rejected-bets/34160852"
                    >
                      <svg
                        className="svg-inline--fa fa-eye fa-w-18"
                        aria-hidden="true"
                        data-prefix="fa"
                        data-icon="eye"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        data-fa-i2svg=""
                      >
                        <path
                          fill="currentColor"
                          d="M569.354 231.631C512.969 135.949 407.81 72 288 72 168.14 72 63.004 135.994 6.646 231.631a47.999 47.999 0 0 0 0 48.739C63.031 376.051 168.19 440 288 440c119.86 0 224.996-63.994 281.354-159.631a47.997 47.997 0 0 0 0-48.738zM288 392c-75.162 0-136-60.827-136-136 0-75.162 60.826-136 136-136 75.162 0 136 60.826 136 136 0 75.162-60.826 136-136 136zm104-136c0 57.438-46.562 104-104 104s-104-46.562-104-104c0-17.708 4.431-34.379 12.236-48.973l-.001.032c0 23.651 19.173 42.823 42.824 42.823s42.824-19.173 42.824-42.823c0-23.651-19.173-42.824-42.824-42.824l-.032.001C253.621 156.431 270.292 152 288 152c57.438 0 104 46.562 104 104z"
                        ></path>
                      </svg>
                      <i className="fa fa-eye"></i> Display Rejected Bet
                    </a>
                  </div>
                </li>
              </ul>
            </td>
            <td className="ng-scope">Apr 11, 9:0 PM</td>
            <td className="ng-scope">
              <a href="/live-report/34160852">
                <img
                  style={{ maxWidth: "100%", height: "20px" }}
                  src="assets/images/default-4.png"
                />
                Islamabad United v Lahore Qalandars
              </a>
            </td>
            <td className="ng-scope"></td>
            <td className="ng-scope">
              <span className="pt-2 pb-1 text-warning">0</span>
            </td>
            <td className="ng-scope">
              <span className="pt-2 pb-1 text-warning">0</span>
            </td>
          </tr> */}

          {marketData?.map((item: any, index: number) => (
            <tr key={index}>
              <td
                // ref={tdRef}
                className="ng-scope position-relative"
              >
                <button onClick={() => handleToggle(item._id)}>
                  <ArrowDropDownIcon />
                </button>

                {close === item._id && (
                  <div
                    className="dropdown-menu position-relative show rounded-md border position-absolute top-0 start-0 translate-custom"
                    x-placement="bottom-start"
                    style={{
                      transform: "translate3d(0px, 20px, 0px)",
                      willChange: "transform",
                    }}
                  >

<button onClick={() => handleToggle(item._id)} className="-right-2.5 -top-2.5 position-absolute bg-gray-800 p-0 rounded-full "><CloseButton className="text-white " />
</button>

                   
                    <CustomLink
                      className="dropdown-item  text-lg  text-white call-event navbar-bet99"
                      to={`/report-bets/${item.matchId}`}
                    >
                      <i className="fa fa-futbol"></i> Match &amp; Session Plus
                      Minus
                    </CustomLink>
                    <div className="dropdown-divider"></div>
                    <CustomLink
                      className="dropdown-item  text-lg  text-white call-event navbar-bet99"
                      to={`/session-bets/${item.matchId}`}
                    >
                      <i className="fa fa-eye"></i> Display Match Bet
                    </CustomLink>
                    <div className="dropdown-divider"></div>
                    <CustomLink
                      className="dropdown-item text-lg text-white call-event navbar-bet99"
                      to={`/match-bets/${item.matchId}`}
                    >
                      <i className="fa fa-eye"></i> Display Session Bet
                    </CustomLink>

                  </div>
                )}
              </td>
              <td className="ng-scope">
                {/* {new Date(item.matchDateTime).toLocaleString()} */}
                        {moment(item.matchDateTime).format(dateFormat)}
                
              </td>
              <td className="ng-scope">
                <CustomLink className="flex align-items-center gap-2 text-blue-500" to={`${item?.active ? `/odds/${item?.matchId}/${shared}` : `/client-bets/${item.matchId}` }`}>
                  <img
                    style={{ maxWidth: "100%", height: "20px" }}
                    src="/imgs/default-4.png"
                  />
                  {item.name}
                </CustomLink>
              </td>
              <td className="ng-scope "><span className="badge p-2 badge-primary" style={{fontSize:"xx-small"}}>  <i className="fas fa-trophy"></i>  </span> {item?.resultstring ? item?.resultstring : ""}</td>
              <td className="ng-scope">
                <span className="pt-2 pb-1 text-warning">
                  {(() => {
                    const total =
                      item.ledgers
                        ?.filter(
                          (l:any) =>
                            l?.parentName === userState.user.username &&
                            l?.updown !== undefined
                        )
                        ?.reduce((sum: any, l:any) => sum + l.updown, 0) || 0;
                    return (
                      <span
                        className={`pt-2 pb-1 ${
                          total >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {total.toFixed(2)}
                      </span>
                    );
                  })()}
                </span>
              </td>
              <td className="ng-scope">
                <span className="pt-2 pb-1 text-warning">
                  {(() => {
                    const total =
                      item.ledgers
                        ?.filter(
                          (l:any) =>
                            l?.parentName === userState.user.username &&
                            l?.profit !== undefined
                        )
                        ?.reduce((sum: any, l:any) => sum + l.fammount, 0) || 0;
                        console.log(total,"total pl here")
                    return (
                      <span
                        className={`pt-2 pb-1 ${
                          total >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {total.toFixed(2)} 
                   
                      </span>
                    );
                  })()}
                </span>
              </td>
            </tr>
          ))}

          {/* Total Row */}
          <tr>
            <td colSpan={4} className="text-right font-weight-bold">
              Total
            </td>
            <td className=" font-weight-bold"><span className={grandUpdown >= 0 ? "text-success" : "text-danger"}>
    {grandUpdown.toFixed(2)}
  </span></td>
  <td className=" font-weight-bold"><span className={grandpl >= 0 ? "text-success" : "text-danger"}>
    {grandpl.toFixed(2)}
  </span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SportsDetails;
