import React from "react";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const LedgerHome = () => {
  return (
    <>
      <div>
        {" "}
        <div className="container mt30">
          <div className="row">
            <div className="col-6 mb-2 col-md-3 text-center">
              <a href={`admin/my-ledger`}>
                <div className="wap w-100 text-center">
                  <span className="icon-circle">
                    <AccountCircleIcon
                      className="icon-large"
                      style={{ fontSize: "80px" }}
                    />
                  </span>
                  <p className="small mt-2">My Ledger </p>
                </div>
              </a>
            </div>

            <div className="col-6 mb-2 col-md-3 text-center">
              <a href="admin/all-settlement">
                <div className="wap w-100">
                  <span className="icon-circle">
                    <SportsSoccerIcon
                      style={{ color: "#fff", fontSize: "80px" }}
                    />
                  </span>

                  <p className="small mt-2">All Client Ledger</p>
                </div>
              </a>
            </div>

            <div className="col-6 mb-2 col-md-3 text-center">
              <a href="admin/total-profit">
                <div className="wap w-100">
                  <span className="icon-circle">
                    <ReceiptLongIcon
                      style={{ color: "#fff", fontSize: "80px" }}
                    />
                  </span>

                  <p className="small mt-2">Total Profit</p>
                </div>
              </a>
            </div>

            <div className="col-6 mb-2 col-md-3 text-center">
              <a href="/admin/ledger-client">
                <div className="wap w-100">
                  <span className="icon-circle">
                    <LocalOfferIcon
                      style={{ color: "#fff", fontSize: "80px" }}
                    />
                  </span>

                  <p className="small mt-2">Client Ledger</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LedgerHome;
