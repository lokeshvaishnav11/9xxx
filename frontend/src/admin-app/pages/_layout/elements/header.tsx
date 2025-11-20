// import React from 'react'

// import { Tree } from 'antd'
// import axios, { AxiosResponse } from 'axios'
// import Drawer from 'react-modern-drawer'
// import 'react-modern-drawer/dist/index.css'
// import ISport from '../../../../models/ISport'
// import User, { RoleType } from '../../../../models/User'
// import { CustomLink, useNavigateCustom } from '../../../../pages/_layout/elements/custom-link'
// import { logout, selectUserData, userUpdate } from '../../../../redux/actions/login/loginSlice'
// import { selectSportList } from '../../../../redux/actions/sports/sportSlice'
// import { useAppDispatch, useAppSelector } from '../../../../redux/hooks'
// import casinoService from '../../../../services/casino.service'
// import sportsService from '../../../../services/sports.service'
// import userService from '../../../../services/user.service'
// import CustomAutoComplete from '../../../components/CustomAutoComplete'
// import Marqueemessge from './welcome'
// import { DataNode } from 'antd/es/tree'

// const Header = () => {
//   const userState = useAppSelector<{ user: User }>(selectUserData)
//   const dispatch = useAppDispatch()

//   const navigate = useNavigateCustom()

//   const [showMenu, setShowMenu] = React.useState<boolean>(false)
//   const [treeData, setTreeData] = React.useState<any>([])
//   const [expanded, setExpanded] = React.useState<string[]>([])

//   const sportsList = useAppSelector(selectSportList)

//   const [userMessage, setUserMessage] = React.useState<string>('')

//   const [isOpen, setIsOpen] = React.useState(false)
//   const [gameList, setGameList] = React.useState([])

//   React.useEffect(() => {
//     axios.get(`adminMessage.json?v=${Date.now()}`).then((res: AxiosResponse) => {
//       setUserMessage(res.data.message)
//     })
//   }, [])

//   React.useEffect(() => {
//     if (gameList.length <= 0)
//       casinoService.getCasinoList().then((res: AxiosResponse<any>) => {
//         setGameList(res.data.data)
//       })
//   }, [])

//   const toggleDrawer = () => {
//     setIsOpen((prevState) => !prevState)
//     setTreeData(
//       sportsList.sports.map((sport: ISport) => ({ title: sport.name, key: sport.sportId })),
//     )
//   }

//   const logoutUser = (e: any) => {
//     e.preventDefault()
//     dispatch(userUpdate({} as User))
//     setTimeout(() => {
//       dispatch(logout())
//       navigate.go('/login')
//     }, 1)
//   }

//   const onSuggestionsFetchRequested = ({ value }: any) => {
//     return userService.getUserListSuggestion({ username: value })
//   }

//   const onSelectUser = (user: any) => {
//     navigate.go(`/list-clients/${user.username}?search=true`)
//   }

//   const selectExpend = (item: any) => {
//     if (item.matchId) {
//       setIsOpen(false)
//       window.location.href = `/admin/odds/${item.matchId}`
//     }
//   }

//   const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
//     list.map((node) => {
//       if (node.key === key) {
//         return {
//           ...node,
//           children,
//         }
//       }
//       if (node.children) {
//         return {
//           ...node,
//           children: updateTreeData(node.children, key, children),
//         }
//       }
//       return node
//     })

//   const onLoadData = (data: any) => {
//     if (data.matchId) {
//       selectExpend(data)
//       return Promise.resolve()
//     }
//     return sportsService.getSeriesWithMatch(data.key).then((series: any) => {
//       const items = series.data.data.map((series: any) => {
//         const { id, name } = series.competition
//         const matchNodes = series.matches.map((match: any) => {
//           return {
//             key: match.event.id,
//             title: match.event.name,
//             matchId: match.event.id,
//           }
//         })
//         return {
//           key: id,
//           title: name,
//           children: matchNodes,
//         }
//       })
//       setTreeData((origin: any) => {
//         return updateTreeData(origin, data.key, items)
//       })

//       return items
//     })
//   }

//   return (
//     <>
//       <header>
//         <div className='header-bottom'>
//           <div className='container-fluid'>
//             <CustomLink to={'/'} className='logo'>
//               <img src='/imgs/logo.png' />
//             </CustomLink>
//             <div className='side-menu-button' onClick={toggleDrawer}>
//               <div className='bar1' />
//               <div className='bar2' />
//               <div className='bar3' />
//             </div>
//             <nav className='navbar navbar-expand-md btco-hover-menu'>
//               <div className='collapse navbar-collapse'>
//                 <ul className='list-unstyled navbar-nav'>
//                   <li className='nav-item'>
//                     <CustomLink to={'/list-clients'}>
//                       <b>List of clients</b>
//                     </CustomLink>
//                   </li>

//                   <li className='nav-item'>
//                     <CustomLink to={'/market-analysis'}>
//                       <b>Market Analysis</b>
//                     </CustomLink>
//                   </li>
//                   <li className='nav-item dropdown'>
//                     <a>
//                       <b>Reports</b> <i className='fa fa-caret-down' />
//                     </a>
//                     <ul className='dropdown-menu' aria-labelledby='navbarDropdownMenuLink'>
//                       <li>
//                         <CustomLink to='/accountstatement' className='dropdown-item'>
//                           <b>{"Account's Statement"}</b>
//                         </CustomLink>
//                       </li>
//                       <li>
//                         <CustomLink to='/unsettledbet' className='dropdown-item'>
//                           <b>Current Bets</b>
//                         </CustomLink>
//                       </li>
//                       {userState?.user?.role === RoleType.admin && (
//                         <li>
//                           <CustomLink to='/unsettledbet/deleted' className='dropdown-item'>
//                             <b>Deleted Bets</b>
//                           </CustomLink>
//                         </li>
//                       )}
//                       {/* <li>
//                         <a href='greport.html' className='dropdown-item'>
//                           <b>General Report</b>
//                         </a>
//                       </li> */}
//                       <li>
//                         <CustomLink to='/game-reports' className='dropdown-item'>
//                           <b>Game Reports</b>
//                         </CustomLink>
//                       </li>
//                       <li>
//                         <CustomLink to='/profitloss' className='dropdown-item'>
//                           <b>Profit And Loss</b>
//                         </CustomLink>
//                       </li>
//                     </ul>
//                   </li>
// {/*
//                   <li className='nav-item dropdown'>
//                     <a>
//                       <b>Transactions</b> <i className='fa fa-caret-down' />
//                     </a>
//                     <ul className='dropdown-menu' aria-labelledby='navbarDropdownMenuLink'>
//                       <li>
//                         <CustomLink to='/depositstatement' className='dropdown-item'>
//                           <b>{"Deposit"}</b>
//                         </CustomLink>
//                       </li>
//                       <li>
//                         <CustomLink to='/withdrawstatement' className='dropdown-item'>
//                           <b>Withdraw</b>
//                         </CustomLink>
//                       </li>
//                     </ul>
//                   </li> */}
//                   <li className='nav-item dropdown'>
//                     <a>
//                       <b>Live Casino</b> <i className='fa fa-caret-down' />
//                     </a>
//                     <ul
//                       className='dropdown-menu'
//                       aria-labelledby='navbarDropdownMenuLink'
//                       style={{ height: '400px', overflowY: 'scroll' }}
//                     >
//                       {gameList?.length > 0 &&
//                         gameList.map((Item: any, key: number) => {
//                           return (
//                             <li key={key}>
//                               <CustomLink to={`/casino/${Item.slug}`} className='dropdown-item'>
//                                 <b>{Item.title}</b>
//                               </CustomLink>
//                             </li>
//                           )
//                         })}
//                     </ul>
//                   </li>

//                     <li className='nav-item dropdown'>
//                       <a>
//                         <b>Settings</b> <i className='fa fa-caret-down' />
//                       </a>
//                       <ul className='dropdown-menu' aria-labelledby='navbarDropdownMenuLink'>
//                       {(userState?.user?.role === RoleType.admin) && (<>
//                         <li>
//                           <CustomLink to='/sports-list/active-matches' className='dropdown-item'>
//                             <b>{'Block Markets'}</b>
//                           </CustomLink>
//                         </li>
//                         <li>
//                           <CustomLink to='/messages' className='dropdown-item'>
//                             <b>{'Messages'}</b>
//                           </CustomLink>
//                         </li>
//                         <li>
//                           <CustomLink to={'/sports-list/matches'} className='dropdown-item'>
//                             <b>Add Match List</b>
//                           </CustomLink>
//                         </li>

//                         <li>
//                           <CustomLink to='/casino-list' className='dropdown-item'>
//                             <b>{'Casino List'}</b>
//                           </CustomLink>
//                         </li>
//                       </>
//                       )}

//                       <li>
//                         <CustomLink to='/payment-method' className='dropdown-item'>
//                           <b>{'Payment Method'}</b>
//                         </CustomLink>
//                       </li>

//                       <li>
//                         <CustomLink to='/client-ledger' className='dropdown-item'>
//                           <b>{'Client Ledger'}</b>
//                         </CustomLink>
//                       </li>
//                       </ul>
//                     </li>

//                 </ul>
//               </div>
//             </nav>
//             <ul className='user-search list-unstyled'>
//               <li className='username'>
//                 <span onClick={() => setShowMenu(!showMenu)}>
//                   {userState?.user?.username} <i className='fa fa-caret-down' />
//                 </span>
//                 <ul style={{ display: showMenu ? 'block' : 'none' }}>
//                   <li>
//                     <CustomLink to='/change-password'>
//                       <b>Change Password</b>
//                     </CustomLink>
//                   </li>
//                   <li>
//                     <a onClick={logoutUser} href='#'>
//                       <b>Logout</b>
//                     </a>
//                   </li>
//                 </ul>
//               </li>
//               <li className='search'>
//                 <CustomAutoComplete
//                   onSuggestionsFetchRequested={onSuggestionsFetchRequested}
//                   onSelectUser={onSelectUser}
//                   placeHolder={'All Client'}
//                 />
//                 {/* <input id='tags' type='text' name='list' placeholder='All Client' />
//                 <a id='clientList' data-value='' href='#'>
//                   <i className='fas fa-search-plus' />
//                 </a> */}
//               </li>
//             </ul>
//             <Marqueemessge message={userMessage}></Marqueemessge>
//           </div>
//         </div>
//       </header>
//       <Drawer open={isOpen} onClose={toggleDrawer} direction='left'>
//         <div className='drawer-header'>
//           <img src='/imgs/logo.png' className='wd-100' />
//         </div>
//         <div className='drawer-content'>
//           <Tree
//             loadData={onLoadData}
//             treeData={treeData}
//             onSelect={(selectedKeys, e) => {
//               selectExpend(e.node)
//             }}
//           />
//         </div>
//       </Drawer>
//     </>
//   )
// }
// export default Header

import React from "react";

import { Tree } from "antd";
import axios, { AxiosResponse } from "axios";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import ISport from "../../../../models/ISport";
import User, { RoleName, RoleType } from "../../../../models/User";
import {
  CustomLink,
  useNavigateCustom,
} from "../../../../pages/_layout/elements/custom-link";
import {
  logout,
  selectUserData,
  userUpdate,
} from "../../../../redux/actions/login/loginSlice";
import { selectSportList } from "../../../../redux/actions/sports/sportSlice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import casinoService from "../../../../services/casino.service";
import sportsService from "../../../../services/sports.service";
import userService from "../../../../services/user.service";
import CustomAutoComplete from "../../../components/CustomAutoComplete";
import Marqueemessge from "./welcome";
import { DataNode } from "antd/es/tree";
import "./header.css";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SummarizeIcon from "@mui/icons-material/Summarize";
import CasinoIcon from "@mui/icons-material/Casino";
import SettingsIcon from "@mui/icons-material/Settings";
import ListIcon from "@mui/icons-material/List";
import MenuIcon from "@mui/icons-material/Menu";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import TvIcon from "@mui/icons-material/Tv";
import { useDrawer } from "../../../../context/DrawerContext";
import betService from "../../../../services/bet.service";

import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useParams } from "react-router-dom";
const Header = () => {
  const userState = useAppSelector<{ user: User }>(selectUserData);
  const dispatch = useAppDispatch();

  const navigate = useNavigateCustom();

  const [showMenu, setShowMenu] = React.useState<boolean>(false);
  const [treeData, setTreeData] = React.useState<any>([]);

  const [expanded, setExpanded] = React.useState<string[]>([]);

  const sportsList = useAppSelector(selectSportList);

  const [userMessage, setUserMessage] = React.useState<string>("");

  // const [isOpen, setIsOpen] = React.useState(false);
  // const [isOpen2, setIsOpen2] = React.useState(false);

  const [gameList, setGameList] = React.useState([]);

  React.useEffect(() => {
    axios
      .get(`adminMessage.json?v=${Date.now()}`)
      .then((res: AxiosResponse) => {
        setUserMessage(res.data.message);
      });
  }, []);

  React.useEffect(() => {
    if (gameList.length <= 0)
      casinoService.getCasinoList().then((res: AxiosResponse<any>) => {
        setGameList(res.data.data);
      });
  }, []);

  const [notice, setNotice] = React.useState<any>();
  React.useEffect(() => {
   betService.getnotice().then((res: AxiosResponse<any>) => {
        setNotice(res.data.data);
      });
  }, []);

  // const toggleDrawer = () => {
  //   setIsOpen((prevState) => !prevState)
  //   // setTreeData(
  //   //   sportsList.sports.map((sport: ISport) => ({ title: sport.name, key: sport.sportId })),
  //   // )
  // }

  // const toggleDrawer = () => {
  //   setIsOpen(!isOpen);
  //   setIsOpen2(!isOpen2);

  //   console.log("CLose");
  // };


  const {  isOpen, isOpen2, toggleDrawer,activeMenu, setActiveMenu } = useDrawer();
  console.log(isOpen, isOpen2,"toggle drawrree")

  const logoutUser = (e: any) => {
    e.preventDefault();
    dispatch(userUpdate({} as User));
    setTimeout(() => {
      dispatch(logout());
      navigate.go("/login");
    }, 1);
  };

  const onSuggestionsFetchRequested = ({ value }: any) => {
    return userService.getUserListSuggestion({ username: value });
  };

  const onSelectUser = (user: any) => {
    navigate.go(`/list-clients/${user.username}?search=true`);
  };

  const selectExpend = (item: any) => {
    if (item.matchId) {
      // setIsOpen(false);
      window.location.href = `/admin/odds/${item.matchId}`;
    }
  };

  const updateTreeData = (
    list: DataNode[],
    key: React.Key,
    children: DataNode[]
  ): DataNode[] =>
    list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          children,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });

  const onLoadData = (data: any) => {
    if (data.matchId) {
      selectExpend(data);
      return Promise.resolve();
    }
    return sportsService.getSeriesWithMatch(data.key).then((series: any) => {
      const items = series.data.data.map((series: any) => {
        const { id, name } = series.competition;
        const matchNodes = series.matches.map((match: any) => {
          return {
            key: match.event.id,
            title: match.event.name,
            matchId: match.event.id,
          };
        });
        return {
          key: id,
          title: name,
          children: matchNodes,
        };
      });
      setTreeData((origin: any) => {
        return updateTreeData(origin, data.key, items);
      });

      return items;
    });
  };

  // Parent Name
  // data.parent = userData?.username;

  // const roleOption = () => {
  //     const userRole = userState?.user?.role;
  //     const allRoles = JSON.parse(JSON.stringify(RoleName));
  //     delete allRoles.admin;
  //     const options: Record<string, string> = allRoles;
  //     if (userRole && userRole != "admin") {
  //       const allOptions = Object.keys(options);
  //       const startIndex = allOptions.indexOf(userRole);
  //       const newArray = allOptions.slice(startIndex + 1);

  //       return newArray.map((option, index) => {
  //         if (+userRole >= ++index) return false;
  //         return (
  //           <option className="grid" key={index} value={option}>
  //             {options[option]}
  //           </option>
  //         );
  //       });
  //     }
  //     return Object.keys(options).map((option, index) => {
  //       return (
  //         <option key={index} value={option}>
  //           {options[option]}
  //         </option>
  //       );
  //     });
  //   };

  const getRoleOptions = (): { key: RoleType; label: string }[] => {
    const userRole = userState?.user?.role as RoleType;

    const allRoles = {
      admin: "Super Admin",
      sadmin: "Sub Admin",
      suadmin: "Admin",
      smdl: "Master Agent",
      mdl: "Super Agent Master",
      dl: "Agent Master",
      user: "Client Master",
    };

    const roleMap: Record<RoleType, RoleType[]> = {
      [RoleType.admin]: [
        RoleType.sadmin,
        RoleType.suadmin,
        RoleType.smdl,
        RoleType.mdl,
        RoleType.dl,
        RoleType.user,
      ],
      [RoleType.sadmin]: [RoleType.suadmin ,RoleType.smdl, RoleType.mdl,  RoleType.dl, RoleType.user,],
      [RoleType.suadmin]: [RoleType.smdl, RoleType.mdl, RoleType.dl, RoleType.user,],

      [RoleType.smdl]: [RoleType.mdl, RoleType.dl, RoleType.user],
      [RoleType.mdl]: [RoleType.dl, RoleType.user],
      [RoleType.dl]: [RoleType.user],
      [RoleType.user]: [],
    };

    const allowedRoles = roleMap[userRole] || [];

    return allowedRoles.map((key) => ({
      key,
      label: allRoles[key],
    }));
  };


  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [dropdownOpen2, setDropdownOpen2] = React.useState(false);
  const [dropdownOpen3, setDropdownOpen3] = React.useState(false);
  const [dropdownOpen4, setDropdownOpen4] = React.useState(false);

console.log(activeMenu,"active menu")



  const [searchObj, setSearchObj] = React.useState({
    username: "",
    type: "",
    search: "",
    status: "",
    page: 1,
  });

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
      console.log(res.data.data, "number of lincntedf list number");
      setUserList(res.data.data);
    });
  };

  React.useEffect(() => {
    getList(searchObj); // Trigger on mount or when searchObj changes
  }, [userState]);

  // console.log(
  //   userList?.items?.filter((i: any) => i.role === "user").length,
  //   "← total users with role 'user'"
  // );
  
  return (
    <>
      <header className="">



        <div className="flex newmargin  justify-between md:justify-end p-2  bg-gray-header" style={{backgroundColor:"darkgoldenrod",color:"black"}}>
          <div
            className="side-menu-buttonn md:hidden ml-2 "
            onClick={toggleDrawer}
          >
            <div className="bar1" />
            <div className="bar2" />
            <div className="bar3" />
          </div>

          <div
            style={{ marginLeft: "-5rem" }}
            className={`side-menu-buttonn  ${
              !isOpen2 ? "hidden" : "block"
            } font-bold text-white md:hidden`}
            onClick={toggleDrawer}
          >
           <div className="bar1" />
            <div className="bar2" />
            <div className="bar3" />
          </div>


          <div className="">
            <ul className="user-searchh flex gap-2  list-unstyled ">
              <li className="username  text-white my-2">
                <span
                  className="bg-gray-500 relative  rounded-sm px-2 py-2" style={{backgroundColor:"#cf9a16",color:"black"}}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  {userState?.user?.username} <i className="fa fa-caret-down" />
                </span>
                <ul
                  className="mt-2 absolute right-10 z-10  rounded border border-black bg-white px-2 grid py-2 space-y-4 text-black"
                  style={{ display: showMenu ? "block" : "none" }}
                >
                  <li className="border-b   pb-2">
                    <CustomLink className="flex " to="/change-password">
                      <PersonIcon />{" "}
                      <b className="font-normal text-nowrap text-md">
                        Change Password
                      </b>
                    </CustomLink>
                  </li>
                  <li>
                    <a onClick={logoutUser} href="#">
                      <LogoutIcon />
                      <b className="font-normal text-md pl-2">Logout</b>
                    </a>
                  </li>
                </ul>
              </li>
              <li className="search">
                {/* <CustomAutoComplete
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                  onSelectUser={onSelectUser}
                  placeHolder={"All Client"}
                /> */}

                {/* <input id='tags' type='text' name='list' placeholder='All Client' />
                <a id='clientList' data-value='' href='#'>
                  <i className='fas fa-search-plus' />
                </a> */}
              </li>
            </ul>
          </div>
        </div>

        <Marqueemessge  message={notice?.bnotice || "."} />
        <div
       
          className={`top-0 fixed md:block ${
            isOpen ? "block" : "hidden"
          } nine-x-gray text-wrap  z-50 md:w-60	  h-full overflow-y-scroll`}
          id="sidebar"
          // className={`top-0 absolute md:block hidden   z-50 bg-gray-600  md:w-60 min-h-screen`}
        >
          {/* <button
            className="side-menu-buttonn ml-2 text-black absolute top-0 right-1  block md:hidden text-white "
            onClick={toggleDrawer}
          >
            <CloseIcon />
          </button> */}

          <CustomLink to={"/"} className="logo-new navbarbg  -600">
            {/* <img className="" src="/9x.png" /> */}
             <img className=""  style={{ width: "500px" }} src="/imgs/d006 copy.png" />

          </CustomLink>

          <div className="">
            <nav className="navbar navbar-expand btco-hover-menu ">
              <div className="collapse navbar-collapse">
                <ul className="list-unstyled navbar-nav navbar-new grid">
                  {/* <li className="nav-item border-b md:w-60 w-fit ">
                    <CustomLink
                      onClick={toggleDrawer}
                      className="md:flex gap-2 md:flex-row flex flex-col items-center"
                      to={"/list-clients"}
                    >
                      <TvIcon className="text-yellow-600 " />
                      <b className="md:text-lg text-xs font-medium text-white">
                        Dashboard
                      </b>
                    </CustomLink>
                  </li> */}

                  <li className={`nav-item  border-b md:w-60 w-fit ${activeMenu === "Dashboard" ? "bg-active" : ""}`}>
                    <CustomLink
                      onClick={() => { toggleDrawer(); setActiveMenu("Dashboard");}}
                      className="md:flex gap-2 py-2 md:flex-row flex flex-col items-center"
                      to={"/market-analysis"}
                    >
                      <TvIcon className="text-yellow-600 " />
                      <b className="md:text-lg text-xs font-medium text-white">
                        Dashboard
                      </b>
                    </CustomLink>
                  </li>

                  {/* <li className="nav-item border-b md:w-60">
                    <CustomLink
                      onClick={toggleDrawer}
                      className="md:flex md:flex-row flex flex-col gap-2 items-center"
                      to={`/list-clients/${userState?.user?.username}`}
                    >
                      <ListIcon className="text-yellow-600  " />
                      <b className="md:text-lg text-xs font-medium text-white">
                        {userState?.user?.username}
                      </b>
                    </CustomLink>
                  </li> */}

                  <li className={` ${activeMenu === "User" ? "bg-active" : ""} nav-item dropdown border-b md:w-60 group relative`}>
                    <CustomLink
                      to={"/list-clients"}
                      className="md:flex py-2  md:flex-row flex flex-col gap-2 items-center cursor-pointer"
                      onClick={() => {setDropdownOpen(!dropdownOpen); setActiveMenu("User");}}
                     
                    >
                      <GroupIcon className="text-yellow-600" />
                      <b className="md:text-lg text-xs font-medium  text-white">
                        {/* {userState?.user?.role  === 'mdl' ? 'Agent Master' : "" } */}
                        {userState?.user?.role === "admin"
                          ? "Super Admin"
                          : userState?.user?.role === "sadmin"
                          ? "Sub Admin"
                          : userState?.user?.role === "suadmin"
                          ? "Admin"
                          : userState?.user?.role === "smdl"
                          ? "Master Agent"
                          : userState?.user?.role === "mdl"
                          ? "Super Agent Master"
                          : userState?.user?.role === "dl"
                          ? "Agent Master"
                          : userState?.user?.role === "user"
                          ? "Client Master"
                          : ""}
                      </b>
                      <i className="fa fa-caret-down text-white" />
                     

                    </CustomLink>

                    { dropdownOpen ? <div  className="dropdown-menuj bg-neutral-700 md:pl-2   absolutek z-50 hiddenj group-hover:block w-full">
                      {getRoleOptions().map((role) => (
                        <li key={role.key}>
                          <CustomLink
                            to={`/list-clients/${userState?.user?.username}/${role.key}`}
                            // onClick={() => setDropdownOpen(!dropdownOpen)}
                            //  onClick={toggleDrawer}
                            onClick={() => { toggleDrawer(); setDropdownOpen(!dropdownOpen) ; setActiveMenu("User");}}
                            className="dropdown-item hover:bg-gray-400"
                          >
                            <b className="text-white mobile-style md:text-lg text-xs  md:flex md:flex-row flex flex-col items-center gap-1">
                              <ListIcon className="text-black-600" />
                              {role.label}({userList?.items?.filter((i: any) => i.role === `${role.key}`)?.length})
                            </b>
                          </CustomLink>
                        </li>
                      ))}
                    </div> : ""}

                   
                  </li>


                  <li className={`nav-item border-b md:w-60 w-fit ${activeMenu === "Sports" ? "bg-active" : ""} `}>
                    <CustomLink
                      // onClick={toggleDrawer}
                      onClick={() => { toggleDrawer(); setActiveMenu("Sports");}}

                      className="md:flex gap-2 py-2  md:flex-row flex flex-col items-center"
                        to="/sports-details"
                    >
                      <SportsSoccerIcon className="text-yellow-600" />
                      <b className="md:text-lg text-xs font-medium text-white">
                        Sport's Betting
                      </b>
                    </CustomLink>
                  </li>

                  <li className={`nav-item border-b md:w-60 w-fit ${activeMenu === "Cass" ? "bg-active" : ""} `}>
                    <CustomLink
                      // onClick={toggleDrawer}
                      onClick={() => { toggleDrawer(); setActiveMenu("Cass");}}

                      className="md:flex gap-2 py-2  md:flex-row flex flex-col items-center"
                        to="/casino-details"
                    >
                      <SummarizeIcon className="text-yellow-600" />
                      <b className="md:text-lg text-xs font-medium text-white">
                       Casino Betting
                      </b>
                    </CustomLink>
                  </li>

                  <li className="nav-item hidden dropdown border-b md:w-60">
                    <a onClick={() => setDropdownOpen2(!dropdownOpen2)} className="md:flex md:flex-row flex flex-col gap-2 items-center">
                      <SportsSoccerIcon className="text-yellow-600" />
                      <b className="md:text-lg text-xs font-medium text-white">
                        Sports Betting
                      </b>{" "}
                      <i className="fa fa-caret-down text-white" />
                    </a>
                   { dropdownOpen2 ? <div
                      className="dropdown-menum bg-neutral-700 md:pl-2"
                      aria-labelledby="navbarDropdownMenuLink"
                    >
                      <li>
                        <CustomLink
                         onClick={() => setDropdownOpen2(!dropdownOpen2)}
                          to="/inplay-games"
                          className="dropdown-item"
                        >
                          <b className="text-white md:text-lg  text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            {"Inplay Games"}
                          </b>
                        </CustomLink>
                      </li>

                      <li>
                        <CustomLink
                          to="/sports-details"
                          onClick={() => setDropdownOpen2(!dropdownOpen2)}
                          className="dropdown-item"
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            Sport's Betting
                          </b>
                        </CustomLink>
                      </li>

                      <li>
                        <CustomLink
                          to="/sports-details"
                          onClick={() => setDropdownOpen2(!dropdownOpen2)}
                          className="dropdown-item hidden"
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            Completed Games
                          </b>
                        </CustomLink>
                      </li>
                    </div> : ""}
                  </li>

                  {/* <li className="nav-item dropdown border-b md:w-60">
                    <a className="md:flex md:flex-row flex flex-col gap-2 items-center">
                      <SummarizeIcon className="text-yellow-600" />
                      <b className="md:text-lg text-xs font-medium text-white">
                        {userState?.user?.username}
                      </b>{" "}
                      <i className="fa fa-caret-down text-white" />
                    </a>
                    <ul
                      className="dropdown-menu bg-neutral-700 mt-4"
                      aria-labelledby="navbarDropdownMenuLink"
                    >
                      <li>
                        <CustomLink
                          onClick={toggleDrawer}
                          to="/my-ledger"
                          className="dropdown-item"
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            {"My Ledger"}
                          </b>
                        </CustomLink>
                      </li>
                    </ul>
                  </li> */}

                  <li className="nav-item hidden dropdown border-b md:w-60">
                    <a className="md:flex md:flex-row flex flex-col gap-2 items-center">
                      <SummarizeIcon className="text-yellow-600" />
                      <b className="md:text-lg text-xs font-medium text-white">
                        Sports Detail
                      </b>{" "}
                      <i className="fa fa-caret-down text-white" />
                    </a>
                    <ul
                      className="dropdown-menu bg-neutral-700 mt-4 "
                      aria-labelledby="navbarDropdownMenuLink"
                    >
                      {/* <li>
                        <CustomLink
                          onClick={toggleDrawer}
                          to="/active-matches/4"
                          className="dropdown-item"
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            {"Sports Details"}
                          </b>
                        </CustomLink>
                      </li> */}

                      {userState?.user?.role === RoleType.admin && (
                        <>
                          {/* <li>
                            <CustomLink
                              onClick={toggleDrawer}
                              to="/sports-list/active-matches"
                              className="dropdown-item"
                            >
                              <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
                                <TuneIcon className="text-yellow-600" />
                                {"Block Markets"}
                              </b>
                            </CustomLink>
                          </li> */}
                          {/* <li>
                            <CustomLink
                              onClick={toggleDrawer}
                              to="/messages"
                              className="dropdown-item"
                            >
                              <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
                                <TuneIcon className="text-yellow-600" />
                                {"Messages"}
                              </b>
                            </CustomLink>
                          </li> */}
                          <li>
                            <CustomLink
                              // onClick={toggleDrawer}
                              to={"/sports-list/matches"}
                              className="dropdown-item"
                            >
                              <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
                                <TuneIcon className="text-yellow-600" />
                                Sports Detail
                              </b>
                            </CustomLink>
                          </li>

                          {/* <li>
                            <CustomLink
                              onClick={toggleDrawer}
                              to="/casino-list"
                              className="dropdown-item"
                            >
                              <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
                                <TuneIcon className="text-yellow-600" />
                                {"Casino List"}
                              </b>
                            </CustomLink>
                          </li> */}
                        </>
                      )}

                      {/* <li>
                        <CustomLink
                          to="/unsettledbet"
                          onClick={toggleDrawer}
                          className="dropdown-item"
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            Total Profit
                          </b>
                        </CustomLink>
                      </li> */}
                      {/* {userState?.user?.role === RoleType.admin && (
                        <li>
                          <CustomLink
                            onClick={toggleDrawer}
                            to="/unsettledbet/deleted"
                            className="dropdown-item"
                          >
                            <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                              <ListIcon className="text-yellow-600" />
                              Deleted Bets
                            </b>
                          </CustomLink>
                        </li>
                      )} */}
                      {/* <li>
                        <a href='greport.html' className='dropdown-item'>
                          <b>General Report</b>
                        </a>
                      </li> */}
                      {/* <li>
                        <CustomLink
                          to="/game-reports"
                          className="dropdown-item"
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            Game Reports
                          </b>
                        </CustomLink>
                      </li> */}
                      {/* <li>
                        <CustomLink to='/profitloss' className='dropdown-item'>
                          <b className='text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1'><ListIcon className='text-yellow-600' />Profit And Loss</b>
                        </CustomLink>
                      </li> */}
                    </ul>
                  </li>

                  {/* <li className={`nav-item border-b md:w-60 ${activeMenu === "Casino" ? "bg-active": ""}`}>
                    <CustomLink
                      // onClick={toggleDrawer}
                      onClick={() => { toggleDrawer(); setActiveMenu("Casino");}}
                      className="md:flex py-2  md:flex-row flex flex-col gap-2 items-center"
                      to={"/casino-pl"}
                    >
                      <AssessmentIcon className="text-yellow-600 " />
                      <b className="md:text-lg text-xs font-medium text-white">
                        Casino P/L nnccncncn
                      </b>
                    </CustomLink>
                  </li> */}

                  {/* <li className="nav-item border-b md:w-60">
                    <CustomLink
                      onClick={toggleDrawer}
                      className="md:flex md:flex-row flex flex-col gap-2 items-center"
                      to={"/market-analysis"}
                    >
                      <AssessmentIcon className="text-yellow-600 " />
                      <b className="md:text-lg text-xs font-medium text-white">
                        Market Analysis
                      </b>
                    </CustomLink>
                  </li> */}

                  {/* <li className="nav-item dropdown border-b md:w-60">
                    <a className="md:flex md:flex-row flex flex-col gap-2 items-center">
                      <SummarizeIcon className="text-yellow-600" />
                      <b className="md:text-lg text-xs font-medium text-white">
                        Reports
                      </b>{" "}
                      <i className="fa fa-caret-down text-white" />
                    </a>
                    <ul
                      className="dropdown-menu bg-neutral-700 mt-4"
                      aria-labelledby="navbarDropdownMenuLink"
                    >
                      <li>
                        <CustomLink
                          to="/accountstatement"
                          className="dropdown-item"
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            Account's Statement
                          </b>
                        </CustomLink>
                      </li>
                      <li>
                        <CustomLink
                          to="/unsettledbet"
                          className="dropdown-item"
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            Current Bets
                          </b>
                        </CustomLink>
                      </li>
                      {userState?.user?.role === RoleType.admin && (
                        <li>
                          <CustomLink
                            to="/unsettledbet/deleted"
                            className="dropdown-item"
                          >
                            <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                              <ListIcon className="text-yellow-600" />
                              Deleted Bets
                            </b>
                          </CustomLink>
                        </li>
                      )}
                      
                      <li>
                        <CustomLink
                          to="/game-reports"
                          className="dropdown-item"
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            Game Reports
                          </b>
                        </CustomLink>
                      </li>
                      
                    </ul>
                  </li> */}

                  <li className={`nav-item dropdown border-b md:w-60 ${activeMenu === "Ledger" ? "bg-active" : ""}`}>
                    <a   onClick={() => {setDropdownOpen3(!dropdownOpen3); setActiveMenu("Ledger");}} className={`md:flex py-2  md:flex-row flex flex-col gap-2 items-center `}>
                      <ReceiptLongIcon className="text-yellow-600" />
                      <b className="md:text-lg text-xs font-medium text-white">
                        Ledger
                      </b>{" "}
                      <i className="fa fa-caret-down text-white" />
                    </a>
                   { dropdownOpen3 ?  <div
                      className="dropdown-menuf bg-neutral-700 md:pl-2"
                      aria-labelledby="navbarDropdownMenuLink"
                      style={{background:"darkgoldenrod"}}
                    >
                      <li className="border-b pb-2">
                        <CustomLink
                        //  onClick={() => setDropdownOpen3(!dropdownOpen3)}
                        onClick={() => {toggleDrawer() ; setActiveMenu("My");}}
                          to="/my-ledger"
                          className={`dropdown-item border-b ${activeMenu === "My" ? "bg-active" : ""}`}
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            {"My Ledger"}
                          </b>
                        </CustomLink>
                      </li>

                      <li className="border-b pb-2">
                        <CustomLink
                          to="/all-settlement"
                          // onClick={() => setDropdownOpen3(!dropdownOpen3)}
                          onClick={() => {toggleDrawer() ; setActiveMenu("All");}}
                          className={`dropdown-item border-b border-white/30 ${activeMenu === "All" ? "bg-active" : ""}`}
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            All{" "}
                            {userState?.user?.role === RoleType.dl
                              ? "Client"
                              : "Agent"}{" "}
                            Ledger
                          </b>
                        </CustomLink>
                      </li>

                      <li className="border-b pb-2">
                        <CustomLink
                          to="/total-profit"
                          // onClick={() => setDropdownOpen3(!dropdownOpen3)}
                          onClick={() => {toggleDrawer() ; setActiveMenu("Total");}}
                          className={`dropdown-item  border-b border-white/30 ${activeMenu === "Total" ? "bg-active" : ""}`}

                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            Total Profit
                          </b>
                        </CustomLink>
                      </li>

                      <li className="pb-2">
                        <CustomLink
                          to="/ledger-client"
                          // onClick={() => setDropdownOpen3(!dropdownOpen3)}
                          onClick={() => {toggleDrawer() ; setActiveMenu("ALedger");}}
                          className={`dropdown-item ${activeMenu === "ALedger" ? "bg-active" : ""}`}
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            {userState?.user?.role === RoleType.dl
                              ? "Client"
                              : "Agent"}{" "}
                            Ledger
                          </b>
                        </CustomLink>
                      </li>

                      {userState?.user?.role === "dl" ? (
                        <li>
                          <CustomLink
                          //  onClick={() => setDropdownOpen3(!dropdownOpen3)}
                          onClick={() => {toggleDrawer() ; setActiveMenu("Comm");}}
                            to="/commision-len-den"
                            className={`dropdown-item ${activeMenu === "Comm" ? "bg-active" : ""}`}
                            >
                            <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                              <ListIcon className="text-yellow-600" />
                              {"कमीशन लेन देन"}
                            </b>
                          </CustomLink>
                        </li>
                      ) : (
                        ""
                      )}

                      {/* {userState?.user?.role === RoleType.admin && (
                        <li>
                          <CustomLink
                            onClick={toggleDrawer}
                            to="/unsettledbet/deleted"
                            className="dropdown-item"
                          >
                            <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                              <ListIcon className="text-yellow-600" />
                              Deleted Bets
                            </b>
                          </CustomLink>
                        </li>
                      )} */}
                      {/* <li>
                        <a href='greport.html' className='dropdown-item'>
                          <b>General Report</b>
                        </a>
                      </li> */}
                      {/* <li>
                        <CustomLink
                          to="/game-reports"
                          className="dropdown-item"
                        >
                          <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                            <ListIcon className="text-yellow-600" />
                            Game Reports
                          </b>
                        </CustomLink>
                      </li> */}
                      {/* <li>
                        <CustomLink to='/profitloss' className='dropdown-item'>
                          <b className='text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1'><ListIcon className='text-yellow-600' />Profit And Loss</b>
                        </CustomLink>
                      </li> */}
                    </div> :""}
                  </li>
                  {/* 
                  <li className='nav-item dropdown'>
                    <a>
                      <b>Transactions</b> <i className='fa fa-caret-down' />
                    </a>
                    <ul className='dropdown-menu' aria-labelledby='navbarDropdownMenuLink'>
                      <li>
                        <CustomLink to='/depositstatement' className='dropdown-item'>
                          <b>{"Deposit"}</b>
                        </CustomLink>
                      </li>
                      <li>
                        <CustomLink to='/withdrawstatement' className='dropdown-item'>
                          <b>Withdraw</b>
                        </CustomLink>
                      </li>
                    </ul>
                  </li> */}

                  {/* <li className="nav-item dropdown border-b md:w-60">
                    <a className="md:flex md:flex-row flex flex-col gap-2 items-center ">
                      <CasinoIcon className="text-yellow-600" />
                      <b className="md:text-lg text-xs font-medium text-white">
                        Sports Detail
                      </b>{" "}
                      <i className="fa fa-caret-down text-white" />
                    </a>
                    <ul
                      className="dropdown-menu mt-4"
                      aria-labelledby="navbarDropdownMenuLink"
                      style={{ height: "400px", overflowY: "scroll" }}
                    >
                      {gameList?.length > 0 &&
                        gameList.map((Item: any, key: number) => {
                          return (
                            <li key={key}>
                              <CustomLink
                                onClick={toggleDrawer}
                                to={`/casino/${Item.slug}`}
                                className="dropdown-item"
                              >
                                <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
                                  <ListIcon className="text-yellow-600" />
                                  {Item.title}
                                </b>
                              </CustomLink>
                            </li>
                          );
                        })}
                    </ul>
                  </li> */}

                  {userState?.user?.role === RoleType.admin && (
                    <li className={`nav-item dropdown border-b md:w-60 w-fit ${activeMenu === "Setting" ? "bg-active" : ""}`}>
                      <a onClick={() => {setDropdownOpen4(!dropdownOpen4); setActiveMenu("Setting");}} className="md:flex py-2  md:flex-row flex flex-col gap-1 items-center">
                        <SettingsIcon className="text-yellow-600" />
                        <b className="md:text-lg text-xs font-medium text-white">
                          Settings
                        </b>{" "}
                        <i className="fa fa-caret-down text-white" />
                      </a>
                     { dropdownOpen4 ? <div
                        className="dropdown-menud bg-none  md:pl-2"
                        aria-labelledby="navbarDropdownMenuLink"
                        // style={{background:"#424242"}}
                      >
                        {userState?.user?.role === RoleType.admin && (
                          <>
                            {/* <li>
                              <CustomLink
                                onClick={toggleDrawer}
                                to="/messages"
                                className="dropdown-item"
                              >
                                <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
                                  <TuneIcon className="text-yellow-600" />
                                  {"Messages"}
                                </b>
                              </CustomLink>
                            </li> */}
                            <li>
                              <CustomLink
                                // onClick={() => setDropdownOpen4(!dropdownOpen4)}
                                onClick={() => {toggleDrawer() ; setActiveMenu("Adm");}}
                                to={"/matches/4"}
                                className={`dropdown-item ${activeMenu === "Adm" ? "bg-active" : ""}`}
                              >
                                <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
                                  <TuneIcon className="text-yellow-600" />
                                  Add Match List
                                </b>
                              </CustomLink>
                            </li>

                            <li>
                              <CustomLink
                                //  onClick={() => setDropdownOpen4(!dropdownOpen4)}
                                onClick={() => {toggleDrawer() ; setActiveMenu("CS");}}
                                to='/casino-list'
                                className={`dropdown-item ${activeMenu === "CS" ? "bg-active" : ""}`}
                              >
                                <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
                                  <TuneIcon className="text-yellow-600" />
                                  Casino List
                                </b>
                              </CustomLink>
                            </li>


                            <li>
                              <CustomLink
                                // onClick={() => setDropdownOpen4(!dropdownOpen4)}
                                // to="/sports-list/active-matches"
                                onClick={() => {toggleDrawer() ; setActiveMenu("BM");}}
                                to="/active-matches/4"
                                className={`dropdown-item ${activeMenu === "BM" ? "bg-active" : ""}`}
                              >
                                <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
                                  <TuneIcon className="text-yellow-600" />
                                  {"Block Markets"}
                                </b>
                              </CustomLink>
                            </li>

                            <li>
                              <CustomLink
                                // onClick={() => setDropdownOpen4(!dropdownOpen4)}
                                onClick={() => {toggleDrawer() ; setActiveMenu("DB");}}
                                to="/unsettledbet"
                                className={`dropdown-item ${activeMenu === "DB" ? "bg-active" : ""}`}
                              >
                                <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                                  <DeleteIcon className="text-yellow-600" />
                                  Deleted Bets
                                </b>
                              </CustomLink>
                            </li>


                            <li>
                          <CustomLink
                            onClick={toggleDrawer}
                            to="/deleted-bets"
                            className="dropdown-item"
                          >
                            <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                              <ListIcon className="text-yellow-600" />
                              Deleted Bets History
                            </b>
                          </CustomLink>
                        </li>


                            <li>
                              <CustomLink
                                // onClick={() => setDropdownOpen4(!dropdownOpen4)}
                                onClick={() => {toggleDrawer() ; setActiveMenu("NC");}}
                                to="/notice"
                                className={`dropdown-item ${activeMenu === "NC" ? "bg-active" : ""}`}
                              >
                                <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                                  <ListIcon className="text-yellow-600" />
                                  Notice
                                </b>
                              </CustomLink>
                            </li>


                            <li>
                              <CustomLink
                                // onClick={() => setDropdownOpen4(!dropdownOpen4)}
                                onClick={() => {toggleDrawer() ; setActiveMenu("MO");}}
                                to="/manage-odds"
                                className={`dropdown-item ${activeMenu === "MO" ? "bg-active" : ""}`}
                              >
                                <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col items-center gap-1">
                                  <ListIcon className="text-yellow-600" />
                                  Manage Odds
                                </b>
                              </CustomLink>
                            </li>

                            {/* <li>
                              <CustomLink
                                onClick={toggleDrawer}
                                to="/casino-list"
                                className="dropdown-item"
                              >
                                <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
                                  <TuneIcon className="text-yellow-600" />
                                  {"Casino List"}
                                </b>
                              </CustomLink>
                            </li> */}
                          </>
                        )}

                        {/* <li>
      <CustomLink
        onClick={toggleDrawer}
        to="/payment-method"
        className="dropdown-item"
      >
        <b className="text-white md:text-lg text-xs md:flex md:flex-row flex flex-col gap-1 items-center">
          <TuneIcon className="text-yellow-600" />
          {"Payment Method"}
        </b>
      </CustomLink>
    </li> */}

                        {/* <li>
      <CustomLink
        to="/client-ledger"
        className="dropdown-item"
      >
        <b className="text-white md:flex md:flex-row flex flex-col gap-1 items-center">
          <TuneIcon className="text-yellow-600" />
          {"Client Ledger"}
        </b>
      </CustomLink>
    </li> */}
                      </div> : ""}
                    </li>
                  )}
                  <li className={`nav-item border-b md:w-60 w-fit ${activeMenu === "Report" ? "bg-active" : ""} `}>
                    <CustomLink
                      // onClick={toggleDrawer}
                      onClick={() => { toggleDrawer(); setActiveMenu("Report");}}
                      
                      className="md:flex gap-2 py-2 md:flex-row flex flex-col items-center"
                      to={"/all-client-report"}
                    >
                      <LocalOfferIcon className="text-yellow-600 " />
                      <b className="md:text-lg text-xs font-medium text-white">
                        All{" "}
                        {userState?.user?.role === RoleType.dl
                          ? "Client"
                          : "Agent"}{" "}
                        Report
                      </b>
                    </CustomLink>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>

        {/* <Marqueemessge message={userMessage}></Marqueemessge> */}
      </header>

      {/* <Drawer open={isOpen} onClose={toggleDrawer} direction='left'>
        <div className='drawer-header'>
          <img src='/imgs/logo.png' className='wd-100' />
        </div>
        <div className='drawer-content'>
          <Tree
            loadData={onLoadData}
            treeData={treeData}
            onSelect={(selectedKeys, e) => {
              selectExpend(e.node)
            }}
          />
        </div>

        




      </Drawer> */}
    </>
  );
};
export default Header;
