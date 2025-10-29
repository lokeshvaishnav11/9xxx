import moment from "moment";
import React, { MouseEvent } from "react";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import accountService from "../../../services/account.service";
import { dateFormat } from "../../../utils/helper";
import { isMobile } from "react-device-detect";
import mobileSubheader from "../_layout/elements/mobile-subheader";
import userService from "../../../services/user.service";
import CustomAutoComplete from "../../components/CustomAutoComplete";
import { AccoutStatement } from "../../../models/AccountStatement";
import betService from "../../../services/bet.service";
import { AxiosResponse } from "axios";
import ReactModal from "react-modal";
import BetListComponent from "../UnsetteleBetHistory/bet-list.component";
import { useAppSelector } from "../../../redux/hooks";
import { selectLoader } from "../../../redux/actions/common/commonSlice";

import "./CommissionTable.css";
import { useNavigate, useParams } from "react-router-dom";

const OperationAdmin = () => {
  const loadingState = useAppSelector(selectLoader);
  const [operations, setOperations] = React.useState([]);
  const navigate = useNavigate()


  const data = useParams().uname
  console.log(data,"dddd")

  

  React.useEffect(() => {
    betService.postsettelement2({data}).then((res: AxiosResponse<any>) => {
      // setTabledata(res.data.data);
      const ops = res.data.data.operations
      console.log(ops, "res for lena dena jai hind !");

      setOperations(ops)
      
    });
  }, [data]);

  


  return (
    <>
    <div className="container-fluid"><div className="modal-content  form-elegant">
			<div className="modal-header text-center pb-0">
				<h6 style={{width: "100%;"}} className="py-2">Account Operation</h6>
				<button  onClick={() => navigate(-1)} type="button" className="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">×</span>
				</button>
			</div>
			<div className="modal-body overflow-auto small">
				 <table className="table table-striped table-bordered">
			         <thead className=" navbar-bet99 text-dark">
			            <tr>
			               <th className="p-1 pl-2 small">Date</th>
			               <th className="p-1 small text-center no-sort">Operation</th>
			               <th className="p-1 small text-center no-sort">Done By</th>
			               <th className="p-1 small text-center no-sort">Description</th>
 			            </tr>
			         </thead>
			         <tbody> 
                {operations?.map((item:any,index) =>(
                  item ? (
                    <tr key={index} ng-repeat="row in operationList" style={{fontSize: "11px"}} >
			             	<td className="ng-binding">{new Date(item?.date).toLocaleString()}</td>
			             	<td className="ng-binding">{item?.operation}</td>
			             	<td className="ng-binding">{item?.doneBy}</td>
			             	<td className="ng-binding">{item?.description}</td>
			             </tr>

                  ) : <tr><td>No Operation found for this user</td></tr> 
                ))}
			            
			         </tbody>
			      </table>
			</div>
			{/* <div className="modal-footer pt-2 mb-1 text-center">
				<button type="button" className="btn btn-info" data-dismiss="modal">Close <svg className="svg-inline--fa fa-times fa-w-11" aria-hidden="true" data-prefix="fa" data-icon="times" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512" data-fa-i2svg=""><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg><i className="fa fa-times"></i></button>
			</div> */}
			</div></div>
      
    </>
  );
};
export default OperationAdmin;
