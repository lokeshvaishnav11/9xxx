import React, { useState } from "react";
import mobileSubheader from "../_layout/elements/mobile-subheader";
import { isMobile } from "react-device-detect";
import { useAppSelector } from "../../redux/hooks";
import { selectRules } from "../../redux/actions/common/commonSlice";
import Hindi from "./Hindi";
import English from "./English";
import { CustomLink } from "../_layout/elements/custom-link";

const Rules = (props: any) => {
  const { classData } = props;
  const [activeTab, setActiveTab] = useState<string>("Hindi");
  const activeRules = useAppSelector(selectRules);

  // React.useEffect(() => {
  //   setActiveTab(activeRules.type);
  //   setTimeout(() => {
  //     handleClickScroll(activeRules.type);
  //   }, 1);
  // }, [activeRules]);

  const handleClickScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // 👇 Will scroll smoothly to the top of the next section
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeTabFunction = (type: string) => {
    setActiveTab(type == activeTab ? "" : type);
  };

  const handleTabChange = (type: string) => {
    setActiveTab(type);
  };

  return (
    <div style={{marginLeft:"20px", marginRight:"20px"}}>

     

      <div
        className="language-toggle w-100 flex justify-content-between"
        style={{
          display: "flex",
          gap: "8px",
          padding: "8px",
          background: "rgb(245, 245, 245)",
          borderRadius: "8px",
          width: "100",
        }}
      >
        {/* Hindi Button */}
        <button
          className="button flex-fill"
          onClick={() => handleTabChange("Hindi")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background:
              activeTab === "Hindi"
                ? "rgb(59, 130, 246)" // blue
                : "rgb(229, 231, 235)", // gray
            color: activeTab === "Hindi" ? "white" : "rgb(75, 85, 99)",
            fontWeight: 500,
            cursor: "pointer",
            transition: "0.2s",
            boxShadow:
              activeTab === "Hindi" ? "rgba(0, 0, 0, 0.1) 0px 1px 3px" : "none",
            width: "100%",
          }}
        >
          हिंदी
        </button>

        {/* English Button */}
        <button
          className="button flex-fill"
          onClick={() => handleTabChange("English")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background:
              activeTab === "English"
                ? "rgb(59, 130, 246)" // blue
                : "rgb(229, 231, 235)", // gray
            color: activeTab === "English" ? "white" : "rgb(75, 85, 99)",
            fontWeight: 500,
            cursor: "pointer",
            transition: "0.2s",
            boxShadow:
              activeTab === "English"
                ? "rgba(0, 0, 0, 0.1) 0px 1px 3px"
                : "none",
            width: "100%",
          }}
        >
          English
        </button>
      </div>
      {/* Conditional Render */}
      {activeTab === "Hindi" && <Hindi />}
      {activeTab === "English" && <English />}
       <CustomLink
      to={"/"}
        style={{ backgroundColor: "0f2327" }}
        className="btn w-100 mt-2 text-white"

      >
        Home
      </CustomLink>
    </div>
  );
};
export default React.memo(Rules);
