
var editIndex=undefined;
var modifyBeforeRow = {};
var toolbarFlag=0;
var ISRowID=getElementValue("ISRowID");
var Columns=getCurColumnsInfo('EM.G.InStock.InStockList','','','')
var oneFillData={}

$(function(){
	initDocument();
});

function initDocument()
{
	setElement("ISInDate",GetCurrentDate())
	setElement("ISLocDR_CTLOCDesc",getElementValue("ISLoc"))
	setElement("ISOriginDR_ODesc",getElementValue("ISOrigin"))
	setElement("ISEquipTypeDR_ETDesc",getElementValue("ISEquipType"))
	
	initUserInfo();
    initMessage("InStock"); //获取所有业务消息
    //initLookUp("MRObjLocDR_LocDesc^MRExObjDR_ExObj^"); //初始化放大镜
    initLookUp(); //初始化放大镜
	defindTitleStyle(); 
    initButton(); //按钮初始化
    //initPage(); //非通用按钮初始化
    initButtonWidth();
    setRequiredElements("ISInDate^ISLocDR_CTLOCDesc^ISEquipTypeDR_ETDesc^ISOriginDR_ODesc^ISProviderDR_VDesc")
    fillData(); //数据填充
    setEnabled(); //按钮控制
    //setElementEnabled(); //输入框只读控制 
    //initEditFields(); //获取可编辑字段信息
    initApproveButton(); //初始化审批按钮
	$HUI.datagrid("#DHCEQInStock",{
		url:$URL,
		queryParams:{
		    	ClassName:"web.DHCEQ.EM.BUSInStock",
	        	QueryName:"GetInStockListNew",
				InStockID:ISRowID
		},
	    toolbar:[{
    			iconCls: 'icon-add',
                text:'新增',  
				id:'add',        
                handler: function(){
                     insertRow();
                }},'----------',
                {
                iconCls: 'icon-cancel',
                text:'删除',
				id:'delete',
                handler: function(){
                     deleteRow();
                }}
                ],
		//rownumbers: true,  //如果为true，则显示一个行号列。
		//singleSelect:true,
		fit:true,
		striped : true,
	    cache: false,
		fitColumns:true,
		columns:Columns,
		//onClickRow:function(rowIndex,rowData){onClickRow();},
		pagination:true,
		pageSize:25,
		pageNumber:1,
		pageList:[25,50,75,100],
		onLoadSuccess:function(){creatToolbar();}
	});
};
//添加“合计”信息
function creatToolbar()
{
	// Mozy0217  2018-11-01		修改汇总数量及总金额
	var rows = $('#DHCEQInStock').datagrid('getRows');
    var totalISLQuantityNum = 0;
    var totalISLTotalFee = 0;
    for (var i = 0; i < rows.length; i++)
    {
	    if (rows[i].ISLHold4=="")
	    {
        	var colValue=rows[i]["ISLQuantityNum"];
        	if (colValue=="") colValue=0;
        	totalISLQuantityNum += parseFloat(colValue);
        	colValue=rows[i]["ISLTotalFee"];
        	if (colValue=="") colValue=0;
        	totalISLTotalFee += parseFloat(colValue);
    	}
    }
	var lable_innerText='总数量:'+totalISLQuantityNum+'&nbsp;&nbsp;&nbsp;总金额:'+totalISLTotalFee.toFixed(2);
	//var lable_innerText='总数量:'+totalSum("DHCEQInStock","ISLQuantityNum")+'&nbsp;&nbsp;&nbsp;总金额:'+totalSum("DHCEQInStock","ISLTotalFee").toFixed(2)
	$("#sumTotal").html(lable_innerText);
	
    var rows = $("#DHCEQInStock").datagrid('getRows');
    for (var i = 0; i < rows.length; i++) {
	    if ((rows[i].ISLSourceType=="")||(rows[i].ISLSourceID==""))
	    {
		    $("#Affix"+"z"+i).hide()
		    $("#FundsInfo"+"z"+i).hide()
		}
    }
    ///modified by zy 20181105 ZY0177 hisui改造,界面toolbar按钮控制
	var Status=getElementValue("ISStatus");
	if (Status>0)
	{
		disableElement("add",true);
		disableElement("delete",true);
	}
}

function fillData()
{
	if (ISRowID=="") return;
	var Action=getElementValue("Action");
	var Step=getElementValue("RoleStep");
	var ApproveRoleDR=getElementValue("ApproveRoleDR");
	//alert("ISRowID="+ISRowID+"Action="+Action+",Step="+Step+",ApproveRoleDR="+ApproveRoleDR)
	jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSInStock","GetOneInStock",ISRowID,ApproveRoleDR,Action,Step)
	//messageShow("","","",jsonData)
	jsonData=jQuery.parseJSON(jsonData);
	if (jsonData.SQLCODE<0) {messageShow("","","",jsonData.Data);return;}
	setElementByJson(jsonData.Data);
	oneFillData=jsonData.Data
    if (jsonData.Data["MultipleRoleFlag"]=="1")
    {
	    setElement("NextRoleDR",getElementValue("CurRole"));
	    setElement("NextFlowStep",getElementValue("RoleStep"));
	}
}
function setEnabled()
{
	var Status=getElementValue("ISStatus");
	var WaitAD=getElementValue("WaitAD");
	var ReadOnly=getElementValue("ReadOnly");
	if (Status!="0")
	{
		disableElement("BDelete",true)
		disableElement("BSubmit",true)
		if (Status!="")
		{
			disableElement("BSave",true)
		}
	}
	//审核后才可打印及生成转移单
	if (Status!="2")
	{
		disableElement("BPrint",true)
	}
	//非建单据菜单,不可更新等操作单据
	if (WaitAD!="off")
	{
		disableElement("BSave",true);
		disableElement("BDelete",true);
		disableElement("BSubmit",true);
		setElement("ReadOnly",1);	//非建单据菜单,设为只读.Add By HZY 2012-01-31 HZY0021
	}
	///modefied by zy 20190111 ZY0184
	///作废按钮
	disableElement("BCancel",true);
	if (Status=="2")
	{
		var CancelOper=getElementValue("CancelOper")
		if (CancelOper=="Y")
		{
			disableElement("BCancel",false);
			var obj=document.getElementById("BCancel");
			if (obj) obj.onclick=BCancel_Clicked;
		}
	}
	else
	{
		hiddenObj("BCancel",1); 
	}
}

function setSelectValue(elementID,rowData)
{
	if(elementID=="ISLocDR_CTLOCDesc") {setElement("ISLocDR",rowData.TRowID)}
	else if(elementID=="ISEquipTypeDR_ETDesc") {setElement("ISEquipTypeDR",rowData.TRowID)}
	else if(elementID=="ISOriginDR_ODesc") {setElement("ISOriginDR",rowData.TRowID)}
	else if(elementID=="ISFromDeptDR_CTLOCDesc") {setElement("ISFromDeptDR",rowData.TRowID)}
	else if(elementID=="ISProviderDR_VDesc") {setElement("ISProviderDR",rowData.TRowID)	}
	else if(elementID=="EQPurposeTypeDR_PTDesc") {setElement("EQPurposeTypeDR",rowData.HIDDEN)}
	else if(elementID=="ISBuyLocDR_CTLOCDesc") {setElement("ISBuyLocDR",rowData.TRowID)}
	else if(elementID=="ISBuyUserDR_SSUSRName") {setElement("ISBuyUserDR",rowData.TRowID)}
	else if(elementID=="OpenCheck"){SaveDataFromOpenCheck(rowData)}
}

//hisui.common.js错误纠正需要
//add by csj 20181103 onChange清除事件
function clearData(vElementID)
{
	var _index = vElementID.indexOf('_')
	if(_index != -1){
		var vElementDR = vElementID.slice(0,_index)
		if($("#"+vElementDR).length>0)
		{
			setElement(vElementDR,"");
		}
	}
}
 
// 插入新行
function insertRow()
{
	if(editIndex>="0"){
		jQuery("#DHCEQInStock").datagrid('endEdit', editIndex);//结束编辑，传入之前编辑的行
	}
    var rows = $("#DHCEQInStock").datagrid('getRows');
    var lastIndex=rows.length-1
    var newIndex=rows.length
    //modified by zy 20181120
    if (lastIndex>=0)
    {
	    if ((rows[lastIndex].ISLSourceType=="")||(rows[lastIndex].ISLSourceID==""))
	    {
		    alert("第"+newIndex+"行数据为空!请先填写数据.")
		    return
		}
	}
	if (newIndex>=0)
	{
		jQuery("#DHCEQInStock").datagrid('insertRow', {index:newIndex,row:{}});
		editIndex=0;
		//隐藏新行的图标
		$("#Affix"+"z"+newIndex).hide()
		$("#FundsInfo"+"z"+newIndex).hide()
	}
}

function deleteRow()
{
	if (editIndex>="0")
	{
		jQuery("#DHCEQInStock").datagrid('endEdit', editIndex);//结束编辑，传入之前编辑的行
	}
	removeCheckBoxedRow("DHCEQInStock")
}
function BSave_Clicked()
{
	if (getElementValue("ISProviderDR")=="")
	{
		alert("供应商不能为空!")
		return
	}
	if (getElementValue("ISLocDR")=="")
	{
		alert("库房不能为空!")
		return
	}
	if (getElementValue("ISInDate")=="")
	{
		alert("制单日期不能为空!")
		return
	}
	if (getElementValue("ISOriginDR")=="")
	{
		alert("来源不能为空!")
		return
	}
	
	var data=getInputList();
	data=JSON.stringify(data);
	var dataList=""
	var rows = $('#DHCEQInStock').datagrid('getRows');
	for (var i = 0; i < rows.length; i++) 
	{
		var oneRow=rows[i]
		if (oneRow.ISLEquipName=="")
		{
			alert("第"+(i+1)+"行数据不正确!")
			return "-1"
		}
		var RowData=JSON.stringify(rows[i])
		if (dataList=="")
		{
			dataList=RowData
		}
		else
		{
			dataList=dataList+"&"+RowData
		}
	}
	if (dataList=="")
	{
		alert("入库明细不能为空!");
		//return;
	}
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSInStock","SaveData",data,dataList,"0");
	jsonData=JSON.parse(jsonData)
	if (jsonData.SQLCODE==0)
	{
	    //window.location.reload()
		var Status=getElementValue("Status");
		var WaitAD=getElementValue("WaitAD"); 
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var val="&RowID="+jsonData.Data+"&Status="+Status+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		//url="dhceqinstocknew.csp?&DHCEQMWindow=1"+val
		url="dhceq.em.instock.csp?"+val
	    window.location.href= url;
	}
	else
    {
		alert("错误信息:"+jsonData.Data);
		return
    }
}
function BDelete_Clicked()
{
	if (ISRowID=="")
	{
		alert("没有入库单删除!");
		return;
	}
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSInStock","SaveData",ISRowID,"","1");
	jsonData=JSON.parse(jsonData)
	
	if (jsonData.SQLCODE==0)
	{
	    //window.location.reload()
		var Status=getElementValue("Status");
		var WaitAD=getElementValue("WaitAD");
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var val="&RowID="+jsonData.Data+"&Status="+Status+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		//url="dhceqinstocknew.csp?&DHCEQMWindow=1"+val
		url="dhceq.em.instock.csp?"+val
	    window.location.href= url;
	}
	else
    {
		alert("错误信息:"+jsonData.Data);
		return
    }
}
function BSubmit_Clicked()
{
	if (ISRowID=="")
	{
		alert("没有入库单删除!");
		return;
	}
	// Mozy0217  2018-11-01	检测配置设备并提示
  	var truthBeTold=true;
	var CheckConfig=tkMakeServerCall("web.DHCEQInStockNew","CheckConfigDR",ISRowID);
  	if (CheckConfig!="") truthBeTold=window.confirm("本入库单明细包含的配置设备在主设备审核完成后一并完成提交及后续审核处理!!!")
  	if (!truthBeTold) return;

	var data=ISRowID
	data=data+"^"+getElementValue("ISRejectReason");
	data=data+"^"+curUserID
	data=data+"^"+getElementValue("ISRemark");
	data=data+"^"+getElementValue("ISStatCatDR");
	data=data+"^"+getElementValue("ISEquipTypeDR");
	data=data+"^"	//getElementValue("CancelToFlowDR");
	data=data+"^"	//getElementValue("ApproveSetDR");
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSInStock","SubmitData",data);
	jsonData=JSON.parse(jsonData)
	
	if (jsonData.SQLCODE==0)
	{
	    //window.location.reload()
		var Status=getElementValue("Status");
		var WaitAD=getElementValue("WaitAD"); 
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var val="&RowID="+jsonData.Data+"&Status="+Status+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		//url="dhceqinstocknew.csp?&DHCEQMWindow=1"+val
		url="dhceq.em.instock.csp?"+val
	    window.location.href= url;

	}
	else
    {
		alert("错误信息:"+jsonData.Data);
		return
    }
}
function BCancelSubmit_Clicked()
{
	//alert("BCancelSubmit_Clicked")
	//return
	if (ISRowID=="")
	{
		alert("没有入库单取消!");
		return;
	}
	var combindata=getValueList();
  	var CancelReason=getElementValue("CancelReason");
  	combindata=combindata+"^"+CancelReason;
	var Rtn=tkMakeServerCall("web.DHCEQ.EM.BUSInStock","CancelSubmitData",combindata,getElementValue("CurRole"));
    var RtnObj=JSON.parse(Rtn)
    if (RtnObj.SQLCODE<0)
    {
	    messageShow("","","",RtnObj.Data)
    }
    else
    {
	    //messageShow("","","",t[0])
	    //window.location.reload()
		var Status=getElementValue("Status");
		var WaitAD=getElementValue("WaitAD"); 
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var val="&RowID="+RtnObj.Data+"&Status="+Status+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		url="dhceq.em.instock.csp?"+val
	    window.setTimeout(function(){window.location.href=url},50); 
    }
}
function getValueList()
{
	var ValueList="";
	ValueList=ISRowID;
	ValueList=ValueList+"^"+getElementValue("ISRejectReasonDR");
	ValueList=ValueList+"^"+curUserID;
	ValueList=ValueList+"^"+getElementValue("ISRemark");
	ValueList=ValueList+"^"+getElementValue("ISStatCatDR");
	ValueList=ValueList+"^"+getElementValue("ISEquipTypeDR");
	ValueList=ValueList+"^"+getElementValue("CancelToFlowDR");
	ValueList=ValueList+"^"+getElementValue("ApproveSetDR");
	return ValueList;
}

function BApprove_Clicked()
{
	if (ISRowID=="")
	{
		alert("没有入库单审核消!");
		return;
	}
	var combindata=getValueList();
	var CurRole=getElementValue("CurRole")
  	if (CurRole=="") return;
	var RoleStep=getElementValue("RoleStep")
  	if (RoleStep=="") return;
  	//20170329	自动出库
  	var AutoInOutInfo=tkMakeServerCall("web.DHCEQInStockNew","GetAutoInOut",ISRowID+"^"+CurRole+"^"+RoleStep);
	var autoflag=2*AutoInOutInfo;
	if (AutoInOutInfo=="1")
	{
		//检测入库单是否满足自动出库条件
		var CheckAutoMoveFlag=tkMakeServerCall("web.DHCEQInStockNew","CheckAutoMoveFlag",ISRowID);
		var CAMInfo=CheckAutoMoveFlag.split("^");
		if ((CAMInfo[0]!="Y")&&(getElementValue("ISBuyLocDR")==""))
		{
			alert("["+CAMInfo[1]+"]的验收单无使用科室并且本单据申购部门不能办理自动出库!")
			return
		}
	}
	if (AutoInOutInfo=="2")
	{
		autoflag=autoflag-2;
		truthBeTold = window.confirm("是否进行自动出库操作?");
		if (!truthBeTold)
		{
			autoflag=autoflag-2;
		}
		else
		{
			//检测入库单是否满足自动出库条件
			var CheckAutoMoveFlag=tkMakeServerCall("web.DHCEQInStockNew","CheckAutoMoveFlag",ISRowID);
			var CAMInfo=CheckAutoMoveFlag.split("^");
			if ((CAMInfo[0]!="Y")&&(getElementValue("ISBuyLocDR")==""))
			{
				alert("["+CAMInfo[1]+"]的验收单无使用科室并且本单据申购部门不能办理自动出库!")
				return
			}
		}
	}
	
	//var objtbl=getParentTable("ISInStockNo")
	//var EditFieldsInfo=ApproveEditFieldsInfo(objtbl);
	//if (EditFieldsInfo=="-1") return;
	//alert("combindata="+combindata)
  	var Rtn=tkMakeServerCall("web.DHCEQ.EM.BUSInStock","AuditData",combindata,CurRole,RoleStep,"",autoflag);
    var RtnObj=JSON.parse(Rtn)
    
    if (RtnObj.SQLCODE<0)
    {
	    messageShow("","","",RtnObj.Data)
    }
    else
    {
	    //messageShow("","","",t[0])
	    //window.location.reload()
		var Status=getElementValue("Status");
		var WaitAD=getElementValue("WaitAD"); 
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var val="&RowID="+RtnObj.Data+"&Status="+Status+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		url="dhceq.em.instock.csp?"+val
	    window.setTimeout(function(){window.location.href=url},50); 
    }
}

function BCancel_Clicked()
{
  	var results=tkMakeServerCall("web.DHCEQAbnormalDataDeal","CheckBussCancelFlag",2,ISRowID);
	var result=results.split("^")
	if (result[0]!=="0")
	{
		messageShow("","","",result[1])
	}
	else
	{
		var truthBeTold = window.confirm("相关的验收,出库,台账也一起作废!是否继续？");
	    if (!truthBeTold) return;
  		var results=tkMakeServerCall("web.DHCEQAbnormalDataDeal","CancelBuss",2,ISRowID);
		var result=results.split("^")
		if (result[0]!=="0")
		{
			if (result[1]!="")
			{
				messageShow("","","","操作失败:"+result[1])
			}
			else
			{
				messageShow("","","","操作失败:"+result[0])
			}
		}
		else
		{
			messageShow("","","","成功作废!")
			//modified by zy 20181120 ZY0179
			var url="dhceq.em.instock.csp?&RowID="+ISRowID
	    	window.setTimeout(function(){window.location.href=url},50); 
		}
	}
}
///HISUI改造需重新调整 曾超[元素:initRunQian,PrintFlag 继承:DHCCPMRQCommon.js]
///modified by zy 20181205 ZY0180 
/*
function BPrint_Clicked()
{
    
    if ((ISRowID=="")||(ISRowID<1))  return;
    var PrintFlag=getElementValue("PrintFlag");
	if(PrintFlag==0)
	{
		 PrintInStore(ISRowID);
	}
	if(PrintFlag==1)
	{
	  fileName="DHCEQInStockPrint.raq&RowID="+ISRowID
	  DHCCPM_RQPrint(fileName);	
	}
}
*/
///modified by zy 20181205 ZY0180 
function BPrint_Clicked()
{
	if (ISRowID=="") return;
	
	var gbldata=tkMakeServerCall("web.DHCEQInStockSP","GetList",ISRowID);
	//messageShow("","","",ReturnList);
	//modified by zy 0111
	var list=gbldata.split(getElementValue("SplitNumCode"));
	var Listall=list[0];
	rows=list[1];
	//rows=rows-1;
	var PageRows=6;
	var Pages=parseInt(rows / PageRows); //总页数?1  3为每页固定行数
	var ModRows=rows%PageRows; //最后一页行数
	if (ModRows==0) {Pages=Pages-1;}
	
  	var TemplatePath=tkMakeServerCall("web.DHCEQStoreMoveSP","GetPath");
	//try {
        var xlApp,xlsheet,xlBook;
	    var Template=TemplatePath+"DHCEQInStockSP.xls";
	    xlApp = new ActiveXObject("Excel.Application");
	    for (var i=0;i<=Pages;i++)
	    {
	    	xlBook = xlApp.Workbooks.Add(Template);
	    	xlsheet = xlBook.ActiveSheet;
	    	//医院名称替换 Add By DJ 2011-07-14
	    	xlsheet.cells.replace("[Hospital]",getElementValue("HospitalDesc"))
	    	xlsheet.cells(2,2)="单  号:"+oneFillData["ISInStockNo"]; //入库单号
	    	xlsheet.cells(2,7)=ChangeDateFormat(oneFillData["ISInDate"]);	//入库日期
	    	xlsheet.cells(2,9)="库  房:"+GetShortName(oneFillData["ISLocDR_CTLOCDesc"],"-");//库房
	    	xlsheet.cells(3,2)="类  组:"+oneFillData["ISEquipTypeDR_ETDesc"];
	    	//xlsheet.cells(3,2)="类  型:"+oneFillData["ISStatTypeDR_STDesc"];
	    	xlsheet.cells(3,7)=GetShortName(oneFillData["ISProviderDR_VDesc"],"-"); //供货商
	    	//xlsheet.cells(2,10)=GetShortName(oneFillData["ISBuyLocDR_CTLOCDesc"],"-"); //申购科室
	    	
	   		var OnePageRow=PageRows;
	   		if ((i==Pages)&&(ModRows!=0)) OnePageRow=ModRows;
	    	
	    	var FeeAll=0;
	    	var Lists=Listall.split(getElementValue("SplitRowCode"));
	    	for (var j=1;j<=OnePageRow;j++)
			{
				var Listl=Lists[i*PageRows+j];
				var List=Listl.split("^");
				var Row=4+j;
				if ((List[0]=='合计')&&(i==Pages))
				{
					xlsheet.cells(10,2)=List[0];//设备名称
					xlsheet.cells(10,6)=List[4];//数量
					xlsheet.cells(10,8)=List[6];//金额
				}
				else
				{
					xlsheet.cells(Row,2)=List[0];//设备名称
					xlsheet.cells(Row,4)=List[2];//机型
					xlsheet.cells(Row,5)=List[3];//单位
					xlsheet.cells(Row,6)=List[4];//数量
					xlsheet.cells(Row,7)=List[5];//原值
					xlsheet.cells(Row,8)=List[6];//金额
					//xlsheet.cells(Row,9)=List[9];//设备编号
					//xlsheet.cells(Row,9)=List[1];//生产厂商
					xlsheet.cells(Row,9)=List[7];//发票号
					//xlsheet.cells(Row+5,9)=List[10];//合同号				
					xlsheet.cells(Row,10)=List[12];//发票日期
					xlsheet.cells(Row,11)=List[8];// 备注
					xlsheet.cells(3,10)=List[13];//资金来源
					
					FeeAll=FeeAll+List[6];
					
					var equipdr=List[11];
					
				}
					var Row=Row+1;
				
	    	}
	    	xlsheet.cells(11,9)="制单人:"+oneFillData["ISRequestUserDR_SSUSRName"]   //username; //制单人
	    	//if (lista[19]==2) xlsheet.cells(10,9)=""; //制单人
	    	
	    	xlsheet.cells(12,10)="第"+(i+1)+"页 "+"共"+(Pages+1)+"页";
	    	var obj = new ActiveXObject("PaperSet.GetPrintInfo");
		    var size=obj.GetPaperInfo("DHCEQInStock");
		    if (0!=size) xlsheet.PageSetup.PaperSize = size;
	    	
	    	xlsheet.printout; 	//打印输出
	
	    	xlBook.Close (savechanges=false);
	    	
	    	xlsheet.Quit;
	    	xlsheet=null;
	    }
	    xlApp=null;
	//} 
	//catch(e)
	//{
	//	messageShow("","","",e.message);
	//}
}

function endEditing(){
		if (editIndex == undefined){return true}
		if ($('#DHCEQInStock').datagrid('validateRow', editIndex)){
			$('#DHCEQInStock').datagrid('endEdit', editIndex);
    		var rows = $("#DHCEQInStock").datagrid('getRows');
    		if (!rows[editIndex].hasOwnProperty("ISLSourceType"))
    		{
			    $("#Affix"+"z"+editIndex).hide()
			    $("#FundsInfo"+"z"+editIndex).hide()
	    	}
			editIndex = undefined;
			return true;
		} else {
			return false;
		}
	}
function onClickRow(index){
	var Status=getElementValue("ISStatus");
	if (Status>0) return
	if (editIndex!=index) 
	{
		if (endEditing())
		{
			$('#DHCEQInStock').datagrid('selectRow', index).datagrid('beginEdit', index);
			editIndex = index;
			modifyBeforeRow = $.extend({},$('#DHCEQInStock').datagrid('getRows')[editIndex]);
		} else {
			$('#DHCEQInStock').datagrid('selectRow', editIndex);
		}
	}
	else
	{
		endEditing();
	}
}
function GetOpenCheckList(index,data)
{
	//入库明细表中已存在改设备
	//if ((data.ISStatus=="Y")&&(oneFillData["ISInStockNo"]!=data.ISNo))
	if (data.ISStatus=="Y")
	{
		alert("当前设备已在入库单" + data.ISNo + "中存在!")
		return
	}
	var rowData = $('#DHCEQInStock').datagrid('getSelected');
	var OCRRowID=data.OCRRowID
	if (OCRRowID=="") return;
	jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSOpenCheckRequest","GetOneOpenCheckRequest",OCRRowID);
	jsonData=jQuery.parseJSON(jsonData);
	if (jsonData.SQLCODE<0) {messageShow("","","",jsonData.Data);return;}
	//setElementByJson(jsonData.Data);
	var OpenCheckRequest=jsonData.Data
	
	var OCLRowID=data.OCLRowID
	if (OCLRowID=="") return;
	jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSOpenCheckList","GetOneOpenCheckList",OCLRowID);
	jsonData=jQuery.parseJSON(jsonData);
	if (jsonData.SQLCODE<0) {messageShow("","","",jsonData.Data);return;}
	//setElementByJson(jsonData.Data);
	var OpenCheckList=jsonData.Data
	rowData.ISLSourceType=2
	rowData.ISLSourceID=OCLRowID
	rowData.ISLModelDR=OpenCheckList["OCLModelDR"]
	rowData.ISLModelDR_MDesc=OpenCheckList["OCLModelDR_MDesc"]
	rowData.ISLManuFactoryDR=OpenCheckList["OCLManuFactoryDR"]
	rowData.ISLManuFactoryDR_MDesc=OpenCheckList["OCLManuFactoryDR_MDesc"]
	rowData.ISLEquipCatDR=OpenCheckList["OCLEquiCatDR"]
	rowData.ISLEquipCatDR_ECDesc=OpenCheckList["OCLEquiCatDR_ECDesc"]
	rowData.ISLUnitDR=OpenCheckList["OCLUnitDR"]
	rowData.ISLUnitDR_UOMDesc=OpenCheckList["OCLUnitDR_UOMDesc"]
	rowData.ISLItemDR=OpenCheckList["OCLItemDR"]
	rowData.ISLStatCatDR=OpenCheckRequest["OCRStatCatDR"]
	rowData.ISLStatCatDR_SCDesc=OpenCheckRequest["OCRStatCatDR_SCDesc"]
	rowData.ISLQuantityNum=OpenCheckList["OCLQuantity"]
	rowData.ISLOriginalFee=OpenCheckList["OCLOriginalFee"]
	rowData.ISLTotalFee=rowData.ISLQuantityNum*rowData.ISLOriginalFee
	rowData.ISLLimitYearsNum=OpenCheckList["OCLLimitYearsNum"]
	rowData.ISLHold5=OpenCheckList["OCLHold5"]
	//modified by  ZY0172  20181023  改变可编辑列的赋值方式。
	//rowData.ISLHold5_EDesc=OpenCheckList["OCLHold5_EDesc"]
	var editor = $('#DHCEQInStock').datagrid('getEditors', editIndex);
	//$(editor[0].target).combogrid("setValue",OpenCheckList["OCLName"]);
    //$(editor[1].target).val(OpenCheckList["OCLQuantity"]);
	$(editor[1].target).val(OpenCheckList["OCLHold1"]);
    $(editor[2].target).combogrid("setValue",OpenCheckList["OCLHold5_EDesc"]);
	
	$('#DHCEQInStock').datagrid('endEdit',editIndex);
}
function GetEcpenditures(index,data)
{
	var rowData = $('#DHCEQInStock').datagrid('getSelected');
	rowData.ISLHold5=data.TRowID
	var editor = $('#DHCEQInStock').datagrid('getEditors', editIndex);
	$(editor[2].target).combogrid("setValue",data.TName);
	$('#DHCEQInStock').datagrid('endEdit',editIndex);
}

function SaveDataFromOpenCheck(rowData)  //设备验收已审核单据,未入库设备
{
	if ((ISRowID!="")&&(oneFillData["ISStatus"]!=="")&&(oneFillData["ISStatus"]!=="0"))
	{
		alert("当前入库单已提交,需增加明细,请先取消提交!")
		return
	}
	//入库明细表中已存在改设备
	if (rowData.ISStatus=="Y")
	{
		alert("当前设备已在入库单" + rowData.ISNo + "中存在!")
		setElement("OpenCheck","")
		return
	}
	else
	{
		var plist=rowData.OCRRowID+"^"+rowData.OCLRowID+"^"+ISRowID+"^"+getElementValue("ISLocDR")+"^"+SessionObj.GUSERID;
		var result=tkMakeServerCall("web.DHCEQInStockNew","SaveDataFromOpenCheck",plist);
		if(result>0)
		{
		    //window.location.reload()
			var Status=getElementValue("Status");
			var WaitAD=getElementValue("WaitAD"); 
			var QXType=getElementValue("QXType");
			var flag=getElementValue("flag");
			var val="&RowID="+result+"&Status="+Status+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
			//url="dhceqinstocknew.csp?&DHCEQMWindow=1"+val
			url="dhceq.em.instock.csp?"+val
		    window.location.href= url;

		}
		else
	    {
			alert("错误信息:"+result);
			return
	    }
	}
}

