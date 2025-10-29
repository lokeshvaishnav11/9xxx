/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { Fragment, MouseEvent } from 'react'
import MatchOdds from './match-odds'
import { RoleType } from '../../../models/User'
import Fancy from './fancy'
import MyBetComponent from './my-bet.component'
import PlaceBetBox from './place-bet-box'
import moment from 'moment'
import { useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import BetLock from '../../../admin-app/pages/bet-lock/bet-lock'
import { Modal } from 'react-bootstrap'
import { useNavigateCustom } from '../../_layout/elements/custom-link'
import UnsetteleBetHistoryAdmin from '../../../admin-app/pages/UnsetteleBetHistory/UnsetteleBetHistoryAdmin'
import { useWebsocketUser } from '../../../context/webSocketUser'
import MyBetComponent22 from './my-bet-component22'
import axios from 'axios'
import { useParams } from 'react-router-dom'

const MatchDetail = (props: any) => {
  const userState = useAppSelector(selectUserData)
  const { socketUser } = useWebsocketUser()
  const [show, setShow] = React.useState(false)
  const navigate = useNavigateCustom()
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const showAllBet = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (userState.user.role !== RoleType.user) {
      handleShow()
      return
    }
    navigate.go('/unsettledbet')
  }
  //   const filteredFancies = props.fancies.filter((item: { gtype: string }) => item.gtype === "match");
  // console.log(filteredFancies, "filtered fancy");

  // const [sharedV, setSharedV] = React.useState<any>(null)

  const shared = useParams().share
  console.log(props,"props is here in match details hahhahahah")

  return (
    <>
      <div
        className={userState.user.role !== RoleType.user ? ' admin-match-detail' : 'featured-box'}
      >
        <div className='rowk'>
          <div className={'col-888  sports-wrapper m-b-10 pr0'}>
            <div className='game-heading mb-1'>
              <span className='card-header-title'>{props.currentMatch?.name}</span>
              <span className='float-right card-header-date'>
                {moment(props.currentMatch?.matchDateTime).format('MM/DD/YYYY  h:mm a')}

                {/* {props.currentMatch?.seriesId == "1"  ?   moment.utc(props.currentMatch?.matchDateTime).format('MM/DD/YYYY  h:mm a') : moment(props.currentMatch?.matchDateTime).format('MM/DD/YYYY  h:mm a') } */}
              </span>
            </div>
            {props.scoreBoard()}
            {props.t10Tv(450)}

            <div id='sidebar-right' className='col- pl  '>
              <div className='ps'>
                <div className='sidebar-right-inner'>
                  {/* {userState?.user?.role && userState.user.role !== RoleType.user && (
                  <BetLock markets={props.marketDataList.markets} />
                )} */}
                  {props.otherTv()}
                  {/* hjgf */}
                  {/* {matchedMatch?.team_b_scores}/{matchedMatch?.team_b_over} */}



                  {(() => {
                    const battingFirst =
                      props?.matchedMatch?.batting_team === props?.matchedMatch?.team_a_id
                        ? {
                          short: props?.matchedMatch?.team_a_short,
                          img: props?.matchedMatch?.team_a_img,
                          score: props?.matchedMatch?.team_a_scores,
                          over: props?.matchedMatch?.team_a_over,
                          crr: props?.matchedMatch?.curr_rate,
                        }
                        : {
                          short: props?.matchedMatch?.team_b_short,
                          img: props?.matchedMatch?.team_b_img,
                          score: props?.matchedMatch?.team_b_scores,
                          over: props?.matchedMatch?.team_b_over,
                          crr: props?.matchedMatch?.curr_rate,
                        };

                    const battingSecond =
                      props?.matchedMatch?.batting_team === props?.matchedMatch?.team_a_id
                        ? {
                          short: props?.matchedMatch?.team_b_short,
                          img: props?.matchedMatch?.team_b_img,
                          score: props?.matchedMatch?.team_b_scores,
                          over: props?.matchedMatch?.team_b_over,
                          crr: props?.matchedMatch?.curr_rate,
                        }
                        : {
                          short: props?.matchedMatch?.team_a_short,
                          img: props?.matchedMatch?.team_a_img,
                          score: props?.matchedMatch?.team_a_scores,
                          over: props?.matchedMatch?.team_a_over,
                          crr: props?.matchedMatch?.curr_rate,
                        };

                    return (
                      <div className={`border rounded shadow-sm  mb-3 bg-white ${props?.matchedMatch?.match_id ? "d-none" : "d-none"}`}>
                        {/* Header */}

                        <div style={{ backgroundColor: "#424242" }} className="d-flex py-2 px-1 justify-content-between align-items-center mb-">
                          <h6 className="mb-0 fw-bold  text-white">Match Scorecard</h6>

                          <span className="badge bg-success">Live</span>
                        </div>

                        {/* Batting Team (First) */}

                        <div className='border-bottom'>
                          <div className="d-flex justify-content-between align-items-center py-2 px-2 ">
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={battingFirst.img}
                                alt={battingFirst.short}
                                className="rounded-circle border"
                                style={{
                                  width: '45px',
                                  height: '45px',
                                  objectFit: 'cover',
                                  objectPosition: 'center',
                                }}
                              />
                              <h6 className="mb-0 fw-semibold">{battingFirst?.short}</h6>
                            </div>
                            <div className='bg-dark text-white p-2 rounded shadow-sm'>{props?.matchedMatch?.first_circle}</div>
                            <div className="text-end">
                              <h6 className="mb-0 fw-bold">
                                {battingFirst.score ? `${battingFirst.score}/${battingFirst.over}` : '--/--'}
                              </h6>
                              <small className="text-muted">{battingFirst.over} overs</small>

                              <div>
                                <small className="text-muted">Crr: {battingFirst.crr}</small>
                              </div>

                            </div>



                          </div>


                          <div className="d-flex flex-wrap justify-content-center pb-1">
                            {props?.matchedMatch?.last36ball?.map((ball: any, index: number) =>
                              ball ? (
                                <div
                                  key={index}
                                  className={`d-flex justify-content-center align-items-center  rounded-circle bg-light ${ball === "W" ? "text-danger" : "text-dark"} border`}
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    fontSize: "0.75rem",
                                    fontWeight: "bold",
                                    marginRight: "2px"
                                  }}
                                >
                                  {ball}
                                </div>
                              ) : null
                            )}
                          </div>

                        </div>



                        {/* Bowling Team (Second) */}
                        <div className="d-flex justify-content-between align-items-center py-2 px-2">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={battingSecond.img}
                              alt={battingSecond.short}
                              className="rounded-circle border"
                              style={{
                                width: '45px',
                                height: '45px',
                                objectFit: 'cover',
                                objectPosition: 'center',
                              }}
                            />
                            <h6 className="mb-0 fw-semibold">{battingSecond.short}</h6>
                          </div>
                          <div className="text-end">
                            <h6 className="mb-0 fw-bold">
                              {battingSecond.score ? `${battingSecond.score}/${battingSecond.over}` : '--/--'}
                            </h6>
                            <small className="text-muted">{battingSecond.over} overs</small>
                          </div>
                        </div>
                      </div>
                    );
                  })()}





                  {props.marketDataList.stake && <PlaceBetBox stake={props.marketDataList.stake} />}

                  {/**/}
                </div>
                <div className='ps__rail-x' style={{ left: 0, bottom: 0 }}>
                  <div className='ps__thumb-x' tabIndex={0} style={{ left: 0, width: 0 }} />
                </div>
                <div className='ps__rail-y' style={{ top: 0, right: 0 }}>
                  <div className='ps__thumb-y' tabIndex={0} style={{ top: 0, height: 0 }} />
                </div>
              </div>
            </div>

            <div className='markets'>
              {/* Score Component Here */}
              <div className='main-market'>
                {props.markets && <MatchOdds data={props.markets} userState={userState} shared={shared} />}
                {/* {props.markets && <MatchOdds data={filteredFancies} />} */}

              </div>
            </div>
            <br />
            {props.fancies && props.currentMatch && props.currentMatch.sportId == '4' && (
              <Fragment>
                {/* @ts-expect-error */}
                <Fancy socketUser={socketUser} fancies={props.fancies} matchId={props.matchId!} />
              </Fragment>
            )}

            <div className='card m-b-10 my-bet'>
              <div className='card-header'>
                <h6 className='card-title d-inline-block'>My Bet</h6>
                <a
                  href='#'
                  onClick={showAllBet}
                  className='card-title d-inline-block float-right'
                >
                  View All
                </a>
              </div>
              <div className='card-body'>
                <MyBetComponent />
              </div>
            </div>


            <div className='card m-b-10 my-bet'>
              {/* <div className='card-header'> */}
              {/* <h6 className='card-title d-inline-block'>Declared Bet</h6> */}
              <h6 className="p-2 w-100 m-0 bg-info text-white text-center">Declared Bets</h6>
              {/* <a
                      href='#'
                      onClick={showAllBet}
                      className='card-title d-inline-block float-right'
                    >
                      View All
                    </a> */}
              {/* </div> */}
              <div className='card-body'>
                <MyBetComponent22 />
              </div>
            </div>
          </div>
          {/* tab here */}

        </div>
      </div>
      <Modal show={show} onHide={handleClose} size={'lg'}>
        <Modal.Header closeButton>
          <Modal.Title>Bets</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UnsetteleBetHistoryAdmin matchId={props.matchId!} hideHeader={true} />
        </Modal.Body>
      </Modal>
    </>
  )
}
export default React.memo(MatchDetail)
