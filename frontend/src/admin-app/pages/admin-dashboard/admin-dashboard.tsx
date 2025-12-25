import React from "react";
import betService from "../../../services/bet.service";
import { AxiosResponse } from "axios";
import mobileSubheader from "../_layout/elements/mobile-subheader";
import casinoService from "../../../services/casino.service";
import {
  CustomLink,
  useNavigateCustom,
} from "../../../pages/_layout/elements/custom-link";
// import betService from '../../../services/bet.service'
//  import { FaUser } from "react-icons/fa6";
import sportsServices from "../../../services/sports.service";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useAppSelector } from "../../../redux/hooks";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import User from "../../../models/User";

import UserService from "../../../services/user.service";
import userService from "../../../services/user.service";
import MatchList from "../../../pages/dashboard/elements/match-list";
import LMatch from "../../../models/LMatch";
import { useDispatch } from "react-redux";
import IMatch from "../../../models/IMatch";
import { useWebsocket } from "../../../context/webSocket";
import { setCurrentMatch } from "../../../redux/actions/sports/sportSlice";
import MatchList2 from "../../../pages/dashboard/elements/adminmatch-list";
// import memoOdds from "../../../pages/dashboard/elements/memoOdds";

const AdminDashboard = () => {
  const [marketdata, setmarketData] = React.useState([]);
  const [matchList, setMatchList] = React.useState<LMatch[]>([]);
  const { socket } = useWebsocket();

  const dispatch = useDispatch();
  const navigate = useNavigateCustom();

  const [odds, setOdds] = React.useState<Record<string, Array<any>>>({});

  React.useEffect(() => {
    betService.getMarketAnalysis().then((res: AxiosResponse) => {
      setmarketData(res.data.data);
      console.log(res, "market data");
    });
  }, []);
  const [gameList, setGameList] = React.useState([]);

  const [newbalance, setNewbalance] = React.useState();
  const [shared, setShared] = React.useState();
  const [detail, setDetail] = React.useState<any>({});



  const userState = useAppSelector<{ user: User }>(selectUserData);
  console.log(userState, "user admin details");

  React.useEffect(() => {
    if (gameList.length <= 0)
      casinoService.getCasinoList().then((res: AxiosResponse<any>) => {
        setGameList(res.data.data);
      });
  }, []);

  React.useEffect(() => {
    // const userState = useAppSelector<{ user: User }>(selectUserData);
    const username:any = userState?.user?.username;

    console.log(username, "testagentmaster");
    UserService.getParentUserDetail(username).then(
      (res: AxiosResponse<any>) => {
        console.log(res, "check balance for parent");
        const thatb = res.data?.data[0];
        setDetail(thatb)
        setNewbalance(thatb.balance.balance);
        setShared(thatb.share);

      }
    );
  }, [userState]);

  const [searchObj, setSearchObj] = React.useState({
    username: "",
    type: "",
    search: "",
    status: "",
    page: 1,
  });

  // const [userList, setUserList] = React.useState([]);
  const [userList, setUserList] = React.useState<any>({});

  const getList = (obj: {
    username: string;
    type: string;
    search: string;
    status?: string;
    page?: number;
  }) => {
    const fullObj = {
      username: userState?.user?.username,
      type: obj.type,
      search: obj.search,
      status: obj.status ?? "", // fallback to empty string
      page: obj.page ?? 1, // fallback to 1
    };

    userService.getUserList(fullObj).then((res: AxiosResponse<any>) => {
      setSearchObj(fullObj); // ✅ Now matches the expected state shape
      console.log(res.data.data, "lista i want to render");
      setUserList(res.data.data);
    });
  };

  React.useEffect(() => {
    getList(searchObj); // Trigger on mount or when searchObj changes
  }, [userState]);

  console.log(marketdata, "marketdata");
  //  React.useEffect(()=>{
  //     betService.lenadena().then((res:AxiosResponse<any>)  =>{
  //       console.log(res,"res for lena dena jai hind !")
  //     })
  //   },[])
  const listItem = () => {
    const htmlRender: any = [];
    marketdata.map((Item: any, index: number) => {
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
                        04/10/2025 10:00:00
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
          <tr key={index}>
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

  const marketIdsEvent = (data: any, oddsData: any, event: string) => {
    console.log(data, oddsData, event, "market Event Data");
    data.map((match: IMatch) => {
      match.markets?.map((market) => {
        if (market.marketName == "Match Odds" && !odds[market.marketId]) {
          // setOdds((prevOdds) => ({
          //   ...prevOdds,
          //   [market.marketId]:Array(6).fill('-'),
          // }));
        }
        setTimeout(() => {
          socket.emit(event, market.marketId);
        }, 200);
      });
    });
  };

  React.useEffect(() => {
    sportsServices.getMatchList("4").then((res: AxiosResponse<any>) => {
      const oddsData = { ...odds };
      console.log(res.data, "data from sport list");
      marketIdsEvent(res.data.data, oddsData, "joinMarketRoom");
      setOdds(oddsData);
      setMatchList(res.data.data);
    });
    return () => {
      const oddsData = { ...odds };
      marketIdsEvent(matchList, oddsData, "leaveMarketRoom");
    };
  }, [4]);

  const currentMatch = (match: IMatch) => {
    dispatch(setCurrentMatch(match));
    navigate.go(`/odds/${match.matchId}`);
  };

  return (
    <>
      {/* {mobileSubheader.subheaderdesktopadmin(
        "Market Analysis",
        "You can view your cricket card books from sport menu."
      )} */}

      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12 main-container">
            <div className="card-body">
              <div
                className="table-responsive data-table"
                style={{ overflow: "hidden" }}
              >
                <div className="">
                  <div
                    className="col-md-12 col-12"
                    aria-labelledby="navbarDropdowknMenuLink"
                    style={{ height: "", overflowY: "scroll" }}
                  >
                    {gameList?.length > 0 &&
                      gameList
                        .filter(
                          (item: any) => !item.isDisable && item.match_id !== -1
                        )
                        .map((Item: any, key: number) => {
                          return (
                            //  <li key={key}>
                            //    <CustomLink to={`/casino/${Item.slug}`} className='block'>
                            //      <b>{Item.title}</b>
                            //    </CustomLink>

                            //  </li>
                            <div
                              className="col-3 col-md-2 event-row p-0 float-left mt-3"
                              key={key}
                            >
                              <div
                                style={{ border: "none" }}
                                className="card-body m-0 p-0"
                              >
                                <CustomLink
                                  to={`/casino/${Item.slug}`}
                                  className="block"
                                >
                                  <img
                                    className="casino_img"
                                    src={Item.image}
                                    style={{
                                      borderRadius: "10px",
                                      // width: "150px",
                                    }}
                                  />
                                  <span className="casino_img_text">
                                    {Item.title}
                                  </span>
                                </CustomLink>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </div>

                <table className="table table">
                  <thead>
                    <tr>
                      <th className="" style={{ padding: "10px" }}></th>
                      <th className="" style={{ padding: "10px" }}></th>
                    </tr>
                  </thead>
                  {/* <tbody>{listItem()}</tbody> */}
                </table>

                <MatchList2
                  currentMatch={currentMatch}
                  // memoOdds={}
                  matchList={matchList}
                />
              </div>
            </div>
          </div>

          <div className="container mt30">
            <div className="row">
              <div className="col-6 mb-2 col-md-3 text-center">
                <a href={`admin/list-clients/${userState?.user?.username}/user`}>
                  <div className="wap w-100 text-center">
                    <span className="icon-circle">
                      <AccountCircleIcon
                        className="icon-large"
                        style={{ fontSize: "80px" }}
                      />
                    </span>
                    <p className="small mt-2">Agent Details </p>
                  </div>
                </a>
              </div>

              <div className="col-6 mb-2 col-md-3 text-center">
                <a href="admin/sports-details">
                  <div className="wap w-100">
                    <span className="icon-circle">
                      <SportsSoccerIcon
                        style={{ color: "#fff", fontSize: "80px" }}
                      />
                    </span>

                    <p className="small mt-2">Sport's Betting</p>
                  </div>
                </a>
              </div>

              <div className="col-6 mb-2 col-md-3 text-center">
                <a href="admin/ledger-home">
                  <div className="wap w-100">
                    <span className="icon-circle">
                      <ReceiptLongIcon
                        style={{ color: "#fff", fontSize: "80px" }}
                      />
                    </span>

                    <p className="small mt-2">Ledger</p>
                  </div>
                </a>
              </div>

              <div className="col-6 mb-2 col-md-3 text-center">
                <CustomLink to="/all-client-report">
                  <div className="wap w-100">
                    <span className="icon-circle">
                      <LocalOfferIcon
                        style={{ color: "#fff", fontSize: "80px" }}
                      />
                    </span>

                    <p className="small mt-2">All Client Report</p>
                  </div>
                </CustomLink>
              </div>
            </div>
          </div>

          <div className="container mt30">
            <div className="row">
              <div className="col-md-4 mb-2">
                <div className="card ">
                  <div className="card-header h6 ng-binding">
                    My Account ( {newbalance} )
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-2">
                <div className="card ">
                  <div className="card-header h6 ng-binding">
                    My Share ({shared}% )
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-2">
                <div className="card ">
                  <div className="card-header h6 ng-binding">
                    {/* Match/Sess Comm ( {userState?.user?.partnership[1]?.ownRatio}% / 4% ) */}
                    Match/Sess Comm ({" "}
                    {detail?.mcom ?? 0}% /{" "}
                    {detail?.scom ?? 0}% )
                  </div>
                </div>
              </div>

              <div
                className="col-md-4 mb-2 ng-scope"
                ng-repeat="(key, value) in downline"
              >
                <div className="card ">
                  <div className="card-header h6 ng-binding">
                    Client ( {userList?.totalItems} )
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default AdminDashboard;
