import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import { toast } from "react-toastify";
import * as Yup from "yup";
import User from "../../../../models/User";
import UserService from "../../../../services/user.service";
import { useEffect } from "react";
import SubmitButton from "../../../../components/SubmitButton";
import DeleteUser from "../../add-user/DeleteUser";

const DeleteModal = ({
  userDetails,
  showDialog,
  closeModal,
  refreshClientList,
}: {
  userDetails: User | undefined;
  showDialog: boolean;
  closeModal: (type: string) => void;
  refreshClientList: (type: boolean) => void;
}) => {
  const statusValidationSchema = Yup.object().shape({
    isUserActive: Yup.boolean(),
    isUserBetActive: Yup.boolean(),
    // transactionPassword: Yup.string().required('Transaction Password is required'),
  });


  console.log(userDetails,"UserDetails");
  

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<{
    isUserActive: boolean;
    isUserBetActive: boolean;
    transactionPassword: string;
  }>({
    defaultValues: {
      isUserActive: userDetails?.isLogin,
      isUserBetActive: userDetails?.betLock,
      transactionPassword: "123456",
    },
    resolver: yupResolver(statusValidationSchema),
  });

  useEffect(() => {
    setValue("isUserBetActive", userDetails?.betLock ? true : false);
    setValue("isUserActive", userDetails?.isLogin ? true : false);
    setValue("transactionPassword", "123456");
  }, [userDetails, setValue]);

  const onSubmit = handleSubmit((data) => {
    const formData = {
      ...data,
      username: userDetails?.username,
    };

    UserService.updateUserAndBetStatus(formData).then(() => {
      closeModal("s");
      toast.success("Status Updated Successfully");
      refreshClientList(true);
      reset();
    });
  });

  // console.log(userDetails,"userdetails")
  return (
    <>
      <Modal
        isOpen={showDialog}
        onRequestClose={() => {
          closeModal("s");
          reset();
        }}
        contentLabel="Status"
        className={"modal-dialog"}
      >
        <div style={{ width: "100%" }} className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Delete User</h4>
          </div>

          <DeleteUser data={userDetails} />
        </div>
      </Modal>
    </>
  );
};

export default DeleteModal;
