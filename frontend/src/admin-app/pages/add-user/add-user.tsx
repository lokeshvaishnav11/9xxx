import React from "react";
import {
  useForm,
  // Resolver
} from "react-hook-form";
import User, { RoleName, RoleType } from "../../../models/User";
import UserService from "../../../services/user.service";
import { useAppSelector } from "../../../redux/hooks";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AxiosResponse } from "axios";
import ISport from "../../../models/ISport";
import { useParams, useSearchParams } from "react-router-dom";
import { selectSportList } from "../../../redux/actions/sports/sportSlice";
import SubmitButton from "../../../components/SubmitButton";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DepositM from "../list-clients/modals/DepositM";
import userService from "../../../services/user.service";

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .trim("User name cannot include leading and trailing spaces")
    .strict(true)
    .required("Username is required"),

  // .matches(/^[A-Z][a-z0-9_-]{3,19}$/, "Must Contain One Uppercase"),

  // transactionPassword: Yup.string().default('123456').required('Transaction Password is required'),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 6 characters")
    .matches(/^[A-Z][a-z0-9_-]{3,19}$/, "Must Contain One Uppercase"),
  // passwordConfirmation: Yup.string()
  //   .required('Confirm password is required')
  //   .oneOf([Yup.ref('password')], 'Passwords must match'),
  role: Yup.string().required("Role is required"),
  // fullname: Yup.string().required('Full name is required'),
  // creditRefrences: Yup.string().required("Credit Reference is required"),
  creditRefrences: Yup.string(),

  share: Yup.string(),


  mcom: Yup.string(),
  // mcom: Yup.string()
  // // .required("mcom is required")
  // .test("is-valid-mcom", "mcom must be 0 or less than or equal to 2", (value) => {
  //   const num = Number(value);
  //   return !isNaN(num) && (num <= 2 && num === 0 || num < 2);
  // }),

  // mcom: Yup.string()
  // .required("Match commission is required")
  // .test("is-valid-mcom", "Must be a number between 0 and 2", (value) => {
  //   const num = Number(value);
  //   return !isNaN(num) && num >= 0 && num <= 2;
  // }),


  scom: Yup.string(),
  sendamount: Yup.number(),


  // code: Yup.string(),

  // exposerLimit: Yup.string().when("role", {
  //   is: "user",
  //   then: Yup.string().required("Exposer Limit is required"),
  // }),

  exposerLimit: Yup.string().when("role", {
    is: "user",
    then: Yup.string(),
  }),
});

const AddUser = () => {
  const userState = useAppSelector<{ user: User }>(selectUserData);
  console.log(userState, "user admin details");
  const [selectedUser, setSelectedUser] = React.useState<User>();
  const [isPartnership, setIsPartnership] = React.useState(false);
  const [isExposerAllow, setExposerAllow] = React.useState(false);
  const sportListState = useAppSelector<{ sports: ISport[] }>(selectSportList);



const [uplineParent, setUplineParent] = React.useState<any>(null);

  const [newbalance, setNewbalance] = React.useState({});
  const [pshared, setPshared] = React.useState();
  const [searchParams] = useSearchParams();
  const [callbacklist, setcallbacklist] = React.useState(false);

  const [users, setUserList] = React.useState<any>();
  const [upperlist, setUpperlist] = React.useState<any>();


  const [maxBalance, setMaxBalance] = React.useState<any>();

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // const userState = useAppSelector<{ user: User }>(selectUserData);
    const username = uplineParent
      ? uplineParent?.username
      : userState?.user?.username;

    console.log(username, "testagentmaster");
    UserService.getParentUserDetail(username).then(
      (res: AxiosResponse<any>) => {
        console.log(res, "check balance for parent");
        const thatb = res.data?.data[0]?.balance?.balance;
        const psharee = res?.data?.data[0]?.share
        setPshared(psharee)
        setNewbalance(thatb);
        setMaxBalance(thatb);
      }
    );
  }, [userState ,uplineParent]);

  const { username } = useParams();

  const selfrole:any = userState?.user?.role;

  const thetype:any = useParams().type;
  console.log(thetype, "the type for code");



   // ✅ Define disallowed combinations
   const allowedPairs: Record<string, string[]> = {
    sadmin: ["admin"], // agar thetype = sadmin aur selfrole = admin → skip
    suadmin: ["sadmin"],
    smdl: ["suadmin"],
    mdl: ["smdl"],
    dl: ["mdl"],
    user: ["dl"],
  };

    // ✅ Helper function to check if combination is disallowed
    const isallowed = React.useMemo(() => {
      const sallowed = allowedPairs[thetype];
      return sallowed?.includes(selfrole) ?? false;
    }, [thetype, selfrole]);

console.log(isallowed, "is disallowed or not");

 


  // let fword = "";

  // switch (thetype) {
  //   case "sadmin":
  //     fword = "SB";
  //     break;
  //     case "suadmin":
  //     fword = "AD";
  //     break;
  //   case "smdl":
  //     fword = "MA";
  //     break;
  //   case "mdl":
  //     fword = "SA";
  //     break;
  //   case "dl":
  //     fword = "A";
  //     break;
  //   case "user":
  //     fword = "C";
  //     break;
  //   default:
  //     fword = "";
  //     break;
  // }

  // const randomNumber = Math.floor(Math.random() * (99999 - 19999 + 1)) + 19999;
  // const sendcode = fword + randomNumber;
  // console.log(sendcode, "the first code");

  const [sendcode, setSendcode] = React.useState("");

React.useEffect(() => {
  let fword = "";

  switch (thetype) {
    case "sadmin": fword = "SB"; break;
    case "suadmin": fword = "AD"; break;
    case "smdl": fword = "MA"; break;
    case "mdl": fword = "SA"; break;
    case "dl": fword = "A"; break;
    case "user": fword = "C"; break;
    default: fword = "";
  }

  const randomNumber = Math.floor(Math.random() * (99999 - 19999 + 1)) + 19999;
  setSendcode(fword + randomNumber);

}, [thetype]);  // 👈 Only regenerate when account type changes


  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    // setError,
    formState: { errors },
  } = useForm<User>({
    resolver: yupResolver(validationSchema, { context: { maxBalance } }),
    mode: "onChange", 
    defaultValues: {
      password: "Abcd1122",
      transactionPassword: "123456", // Automatically sets transaction password
    },
  });

  // const sendamount = watch("sendamount")

  React.useEffect(() => {
    if (uplineParent ? uplineParent?.username : username) {
      UserService.getUserDetail(uplineParent ? uplineParent?.username : username).then((res: AxiosResponse<any>) => {
        setSelectedUser(res.data.data);
      });
    }
  }, [username ,uplineParent]);

  React.useEffect(() => {
    const validRoles = Object.values(RoleType);

    if (thetype && validRoles.includes(thetype as RoleType)) {
      setValue("role", thetype as RoleType); // ✅ Cast as RoleType
      setIsPartnership(thetype === RoleType.user);
      setExposerAllow(thetype === RoleType.user);
    }
  }, [thetype, setValue]);

  React.useEffect(() => {
    setValue("transactionPassword", "123456"); // Ensures it's always included
  }, [setValue]);

  // const onSubmit = handleSubmit((data) => {
  //   // Partenership
  //   if (data.role !== RoleType.user) {
  //     // const partenershipValue: any = data.partnership
  //     const partenershipValue: any = [10, 20, 30];
  //     const partenershipArr: { [x: string]: any } = {}
  //     // const patr=[20,20,20]
  //     // const patr=[20,20,20]
  //     console.log(partenershipValue)
  //     // Object.keys(partenershipValue).forEach((key) => {
  //     //   partenershipArr[key] = partenershipValue[key]
  //     // })
  //     partenershipValue.forEach((element: undefined, index: any) => {
  //       if (element !== undefined) {
  //         partenershipArr[index] = element
  //       }
  //     })
  //     // data.partnership = partenershipArr
  //     // User Setting
  //     const userSettingArr: { [x: string]: any } = {}

  //     const minBetValue = data.minbet
  //     console.log(minBetValue)
  //     minBetValue.forEach((element: undefined, index: any) => {
  //       if (element !== undefined) {
  //         const minbetObj = { minBet: element }
  //         userSettingArr[index] = minbetObj
  //       }
  //     })

  //     const maxBetValue = data.maxbet
  //     maxBetValue.forEach((element: undefined, index: any) => {
  //       if (element !== undefined) {
  //         const maxbetObj = { maxBet: element }
  //         userSettingArr[index] = Object.assign(userSettingArr[index], maxbetObj)
  //       }
  //     })

  //     const delay = data.delay
  //     delay.forEach((element: undefined, index: any) => {
  //       if (element !== undefined) {
  //         const delayObj = { delay: element }
  //         userSettingArr[index] = Object.assign(userSettingArr[index], delayObj)
  //       }
  //     })

  //     data.userSetting = userSettingArr
  //   }

  //   // Parent Name
  //   data.parent = userData?.username

  //   //Removing keys
  //   delete data.maxbet
  //   delete data.minbet
  //   delete data.delay
  //   delete data.partnershipOur

  //   UserService.addUser(data).then(() => {
  //     toast.success('User successfully created')
  //     reset()
  //   })
  //   .catch((e) => {
  //     const error = e.response.data.message
  //     toast.error(error)
  //     //reset()
  //   })
  // })

  const [senddata, setSenddata] = React.useState({});

  const onSubmit = handleSubmit((data) => {

    if (Number(data.sendamount) > Number(maxBalance)) {
      toast.error(`Client Limit cannot exceed available balance (${maxBalance})`);
      return; // Prevent further execution
    }
  
    setLoading(true);

    data.creditRefrences = data.sendamount;
    data.exposerLimit = data.sendamount;
    // Partenership
    if (data.role !== RoleType.user) {
      const partenershipValue: any = [10, 20, 30]; // Temporary array
      const partenershipArr: { [x: string]: any } = {};

      console.log("partenershipValue:", partenershipValue);

      partenershipValue.forEach((element: any, index: any) => {
        if (element !== undefined) {
          partenershipArr[index] = element;
        }
      });

      // User Setting
      const userSettingArr: { [x: string]: any } = {};

      // Ensure values are arrays before iterating
      const minBetValue = Array.isArray(data.minbet)
        ? data.minbet
        : Object.values(data.minbet || {});
      const maxBetValue = Array.isArray(data.maxbet)
        ? data.maxbet
        : Object.values(data.maxbet || {});
      const delayValue = Array.isArray(data.delay)
        ? data.delay
        : Object.values(data.delay || {});

      console.log("minBetValue:", minBetValue);
      console.log("maxBetValue:", maxBetValue);
      console.log("delayValue:", delayValue);

      minBetValue.forEach((element, index) => {
        if (element !== undefined) {
          userSettingArr[index] = { minBet: element };
        }
      });

      maxBetValue.forEach((element, index) => {
        if (element !== undefined) {
          userSettingArr[index] = Object.assign(userSettingArr[index] || {}, {
            maxBet: element,
          });
        }
      });

      delayValue.forEach((element, index) => {
        if (element !== undefined) {
          userSettingArr[index] = Object.assign(userSettingArr[index] || {}, {
            delay: element,
          });
        }
      });
      console.log(userSettingArr ,"setingnggnngrrr")

      data.userSetting = userSettingArr;
    }

    // Parent Name
   data.parent = uplineParent ? uplineParent?.username : userData?.username;

    data.code = sendcode;
    data.pshare = pshared;

    // Removing keys
    // delete data.maxbet;
    // delete data.minbet;
    // delete data.delay;
    // delete data.partnershipOur;

    UserService.addUser(data)
      .then((ress) => {
        if (ress?.data?.message === "New User Added and Funded Successfully") {
          setLoading(false); // Stop loader
          console.log(data, "cretae data");
          setSenddata(data);
          console.log(ress, "resss ");
          toast.success("User successfully created");
          reset();
          window.location.reload();
        } else {
          setLoading(false); // Also stop in case of unexpected message
          toast.error(ress?.data?.message);
        }
      })
      .catch((e) => {
        const error = e.response?.data?.message;
        setLoading(false);
        toast.error(error);
      });

    console.log(data, "send dataa");
  });

  const roleOption = () => {
    const userRole = userData.role;
    const allRoles = JSON.parse(JSON.stringify(RoleName));
    delete allRoles.admin;
    const options: Record<string, string> = allRoles;
    if (userRole && userRole != "admin") {
      const allOptions = Object.keys(options);
      const startIndex = allOptions.indexOf(userRole);
      const newArray = allOptions.slice(startIndex + 1);

      return newArray.map((option, index) => {
        if (+userRole >= ++index) return false;
        return (
          <option key={index} value={option}>
            {options[option]}
          </option>
        );
      });
    }
    return Object.keys(options).map((option, index) => {
      return (
        <option key={index} value={option}>
          {options[option]}
        </option>
      );
    });
  };

  const userData = selectedUser ? selectedUser : userState?.user;

  const [searchObj, setSearchObj] = React.useState<any>({
    type: "",
    username: "",
    status: "",
    search: "",
  });


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
      console.log(res.data.data.items, "add user list data");
      setUserList(res.data.data);
      // clientlistdata(res.data.data.items);
    });
  };

  React.useEffect(() => {
    const search = searchParams.get("search") ? searchParams.get("search") : "";
    getList({
      username: userState?.user?.username!,
      search: search!,
      type: "",
    });
    // setPage(1);
  }, [username, searchParams.get("search"), callbacklist , thetype, userState?.user?.username]);


  let addtype = "";

  switch (thetype) {
    case "sadmin":
      addtype = "admin";
      break;
    case "suadmin":
      addtype = "sadmin";
      break;
    case "smdl":
      addtype = "suadmin";
      break;
    case "mdl":
      addtype = "smdl";
      break;
    case "dl":
      addtype = "mdl";
      break;
    case "user":
      addtype = "dl";
      break;
    default:
      addtype = "";
      break;
  }

  console.log(addtype, "check add user type");

  const filterred = users?.items?.filter((u: any) => u?.role === addtype);

  console.log(filterred, "filter useres for add user");

  // Step 3: Handle select change
  const handleSelectChange = (e: any) => {
    const selectedUsername = e.target.value;
    const selectedUserff = filterred?.find(
      (u: any) => u.username === selectedUsername
    );
    setUplineParent(selectedUserff);
  };

  React.useEffect(() => {
    console.log(uplineParent, "Currently selected upline parent data");
  }, [uplineParent]);



  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12 main-container">
          <div>
            <div className="add-account">
              <h2 className="m-b-20">
                <PersonAddIcon />
                Create
              </h2>
              <form onSubmit={onSubmit}>
                <div className="row">
                  <div className="col-md-6 personal-detail">
                    {/* <h4 className="m-b-20 col-md-12">Personal Detail</h4> */}


                    {filterred?.length > 0 ? (
                      <div className="mb-10 justify-between flex items-center">
                        <label>Select Upperline:</label>
                        <select
                          onChange={handleSelectChange}
                          className="border rounded-0 p-2"
                        >
                          <option value="">-- Select User --</option>
                          {filterred?.map((user: any) => (
                            <option key={user?._id} value={user.username}>
                              {user?.username}({user?.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      ""
                    )}



                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="username"> Name:</label>
                          <input
                            placeholder="User Name"
                            id="username"
                            {...register("username")}
                            defaultValue={""}
                            type="text"
                            className="form-control"
                            // required
                          />
                          <span
                            id="username-error"
                            className="error"
                            style={{ display: "none" }}
                          >
                            Username already taken
                          </span>
                          {errors?.username && (
                            <span id="username-required" className="error">
                              {errors.username.message}
                            </span>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            className="form-control username"
                            value={sendcode}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="password">User password:</label>
                          <input
                            maxLength={8}
                            placeholder="Password"
                            id="password"
                            {...register("password")}
                            type="password"
                            className="form-control"
                            // required
                          />
                          {errors?.password && (
                            <span id="password-error" className="error">
                              {errors.password.message}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* <div className='col-md-6'>
                        <div className='form-group'>
                          <label htmlFor='password_confirmation'>Retype password:</label>
                          <input
                            maxLength={45}
                            placeholder='Retype Password'
                            id='password_confirmation'
                            {...register('passwordConfirmation')}
                            type='password'
                            className='form-control'
                          // required
                          />
                          {errors?.passwordConfirmation && (
                            <span id='password_confirmation-error' className='error'>
                              {errors.passwordConfirmation.message}
                            </span>
                          )}
                        </div>
                      </div> */}
                      {/* <div className='col-md-6'>
                        <div className='form-group'>
                          <label htmlFor='fullname'></label>
                          <input
                            // placeholder='Full Name'
                            {...register('fullname')}
                            id='fullname'
                            defaultValue={''}
                            type='text'
                            // className='form-control'
                         
                          />
                          {errors?.fullname && (
                            <span id='fullname-error' className='error'>
                              {errors.fullname.message}
                            </span>
                          )}
                        </div>
                      </div>  */}
                      {/* <div className='col-md-6'>
                        <div className='form-group'>
                          <label htmlFor='city'>City:</label>
                          <input
                            maxLength={15}
                            placeholder='City'
                            {...register('city')}
                            id='city'
                            defaultValue={''}
                            type='text'
                            className='form-control'
                          />
                          {errors?.city && (
                            <span id='city-error' className='error'>
                              {errors.city.message}
                            </span>
                          )}
                        </div>
                      </div> */}
                      {/* <div className='col-md-6'>
                        <div className='form-group'>
                          <label htmlFor='phone'>Phone:</label>
                          <input
                            maxLength={10}
                            placeholder='Phone'
                            {...register('phone')}
                            id='phone'
                            type='number'
                            className='form-control'
                          />
                          {errors?.phone && (
                            <span id='phone-error' className='error'>
                              {errors.phone.message}
                            </span>
                          )}
                        </div>
                      </div> */}
                    </div>
                  </div>
                  <div className="col-md-6 account-detail">
                    {/* <h4 className="m-b-20 col-md-12">Account Detail</h4> */}
                    <div className="row">
                      <div className="col-md-6">
                        {/* {thetype === "undefined" || thetype === undefined ?  */}

                        {thetype === "undefined" ? (
                          <div className={"form-group"}>
                            <label htmlFor="role">Account Type:</label>
                            {/* <select
                            {...register("role", {
                              onChange: (e) => {
                                e.target.value == RoleType.user
                                  ? setIsPartnership(true)
                                  : setIsPartnership(false);
                                e.target.value == RoleType.user
                                  ? setExposerAllow(true)
                                  : setExposerAllow(false);
                              },
                            })}
                            id="role"
                            className="form-control"
                            // required
                          > */}
                            <select
                              {...register("role", {
                                onChange: (e) => {
                                  const value = e.target.value;
                                  setIsPartnership(value === RoleType.user);
                                  setExposerAllow(value === RoleType.user);
                                },
                              })}
                              id="role"
                              className="form-control"
                            >
                              <option value={""}>
                                - Select Your Account Type -
                              </option>
                              {roleOption()}
                            </select>
                            {errors?.role && (
                              <span id="role-error" className="error">
                                {errors.role.message}
                              </span>
                            )}
                          </div>
                        ) : (
                          ""
                        )}
                      </div>

                      
                      <div className="col-md-6 d-none">
                        <div className="form-group">
                          <label htmlFor="creditrefrence">Client Limit:</label>
                          <input
                            className="form-control"
                            placeholder="Super Limit"
                            {...register("creditRefrences")}
                            id="creditRefrences"
                            defaultValue={""}
                            min="0"
                            // required
                            type="number"
                          />
                          {errors?.creditRefrences && (
                            <span id="creditrefrence-error" className="error">
                              {errors.creditRefrences.message}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* <DepositM depositUser={{senddata, newbalance}} /> */}
                      {!isExposerAllow && (
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="share">Super Share :{`(≤${pshared ? pshared : 0})`}</label>
                            
                            <input
                              className="form-control"
                              placeholder="Supershare Limit"
                              {...register("share")}
                              id="share"
                              defaultValue={0}
                              min="0"
                              max={pshared ? pshared : 0}
                              // required
                              type="number"
                            />
                          </div>
                        </div>
                      )}

                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="sendamount">
                            Client Limit Balance ({maxBalance ? maxBalance : ""}
                            )
                          </label>
                          <input
                            className="form-control"
                            placeholder="sendamount "
                            {...register("sendamount")}
                            id="sendamount"
                            defaultValue={0}
                            min="0"
                            // required
                            type="number"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="mcom">Match Commision(≤2%)</label>
                          <input
                            className="form-control"
                            placeholder="M Comm Limit"
                            {...register("mcom")}
                            id="mcom"
                            defaultValue={0}
                            min="0"
                            max="2"
                            // required
                            step="0.01" 
                            type="number"
                          />

                          
                         
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="scom">Session Commision(≤4%)</label>
                          <input
                            className="form-control"
                            placeholder="S Comm Limit"
                            {...register("scom")}
                            id="scom"
                            defaultValue={0}
                            min="0"
                            max="4"
                            step="0.01"
                            // required
                            type="number"
                          />
                        </div>
                      </div>

                      {isExposerAllow && (
                        <div className="col-md-6 d-none ">
                          <div className="form-group" id="exposer-limit">
                            <label htmlFor="exposerLimit">Exposer Limit:</label>
                            <input
                              placeholder="Exposer Limit"
                              id="exposerLimit"
                              {...register("exposerLimit")}
                              defaultValue={""}
                              type="number"
                              className="form-control"
                              min="0"
                              // required
                            />
                            {errors?.exposerLimit && (
                              <span id="exposerlimit-error" className="error">
                                {errors.exposerLimit.message}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {!isExposerAllow && (
                  <div
                    style={{ display: "none" }}
                    className="row m-t-20"
                    id="partnership-div"
                  >
                    <div className="col-md-12">
                      {/* <h4 className="m-b-20 col-md-12">Commision</h4> */}
                      <table className="table table-striped table-bordereddd">
                        <thead>
                          <tr>
                            <th />
                            {sportListState.sports.map((sports: ISport) =>
                              sports.sportId === 1 ||
                              sports.sportId === 2 ||
                              sports.sportId === 4 ? (
                                <th className="" key={sports._id}>
                                  {
                                    // sports.name === "Cricket" ? "Casino %" :
                                    sports.name === "Soccer"
                                      ? "Match Commission (%)"
                                      : sports.name === "Tennis"
                                      ? "Session Commission (%)"
                                      : ""
                                  }
                                </th>
                              ) : (
                                <th key={sports._id} />
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hidden">
                            <td>Upline</td>
                            {sportListState.sports.map(({ _id, sportId }) =>
                              sportId == 1 || sportId == 2 ? (
                                <td
                                  id="taxpartnership-upline"
                                  key={`upline-${_id}`}
                                >
                                  {userData?.partnership?.[sportId].ownRatio}
                                </td>
                              ) : (
                                <td key={_id} />
                              )
                            )}
                          </tr>
                          {/* <tr>
                            <td>Downline</td>
                            {sportListState.sports?.map(({ _id, sportId }) =>
                              sportId == 1 || sportId == 2 || sportId == 4  ? (
                                <td key={_id}>
                                  <input
                                    className='partnership'
                                    {...register(`partnership.${sportId}`, {
                                      onChange: (e) => {
                                        const ownRatio = userData.partnership?.[sportId].ownRatio
                                        ownRatio
                                          ? setValue(
                                            `partnershipOur.${sportId}`,
                                            ownRatio - e.target.value,
                                          )
                                          : setValue(
                                            `partnershipOur.${sportId}`,
                                            getValues(`partnershipOur.${sportId}`),
                                          )
                                      },
                                    })}
                                    id={`partnership.${sportId}`}
                                    placeholder={''}
                                    max={userData?.partnership?.[sportId].ownRatio}
                                    min='0'
                                    defaultValue={0}
                                    type='number'
                                    disabled={isPartnership}
                                  />
                                  <span className='error' />
                                </td>
                              ) : (
                                <td key={_id} />
                              ),
                            )}
                          </tr> */}

                          <tr>
                            <td></td>
                            {sportListState.sports?.map(({ _id, sportId }) => {
                              if (sportId === 4) {
                                return (
                                  <td key={_id}>
                                    <input
                                      type="hidden"
                                      {...register(`partnership.${sportId}`)}
                                      value={0} // default value to be submitted
                                    />
                                  </td>
                                );
                              }

                              if (sportId === 1 || sportId === 2) {
                                return (
                                  <td key={_id}>
                                    <input
                                      className="partnership"
                                      {...register(`partnership.${sportId}`, {
                                        onChange: (e) => {
                                          const ownRatio =
                                            userData.partnership?.[sportId]
                                              ?.ownRatio;
                                          ownRatio
                                            ? setValue(
                                                `partnershipOur.${sportId}`,
                                                ownRatio - e.target.value
                                              )
                                            : setValue(
                                                `partnershipOur.${sportId}`,
                                                getValues(
                                                  `partnershipOur.${sportId}`
                                                )
                                              );
                                        },
                                      })}
                                      id={`partnership.${sportId}`}
                                      placeholder=""
                                      max={
                                        userData?.partnership?.[sportId]
                                          ?.ownRatio
                                      }
                                      min="0"
                                      defaultValue={0}
                                      type="number"
                                      disabled={isPartnership}
                                    />
                                    <span className="error" />
                                  </td>
                                );
                              }

                              return <td key={_id} />;
                            })}
                          </tr>

                          <tr className="hidden">
                            <td>Our</td>
                            {sportListState.sports?.map(({ _id, sportId }) =>
                              sportId == 1 || sportId == 2 ? (
                                <td
                                  id={`taxpartnership-our.${sportId}`}
                                  key={_id}
                                >
                                  <input
                                    {...register(`partnershipOur.${sportId}`)}
                                    value={
                                      userData?.partnership?.[sportId].ownRatio
                                    }
                                    // min={0}
                                    disabled={true}
                                  />
                                </td>
                              ) : (
                                <td key={_id} />
                              )
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}


              <div
                  // style={{ display: "none" }}
                  className="row m-t-20 "
                  id="min-max-bet-div"
                >
                  <div className="col-md-12 overflow-x-scroll">
                    {/* <h4 className="m-b-20 col-md-12"></h4> */}
                    <table className="table table-striped table-borderedddd">
                      <thead className={` ${thetype === "sadmin" ? "d-" : "d-none"}`}>
                        <tr>
                          <th />
                          {sportListState.sports?.map((sports: any) =>
                            sports.sportId === 1 ||
                            sports.sportId === 2 ||
                            sports.sportId === 4 ? (
                              <th key={sports._id}>
                                {
                                  sports.name === "Cricket" ? "Casino " :
                                  sports.name === "Soccer" ? "Match" :
                                  sports.name === "Tennis" ? "Fancy " :
                                  ""
                                }
                              </th>
                            ) : (
                              <th key={sports._id} />
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={` ${thetype === "sadmin" ? "d-" : "d-none"}`}>
                          <td></td>
                          {sportListState.sports?.map(({ _id, sportId }) =>
                            sportId == 1 || sportId == 2 || sportId == 4 ? (
                              <td id="minbet" key={_id}>
                                {userData?.userSetting?.[sportId].minBet}
                              </td>
                            ) : (
                              <td key={_id} />
                            )
                          )}
                        </tr>
                        <tr className={` ${thetype === "sadmin" ? "d" : "d-none"}`}>
                          <td>Provide Min Bet</td>
                          {sportListState.sports?.map(({ _id, sportId }) =>
                            sportId == 1 || sportId == 2 || sportId == 4 ? (
                              <td key={_id}>
                                <input
                                  id={`minbet.${sportId}`}
                                  className={`minbet.${sportId}`}
                                  {...register(`minbet.${sportId}`)}
                                  placeholder={""}
                                  max={userData?.userSetting?.[sportId].minBet}
                                  min={0}
                                  defaultValue={userData?.userSetting?.[sportId].minBet}
                                  disabled={isPartnership}
                                  type="number"
                                />
                                <span className="error" />
                              </td>
                            ) : (
                              <td key={_id} />
                            )
                          )}
                        </tr>
                        <tr className={` ${thetype === "sadmin" ? "d-" : "d-none"}`}>
                          <td>Max Bet</td>
                          {sportListState.sports?.map(({ _id, sportId }) =>
                            sportId == 1 || sportId == 2 || sportId == 4 ? (
                              <td id="maxbet" key={_id}>
                                {userData?.userSetting?.[sportId].maxBet}
                              </td>
                            ) : (
                              <td key={_id} />
                            )
                          )}
                        </tr>
                        <tr className={` ${thetype === "sadmin" ? "d-" : "d-none"}`}>
                          <td>Provide Min Bet</td>
                          {sportListState.sports?.map(({ _id, sportId }) =>
                            sportId == 1 || sportId == 2 || sportId == 4 ? (
                              <td key={_id}>
                                <input
                                  id={`maxbet.${sportId}`}
                                  className={`maxbet.${sportId}`}
                                  {...register(`maxbet.${sportId}`)}
                                  placeholder={""}
                                  max={userData?.userSetting?.[sportId].maxBet}
                                  defaultValue={userData?.userSetting?.[sportId].maxBet}
                                  disabled={isPartnership}
                                  min={0}
                                  type="number"
                                />
                                <span className="error" />
                              </td>
                            ) : (
                              <td key={_id} />
                            )
                          )}
                        </tr>
                        <tr className={` ${thetype === "sadmin" ? "d" : "d-none"}`}>
                          <td>Delay</td>
                          {sportListState.sports?.map(({ _id, sportId }) =>
                            sportId == 1 || sportId == 2 || sportId == 4 ? (
                              <td id="delay" key={_id}>
                                {userData?.userSetting?.[sportId].delay}
                              </td>
                            ) : (
                              <td key={_id} />
                            )
                          )}
                        </tr>
                        <tr className={` ${thetype === "sadmin" ? "" : "d-none"}`}>
                          <td>Provide Delay</td>
                          {sportListState.sports?.map(({ _id, sportId }) =>
                            sportId == 1 || sportId == 2 || sportId == 4 ? (
                              <td key={_id}>
                                <input
                                  id={`delay.${sportId}`}
                                  className={`delay.${sportId}`}
                                  {...register(`delay.${sportId}`)}
                                  placeholder={""}
                                  max={userData?.userSetting?.[sportId].delay}
                                  defaultValue={userData?.userSetting?.[sportId].delay}
                                  disabled={isPartnership}
                                  type="number"
                                />
                                <span className="error" />
                              </td>
                            ) : (
                              <td key={_id} />
                            )
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div> 

                <div className="row m-t-20">
                  <div className="col-md-12">
                    {/* <div className='form-group col-md-3 float-right'>
                      <label htmlFor='transactionPassword'>Transaction Password:</label>
                      <input
                        maxLength={6}
                        placeholder='Transaction Password'
                        {...register('transactionPassword')}
                        // defaultValue={''}
                        id='transactionPassword'
                        type='password'
                        className='form-control'
                        readOnly
                      />
                      {errors?.transactionPassword && (
                        <span id='transactionPassword-error' className='error'>
                          {errors.transactionPassword.message}
                        </span>
                      )}
                    </div> */}
                  </div>
                </div>
                <div className="row m-t-20">
                  <div className="col-md-12">

                    {isallowed || uplineParent ?  <div className="float-right">
                      <SubmitButton className="btn btn-submit" type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create User"}
                      </SubmitButton>
                    </div> : <div className="float-right"> Select Upline</div>}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AddUser;
