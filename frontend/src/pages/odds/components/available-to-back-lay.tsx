// import React from "react";
// import { IBetOn, IBetType } from "../../../models/IBet";
// import IRunner from "../../../models/IRunner";
// import IMarket, { OddsType } from "../../../models/IMarket";
// import { betPopup } from "../../../redux/actions/bet/betSlice";
// import { selectCurrentMatch } from "../../../redux/actions/sports/sportSlice";
// import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
// import authService from "../../../services/auth.service";
// import { nFormatter } from "../../../utils/helper";
// import { selectUserData } from "../../../redux/actions/login/loginSlice";
// import { RoleType } from "../../../models/User";
// // import { isMobile } from "react-device-detect";

// // const isMobile = true;

// type Props = {
//   selections: any;
//   selectionsPrev: any;
//   runner: IRunner;
//   market: IMarket;
// };


// export const AvailableToBackLay = React.memo(

//   ({ selections, market, runner }: Props) => {
//     const dispatch = useAppDispatch();
//     const getCurrentMatch = useAppSelector(selectCurrentMatch);
//     const userState = useAppSelector(selectUserData);

//     // console.log(selections,"selection" , runner,"runner" , market , "makrkr");
//     const onBet = (isBack = false, back: { price: number; size: number }) => {
//       const ipAddress = authService.getIpAddress();
//       if (market.oddsType == OddsType.BM && back.size == 0) return;
//       if (
//         back.price > 0 &&
//         back.size &&
//         userState.user.role === RoleType.user
//       ) {
//         dispatch(
//           betPopup({
//             isOpen: true,
//             betData: {
//               isBack,
//               // odds: parseFloat(back.price.toFixed(4)),
//               odds: market.marketName == "Bookmaker" ? parseFloat(back.price.toFixed(4)) : parseFloat(back.price.toFixed(4)),
//               volume: back.size,
//               marketId: market.marketId,
//               marketName: market.marketName,
//               matchId: market.matchId,
//               selectionName: runner.runnerName,
//               selectionId: runner.selectionId,
//               pnl: 0,
//               stack: 0,
//               currentMarketOdds: back.price,
//               eventId: market.sportId,
//               exposure: -0,
//               ipAddress: ipAddress,
//               type: IBetType.Match,
//               matchName: getCurrentMatch.name,
//               betOn: IBetOn.MATCH_ODDS,
//               oddsType: market.oddsType,
//             },
//           })
//         );
//       }
//     };


//     const availableToBack = () => {
//       return selections?.availableToBack?.map((back: any, index: number) => {
//         const i = 2 - index;
//         const cls = index === 2 ? "back" : `back${i}`;
//         const blinkCls = back.changed ? "blink" : "";
//         if (market.oddsType == OddsType.BM && index !== 2) return;
//         const classforbox =
//           (market.oddsType != OddsType.BM)
//             ? "box-1"
//             : "box-2";



//         //          // Decide what to display based on index
//         // let displayPrice = "";
//         // if (index === 2) {
//         //   displayPrice =
//         //     market.oddsType === OddsType.B
//         //       ? back.price || "-"
//         //       : (back.price * 100 - 100).toFixed() || "-";
//         // }

//         return (
//           <div
//             onClick={() => onBet(true, back)}
//             key={index}
//             className={`${classforbox}  text-center ${cls} ${blinkCls}`}
//           >

//             <span className="odd d-block">
//               {market.oddsType == OddsType.BM
//                 ? (back.price * 100 - 100).toFixed(0)
//                   ? (back.price * 100 - 100).toFixed(0)
//                   : "-"
//                 : (back.price * 100 - 100).toFixed(0)
//                   ? (back.price * 100 - 100).toFixed(0)
//                   : "-"}
//             </span>

//             {/* <span className="odd d-block">{displayPrice}</span> */}

//             {/* <span className="d-block">
//               {back.size ? nFormatter(back.size, 1) : "-"}
//             </span> */}
//           </div>
//         );
//       });
//     };

//     const availableToLay = () => {
//       return selections?.availableToLay?.map((lay: any, index: number) => {
//         const i = index;
//         const cls = index === 0 ? "lay" : `lay${i}`;
//         const blinkCls = lay.changed ? "blink" : "";
//         if (market.oddsType == OddsType.BM && index != 0) return;
//         const classforbox =
//           (market.oddsType != OddsType.BM)
//             ? "box-1"
//             : "box-2";



//         //          // Determine what to show
//         // let displayPrice = "";
//         // if (index === 0) {
//         //   displayPrice =
//         //     market.oddsType === OddsType.B
//         //       ? lay.price || "-"
//         //       : lay.price || "-";
//         // }



//         return (
//           <div
//             onClick={() => onBet(false, lay)}
//             key={index}
//             className={`${classforbox}   text-center ${cls} ${blinkCls}`}
//           >


//             <span className="odd d-block" style={{
//               width: "80px",   // pehle chhoti thi, isse wide ho jaayegi
//               // display: "inline-block",
//             }}>
//               {market.oddsType == OddsType.BM
//                 ? (lay.price * 100 - 100).toFixed(0)
//                   ? (lay.price * 100 - 100).toFixed(0)
//                   : "-"
//                 : (lay.price * 100 - 100).toFixed(0)
//                   ? (lay.price * 100 - 100).toFixed(0)
//                   : "-"}
//             </span>


//             {/* <span className="odd d-block">{displayPrice}</span> */}
//             {/* <span className="d-block">
//               {lay.size ? nFormatter(lay.size, 1) : "-"}
//             </span> */}
//           </div>
//         );
//       });
//     };

//     return (
//       <>
//         {availableToBack()}
//         {availableToLay()}
//       </>
//     );
//   }
// );


import React from "react";
import { IBetOn, IBetType } from "../../../models/IBet";
import IRunner from "../../../models/IRunner";
import IMarket, { OddsType } from "../../../models/IMarket";
import { betPopup } from "../../../redux/actions/bet/betSlice";
import { selectCurrentMatch } from "../../../redux/actions/sports/sportSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import authService from "../../../services/auth.service";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import { RoleType } from "../../../models/User";

type Props = {
  selections: any;
  selectionsPrev: any;
  runner: IRunner;
  market: IMarket;
};

export const AvailableToBackLay = React.memo(({ selections, market, runner }: Props) => {
  const dispatch = useAppDispatch();
  const getCurrentMatch = useAppSelector(selectCurrentMatch);
  const userState = useAppSelector(selectUserData);

  // NEW LOGIC → if total available rows < 2, then allow suspension on >100 odds
  const allowSuspension =(market.runners.length) <3;
  // console.log(allowSuspension,"aaaaa",market.runners.length)

  const onBet = (isBack = false, back: { price: number; size: number }) => {
    const ipAddress = authService.getIpAddress();
    if (market.oddsType === OddsType.BM && back.size === 0) return;
       const odds = back.price * 100 - 100;
     if (allowSuspension && odds > 100) {
    return; // ❌ Don't allow bet on suspended odds
    }

    if (back.price > 0 && back.size && userState.user.role === RoleType.user) {
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(back.price.toFixed(4)),
            volume: back.size,
            marketId: market.marketId,
            marketName: market.marketName,
            matchId: market.matchId,
            selectionName: runner.runnerName,
            selectionId: runner.selectionId,
            pnl: 0,
            stack: 0,
            currentMarketOdds: back.price,
            eventId: market.sportId,
            exposure: 0,
            ipAddress,
            type: IBetType.Match,
            matchName: getCurrentMatch?.name,
            betOn: IBetOn.MATCH_ODDS,
            oddsType: market.oddsType,
          },
        })
      );
    }
  };

  const availableToBack = () => {
    return selections?.availableToBack?.map((back: any, index: number) => {
      const i = 2 - index;
      const cls = index === 2 ? "back" : `back${i}`;
      const blinkCls = back.changed ? "blink" : "";
      if (market.oddsType === OddsType.BM && index !== 2) return;

      const classforbox = market.oddsType !== OddsType.BM ? "box-1" : "box-2";

      return (
        <div
          onClick={() => onBet(true, back)}
          key={index}
          className={`${classforbox} text-center ${cls} ${blinkCls}`}
        >
          <span className="odd d-block">
            {(() => {
              const odds = back.price * 100 - 100;
              if (allowSuspension && odds > 100 || allowSuspension && odds ==0) return "SUSPEND";
              return odds.toFixed(0) || "-";
            })()}
          </span>
        </div>
      );
    });
  };

  const availableToLay = () => {
    return selections?.availableToLay?.map((lay: any, index: number) => {
      const cls = index === 0 ? "lay" : `lay${index}`;
      const blinkCls = lay.changed ? "blink" : "";
      if (market.oddsType === OddsType.BM && index !== 0) return;

      const classforbox = market.oddsType !== OddsType.BM ? "box-1" : "box-2";

      return (
        <div
          onClick={() => onBet(false, lay)}
          key={index}
          className={`${classforbox} text-center ${cls} ${blinkCls}`}
        >
          <span className="odd d-block" style={{ width: "67px" }}>
            {(() => {
              const odds = lay.price * 100 - 100;
              if (allowSuspension && odds > 100 || allowSuspension && odds ==0) return "SUSPEND";
              return odds.toFixed(0) || "-";
            })()}
          </span>
        </div>
      );
    });
  };

  return (
    <>
      {availableToBack()}
      {availableToLay()}
    </>
  );
});