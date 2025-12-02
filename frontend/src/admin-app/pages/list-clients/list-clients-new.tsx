import React, {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { useParams, useSearchParams } from "react-router-dom";
import userService from "../../../services/user.service";
import { AxiosResponse } from "axios";
import User, { RoleName, RoleType } from "../../../models/User";
import UserService from "../../../services/user.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DepositModal from "./modals/DepositModal";
import StatusModal from "./modals/StatusModal";
import WithdrawModal from "./modals/WithdrawModal";
import PasswordModal from "./modals/PasswordModal";
import ExposureCreditModal from "./modals/ExposureCreditModal";
import { CustomLink } from "../../../pages/_layout/elements/custom-link";
import { useWebsocketUser } from "../../../context/webSocketUser";
import Pdf from "react-to-pdf";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import moment from "moment";
import { useAppSelector } from "../../../redux/hooks";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import GeneralSettingsModal from "./modals/GeneralSettingsModal";
import Modal from "react-modal";
import {
  Container,
  Form,
  Modal as BModal,
  Row,
  CloseButton,
} from "react-bootstrap";
import { selectLoader } from "../../../redux/actions/common/commonSlice";
import SubmitButton from "../../../components/SubmitButton";
import { debounce } from "lodash";
import betService from "../../../services/bet.service";
import ReactPaginate from "react-paginate";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BorderColorIcon from "@mui/icons-material/BorderColor";

import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

import LockOpenIcon from "@mui/icons-material/LockOpen";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import DeleteModal from "./modals/DeleteModal";
import WalletIcon from "@mui/icons-material/Wallet";
import { ClassNames } from "@emotion/react";
import EngageModal from "./modals/EngageModel";
import accountService from "../../../services/account.service";



const ListClients = () => {
  const ref: any = React.createRef();
  const userState = useAppSelector(selectUserData);
  const loading = useAppSelector(selectLoader);
  const [page, setPage] = React.useState(1);

  const urole = userState?.user?.role;

  console.log(urole, "remove share");

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
  const [userbook, setUserBook] = React.useState<any>(false);
  const { username, search } = useParams();
  const [searchParams] = useSearchParams();
  const [depositUser, setDepositUser] = React.useState<User>({} as User);
  const [userBookData, setUserBookData] = React.useState<any>({});
  const [modalType, setModalType] = React.useState("EXP");
  const [callbacklist, setcallbacklist] = React.useState(false);
  const [txnPassword, setTxnPassword] = React.useState("");
  const [searchClient, setSearchClient] = React.useState("");
  const [debouncedValue, setDebouncedValue] =
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
    dt?: boolean;
  }>({
    d: false,
    p: false,
    s: false,
    w: false,
    e: false,
    gs: false,
    dt: false,
  });

  const [show, setShow] = React.useState(false);

  const [lockshow, setLockshow] = React.useState(false);

  const [searchObj, setSearchObj] = React.useState<any>({
    type: "",
    username: "",
    status: "",
    search: "",
  });

  // const [expandedUserId, setExpandedUserId] = React.useState<string | null>(null); // Track expanded user ID
  const [expandedUserId, setExpandedUserId] = React.useState<string | null>(
    null
  ); // Track expanded user ID

  const modalRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  console.log(users, "userdata");
  const newtype = useParams().type;
  console.log(newtype, "newtype get");

  const upper: any = {
    sadmin: { first: "Super", second: "SubAdmin" },
    suadmin: { first: "SubAdmin", second: "Admin" },
    smdl: { first: "Admin", second: "Master" },
    mdl: { first: "Master", second: "Agent" },
    dl: { first: "Super", second: "Agent" },
  }[newtype || "dl"]; // default to 'dl' if undefined

  // console.log(useParams(), "my all params")

  // Close modal when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setExpandedUserId(null); // Close modal
      }
    };

    // Add event listener to document
    // document.addEventListener('click', handleOutsideClick);

    // Clean up event listener on unmount
    return () => {
      // document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const handleToggle = (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null); // Close if already open
    } else {
      setExpandedUserId(userId); // Open the selected user’s td
    }
  };

  const roles = React.useMemo(() => {
    const { user } = userState;
    const allOptions = Object.keys(RoleType);
    const startIndex = allOptions.indexOf(user.role!);
    return allOptions.slice(startIndex + 1).filter((role) => role !== "admin");
  }, [userState]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  React.useEffect(() => {
    Modal.setAppElement("body");
    const ac = new AbortController();
    return () => ac.abort();
  }, []);

  React.useEffect(() => {
    setSearchObj({ ...searchObj, username: username! });
  }, [username]);

  React.useEffect(() => {
    const search = searchParams.get("search") ? searchParams.get("search") : "";
    getList({ username: username!, search: search!, type: "" });
    setPage(1);
  }, [username, searchParams.get("search"), callbacklist]);

  React.useEffect(() => {
    clientlistdata(users);
  }, [users]);

  const handlePageClick = (event: any) => {
    //
    setPage(event.selected + 1);
    getList({ ...searchObj, page: event.selected + 1 });
  };

  const openModal = (type: string) => {
    const types = { ...showDialog, [type]: true };
    setcallbacklist(false);
    setDialog(types);
  };

  const closeModal = (type: string) => {
    const types = { ...showDialog, [type]: false };
    setDialog(types);
  };

  const refreshClientList = (type: boolean) => {
    setcallbacklist(type);
  };

  const getUserDetail = (user: any) => {
    const username = user.username;
    console.log(username, "get user detail");
    UserService.getParentUserDetail(username).then(
      (res: AxiosResponse<any>) => {
        setDepositUser(res.data.data[0]);
      }
    );
  };

  const getList = (obj: {
    username: string;
    type: string;
    search: string;
    status?: string;
    page?: number;
  }) => {
    if (!obj.page) obj.page = 1;
    userService.getUserList2(obj).then((res: AxiosResponse<any>) => {
      setSearchObj(obj);
      console.log(res.data.data.items, "first data ");
      setUserList(res.data.data);
      clientlistdata(res.data.data.items);
    });
  };

  /***** UPDATE USER AND BAT STATUS ****/

  const updateStatus = (itemIndex: number, value: any, type: string) => {
    const updateListOfItems =
      users && users.items.length > 0 ? [...users.items] : [];
    const item = updateListOfItems[itemIndex];
    if (type === "user") {
      item.isLogin = value;
    } else if (type === "bet") {
      item.betLock = value;
    } else if (type === "bet2") {
      item.betLock2 = value;
    }
    // type === "user" ? (item.isLogin = value) : (item.betLock = value);
    setUserList({ ...users, items: updateListOfItems });
    const formData = {
      isUserActive: item.isLogin ? item.isLogin : false,
      isUserBetActive: item.betLock ? item.betLock : false,
      isUserBet2Active: item.betLock2 ? item.betLock2 : false,
      username: item.username,
      single: true,
    };

    UserService.updateUserAndBetStatus(formData)
      .then(() => {
        closeModal("s");
        toast.success("Status Updated Successfully");
      })
      .catch((e) => {
        const error = e.response.data.message;
        toast.error(error);
      });
  };

  /******** UPDATE LIST DATA ********/

  const updateListUser = (user: User) => {
    // if (user.balance) {
    //   console.log(user)
    //   const updateListOfItems = [...users]
    //   const index = updateListOfItems.findIndex((u) => u.username === user.username)
    //   updateListOfItems[index].balance = user.balance
    //   //updateListOfItems[index].profitLoss = user.amount
    //   clientlistdata(updateListOfItems)
    //   setUserList(updateListOfItems)
    // }
    getList({ ...searchObj, search: "false" });
  };
  const logOutAllUsers = () => {
    socketUser.emit("logoutAll");
  };
  const exportExcel = () => {
    // export pdf
    const usersData = users?.items.map((user) => {
      const {
        username,
        creditRefrences,
        balance,
        isLogin,
        betLock,
        exposerLimit,
        role,
      } = user;
      return {
        Username: username,
        "Credit Refrences": creditRefrences,
        Balance: balance?.balance.toFixed(2),
        "Client Pnl": getclientpl(user),
        Exposer: balance?.exposer?.toFixed(2),
        "Available Balance": (
          (balance?.balance || 0) - (balance?.exposer || 0)
        ).toFixed(2),
        "Is Login": isLogin,
        "Bet Lock": betLock,
        "Exposer Limit": exposerLimit,
        Percentage: 0,
        Role: RoleName[role!],
      };
    });
    exportToExcel(usersData);
  };

  const setuserresponse = () => {
    if (!userbook) {
      userService.getUserBook().then((res: AxiosResponse<any>) => {
        setUserBook(true);
        setUserBookData(res.data.data);
      });
    } else {
      setUserBook(false);
    }
  };

  const getclientpl = (row: any) => {
    const clientpl = row.balance?.profitLoss || 0;
    // if (row) {
    //   clientpl = (parseFloat(row?.creditRefrences) - parseFloat(row?.balance?.balance)).toFixed(2)
    // }
    return clientpl;
  };

  const exportToExcel = (data: any) => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the data into a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate an Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Convert the Excel buffer to a Blob
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the Blob as a file
    saveAs(blob, `users-${moment().format("MMMM-Do-YYYY-h:mm:ss-a")}.xlsx`);
  };

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
        ?.filter((user: User) => user.isLogin === activeDeactive)
        ?.map((user: User, index: number) => {
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

  const resetTxnPassword = (user: User) => {
    setDepositUser(user);
    handleShow();
  };

  const resetTxnPasswordSubmit = (e: any) => {
    e.preventDefault();
    userService
      .resetTxnPassword({
        userId: depositUser._id,
        transactionPassword: txnPassword,
      })
      .then((res: AxiosResponse) => {
        toast.success(res.data.message);
        handleClose();
      });
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //setSearchClient('')
    getList({ ...searchObj, search: "true" });
  };

  const getcurrentpartnership = (users: any) => {
    const userp = users?.partnership || {};
    const ownration = userp[1] ? userp[1].ownRatio : "0";
    return ownration;
  };

  const getcurrentpartnershipsession = (users: any) => {
    const userp = users?.partnership || {};
    const ownration = userp[2] ? userp[2].ownRatio : "0";
    return ownration;
  };

  const isAdmin = React.useCallback(
    (user: User) => {
      if (
        userState.user.role !== RoleType.admin &&
        userState.user.role !== RoleType.sadmin
      ) {
        return (
          user?.parentStr?.[user?.parentStr?.length - 1] === userState.user._id
        );
      }
      return true;
    },
    [userState]
  );

  const mainBalance = (row: any) => {
    // const creditRef = row?.creditRefrences || 0;
    const clientpl = row.balance?.profitLoss || 0;
    const creditRef = row?.balance?.balance || 0;

    // return (parseFloat(creditRef) + +parseFloat(clientpl))?.toFixed(2);
    return parseFloat(creditRef);
  };


  const mainBalanceUser = (row: any) => {
    // const creditRef = row?.creditRefrences || 0;
    console.log(row, "row balance");
    const clientpl = row.balance?.profitLoss || 0;
    // const creditRef = row?.balance?.balance + row?.balance?.commision || 0;
    const creditRef :any= row?.balance?.balance - row?.balance?.exposer ;



    // return (parseFloat(creditRef) + +parseFloat(clientpl))?.toFixed(2);
    return parseFloat(creditRef);
  };

  const mainBalancechild = (row: any) => {
    const creditRef = row?.creditRefrences || 0;
    // const clientpl = row.balance?.profitLoss || 0;
    const creditb = row?.balance?.balance || 0;
    const profitloss = row?.balance?.profitLoss || 0;

    // return (parseFloat(creditRef) + parseFloat(profitloss) - +parseFloat(creditb))?.toFixed(2);
    return parseFloat(row.childBalance)
  };

  /* Checkbox functionality */
  const handleSelectItem = (user: User) => {
    if (users && users.items.length > 0) {
      const updatedUsers = users.items.map((u) =>
        u === user ? { ...u, selected: !u.selected } : u
      );

      setUserList({ ...users, items: updatedUsers });
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll); // Toggle the state of "Select All" checkbox
    if (users) {
      const updatedHistory = users.items.map((user: User) => ({
        ...user,
        selected: !selectAll,
      }));
      setUserList({ ...users, items: updatedHistory });
    }
  };

  const lock = (
    e: MouseEvent<HTMLAnchorElement>,
    lock: boolean,
    type: string
  ) => {
    e.preventDefault();

    const select = users?.items.reduce((selected: boolean, item: User) => {
      if (item.selected) {
        selected = true;
      }
      return selected;
    }, false);
    if (selectAll || select) {
      const selectedItems: any = users?.items
        .filter((item: User) => item.selected)
        .map((item: User) => item._id);
      if (selectedItems.length > 0 && users) {
        betService
          .usersLockClientList({ ids: selectedItems, lock, type })
          .then((res) => {
            if (res.data.data.success) {
              const updatedUsers = users.items.map((u) => ({
                ...u,
                selected: !u.selected,
                [type === "betLock" ? "betLock" : "isLogin"]: lock,
              }));
              setUserList({ ...users, items: updatedUsers });
              setSelectAll(false);
              toast.success(res.data.message);
            }
          });
      }
    } else {
      toast.error("Please select one item");
    }
  };

  const onSearch = (e: string) => {
    if (e) getList({ username: e, search: "true", type: "" });
    else if (username)
      getList({ username: username, search: "false", type: "" });
    else getList({ username: "", search: "false", type: "" });
  };

  const typesOfClients = (e: MouseEvent<HTMLAnchorElement>, status: string) => {
    e.preventDefault();
    setActiveDeactive(status === "true");
    getList({ username: username!, search: "false", type: "", status });
  };

  const debouncedChangeHandler = React.useCallback(debounce(onSearch, 500), [
    username,
  ]);
  const finalExposer = (userB: any) => {
    const ex = userB?.exposer?.toString() || "0";
    const cex = userB?.casinoexposer?.toString() || "0";
    console.log(ex);
    const finalE = parseFloat(ex) + +parseFloat(cex);
    return finalE.toFixed(2);
  };


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
        [RoleType.admin]: [RoleType.sadmin,],
        [RoleType.sadmin]: [RoleType.suadmin],
        [RoleType.suadmin]: [RoleType.smdl,],
  
        [RoleType.smdl]: [RoleType.mdl,],
        [RoleType.mdl]: [RoleType.dl,],
        [RoleType.dl]: [RoleType.user],
        [RoleType.user]: [],
      };
  
      const allowedRoles = roleMap[userRole] || [];
  
      return allowedRoles.map((key) => ({
        key,
        label: allRoles[key],
      }));
    };

  console.log( getRoleOptions, "getrkollee")

  const unnmae = useParams().username;
   const [engageModalOpen, setEngageModalOpen] = useState(false);
    const [engageRows, setEngageRows] = useState<
      { matchName: string; exposure: number; date: string }[]
    >([]);
  return (
    <>
      <div style={{}} className="container-fluid">
        {/* <div className="row">
          <div className="master-balance">
            <div
              className="text-center"
              onClick={() => {
                setuserresponse();
              }}
            >
              <span
                className="far fa-arrow-alt-circle-down"
                id="user-balance"
              />
              <span className="far fa-arrow-alt-circle-up" />
            </div>
            {userbook && (
              <div
                className="master-balance-detail m-t-20"
                id="master-balance-detail"
              >
                <div className="master-balance">
                  <div
                    className="master-balance-detail m-t-20"
                    id="master-balance-detail"
                  >
                    <ul className="row">
                      <li className="col-md-4">
                        <label className="col-md-8 text-left  p-0">
                          Upper Level Credit Referance:
                        </label>
                        <span className="text-right col-md-4  p-0">
                          {userBookData.uplevelcr?.toFixed(2)}
                        </span>
                      </li>
                      <li className="col-md-4">
                        <label className="col-md-8 text-left p-0">
                          Down level Occupy Balance:
                        </label>
                        <span className="text-right col-md-4  p-0">
                          {userBookData.downlineob?.toFixed(2)}
                        </span>
                      </li>
                      <li className="col-md-4">
                        <label className="col-md-8 text-left p-0 ">
                          Down Level Credit Referance:
                        </label>
                        <span className="text-right col-md-4  p-0">
                          {userBookData.downcr?.toFixed(2)}
                        </span>
                      </li>
                      <li className="col-md-4">
                        <label className="col-md-8 text-left p-0">
                          Total Master Balance
                        </label>
                        <span className="text-right col-md-4 p-0">
                          {userBookData.totalmasterb?.toFixed(2)}
                        </span>
                      </li>
                      <li className="col-md-4">
                        <label className="col-md-8 text-left p-0">
                          Upper Level:
                        </label>
                        <span className="text-right col-md-4 p-0">
                          {userBookData.upperlvell?.toFixed(2)}
                        </span>
                      </li>
                      <li className="col-md-4">
                        <label className="col-md-8 text-left p-0">
                          Down Level Profit/Loss :
                        </label>
                        <span className="text-right col-md-4 p-0">
                          {userBookData.downpl?.toFixed(2)}
                        </span>
                      </li>
                      <li className="col-md-4">
                        <label className="col-md-8 text-left p-0">
                          Available Balance:
                        </label>
                        <span className="text-right col-md-4 p-0">
                          {userBookData.availableB?.toFixed(2)}
                        </span>
                      </li>
                      <li className="col-md-4">
                        <label className="col-md-8 text-left p-0">
                          Available Balance With Profit/Loss:
                        </label>
                        <span className="text-right col-md-4 p-0">
                          {userBookData.avpl?.toFixed(2)}
                        </span>
                      </li>
                      <li className="col-md-4">
                        <label className="col-md-8 text-left p-0">
                          My Profit/Loss:
                        </label>
                        <span className="text-right col-md-4 p-0">
                          {userBookData.mypl?.toFixed(2)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div> */}
        <div className="row">
          <div className="col-md-12 main-container">
            <div  className="listing-grid">
              <div className="detail-row ">
                <div className=" row">
                  <div className="col-md-8 ">
                    <div className="">
                      {/* <h2 className="d-inline-block">Account List</h2> */}
                      <p>
                        {/* {(userState.user.role == RoleType.admin ||
                          userState.user.role == RoleType.sadmin) && (
                          <button
                            type="submit"
                            onClick={logOutAllUsers}
                            className="btn btn-primary mb-2"
                          >
                            Logout All Users
                          </button>
                        )} */}

                        {/* <button
                          type="submit"
                          onClick={exportExcel}
                          className="btn btn-small bg-green mrc-5 mlc-5"
                        >
                          Excel
                        </button> */}
                        {/* 
                        <Pdf
                          targetRef={ref}
                          filename={`users-${moment().format(
                            "MMMM-Do-YYYY-h:mm:ss-a"
                          )}.pdf`}
                        >
                          {({ toPdf }: any) => (
                            <button
                              className="btn btn-small bg-red"
                              onClick={toPdf}
                            >
                              PDF
                            </button>
                          )}
                        </Pdf> */}
                      </p>
                    </div>
                    {/* <Form onSubmit={handleSearch} className='col-md-4 row'>
                      <div className='col-md-6'>
                        <Form.Label htmlFor='user-type'>Select Type</Form.Label>
                        <Form.Select
                          className='mx-input'
                          onChange={(e) => setSearchObj({ ...searchObj, type: e.target.value })}
                          id='user-type'
                          aria-label='Default select example'
                        >
                          <option>Select Type</option>
                          {roles.map((role: any) => (
                            <option key={role} value={role}>
                              {RoleName[role]}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className='col-md-6'>
                        <Form.Label>&nbsp;</Form.Label>
                        <SubmitButton className='btn btn-primary form-group w-100'>
                          Search
                        </SubmitButton>
                      </div>
                    </Form>
                    <div className='col-md-3'>
                      <Form.Label>&nbsp;</Form.Label>
                      <Dropdown>
                        <Dropdown.Toggle variant='primary' id='dropdown-basic'>
                          User Action
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            href='#'
                            onClick={(e: MouseEvent<HTMLAnchorElement>) =>
                              lock(e, false, 'betLock')
                            }
                          >
                            Bet Lock
                          </Dropdown.Item>
                          <Dropdown.Item
                            href='#'
                            onClick={(e: MouseEvent<HTMLAnchorElement>) => lock(e, true, 'betLock')}
                          >
                            Bet Unlock
                          </Dropdown.Item>
                          <Dropdown.Item
                            href='#'
                            onClick={(e: MouseEvent<HTMLAnchorElement>) =>
                              lock(e, false, 'loginLock')
                            }
                          >
                            Login Lock
                          </Dropdown.Item>
                          <Dropdown.Item
                            href='#'
                            onClick={(e: MouseEvent<HTMLAnchorElement>) =>
                              lock(e, true, 'loginLock')
                            }
                          >
                            Login unlock
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div> */}

                    {/* <div className='col-md-2'>
                      <Form.Label>&nbsp;</Form.Label>
                      <button className='btn btn-primary form-group w-100'>Bet Lock</button>
                    </div> */}
                  </div>
                  <div className="float-right   col-md-4 grid gap-2 ">
                   

                      <p className="text-right">
                        {username ? (
                          <CustomLink
                            to={`/add-user/${username}/${newtype}`}
                            className="btn btn-diamond"
                          >
                            <PersonAddIcon /> Create
                          </CustomLink>
                        ) : (
                          <CustomLink
                            to={`/add-user/${newtype}`}
                            className="btn btn-diamond"
                          >
                            <PersonAddIcon /> Create
                          </CustomLink>
                        )}
                      </p>

                  

                    <div className="flex item-center gap-1">
                      <input
                        type="text"
                        placeholder="Search"
                        className="mx-input mt-"
                        onChange={(e) => debouncedChangeHandler(e.target.value)}
                      />
                      <button
                        className="btn btn-primar border   "
                        style={{ backgroundColor: "#1d2d3d", color: "#fff" }}
                      >
                        Search
                      </button>

                      <button
                        className="btn btn-primar border   "
                        style={{ backgroundColor: "#dc3545", color: "#fff" }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div>dsdff
              {getRoleOptions().map((role) => (
                         
                              <>{role.key}</>
                        
                      ))}
              </div> */}
              {/* <ul className="nav nav-tabs">
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeDeactive ? "active" : ""}`}
                    aria-current="page"
                    href="#"
                    onClick={(e) => typesOfClients(e, "true")}
                  >
                    Active
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${!activeDeactive ? "active" : ""}`}
                    href="#"
                    onClick={(e) => typesOfClients(e, "false")}
                  >
                    Deactive
                  </a>
                </li>
              </ul> */}
              <div
                style={{ overflowY: "scroll", paddingBottom:"50vh" }}
                className="table-responsive data-table "
                ref={ref}
              >
                <table
                  id="clientListTable"
                  className="table table-striped  table-bordered  "
                  style={{ width: "100%" }}
                >
                  <thead>
                    <tr role="row">
                      <th colSpan={2} rowSpan={1}></th>
                      <th colSpan={4} rowSpan={1}></th>

                      {urole == "dl" || newtype === "user" ? (
                        ""
                      ) : (
                        <th
                          colSpan={2}
                          className="text-center navbar-bet99 text-dark"
                          rowSpan={1}
                        >
                          Share{" "}
                        </th>
                      )}

                      <th
                        colSpan={2}
                        className="text-center navbar-bet99 text-dark"
                        rowSpan={1}
                      >
                        {" "}
                        Balance{" "}
                      </th>
                      <th
                        colSpan={2}
                        className="text-center navbar-bet99 text-dark"
                        rowSpan={1}
                      >
                        Commission{" "}
                      </th>
                    </tr>
                    <tr>
                      {/* <th>
                        <input
                          type={'checkbox'}
                          checked={selectAll || false}
                          onChange={handleSelectAll}
                        />
                      </th> */}

                      <th className="noExport">U St</th>
                      {/* <th className="noExport">B St</th> */}
                      {/* <th></th> */}
                      <th></th>

                      <th>Name</th>
                      <th>User</th>
                      <th>Mobile</th>
                      <th>Password</th>

                      {urole !== "dl" && newtype !== "user" && (
                        <th>{upper?.first} Share %</th>
                      )}
                      {urole !== "dl" && newtype !== "user" && (
                        <th>{upper?.second} Share %</th>
                      )}

                      {/* <th>SuperShare Limit</th> */}
                      <th>Current</th>
                      {/* <th>Client (P/L)</th> */}
                      <th>{newtype === "user" ? "Engaged" : "Agent"}</th>
                      {/* <th>Available Balance</th> */}

                      {/* <th>Engaged</th> */}
                      <th>Match %</th>
                      <th>Session %</th>

                      <th>Account Type</th>
                      {/* <th className="noExport">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody style={{marginBottom:"87px"}}>
                    <tr className="hidden">
                      {/* <th className="noExport"></th> */}
                      {/* for user lock */}
                      <th className="noExport"></th>
                      <th className="noExport"></th>
                      <th></th>
                      {/* <th></th> */}
                      {/* <th>Total</th> */}

                      {/* <th></th>
                      <th></th> */}

                      {urole == "dl" || newtype === "user" ? "" : <th></th>}
                      {urole == "dl" || newtype === "user" ? "" : <th></th>}

                      {/* <th>{usersTotal.totalcr.toFixed(2)}</th> */}
                      <th></th>
                      {/* <th>{usersTotal.totalbalance.toFixed(2)}</th> */}

                      {/* <th>{usersTotal.clientpl.toFixed(2)}</th> */}
                      {/* <th>{usersTotal.totalExposer.toFixed(2)}</th> */}
                      <th></th>

                      <th></th>

                      {/* <th>{usersTotal.avl.toFixed(2)}</th> */}

                      <th></th>
                      {/* <th></th> */}
                      <th></th>
                      <th></th>
                      <th></th>

                      <th></th>
                      <th className="noExport"></th>
                    </tr>
                     {/* ?.slice() // create a shallow copy to avoid mutating original */}

                    {users?.items?.sort((a: User, b: User) => {
                      // Sort so that items with betLock === true come first
                      // return (b.betLock ? true : 0) - (a.betLock ? 1 : 0);
                      //@ts-ignore
                      // return (b.betLock === true) - (a.betLock === true);

                      return (b.isLogin === true) - (a.isLogin === true);
                    })
                    ?.map((user: User, index: number) => {
                      const shouldFilterByType =
                        newtype && newtype.trim() !== "";
                        if (shouldFilterByType && user.role !== newtype) {
                          return null;
                        }


                        // if (
                        //   (shouldFilterByType && user.role !== newtype) ||
                        //   (activeDeactive == user.isLogin && activeDeactive !== user.isLogin &&
                        //     user.role !== RoleType.admin)
                        // )
                        //   return null;

                      return (
                        <tr key={user._id}>
                          {/* <td>
                            <input
                              type={'checkbox'}
                              checked={user.selected || false}
                              onChange={() => handleSelectItem?.(user)}
                            />
                          </td> */}

                          {/* <td>
                            {user.role !== RoleType.admin && (
                              <input
                                className="form-control"
                                type="checkbox"
                                name={"U St"}
                                checked={user?.isLogin}
                                onChange={() =>
                                  updateStatus(index, !user?.isLogin, "user")
                                }
                              />
                            )}
                          </td>
                          <td>
                            {user.role !== RoleType.admin && (
                              <input
                                className="form-control"
                                type="checkbox"
                                name={"B St"}
                                checked={user?.betLock}
                                onChange={() =>
                                  updateStatus(index, !user?.betLock, "bet")
                                }
                              />
                            )}
                          </td> */}

                          <td className="">
                            {/* ye hai for login wala jisme admin ko hide rkhta hai aage bhi 3 lock hai total casino crick and login */}
                            {user.role !== RoleType.admin && (
                              <span
                                onClick={() =>
                                  updateStatus(index, !user?.isLogin, "user")
                                }
                                style={{ cursor: "pointer" }}
                              >
                                {user?.isLogin ? (
                                  <LockOpenIcon 
                                  style={{
                                    backgroundColor: "green",
                                    color: "white",
                                    borderRadius: "2px",
                                    padding: "2px",
                                  }} />
                                ) : (
                                  <LockIcon 
                                  style={{
                                    backgroundColor: "red",
                                    color: "white",
                                    borderRadius: "2px",
                                    padding: "2px",
                                  }} />
                                )}
                              </span>
                            )}
                          </td>

                          <td className="hidden">
                            {user.role !== RoleType.admin && (
                              <span
                                // ye hain casino sbke liye superadmin ko toh vese bhi nhi dikhega
                                onClick={() =>
                                  updateStatus(index, !user?.betLock, "bet")
                                }
                                style={{ cursor: "pointer" }}
                              >
                                {user?.betLock ? (
                                  <LockOpenIcon
                                    style={{
                                      backgroundColor: "green",
                                      color: "white",
                                      borderRadius: "2px",
                                      padding: "2px",
                                    }}
                                  />
                                ) : (
                                  <LockIcon
                                    style={{
                                      backgroundColor: "red",
                                      color: "white",
                                      borderRadius: "2px",
                                      padding: "2px",
                                    }}
                                  />
                                )}
                              </span>
                            )}

                            {user.role !== RoleType.admin && (
                              <span
                                className="hidden"
                                // sports ko hide kr rkha hai sbke liye  superadmin ko toh vese bhi nhi dikhega
                                onClick={() =>
                                  updateStatus(index, !user?.betLock2, "bet2")
                                }
                                style={{ cursor: "pointer" }}
                              >
                                {user?.betLock2 ? (
                                  <LockOpenIcon
                                    style={{
                                      backgroundColor: "green",
                                      color: "white",
                                      borderRadius: "2px",
                                      padding: "2px",
                                    }}
                                  />
                                ) : (
                                  <LockIcon
                                    style={{
                                      backgroundColor: "red",
                                      color: "white",
                                      borderRadius: "2px",
                                      padding: "2px",
                                    }}
                                  />
                                )}
                              </span>
                            )}

                            {user.role !== RoleType.user && (
                              <button
                                className="vrx-lock btn btn-warning btn-sm m-0 mt-2 ml-2"
                                data-target="#ViewPartnerShip"
                                data-toggle="modal"
                              >
                                <p>+</p>
                              </button>
                            )}
                          </td>

                          {/* <td>
                            <a
                              className="hover:text-white border-b pb-2"
                              onClick={() => {
                                openModal("d");
                                getUserDetail(user);
                              }}
                            >
                              <WalletIcon />
                            </a>
                          </td> */}

                          <td className="relative-btn" >
                            {" "}
                            <button
                              className=""
                              onClick={() => user._id && handleToggle(user._id)}
                            >
                              <ArrowDropDownIcon className="size-2" />
                            </button>


                            <div
                              className={`actions-td ${
                                expandedUserId === user._id ? "open" : ""
                              }`}
                              // ref={modalRef}
                            >
                              <p className="bg-gray-800 hidden text-white p-2">
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
                              <div className="actions-container  p-4">
                                <a
                                  className="hover:text-white  border-b pb-2"
                                  style={{ color: "#007bff" }}
                                  onClick={() => {
                                    openModal("d");
                                    getUserDetail(user);
                                  }}
                                >
                                  <BorderColorIcon /> Deposit Chips
                                </a>
                                <a
                                  className="border-b pb-2"
                                  style={{ color: "#007bff" }}
                                  onClick={() => {
                                    openModal("w");
                                    getUserDetail(user);
                         
                                  }}
                                >
                                  <BorderColorIcon /> Withdrawl Chips
                                </a>

                                {/* {isAdmin(user) && */}
                                { userState?.user?.role == RoleType.admin && (
                                <a
                                  className="border-b pb-2"
                                  style={{ color: "#28a745" }}
                                  onClick={() => {
                                    openModal("e");
                                    getUserDetail(user);
                                    setModalType("EXP");
                                  }}
                                >
                                  <BorderColorIcon /> Exposer Limit
                                </a>
                                 )}
                                {/* isAdmin(user) && */}
                                {userState?.user?.role == RoleType.admin && (
                                <a
                                  className="border-b  pb-2"
                                  style={{ color: "#28a745" }}
                                  onClick={() => {
                                    openModal("e");
                                    getUserDetail(user);
                                    setModalType("CRD");
                                  }}
                                >
                                  <BorderColorIcon /> Number Limit Withdrawl
                                </a>
                                )}
                                {/* {isAdmin(user) &&
                                  user.role !== RoleType.admin && ( */}
                                <a
                                  className="border-b pb-2"
                                  onClick={() => {
                                    openModal("p");
                                    getUserDetail(user);
                                  }}
                                >
                                  <BorderColorIcon /> Change Password
                                </a>
                                {/* )} */}
                                {/* {isAdmin(user) &&
                                  user.role !== RoleType.admin && ( */}
                                <a
                                  className="border-b pb-2"
                                  style={{ color: "#007bff" }}
                                  onClick={() => {
                                    openModal("s");
                                    getUserDetail(user);
                                  }}
                                >
                                  <BorderColorIcon /> Edit{" "}
                                  {`(${user.username})`}
                                </a>

                                {userState?.user?.role == RoleType.admin && (
                                  <a
                                    onClick={() => {
                                      openModal("dt");
                                      getUserDetail(user);
                                    }}
                                    style={{ color: "red" }}
                                    className={`${user?.role !== RoleType.admin  ? "d-block" : "d-none"}`}
                                  >
                                    <PersonRemoveIcon /> Deactivate{" "}
                                    {`(${user.username})`}
                                  </a>
                                )}

                                {/* )}  */}
                                {userState?.user?.role == RoleType.admin && (
                                <a
                                  className="border-b pb-2"
                                  // style={{ display: "none" }}
                                  onClick={() => {
                                    openModal("gs");
                                    getUserDetail(user);
                                  }}
                                >
                                  <BorderColorIcon /> Min Max Detail
                                </a>
                                )}

                                <CustomLink
                                  to={`/accountstatement/${user?._id}`}
                                  style={{ color: "#1e1e1e" }}
                                  className="border-b pb-2"
                                  onClick={() => {
                                    openModal("");
                                    getUserDetail(user);
                                  }}
                                >
                                  <BorderColorIcon /> Account Statement
                                </CustomLink>


                                <CustomLink
                                  to={`/accountstatement-deposit/${user?._id}`}
                                  style={{ color: "#1e1e1e" }}
                                  className="border-b pb-2"
                                  onClick={() => {
                                    openModal("");
                                    getUserDetail(user);
                                  }}
                                >
                                  <BorderColorIcon /> Limit Update Details
                                </CustomLink>

                                <CustomLink
                                  to={`/operation/${user?.username}`}
                                  style={{ color: "#1e1e1e" }}
                                  className="border-b pb-2"
                                  onClick={() => {
                                    openModal("");
                                    getUserDetail(user);
                                  }}
                                >
                                  <BorderColorIcon /> Account Operation
                                </CustomLink>

                                {lockshow ? (
                                  <div
                                    style={{ width: "100%", height: "100%" }}
                                    className="absolute top-0 left-0 p-1   max-w-mkd bg-white border rounded-md bg-opacity- f z-50"
                                  >
    

                                    <div className="col-12 mb-2 col-md-12 text-center">
                                      <table className="table table-striped  table-bordered  lenden len">
                                        <thead>
                                          <tr>
                                            <td>id</td>
                                            <td>Game</td>
                                            <td>Action</td>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td>1</td>
                                            <td>Casino</td>
                                            <td>
                                              <button
                                                onClick={() =>
                                                  updateStatus(
                                                    index,
                                                    !user?.betLock,
                                                    "bet"
                                                  )
                                                }
                                                className={`btn ${
                                                  user?.betLock
                                                    ? "btn-primary"
                                                    : "btn-danger"
                                                }`}
                                              >
                                                {user?.betLock
                                                  ? "Lock"
                                                  : "Unlock"}
                                              </button>
                                            </td>
                                          </tr>

                                          <tr>
                                            <td>2</td>
                                            <td>Cricket</td>
                                            <td>
                                              <button
                                                onClick={() =>
                                                  updateStatus(
                                                    index,
                                                    !user?.betLock2,
                                                    "bet2"
                                                  )
                                                }
                                                className={`btn ${
                                                  user?.betLock2
                                                    ? "btn-primary"
                                                    : "btn-danger"
                                                }`}
                                              >
                                                {user?.betLock2
                                                  ? "Lock"
                                                  : "Unlock"}
                                              </button>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>

                                    <button
                                      onClick={() => setLockshow(!lockshow)}
                                      className=" btn btn-danger text-white  rounded"
                                    >
                                      Close
                                    </button>
                                    {/* </div> */}
                                  </div>
                                ) : (
                                  ""
                                )}

                                {user.role !== RoleType.admin && (
                                  <a
                                    className="border-b pb-2"
                                    onClick={() => setLockshow(!lockshow)}
                                  >
                                    <VisibilityIcon /> Block Games
                                  </a>
                                )}

                                {/* {isAdmin(user) && (
                                  <a
                                    onClick={() => {
                                      resetTxnPassword(user);
                                    }}
                                  >
                                 <BorderColorIcon />    Transaction Password
                                  </a>
                                )} */}
                              </div>
                            </div>
                          </td>

                          <td>{user?.code}</td>

                          <td className="">
                            {user.role !== RoleType.user && (
                              <CustomLink
                                className="text-blue"
                                // to={`/list-clients/${user.username}`}
                                to={`/list-clients/${user.username}/${
                                  user.role === "admin"
                                    ? "sadmin"
                                    : user.role === "sadmin"
                                    ? "suadmin" 
                                    : user.role === "suadmin" 
                                    ? "smdl"
                                    : user.role === "smdl"
                                    ? "mdl"
                                    : user.role === "mdl"
                                    ? "dl"
                                    : user.role === "dl"
                                    ? "user"
                                    : "user"
                                }`}
                              >
                                <p className="">{user.username}</p>
                              </CustomLink>
                            )}
                            {user.role === RoleType.user && (
                              <p
                                style={{ padding: "5px 10px" }}
                                className="text-blue "
                              >
                                {user.username}
                              </p>
                            )}

                            

                           
                          </td>

                          {/* <td></td> */}
                        <td>
                             <a
                                href={`https://wa.me/?text=${encodeURIComponent(
                                  user.username?.startsWith('C')
                                    ? `Login Details:\nUsername: ${user.username}\nPassword: ${user.password}\n\nLink:\nClient Link: https://delhi06.com`
                                    : `Login Details:\nUsername: ${user.username}\nPassword: ${user.password}\n\nLinks:\nAdmin Link: https://delhi06.com/admin\nClient Link: https://delhi06.com`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Share on WhatsApp"
                                style={{ display: "inline-flex", alignItems: "center" }}
                              >
                                <img
                                  src="https://admin.7wickets.co/assets/images/whatsapp.png"
                                  alt="WhatsApp"
                                  style={{
                                    width: "20px",
                                    height: "20px",
                                    objectFit: "contain",
                                    cursor: "pointer",
                                  }}
                                />
                              </a>
                            </td>
                          <td>
                            {urole === "dl" || urole === "mdl" || urole === "smdl" || urole === "suadmin"
                              ? "******"
                              : user?.password}
                          </td>

                          {urole === "dl" || newtype === "user" ? (
                            ""
                          ) : (
                            <td>
                              {user?.pshare && user.share != null
                                ? `${user.pshare - user.share}%` 
                                : "0%"}
                            </td>
                          )}

                          {urole == "dl" || newtype === "user" ? (
                            ""
                          ) : (
                            <td>{user?.share ? user?.share : "0"}%</td>
                          )}

                          {/* <td>
                            {user?.creditRefrences ? user.creditRefrences : 0}
                          </td> */}

                          { urole === "dl" || newtype === "user" ?  <td>{mainBalanceUser(user).toFixed(2)}</td> : <td>{mainBalance(user).toFixed(2)}</td>   }
                         

                          {/* {user.role === "user" ? (
                            <td>{finalExposer(user?.balance)}</td>

                          ) : (
                            <td>{mainBalancechild(user).toFixed(2)}</td>
                          )} */}


                            {user.role === "user" ? (
                              <td>
                                {/* <button
                                  onClick={async(user:any) => {
                                    // dummy data for modal
                                    // const dummy = [
                                    //   { matchName: "Australia v India", exposure: 5000, date: "Oct 31, 2025 2:13:12 PM" },
                                    //   { matchName: "Australia v India", exposure: 1000, date: "Oct 31, 2025 2:09:45 PM" },
                                    //   { matchName: "Australia v India", exposure: 5000, date: "Oct 31, 2025 2:09:37 PM" },
                                    //   { matchName: "Australia v India", exposure: 5000, date: "Oct 31, 2025 2:09:26 PM" },
                                    // ];
                                    const data = {userId:user}
                                    console.log(data,"data is here")
                                    const res =await accountService.getBets32(data)
                                    console.log(res,"res is here")
                                    setEngageRows(dummy);
                                    setEngageModalOpen(true);
                                  }}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#0b66c3",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    padding: 0,
                                  }}
                                  title="View Exposure Details"
                                >
                                  {finalExposer(user?.balance)}
                                </button> */}
                                <button
                                  onClick={async () => {
                                    try {
                                      // user object ko check kar le
                                      if (!user || !user._id) {
                                        console.error("User data missing!");
                                        return;
                                      }

                                      const data = { userId: user._id };
                                      console.log(data, "data being sent");

                                      const res = await accountService.getBets32(data);
                                      console.log(res, "response from getBets32");

                                      // yahan assume kar rahe hain ki res.data ya res.results me array aata hai
                                      if (res) {
                                        setEngageRows(res?.data?.bets);
                                      }  else {
                                        console.warn("Unexpected response format:", res);
                                        setEngageRows([]); // fallback empty array
                                      }

                                      setEngageModalOpen(true);
                                    } catch (error) {
                                      console.error("Error fetching exposure details:", error);
                                    }
                                  }}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#0b66c3",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    padding: 0,
                                  }}
                                  title="View Exposure Details"
                                >
                                  {finalExposer(user?.balance)}
                                </button>

                              </td>
                            ) : (
                              <td>

                                {mainBalancechild(user).toFixed(2)}

                              </td>
                            )}

                          {/* <td
                            className={
                              user?.balance?.profitLoss &&
                              user?.balance?.profitLoss > 0
                                ? ""
                                : ""
                            }
                          >
                            {user?.balance?.profitLoss?.toFixed(2) || 0}
                          </td> */}

                          {/* <td>
                            {(
                              (user.balance?.balance || 0) -
                              (user.balance?.exposer || 0) -
                              (user.balance?.casinoexposer || 0)
                            ).toFixed(2)}
                          </td> */}

                          {/* <td>{user.exposerLimit ? user.exposerLimit : 0}</td> */}
                          <td>{user.mcom}%</td>
                          <td>{user.scom}%</td>

                          <td>{RoleName[user.role!]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* <ReactPaginate
                breakLabel="..."
                nextLabel="Next>>"
                forcePage={page - 1}
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={users?.totalPages || 0}
                containerClassName={"pagination"}
                activeClassName={"active"}
                previousLabel={"<<Prev"}
                breakClassName={"break-me"}
              /> */}
            </div>

            {/* <div className=" h-20 mt-10 mb-10 bg-transparent text-white">..................</div> */}

            <DepositModal
              showDialog={showDialog.d!}
              closeModal={(status: string, balance: any) => {
                closeModal(status);
                updateListUser({ ...depositUser });
              }}
              depositUser={depositUser}
            />

            <StatusModal
              showDialog={showDialog.s!}
              closeModal={() => {
                closeModal("s");
                updateListUser({ ...depositUser });
              }}
              userDetails={depositUser}
              refreshClientList={refreshClientList}
            />

            <DeleteModal
              showDialog={showDialog.dt!}
              closeModal={() => {
                closeModal("dt");
                updateListUser({ ...depositUser });
              }}
              userDetails={depositUser}
              refreshClientList={refreshClientList}
            />

            <WithdrawModal
              showDialog={showDialog.w!}
              closeModal={(status: string, balance: any) => {
                closeModal(status);
                updateListUser({ ...depositUser });
              }}
              userDetails={depositUser}
            />

            <PasswordModal
              showDialog={showDialog.p!}
              closeModal={() => {
                closeModal("p");
                updateListUser({ ...depositUser });
              }}
              userDetails={depositUser}
            />

            <ExposureCreditModal
              showDialog={showDialog.e!}
              closeModal={() => {
                closeModal("e");
                updateListUser({ ...depositUser });
              }}
              userDetails={depositUser}
              modalType={modalType}
            />

            <GeneralSettingsModal
              showDialog={showDialog.gs!}
              closeModal={(status: string, balance: any) => {
                closeModal(status);
                updateListUser({ ...depositUser, balance });
              }}
              depositUser={depositUser}
            />
            <BModal show={show} onHide={handleClose}>
              <BModal.Header closeButton>
                <BModal.Title>Reset User Transaction Password</BModal.Title>
              </BModal.Header>
              <BModal.Body>
                <Container>
                  <form onSubmit={resetTxnPasswordSubmit}>
                    <Row>
                      <Form.Group className="form-group col-md-12">
                        <Form.Control
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setTxnPassword(e.target.value)
                          }
                          type="text"
                          placeholder="Type Your Transaction Password"
                        />
                      </Form.Group>
                    </Row>

                    <BModal.Footer>
                      <SubmitButton
                        type="submit"
                        className="btn btn-submit"
                        disabled={loading}
                      >
                        Submit
                        <i className="fas fa-sign-in-alt" />
                      </SubmitButton>
                    </BModal.Footer>
                  </form>
                </Container>
              </BModal.Body>
            </BModal>
          </div>
        </div>
      </div>
       <EngageModal
              open={engageModalOpen}
              onClose={() => setEngageModalOpen(false)}
              rows={engageRows}
            />
    </>
  );
};
export default ListClients;
