import React from "react";
import MatchList2 from "../../../pages/dashboard/elements/adminmatch-list";
import { useDispatch } from "react-redux";
import IMatch from "../../../models/IMatch";
import { setCurrentMatch } from "../../../redux/actions/sports/sportSlice";
import { useNavigateCustom } from "../../../pages/_layout/elements/custom-link";
import { AxiosResponse } from "axios";
import LMatch from "../../../models/LMatch";
import { useWebsocket } from "../../../context/webSocket";
import sportsServices from "../../../services/sports.service";


const Inplaygames = () => {

      const [matchList, setMatchList] = React.useState<LMatch[]>([]);

        const [odds, setOdds] = React.useState<Record<string, Array<any>>>({});
        const { socket } = useWebsocket();
      
    
  const dispatch = useDispatch();
  const navigate = useNavigateCustom();

  const currentMatch = (match: IMatch) => {
    dispatch(setCurrentMatch(match));
    navigate.go(`/odds/${match.matchId}`);
  };


  const marketIdsEvent = (data: any, oddsData: any, event: string) => {
      console.log(data, oddsData, event, "market Event Data");
      data.map((match: IMatch) => {
        match.markets?.map((market) => {
          if (market.marketName == "Match Odds" && !odds[market.marketId]) {
            // setOdds((prevOdds) => ({
            //   ...prevOdds,
            //   [market.marketId]:Array(6).fill('-'),
            // }));
          }
          setTimeout(() => {
            socket.emit(event, market.marketId);
          }, 200);
        });
      });
    };

   React.useEffect(() => {
       sportsServices.getMatchList("4").then((res: AxiosResponse<any>) => {
         const oddsData = { ...odds };
         console.log(res.data, "data from sport list");
         marketIdsEvent(res.data.data, oddsData, "joinMarketRoom");
         setOdds(oddsData);
         setMatchList(res.data.data);
       });
       return () => {
         const oddsData = { ...odds };
         marketIdsEvent(matchList, oddsData, "leaveMarketRoom");
       };
     }, [4]);

  return (
    <div className="container-fluid">
       <h2 className="ledger-title">Inplaygames</h2>

      <MatchList2
        currentMatch={currentMatch}
        // memoOdds={}
        matchList={matchList}
      />
    </div>
  );
};

export default Inplaygames;
