var tableList=new Array();
var tEvaluate=new Array();
//界面入口
jQuery(document).ready
(
	function()
	{
		setTimeout("initDocument();",50);
	}
);

function initDocument()
{
	initUserInfo();
	initMessage("Maint");
	initPage();			//放大镜及按钮初始化
	var AssignDate=getElementValue("MRAssignDate");
	//刷新数据
	fillData()
	totalFee_Change()
	//按钮控制
	setEnabled()
	initEditFields(getElementValue("ApproveSetDR"),getElementValue("CurRole"),getElementValue("Action"));
	setElementEnabled();
	initApproveButton();
	initButtonWidth()
	//点击维修配件也签刷新
	$HUI.tabs("#tMaintTabs",{
		onSelect:function(title)
		{
			if (title=="维修配件")
			{
				var AccessorySrc="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQMMaintPart&MaintRequestDR="+getElementValue("RowID")+"&MaintItemDR="+getElementValue("MaintItemDR")+"&Status="+getElementValue("MRStatus")
				if (getElementValue("Action")!="WX_Maint")
				{
					AccessorySrc="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQMMaintPart&MaintRequestDR="+getElementValue("RowID")+"&MaintItemDR="+getElementValue("MaintItemDR")+"&Status=0"
				}
				$('#Accessory').attr('src', AccessorySrc);
			}
		}
	});
	//检测是否需要评价
	var EvaluateFlag=getElementValue("CheckEvaluate")
	var EvaluateFlagObj=JSON.parse(EvaluateFlag)
	if (EvaluateFlagObj.SQLCODE==0)
	{
		if (EvaluateFlagObj.Data.EvaluateStatus>=0)
		{
			//生成评价窗口
			var EReadOnly=false
			if (EvaluateFlagObj.Data.EvaluateStatus==1)
			{
				EReadOnly=true
			}
			createEvaluateWin("tEvaluateWin",EvaluateFlagObj.Data.EvaluationID,EReadOnly);
		}
	}
	else
	{
		hiddenTab("tOtherTabs","tEvaluate")
	}
	//加载审批进度
	createApproveSchedule("ApproveSchedule","25",getElementValue("RowID"))
	//加载维修历史,知识库
	if ($("#tMaintHistorytree")){createMaintHistory(getElementValue("MRExObjDR_EQRowID"))}
	jQuery(window).resize(function(){window.location.reload()})
}

function initPage()
{
	initLookUp();		//初始化放大镜
	defindTitleStyle();
	//设备名称放大镜显示前事件
	$("#MRExObjDR_ExObj").lookup({onBeforeShowPanel:function(){ return onBeforeShowPanel("MRExObjDR_ExObj");}})
	initButton();
	if (jQuery("#BMaintUser").length>0)
	{
		jQuery("#BMaintUser").linkbutton({iconCls: 'icon-w-other'});  ///Modefidy by zc 2018-10-29 ZC0041  多人协助
		jQuery("#BMaintUser").click(function(){BMaintUser_Click()});  ///Modefidy by zc 2018-10-29 ZC0041  多人协助
	}
	setElement("MRSourceType","1")
	setRequiredElements("MRObjLocDR_LocDesc^MRSourceType^MRExObjDR_ExObj^MRFaultCaseRemark")
}

function setSelectValue(vElementID,rowData)
{
	if (vElementID=="MRObjLocDR_LocDesc")
	{
		setElement("MRObjLocDR",rowData.TRowID)
		setElement("MRRequestTel",rowData.TTel)
	}
	else if (vElementID=="MRExObjDR_ExObj")
	{
		rowData.TExType=1
		setElement("MRExObjDR_EQNo",rowData.TNo);
		setElement("MRExObjDR_EQModel",rowData.TModel);
		setElement("MRObjLocDR_LocDesc",rowData.TUseLoc);
		setElement("MRObjLocDR",rowData.TUseLocDR);
		setElement("MRSourceType",rowData.TExType);
		setElement("MRExObjDR_EQOriginalFee",rowData.TOriginalFee);
		setElement("MRPlace",rowData.TLocation);
		setElement("MRExObjDR_EQFileNo",rowData.TFileNo);
		setElement("MRExObjDR_EQRowID",rowData.TRowID);
		setElement("MRObjTypeDR",rowData.TTypeDR);
		setElement("MREquipTypeDR",rowData.TEquipTypeDR);
		//来自设备时自动保存维护对象[待屏蔽]
		if (rowData.TExType=="1")
		{
			var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","AutoSaveExObj",rowData.TRowID)
			var jsonObj=JSON.parse(jsonData)
			if (jsonObj.SQLCODE<0) {messageShow("","","",jsonObj.Data);return;}
			setElement("MRExObjDR",jsonObj.Data)
		}
		var obj=document.getElementById("Banner");
		if (obj){$("#Banner").attr("src",'dhceq.plat.banner.csp?&EquipDR='+rowData.TRowID)}
	}
	else if (vElementID=="MRAcceptUserDR_UserName")
	{
		setElement("MRAcceptUserDR",rowData.TUserdr)
		setElement("MRAcceptUserDR_Initials",rowData.TInitials)
		setElement("MRMaintGroupDR",rowData.TMaintGroupDR);
		setElement("MRMaintGroupDR_MGDesc",rowData.TMaintGroup);
	}
	else if (vElementID=="MRRequestUserDR_UserName"){setElement("MRRequestUserDR",rowData.TRowID)}
	else if (vElementID=="MREquipStatusDR_ESDesc"){setElement("MREquipStatusDR",rowData.TRowID)}
	else if (vElementID=="MRMaintModeDR_MMDesc"){setElement("MRMaintModeDR",rowData.TRowID)}
	else if (vElementID=="MRServiceDR_SVName"){setElement("MRServiceDR",rowData.TRowID)}
	else if (vElementID=="MRFaultTypeDR_FTDesc"){setElement("MRFaultTypeDR",rowData.TRowID)}
	else if (vElementID=="MRFaultReasonDR_FRDesc"){setElement("MRFaultReasonDR",rowData.TRowID)}
	else if (vElementID=="MRDealMethodDR_DMDesc"){setElement("MRDealMethodDR",rowData.TRowID)}
	else if (vElementID=="MRMaintResultsDR_MRDesc"){setElement("MRMaintResultsDR",rowData.TRowID)}
	else if (vElementID=="MRMaintGroupDR_MGDesc"){setElement("MRMaintGroupDR",rowData.TRowID)}
	else if (vElementID=="MREmergencyLevelDR_ELDesc"){setElement("MREmergencyLevelDR",rowData.TRowID)}
	else if (vElementID=="MRSeverityLevelDR_SLDesc"){setElement("MRSeverityLevelDR",rowData.TRowID)}
	else if (vElementID=="MRFaultCaseDR_FCDesc"){setElement("MRFaultCaseDR",rowData.TRowID)}
}

function clearData(vElementID)
{
	var DRElementName=vElementID.split("_")[0]
	setElement(DRElementName,"")
	if (vElementID=="MRObjLocDR_LocDesc") 
	{
		setElement("MRRequestTel","")
		setElement("MRExObjDR_ExObj","");
		setElement("MRExObjDR","");
		clearData("MRExObjDR_ExObj")
	}
	else if (vElementID=="MRExObjDR_ExObj") 
	{
		setElement("MRExObjDR_EQNo","");
		setElement("MRExObjDR_EQModel","");
		setElement("MRExObjDR_EQOriginalFee","");
		setElement("MRPlace","");
		setElement("MRExObjDR_EQFileNo","");
		setElement("MRExObjDR_EQRowID","");
		setElement("MRObjTypeDR","");
		setElement("MREquipTypeDR","");
	}
	else if (vElementID=="MRAcceptUserDR_UserName")	
	{
		setElement("MRAcceptUserDR_Initials","");
	}
	else if (vElementID=="MRMaintGroupDR_MGDesc")	
	{
		setElement("MRAcceptUserDR_Initials","")
		setElement("MRAcceptUserDR_UserName","");
		setElement("MRAcceptUserDR","");
	}
}

function fillData()
{
	//start by csj 20190125 台账链接填充设备及科室
	var EquipDR=getElementValue("MRExObjDR");
	if (EquipDR!="")
	{
		$cm({
			ClassName:"web.DHCEQ.EM.BUSEquip",
			MethodName:"GetOneEquip",
			RowID:EquipDR
		},function(jsonData){
			if (jsonData.SQLCODE<0) {$.messager.alert(jsonData.Data);return;}
    			setElement("MRExObjDR_ExObj",jsonData.Data["EQName"]);
				setElement("MRObjLocDR",jsonData.Data["EQUseLocDR"]);
				setElement("MRObjLocDR_LocDesc",jsonData.Data["EQUseLocDR_CTLOCDesc"]);
		});
	}
	//end by csj 20190125 
	var obj=document.getElementById("RowID");
	if (obj) var RowID=getElementValue("RowID");
	if (RowID=="") return;
	var Action=getElementValue("Action");
	var Step=getElementValue("RoleStep");
	var ApproveRoleDR=getElementValue("ApproveRoleDR");
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","GetOneMaintRequest",RowID,ApproveRoleDR,Action,Step)
	var jsonObj=jQuery.parseJSON(jsonData)
	if (jsonObj.SQLCODE<0) {messageShow("","","",jsonObj.Data);return;}
	setElementByJson(jsonObj.Data)
	$("#Banner").attr("src",'dhceq.plat.banner.csp?&EquipDR='+getElementValue("MRExObjDR_EQRowID"))
	setContratByEquip(jsonObj.Data["MRExObjDR"])
    if (jsonObj.Data["MultipleRoleFlag"]=="1")
    {
	    setElement("NextRoleDR",getElementValue("CurRole"));
	    setElement("NextFlowStep",getElementValue("RoleStep"));
	}
}

function setContratByEquip(ExObjDR)
{
	var ContractInfo=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","SetContrat",ExObjDR)
	var ContractObj=jQuery.parseJSON(ContractInfo)
	if (ContractObj.SQLCODE<0) {messageShow("","","",ContractObj.Data);return;} 
	var ValueList=ContractObj.Data
	var Value=ValueList.split("^");
	setSerContract(Value[0],Value[1],Value[2]);
}
function setSerContract(Type,StartDate,EndDate)
{
	if (Type=="0")  //没有保修
	{
		disableElement("BSerContract",true);
	}
	else
	{
		disableElement("BSerContract",false);
		var obj=document.getElementById("BSerContract");
		if (obj)
		{
			jQuery("#BSerContract").on("click", BSerContract_Click);
		}
	}
	setElement("MRMaintStartDate",StartDate);
	setElement("MRMaintEndDate",EndDate);
}


function setEnabled()
{
	var Status=getElementValue("MRStatus");
	var curRole=getElementValue("RoleStep");
	var nextRole=getElementValue("NextFlowStep");
	var RowID=getElementValue("RowID");
	if(RowID=="")
	{
		disableElement("BSubmit",true)
		disableElement("BDelete",true)
		disableElement("BPicture",true)
	}
	if ((Status!=0)||((curRole!=0)&&(curRole!=nextRole)))
	{
		disableElement("BSubmit",true)
		disableElement("BDelete",true)
		disableElement("BSave",true)
	}
	var Action=getElementValue("Action")
	if ((Action=="WX_Assign")||(Action=="WX_Accept"))        //派单和受理时维修配件按钮不可用
	{
		disableElement("BMaintDetail",true)
		disableElement("BMaintUser",true)  ///Modefidy by zc 2018-10-29 ZC0041  多人协助
	}
	if (Status>0)
	{
		disableAllElements()
	}
	else
	{
		disableAllElements("MRObjLocDR_LocDesc^MRSourceType^MRExObjDR_ExObj^MREquipStatusDR_ESDesc^MRFaultCaseDR_FCDesc^MRFaultCaseRemark^MRStartDate^MRRequestUserDR_UserName^MRRequestTel^MRPlace")
	}
}

function setElementEnabled()
{
	var Status=getElementValue("MRStatus");
	var RoleStep=getElementValue("RoleStep");
	var Action=getElementValue("Action");
	if (Status>0)	//提交之后
	{
		if (Action=="WX_Assign")
		{
			setElement("MRAssignDR_UserName",curUserName);
			setElement("MRAssignDR",curUserID);
			setElement("MRAssignDate",getElementValue("CurDate"));
			disableElement("MRAssignDR_UserName",true)
			disableElement("MRAssignDate",true)
			disableElement("MRAcceptUserDR_Initials",true)
		}
		if ((Action=="WX_Accept")||(Action=="WX_Maint")||(Action=="WX_Finish"))
		{
			disableElement("MROtherFee",true)
			disableElement("MRTotalFee",true)
//			var result=getMaintNumForAffix();	//南方医院个性需求
//			if (result!="")
//			{
//				result=result.replace("^","维修");
//				result=result.replace(",","次,");
//				result=result+"次."
//				messageShow("","","",t[-600199]+"\n"+result);
//			}
			if (Action=="WX_Accept")	//(getElementValue("MRAcceptDate")=="")
			{
				disableElement("MRAcceptDate",true)
				setElement("MRAcceptDate",getElementValue("CurDate"));
			}
			if ((Action=="WX_Finish")&&(getElementValue("EndDate")==""))
			{
				disableElement("MREndDate",true)
				setElement("MREndDate",getElementValue("CurDate"));
			}
		}
	}
	else
	{
		setElement("MRAssignDR_UserName","");
		setElement("MRAssignDR","");
		setElement("MRAssignDate","");
	}
}

function getMaintNumForAffix()
{
	var AffixMaintInfo=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","GetMaintNumForAffix",getElementValue("RowID"))
	var AffixMaintObj=JSON.parse(AffixMaintInfo)
	if (AffixMaintObj.SQLCODE<0) {messageShow("","","",AffixMaintObj.Data);return;}
	return AffixMaintObj.Data
}

function totalFee_Change()
{
	var MaintFee=getElementValue("MRMaintFee")
	if (MaintFee=="") MaintFee=0
	MaintFee=parseFloat(MaintFee);
	var OtherFee=getElementValue("MROtherFee")
	if (OtherFee=="") OtherFee=0
	OtherFee=parseFloat(OtherFee);
	var tmpValue=(MaintFee.toFixed(2)*1)+(OtherFee.toFixed(2)*1);
	tmpValue=parseFloat(tmpValue);
	setElement("MRTotalFee",tmpValue.toFixed(2))
}

//////////////////////////////////业务处理函数/////////////////////////////////////////////
function BSave_Clicked()
{
	if (checkMustItemNull()) return
	var ExObjDR=getElementValue("MRExObjDR")
	var SourceTypeDR=getElementValue("MRSourceType")
	//存储数据
	var RowID=getElementValue("RowID")
	var CheckValue=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","CheckMaintProcess",SourceTypeDR,ExObjDR,RowID)
	var CheckObj=JSON.parse(CheckValue)
	if (CheckObj.SQLCODE<0) {messageShow("","","",CheckObj.Data);return;}
	if (CheckObj.Data["ReturnFlag"]=="1")
	{
		var CheckInfo=t[-5600]
		CheckInfo=CheckInfo.replace("[RequestUser]",CheckObj.Data["RequestUser"]);
		CheckInfo=CheckInfo.replace("[RequestDate]",CheckObj.Data["RequestDate"]);
		CheckInfo=CheckInfo.replace("[RequestNo]",CheckObj.Data["RequestNo"]);
		var truthBeTold = window.confirm(CheckInfo);
		if (!truthBeTold) return;
	}
	var combindata=getDataList();
	var Evaluate=""	
	var ReturnValue=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","UpdateMaintRequest",combindata,Evaluate)
	var ReturnObj=JSON.parse(ReturnValue)
	if (ReturnObj.SQLCODE<0) 
	{
		messageShow("","","",ReturnObj.Data);
		return;
	}
	else
	{
		messageShow("","","",t[0])
	}
	//刷新界面
	window.setTimeout(function(){window.location.href="dhceq.em.mmaintrequestsimple.csp?&RowID="+ReturnObj.Data+"&CurRole="+getElementValue("CurRole")+"&ApproveRoleDR="+getElementValue("ApproveRoleDR")+"&QXType="+getElementValue("QXType")},50); 
}
function BSubmit_Clicked()
{
	if (checkMustItemNull()) return
	var IRowID=getElementValue("RowID");
	if (IRowID=="")	{messageShow("","","",t[-9205]);return 0;}
	var GetStopEquipFlag=getElementValue("GetStopEquipFlag")
	if (GetStopEquipFlag==1)
	{
		var truthBeTold = window.confirm(t[-9260]);
		if (truthBeTold) GetStopEquipFlag=2;
	}
	if (GetStopEquipFlag==2)
	{
		var result=tkMakeServerCall("web.DHCEQ.Plat.BUSChangeInfo","StopEquipBySource","31",IRowID,"1");
		var resultObj=JSON.parse(result)
		if (resultObj.SQLCODE<0)	{messageShow("","","",t[-9200]+resultObj.Data);return;}
	}
	var Ret=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","SubmitMaintRequest",IRowID,"1",curUserID);
	var RetObj=JSON.parse(Ret)
	if (RetObj.SQLCODE<0) 
	{
		messageShow("","","",RetObj.Data)
		return 0;
	}
	messageShow("","","",t[0])
	var SimpleFlag=getElementValue("SimpleFlag");
	if (SimpleFlag!="")
	{
		window.setTimeout(function(){window.location.href= "dhceq.em.mmaintrequestsimple.csp?&RowID="+IRowID+"&CurRole="+getElementValue("CurRole")},50); 
	}
	else
	{
		window.setTimeout(function(){window.location.href= "dhceq.em.mmaintrequest.csp?&RowID="+IRowID+"&CurRole="+getElementValue("CurRole")},50); 	
	}
}
function BDelete_Clicked()
{
	var RowID=getElementValue("RowID")
	if (RowID=="")	{messageShow("","","",t[-9205]);	return;	}
	var truthBeTold = window.confirm(t[-9203]);
	if (!truthBeTold) return;
	var Ret=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","DeleteMaintRequest",RowID)
	var RetObj=jQuery.parseJSON(Ret)
	if (RetObj.SQLCODE<0)
	{
		messageShow("","","",RetObj.Data)
		return;
	}
	messageShow("","","",RetObj.Data);
	window.setTimeout(function(){window.location.href= "dhceq.em.mmaintrequestsimple.csp?&RowID=&Status=0"},50); 
}

function BCancelSubmit_Clicked()
{
	var RowID=getElementValue("RowID")
	if (RowID=="")  {messageShow("","","",t[-9205]);	return;	}
	
	var GetStopEquipFlag=getElementValue("GetStopEquipFlag")
	if (GetStopEquipFlag==1)
	{
		var truthBeTold = window.confirm(t[-9261]);
		if (truthBeTold) GetStopEquipFlag=2;
	}
	
	if (GetStopEquipFlag==2)
	{
		var result=tkMakeServerCall("web.DHCEQ.Plat.BUSChangeInfo","StopEquipBySource","31",RowID,"0");
		var resultObj=JSON.parse(result)
		if (resultObj.SQLCODE<0)
		{
			messageShow("","","",t[-9200]+resultObj.Data)
			return;
		}
	}
	var CurRole=getElementValue("CurRole")
	var RoleStep=getElementValue("RoleStep")
	var RowID=getElementValue("RowID");
	var ApproveTypeCode="25";
	var Type="1";
	var GotoType=tkMakeServerCall("web.DHCEQ.Plat.CTCApproveFlow","GetApproveFlowType",RowID,CurRole,ApproveTypeCode,Type,RoleStep)
	var GotoTypeObj=JSON.parse(GotoType)
	setElement("ApproveTypeCode","25");
	setElement("Type","1")
	if (GotoTypeObj.Data==2)
	{
		var vParams={
			ClassName:"web.DHCEQCApproveFlow",
			QueryName:"GetUserApproves",
			Arg1:getElementValue("RowID"),
			Arg2:getElementValue("CurRole"),
			Arg3:getElementValue("ApproveTypeCode"),
			Arg4:getElementValue("Type"),
			Arg5:getElementValue("RoleStep"),
			ArgCnt:5
			};
		var vcolumns=[[
		{field:'TRowID',title:'TRowID',width:50,align:'center',hidden:true},
		{field:'TRoleDR',title:'TRoleDR',width:50,align:'center',hidden:true},
		{field:'TRole',title:'TRole',width:50,align:'center',hidden:true},
		{field:'TStep',title:'TStep',width:50,align:'center',hidden:true},
		{field:'TAction',title:'动作',width:200,align:'center'},
		]];
		initApproveFlowGrid("ApproveFlowWin","tApproveFlowGrid",vParams,vcolumns,1)
		jQuery('#ApproveFlowWin').window('open');
		return ;	
	}

	var combindata=getValueList();
	var Rtn=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","CancelSubmitData",combindata,getElementValue("CurRole"));
    var RtnObj=JSON.parse(Rtn)
    if (RtnObj.SQLCODE<0)
    {
	    messageShow("","","",RtnObj.Data)
    }
    else
    {
	    messageShow("","","",t[0])
	    window.setTimeout(function(){window.location.href="dhceq.em.mmaintrequest.csp?&RowID="+RtnObj.Data+"&CurRole="+getElementValue("CurRole")},50); 
    }
}

function BApprove_Clicked()
{
	if (checkMustItemNull()) return
	var RowID=getElementValue("RowID")
	if (RowID=="")  {messageShow("","","",t[-9205]);	return;	}
  	var GetFaultReasonOperMethod=getElementValue("GetFaultReasonOperMethod");
  	var FaultReasonDR=getFaultReasonRowID(GetFaultReasonOperMethod);
  	if (FaultReasonDR<0) return;
  	setElement("MRFaultReasonDR",FaultReasonDR);
  	var GetDealMethodOperMethod=getElementValue("GetDealMethodOperMethod");
  	var DealMethodDR=getDealMethodRowID(GetDealMethodOperMethod);
  	if (DealMethodDR<0) return;
  	setElement("MRDealMethodDR",DealMethodDR);
  	var GetFaultTypeOperMethod=getElementValue("GetFaultTypeOperMethod");
  	var FaultTypeDR=getFaultTypeRowID(GetFaultTypeOperMethod);
  	if (FaultTypeDR<0) return;
  	setElement("MRFaultTypeDR",FaultTypeDR);
	//保存评价信息 Modify DJ 2015-08-28 DJ0159
	var CurRole=getElementValue("CurRole")
  	if (CurRole=="") return;
	var RoleStep=getElementValue("RoleStep")
  	if (RoleStep=="") return;
	var Action=getElementValue("Action")
	var RowID=getElementValue("RowID");
	var ApproveTypeCode="25";
	var Type="0";
	var GotoType=tkMakeServerCall("web.DHCEQ.Plat.CTCApproveFlow","GetApproveFlowType",RowID,CurRole,ApproveTypeCode,Type,RoleStep)
	var GotoTypeObj=JSON.parse(GotoType)
	setElement("ApproveTypeCode","25");
	setElement("Type","0");
	if (GotoTypeObj.Data==2)
	{
		var vParams={
			ClassName:"web.DHCEQCApproveFlow",
			QueryName:"GetUserApproves",
			Arg1:getElementValue("RowID"),
			Arg2:getElementValue("CurRole"),
			Arg3:getElementValue("ApproveTypeCode"),
			Arg4:getElementValue("Type"),
			Arg5:getElementValue("RoleStep"),
			ArgCnt:5
			};
		var vcolumns=[[
		{field:'TRowID',title:'TRowID',width:50,align:'center',hidden:true},
		{field:'TRoleDR',title:'TRoleDR',width:50,align:'center',hidden:true},
		{field:'TRole',title:'TRole',width:50,align:'center',hidden:true},
		{field:'TStep',title:'TStep',width:50,align:'center',hidden:true},
		{field:'TAction',title:'动作',width:200,align:'center'},
		]];
		initApproveFlowGrid("ApproveFlowWin","tApproveFlowGrid",vParams,vcolumns,0)
		jQuery('#ApproveFlowWin').window('open');
		return;	
	}
	var EvaluatInfo=""
	var GetCheckEvaluate=checkEvaluate("31",RowID,CurRole,"","","",Action)
	setElement("CheckEvaluate",GetCheckEvaluate)
	var GetCheckEvaluateObj=JSON.parse(GetCheckEvaluate)
	if (GetCheckEvaluateObj.SQLCODE==0)
	{
		EvaluatInfo=getEvaluateInfo();
		var EvaluatScore=EvaluatInfo.split("@")
		if ((GetCheckEvaluateObj.Data.EvaluateStatus==0)&&(EvaluatScore[0]==0))
		{
			//激活评价窗口
			selectTab("tOtherTabs","tEvaluate")
			if (GetCheckEvaluateObj.Data.EIndependentFlag=="Y")
			{
				var truthBeTold = window.confirm(t[-9230]);
				if (truthBeTold) return;
			}
			else
			{
				var truthBeTold = window.confirm(t[-9231]);
				if (truthBeTold) return;
			}
		}
	}
	else
	{
		if (GetCheckEvaluateObj.SQLCODE==-9031)
		{
			messageShow("","","",GetCheckEvaluateObj.Data)
			return
		}
	}
	var objtbl=getParentTable("MRRequestNo")
	var EditFieldsInfo=approveEditFieldsInfo(objtbl);
	if (EditFieldsInfo=="-1") return;
	var combindata=getValueList();
  	var Rtn=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","AuditData",combindata,CurRole,RoleStep,EditFieldsInfo,"","","",EvaluatInfo);
    var RtnObj=JSON.parse(Rtn)
    if (RtnObj.SQLCODE<0)
    {
	    messageShow("","","",RtnObj.Data)
    }
    else
    {
	    messageShow("","","",t[0])
	    if (parent.parent.opener)
	    {
		    parent.parent.opener.initMaintWaitListDataGrid()
	    }
	    window.setTimeout(function(){window.location.reload()},50); 
    }
}

function getDataList()
{
	var FaultCaseDR=getFaultCaseRowID(getElementValue("GetFaultCaseOperMethod"))
	if (FaultCaseDR<0){FaultCaseDR=""}
	var FaultReasonDR=getFaultReasonRowID(getElementValue("GetFaultReasonOperMethod"))
	if (FaultReasonDR<0){FaultReasonDR=""}
	var DealMethodDR=getDealMethodRowID(getElementValue("GetDealMethodOperMethod"))
	if (DealMethodDR<0){DealMethodDR=""}
	var FaultTypeDR=getFaultTypeRowID(getElementValue("GetFaultTypeOperMethod"))
	if (FaultTypeDR<0){FaultTypeDR=""}
	var combindata="";
  	combindata=getElementValue("RowID") ;
	combindata=combindata+"^"+getElementValue("MRRequestNo") ;
	combindata=combindata+"^"+getElementValue("MRManageTypeDR") ;
	combindata=combindata+"^"+getElementValue("MREquipTypeDR") ;
	combindata=combindata+"^"+getElementValue("MRObjTypeDR") ;
	combindata=combindata+"^"+getElementValue("MRExObjDR") ;
	combindata=combindata+"^"+getElementValue("MRObjLocDR") ;
	combindata=combindata+"^"+getElementValue("MRRequestLocDR") ;
	combindata=combindata+"^"+getElementValue("MRStartDate") ;
	combindata=combindata+"^"+getElementValue("MRStartTime") ;	//10
	combindata=combindata+"^"+FaultCaseDR;
	combindata=combindata+"^"+getElementValue("MRFaultCaseRemark") ;
	combindata=combindata+"^"+FaultReasonDR;
	combindata=combindata+"^"+getElementValue("MRFaultReasonRemark") ;
	combindata=combindata+"^"+DealMethodDR;
	combindata=combindata+"^"+getElementValue("MRDealMethodRemark") ;
	combindata=combindata+"^"+getElementValue("MREndDate") ;
	combindata=combindata+"^"+getElementValue("MREndTime") ;
	combindata=combindata+"^"+getElementValue("MRRequestDate") ;
	combindata=combindata+"^"+getElementValue("MRRequestTime") ;	//20
	combindata=combindata+"^"+getElementValue("MRRequestUserDR") ;
	combindata=combindata+"^"+getElementValue("MRRequestTel") ;
	combindata=combindata+"^"+getElementValue("MRPlace") ;
	combindata=combindata+"^"+FaultTypeDR;
	combindata=combindata+"^"+getElementValue("MRAcceptDate") ;
	combindata=combindata+"^"+getElementValue("MRAcceptTime") ;
	combindata=combindata+"^"+getElementValue("MRAcceptUserDR") ;
	combindata=combindata+"^"+getElementValue("MRAssignDR") ;
	combindata=combindata+"^"+getElementValue("MRMaintModeDR") ;	//29
	if (getElementValue("MRMaintModeDR")==3)
	{
	    combindata=combindata+"^"+"^"+getElementValue("MRMaintModeWayDR")+"^" ;
	}
    else if (getElementValue("MRMaintModeDR")==2)
    {
        combindata=combindata+"^"+"^"+"^"+getElementValue("MRMaintModeWayDR") ;
    }
    else
    {
        combindata=combindata+"^"+getElementValue("MRMaintModeWayDR")+"^"+"^" ;
    }
	combindata=combindata+"^"+getElementValue("MRUserSignDR") ;
	combindata=combindata+"^"+getElementValue("MRUserOpinion") ;
	combindata=combindata+"^"+getElementValue("MRManageLocDR") ;
	var obj = document.getElementById("ReturnFlag") ;
	if (obj){combindata=combindata+"^"+getElementValue("ReturnFlag");}
	else combindata=combindata+"^"+"N" ;
	combindata=combindata+"^"+getElementValue("MRMaintRequestDR") ;
	combindata=combindata+"^"+getElementValue("MRMaintRemark") ;
	combindata=combindata+"^"+getElementValue("MREstimateWorkHour") ;
	combindata=combindata+"^"+getElementValue("MRWorkHour") ;	//40
	combindata=combindata+"^"+getElementValue("MRRemark") ;
	combindata=combindata+"^"+getElementValue("MRStatus") ;
	combindata=combindata+"^"+curUserID;
	combindata=combindata+"^"+getElementValue("MRInvalidFlag") ;
	combindata=combindata+"^"+getElementValue("MRMaintFee") ;
	combindata=combindata+"^"+getElementValue("MROtherFee") ;
	combindata=combindata+"^"+getElementValue("MRTotalFee") ;
	combindata=combindata+"^"+getElementValue("MREmergencyLevelDR") ;
	combindata=combindata+"^"+getElementValue("MRSeverityLevelDR") ;
	combindata=combindata+"^"+getElementValue("MRSourceType") ;
	combindata=combindata+"^"+getElementValue("MRAssignDate") ;
	combindata=combindata+"^"+getElementValue("MRPackageState") ;
	combindata=combindata+"^"+getElementValue("MRInsurFlag") ;
	combindata=combindata+"^"+getElementValue("MRMaintResultsDR") ;
	combindata=combindata+"^"+getElementValue("MREquipStatusDR") ;
	combindata=combindata+"^"+getElementValue("MRMaintProcessDR") ;
    return combindata;
}

function dataGridSelect(vType,vRowData)
{
	if (vType==0)
	{
		var vDataStr=vRowData.TRowID+"^"+vRowData.TRoleDR+"^"+vRowData.TRole+"^"+vRowData.TStep+"^"+vRowData.TAction
		getUserApprove(vDataStr)
	}
	if (vType==1)
	{
		var vDataStr=vRowData.TRowID+"^"+vRowData.TRoleDR+"^"+vRowData.TRole+"^"+vRowData.TStep+"^"+vRowData.TAction
		getUserCancelApprove(vDataStr)
	}
}

function getUserApprove(Value)
{
	var list=Value.split("^");
	var ApproveFlowID=list[0];
	
	var CurRole=getElementValue("CurRole")
  	if (CurRole=="") return;
	var RoleStep=getElementValue("RoleStep")
  	if (RoleStep=="") return;
	var Action=getElementValue("Action")
	var RowID=getElementValue("RowID")
	var objtbl=getParentTable("MRRequestNo")
	var EditFieldsInfo=approveEditFieldsInfo(objtbl);
	if (EditFieldsInfo=="-1") return;
	var EvaluatInfo=""
	var GetCheckEvaluate=checkEvaluate("31",RowID,CurRole,"","","",Action)
	setElement("CheckEvaluate",GetCheckEvaluate)
	var GetCheckEvaluateObj=JSON.parse(GetCheckEvaluate)
	if (GetCheckEvaluateObj.SQLCODE==0)
	{
		EvaluatInfo=getEvaluateInfo();
		var EvaluatScore=EvaluatInfo.split("@")
		if ((GetCheckEvaluateObj.Data.EvaluateStatus==0)&&(EvaluatScore[0]==0))
		{
			selectTab("tOtherTabs","tEvaluate")
			if (GetCheckEvaluateObj.Data.EIndependentFlag=="Y")
			{
				var truthBeTold = window.confirm(t[-9230]);
				if (!truthBeTold) return;
			}
			else
			{
				var truthBeTold = window.confirm(t[-9231]);
				if (!truthBeTold) return;
			}
		}
	}
	else
	{
		if (GetCheckEvaluateObj.SQLCODE==-9031)
		{
			messageShow("","","",GetCheckEvaluateObj.Data)
			return
		}
	}
	var combindata=getValueList();
	var MaintProcess=getElementValue("MaintProcess");
	var Rtn=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","AuditData",combindata,CurRole,RoleStep,EditFieldsInfo,ApproveFlowID,MaintProcess,"",EvaluatInfo);
    var RtnObj=JSON.parse(Rtn)
    if (RtnObj.SQLCODE<0)
    {
	    messageShow("","","",RtnObj.Data)
    }
    else
    {
	    messageShow("","","",t[0])
	    if (parent.parent.opener)
	    {
		    parent.parent.opener.initMaintWaitListDataGrid()
	    }
	    window.setTimeout(function(){window.location.reload()},50);
    }
}

function getUserCancelApprove(Value)
{
	var list=Value.split("^");
	setElement("CancelToFlowDR",list[0]);
	var combindata=getValueList();
	var Rtn=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","CancelSubmitData",combindata,getElementValue("CurRole"));
    var RtnObj=JSON.parse(Rtn)
    if (RtnObj.SQLCODE<0)
    {
	    messageShow("","","",RtnObj.Data)
    }
    else
    {
	    messageShow("","","",t[0])
	    if (parent.parent.opener)
	    {
		    parent.parent.opener.initMaintWaitListDataGrid()
	    }
	    window.setTimeout(function(){window.location.href="dhceq.em.mmaintrequest.csp?&RowID="+RtnObj.Data+"&CurRole="+getElementValue("CurRole")},50);
    }
}
function getValueList()
{
	var ValueList="";
	ValueList=getElementValue("RowID");
	ValueList=ValueList+"^"+curUserID;
	ValueList=ValueList+"^"+getElementValue("CancelToFlowDR");
	ValueList=ValueList+"^"+getElementValue("EvaluateGroup");
	
	return ValueList;
}

function getEvaluateInfo()
{
	//主表
	var EInfo=""
	var GetEvaInfo=getElementValue("CheckEvaluate")
	var GetEvaInfoObj=JSON.parse(GetEvaInfo)
	if (GetEvaInfoObj.SQLCODE<0) return ""
	if (GetEvaInfoObj.Data.EvaluateStatus!=0) return ""
	var EvaluationDR=GetEvaInfoObj.Data.EvaluationID
	var RowID=getElementValue("RowID")
	var CurRole=getElementValue("CurRole")
	var Action=getElementValue("Action")
	var User=curUserID
	var EInfo="^31^"+RowID+"^^"+CurRole+"^^^^^^^"+Action+"^^"+EvaluationDR
	//明细
	var EListInfo=""
	var EvaScoreSum=0
	var EvaCount=tEvaluate.length
	for (var i=0;i<EvaCount;i++)
	{
		var EvaInfo=tEvaluate[i].split("^")
		var EvaElement=EvaInfo[0]
		var ELRowID=EvaInfo[1]
		var EvaTypeDR=EvaInfo[2]
		var EvaGroupDR=EvaInfo[3]
		var EvaScore=jQuery("#"+EvaElement).raty("score")
		if (EvaScore==undefined) EvaScore=0
		EvaScoreSum=EvaScoreSum+EvaScore
		if (EListInfo!="")
		{
			EListInfo=EListInfo+"*"+"^"+ELRowID+"^"+EvaTypeDR+"^"+EvaScore+"^^"+EvaGroupDR
		}
		else
		{
			EListInfo="^"+ELRowID+"^"+EvaTypeDR+"^"+EvaScore+"^^"+EvaGroupDR
		}
	}
	return EvaScoreSum+"@"+EInfo+"@"+EListInfo
}

//////////////////////////////////////功能处理函数///////////////////////////////////
///图片
function BPicture_Clicked()
{
	var Status=getElementValue("MRStatus");
	var str='dhceq.process.picturemenu.csp?&CurrentSourceType=31&CurrentSourceID='+getElementValue("RowID")+'&Status='+Status;
	if (Status==2) str=str+"&ReadOnly=1";
	window.open(str,'_blank','left='+ (screen.availWidth - 1150)/2 +',top='+ ((screen.availHeight>750)?(screen.availHeight-750)/2:0) +',width=1150,height=750,toolbar=no,location=no,directories=no,status=yes,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes');

}
///维修配件
function BMaintDetail_Click()
{
	var BRLRowID=getElementValue("RowID");
	if (BRLRowID=="")
	{
		messageShow("","","",t[-9205]);
		return;
	}
    var str='websys.default.csp?WEBSYS.TCOMPONENT=DHCEQMMaintPart&MaintRequestDR='+getElementValue("RowID")+'&MaintItemDR='+getElementValue("MaintItemDR")+'&Status='+getElementValue("Status");
    if (getElementValue("RoleStep")!=6) var str='websys.default.csp?WEBSYS.TCOMPONENT=DHCEQMMaintPart&MaintRequestDR='+getElementValue("RowID")+'&MaintItemDR='+getElementValue("MaintItemDR")+'&Status=0';		//非维修选择配件步骤
    window.open(str,'_blank','toolbar=no,location=no,directories=no,status=yes,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,width=1100,height=500,left=80,top=0')
}
///保修
function BSerContract_Click()
{
	var str="websys.default.csp?WEBSYS.TCOMPONENT=DHCEQSerContract&EquipDR="+getElementValue("MREXObjDR")+"&ReadOnly=1"
    window.open(str,'_blank','toolbar=no,location=no,directories=no,status=yes,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,width=890,height=650,left=120,top=0')
}
///设备信息
function BEquipInfo_Click()
{
	if (getElementValue("EQNo")=="") return;
  	var EQNo=tkMakeServerCall("web.DHCEQEquip","GetEquipIDByNo",getElementValue("EQNo"));
	if (EQNo=="") return;
	var str="dhceqequiplistnew.csp?&ReadOnly=1&RowID="+EQNo;
	window.open(str,'_blank','toolbar=no,location=no,directories=no,status=yes,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,width=980,height=800,left=200,top=10');
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createEvaluateWin(vElementID,vEvaluationDR,vEReadOnly)
{
	var obj=document.getElementById(vElementID);
	if (obj)
	{
		//生成DIV前先清空原有内容
		jQuery("#"+vElementID).empty();
		if (vEReadOnly==false)
		{
			var GetEvaluateInfo=tkMakeServerCall("web.DHCEQ.EM.BUSEvaluate","GetEvaluateInfo",vEvaluationDR);
		}
		else
		{
			var GetEvaluateInfo=tkMakeServerCall("web.DHCEQ.EM.BUSEvaluate","GetUserEvaluateInfo",vEvaluationDR);
		}
		var GetEvaluateObj=JSON.parse(GetEvaluateInfo)
		var MLEvaluateInfo=GetEvaluateObj.Data.split("&")
		var GetEvaluateMaster=MLEvaluateInfo[0]
		var GetEvaluateList=MLEvaluateInfo[1]
		var EvaluateInfo=GetEvaluateList.split("@")
		var table=jQuery("<table>");
	 	table.appendTo(jQuery("#"+vElementID));
		for (var i=0;i<EvaluateInfo.length;i++)
		{
			var OneEvaluateInfo=EvaluateInfo[i].split("^")
			var caption=OneEvaluateInfo[2]+":"
			var id="StarEvaluate"+(i+1)
			var starnum=OneEvaluateInfo[3]
			var escore=OneEvaluateInfo[6]
			var tHints=new Array();
			if (OneEvaluateInfo[4]!="")
			{
				var HintsInfo=OneEvaluateInfo[4].split(",")
				for (var j=0;j<HintsInfo.length;j++)
				{
					tHints.push(HintsInfo[j])
				}
			}
			var tr=jQuery("<tr height=\"30px\">")
			tr.appendTo(table);
			var td="<td align=\"right\">"+caption+"</td>"
			td=td+"<td><div id=\""+id+"\" style=\"margin-left:5px;\"></div></td>"
			//td=td+"<td><lable id=\""+id+"Score\"></lable></td>"
			td=jQuery(td)
			td.appendTo(tr);
			var trend=jQuery("</tr>")
			trend.appendTo(table);
			//生成星号评价插件
			fStarEvaluate(id,1,starnum,true,escore,tHints,vEReadOnly);
//			if (escore>starnum)
//			{
//				jQuery("#"+id+"Score").text(starnum+"分")
//			}
//			else
//			{
//				jQuery("#"+id+"Score").text(escore+"分")
//			}
			tEvaluate[i]=id+"^"+OneEvaluateInfo[0]+"^"+OneEvaluateInfo[1]+"^"+OneEvaluateInfo[5];
		}
		jQuery("#"+vElementID).append("</table>");
	}
}

function linkClick()
{
	selectTab("tOtherTabs","tMaintBuss")
}
function createMaintHistory(vEQRowID)
{
	if (vEQRowID=="") return
	var MaintHistory=tkMakeServerCall("web.DHCEQ.EM.BUSMMaintRequest","GetMaintHistory",vEQRowID)
	var MaintHistoryObj=jQuery.parseJSON(MaintHistory)
	if (MaintHistoryObj.SQLCODE<0) return
	var MaxKey=""
	for (var key in MaintHistoryObj.Data){MaxKey=key}
	for (var key in MaintHistoryObj.Data)
	{
		var RowID="MaintHistoryID"+key
		var OntMaintInfo=MaintHistoryObj.Data[key]
		var RequestDate=OntMaintInfo["RequestDate"]
		var RequestUser=OntMaintInfo["RequestUser"]
		var FaultCaseDR=OntMaintInfo["FaultCaseDR"]
		var FaultCase=OntMaintInfo["FaultCase"]
		var FaultReasonDR=OntMaintInfo["FaultReasonDR"]
		var FaultReason=OntMaintInfo["FaultReason"]
		var DealMethodDR=OntMaintInfo["DealMethodDR"]
		var DealMethod=OntMaintInfo["DealMethod"]
		var AcceptUser=OntMaintInfo["AcceptUser"]
//		//历史维修记录
//		var treeObj=$("#tMaintHistorytree").tree("find",RowID)
//		if (!treeObj)
//		{
//			var childdata=[{"id":RowID+"_U","text":RequestUser},{"id":RowID+"_F","text":FaultCase}]
//			var treedata=[{"id":RowID,"text":RequestDate,"children":childdata}]
//			$("#tMaintHistorytree").tree('append', {data:treedata});
//			
//			$("#tMaintHistory").find("span").removeClass("tree-folder")
//			var spanobj=$("#tMaintHistory").find("span.tree-icon")
//			spanobj.eq(0).attr("class","")
//			spanobj.eq(1).prev().attr("class","")
//			spanobj.eq(1).attr("class","tree-file")
//			spanobj.eq(2).prev().attr("class","")
//			spanobj.eq(2).attr("class","tree-file")
//		}
		//历史维修记录
		var flag=""
		if (key==MaxKey) flag=1
		var options={id:'tMaintHistorytree',section:'',item:'^^'+RequestDate+'%eq-user.png^^'+AcceptUser+'%eq-faultcase.png^^'+FaultCase,lastFlag:flag}
		createTimeLine(options)
		//知识库
		if (FaultCaseDR!="")
		{
			var KnowledgeF="Knowledge_"+FaultCaseDR
			var FaultCaseObj=appendTree("tKnowledgetree","Knowledge_"+FaultCaseDR,FaultCase,"")
			if ((FaultCaseObj!=null)&&(FaultReasonDR!=""))
			{
				var KnowledgeR=KnowledgeF+"_"+FaultReasonDR
				var FaultReasonObj=appendTree("tKnowledgetree",KnowledgeR,FaultReason,KnowledgeF)
				if ((FaultReasonObj!=null)&&(DealMethodDR!=""))
				{
					var KnowledgeD=KnowledgeR+"_"+DealMethodDR
					appendTree("tKnowledgetree",KnowledgeD,DealMethod,KnowledgeR)
				}
			}
			//$("#tKnowledge").find("span").removeClass("tree-folder tree-file")
		}
	}
}
function onBeforeShowPanel(vElementID)
{
	if (vElementID=="MRExObjDR_ExObj")
	{
		setElement("MRSourceTypeDR",0)
		if (getElementValue("MRSourceType")!="1"){setElement("MRSourceTypeDR",1)}
		if (getElementValue("MRObjLocDR")=="")
		{
			var Info=t[-9202]
			Info=Info.replace("[Caption]",getElementValue("cMRObjLocDR_LocDesc"));
			messageShow("","","",Info)
			return false
		}
	}
	return true
}
function BEvaluate_Clicked()
{
	alert("待开发")
}
///Modefidy by zc 2018-10-29 ZC0041  多人协助
function BMaintUser_Click()
{
	var SourceID=getElementValue("RowID");
	if (SourceID=="")
	{
		alert("无设备维修申请信息!");
		return;
	}
	var para="SourceType=31&SourceID="+SourceID+"&Action="+getElementValue("Action")
    var url='dhceq.em.maintuserlist.csp?'+para;
    openModelDlg(url,"1200","650","维修协助人员","")
}