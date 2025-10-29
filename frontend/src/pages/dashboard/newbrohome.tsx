import React from "react";

import './newbrohome.css'

const newbrohome = () => {
  return (
    <>
      <div>newbrohome</div>
      <div>

      <div ng-view="" ng-class="virtualGame ? '': 'body-wrap'" style={{overflowX:"hidden"}} className="ng-scope body-wrap"><div className="body-menu-list ng-scope">
   <div className="row">
      <div className="col-md-6 col-6 text-center menu-list-item">
         <a href="/match/4"><img src="https://silent365.in/assets/images/crick.png"/> <br/> In Play </a>
      </div>
      <div className="col-md-6 col-6 text-center menu-list-item">
         <a href="/my-home"><img src="https://silent365.in/assets/images/matka.png"/> <br/>Matka(coming soon)</a>
      </div>
   </div>
   <div className="row">
      <div className="col-md-6 col-6 text-center menu-list-item">
         <a href="/casino-in/live-dmd"><img src="https://silent365.in/assets/images/casino.png"/> <br/>Casino Games </a>
      </div>
      
      <div className="col-md-6 col-6 text-center menu-list-item">
         <a href="/my-home"><img src="https://silent365.in/assets/images/av180x180.png"/> <br/> Aviator(coming soon) </a>
      </div>
      
      
      
   </div>
   <div className="row">
      <div className="col-md-6 col-6 text-center menu-list-item">
         <a href="/new-accountstatement"><img src="https://silent365.in/assets/images/CL1.png"/> <br/>My Ledger</a>
      </div>
      <div className="col-md-6 col-6 text-center menu-list-item">
         <a href="/accountstatement"><img src="https://silent365.in/assets/images/statements.png"/> <br/> Statement </a>
      </div>
      
     
   </div>
   <div className="row">
      <div className="col-md-6 col-6 text-center menu-list-item">
         <a href="/changepassword"><img src="https://silent365.in/assets/images/CP1.png"/> <br/> Change Password </a>
      </div>
       <div className="col-md-6 col-6 text-center menu-list-item">
         <a href="/complete-games"><img src="https://silent365.in/assets/images/CG1.png"/> <br/> Complete Games </a>
      </div>
   </div>
   <div className="row">
      
      
      <div className="col text-center menu-list-item">
         <a href="/profile"><img src="https://silent365.in/assets/images/Profile.png"/> <br/> My Profile </a>
      </div>
     
   </div>
   
   
</div></div>


      </div>
    </>
  );
};

export default newbrohome;
