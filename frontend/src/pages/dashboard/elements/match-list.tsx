import React from "react";
import LMatch from "../../../models/LMatch";
import moment from "moment";
import { dateFormat } from "../../../utils/helper";

import "./matchlist.css";
import axios from "axios";

interface MatchListProps {
  matchList: LMatch[];
  currentMatch: (match: LMatch) => void;
  memoOdds: (marketId: string | null) => React.ReactNode;
}

const MatchList: React.FC<MatchListProps> = ({
  matchList,
  currentMatch,
  memoOdds,
}) => {
  // console.log(matchList, "matchlisy", currentMatch, "currentmatch", memoOdds, "memoodds")


  return (
    <div className="card-content">
      <table className="table coupon-table">
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
                ? match?.markets[0]?.marketId
                : null;
            return (
              <tr key={match.matchId}>
                <td>
                  <div className="game-name">
                    <a
                      onClick={() => currentMatch(match)}
                      className="text-dark"
                      href={undefined}
                    >
                      {/* {match.name} /{" "} */}
                      {/* {moment(match.matchDateTime).format(dateFormat)} */}
                    </a>
                  </div>

                  <div className="container w-100 mt-2 p-0">
                    <div className="card single-match text-center my-2">
                      <a onClick={() => currentMatch(match)}>
                        <h5 className="ng-binding">{match.name}</h5>
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
                          {moment(match?.matchDateTime).format(dateFormat)}
                          {/* {match.seriesId} */}
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
                        </p>
                      </a>
                    </div>
                  </div>

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
                </td>
                {/* {memoOdds(marketId)} */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default MatchList;
