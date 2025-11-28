// import React from "react";
// import {
//   useForm,
//   // Resolver
// } from "react-hook-form";
// import User, { RoleName, RoleType } from "../../../models/User";
// import UserService from "../../../services/user.service";
// import { useAppSelector } from "../../../redux/hooks";
// import { selectUserData } from "../../../redux/actions/login/loginSlice";
// import * as Yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { AxiosResponse } from "axios";
// import ISport from "../../../models/ISport";
// import { useParams } from "react-router-dom";
// import { selectSportList } from "../../../redux/actions/sports/sportSlice";
// import SubmitButton from "../../../components/SubmitButton";
// import PersonAddIcon from "@mui/icons-material/PersonAdd";

// const validationSchema = Yup.object().shape({
//   username: Yup.string()
//     .trim("User name cannot include leading and trailing spaces")
//     .strict(true),

//   share: Yup.string(),

//   mcom: Yup.number()
//     .typeError("M.Comm. must be a number")
//     .min(0, "M.Comm. cannot be less than 0")
//     .max(2, "M.Comm. cannot be more than 2"),

//   scom: Yup.number()
//     .typeError("S.Comm. must be a number")
//     .min(0, "S.Comm. cannot be less than 0")
//     .max(4, "S.Comm. cannot be more than 4"),
// });


// const EditUser = (data: any) => {
//   console.log(data, "prorpsdatatfroeidt");

//   const userState = useAppSelector<{ user: User }>(selectUserData);
//   console.log(userState, "userstate");
//   const [selectedUser, setSelectedUser] = React.useState<User>();
//   const [selectedUserChild, setSelectedUserChild] = React.useState<User>();

//   const [isPartnership, setIsPartnership] = React.useState(false);
//   const [isExposerAllow, setExposerAllow] = React.useState(false);
//   const sportListState = useAppSelector<{ sports: ISport[] }>(selectSportList);

//   const { username } = useParams();

//   // const username = data?.data?.username

//   console.log(username, "from params");

//   const {
//     register,
//     handleSubmit,
//     reset,
//     getValues,
//     setValue,
//     // setError,
//     formState: { errors },
//   } = useForm<User>({
//     resolver: yupResolver(validationSchema),
//     defaultValues: {
//       transactionPassword: "123456", // Automatically sets transaction password
//     },
//   });

//   React.useEffect(() => {
//     if (username) {
//       UserService.getUserDetail(username).then((res: AxiosResponse<any>) => {
//         setSelectedUser(res.data.data);
//         console.log(res, "ressss");
//       });
//     }
//   }, [username]);

//   React.useEffect(() => {
//     if (data?.data?.username) {
//       UserService.getUserDetail(data?.data?.username).then(
//         (res: AxiosResponse<any>) => {
//           setSelectedUserChild(res.data.data);
//           console.log(res, "ressss for child own values ");
//         }
//       );
//     }
//   }, [data?.data?.username]);

//   React.useEffect(() => {
//     if (selectedUserChild) {
//       setValue("username", selectedUserChild.username);
//       setValue("share", selectedUserChild.share);
//       setValue("mcom", selectedUserChild.mcom);
//       setValue("scom", selectedUserChild.scom);


//       const partnership:any = selectedUserChild.partnership || {};
//       Object.keys(partnership).forEach((sportId) => {
//         setValue(`partnership.${sportId}`, partnership[sportId]?.ownRatio);
//         setValue(`partnershipOur.${sportId}`, partnership[sportId]?.ourRatio);
//       });
//     }
//   }, [selectedUserChild, setValue]);

//   React.useEffect(() => {
//     setValue("transactionPassword", "123456"); // Ensures it's always included

//     setValue("username", data?.username);
//   }, [setValue]);

//   // const onSubmit = handleSubmit((data) => {
//   //   // Partenership
//   //   if (data.role !== RoleType.user) {
//   //     const partenershipValue: any = [10, 20, 30]; // Temporary array
//   //     const partenershipArr: { [x: string]: any } = {};

//   //     console.log("partenershipValue:", partenershipValue);

//   //     partenershipValue.forEach((element: any, index: any) => {
//   //       if (element !== undefined) {
//   //         partenershipArr[index] = element;
//   //       }
//   //     });

//   //   }

//   //   // Parent Name
//   //   data.parent = userData?.username;

//   //   // Removing keys
//   //   delete data.partnershipOur;

//   //   UserService.editUcom(data)
//   //     .then(() => {
//   //       // toast.success("User successfully created");
//   //       // reset();
//   //     })
//   //     .catch((e) => {
//   //       const error = e.response?.data?.message;
//   //       toast.error(error);
//   //     });

//   //   console.log(data, "send dataa");
//   // });

//   // const onSubmit = handleSubmit((formData:any,selectedUserChild:any,) => {
//   //   const payload: any = {
//   //     _id: selectedUserChild?._id,
//   //     username: selectedUserChild?.username,
//   //     share: Number(formData.share),
//   //     partnership: {},
//   //   };

//   //   if (formData.partnership) {
//   //     Object.keys(formData.partnership).forEach((sportId) => {
//   //       const downlineRatio = Number(formData?.partnership?.[sportId]);
//   //       const uplineRatio = Number(formData?.partnershipOur?.[sportId] || 0);
//   //       payload.partnership[sportId] = {
//   //         ownRatio: downlineRatio,
//   //         ourRatio: uplineRatio,
//   //       };
//   //     });
//   //   }

//   //   UserService.editUcom(payload)
//   //     .then(() => {
//   //       toast.success("User successfully updated");
//   //     })
//   //     .catch((e) => {
//   //       const error = e.response?.data?.message || "Something went wrong";
//   //       toast.error(error);
//   //     });

//   //   console.log(payload, "sending edited user payload");
//   // });



//   const onSubmit = handleSubmit((formData: any) => {
//     const payload: any = {
//       _id: selectedUserChild?._id,
//       username: selectedUserChild?.username,
//       share: Number(formData.share),
//       mcom:Number(formData.mcom),
//       scom:Number(formData.scom),
//       partnership: {},
//     };

//     console.log(payload,"ghjkl")
  
//     if (formData.partnership) {
//       Object.keys(formData.partnership).forEach((sportId) => {
//         const downlineRatio = Number(formData?.partnership?.[sportId]);
//         const uplineRatio = Number(formData?.partnershipOur?.[sportId] || 0);
//         payload.partnership[sportId] = {
//           ownRatio: downlineRatio,
//           ourRatio: uplineRatio,
//         };
//       });
//     }
  
//     UserService.editUcom(payload)
//       .then(() => {
//         toast.success("User successfully updated");
//       })
//       .catch((e) => {
//         const error = e.response?.data?.message || "Something went wrong";
//         toast.error(error);
//       });
  
//     console.log(payload, "sending edited user payload");
//   });
  



//   const userData = selectedUser ? selectedUser : userState?.user;

//   const childData = selectedUserChild ? selectedUserChild : userState?.user;

//   return (
//     <div className="container-fluid">
//       <div className="row">
//         <div className="col-md-12 main-container">
//           <div>
//             <div className="add-account">
//               <h2 className="m-b-20">
//                 <PersonAddIcon />
//                 Edit for {data?.data?.username}
//               </h2>
//               <form onSubmit={onSubmit}>
//                 <div className="row">
//                   <div className="col-md-6 personal-detail">
//                     {/* <h4 className="m-b-20 col-md-12">Personal Detail</h4> */}
//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="form-group">
//                           <label htmlFor="username"> Name:</label>
//                           <input
//                             placeholder="User Name"
//                             id="username"
//                             // value={data?.data.username}
//                             {...register("username")}
//                             defaultValue={""}
//                             type="text"
//                             className="form-control"
//                             // required
//                           />
//                           <span
//                             id="username-error"
//                             className="error"
//                             style={{ display: "none" }}
//                           >
//                             Username already taken
//                           </span>
//                           {errors?.username && (
//                             <span id="username-required" className="error">
//                               {errors.username.message}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>


// {data?.data?.role === "user" ? "" :


//                   <div className="col-md-6 account-detail">
//                     {/* <h4 className="m-b-20 col-md-12">Account Detail</h4> */}
//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="form-group">
//                           <label htmlFor="share">Supershare Limit:</label>
//                           <p>Current : {childData.share}%</p>
//                           <input
//                             className="form-control"
//                             placeholder="Supershare Limit"
//                             {...register("share")}
//                             id="share"
//                             defaultValue={0}
//                             min="0"
//                             // value={childData.share}
//                             // required
//                             type="number"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

// }



// <div className="col-md-6 account-detail">
//                     {/* <h4 className="m-b-20 col-md-12">Account Detail</h4> */}
//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="form-group">
//                           <label htmlFor="mcom">Match Commision:</label>
//                           <p>Current:  ≤{childData.mcom}%</p>
//                           <input
//                             className="form-control"
//                             placeholder="Mcom Limit"
//                             {...register("mcom")}
//                             id="mcom"
//                             defaultValue={0}
//                               min="0"
//                               max="2"
//                                step="0.01" 
//                             // value={childData.mcom}
//                             // required
//                             type="number"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>



// <div className="col-md-6 account-detail">
//                     {/* <h4 className="m-b-20 col-md-12">Account Detail</h4> */}
//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="form-group">
//                           <label htmlFor="scom">Session Commision:</label>
//                           <p>Current:  ≤{childData.scom}%</p>
//                           <input
//                             className="form-control"
//                             placeholder="Mcom Limit"
//                             {...register("scom")}
//                             id="scom"
//                             defaultValue={0}
//                             min="0"
//                              max="4"
//                              step="0.01" 
//                             // value={childData.scom}
//                             // required
//                             type="number"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>


//                 </div>
//                 {!isExposerAllow && (
//                   <div className="row m-t-20 hidden" id="partnership-div">
//                     <div className="col-md-12">
//                       {/* <h4 className="m-b-20 col-md-12">Commision</h4> */}
//                       <table className="table table-striped table-borderedddd">
//                         <thead>
//                           <tr>
//                             <th />
//                             {sportListState.sports.map((sports: ISport) =>
//                               sports.sportId === 1 ||
//                               sports.sportId === 2 ||
//                               sports.sportId === 4 ? (
//                                 <th key={sports._id}>
//                                   {
//                                     // sports.name === "Cricket" ? "Casino %" :
//                                     sports.name === "Soccer"
//                                       ? "Match Commission %"
//                                       : sports.name === "Tennis"
//                                       ? "Session Commission %"
//                                       : ""
//                                   }
//                                 </th>
//                               ) : (
//                                 <th key={sports._id} />
//                               )
//                             )}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr className="hidden">
//                             {/* <td>Upline</td> */}
//                             <td></td>

//                             {sportListState.sports.map(({ _id, sportId }) =>
//                               sportId == 1 || sportId == 2 ? (
//                                 <td
//                                   id="taxpartnership-upline"
//                                   key={`upline-${_id}`}
//                                 >
//                                   {userData?.partnership?.[sportId]?.ownRatio}
//                                 </td>
//                               ) : (
//                                 <td key={_id} />
//                               )
//                             )}
//                           </tr>

//                           <tr>
//                             <td></td>
//                             {/* <td>Downline</td> */}

//                             {sportListState.sports?.map(({ _id, sportId }) => {
//                               if (sportId === 4) {
//                                 return (
//                                   <td key={_id}>
//                                     <input
//                                       type="hidden"
//                                       {...register(`partnership.${sportId}`)}
//                                       value={0} // default value to be submitted
//                                     />
//                                   </td>
//                                 );
//                               }

//                               if (sportId === 1 || sportId === 2) {
//                                 return (
//                                   <td className="" key={_id}>
//                                     <input
//                                       className="partnership"
//                                       {...register(`partnership.${sportId}`, {
//                                         onChange: (e) => {
//                                           const input = Number(e.target.value);
//                                           const own =
//                                             userData?.partnership?.[sportId]?.ownRatio || 0;
//                                           setValue(
//                                             `partnershipOur.${sportId}`,
//                                             own - input
//                                           );
//                                         },
//                                       })}
//                                       id={`partnership.${sportId}`}
//                                       placeholder=""
//                                       max={
//                                         userData?.partnership?.[sportId]?.ownRatio 
//                                       }
//                                       min="0"
//                                       defaultValue={0}
//                                       type="number"
//                                       disabled={isPartnership}
//                                     />

//                                     <span className="error" />
//                                   </td>
//                                 );
//                               }

//                               return <td key={_id} />;
//                             })}
//                           </tr>

//                           <tr>
//                             {/* <td>Our</td> */}
//                             <td></td>

//                             {sportListState.sports?.map(({ _id, sportId }) =>
//                               sportId == 1 || sportId == 2 ? (
//                                 <td
//                                 className="hidden"
//                                   id={`taxpartnership-our.${sportId}`}
//                                   key={_id}
//                                 >
//                                   <input
//                                     {...register(`partnershipOur.${sportId}`)}
//                                     value={
//                                       userData?.partnership?.[sportId].ownRatio ?? 0
//                                     }
//                                     // min={0}
//                                     disabled={true}
//                                   />
//                                 </td>
//                               ) : (
//                                 <td key={_id} />
//                               )
//                             )}
//                           </tr>

//                           <tr className="hidden">
//                             {/* <td>{childData?.username} Current Commision</td> */}
//                             {sportListState.sports?.map(({ _id, sportId }) =>
//                               sportId == 1 || sportId == 2 ? (
//                                 <td
//                                   id={`taxpartnership-our.${sportId}`}
//                                   key={_id}
//                                 >
//                                   <input
//                                     // {...register(`partnershipOur.${sportId}`)}
//                                     value={
//                                       selectedUserChild?.partnership?.[sportId]?.ownRatio ?? 0
//                                     }
//                                     // min={0}
//                                     disabled={true}
//                                   />
//                                 </td>
//                               ) : (
//                                 <td key={_id} />
//                               )
//                             )}
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}
//                 <div
//                   style={{ display: "none" }}
//                   className="row m-t-20"
//                   id="min-max-bet-div"
//                 >
//                   <div className="col-md-12">
//                     <h4 className="m-b-20 col-md-12"></h4>
//                     <table className="table table-striped table-bordereddd">
//                       <thead>
//                         <tr>
//                           <th />
//                           {sportListState.sports?.map((sports: any) =>
//                             sports.sportId === 1 ||
//                             sports.sportId === 2 ||
//                             sports.sportId === 4 ? (
//                               <th key={sports._id}>
//                                 {
//                                   // sports.name === "Cricket" ? "Casino %" :
//                                   // sports.name === "Soccer" ? "Match %" :
//                                   // sports.name === "Tennis" ? "Fancy %" :
//                                   ""
//                                 }
//                               </th>
//                             ) : (
//                               <th key={sports._id} />
//                             )
//                           )}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         <tr>
//                           <td></td>
//                           {sportListState.sports?.map(({ _id, sportId }) =>
//                             sportId == 1 || sportId == 2 || sportId == 4 ? (
//                               <td id="minbet" key={_id}>
//                                 {userData?.userSetting?.[sportId]?.minBet}
//                               </td>
//                             ) : (
//                               <td key={_id} />
//                             )
//                           )}
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//                 <div className="row m-t-20">
//                   <div className="col-md-12"></div>
//                 </div>
//                 <div className="row m-t-20">
//                   <div className="col-md-12">
//                     <div className="float-right">
//                       <SubmitButton className="btn btn-submit" type="submit">
//                         Edit User
//                       </SubmitButton>
//                     </div>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default EditUser;



import React from "react";
import {
  useForm,
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
import { useParams } from "react-router-dom";
import { selectSportList } from "../../../redux/actions/sports/sportSlice";
import SubmitButton from "../../../components/SubmitButton";
import PersonAddIcon from "@mui/icons-material/PersonAdd";


// -------------------- VALIDATION --------------------
const validationSchema = Yup.object().shape({
  username: Yup.string()
    .trim("User name cannot include leading and trailing spaces")
    .strict(true),

  code: Yup.string()
    .trim("Code cannot include spaces")
    .strict(true)
    .required("Code is required"),

  share: Yup.string(),

  mcom: Yup.number()
    .typeError("M.Comm. must be a number")
    .min(0, "M.Comm. cannot be less than 0")
    .max(2, "M.Comm. cannot be more than 2"),

  scom: Yup.number()
    .typeError("S.Comm. must be a number")
    .min(0, "S.Comm. cannot be less than 0")
    .max(4, "S.Comm. cannot be more than 4"),
});


// -------------------- COMPONENT --------------------
const EditUser = (data: any) => {
  const userState = useAppSelector<{ user: User }>(selectUserData);
  const [selectedUser, setSelectedUser] = React.useState<User>();
  const [selectedUserChild, setSelectedUserChild] = React.useState<User>();

  const [isPartnership, setIsPartnership] = React.useState(false);
  const [isExposerAllow, setExposerAllow] = React.useState(false);
  const sportListState = useAppSelector<{ sports: ISport[] }>(selectSportList);

  const { username } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<User>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      transactionPassword: "123456",
    },
  });

  // Fetch user by param username
  React.useEffect(() => {
    if (username) {
      UserService.getUserDetail(username).then((res: AxiosResponse<any>) => {
        setSelectedUser(res.data.data);
      });
    }
  }, [username]);

  // Fetch selected child user
  React.useEffect(() => {
    if (data?.data?.username) {
      UserService.getUserDetail(data?.data?.username).then(
        (res: AxiosResponse<any>) => {
          setSelectedUserChild(res.data.data);
        }
      );
    }
  }, [data?.data?.username]);

  // Set user values
  React.useEffect(() => {
    if (selectedUserChild) {
      setValue("username", selectedUserChild.username);
      setValue("code", selectedUserChild.code);          // <-- NEW FIELD
      setValue("share", selectedUserChild.share);
      setValue("mcom", selectedUserChild.mcom);
      setValue("scom", selectedUserChild.scom);

      const partnership: any = selectedUserChild.partnership || {};
      Object.keys(partnership).forEach((sportId) => {
        setValue(`partnership.${sportId}`, partnership[sportId]?.ownRatio);
        setValue(`partnershipOur.${sportId}`, partnership[sportId]?.ourRatio);
      });
    }
  }, [selectedUserChild, setValue]);


  // Submit Handler
  const onSubmit = handleSubmit((formData: any) => {
    const payload: any = {
      _id: selectedUserChild?._id,
      username: selectedUserChild?.username,
      code: formData.code,                                  // <-- NEW FIELD
      share: Number(formData.share),
      mcom: Number(formData.mcom),
      scom: Number(formData.scom),
      partnership: {},
    };

    if (formData.partnership) {
      Object.keys(formData.partnership).forEach((sportId) => {
        const downlineRatio = Number(formData.partnership[sportId]);
        const uplineRatio = Number(formData.partnershipOur?.[sportId] || 0);

        payload.partnership[sportId] = {
          ownRatio: downlineRatio,
          ourRatio: uplineRatio,
        };
      });
    }

    UserService.editUcom(payload)
      .then(() => {
        toast.success("User successfully updated");
      })
      .catch((e) => {
        const error = e.response?.data?.message || "Something went wrong";
        toast.error(error);
      });
  });

  const userData = selectedUser ? selectedUser : userState?.user;
  const childData = selectedUserChild ? selectedUserChild : userState?.user;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12 main-container">
          <div className="add-account">
            <h2 className="m-b-20">
              <PersonAddIcon /> Edit for {data?.data?.username}
            </h2>

            {/* -------------------- FORM -------------------- */}
            <form onSubmit={onSubmit}>
              <div className="row">
                
                {/* USERNAME */}
                <div className="col-md-6 d-none">
                  <div className="form-group">
                    <label htmlFor="username">Code:</label>
                    <input
                      placeholder="User Name"
                      id="username"
                      {...register("username")}
                      className="form-control"
                      type="text"
                    />
                    {errors?.username && (
                      <span className="error">{errors.username.message}</span>
                    )}
                  </div>
                </div>

                {/* CODE NAME - NEW FIELD */}
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="code">UserName:</label>
                    <input
                      placeholder="Code Name"
                      id="code"
                      {...register("code")}
                      className="form-control"
                      type="text"
                    />
                    {errors?.code && (
                      <span className="error">{errors.code.message as string}</span>
                    )}
                  </div>
                </div>


                {/* SHARE */}
                {data?.data?.role === "user" ? null : (
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="share">Supershare Limit:</label>
                      <p>Current : {childData.share}%</p>
                      <input
                        className="form-control"
                        {...register("share")}
                        id="share"
                        type="number"
                        defaultValue={0}
                      />
                    </div>
                  </div>
                )}

                {/* MCOM */}
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="mcom">Match Commission:</label>
                    <p>Current: ≤{childData.mcom}%</p>
                    <input
                      className="form-control"
                      {...register("mcom")}
                      id="mcom"
                      type="number"
                      min="0"
                      max="2"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* SCOM */}
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="scom">Session Commission:</label>
                    <p>Current: ≤{childData.scom}%</p>
                    <input
                      className="form-control"
                      {...register("scom")}
                      id="scom"
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="row m-t-20">
                <div className="col-md-12">
                  <div className="float-right">
                    <SubmitButton className="btn btn-submit" type="submit">
                      Edit User
                    </SubmitButton>
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;

