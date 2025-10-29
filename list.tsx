import React, {
  ,
} from "react";
import { useParams, useSearchParams } from "react-router-dom";
import userService from "../../../services/user.service";
import { AxiosResponse } from "axios";
import User, { RoleName, RoleType } from "../../../models/User";
import "react-toastify/dist/ReactToastify.css";
import { CustomLink } from "../../../pages/_layout/elements/custom-link";
import { useWebsocketUser } from "../../../context/webSocketUser";
import { useAppSelector } from "../../../redux/hooks";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import {
  CloseButton,
} from "react-bootstrap";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";

const ListClients = () => {
  const ref: any = React.createRef();
  const userState = useAppSelector(selectUserData);
  const [page, setPage] = React.useState(1);

  const [users, setUserList] = React.useState<{
    items: User[];
    totalPages?: number;
  }>();
  const [usersTotal, setUserListTotal] = React.useState<any>({
    totalcr: 0,
    totalbalance: 0,
    clientpl: 0,
    exposer: 0,
    totalExposer: 0,
    avl: 0,
  });
  const { socketUser } = useWebsocketUser();
  const { username } = useParams();
  const [searchParams] = useSearchParams();
 
    React.useState<string>(searchClient);
  const [selectAll, setSelectAll] = React.useState(false);
  const [activeDeactive, setActiveDeactive] = React.useState(true);

  const [showDialog, setDialog] = React.useState<{
    d?: boolean;
    p?: boolean;
    s?: boolean;
    w?: boolean;
    e?: boolean;
    gs?: boolean;
  }>({
    d: false,
    p: false,
    s: false,
    w: false,
    e: false,
    gs: false,
  });

  const [show, setShow] = React.useState(false);


  const [searchObj, setSearchObj] = React.useState<any>({
    type: "",
    username: "",
    status: "",
    search: "",
  });

  // const [expandedUserId, setExpandedUserId] = React.useState<string | null>(null); // Track expanded user ID
  const [expandedUserId, setExpandedUserId] = React.useState<string | null>(
    null
  )
 




  React.useEffect(() => {
    const search = searchParams.get("search") ? searchParams.get("search") : "";
    getList({ username: username!, search: search!, type: "" });
    setPage(1);
  }, [username, searchParams.get("search"), callbacklist]);

  React.useEffect(() => {
    clientlistdata(users);
  }, [users]);




 

  const getList = (obj: {
    username: string;
    type: string;
    search: string;
    status?: string;
    page?: number;
  }) => {
    if (!obj.page) obj.page = 1;
    userService.getUserList(obj).then((res: AxiosResponse<any>) => {
      setSearchObj(obj);
      console.log(res.data.data);
      setUserList(res.data.data);
      clientlistdata(res.data.data.items);
    });
  };

  /***** UPDATE USER AND BAT STATUS ****/

  const updateStatus = (itemIndex: number, value: any, type: string) => {
    const updateListOfItems =
      users && users.items.length > 0 ? [...users.items] : [];
    const item = updateListOfItems[itemIndex];
    type === "user" ? (item.isLogin = value) : (item.betLock = value);
    setUserList({ ...users, items: updateListOfItems });

  
  };




  
  
  const newtype = useParams().type
  console.log(newtype, "newtype get")

  const clientlistdata = (userd: any) => {
    let objTotal: any = {
      totalcr: 0,
      totalbalance: 0,
      clientpl: 0,
      exposer: 0,
      totalExposer: 0,
      avl: 0,
    };
    if (userd) {
      userd.items
        ?.filter((user: User) =>  user.isLogin === activeDeactive)
        ?.map((user: User) => {
          const balance: any = mainBalance(user);
          const casinoexposer: any =
            user && user.balance && user.balance.casinoexposer
              ? user.balance.casinoexposer
              : 0;
          const exposer: any =
            user && user.balance && user.balance.exposer
              ? user.balance.exposer + +casinoexposer
              : 0 + +casinoexposer;
          const mainbalance: any =
            user && user.balance && user.balance.balance
              ? user.balance.balance
              : 0;
          const totalcr =
            objTotal.totalcr +
            +(user && user.creditRefrences ? user.creditRefrences : 0);
          const totalbalance: number = objTotal.totalbalance + +balance;
          const clientpl: number = objTotal.clientpl + +getclientpl(user);
          const totalExposer: number = objTotal.totalExposer + +exposer;
          const avl: number = objTotal.avl + +(mainbalance - exposer);

          objTotal = {
            ...objTotal,
            ...{ totalbalance, totalcr, clientpl, exposer, totalExposer, avl },
          };
        });
    }
    setUserListTotal(objTotal);
  };


  



 

 




  return (
    <>
      <div className="container-fluid">
       
        <div className="row">
          <div className="col-md-12 main-container">
            <div className="listing-grid">
            
              <div
                style={{ overflowY: "auto" }}
                className="table-responsive data-table h-screen "
                ref={ref}
              >
                <table
                  id="clientListTable"
                  className="table table-striped  table-bordered relative-btn "
                  style={{ width: "100%" }}
                >
                  <thead>
                    <tr>
                      

                      {/* <th className="noExport">U St</th> */}
                      <th className="noExport">B St</th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Password</th>

                      {/* <th>SuperShare Limit</th> */}
                      <th>Current</th>
                      {/* <th>Client (P/L)</th> */}
                      <th>Engaged</th>
                      {/* <th>Available Balance</th> */}

                      {/* <th>Engaged</th> */}
                      <th>Match %</th>
                      <th>Session %</th>
                      <th>Share %</th>


                      <th>Account Type</th>
                      {/* <th className="noExport">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {/* <th className="noExport"></th> */}
                       {/* for user lock */}
                      <th className="noExport"></th>
                      <th>Total</th>
                      <th></th>
                      <th></th>

                      {/* <th>{usersTotal.totalcr.toFixed(2)}</th> */}
                      <th>{usersTotal.totalbalance.toFixed(2)}</th>
                      {/* <th>{usersTotal.clientpl.toFixed(2)}</th> */}
                      <th>{usersTotal.totalExposer.toFixed(2)}</th>
                      {/* <th>{usersTotal.avl.toFixed(2)}</th> */}

                      <th></th>
                      {/* <th></th> */}
                      <th></th>
                      <th></th>

                      <th></th>
                      <th className="noExport"></th>
                    </tr>
                    {users?.items?.map((user: User, index: number) => {
                      if (
                        activeDeactive !== user.isLogin &&
                        user.role !== RoleType.admin 
                      )
                        return null;
                      return (
                        <tr key={user._id}>
                          

                         

                          <td className="hidden">
                            {user.role !== RoleType.admin && (
                              <span
                                onClick={() =>
                                  updateStatus(index, !user?.isLogin, "user")
                                }
                                style={{ cursor: "pointer" }}
                              >
                                {user?.isLogin ? (
                                  <LockOpenIcon />
                                ) : (
                                  <LockIcon />
                                )}
                              </span>
                            )}
                          </td>

                          <td>
                            {user.role !== RoleType.admin && (
                              <span
                                onClick={() =>
                                  updateStatus(index, !user?.betLock, "bet")
                                }
                                style={{ cursor: "pointer" }}
                              >
                                {user?.betLock ? (
                                  <LockOpenIcon style={{backgroundColor:"green", color:"white" ,borderRadius:"2px", padding:"2px"}} />
                                ) : (
                                  <LockIcon style={{backgroundColor:"red", color:"white" ,borderRadius:"2px", padding:"2px"}} />
                                )}
                              </span>
                            )}
                          </td>

                          <td>
                            {user.role !== RoleType.user && (
                              <CustomLink to={`/list-clients/${user.username}`}>
                                <p className="normal-case">{user.username}</p>
                              </CustomLink>
                            )}
                            {user.role === RoleType.user && (
                              <a className="bg-success normal-case ">
                                {user.username}
                              </a>
                            )}

                            <button
                              className=""
                              onClick={() => user._id && handleToggle(user._id)}
                            >
                              <ArrowDropDownIcon />
                            </button>
                            <div
                              className={`actions-td ${
                                expandedUserId === user._id ? "open" : ""
                              }`}
                              ref={modalRef}
                            >
                              <p className="bg-gray-800 text-white p-2">
                                Action for the user - {user.username}
                              </p>
                              <button
                                className="closed bg-gray-800 text-white"
                                onClick={() =>
                                  user._id && handleToggle(user._id)
                                }
                              >
                                <CloseButton className="text-white" />
                              </button>
                          
                            </div>
                          </td>

                          <td></td>
                          <td>******</td>

                         
                          <td>{mainBalance(user)}</td>
                         
                          <td>{finalExposer(user?.balance)}</td>
                         

                          {/* <td>{user.exposerLimit ? user.exposerLimit : 0}</td> */}
                          <td>{getcurrentpartnership(user)}</td>
                          <td>{getcurrentpartnershipsession(user)}</td>
                          <td>{user?.share}</td>


                          <td>{RoleName[user.role!]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            

           

          
          </div>
        </div>
      </div>
    </>
  );
};
export default ListClients;
