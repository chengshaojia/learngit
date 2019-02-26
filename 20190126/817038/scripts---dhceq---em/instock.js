
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
    initMessage("InStock"); //��ȡ����ҵ����Ϣ
    //initLookUp("MRObjLocDR_LocDesc^MRExObjDR_ExObj^"); //��ʼ���Ŵ�
    initLookUp(); //��ʼ���Ŵ�
	defindTitleStyle(); 
    initButton(); //��ť��ʼ��
    //initPage(); //��ͨ�ð�ť��ʼ��
    initButtonWidth();
    setRequiredElements("ISInDate^ISLocDR_CTLOCDesc^ISEquipTypeDR_ETDesc^ISOriginDR_ODesc^ISProviderDR_VDesc")
    fillData(); //�������
    setEnabled(); //��ť����
    //setElementEnabled(); //�����ֻ������ 
    //initEditFields(); //��ȡ�ɱ༭�ֶ���Ϣ
    initApproveButton(); //��ʼ��������ť
	$HUI.datagrid("#DHCEQInStock",{
		url:$URL,
		queryParams:{
		    	ClassName:"web.DHCEQ.EM.BUSInStock",
	        	QueryName:"GetInStockListNew",
				InStockID:ISRowID
		},
	    toolbar:[{
    			iconCls: 'icon-add',
                text:'����',  
				id:'add',        
                handler: function(){
                     insertRow();
                }},'----------',
                {
                iconCls: 'icon-cancel',
                text:'ɾ��',
				id:'delete',
                handler: function(){
                     deleteRow();
                }}
                ],
		//rownumbers: true,  //���Ϊtrue������ʾһ���к��С�
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
//��ӡ��ϼơ���Ϣ
function creatToolbar()
{
	// Mozy0217  2018-11-01		�޸Ļ����������ܽ��
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
	var lable_innerText='������:'+totalISLQuantityNum+'&nbsp;&nbsp;&nbsp;�ܽ��:'+totalISLTotalFee.toFixed(2);
	//var lable_innerText='������:'+totalSum("DHCEQInStock","ISLQuantityNum")+'&nbsp;&nbsp;&nbsp;�ܽ��:'+totalSum("DHCEQInStock","ISLTotalFee").toFixed(2)
	$("#sumTotal").html(lable_innerText);
	
    var rows = $("#DHCEQInStock").datagrid('getRows');
    for (var i = 0; i < rows.length; i++) {
	    if ((rows[i].ISLSourceType=="")||(rows[i].ISLSourceID==""))
	    {
		    $("#Affix"+"z"+i).hide()
		    $("#FundsInfo"+"z"+i).hide()
		}
    }
    ///modified by zy 20181105 ZY0177 hisui����,����toolbar��ť����
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
	//��˺�ſɴ�ӡ������ת�Ƶ�
	if (Status!="2")
	{
		disableElement("BPrint",true)
	}
	//�ǽ����ݲ˵�,���ɸ��µȲ�������
	if (WaitAD!="off")
	{
		disableElement("BSave",true);
		disableElement("BDelete",true);
		disableElement("BSubmit",true);
		setElement("ReadOnly",1);	//�ǽ����ݲ˵�,��Ϊֻ��.Add By HZY 2012-01-31 HZY0021
	}
	///modefied by zy 20190111 ZY0184
	///���ϰ�ť
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

//hisui.common.js���������Ҫ
//add by csj 20181103 onChange����¼�
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
 
// ��������
function insertRow()
{
	if(editIndex>="0"){
		jQuery("#DHCEQInStock").datagrid('endEdit', editIndex);//�����༭������֮ǰ�༭����
	}
    var rows = $("#DHCEQInStock").datagrid('getRows');
    var lastIndex=rows.length-1
    var newIndex=rows.length
    //modified by zy 20181120
    if (lastIndex>=0)
    {
	    if ((rows[lastIndex].ISLSourceType=="")||(rows[lastIndex].ISLSourceID==""))
	    {
		    alert("��"+newIndex+"������Ϊ��!������д����.")
		    return
		}
	}
	if (newIndex>=0)
	{
		jQuery("#DHCEQInStock").datagrid('insertRow', {index:newIndex,row:{}});
		editIndex=0;
		//�������е�ͼ��
		$("#Affix"+"z"+newIndex).hide()
		$("#FundsInfo"+"z"+newIndex).hide()
	}
}

function deleteRow()
{
	if (editIndex>="0")
	{
		jQuery("#DHCEQInStock").datagrid('endEdit', editIndex);//�����༭������֮ǰ�༭����
	}
	removeCheckBoxedRow("DHCEQInStock")
}
function BSave_Clicked()
{
	if (getElementValue("ISProviderDR")=="")
	{
		alert("��Ӧ�̲���Ϊ��!")
		return
	}
	if (getElementValue("ISLocDR")=="")
	{
		alert("�ⷿ����Ϊ��!")
		return
	}
	if (getElementValue("ISInDate")=="")
	{
		alert("�Ƶ����ڲ���Ϊ��!")
		return
	}
	if (getElementValue("ISOriginDR")=="")
	{
		alert("��Դ����Ϊ��!")
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
			alert("��"+(i+1)+"�����ݲ���ȷ!")
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
		alert("�����ϸ����Ϊ��!");
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
		alert("������Ϣ:"+jsonData.Data);
		return
    }
}
function BDelete_Clicked()
{
	if (ISRowID=="")
	{
		alert("û����ⵥɾ��!");
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
		alert("������Ϣ:"+jsonData.Data);
		return
    }
}
function BSubmit_Clicked()
{
	if (ISRowID=="")
	{
		alert("û����ⵥɾ��!");
		return;
	}
	// Mozy0217  2018-11-01	��������豸����ʾ
  	var truthBeTold=true;
	var CheckConfig=tkMakeServerCall("web.DHCEQInStockNew","CheckConfigDR",ISRowID);
  	if (CheckConfig!="") truthBeTold=window.confirm("����ⵥ��ϸ�����������豸�����豸�����ɺ�һ������ύ��������˴���!!!")
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
		alert("������Ϣ:"+jsonData.Data);
		return
    }
}
function BCancelSubmit_Clicked()
{
	//alert("BCancelSubmit_Clicked")
	//return
	if (ISRowID=="")
	{
		alert("û����ⵥȡ��!");
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
		alert("û����ⵥ�����!");
		return;
	}
	var combindata=getValueList();
	var CurRole=getElementValue("CurRole")
  	if (CurRole=="") return;
	var RoleStep=getElementValue("RoleStep")
  	if (RoleStep=="") return;
  	//20170329	�Զ�����
  	var AutoInOutInfo=tkMakeServerCall("web.DHCEQInStockNew","GetAutoInOut",ISRowID+"^"+CurRole+"^"+RoleStep);
	var autoflag=2*AutoInOutInfo;
	if (AutoInOutInfo=="1")
	{
		//�����ⵥ�Ƿ������Զ���������
		var CheckAutoMoveFlag=tkMakeServerCall("web.DHCEQInStockNew","CheckAutoMoveFlag",ISRowID);
		var CAMInfo=CheckAutoMoveFlag.split("^");
		if ((CAMInfo[0]!="Y")&&(getElementValue("ISBuyLocDR")==""))
		{
			alert("["+CAMInfo[1]+"]�����յ���ʹ�ÿ��Ҳ��ұ������깺���Ų��ܰ����Զ�����!")
			return
		}
	}
	if (AutoInOutInfo=="2")
	{
		autoflag=autoflag-2;
		truthBeTold = window.confirm("�Ƿ�����Զ��������?");
		if (!truthBeTold)
		{
			autoflag=autoflag-2;
		}
		else
		{
			//�����ⵥ�Ƿ������Զ���������
			var CheckAutoMoveFlag=tkMakeServerCall("web.DHCEQInStockNew","CheckAutoMoveFlag",ISRowID);
			var CAMInfo=CheckAutoMoveFlag.split("^");
			if ((CAMInfo[0]!="Y")&&(getElementValue("ISBuyLocDR")==""))
			{
				alert("["+CAMInfo[1]+"]�����յ���ʹ�ÿ��Ҳ��ұ������깺���Ų��ܰ����Զ�����!")
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
		var truthBeTold = window.confirm("��ص�����,����,̨��Ҳһ������!�Ƿ������");
	    if (!truthBeTold) return;
  		var results=tkMakeServerCall("web.DHCEQAbnormalDataDeal","CancelBuss",2,ISRowID);
		var result=results.split("^")
		if (result[0]!=="0")
		{
			if (result[1]!="")
			{
				messageShow("","","","����ʧ��:"+result[1])
			}
			else
			{
				messageShow("","","","����ʧ��:"+result[0])
			}
		}
		else
		{
			messageShow("","","","�ɹ�����!")
			//modified by zy 20181120 ZY0179
			var url="dhceq.em.instock.csp?&RowID="+ISRowID
	    	window.setTimeout(function(){window.location.href=url},50); 
		}
	}
}
///HISUI���������µ��� ����[Ԫ��:initRunQian,PrintFlag �̳�:DHCCPMRQCommon.js]
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
	var Pages=parseInt(rows / PageRows); //��ҳ��?1  3Ϊÿҳ�̶�����
	var ModRows=rows%PageRows; //���һҳ����
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
	    	//ҽԺ�����滻 Add By DJ 2011-07-14
	    	xlsheet.cells.replace("[Hospital]",getElementValue("HospitalDesc"))
	    	xlsheet.cells(2,2)="��  ��:"+oneFillData["ISInStockNo"]; //��ⵥ��
	    	xlsheet.cells(2,7)=ChangeDateFormat(oneFillData["ISInDate"]);	//�������
	    	xlsheet.cells(2,9)="��  ��:"+GetShortName(oneFillData["ISLocDR_CTLOCDesc"],"-");//�ⷿ
	    	xlsheet.cells(3,2)="��  ��:"+oneFillData["ISEquipTypeDR_ETDesc"];
	    	//xlsheet.cells(3,2)="��  ��:"+oneFillData["ISStatTypeDR_STDesc"];
	    	xlsheet.cells(3,7)=GetShortName(oneFillData["ISProviderDR_VDesc"],"-"); //������
	    	//xlsheet.cells(2,10)=GetShortName(oneFillData["ISBuyLocDR_CTLOCDesc"],"-"); //�깺����
	    	
	   		var OnePageRow=PageRows;
	   		if ((i==Pages)&&(ModRows!=0)) OnePageRow=ModRows;
	    	
	    	var FeeAll=0;
	    	var Lists=Listall.split(getElementValue("SplitRowCode"));
	    	for (var j=1;j<=OnePageRow;j++)
			{
				var Listl=Lists[i*PageRows+j];
				var List=Listl.split("^");
				var Row=4+j;
				if ((List[0]=='�ϼ�')&&(i==Pages))
				{
					xlsheet.cells(10,2)=List[0];//�豸����
					xlsheet.cells(10,6)=List[4];//����
					xlsheet.cells(10,8)=List[6];//���
				}
				else
				{
					xlsheet.cells(Row,2)=List[0];//�豸����
					xlsheet.cells(Row,4)=List[2];//����
					xlsheet.cells(Row,5)=List[3];//��λ
					xlsheet.cells(Row,6)=List[4];//����
					xlsheet.cells(Row,7)=List[5];//ԭֵ
					xlsheet.cells(Row,8)=List[6];//���
					//xlsheet.cells(Row,9)=List[9];//�豸���
					//xlsheet.cells(Row,9)=List[1];//��������
					xlsheet.cells(Row,9)=List[7];//��Ʊ��
					//xlsheet.cells(Row+5,9)=List[10];//��ͬ��				
					xlsheet.cells(Row,10)=List[12];//��Ʊ����
					xlsheet.cells(Row,11)=List[8];// ��ע
					xlsheet.cells(3,10)=List[13];//�ʽ���Դ
					
					FeeAll=FeeAll+List[6];
					
					var equipdr=List[11];
					
				}
					var Row=Row+1;
				
	    	}
	    	xlsheet.cells(11,9)="�Ƶ���:"+oneFillData["ISRequestUserDR_SSUSRName"]   //username; //�Ƶ���
	    	//if (lista[19]==2) xlsheet.cells(10,9)=""; //�Ƶ���
	    	
	    	xlsheet.cells(12,10)="��"+(i+1)+"ҳ "+"��"+(Pages+1)+"ҳ";
	    	var obj = new ActiveXObject("PaperSet.GetPrintInfo");
		    var size=obj.GetPaperInfo("DHCEQInStock");
		    if (0!=size) xlsheet.PageSetup.PaperSize = size;
	    	
	    	xlsheet.printout; 	//��ӡ���
	
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
	//�����ϸ�����Ѵ��ڸ��豸
	//if ((data.ISStatus=="Y")&&(oneFillData["ISInStockNo"]!=data.ISNo))
	if (data.ISStatus=="Y")
	{
		alert("��ǰ�豸������ⵥ" + data.ISNo + "�д���!")
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
	//modified by  ZY0172  20181023  �ı�ɱ༭�еĸ�ֵ��ʽ��
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

function SaveDataFromOpenCheck(rowData)  //�豸��������˵���,δ����豸
{
	if ((ISRowID!="")&&(oneFillData["ISStatus"]!=="")&&(oneFillData["ISStatus"]!=="0"))
	{
		alert("��ǰ��ⵥ���ύ,��������ϸ,����ȡ���ύ!")
		return
	}
	//�����ϸ�����Ѵ��ڸ��豸
	if (rowData.ISStatus=="Y")
	{
		alert("��ǰ�豸������ⵥ" + rowData.ISNo + "�д���!")
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
			alert("������Ϣ:"+result);
			return
	    }
	}
}

