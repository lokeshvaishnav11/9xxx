import React, { useEffect } from "react";
import ReactModal from "react-modal";
import { useNavigate } from "react-router-dom";

const Welcome = (props: any) => {
  const [isOpen, setIsOpen] = React.useState(true);
  // const navigate = useNavigate() // ✅ Hook at top level

  // useEffect(() => {
  //   navigate("/rules")
  // }, [navigate])

  return (
    <>
      {/* old ui of welomc page  */}
      <ReactModal
        isOpen={isOpen}
        onRequestClose={(e: any) => {
          setIsOpen(false);
        }}
        contentLabel="Set Max Bet Limit"
        className={"modal-dialog modal-lg margin-modal"}
        ariaHideApp={false}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="text-white">Welcome to BXPRO99</h5>
            <button
              onClick={() => setIsOpen(false)}
              className="close float-right"
            >
              <i
                className="fa fa-times-circle text-white"
                aria-hidden="true"
              ></i>
            </button>
          </div>
          <div
            className="modal-body p0"
            style={{ height: "89vh", display: "none" }}
          >
            <img
              src="https://sitethemedata.com/common/wel-banner/wel-1733052794189.png"
              className="img-fluid"
            ></img>
          </div>

          <div className="modal-body p-2">
            <h4 style={{ margin: "0px", fontSize:"13px",  textAlign:"center" ,  fontWeight:"bold", marginBottom:"15px" , marginTop:"10px" }}>प्रिय ग्राहक,</h4>
            <p style={{fontSize:"13px", textAlign:"center", padding:"4px"}}>
              प्रिय ग्राहक, आपसे अनुरोध है हमारी कोई डुप्लीकेट साइट नही है हमारी
              आधिकारिक साइट 'BXPRO99.xyz' से लॉगिन करें। लॉगइन करने से पहले साइट
              का नाम जरूर देख लें। आपके समर्थन के लिए धन्यवाद। टीम BXPRO99
            </p>
            <h4 style={{ margin: "0px", fontSize:"13px",  textAlign:"center" , fontWeight:"bold", marginBottom:"15px" , marginTop:"10px" }}>Dear Client,</h4>
            <p style={{fontSize:"13px", textAlign:"center", padding:"4px"}}>
              We don't have any duplicate site , You are requested to login with
              our official site 'BXPRO99.xyz .I only. Please check the site name
              before you login. Thanks for your support. Team BXPRO99
            </p>
            <button  onClick={() => setIsOpen(false)} style={{ backgroundColor: "0f2327" }}
        className="btn w-100 mt-2 text-white">Close</button>
          </div>
        </div>
      </ReactModal>
    </>
  );
};
export default React.memo(Welcome);
