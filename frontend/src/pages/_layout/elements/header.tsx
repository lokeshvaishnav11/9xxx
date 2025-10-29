import React, { ChangeEvent, MouseEvent, useRef } from "react";
import User from "../../../models/User";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  logout,
  selectUserData,
} from "../../../redux/actions/login/loginSlice";
import NavMenu from "./nav-menu";
import {
  hideBalExp,
  HideBalExp,
  selectBalance,
  selectHideBalExp,
  setExposer,
  setSingleBal,
  setCom
} from "../../../redux/actions/balance/balanceSlice";
import { CustomLink, useNavigateCustom } from "./custom-link";
// import { isMobile } from "react-device-detect";
import Marqueemessge from "../../../admin-app/pages/_layout/elements/welcome";
import NavMobileMenu from "./nav-mobile-menu";
import axios, { AxiosResponse } from "axios";
import { CONSTANTS } from "../../../utils/constants";
import userService from "../../../services/user.service";
import ReactModal from "react-modal";
import { useWebsocketUser } from "../../../context/webSocketUser";
import Rules from "../../Rules/rules";
import { selectRules } from "../../../redux/actions/common/commonSlice";
import AutocompleteComponent from "../../../components/AutocompleteComponent";
import matchService from "../../../services/match.service";
import IMatch from "../../../models/IMatch";
import casinoSlugs from "../../../utils/casino-slugs.json";

import UserService from "../../../services/user.service";
import betService from "../../../services/bet.service";


// const isMobile = true;
const Header = () => {
  const ref = useRef<any>(null);
  const userState = useAppSelector<{ user: User }>(selectUserData);
  // console.log(userState, "user");
  const balance = useAppSelector(selectBalance);
  const selectHideBal = useAppSelector<HideBalExp>(selectHideBalExp);
  const rules = useAppSelector(selectRules);
  const dispatch = useAppDispatch();

  const navigate = useNavigateCustom();

  const { socketUser } = useWebsocketUser();

  const [showMenu, setShowMenu] = React.useState<boolean>(false);
  const [showAuto, setShowAuto] = React.useState<boolean>(false);

  const [userMessage, setUserMessage] = React.useState<string>("");

  const [hideExpBal, setHideExpBal] = React.useState<HideBalExp>(
    {} as HideBalExp
  );

  const [isOpen, setIsOpen] = React.useState<any>(false);
  const [isOpenRule, setIsOpenRule] = React.useState<any>(false);
  const [getExposerEvent, setGetExposerEvent] = React.useState<any>([]);

  // React.useEffect(() => {
  //   axios.get(`userMessage.json?v=${Date.now()}`).then((res: AxiosResponse) => {
  //     setUserMessage(res.data.message)
  //   })
  // }, [])

  console.log("blance is heree",balance)

  React.useEffect(() => {
    setIsOpenRule(rules.open);
  }, [rules]);

  React.useEffect(() => {
    const handlerExposer = ({ exposer, balance,commision }: any) => {
      if (balance !== undefined) dispatch(setSingleBal(balance));
      if (exposer !== undefined) dispatch(setExposer(exposer));
      if(commision !== undefined) dispatch(setCom(commision))
    };
    socketUser.on("updateExposer", handlerExposer);

    return () => {
      socketUser.removeListener("updateExposer", handlerExposer);
    };
  }, [balance]);

  React.useEffect(() => {
    setHideExpBal(selectHideBal);
  }, [selectHideBal]);

  const logoutUser = (e: any) => {
    e.preventDefault();
    dispatch(logout());
    navigate.go("/login");
  };

  const onChangeBalExp = (e: ChangeEvent<HTMLInputElement>) => {
    const expBal = { ...hideExpBal, [e.target.name]: e.target.checked };
    dispatch(hideBalExp(expBal));
    localStorage.setItem(CONSTANTS.HIDE_BAL_EXP, JSON.stringify(expBal));
    setHideExpBal(expBal);
  };

  const getExposer = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsOpen(true);
    userService.getExposerEvent().then((res: AxiosResponse) => {
      setGetExposerEvent(res.data.data);
    });
  };

  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    const handleClickOutside = (event: any) => {
      if (showMenu && ref.current && !ref.current.contains(event.target)) {
        closeMenu();
      }
    };
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, showMenu]);

  const closeMenu = () => {
    setShowMenu(false);
  };
  const suggestion = ({ value }: any) => {
    return matchService.getMatchListSuggestion({ name: value });
  };

  const onMatchClick = (match: IMatch | null) => {
    if (match) {
      window.location.href = `/odds/${match.matchId}`;
    }
  };

const [userAlldata, setUserAlldata] = React.useState<{ [key: string]: any }>({});

   React.useEffect(() => {
      if (userState?.user?.username) {
        UserService.getUserDetail(userState?.user?.username).then(
          (res: AxiosResponse<any>) => {
            console.log(res, "ressss for all values");
            const detail = res?.data.data
            setUserAlldata(detail)
          }
        );
      }
    }, [userState?.user?.username]);


    const [notice, setNotice] = React.useState<any>();
      React.useEffect(() => {
       betService.getnotice().then((res: AxiosResponse<any>) => {
            setNotice(res.data.data);
          });
      }, []);

  return (
    <header className="header">
      <div className="container-fluidu">
        <div className="ro">
          <div className="container-fluid text-white py-2">
            <div className="d-flex align-items-center justify-content-between flex-wrap">
              {/* Logo */}
              <div className="d-flex align-items-center">
                <CustomLink to="/" className="d-flex logo align-items-center">
                  <img
                    src="/imgs/profiletop.png"
                    className="img-fluid "
                    // style={{ maxHeight: "40px" }}
                    alt="Logo"
                  />
                </CustomLink>
              </div>

              {/* User Info */}
              <div className="d-flex flex-column text-center text-md-end flex-grow-1 px-3">
                <p className="mb-1 fw-bold ">
                  {userState?.user?.username}({userAlldata?.code})
                </p>

                <div className="mb-1">
                  <span>Coins: </span>
                  {/* <b>{(balance.balance?.toFixed(2) + balance.commision?.toFixed(2)) - balance.exposer?.toFixed(2)}</b> */}
                  <b>{((balance.balance || 0) - (balance.exposer || 0)).toFixed(2)}</b>

                </div>

                {!selectHideBal.exposer && (
                  <div>
                    <a href="#" onClick={getExposer} >Expo: </a>
                    <b>
                      {balance.exposer > 0 ? balance.exposer?.toFixed(2) : 0}
                    </b>
                  </div>
                )}
              </div>

              {/* Logout */}
              <div className="text-center">
                <a
                  onClick={logoutUser}
                  href="#"
                  className="text-white fw-bold text-uppercase d-flex flex-column align-items-center"
                >
                  <img
                    src="/imgs/LogOut.png"
                    alt="Logout"
                    style={{ maxHeight: "30px" }}
                  />
                  <span className="mt-2">Logout</span>
                </a>
              </div>
            </div>
          </div>

          <Marqueemessge message={notice?.fnotice || "."} />

          {/* {!isMobile ? <NavMenu /> : <NavMobileMenu />} */}
          {/* {!isMobile ? <NavMenu /> : <NavMenu /> } */}
          {/* {!isMobile ? <NavMenu /> : "fdfdf"} */}
        </div>
      </div>
      <div />
      <div className="modal-market" />

      <ReactModal
        isOpen={isOpen}
        onRequestClose={(e: any) => {
          setIsOpen(false);
        }}
        contentLabel="Set Max Bet Limit"
        className={"modal-dialog"}
        ariaHideApp={false}
      >
        <div className="modal-content">
          <div className="modal-header">
            My Market
            <button
              onClick={() => setIsOpen(false)}
              className="close float-right"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          </div>
          <div className="modal-body">
            <table className="reponsive table col-12">
              <tr>
                <th>Event Name</th>
                <th>Total Bets</th>
              </tr>

              {getExposerEvent.map((exposer: any) => {
                let casinoSlug = "";
                if (exposer.sportId == 5000) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  casinoSlug = casinoSlugs?.[exposer?.matchId];
                }
                return (
                  <tr key={exposer.matchName}>
                    <td>
                      <CustomLink
                        onClick={() => {
                          window.location.href =
                            exposer.sportId &&
                            Number.isInteger(+exposer.sportId) &&
                            exposer.sportId != 5000
                              ? `/odds/${exposer._id}`
                              : `/casino/${casinoSlug}/${exposer._id}`;
                          setIsOpen(false);
                        }}
                        to={
                          exposer.sportId &&
                          Number.isInteger(+exposer.sportId) &&
                          exposer.sportId != 5000
                            ? `/odds/${exposer._id}`
                            : `/casino/${casinoSlug}/${exposer._id}`
                        }
                      >
                        {exposer.matchName}
                      </CustomLink>
                    </td>
                    <td>{exposer.myCount}</td>
                  </tr>
                );
              })}
            </table>
          </div>
        </div>
      </ReactModal>

      <ReactModal
        isOpen={isOpenRule}
        onRequestClose={(e: any) => {
          setIsOpenRule(false);
        }}
        contentLabel="Set Max Bet Limit"
        className={"modal-dialog w-90P"}
        ariaHideApp={false}
      >
        <div
          className="modal-content"
          style={{ height: "90vh", marginTop: "1%" }}
        >
          <div className="modal-header">
            Rules
            <button
              onClick={() => setIsOpenRule(false)}
              className="close float-right"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          </div>
          <div className="modal-body">
            <Rules classData={"col-md-12"} />
          </div>
        </div>
      </ReactModal>
    </header>
  );
};
export default Header;
