import React, { useState } from "react";
import "./newprofile.css";

const password = () => {
  //   const [oldPassword, setOldPassword] = React.useState("");
  //   const [newPassword, setNewPassword] = React.useState("");
  //   const [confirmPassword, setConfirmPassword] = React.useState("");
  //   const [errorText, setErrorText] = React.useState("");

  //   const handleSubmit = () => {
  //     if (newPassword !== confirmPassword) {
  //       setErrorText("New password and confirm password do not match.");
  //     } else {
  //       setErrorText("");
  //       // Handle password update logic here
  //       console.log("Password updated:", { oldPassword, newPassword });
  //     }
  //   };

  return (
    <>
      <div className="chng-password mt-2 px-2">
        <table width="100%" cellSpacing={0} cellPadding={0}>
          <tbody>
            <tr>
              <td height={45}>
                <table width="100%" cellSpacing={0} cellPadding={0}>
                  <tbody>
                    <tr>
                      <td className="font_text_black10px">&nbsp;</td>
                      <td
                        width="49%"
                        align="center"
                        height={35}
                        className="font_text_black10px"
                      >
                        OLD PASSWORD
                      </td>
                      <td align="center">
                        <input name="txtOldPassword" type="password" />
                      </td>
                      <td className="font_text_black10px">&nbsp;</td>
                    </tr>
                    <tr>
                      <td className="font_text_black10px">&nbsp;</td>
                      <td
                        align="center"
                        height={35}
                        className="font_text_black10px"
                      >
                        NEW PASSWORD
                        <span className="text-danger"> (ex. X1@xxxxx)</span>
                      </td>
                      <td align="center">
                        <input type="text" />
                      </td>
                      <td className="font_text_black10px">&nbsp;</td>
                    </tr>
                    <tr>
                      <td className="font_text_black10px">&nbsp;</td>
                      <td
                        align="center"
                        height={35}
                        className="font_text_black10px"
                      >
                        CONFIRM PASSWORD
                      </td>
                      <td align="center">
                        <input name="txtConfirmPassword" type="password" />
                        <br />
                        <br />
                        {/* {errorText && (
      <span id="errtxt" style={{ fontSize: 12 }} className="text-danger">
        {errorText}
      </span>
    )} */}
                      </td>
                      <td className="font_text_black10px">&nbsp;</td>
                    </tr>
                    {/* <tr>
                                      <td colSpan={4} align="center" className="font_text_black10px">
                                          <button
                                          >Update Password</button>
                                      </td>
                                  </tr> */}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td height={25}>&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="back-main-menu my-2">
        <a ng-click="changePassword()">CHANGE PASSWORD</a>
      </div>

      <div className="back-main-menu my-2">
        <a href="/">BACK TO MAIN MENU</a>
      </div>
    </>
  );
};

export default password;
