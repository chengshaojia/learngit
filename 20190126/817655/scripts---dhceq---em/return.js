
var editIndex=undefined;
var modifyBeforeRow = {};
var toolbarFlag=0;
var RRowID=getElementValue("RRowID");
if(getElementValue("ROutTypeDR")=="1")
{
	var Columns=getCurColumnsInfo('EM.G.Return.ReturnList','','','')
}
else
{
	var Columns=getCurColumnsInfo('EM.G.OutStock.OutStockList','','','')
}
var oneFillData={}
var ObjSources=new Array();

$(function(){
	initDocument();
});

function initDocument()
{
	initUserInfo();
    initMessage("InStock"); //获取所有业务消息
    //initLookUp("MRObjLocDR_LocDesc^MRExObjDR_ExObj^"); //初始化放大镜
    initLookUp(); //初始化放大镜
	defindTitleStyle(); 
    initButton(); //按钮初始化
    //initPage(); //非通用按钮初始化
    initButtonWidth();
    setRequiredElements("RReturnDate^RReturnLocDR_CTLOCDesc^REquipTypeDR_ETDesc^RProviderDR_VDesc^ROutTypeDR_OTDesc")
    fillData(); //数据填充
   	setEnabled(); //按钮控制
    //setElementEnabled(); //输入框只读控制 
    //initEditFields(); //获取可编辑字段信息
    initApproveButton(); //初始化审批按钮
	$HUI.datagrid("#DHCEQReturn",{
		url:$URL,
		queryParams:{
		    	ClassName:"web.DHCEQ.EM.BUSReturn",
	        	QueryName:"ReturnListNew",
				RowID:RRowID
		},
	    toolbar:[{
    			iconCls: 'icon-add',
                text:'新增',  
				id:'add',        
                handler: function(){
                     insertRow();
                }},'----------',
                {
                iconCls: 'icon-save',
                text:'删除',
				id:'delete',
                handler: function(){
                     deleteRow();
                }}
                ],
		//rownumbers: true,  //如果为true，则显示一个行号列。
		singleSelect:true,
		fit:true,
		striped : true,
	    cache: false,
		//fitColumns:true,
		columns:Columns,
		//onClickRow:function(rowIndex,rowData){onClickRow();},
		pagination:true,
		pageSize:25,
		pageNumber:1,
		pageList:[25,50,75,100],
		onLoadSuccess:function(){
			creatToolbar();	
		}
	});
};
//合计行显示
function creatToolbar()
{
	var lable_innerText='总数量:'+totalSum("DHCEQReturn","RLReturnQtyNum")+'&nbsp;&nbsp;&nbsp;总金额:'+totalSum("DHCEQReturn","RLTotalFee").toFixed(2)
	$("#sumTotal").html(lable_innerText);
	var panel = $("#DHCEQReturn").datagrid("getPanel");
	var rows = $("#DHCEQReturn").datagrid('getRows');
    for (var i = 0; i < rows.length; i++) {
	    if ((rows[i].REquipDR=="")&&(rows[i].RInStockListDR==""))
	    {
		    $("#TEquipList"+"z"+i).hide();
		}
    }
    
	var Status=getElementValue("RStatus");
	if (Status>0)
	{
		panel.find("#add").hide();
		panel.find("#delete").hide();
	}
	var  job=$('#DHCEQReturn').datagrid('getData').rows[0].RLJob;
	setElement("RJob",job);
}
//填充数据
function fillData()
{
	//start by csj 20190125 台账链接到退货界面处理
	var EquipDR=getElementValue("EquipDR");
	if (EquipDR!="")
	{
		$cm({
			ClassName:"web.DHCEQ.EM.BUSEquip",
			MethodName:"GetOneEquip",
			RowID:EquipDR
		},function(jsonData){
			if (jsonData.SQLCODE<0) {$.messager.alert(jsonData.Data);return;}
			setElement("REquipTypeDR",jsonData.Data["EQEquipTypeDR"]); //设置类组ID
			setElement("REquipTypeDR_ETDesc",jsonData.Data["EQEquipTypeDR_ETDesc"]);//设置类组
			setElement("RProviderDR",jsonData.Data["EQProviderDR"]); //设置供应商ID
			setElement("RProviderDR_VDesc",jsonData.Data["EQProviderDR_VName"]); //设置供应商
			//可编辑列表暂时先这样处理
			$('#DHCEQReturn').datagrid('updateRow',{
					index: 0,
					row: {
						RLEquip:jsonData.Data["EQName"],
						RLEquipDR:EquipDR
					}
				});
		});
	}
	//end by csj 20190125 台账链接到退货界面处理
	if (RRowID=="") return;
	var Action=getElementValue("Action");
	var Step=getElementValue("RoleStep");
	var ApproveRoleDR=getElementValue("ApproveRoleDR");
	
	jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","GetOneReturn",RRowID,ApproveRoleDR,Action,Step)
	jsonData=jQuery.parseJSON(jsonData);
	if (jsonData.SQLCODE<0) {messageShow("alert","error","错误提示","数据填充失败，错误代码"+jsonData.Data);return;}
	setElementByJson(jsonData.Data);
	oneFillData=jsonData.Data
    if (jsonData.Data["MultipleRoleFlag"]=="1")
    {
	    setElement("NextRoleDR",getElementValue("CurRole"));
	    setElement("NextFlowStep",getElementValue("RoleStep"));
	}
}
//按钮可用控制
function setEnabled()
{
	var Status=getElementValue("RStatus");
	var WaitAD=getElementValue("WaitAD");
	if (Status!="0")
	{
		disableElement("BDelete",true)
		disableElement("BSubmit",true)
		disableElement("BDeleteList",true);//270385 Add By BRB 2016-10-19
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
	}
	///作废按钮
}
//选择框选择事件
function setSelectValue(elementID,rowData)
{
	if(elementID=="REquipTypeDR_ETDesc") {setElement("REquipTypeDR",rowData.TRowID)}
	else if(elementID=="RReturnLocDR_CTLOCDesc") {setElement("RReturnLocDR",rowData.TRowID)}
	else if(elementID=="RProviderDR_VDesc") {setElement("RProviderDR",rowData.TRowID)}
	else if(elementID=="ROutTypeDR_OTDesc") {setElement("ROutTypeDR",rowData.TRowID)}
}

//hisui.common.js错误纠正需要
function clearData(str)
{
	return;
} 
// 插入新行
function insertRow()
{
	if(editIndex>="0"){
		jQuery("#DHCEQReturn").datagrid('endEdit', editIndex);//结束编辑，传入之前编辑的行
	}
    var rows = $("#DHCEQReturn").datagrid('getRows');
    var lastIndex=rows.length-1
    var newIndex=rows.length
    var RLInStockListDR=(typeof rows[lastIndex].RLInStockListDR=='undefined')?"":rows[lastIndex].RLInStockListDR
    var RLEquipDR=(typeof rows[lastIndex].RLEquipDR=='undefined')?"":rows[lastIndex].RLEquipDR
    if ((RLEquipDR=="")&&(RLInStockListDR==""))
    {
	    messageShow("alert","error","错误提示","第"+newIndex+"行数据为空!请先填写数据.");
	}
	else
	{
		jQuery("#DHCEQReturn").datagrid('insertRow', {index:newIndex,row:{}});
		editIndex=0;
		//隐藏新行的图标
		$("#Affix"+"z"+newIndex).hide()
		$("#FundsInfo"+"z"+newIndex).hide()
	}
}
//删除行
function deleteRow()
{
	var rows = $('#DHCEQReturn').datagrid('getRows');
	if (rows.length<2)
	{
		messageShow("alert",'info',"提示","唯一一行无法删除，请修改!");
		return;
	}
	if (editIndex>="0")
	{
		jQuery("#DHCEQReturn").datagrid('endEdit', editIndex);//结束编辑，传入之前编辑的行
		$('#DHCEQReturn').datagrid('deleteRow',editIndex)
	}
	else
	{
		messageShow("alert",'info',"提示","请选中一行!");
	}
}
//保存按钮操作
function BSave_Clicked()
{
	if (getElementValue("ROutTypeDR")=="1")
	{
		if (getElementValue("RProviderDR")=="")
		{
			messageShow("alert","error","错误提示","供应商不能为空!");
			return
		}
	}
	else
	{
		if (getElementValue("ROutTypeDR")=="")
		{
			messageShow("alert","error","错误提示","减少类型不能为空!");
			return
		}
	}
	if (getElementValue("RReturnLocDR")=="")
	{
		messageShow("alert","error","错误提示","库房不能为空!");
		return
	}
	if (getElementValue("RReturnDate")=="")
	{
		messageShow("alert","error","错误提示","制单日期不能为空!");
		return
	}
	if (getElementValue("REquipTypeDR")=="")
	{
		messageShow("alert","error","错误提示","管理类组不能为空!");
		return
	}
	
	var data=getInputList();
	data=JSON.stringify(data);
	var dataList=""
	var rows = $('#DHCEQReturn').datagrid('getRows');
	for (var i = 0; i < rows.length; i++) 
	{
		var oneRow=rows[i]
		if (oneRow.RLEquip=="")
		{
			messageShow("alert","error","错误提示","第"+(i+1)+"行数据不正确!");
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
		messageShow("alert","error","错误提示","明细列表不能为空!");
	}
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","SaveData",data,dataList,"0");
	jsonData=JSON.parse(jsonData)
	if (jsonData.SQLCODE==0)
	{
	    //window.location.reload()
		var ROutTypeDR=getElementValue("ROutTypeDR");
		var WaitAD=getElementValue("WaitAD"); 
		var val="&RowID="+jsonData.Data+"&WaitAD="+WaitAD+"&ROutTypeDR="+ROutTypeDR;
		if(ROutTypeDR=="1")
		{
			url="dhceq.em.return.csp?"+val
		}
		else
		{
			url="dhceq.em.outstock.csp?"+val
		}
	    window.location.href= url;

	}
	else
    {
		messageShow("alert","error","错误提示","保存失败,错误信息:"+jsonData.Data);
		return
    }
}
//删除按钮操作
function BDelete_Clicked()
{
	if (RRowID=="")
	{
		messageShow("alert","error","错误提示","没有单据可删除!");
		return;
	}
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","SaveData",RRowID,"","1");
	jsonData=JSON.parse(jsonData)
	
	if (jsonData.SQLCODE==0)
	{
		var QXType=getElementValue("QXType");
		var ROutTypeDR=getElementValue("ROutTypeDR");
		var val="&RowID="+jsonData.Data+"&ROutTypeDR="+ROutTypeDR+"&WaitAD=off&QXType="+QXType;
		if(ROutTypeDR=="1")
		{
			url="dhceq.em.return.csp?"+val
		}
		else
		{
			url="dhceq.em.outstock.csp?"+val
		}
	    window.location.href= url;
	}
	else
    {
		messageShow("alert","error","错误提示","删除失败,错误信息:"+jsonData.Data);a
		return
    }
}
//提交按钮操作
function BSubmit_Clicked()
{
	var AutoCancelDepre=0
	if (getElementValue("ROutTypeDR")==1)
	{
		var RowID=getElementValue("RRowID");
	    if (RowID=="") return;
		var NextFlowStep=getElementValue("NextFlowStep");
		var NextRoleDR=getElementValue("NextRoleDR");
		var LastStepFlag=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","GetLastStepFlag","15",RowID,NextFlowStep,NextRoleDR);
		if (LastStepFlag=="Y")
		{
			var CheckResult=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","CheckReturnDepre",RowID);
			if (CheckResult=="-1")
			{
				var truthBeTold = window.confirm("明细设备中当月存在折旧,是否冲减?");
				if (truthBeTold)
				{
					AutoCancelDepre=1
				}
			}
			if (CheckResult=="-2")
			{
				var truthBeTold = window.confirm("明细设备中存在多个月份折旧,是否冲减?");
				if (truthBeTold)
				{
					AutoCancelDepre=1
				}
			}
		}
	}
	
	var combindata=getValueList();
  	var valList=totalSum("DHCEQReturn","RQuantityNum");
  	if (valList==0)
  	{
	  	messageShow("alert","error","错误提示","保存失败,错误信息:"+t["-1003"]);
	  	return;
	}
	// Mozy0217  2018-11-01	检测配置设备并提示
	var CheckConfig=tkMakeServerCall("web.DHCEQReturnNew","CheckConfigDR",RowID);
  	if (CheckConfig!="") truthBeTold=window.confirm("本退货单明细包含有配置设备,如需退货请另行添加至明细处理!!!")
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","SubmitData",combindata,AutoCancelDepre);
	jsonData=JSON.parse(jsonData)
	if (jsonData.SQLCODE==0)
    {
		var ROutTypeDR=getElementValue("ROutTypeDR");
		var WaitAD=getElementValue("WaitAD"); 
		var val="&RowID="+jsonData.Data+"&WaitAD="+WaitAD+"&ROutTypeDR="+ROutTypeDR;
		if(ROutTypeDR=="1")
		{
			url="dhceq.em.return.csp?"+val
		}
		else
		{
			url="dhceq.em.outstock.csp?"+val
		}
		window.location.href=url;
	}
	else
    {
		messageShow("alert","error","错误提示","提交失败,错误信息:"+jsonData.Data);
		return
    }
}
//取消提交按钮操作
function BCancelSubmit_Clicked()
{
	var combindata=getValueList();
	var Rtn=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","CancelSubmitData",combindata,getElementValue("CurRole"));
    var RtnObj=JSON.parse(Rtn)
	if (RtnObj.SQLCODE==0)
	{
		var ROutTypeDR=getElementValue("ROutTypeDR")
		var val="&RowID="+RtnObj.Data+"&ROutTypeDR="+ROutTypeDR;
		if(ROutTypeDR=="1")
		{
			url="dhceq.em.return.csp?"+val
		}
		else
		{
			url="dhceq.em.outstock.csp?"+val
		}
	    window.location.href= url;
	}
	else
    {
		messageShow("alert","error","错误提示","取消提交失败,错误信息:"+jsonData.Data);
		return
    }
}

function getValueList()
{
	var ValueList="";
  	ValueList=getElementValue("RRowID") ;				//1
  	ValueList=ValueList+"^"+getElementValue("RReturnLocDR") ;	//2
  	ValueList=ValueList+"^"+getElementValue("RProviderDR") ;	//3
  	ValueList=ValueList+"^"+getElementValue("RReturnDate") ;	//4
  	ValueList=ValueList+"^"+getElementValue("RRemark") ;	//5
  	ValueList=ValueList+"^"+getElementValue("REquipTypeDR") ;	//6
  	ValueList=ValueList+"^"+getElementValue("RStatCatDR") ;  		//7
  	ValueList=ValueList+"^"+getElementValue("ROutTypeDR") ;	//8
  	ValueList=ValueList+"^";	//9
  	ValueList=ValueList+"^";	//10
  	ValueList=ValueList+"^";	//11
  	ValueList=ValueList+"^";	//12
	ValueList=ValueList+"^"+session['LOGON.USERID'];	//13
	ValueList=ValueList+"^"+getElementValue("CancelToFlowDR");	//14
	ValueList=ValueList+"^"+getElementValue("ApproveSetDR");	//15
	ValueList=ValueList+"^"+getElementValue("RJob");
	ValueList=ValueList+"^";
  	return ValueList;
}

//审核按钮操作
function BApprove_Clicked()
{
	var ReturnDepreFlag=getElementValue("ReturnDepreFlag");
	if (ReturnDepreFlag=="") ReturnDepreFlag=1
		var AutoCancelDepre=0
	if ((getElementValue("ROutTypeDR")==1)&&(ReturnDepreFlag!=0))
	{
		var RowID=getElementValue("RRowID");
	    if (RowID=="") return;
		var NextFlowStep=getElementValue("NextFlowStep");
		var NextRoleDR=getElementValue("NextRoleDR");
		var LastStepFlag=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","GetLastStepFlag","15",RowID,NextFlowStep,NextRoleDR);
		if (LastStepFlag=="Y")
		{
			var CheckResult=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","CheckReturnDepre",RowID);
			if ((CheckResult=="-1")&&(ReturnDepreFlag==1))
			{
				var truthBeTold = window.confirm("明细设备中当月存在折旧,是否冲减?");
				if (truthBeTold)
				{
					AutoCancelDepre=1
				}
			}
			if ((CheckResult=="-2")&&(ReturnDepreFlag==1))
			{
				var truthBeTold = window.confirm("明细设备中存在多个月份折旧,是否冲减?");
				if (truthBeTold)
				{
					AutoCancelDepre=1
				}
			}
			if (ReturnDepreFlag==2)
			{
				AutoCancelDepre=1
			}
		}
	}
	var combindata=getValueList();
	var curRole=getElementValue("CurRole");
  	if (curRole=="") return;
	var roleStep=getElementValue("RoleStep");
  	if (roleStep=="") return;
	//var objtbl=getParentTable("SMInStockNo")
	//var editFieldsInfo=approveEditFieldsInfo(objtbl);
	//if (editFieldsInfo=="-1") return;
  	var Rtn=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","AuditData",combindata,curRole,roleStep,"",AutoCancelDepre);
    var RtnObj=JSON.parse(Rtn)
    
    if (RtnObj.SQLCODE<0)
    {
	    messageShow("alert","error","错误提示","审核失败,错误信息:"+RtnObj.Data);
	    
    }
    else
    {
	    //alert(t[0])
	    window.location.reload()
		//var Status=getElementValue("Status");
		//var WaitAD=getElementValue("WaitAD"); 
		//var QXType=getElementValue("QXType");
		//var flag=getElementValue("flag");
		//var val="&RowID="+RtnObj.Data+"&Status="+Status+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		//url="dhceq.em.instock.csp?"+val
	    //window.setTimeout(function(){window.location.href=url},50); 
    }
}
//打印按钮
function BPrint_Clicked()
{
	var RRowID=getElementValue("RRowID");
	if (RRowID=="") return;
	var PrintFlag=getElementValue("PrintFlag");
	
	//Excel打印方式
	if(PrintFlag==0)  
	{
		ReturnPrint(RRowID);
	}
	/*
	//润乾打印方式
	if(PrintFlag==1)
	{
		var moveType=oneFillData["SMMoveType"];
		if(moveType=="0")
		{var EQTitle="设备出库单";}
		else if(moveType=="3")
		{var EQTitle="设备退库单"}
		else{var EQTitle="设备转移单"}
		
		var FromLoc=GetShortName(oneFillData["SMFromLocDR_CTLOCDesc"],"-"); //供给部门
		var ToLoc=GetShortName(oneFillData["SMToLocDR_CTLOCDesc"],"-"); //接收部门
		var AckDate=ChangeDateFormat(oneFillData["SMMakeDate"]); //日期
		var StoreMoveNo=oneFillData["SMStoreMoveNo"];  //单号
		var AckUser=oneFillData["SMAckUserDR_SSUSRName"];  //制单人
		fileName="DHCEQStoreMoveSPrint.raq&RowID="+id+"&EQTitle="+EQTitle+"&FromLoc="+FromLoc +"&ToLoc="+ToLoc+"&AckDate="+AckDate+"&StoreMoveNo="+StoreMoveNo+"&AckUser="+AckUser ;
	    //alert(fileName)
		DHCCPM_RQPrint(fileName); 
	}
	*/		
}
function ReturnPrint(returnid)
{
	if (returnid=="") return;

	var ReturnList=tkMakeServerCall("web.DHCEQReturn","GetID",returnid);
	ReturnList=ReturnList.replace(/\\n/g,"\n");
	var lista=ReturnList.split("^");
	
	//获取单子信息
	var sort=28; //2011-03-10 DJ
	var OutTypeDR=lista[16];	
	var OutType=lista[sort+7];
	var No=lista[0];  //凭单号
	var EquipType=lista[sort+5] ; //类组
	var FromLoc=GetShortName(lista[sort+0],"-");//退货部门
	if (OutTypeDR!=1)
	{	var ToDept=GetShortName(lista[sort+8],"-");}	//去向
	else
	{	var ToDept=GetShortName(lista[sort+1],"-");} 	//供应商
	var Maker=lista[sort+2];//制单人
	var ReturnDate=FormatDate(lista[3]);//减少日期
	//alert(OutTypeDR+" "+OutType);
	
	var gbldata=tkMakeServerCall("web.DHCEQReturn","GetList",returnid);
	if (gbldata=="") return;
	var RLList=gbldata.split("^");
	rows=RLList.length;
	if (rows>0) rows=rows+1;
	var sumFee=0;
	var sumQty=0;
	var PageRows=6; //每页固定行数
	var Pages=parseInt(rows / PageRows); //总页数-1  
	var ModRows=rows%PageRows; //最后一页行数
	if (ModRows==0) Pages=Pages-1;
	var	TemplatePath=tkMakeServerCall("web.DHCEQStoreMoveSP","GetPath");
	try {
        var xlApp,xlsheet,xlBook;
        
        if (OutTypeDR==1)
        {
	    	var Template=TemplatePath+"DHCEQReturnSP.xls";
        }
        else
        {
	        var Template=TemplatePath+"DHCEQOutStockSP.xls";
	    }
	    
	    xlApp = new ActiveXObject("Excel.Application");
	    for (var i=0;i<=Pages;i++)
	    {
		    xlBook = xlApp.Workbooks.Add(Template);
	    	xlsheet = xlBook.ActiveSheet;
	    	
	    	xlsheet.PageSetup.TopMargin=0;
	    	//医院名称替换 Add By DJ 2011-07-14
	    	xlsheet.cells.replace("[Hospital]",getElementValue("HospitalDesc"))
	    	xlsheet.cells(2,2)=No;  //凭单号
	    	xlsheet.cells(2,6)=ReturnDate;  //减少日期
	    	xlsheet.cells(2,8)=EquipType; //类组
	    	xlsheet.cells(3,2)=FromLoc;//退货部门
	    	if (OutTypeDR==1)
	    	{
		    	xlsheet.cells(3,6)=ToDept;//供应商
	    	}
	    	else
	    	{
		    	xlsheet.cells(3,6)=OutType;  //减少类型
		    	xlsheet.cells(3,8)=ToDept;//供应商
	    	}
	    	
	    	var OnePageRow=0;
	    	if (ModRows==0)
	    	{
		    	OnePageRow=PageRows;
	    	}
	    	else
	    	{
	    		if (i==Pages)
	    		{
		    		OnePageRow=ModRows;
	    		}
		    	else
		    	{
			    	OnePageRow=PageRows;
		    	}
	    	}	    	
	    	var FeeAll=0;
			//var sort=9;
			var sort=13;
			for (var Row=1;Row<=OnePageRow;Row++)
			{
				var Location=i*PageRows+Row-1;
				if (Location==rows-1)
				{
					//xlsheet.Rows(Row+5).Insert();
					xlsheet.cells(Row+4,1)="合计";//设备名称
					xlsheet.cells(Row+4,4)=sumQty;//数量
					xlsheet.cells(Row+4,6)=sumFee;//总价
				}
				else
				{
				var RLID=RLList[Location];
				var Data=tkMakeServerCall("web.DHCEQReturnList","GetID",RLID); //modify by jyp 2018-
				var List=Data.split("^");
				//xlsheet.Rows(Row+5).Insert();
				xlsheet.cells(Row+4,1)=List[sort+4];//设备名称
				//xlsheet.cells(Row+5,2)=List[1];//生产厂商
				xlsheet.cells(Row+4,2)=List[sort+5];//机型
				xlsheet.cells(Row+4,3)=List[sort+8];//单位
				xlsheet.cells(Row+4,4)=List[4];//数量
				xlsheet.cells(Row+4,5)=List[5];//原值
				var FeeAllm=List[4]*List[5];
				xlsheet.cells(Row+4,6)=FeeAllm;//总价
				
				//xlsheet.cells(Row+4,7)=List[sort+9];//发票号
				xlsheet.cells(Row+4,7)=List[sort+10];//设备编号
				
				//xlsheet.cells(Row+4,9)=List[sort+11];//合同号
				//xlsheet.cells(Row+4,10)=List[sort+3];//退货原因
				xlsheet.cells(Row+4,8)=List[8];//备注
				FeeAll=FeeAll+FeeAllm;
				sumFee=sumFee+FeeAllm;
				sumQty=sumQty+List[4]*1;
				}				
	    	}
	    //xlsheet.cells(OnePageRow+7,7)="制单人:"+Maker;
	    //xlsheet.Rows(OnePageRow+6).Delete();	    
	    //xlsheet.cells(OnePageRow+9,2)=ReturnDate;
	    //xlsheet.cells(OnePageRow+9,6)="第"+(i+1)+"页 "+"共"+(Pages+1)+"页";   //时间
	    xlsheet.cells(11,8)="制单人:"+Maker;
	    xlsheet.cells(12,8)="第"+(i+1)+"页 "+"共"+(Pages+1)+"页";     
    	//var obj = new ActiveXObject("PaperSet.GetPrintInfo");
	    //var size=obj.GetPaperInfo("DHCEQInStock");
	    //if (0!=size) xlsheet.PageSetup.PaperSize = size;
	    xlsheet.printout; //打印输出
	    //xlBook.SaveAs("D:\\Return"+i+".xls");   //lgl+
	    xlBook.Close (savechanges=false);
	    
	    xlsheet.Quit;
	    xlsheet=null;
	    }
	    xlApp=null;
	} 
	catch(e)
	{
		alert(e.message);
	}
}
//
function endEditing(){
		if (editIndex == undefined){return true}
		if ($('#DHCEQReturn').datagrid('validateRow', editIndex)){
			$('#DHCEQReturn').datagrid('endEdit', editIndex);
    		var rows = $("#DHCEQReturn").datagrid('getRows');
			editIndex = undefined;
			return true;
		} else {
			return false;
		}
	}
function onClickRow(index){
	var Status=getElementValue("RStatus");
	if (Status>0) return
	if (editIndex!=index) 
	{
		if (endEditing())
		{
			$('#DHCEQReturn').datagrid('selectRow', index).datagrid('beginEdit', index);
			editIndex = index;
			modifyBeforeRow = $.extend({},$('#DHCEQReturn').datagrid('getRows')[editIndex]);
		} else {
			$('#DHCEQReturn').datagrid('selectRow', editIndex);
		}
	}
	else
	{
		endEditing();
	}
}
//填充数据
function getInStockList(index,data)
{
	//入库明细表中已存在改设备
	var rowData = $('#DHCEQReturn').datagrid('getSelected');
	//var Length=ObjSources.length
	/*
	var LastSourceType=ObjSources[index].SourceType //变动之前的SourceType
	var LastSourceID=ObjSources[index].SourceID //变动之前的SourceID
	
	if (list[2]==0)
	{
		for (var i=0;i<Length;i++)
		{
			if ((tableList[i]=="0")&&(ObjSources[i].SourceType=="2")&&(ObjSources[i].SourceID==list[1])&&(selectrow!=i)) //add by zx 2015-01-05
			{
				var ObjTRow=document.getElementById("TRowz"+i);
				if (ObjTRow)  var TRow=ObjTRow.innerText;
				alert("选择行与第"+(TRow)+"行是重复的设备!")
				return;
			}
		}
		ObjSources[selectrow]=new SourceInfo("2",list[1]);
		list[2]=""
	}
	else
	{
		for (var i=0;i<Length;i++)
		{
			if ((tableList[i]=="0")&&(ObjSources[i].SourceType=="1")&&(ObjSources[i].SourceID==list[2])&&(selectrow!=i))
			{
				var ObjTRow=document.getElementById("TRowz"+i);
				if (ObjTRow)  var TRow=ObjTRow.innerText;
				alert("选择行与第"+(TRow)+"行是重复的入库单!")
				return;
			}
		}
		ObjSources[selectrow]=new SourceInfo("1",list[2]);
	}
	*/
	rowData.RLEquip=data.TName
	rowData.RLEquipDR=data.TEquipID
	rowData.RLInStockListDR=data.TInStockListID

	if (rowData.RLEquipDR=="") 
	{
		rowData.RLBatchFlag="Y";
	}
	else
	{
		rowData.RLInStockListDR="";
	}
	rowData.RLModel=data.TModel
	rowData.RLReturnNum=data.TQuantity
	rowData.RLManuFactory=data.TManuFactory
	rowData.RLUnit=data.TUnit
	rowData.RLReturnFee=data.TOriginalFee
	rowData.RLTotalFee=(data.TQuantity*data.TOriginalFee).toFixed(2)
	rowData.RLInvoiceNo=data.TInvoiceNo
	var objGrid = $("#DHCEQReturn"); 
	var QuantityEditor = objGrid.datagrid('getEditor', {index:editIndex,field:'RLReturnQtyNum'});
	$(QuantityEditor.target).val(data.TQuantity);
	var NameEditor = objGrid.datagrid('getEditor', {index:editIndex,field:'RLEquip'});
	$(NameEditor.target).combogrid("setValue",data.TName);
	$('#DHCEQReturn').datagrid('endEdit',editIndex);
	$('#DHCEQReturn').datagrid('beginEdit',editIndex);
}

//Add By DJ 2017-11-20
function GetAllListInfo()
{
  	var objtbl=document.getElementById('t'+Component);
	var rows=tableList.length
	var valList="";
	for(var i=1;i<rows;i++)
	{
		if (tableList[i]=="0")
		{
			var TRowID=GetElementValue('TRowIDz'+i);
			if(valList!="")	{valList=valList+"&";}
			valList=valList+i+"^"+TRowID;
		}
	}
	return valList
}

function getReturnReason(index,data)
{
	var rowData = $('#DHCEQReturn').datagrid('getSelected');
	rowData.RLReturnReasonDR=data.TRowID
	var objGrid = $("#DHCEQReturn"); 
	var ReturnReasonEditor = objGrid.datagrid('getEditor', {index:editIndex,field:'RLReturnReason'});
	$(ReturnReasonEditor.target).combogrid("setValue",data.TDesc);
	$('#DHCEQReturn').datagrid('endEdit',editIndex);
	$('#DHCEQReturn').datagrid('beginEdit',editIndex);
}
//新建公用组件取参数方法。
function getParam(ID)
{
	if (ID=="FromLocDR"){return getElementValue("RReturnLocDR")}
	else if (ID=="EquipTypeDR"){return getElementValue("REquipTypeDR")}
	else if (ID=="StatCatDR"){return getElementValue("RStatCatDR")}
	else if (ID=="ProviderDR"){return getElementValue("RProviderDR")}
}

function BUpdateEquipsByList(editIndex)
{
	var rowData =  $("#DHCEQReturn").datagrid("getRows")[editIndex];
	var inStockListDR=(typeof rowData.RLInStockListDR == 'undefined') ? "" : rowData.RLInStockListDR;
	var equipDR=rowData.RLEquipDR;
	if ((inStockListDR=="")&&(equipDR=="")) return;
	var quantityNum=(typeof rowData.RLReturnQtyNum == 'undefined') ? "" : rowData.RLReturnQtyNum;
	if (quantityNum=="") return;
	
	var url="dhceq.em.updateequipsbylist.csp?";
	url=url+"SourceID="+inStockListDR;
	url=url+"&QuantityNum="+quantityNum;
	url=url+"&Job="+getElementValue("RJob");
	url=url+"&Index="+editIndex;
	var RLRowID = (typeof rowData.RLRowID == 'undefined') ? "" : rowData.RLRowID;
	url=url+"&MXRowID="+RLRowID;
	url=url+"&StoreLocDR="+getElementValue("RReturnLocDR");
	url=url+"&Status="+getElementValue("RStatus");
	url=url+"&Type=2";
	url=url+"&EquipID="+equipDR;
	showWindow(url,"设备出厂编号列表",800,500,"icon-w-paper","modal");
}
function listChange(index,quantity)
{
	var rowData =  $("#DHCEQReturn").datagrid("getRows")[index];
	var objGrid = $("#DHCEQReturn");        // 表格对象
    var quantityEdt = objGrid.datagrid('getEditor', {index:index,field:'RLReturnQtyNum'}); // 数量
	$(quantityEdt.target).val(quantity);
	var rowData =  $('#DHCEQReturn').datagrid('getSelected');
	var originalFee=rowData.RLReturnFee;
	rowData.RLTotalFee=quantity*originalFee;
	$('#DHCEQReturn').datagrid('endEdit',editIndex);
	creatToolbar();
}