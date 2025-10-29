import betService from "../../../services/bet.service";
import { AxiosResponse } from "axios";
import React from "react";
import "./ClientLedger.css"; // Import the CSS file
import { green } from "@mui/material/colors";
import PaymentsIcon from '@mui/icons-material/Payments';
import { useAppSelector } from "../../../redux/hooks";
import User from "../../../models/User";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import { useNavigate, useParams } from "react-router-dom";
import { CustomLink } from "../../../pages/_layout/elements/custom-link";


interface LedgerEntry {
  settled: any;
  ChildId: string;
  username: string;
  commissionlega: number;
  commissiondega: number;
  money: number;
  narration: string;
  _id: string;
  user:any;
}

interface GroupedEntry {
  agent: string;
  amount: number;
  settled: number;
  final: number;
  ChildId: string;
}

const AllClientLedger = () => {
  //   const [tableData, setTableData] = React.useState<LedgerItem[]>([

    const userState = useAppSelector<{ user: User }>(selectUserData);
    console.log(userState)
  

  const [showModal, setShowModal] = React.useState(false);
  const [selectedEntry, setSelectedEntry] = React.useState<GroupedEntry | null>(
    null
  );
  const [inputAmount, setInputAmount] = React.useState<number>(0);
  const [remark, setRemark] = React.useState<string>("");
  const [modalType, setModalType] = React.useState<"lena" | "dena" | null>(
    null
  );

  const [lena, setLena] = React.useState<GroupedEntry[]>([]);
  const [dena, setDena] = React.useState<GroupedEntry[]>([]);
  const lenaTotals = lena.reduce(
    (acc, item) => {
      acc.amount += item.amount;
      acc.settled += item.settled;
      acc.final += item.final;
      return acc;
    },
    { amount: 0, settled: 0, final: 0 }
  );

  const denaTotals = dena.reduce(
    (acc, item) => {
      acc.amount += item.amount;
      acc.settled += item.settled;
      acc.final += item.final;
      return acc;
    },
    { amount: 0, settled: 0, final: 0 }
  );

  const grandTotals = {
    lena: lenaTotals.final,
    dena: denaTotals.final,
  };
  // const processLedgerData = (
  //   data: LedgerEntry[][]
  // ): { lenaArray: GroupedEntry[]; denaArray: GroupedEntry[] } => {



  //   // userState.user.role === "admin"

  //   // const flatData = [...(data[0] || []), ...(data[1] || [])]; //old wala hai 

  //   // const flatData = [...(data[0] || []), ...(data[0] || [])]; // ye naye wala hai for other than superadmin


  //   const flatData =
  //     userState.user.role === "admin"
  //       ? data[0] // for admin
  //       : data[0]; // for others


  //   const settledMap: Record<string, number> = {};
  //   flatData.forEach((entry: any) => {
  //     if (entry.settled) {
  //       if (!settledMap[entry.ChildId]) settledMap[entry.ChildId] = 0;
  //       settledMap[entry.ChildId] += Math.abs(entry.money);
  //     }
  //   });

  //   const activeMap: Record<
  //     string,
  //     { username: string; positive: number; negative: number }
  //   > = {};
  //   flatData.forEach((entry: any) => {
  //     if (!entry.settled) {
  //       const id = entry.ChildId;
  //       const username = entry.username + " (" + entry.cname + ")";


  //       // Compute money based on role
  //       // const money = userState.user.role === "dl" ? entry.money - entry.commissiondega : entry.money;




  //       const commission = userState.user.role === "dl" ? entry.commissiondega : 0;
  //       const money = entry.money - commission;




  //       // const money =  entry.money + entry.commissiondega ;


  //       if (!activeMap[id]) {
  //         activeMap[id] = { username, positive: 0, negative: 0 };
  //       }

  //       if (money > 0) {
  //         activeMap[id].positive += Math.abs(money);
  //       } else {
  //         activeMap[id].negative += Math.abs(money);
  //       }
  //     }
  //   });

  //   const lenaArray: GroupedEntry[] = [];
  //   const denaArray: GroupedEntry[] = [];

  //   Object.entries(activeMap).forEach(
  //     ([ChildId, { username, positive, negative }]) => {
  //       const rawAmount = positive - negative;
  //       const settledAmount = settledMap[ChildId] || 0;
  //       const netFinal = Math.max(0, Math.abs(Math.abs(rawAmount) - Math.abs(settledAmount)));
  //       // const netFinal = Math.abs(rawAmount - settledAmount);


  //       const baseData = {
  //         agent: username,
  //         amount: Math.abs(rawAmount),
  //         settled: settledAmount,
  //         final: netFinal,
  //         ChildId,
  //       };

  //       console.log(rawAmount - settledAmount, "raww amountt")

  //       if (rawAmount - settledAmount  >= 0) {
  //         lenaArray.push(baseData);
  //       } else {
  //         denaArray.push(baseData);
  //       }
  //     }
  //   );

  //   return { lenaArray, denaArray };
  // };


  const processLedgerData = (
    data: LedgerEntry[][]
  ): { lenaArray: GroupedEntry[]; denaArray: GroupedEntry[] } => {



    // userState.user.role === "admin"

    // const flatData = [...(data[0] || []), ...(data[1] || [])]; //old wala hai 

    // const flatData = [...(data[0] || []), ...(data[0] || [])]; // ye naye wala hai for other than superadmin


    const flatData =
      userState.user.role === "admin"
        ? data[0] // for admin
        : data[0]; // for others


    const settledMap: Record<string, number> = {};
    flatData.forEach((entry: any) => {
      if (entry.settled) {
        if (!settledMap[entry.ChildId]) settledMap[entry.ChildId] = 0;
        settledMap[entry.ChildId] += (entry.money);
      }
    });

    const activeMap: Record<
      string,
      { username: string; positive: number; negative: number }
    > = {};
    flatData.forEach((entry: any) => {
      if (!entry.settled) {
        const id = entry.ChildId;
        const username = entry.username + " (" + entry.cname + ")";


        // Compute money based on role
        // const money = userState.user.role === "dl" ? entry.money - entry.commissiondega : entry.money;




        const commission = userState.user.role === "dl" ? entry.commissiondega : 0;
        const money = entry.money - commission;




        // const money =  entry.money + entry.commissiondega ;


        if (!activeMap[id]) {
          activeMap[id] = { username, positive: 0, negative: 0 };
        }

        if (money > 0) {
          activeMap[id].positive += Math.abs(money);
        } else {
          activeMap[id].negative += Math.abs(money);
        }
      }
    });

    const lenaArray: GroupedEntry[] = [];
    const denaArray: GroupedEntry[] = [];

    Object.entries(activeMap).forEach(
      ([ChildId, { username, positive, negative }]) => {
        const rawAmount = positive - negative;
        console.log(positive,negative,rawAmount,username)
        const settledAmount = settledMap[ChildId] || 0;
        // const netFinal = Math.max(0, Math.abs(rawAmount  + settledAmount));
        const netFinal = rawAmount + settledAmount;

        console.log(netFinal ,settledAmount,'GHJK',username)
        const baseData = {
          agent: username,
          amount: rawAmount,
          settled: settledAmount,
          final: netFinal,
          ChildId,
        };

        console.log(rawAmount - settledAmount, "raww amountt")

        if (netFinal>=0 ) {
          lenaArray.push(baseData);
        }else{
          denaArray.push(baseData);
        }
      }
    );

    return { lenaArray, denaArray };
  };
  const settlementButton = async (id: any) => {
    // console.log(id,"chid from settlementButtonx")
    const data: any = { ChildId: id };
    await betService.postsettelement(data);
  };

  const sendId = useParams().pid
  console.log(sendId,"sendid ")

  const navigate = useNavigate()

  React.useEffect(() => {
    if (!sendId) return;
    betService
      .pponeledger(sendId)
      .then((res: AxiosResponse<{ data: LedgerEntry[][] }>) => {
        const usert:any = res.data.data[2]
        if(usert?.user?.role === "dl"){
          return  navigate(`/admin/list-clients/${usert.user.username}/user`,  { replace: true })
        }
        console.log(usert.user.role,"role")
        const { lenaArray, denaArray } = processLedgerData(res.data.data);
        setLena(lenaArray);
        setDena(denaArray);
        console.log(res, "Processed ledger data 222");
      });
  }, [sendId,navigate]);

  return (
    <>
      <p className="text-center bg-secondary tx-12 text-white p-1">My Ledger</p>

      <div className="ledger-container">
        <h2 className="ledger-title">All Client Ledger</h2>

        <h3>PAYMENT RECEIVING FROM (LENA HAI)</h3>
        <div className="table-section overflow-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>AGENT</th>
                <th className="final-amount">AMOUNT</th>
                <th className="final-amount">SETTLED</th>
                <th className="final-amount text-white bg-final bg-green" style={{ background: "green" }}>FINAL</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {lena.map((row) => (
                <tr key={row.ChildId}>
                  <td><CustomLink to={`/all-settlement/${row.ChildId}`}>{row.agent}</CustomLink></td>
                  <td>{row.amount.toFixed(2)}</td>
                  <td>{row.settled.toFixed(2)}</td>
                  <td className="bg-final text-white">{row.final.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => {
                        setSelectedEntry(row);
                        setInputAmount(0);
                        setRemark("");
                        setModalType("lena");
                        setShowModal(true);
                      }}
                    >
                      <PaymentsIcon /> Settlement
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-weight-bold bg-light">
                <td>LENA HAI</td>
                <td>{lenaTotals.amount.toFixed(2)}</td>
                <td>{lenaTotals.settled.toFixed(2)}</td>
                <td className="bg-final text-white">{lenaTotals.final.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-4">PAYMENT PAID TO (DENA HAI)</h3>
        <div className="table-section overflow-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>AGENT</th>
                <th className="final-amount">AMOUNT</th>
                <th className="final-amount">SETTLED</th>
                <th className="final-amount text-white bg-final" style={{ background: "#dc3545" }}>FINAL</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {dena.map((row) => (
                <tr key={row.ChildId}>
                  <td><CustomLink to={`/all-settlement/${row.ChildId}`}>{row.agent}</CustomLink></td>
                  <td>{row.amount.toFixed(2)}</td>
                  <td>{row.settled.toFixed(2)}</td>
                  <td className="bg-final2 text-white">{row.final.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => {
                        setSelectedEntry(row);
                        setInputAmount(0);
                        setRemark("");
                        setModalType("dena");
                        setShowModal(true);
                      }}
                    >
                      <PaymentsIcon /> Settlement
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-weight-bold bg-light">
                <td>DENA HAI</td>
                <td>{denaTotals.amount.toFixed(2)}</td>
                <td>{denaTotals.settled.toFixed(2)}</td>
                <td className="bg-final2 text-white">{denaTotals.final.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SINGLE MODAL OUTSIDE LOOP */}
        {showModal && selectedEntry && (
          <div className="modal-overlay">
            <div className="modal-content modal-fit-width p-3">
              <h3 className="bg-gray-600 text-white mb-4">
                Settle with: <strong>{selectedEntry.agent}</strong>
              </h3>

              <div className="form-group">
                <label>Settle Amount (Fixed): {modalType}</label>
                <input type="number" value={selectedEntry.final.toFixed(2)} readOnly />
              </div>

              <div className="form-group">
                <label>
                  Settlement Amount (Enter ≤ {selectedEntry.final.toFixed(2)}):
                </label>
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(Math.abs(Number(e.target.value)))}
                />
              </div>

              <div className="form-group">
                <label>Remark:</label>
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    if (!selectedEntry || !modalType) return;

                    if (inputAmount > Number(Math.abs(selectedEntry.final).toFixed(2))) {
                      alert("Settlement amount cannot exceed Settle Amount.");
                      return;
                    }

                    const settleamount =
                      modalType === "lena" ? -Math.abs(inputAmount) : Math.abs(inputAmount);

                    const data: any = {
                      ChildId: selectedEntry.ChildId,
                      settleamount,
                      remark,
                      type: modalType,
                    };

                    try {
                      await betService.postsettelement(data);
                      setShowModal(false);
                      // const res = await betService.oneledger();
                      // const { lenaArray, denaArray } = processLedgerData(res.data.data);
                      // setLena(lenaArray);
                      // setDena(denaArray);
                      window.location.reload();

                    } catch (err) {
                      alert("Error during settlement.");
                      console.error(err);
                    }
                  }}
                >
                  Submit
                </button>
                <button className="btn btn-danger" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AllClientLedger;




