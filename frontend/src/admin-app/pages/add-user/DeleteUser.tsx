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
import { useParams } from "react-router-dom";
import { selectSportList } from "../../../redux/actions/sports/sportSlice";
import SubmitButton from "../../../components/SubmitButton";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .trim("User name cannot include leading and trailing spaces")
    .strict(true),
    // .required("Username is required")
    // .matches(/^[A-Z][a-z0-9_-]{3,19}$/, "Must Contain One Uppercase"),
  // transactionPassword: Yup.string().default('123456').required('Transaction Password is required'),

  share: Yup.string(),
  mcom: Yup.string(),
  scom: Yup.string(),
});

const DeleteUser = (data: any) => {
  console.log(data, "prorpsdatatfroeidt");

  const userState = useAppSelector<{ user: User }>(selectUserData);
  console.log(userState, "userstate");
  const [selectedUser, setSelectedUser] = React.useState<User>();
  const [selectedUserChild, setSelectedUserChild] = React.useState<User>();

  const [isPartnership, setIsPartnership] = React.useState(false);
  const [isExposerAllow, setExposerAllow] = React.useState(false);
  const sportListState = useAppSelector<{ sports: ISport[] }>(selectSportList);

  const { username } = useParams();

  // const username = data?.data?.username

  console.log(username, "from params");

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    // setError,
    formState: { errors },
  } = useForm<User>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      transactionPassword: "123456", // Automatically sets transaction password
    },
  });

  React.useEffect(() => {
    if (username) {
      UserService.getUserDetail(username).then((res: AxiosResponse<any>) => {
        setSelectedUser(res.data.data);
        console.log(res, "ressss");
      });
    }
  }, [username]);

  React.useEffect(() => {
    if (data?.data?.username) {
      UserService.getUserDetail(data?.data?.username).then(
        (res: AxiosResponse<any>) => {
          setSelectedUserChild(res.data.data);
          console.log(res, "ressss for child own values ");
        }
      );
    }
  }, [data?.data?.username]);

  React.useEffect(() => {
    if (selectedUserChild) {
      setValue("username", selectedUserChild.username);
      setValue("share", selectedUserChild.share);
      setValue("mcom", selectedUserChild.mcom);
      setValue("scom", selectedUserChild.scom);


      const partnership:any = selectedUserChild.partnership || {};
      Object.keys(partnership).forEach((sportId) => {
        setValue(`partnership.${sportId}`, partnership[sportId]?.ownRatio);
        setValue(`partnershipOur.${sportId}`, partnership[sportId]?.ourRatio);
      });
    }
  }, [selectedUserChild, setValue]);

  React.useEffect(() => {
    setValue("transactionPassword", "123456"); // Ensures it's always included

    setValue("username", data?.username);
  }, [setValue]);

  // const onSubmit = handleSubmit((data) => {
  //   // Partenership
  //   if (data.role !== RoleType.user) {
  //     const partenershipValue: any = [10, 20, 30]; // Temporary array
  //     const partenershipArr: { [x: string]: any } = {};

  //     console.log("partenershipValue:", partenershipValue);

  //     partenershipValue.forEach((element: any, index: any) => {
  //       if (element !== undefined) {
  //         partenershipArr[index] = element;
  //       }
  //     });

  //   }

  //   // Parent Name
  //   data.parent = userData?.username;

  //   // Removing keys
  //   delete data.partnershipOur;

  //   UserService.editUcom(data)
  //     .then(() => {
  //       // toast.success("User successfully created");
  //       // reset();
  //     })
  //     .catch((e) => {
  //       const error = e.response?.data?.message;
  //       toast.error(error);
  //     });

  //   console.log(data, "send dataa");
  // });

  // const onSubmit = handleSubmit((formData:any,selectedUserChild:any,) => {
  //   const payload: any = {
  //     _id: selectedUserChild?._id,
  //     username: selectedUserChild?.username,
  //     share: Number(formData.share),
  //     partnership: {},
  //   };

  //   if (formData.partnership) {
  //     Object.keys(formData.partnership).forEach((sportId) => {
  //       const downlineRatio = Number(formData?.partnership?.[sportId]);
  //       const uplineRatio = Number(formData?.partnershipOur?.[sportId] || 0);
  //       payload.partnership[sportId] = {
  //         ownRatio: downlineRatio,
  //         ourRatio: uplineRatio,
  //       };
  //     });
  //   }

  //   UserService.editUcom(payload)
  //     .then(() => {
  //       toast.success("User successfully updated");
  //     })
  //     .catch((e) => {
  //       const error = e.response?.data?.message || "Something went wrong";
  //       toast.error(error);
  //     });

  //   console.log(payload, "sending edited user payload");
  // });



  const onSubmit = handleSubmit((formData: any) => {
    const payload: any = {
      _id: selectedUserChild?._id,
      username: selectedUserChild?.username,
      share: Number(formData.share),
      mcom:Number(formData.mcom),
      scom:Number(formData.scom),
      partnership: {},
    };
  
    if (formData.partnership) {
      Object.keys(formData.partnership).forEach((sportId) => {
        const downlineRatio = Number(formData?.partnership?.[sportId]);
        const uplineRatio = Number(formData?.partnershipOur?.[sportId] || 0);
        payload.partnership[sportId] = {
          ownRatio: downlineRatio,
          ourRatio: uplineRatio,
        };
      });
    }
  
    UserService.deleteU(payload)
      .then(() => {
        toast.success("User successfully Deleted");
      })
      .catch((e) => {
        const error = e.response?.data?.message || "Something went wrong";
        toast.error(error);
      });
  
    console.log(payload, "sending edited user payload");
  });
  



  const userData = selectedUser ? selectedUser : userState?.user;

  const childData = selectedUserChild ? selectedUserChild : userState?.user;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12 main-container">
          <div>
            <div className="add-accounttt">
              <h2 className="m-b-20">
                {/* <PersonAddIcon /> */}
               Delete User -{data?.data?.username}
              </h2>


              <form onSubmit={onSubmit}>
                <div className="row hidden">
                  <div className="col-md-6 personal-detail">
                    {/* <h4 className="m-b-20 col-md-12">Personal Detail</h4> */}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="username"> Name:</label>
                          <input
                            placeholder="User Name"
                            id="username"
                            // value={data?.data.username}
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
                      </div>
                    </div>
                  </div>


{data?.data?.role === "user" ? "" :


                  <div className="col-md-6 account-detail">
                    {/* <h4 className="m-b-20 col-md-12">Account Detail</h4> */}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="share">Supershare Limit:</label>
                          <p>Current : {childData.share}%</p>
                          <input
                            className="form-control"
                            placeholder="Supershare Limit"
                            {...register("share")}
                            id="share"
                            defaultValue={0}
                            min="0"
                            // value={childData.share}
                            // required
                            type="number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

}



<div className="col-md-6 account-detail">
                    {/* <h4 className="m-b-20 col-md-12">Account Detail</h4> */}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="mcom">Match Commision:</label>
                          <p>Current: {childData.mcom}%</p>
                          <input
                            className="form-control"
                            placeholder="Mcom Limit"
                            {...register("mcom")}
                            id="mcom"
                            defaultValue={0}
                            min="0"
                            // value={childData.mcom}
                            // required
                            type="number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>



<div className="col-md-6 account-detail">
                    {/* <h4 className="m-b-20 col-md-12">Account Detail</h4> */}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="scom">Session Commision:</label>
                          <p>Current: {childData.scom}%</p>
                          <input
                            className="form-control"
                            placeholder="Mcom Limit"
                            {...register("scom")}
                            id="scom"
                            defaultValue={0}
                            min="0"
                            // value={childData.scom}
                            // required
                            type="number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
                {!isExposerAllow && (
                  <div className="row m-t-20 hidden" id="partnership-div">
                    <div className="col-md-12">
                      {/* <h4 className="m-b-20 col-md-12">Commision</h4> */}
                      <table className="table table-striped table-borderedddd">
                        <thead>
                          <tr>
                            <th />
                            {sportListState.sports.map((sports: ISport) =>
                              sports.sportId === 1 ||
                              sports.sportId === 2 ||
                              sports.sportId === 4 ? (
                                <th key={sports._id}>
                                  {
                                    // sports.name === "Cricket" ? "Casino %" :
                                    sports.name === "Soccer"
                                      ? "Match Commission %"
                                      : sports.name === "Tennis"
                                      ? "Session Commission %"
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
                            {/* <td>Upline</td> */}
                            <td></td>

                            {sportListState.sports.map(({ _id, sportId }) =>
                              sportId == 1 || sportId == 2 ? (
                                <td
                                  id="taxpartnership-upline"
                                  key={`upline-${_id}`}
                                >
                                  {userData?.partnership?.[sportId]?.ownRatio}
                                </td>
                              ) : (
                                <td key={_id} />
                              )
                            )}
                          </tr>

                          <tr>
                            <td></td>
                            {/* <td>Downline</td> */}

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
                                  <td className="" key={_id}>
                                    <input
                                      className="partnership"
                                      {...register(`partnership.${sportId}`, {
                                        onChange: (e) => {
                                          const input = Number(e.target.value);
                                          const own =
                                            userData?.partnership?.[sportId]?.ownRatio || 0;
                                          setValue(
                                            `partnershipOur.${sportId}`,
                                            own - input
                                          );
                                        },
                                      })}
                                      id={`partnership.${sportId}`}
                                      placeholder=""
                                      max={
                                        userData?.partnership?.[sportId]?.ownRatio 
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

                          <tr>
                            {/* <td>Our</td> */}
                            <td></td>

                            {sportListState.sports?.map(({ _id, sportId }) =>
                              sportId == 1 || sportId == 2 ? (
                                <td
                                className="hidden"
                                  id={`taxpartnership-our.${sportId}`}
                                  key={_id}
                                >
                                  <input
                                    {...register(`partnershipOur.${sportId}`)}
                                    value={
                                      userData?.partnership?.[sportId].ownRatio ?? 0
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

                          <tr className="hidden">
                            {/* <td>{childData?.username} Current Commision</td> */}
                            {sportListState.sports?.map(({ _id, sportId }) =>
                              sportId == 1 || sportId == 2 ? (
                                <td
                                  id={`taxpartnership-our.${sportId}`}
                                  key={_id}
                                >
                                  <input
                                    // {...register(`partnershipOur.${sportId}`)}
                                    value={
                                      selectedUserChild?.partnership?.[sportId]?.ownRatio ?? 0
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
                  style={{ display: "none" }}
                  className="row m-t-20"
                  id="min-max-bet-div"
                >
                  <div className="col-md-12">
                    <h4 className="m-b-20 col-md-12"></h4>
                    <table className="table table-striped table-bordereddd">
                      <thead>
                        <tr>
                          <th />
                          {sportListState.sports?.map((sports: any) =>
                            sports.sportId === 1 ||
                            sports.sportId === 2 ||
                            sports.sportId === 4 ? (
                              <th key={sports._id}>
                                {
                                  // sports.name === "Cricket" ? "Casino %" :
                                  // sports.name === "Soccer" ? "Match %" :
                                  // sports.name === "Tennis" ? "Fancy %" :
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
                        <tr>
                          <td></td>
                          {sportListState.sports?.map(({ _id, sportId }) =>
                            sportId == 1 || sportId == 2 || sportId == 4 ? (
                              <td id="minbet" key={_id}>
                                {userData?.userSetting?.[sportId]?.minBet}
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
                <div className="row m-t-20 hidden">
                  <div className="col-md-12"></div>
                </div>
                <div className="row m-t-20">
                  <div className="col-md-12">

              <div className="fixe inset-0 flex items-center justify-center bg-blac bg-opacity-50 z-50">
  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs text-center">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">Are you sure?</h2>
    <SubmitButton type="submit" className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-lg">
      Delete
    </SubmitButton>
  </div>
</div>
                    {/* <div className="float-right">
                      <SubmitButton className="btn btn-submit" type="submit">
                        Edit User
                      </SubmitButton>
                    </div> */}
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
export default DeleteUser;
