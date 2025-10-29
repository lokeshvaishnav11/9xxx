import React from "react";
import LMatch from "../../../models/LMatch";
import moment from "moment";
import { dateFormat } from "../../../utils/helper";

import "./matchlist.css";

interface MatchListProps {
  matchList: LMatch[];
  currentMatch: (match: LMatch) => void;
  //   memoOdds: (marketId: string | null) => React.ReactNode;
}

const MatchList2: React.FC<MatchListProps> = ({
  matchList,
  currentMatch,
  //   memoOdds,
}) => {
  console.log(matchList, "matchlisy", currentMatch, "currentmatch", "memoodds");

  return (
    <div className="card-content container-fluid">
      <table className="table row ">
        <thead>
          {/* <tr>
            <th style={{ width: '63%' }}>Game</th>
            <th colSpan={2}>1</th>
            <th colSpan={2}>X</th>
            <th colSpan={2}>2</th>
          </tr> */}
        </thead>
        <tbody>
          {matchList?.map((match: LMatch, index: number) => {
              const marketId =
                match?.markets && match?.markets?.length > 0
                  ? match?.markets[0].marketId
                  : null;
              return (
                <>
                  {/* <div className="col-md-6 event-row mb-3 float-left p-1">
                    <a
                      onClick={() => currentMatch(match)}
                      className="text-dark"
                      href={undefined}
                    >
                      {match.name} /{" "}
                      {moment(match.matchDateTime).format(dateFormat)}
                    </a>
                  </div> */}

                  <tr key={match.matchId} className="col-md-6 event-row mb-3 float-left p-1">
                    <a
                      style={{ color: "#000", textDecoration: "none" }}
                      onClick={() => currentMatch(match)}
                    >
                      {/* <h5 className="ng-binding">{match.name}</h5>
                        <p
                          ng-show="row.inplay"
                          className="inplay"
                          style={{ color: "green" }}
                        >
                          <svg
                            className="text-success Blink"
                            style={{ width: "12px", height: "12px" }}
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                          >
                            <path
                              fill="currentColor"
                              d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"
                            />
                          </svg>
                          INPLAY
                        </p>

                        <p className="ng-binding">
                          {moment(match.matchDateTime).format(dateFormat)}
                        </p>

                        <p>
                          Declared :{" "}
                          {moment()
                            .startOf("day")
                            .diff(
                              moment(match.matchDateTime).startOf("day"),
                              "days"
                            ) >= 1
                            ? "Yes"
                            : "No"}
                        </p> */}

                      <div className="card w-100" style={{ cursor: "pointer" }}>
                        <div
                          className="card-header font-weight-bolder text-center bg-warning p-1 h6 small"
                          style={{ color: "#fff" }}
                        >
                          {match?.name}
                        </div>
                        <div className="card-body pt-1 pb-0">
                          <div className="row p-0">
                            <div
                              style={{ marginLeft: "20px" }}
                              className="col-9 p-0 "
                            >
                              <div className="h6 small pl-1 mb-1 pt-1 d-flex align-items-center">
                              <svg
                            className="text-success Blink"
                            style={{ width: "12px", height: "12px" }}
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                          >
                            <path
                              fill="currentColor"
                              d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"
                            />
                          </svg><span className="ml-1">IN PLAY</span>
                              </div>
                              <div className="badge badger-light">



                              {/* {match?.seriesId == "1" ?   moment.utc(match.matchDateTime).format(dateFormat) : moment(match.matchDateTime).format(dateFormat)}  */}
                              {moment(match.matchDateTime).format(dateFormat)} 



                              
                                
                              </div>
                            </div>
                            <div className="col-3 text-right"></div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </tr>

                  {/* <div className='game-icons'>
                    <span className='game-icon'>
                      {new Date(match.matchDateTime).getTime() < new Date().getTime() && (
                        <span className='active' />
                      )}
                    </span>

                    <span className='game-icon'>
                      <i className='fas fa-tv v-m icon-tv' />
                    </span>

                    <span className='game-icon'>
                      {match.isFancy && (
                        <img
                          src='https://dzm0kbaskt4pv.cloudfront.net/v2/static/front/img/icons/ic_fancy.png'
                          className='fancy-icon'
                        />
                      )}
                    </span>
                    <span className='game-icon'>
                      {match.isBookMaker && (
                        <img
                          src='https://dzm0kbaskt4pv.cloudfront.net/v2/static/front/img/icons/ic_bm.png'
                          className='bookmaker-icon'
                        />
                      )}
                    </span>
                    <span className='game-icon'>
                      {match.isT10 && (
                        <img
                          src='imgs/game-icon.svg'
                          className='bookmaker-icon'
                          style={{ height: '16px' }}
                        />
                      )}
                    </span>
                  </div> */}
                  {/* {memoOdds(marketId)} */}
                </>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
export default MatchList2;
