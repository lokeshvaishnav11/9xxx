import React, { useState } from "react";
import "./ClientLedger.css"; // Import the CSS file
import betService from "../../../services/bet.service";
import { AxiosResponse } from "axios";

interface CommissionRow {
  name: string;
  cname: string;
  milaCasinoComm: number;
  milaSportsComm: number;
  milaTotalComm: number;
  denaCasinoComm: number;
  denaSportsComm: number;
  denaTotalComm: number;
  date?: string;
}

const CommisionLenden: React.FC = () => {
  const [commissionData, setCommissionData] = useState<CommissionRow[]>([]);
  const [allEntries, setAllEntries] = useState<any[][]>([]);

  const [optionuser, setOptionuser] = React.useState<string>("all");

  const [startDate, setStartDate] = React.useState<string>("");
const [endDate, setEndDate] = React.useState<string>("");


  React.useEffect(() => {
    betService.oneledger().then((res: AxiosResponse<any>) => {
      console.log(res, "dmbsdbh lena dena");
      const data = res.data.data;
      const processed = processCommissionTable(data);
      setCommissionData(processed);
      setAllEntries(data);
    });
  }, []);

  const processCommissionTable = (data: any[][]): CommissionRow[] => {
    const milaCasinoMap: Record<string, number> = {};
    const milaSportsMap: Record<string, number> = {};
    const denaCasinoMap: Record<string, number> = {};
    const denaSportsMap: Record<string, number> = {};
    const usernameMap: Record<string, string> = {};
    const cnameMap: Record<string, string> = {};


    // const sourceArray = data[0]?.length > 0 ? data[1] : data[1] || [];
    const sourceArray = data[0]?.length > 0 ? data[0] : data[0] || [];

    sourceArray.forEach((entry: any) => {
      const childId = entry.ChildId;
      const isFancy = entry.Fancy === true;

      // const mila = entry.commissionlega || 0;
      // const dena = entry.commissiondega || 0;
      const mila = entry.iscomSet ? 0 : (entry.commissionlega || 0);
      const dena = entry.iscomSet ? 0 : (entry.commissiondega || 0);

      // Set name based on ParentId match from data[0]
      if (!usernameMap[childId]) {
        const match = data[0]?.find((ref: any) => ref.ParentId === childId);
        usernameMap[childId] = match?.username || entry.username || childId;
      }


      if (!cnameMap[childId]) {
        const match = data[0]?.find((ref: any) => ref.ParentId === childId);
        cnameMap[childId] = match?.cname || entry.cname || childId;
      }

      // Init maps
      if (!milaCasinoMap[childId]) milaCasinoMap[childId] = 0;
      if (!milaSportsMap[childId]) milaSportsMap[childId] = 0;
      if (!denaCasinoMap[childId]) denaCasinoMap[childId] = 0;
      if (!denaSportsMap[childId]) denaSportsMap[childId] = 0;

      // Sort into sports or casino
      if (isFancy) {
        milaSportsMap[childId] += mila;
        denaSportsMap[childId] += dena;
      } else {
        milaCasinoMap[childId] += mila;
        denaCasinoMap[childId] += dena;
      }
    });

    const allChildIds = new Set([
      ...Object.keys(milaCasinoMap),
      ...Object.keys(milaSportsMap),
      ...Object.keys(denaCasinoMap),
      ...Object.keys(denaSportsMap),
    ]);

    let totalMilaCasino = 0;
    let totalMilaSports = 0;
    let totalDenaCasino = 0;
    let totalDenaSports = 0;

    const result: CommissionRow[] = [];

    allChildIds.forEach((id) => {
      const milaCasino = milaCasinoMap[id] || 0;
      const milaSports = milaSportsMap[id] || 0;
      const denaCasino = denaCasinoMap[id] || 0;
      const denaSports = denaSportsMap[id] || 0;

      totalMilaCasino += milaCasino;
      totalMilaSports += milaSports;
      totalDenaCasino += denaCasino;
      totalDenaSports += denaSports;

      result.push({
        name: usernameMap[id] || id,
        cname: cnameMap[id] || id,
        milaCasinoComm: milaCasino,
        milaSportsComm: milaSports,
        milaTotalComm: milaCasino + milaSports,
        denaCasinoComm: denaCasino,
        denaSportsComm: denaSports,
        denaTotalComm: denaCasino + denaSports,
      });
    });

    result.push({
      name: "TOTAL",
      cname:"All",
      milaCasinoComm: totalMilaCasino,
      milaSportsComm: totalMilaSports,
      milaTotalComm: totalMilaCasino + totalMilaSports,
      denaCasinoComm: totalDenaCasino,
      denaSportsComm: totalDenaSports,
      denaTotalComm: totalDenaCasino + totalDenaSports,
    });

    console.log(result,"ressss")

    return result;
  };


  const handleDateFilter = () => {
    if (!startDate || !endDate) return;
  
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include full end day
  
    const filteredData = allEntries[0]?.filter((entry: any) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= start && entryDate <= end;
    }) || [];
  
    // Reprocess only with filtered entries
    const updatedCommissionData = processCommissionTable([filteredData]);
    setCommissionData(updatedCommissionData);
  };
  

  const renderUserDetails = (childId: string) => {
    console.log(childId, "cjhild");
    console.log(allEntries, "allentries");
    const sourceArray =
      allEntries[1]?.length > 0 ? allEntries[0] : allEntries[0] || [];
    console.log(sourceArray, "source array");
    const filtered = sourceArray.filter(
      (item: any) => item.username === childId
    );

    let totalMilaCasino = 0;
    let totalMilaSports = 0;
    let totalDenaCasino = 0;
    let totalDenaSports = 0;

    const rows = filtered.map((item: any, index: number) => {
      const isFancy = item.Fancy === true;
      const mila = item.commissionlega || 0;
      const dena = item.commissiondega || 0;

      if (isFancy) {
        totalMilaSports += mila;
        totalDenaSports += dena;
      } else {
        totalMilaCasino += mila;
        totalDenaCasino += dena;
      }

      return (
        <tr key={index}>
          <td>{new Date(item.createdAt).toLocaleString()}</td>
          <td>{item.narration || "N/A"}</td>
          <td>{!isFancy ? mila.toFixed(2) : "-"}</td>
          <td>{isFancy ? mila.toFixed(2) : "-"}</td>
          <td>{!isFancy ? dena.toFixed(2) : "-"}</td>
          <td>{isFancy ? dena.toFixed(2) : "-"}</td>
        </tr>
      );
    });

    const totalRow = (
      <tr>
        <td colSpan={2}>
          <strong>TOTAL</strong>
        </td>
        <td>{totalMilaCasino.toFixed(2)}</td>
        <td>{totalMilaSports.toFixed(2)}</td>
        <td>{totalDenaCasino.toFixed(2)}</td>
        <td>{totalDenaSports.toFixed(2)}</td>
      </tr>
    );

    return [...rows, totalRow];
  };


//  date filter in particular user too 
  // const renderUserDetails = (childId: string) => {
  //   const sourceArray = allEntries[0] || [];
  
  //   const filtered = sourceArray.filter((item: any) => {
  //     const matchesUser = item.username === childId;
  //     if (!startDate || !endDate) return matchesUser;
  
  //     const entryDate = new Date(item.createdAt);
  //     const start = new Date(startDate);
  //     const end = new Date(endDate);
  //     end.setHours(23, 59, 59, 999);
  
  //     return matchesUser && entryDate >= start && entryDate <= end;
  //   });
  //   ...
  // };
  

  console.log(commissionData,"commsiondata")

  // const settled = (name:any) =>{
  //   betService.comreset(name).then((res)=>{
  //     console.log(res,"check resetttt")
  //   })
  // }


  const settled = async (name: string) => {
    try {
      const res = await betService.comreset({name});
      console.log("Reset response:", res);
      if(res.data.status){
        window.location.reload()
      }
      // Optionally, show success toast or refresh data
    } catch (error) {
      console.error("Reset failed:", error);
      // Optionally, show error toast
    }
  };
  

  return (
    <div>
      <div className="bg-full">Commision Len Den</div>


      <div className="row p-4">
	   <div className="col-6 mt-1">
	      <label className="small"> Start Date</label>
	      {/* <input type="date" className="form-control start_date "  name="start_date"/> */}
        <input
  type="date"
  className="form-control start_date"
  name="start_date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
/>

	   </div>
	   <div className="col-6 mt-1">
	      <label className="small"> End Date</label>
	      {/* <input type="date" className="form-control end_date "  name="end_date"/> */}
        <input
  type="date"
  className="form-control end_date"
  name="end_date"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
/>
	   </div>

     <button className="btn btn-primary mt-2 mx-3" onClick={handleDateFilter}>
  Submit
</button>

	  
	</div>

      <select
        id="select-tools-sa"
        className="selectized mx-4 selectize-input ng-valid ng-not-empty ng-dirty ng-valid-parse ng-touched"
        value={optionuser}
        onChange={(e) => setOptionuser(e.target.value)}
      >
        <option value="all">All Clients</option>
        {commissionData?.map((row: any, index) => (
          <option key={index} value={row.client}>
            {row.name}
          </option>
        ))}
      </select>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="commission-table">
            <thead>
              {optionuser === "all" ? (
                <>
                  <tr>
                    <th style={{borderRightColor:"#424242", borderRightWidth:"20px"}} colSpan={4}>MILA HAI</th>
                    <th  colSpan={4}>DENA HAI</th>
                  </tr>
                  <tr>
                    <th>Name</th>
                    <th >M Comm</th>
                    <th>S Comm</th>
                    <th style={{borderRightColor:"#424242", borderRightWidth:"20px"}}>Total Comm</th>
                    <th>M Comm</th>
                    <th>S Comm</th>
                    <th>Total Comm</th>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <th>Date</th>
                    <th>Narration</th>
                    <th>M Mila</th>
                    <th>S Mila</th>
                    <th>M Dena</th>
                    <th>S Dena</th>
                  </tr>
                </>
              )}
            </thead>
            <tbody>
              {optionuser === "all"
                ? commissionData?.filter((row, index, self) => index === self.findIndex((r) => r.name === row.name))?.map((row) => (
                    <tr  key={row.name}>
                      <td className="">{row.name}{`(${row.cname})`}<button onClick={() => settled(row.name)} className="bg-yellow-400 mt-1.5 px-2 py-1.5 rounded-md">Reset</button></td>
                      <td className="">{row.milaCasinoComm.toFixed(2)}</td>
                      <td>{row.milaSportsComm.toFixed(2)}</td>
                      <td style={{borderRightColor:"#424242", borderRightWidth:"20px"}}>{row.milaTotalComm.toFixed(2)}</td>
                      <td>{row.denaCasinoComm.toFixed(2)}</td>
                      <td>{row.denaSportsComm.toFixed(2)}</td>
                      <td>{row.denaTotalComm.toFixed(2)}</td>
                    </tr>
                  ))
                : renderUserDetails(optionuser)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommisionLenden;
