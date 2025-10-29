import React from 'react'
import './newprofile.css'
import { selectUserData } from '../../redux/actions/login/loginSlice';
import { useAppSelector } from '../../redux/hooks';
import User from '../../models/User';

import UserService from "../../services/user.service";
import { AxiosResponse } from 'axios';


const Newprofile = () => {

   const userState = useAppSelector<{ user: User }>(selectUserData);
    console.log(userState,"user")


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

    
  return (
    <>
    <div>

    <div
      className={`body-wrap`}
      style={{ overflow: "hidden" }}
    >
      <div className="back-main-menu my-3">
        <a href="/">BACK TO MAIN MENU</a>
      </div>

      <div className="profile-data-table">
        {/* Rate Information Section */}
        <table width="100%" cellSpacing={0} cellPadding={0}>
          <tbody>
            <tr>
              <td>
                <table width="100%">
                  <tbody>
                    <tr>
                      <td>
                        <table width="100%">
                          <tbody>
                            {/* <tr>
                              <td height="35" style={{ backgroundColor: "#d2e69c", textAlign: "center" }} className="TeamCombo">
                                <p style={{ color: "#333", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, fontWeight: "bold", marginBottom: 0 }}>
                                  RATE INFORMATION
                                </p>
                              </td>
                            </tr> */}
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <table width="100%" cellPadding={2} cellSpacing={2} className="tbl-inr">
                          <tbody>
                            <tr>
                              {/* <td width="33%" className="font_text_blue" style={{ backgroundColor: "#fff", verticalAlign: "middle", textAlign: "left", paddingRight: 5 }}>
                                Rate Difference :
                              </td> */}
                              {/* <td width="33%" className="font_text_blue" style={{ backgroundColor: "#fff", verticalAlign: "middle", textAlign: "center", paddingRight: 5 }}>
                                <select>
                                  <option value="6" selected>6</option>
                                  <option value="7">7</option>
                                  <option value="8">8</option>
                                  <option value="9">9</option>
                                  <option value="10">10</option>
                                </select>
                              </td> */}
                              {/* <td width="33%" className="font_text_blue" style={{ backgroundColor: "#fff", verticalAlign: "middle", textAlign: "center", paddingRight: 5 }}>
                                <div className="menu" id="menu">
                                  <ul className="nav">
                                    <li className="active_rate">
                                      <a href="#">UPDATE</a>
                                    </li>
                                  </ul>
                                </div>
                              </td> */}
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Personal Information */}
            <tr>
              <td>
                <table width="100%">
                  <tbody>
                    <tr>
                      <td>
                        <table width="100%">
                          <tbody>
                            <tr>
                              <td height="35" style={{ backgroundColor: "#d2e69c", textAlign: "center" }} className="TeamCombo">
                                <p style={{ color: "#333", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, fontWeight: "bold", marginBottom: 0 }}>
                                  PERSONAL INFORMATION
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <table width="100%" cellPadding={2} cellSpacing={2} className="tbl-inr">
                          <tbody>
                            <tr>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>Client Code :</td>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>{userAlldata?.code}</td>
                            </tr>
                            <tr>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>Client Name :</td>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>{userState?.user?.username} </td>
                            </tr>
                            <tr>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>Contact No :</td>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}></td>
                            </tr>
                            <tr>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>Date Of Joining :</td>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>  {new Date(userAlldata?.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                              </td>
                            </tr>
                            <tr>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>Address :</td>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>INDIA</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Company Information */}
            <tr>
              <td>
                <table width="100%">
                  <tbody>
                    <tr>
                      <td>
                        <table width="100%">
                          <tbody>
                            <tr>
                              <td height="35" style={{ backgroundColor: "#d2e69c", textAlign: "center" }} className="TeamCombo">
                                <p style={{ color: "#333", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, fontWeight: "bold", marginBottom: 0 }}>
                                  COMPANY INFORMATION
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table width="100%" cellPadding={2} cellSpacing={2} className="tbl-inr">
                          <tbody>
                            <tr>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>HELP LINE NO :</td>
                              <td className="font_text_blue" style={{ backgroundColor: "#fff", textAlign: "left", paddingRight: 5 }}>+91-1234567890</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="back-main-menu my-2">
        <a href="/">BACK TO MAIN MENU</a>
      </div>
    </div>

      </div>
      
      </>
  )
}

export default Newprofile