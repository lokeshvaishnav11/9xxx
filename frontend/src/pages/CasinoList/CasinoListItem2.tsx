import React, { MouseEvent } from "react";
import { isMobile } from "react-device-detect";
import { selectCasinoMatchList } from "../../redux/actions/casino/casinoSlice";
import { useAppSelector } from "../../redux/hooks";
import ICasinoMatch from "../../models/ICasinoMatch";
import { useNavigateCustom } from "../_layout/elements/custom-link";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import "./newcitem2.css";
const CasinoListItem2 = (props: any) => {
  const gamesList = useAppSelector<any>(selectCasinoMatchList);
  const navigate = useNavigateCustom();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const [games, setGames] = React.useState<any>([]);

  React.useEffect(() => {
    const gamesfilter = gamesList.filter(
      (Item: any) =>
        Item.title.includes(category) || category == "All Casino" || !category
    );
    setGames(gamesfilter);
  }, [gamesList, category]);

  const onCasinoClick = (
    e: MouseEvent<HTMLAnchorElement>,
    Item: ICasinoMatch
  ) => {
    e.preventDefault();
    if (!Item.isDisable && Item.match_id != -1)
      navigate.go(`/casino/${Item.slug}/${Item.match_id}`);
    else toast.warn("This game is suspended by admin, please try again later");
  };
  return (
    <>
      {games &&
        games
          .filter((item: any) => !item.isDisable && item.match_id !== -1)
          .map((Item: any, key: number) => {
            return (
              <div className="col-6 event-row text-center float-left mt-3" key={key}>
                <div style={{border:"none"}} className="card-body m-0 p-0">
                  <a
                    onClick={(e) => onCasinoClick(e, Item)}
                    title={Item.title}
                  >
                    <img
                      className="casino_img"
                      src={Item.image}
                      style={{ borderRadius: "10px", width: "150px" }}
                    />
                    <span className="casino_img_text">{Item.title}</span>
                  </a>
                </div>
              </div>
            );
          })}
    </>
  );
};
export default React.memo(CasinoListItem2);
