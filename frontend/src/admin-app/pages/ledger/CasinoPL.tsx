import { AxiosResponse } from "axios";
import React from "react";
import betService from "../../../services/bet.service";

const CasinoPL = () => {

  const [data, setData] = React.useState<any[]>([]);
  const [totals, setTotals] = React.useState({
    money: 0,
    commissionlega: 0,
    commissiondega: 0,
    netpl: 0,
  });

  React.useEffect(() => {
    betService.oneledger().then((res: AxiosResponse) => {
      console.log(res,"Casino pl data")
      const items = res.data.data[0] || [];

      const filteredItems = items.filter((item: any) => item.Casino === false);

      const totalsCalc = {
        money: 0,
        commissionlega: 0,
        commissiondega: 0,
        netpl: 0,
      };

      const mappedData = filteredItems.map((item: any) => {
        const money = parseFloat(item.updown) || 0;
        const commissionlega = parseFloat(item.commissionlega) || 0;
        const commissiondega = parseFloat(item.commissiondega) || 0;
        const netpl = money + commissionlega - commissiondega;

        // Update totals
        totalsCalc.money += money;
        totalsCalc.commissionlega += commissionlega;
        totalsCalc.commissiondega += commissiondega;
        totalsCalc.netpl += netpl;

        return {
          date: item.createdAt || "N/A",
          narration: item.narration || "",
          money,
          commissionlega,
          commissiondega,
          netpl,
        };
      });

      setData(mappedData);
      setTotals(totalsCalc);
    });
  }, []);
  return (
    <div>
      <div  className="">
        <div className="container ng-scope">
           <div className="row">
      <div className="col">
        <div style={{ textAlign: "center", padding: "10px" }}>
          <h4>Casino Profit Loss</h4>
          {/* <a className="btn btn-secondary btn-sm">Today P/L</a> */}
        </div>
        <div className="overflow-auto">
        <table className="table table-striped table-bordered lenden len ng-scope">
          <thead>
            <tr className="small">
              <th className="small" style={{ fontWeight: "bolder" }}>Title</th>
              <th className="small" style={{ fontWeight: "bolder" }}>P&amp;L</th>
              <th className="small" style={{ fontWeight: "bolder" }}>Comm+</th>
              <th className="small" style={{ fontWeight: "bolder" }}>Comm-</th>
              <th className="small" style={{ fontWeight: "bolder" }}>Net P&amp;L</th>
              {/* <th className="small" style={{ fontWeight: "bolder" }}>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {/* Total Row */}
            <tr className="ng-scope background-black">
              <td>Total</td>
              <td>{totals.money.toFixed(2)}</td>
              <td>{totals.commissionlega.toFixed(2)}</td>
              <td>{totals.commissiondega.toFixed(2)}</td>
              <td>{totals.netpl.toFixed(2)}</td>
              <td></td>
            </tr>

            {/* Mapped Data Rows */}
            {data.map((item, index) => (
              <React.Fragment key={index}>
                {/* Date row */}
                <tr className="ng-scope background-yellow">
                  <td>{new Date(item.date).toLocaleDateString()}</td>

                  <td>{item.money.toFixed(2)}</td>
                  <td>{item.commissionlega.toFixed(2)}</td>
                  <td>{item.commissiondega.toFixed(2)}</td>
                  <td>{item.netpl.toFixed(2)}</td>
                  <td></td>
                </tr>

                {/* Narration row */}
                <tr className="ng-scope">
                  <td>{item.narration}</td>
                  <td>{item.money.toFixed(2)}</td>
                  <td>{item.commissionlega.toFixed(2)}</td>
                  <td>{item.commissiondega.toFixed(2)}</td>
                  <td>{item.netpl.toFixed(2)}</td>
                  <td>
                    <a className="btn hidden btn-secondary btn-sm">Details</a>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
        </div>

        <div
          className="modal fade ng-scope"
          id="row-list"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h6 style={{ width: "100%" }} className="pt-2 ng-binding"></h6>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">x</span>
                </button>
              </div>
              <div className="modal-body">
                <div
                  className="container bg-light p-0 m-0"
                  style={{ width: "100%", overflow: "auto" }}
                >
                  <table className="small table table-striped table-bordered m-0">
                    <thead>
                      <tr>
                        <th className="navbar-bet99 text-dark pt-0 pb-0 small">
                          Date
                        </th>
                        <th className="navbar-bet99 text-dark pt-0 pb-0 small">
                          Client
                        </th>
                        <th className="navbar-bet99 text-dark pt-0 pb-0 small">
                          Market
                        </th>
                        <th className="navbar-bet99 text-dark pt-0 pb-0 small">
                          Rate
                        </th>
                        <th className="navbar-bet99 text-dark pt-0 pb-0 small">
                          Number
                        </th>
                        <th className="navbar-bet99 text-dark pt-0 pb-0 small">
                          Winner
                        </th>
                        <th className="navbar-bet99 text-dark pt-0 pb-0 small">
                          Stake
                        </th>
                        <th className="navbar-bet99 text-dark pt-0 pb-0 small">
                          Profit
                        </th>
                        <th className="navbar-bet99 text-dark pt-0 pb-0 small">
                          Loss
                        </th>
                        <th className="navbar-bet99 text-dark pt-0 pb-0 small">
                          Bet Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* <!-- ngRepeat: row in rows -->
                 <!-- ngRepeat: row in allbets -->
                 <!-- end ngRepeat: row in rows --> */}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-info"
                  data-dismiss="modal"
                >
                  Close
                  <svg
                    className="svg-inline--fa fa-times fa-w-11"
                    aria-hidden="true"
                    data-prefix="fa"
                    data-icon="times"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 352 512"
                    data-fa-i2svg=""
                  >
                    <path
                      fill="currentColor"
                      d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
                    ></path>
                  </svg>
                  <i className="fa fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoPL;
