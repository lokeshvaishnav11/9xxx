// import React from "react";
// import "./ClientLedger.css"
// import { AxiosResponse } from "axios";
// import betService from "../../../services/bet.service";
// const ReportModal = (data:any) => {
//     console.log(data, "check username")


//     React.useEffect(() => {
//         betService.oneledger().then((res: AxiosResponse<any>) => {
//           console.log(res, "maatchh modal res")   });
//         }, []);


//   return (
//     <>
//         <div className="modal-content ">
//           <div className="modal-header">
//             <h6 style={{ width: "100%" }} className="pt-2 ng-binding">
//               Report Rahul (C139000)
//             </h6>
            
//           </div>
//           <div className="modal-body">
//             <div
//               className="container bg-light p-0 m-0"
//               style={{ width: "100%", overflow: "auto" }}
//             >
//               <table className="small table table-striped table-bordered m-0">
//                 <thead>
//                   <tr>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       Match Name
//                     </th>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       Start Date
//                     </th>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       Match (+/-)
//                     </th>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       Session (+/-)
//                     </th>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       Total
//                     </th>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       M.Com
//                     </th>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       S.Com
//                     </th>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       T.Com
//                     </th>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       G. Total
//                     </th>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       UP. Share
//                     </th>
//                     <th className="navbar-bet99 text-dark pt-0 pb-0 small">
//                       Balance--
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr className="ng-scope" ng-repeat="row in showfullreport">
//                     <td
//                       className="p-1 pt-0 pb-0 ng-binding"
//                       style={{ fontSize: "xx-small" }}
//                     >
//                       Mumbai Indians v Royal Challengers Bengaluru
//                     </td>
//                     <td
//                       className="p-1 pt-0 pb-0 ng-binding"
//                       style={{ fontSize: "xx-small" }}
//                     >
//                       04/07/2025 07:30:00 PM
//                     </td>
//                     <td
//                       className="pt-0 pb-0 ng-binding text-secondary"
//                       ng-class="row.net_p_l_odds != 0 ? (row.net_p_l_odds > 0 ? 'text-success':'text-danger'):'text-secondary'"
//                     >
//                       0.00
//                     </td>
//                     <td
//                       className="pt-0 pb-0 ng-binding text-success"
//                       ng-class="row.net_p_l_session != 0 ? (row.net_p_l_session > 0 ? 'text-success':'text-danger'):'text-secondary'"
//                     >
//                       200.00
//                     </td>
//                     <td
//                       className="pt-0 pb-0 ng-binding text-success"
//                       ng-class="row.total_pandl != 0 ? (row.total_pandl > 0 ? 'text-success':'text-danger'):'text-secondary'"
//                     >
//                       200.00
//                     </td>
//                     <td
//                       className="pt-0 pb-0 ng-binding text-secondary"
//                       ng-class="row.match_comm != 0 ? (row.match_comm > 0 ? 'text-danger':'text-danger'):'text-secondary'"
//                     >
//                       0.00
//                     </td>
//                     <td
//                       className="pt-0 pb-0 ng-binding text-danger"
//                       ng-class="row.sess_comm != 0 ? (row.sess_comm > 0 ? 'text-danger':'text-danger'):'text-secondary'"
//                     >
//                       4.00
//                     </td>
//                     <td
//                       className="pt-0 pb-0 ng-binding text-danger"
//                       ng-class="row.total_comm != 0 ? (row.total_comm > 0 ? 'text-danger':'text-danger'):'text-secondary'"
//                     >
//                       4.00
//                     </td>
//                     <td
//                       className="pt-0 pb-0 ng-binding text-success"
//                       ng-class="row.total_amount != 0 ? (row.total_amount > 0 ? 'text-success':'text-danger'):'text-secondary'"
//                     >
//                       204.00
//                     </td>
//                     <td
//                       className="pt-0 pb-0 ng-binding text-success"
//                       ng-class="row.my_share != 0 ? (row.my_share > 0 ? 'text-success':'text-danger'):'text-secondary'"
//                     >
//                       204.00
//                     </td>
//                     <td
//                       className="pt-0 pb-0 ng-binding text-success"
//                       ng-class="row.net_amt != 0 ? (row.net_amt > 0 ? 'text-success':'text-danger'):'text-secondary'"
//                     >
//                       204.00
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//           <div className="modal-footer">
//             {/* <button type="button" className="btn btn-info" data-dismiss="modal">
//               Close
//               <svg
//                 className="svg-inline--fa fa-times fa-w-11"
//                 aria-hidden="true"
//                 data-prefix="fa"
//                 data-icon="times"
//                 role="img"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 352 512"
//                 data-fa-i2svg=""
//               >
//                 <path
//                   fill="currentColor"
//                   d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
//                 ></path>
//               </svg>
//               <i className="fa fa-times"></i>
//             </button> */}
//           </div>
//         </div>
//     </>
//   );
// };

// export default ReportModal;





// import React, { useEffect, useState } from "react";
// import "./ClientLedger.css";
// import { AxiosResponse } from "axios";
// import betService from "../../../services/bet.service";

// const ReportModal = ({ data }: any) => {
//   const username = data; // passed prop
//   const [userEntries, setUserEntries] = useState<any[]>([]);

//   useEffect(() => {
//     betService.oneledger().then((res: AxiosResponse<any>) => {
//       const allEntries = res.data.data[0]; // list of entries
//       if (!allEntries) return;

//       // Filter by username
//       const filtered = allEntries.filter((entry: any) => entry.username === username);

//       // Group by narration
//       const grouped: Record<string, any> = {};
//       filtered.forEach((entry: any) => {
//         const narration = entry.narration;
//         if (!grouped[narration]) {
//           grouped[narration] = {
//             match: 0,
//             session: 0,
//             narration,
//             startDate: new Date().toLocaleString(), // set actual match start time if available
//           };
//         }

//         if (entry.Fancy) {
//           grouped[narration].session += Number(entry.money);
//         } else {
//           grouped[narration].match += Number(entry.money);
//         }
//       });

//       // Transform to array
//       const result = Object.values(grouped).map((row: any) => ({
//         ...row,
//         total: row.match + row.session,
//       }));

//       setUserEntries(result);
//     });
//   }, [username]);

//   return (
//     <div className="modal-content">
//       <div className="modal-header">
//         <h6 style={{ width: "100%" }} className="pt-2 ng-binding">
//           Report {username}
//         </h6>
//       </div>
//       <div className="modal-body">
//         <div className="container bg-light p-0 m-0" style={{ width: "100%", overflow: "auto" }}>
//           <table className="small table table-striped table-bordered m-0">
//             <thead>
//               <tr>
//                 <th>Match Name</th>
//                 <th>Start Date</th>
//                 <th>Match (+/-)</th>
//                 <th>Session (+/-)</th>
//                 <th>Total</th>
//                 <th>M.Com</th>
//                 <th>S.Com</th>
//                 <th>T.Com</th>
//                 <th>G. Total</th>
//                 <th>UP. Share</th>
//                 <th>Balance--</th>
//               </tr>
//             </thead>
//             <tbody>
//               {userEntries.map((entry, i) => (
//                 <tr key={i}>
//                   <td style={{ fontSize: "xx-small" }}>{entry.narration}</td>
//                   <td style={{ fontSize: "xx-small" }}>{entry.startDate}</td>
//                   <td className={entry.match > 0 ? "text-success" : entry.match < 0 ? "text-danger" : "text-secondary"}>
//                     {entry.match.toFixed(2)}
//                   </td>
//                   <td className={entry.session > 0 ? "text-success" : entry.session < 0 ? "text-danger" : "text-secondary"}>
//                     {entry.session.toFixed(2)}
//                   </td>
//                   <td className={entry.total > 0 ? "text-success" : entry.total < 0 ? "text-danger" : "text-secondary"}>
//                     {entry.total.toFixed(2)}
//                   </td>
//                   <td className="text-secondary">0.00</td>
//                   <td className="text-secondary">0.00</td>
//                   <td className="text-secondary">0.00</td>
//                   <td className={entry.total > 0 ? "text-success" : entry.total < 0 ? "text-danger" : "text-secondary"}>
//                     {entry.total.toFixed(2)}
//                   </td>
//                   <td className="text-success">{entry.total.toFixed(2)}</td>
//                   <td className="text-success">{entry.total.toFixed(2)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       <div className="modal-footer"></div>
//     </div>
//   );
// };

// export default ReportModal;


import React, { useEffect, useState } from "react";
import "./ClientLedger.css";
import { AxiosResponse } from "axios";
import betService from "../../../services/bet.service";
import { useAppSelector } from "../../../redux/hooks";
import { selectUserData } from "../../../redux/actions/login/loginSlice";

const ReportModal = ({ data }: any) => {
  const username = data; // passed prop
  const [userEntries, setUserEntries] = useState<any[]>([]);
      const userState = useAppSelector(selectUserData);
  

  useEffect(() => {
    betService.twoledger().then((res: AxiosResponse<any>) => {
      const allEntries = res?.data?.data  || []; // list of entries
      if (!allEntries) return;

      // Filter by username
      const filtered = allEntries.filter((entry: any) => entry.username === username);

      // Group by narration
      const grouped: Record<string, any> = {};
      filtered.forEach((entry: any) => {
        const narration = entry.narration;
        if (!grouped[narration]) {
          grouped[narration] = {
            match: 0,
            session: 0,
            matchComm: 0,
            sessionComm: 0,
            narration,
            updowon: entry.umoney,
            startDate: new Date(entry.createdAt).toLocaleString(), // set actual match start time if available
          };
        }

        // Calculate match and session totals
        if (entry.Fancy) {
          grouped[narration].session += Number(entry.money);
          // Add commissiondega for Fancy = true to sessionComm
          grouped[narration].sessionComm += Number(entry.commissiondega);
        } else {
          grouped[narration].match += Number(entry.money);
          // Add commissiondega for Fancy = false to matchComm
          grouped[narration].matchComm += Number(entry.commissiondega);
        }
      });

      // Transform to array
      const result = Object.values(grouped).map((row: any) => ({
        ...row,
        // total: row.match + row.matchComm + row.session + row.sessionComm,
        total: row.match + row.session,
       

      }));

      setUserEntries(result);
    });
  }, [username]);

  return (
    <div style={{width:"100%"}} className="modal-content">
      <div className="modal-header">
        <h6 style={{ width: "100%" }} className="ng-binding">
          Report {username}
        </h6>
      </div>
      <div className="modal-body">
        <div className="container bg-light p-0 m-0" style={{ width: "100%", overflow: "auto" }}>
          <table className="small table table-striped table-bordered m-0">
            <thead>
              <tr>
                <th>Match Name</th>
                <th>Start Date</th>
                <th>Match (+/-)</th>
                <th>Session (+/-)</th>
                <th>Total</th>
                <th>M.Com</th>
                <th>S.Com</th>
                <th>T.Com</th>
                <th>G. Total</th>
                <th>UP. Share</th>
                <th>Balance--</th>
              </tr>
            </thead>
            <tbody>
              {userEntries.map((entry, i) => (
                <tr key={i}>
                  <td style={{ fontSize: "xx-small" }}>{entry.narration}</td>
                  <td style={{ fontSize: "xx-small" }}>{entry.startDate}</td>
                  <td className={entry.match > 0 ? "text-success" : entry.match < 0 ? "text-danger" : "text-secondary"}>
                  { `${(entry.match + entry.matchComm).toFixed(2)}`  }
                  </td>
                  <td className={entry.session > 0 ? "text-success" : entry.session < 0 ? "text-danger" : "text-secondary"}>
                    {/* {entry.session.toFixed(2)} */}
                    {  `${(entry.session + entry.sessionComm).toFixed(2)}` }

                  </td>
                  <td className={entry.total > 0 ? "text-success" : entry.total < 0 ? "text-danger" : "text-secondary"}>
                    {entry.total.toFixed(2)}
                  </td>
                  <td className={entry.matchComm > 0 ? "text-danger" : "text-secondary"}>
                    {entry.matchComm.toFixed(2)}
                  </td>
                  <td className={entry.sessionComm > 0 ? "text-danger" : "text-secondary"}>
                    {entry.sessionComm.toFixed(2)}
                  </td>
                  <td className="text-secondary">{(entry.matchComm + entry.sessionComm).toFixed(2)}</td>
                  <td className={entry.total > 0 ? "text-success" : entry.total < 0 ? "text-danger" : "text-secondary"}>
                    {entry.total.toFixed(2)}
                  </td>
                  <td className="text-success">{entry.total.toFixed(2)}</td>
                  <td className="text-success">{entry.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="modal-footer"></div>
    </div>
  );
};

export default ReportModal;
