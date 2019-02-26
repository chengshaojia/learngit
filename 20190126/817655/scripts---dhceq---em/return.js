
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
    initMessage("InStock"); //��ȡ����ҵ����Ϣ
    //initLookUp("MRObjLocDR_LocDesc^MRExObjDR_ExObj^"); //��ʼ���Ŵ�
    initLookUp(); //��ʼ���Ŵ�
	defindTitleStyle(); 
    initButton(); //��ť��ʼ��
    //initPage(); //��ͨ�ð�ť��ʼ��
    initButtonWidth();
    setRequiredElements("RReturnDate^RReturnLocDR_CTLOCDesc^REquipTypeDR_ETDesc^RProviderDR_VDesc^ROutTypeDR_OTDesc")
    fillData(); //�������
   	setEnabled(); //��ť����
    //setElementEnabled(); //�����ֻ������ 
    //initEditFields(); //��ȡ�ɱ༭�ֶ���Ϣ
    initApproveButton(); //��ʼ��������ť
	$HUI.datagrid("#DHCEQReturn",{
		url:$URL,
		queryParams:{
		    	ClassName:"web.DHCEQ.EM.BUSReturn",
	        	QueryName:"ReturnListNew",
				RowID:RRowID
		},
	    toolbar:[{
    			iconCls: 'icon-add',
                text:'����',  
				id:'add',        
                handler: function(){
                     insertRow();
                }},'----------',
                {
                iconCls: 'icon-save',
                text:'ɾ��',
				id:'delete',
                handler: function(){
                     deleteRow();
                }}
                ],
		//rownumbers: true,  //���Ϊtrue������ʾһ���к��С�
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
//�ϼ�����ʾ
function creatToolbar()
{
	var lable_innerText='������:'+totalSum("DHCEQReturn","RLReturnQtyNum")+'&nbsp;&nbsp;&nbsp;�ܽ��:'+totalSum("DHCEQReturn","RLTotalFee").toFixed(2)
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
//�������
function fillData()
{
	//start by csj 20190125 ̨�����ӵ��˻����洦��
	var EquipDR=getElementValue("EquipDR");
	if (EquipDR!="")
	{
		$cm({
			ClassName:"web.DHCEQ.EM.BUSEquip",
			MethodName:"GetOneEquip",
			RowID:EquipDR
		},function(jsonData){
			if (jsonData.SQLCODE<0) {$.messager.alert(jsonData.Data);return;}
			setElement("REquipTypeDR",jsonData.Data["EQEquipTypeDR"]); //��������ID
			setElement("REquipTypeDR_ETDesc",jsonData.Data["EQEquipTypeDR_ETDesc"]);//��������
			setElement("RProviderDR",jsonData.Data["EQProviderDR"]); //���ù�Ӧ��ID
			setElement("RProviderDR_VDesc",jsonData.Data["EQProviderDR_VName"]); //���ù�Ӧ��
			//�ɱ༭�б���ʱ����������
			$('#DHCEQReturn').datagrid('updateRow',{
					index: 0,
					row: {
						RLEquip:jsonData.Data["EQName"],
						RLEquipDR:EquipDR
					}
				});
		});
	}
	//end by csj 20190125 ̨�����ӵ��˻����洦��
	if (RRowID=="") return;
	var Action=getElementValue("Action");
	var Step=getElementValue("RoleStep");
	var ApproveRoleDR=getElementValue("ApproveRoleDR");
	
	jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSReturn","GetOneReturn",RRowID,ApproveRoleDR,Action,Step)
	jsonData=jQuery.parseJSON(jsonData);
	if (jsonData.SQLCODE<0) {messageShow("alert","error","������ʾ","�������ʧ�ܣ��������"+jsonData.Data);return;}
	setElementByJson(jsonData.Data);
	oneFillData=jsonData.Data
    if (jsonData.Data["MultipleRoleFlag"]=="1")
    {
	    setElement("NextRoleDR",getElementValue("CurRole"));
	    setElement("NextFlowStep",getElementValue("RoleStep"));
	}
}
//��ť���ÿ���
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
	}
	///���ϰ�ť
}
//ѡ���ѡ���¼�
function setSelectValue(elementID,rowData)
{
	if(elementID=="REquipTypeDR_ETDesc") {setElement("REquipTypeDR",rowData.TRowID)}
	else if(elementID=="RReturnLocDR_CTLOCDesc") {setElement("RReturnLocDR",rowData.TRowID)}
	else if(elementID=="RProviderDR_VDesc") {setElement("RProviderDR",rowData.TRowID)}
	else if(elementID=="ROutTypeDR_OTDesc") {setElement("ROutTypeDR",rowData.TRowID)}
}

//hisui.common.js���������Ҫ
function clearData(str)
{
	return;
} 
// ��������
function insertRow()
{
	if(editIndex>="0"){
		jQuery("#DHCEQReturn").datagrid('endEdit', editIndex);//�����༭������֮ǰ�༭����
	}
    var rows = $("#DHCEQReturn").datagrid('getRows');
    var lastIndex=rows.length-1
    var newIndex=rows.length
    var RLInStockListDR=(typeof rows[lastIndex].RLInStockListDR=='undefined')?"":rows[lastIndex].RLInStockListDR
    var RLEquipDR=(typeof rows[lastIndex].RLEquipDR=='undefined')?"":rows[lastIndex].RLEquipDR
    if ((RLEquipDR=="")&&(RLInStockListDR==""))
    {
	    messageShow("alert","error","������ʾ","��"+newIndex+"������Ϊ��!������д����.");
	}
	else
	{
		jQuery("#DHCEQReturn").datagrid('insertRow', {index:newIndex,row:{}});
		editIndex=0;
		//�������е�ͼ��
		$("#Affix"+"z"+newIndex).hide()
		$("#FundsInfo"+"z"+newIndex).hide()
	}
}
//ɾ����
function deleteRow()
{
	var rows = $('#DHCEQReturn').datagrid('getRows');
	if (rows.length<2)
	{
		messageShow("alert",'info',"��ʾ","Ψһһ���޷�ɾ�������޸�!");
		return;
	}
	if (editIndex>="0")
	{
		jQuery("#DHCEQReturn").datagrid('endEdit', editIndex);//�����༭������֮ǰ�༭����
		$('#DHCEQReturn').datagrid('deleteRow',editIndex)
	}
	else
	{
		messageShow("alert",'info',"��ʾ","��ѡ��һ��!");
	}
}
//���水ť����
function BSave_Clicked()
{
	if (getElementValue("ROutTypeDR")=="1")
	{
		if (getElementValue("RProviderDR")=="")
		{
			messageShow("alert","error","������ʾ","��Ӧ�̲���Ϊ��!");
			return
		}
	}
	else
	{
		if (getElementValue("ROutTypeDR")=="")
		{
			messageShow("alert","error","������ʾ","�������Ͳ���Ϊ��!");
			return
		}
	}
	if (getElementValue("RReturnLocDR")=="")
	{
		messageShow("alert","error","������ʾ","�ⷿ����Ϊ��!");
		return
	}
	if (getElementValue("RReturnDate")=="")
	{
		messageShow("alert","error","������ʾ","�Ƶ����ڲ���Ϊ��!");
		return
	}
	if (getElementValue("REquipTypeDR")=="")
	{
		messageShow("alert","error","������ʾ","�������鲻��Ϊ��!");
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
			messageShow("alert","error","������ʾ","��"+(i+1)+"�����ݲ���ȷ!");
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
		messageShow("alert","error","������ʾ","��ϸ�б���Ϊ��!");
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
		messageShow("alert","error","������ʾ","����ʧ��,������Ϣ:"+jsonData.Data);
		return
    }
}
//ɾ����ť����
function BDelete_Clicked()
{
	if (RRowID=="")
	{
		messageShow("alert","error","������ʾ","û�е��ݿ�ɾ��!");
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
		messageShow("alert","error","������ʾ","ɾ��ʧ��,������Ϣ:"+jsonData.Data);a
		return
    }
}
//�ύ��ť����
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
				var truthBeTold = window.confirm("��ϸ�豸�е��´����۾�,�Ƿ���?");
				if (truthBeTold)
				{
					AutoCancelDepre=1
				}
			}
			if (CheckResult=="-2")
			{
				var truthBeTold = window.confirm("��ϸ�豸�д��ڶ���·��۾�,�Ƿ���?");
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
	  	messageShow("alert","error","������ʾ","����ʧ��,������Ϣ:"+t["-1003"]);
	  	return;
	}
	// Mozy0217  2018-11-01	��������豸����ʾ
	var CheckConfig=tkMakeServerCall("web.DHCEQReturnNew","CheckConfigDR",RowID);
  	if (CheckConfig!="") truthBeTold=window.confirm("���˻�����ϸ�����������豸,�����˻��������������ϸ����!!!")
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
		messageShow("alert","error","������ʾ","�ύʧ��,������Ϣ:"+jsonData.Data);
		return
    }
}
//ȡ���ύ��ť����
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
		messageShow("alert","error","������ʾ","ȡ���ύʧ��,������Ϣ:"+jsonData.Data);
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

//��˰�ť����
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
				var truthBeTold = window.confirm("��ϸ�豸�е��´����۾�,�Ƿ���?");
				if (truthBeTold)
				{
					AutoCancelDepre=1
				}
			}
			if ((CheckResult=="-2")&&(ReturnDepreFlag==1))
			{
				var truthBeTold = window.confirm("��ϸ�豸�д��ڶ���·��۾�,�Ƿ���?");
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
	    messageShow("alert","error","������ʾ","���ʧ��,������Ϣ:"+RtnObj.Data);
	    
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
//��ӡ��ť
function BPrint_Clicked()
{
	var RRowID=getElementValue("RRowID");
	if (RRowID=="") return;
	var PrintFlag=getElementValue("PrintFlag");
	
	//Excel��ӡ��ʽ
	if(PrintFlag==0)  
	{
		ReturnPrint(RRowID);
	}
	/*
	//��Ǭ��ӡ��ʽ
	if(PrintFlag==1)
	{
		var moveType=oneFillData["SMMoveType"];
		if(moveType=="0")
		{var EQTitle="�豸���ⵥ";}
		else if(moveType=="3")
		{var EQTitle="�豸�˿ⵥ"}
		else{var EQTitle="�豸ת�Ƶ�"}
		
		var FromLoc=GetShortName(oneFillData["SMFromLocDR_CTLOCDesc"],"-"); //��������
		var ToLoc=GetShortName(oneFillData["SMToLocDR_CTLOCDesc"],"-"); //���ղ���
		var AckDate=ChangeDateFormat(oneFillData["SMMakeDate"]); //����
		var StoreMoveNo=oneFillData["SMStoreMoveNo"];  //����
		var AckUser=oneFillData["SMAckUserDR_SSUSRName"];  //�Ƶ���
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
	
	//��ȡ������Ϣ
	var sort=28; //2011-03-10 DJ
	var OutTypeDR=lista[16];	
	var OutType=lista[sort+7];
	var No=lista[0];  //ƾ����
	var EquipType=lista[sort+5] ; //����
	var FromLoc=GetShortName(lista[sort+0],"-");//�˻�����
	if (OutTypeDR!=1)
	{	var ToDept=GetShortName(lista[sort+8],"-");}	//ȥ��
	else
	{	var ToDept=GetShortName(lista[sort+1],"-");} 	//��Ӧ��
	var Maker=lista[sort+2];//�Ƶ���
	var ReturnDate=FormatDate(lista[3]);//��������
	//alert(OutTypeDR+" "+OutType);
	
	var gbldata=tkMakeServerCall("web.DHCEQReturn","GetList",returnid);
	if (gbldata=="") return;
	var RLList=gbldata.split("^");
	rows=RLList.length;
	if (rows>0) rows=rows+1;
	var sumFee=0;
	var sumQty=0;
	var PageRows=6; //ÿҳ�̶�����
	var Pages=parseInt(rows / PageRows); //��ҳ��-1  
	var ModRows=rows%PageRows; //���һҳ����
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
	    	//ҽԺ�����滻 Add By DJ 2011-07-14
	    	xlsheet.cells.replace("[Hospital]",getElementValue("HospitalDesc"))
	    	xlsheet.cells(2,2)=No;  //ƾ����
	    	xlsheet.cells(2,6)=ReturnDate;  //��������
	    	xlsheet.cells(2,8)=EquipType; //����
	    	xlsheet.cells(3,2)=FromLoc;//�˻�����
	    	if (OutTypeDR==1)
	    	{
		    	xlsheet.cells(3,6)=ToDept;//��Ӧ��
	    	}
	    	else
	    	{
		    	xlsheet.cells(3,6)=OutType;  //��������
		    	xlsheet.cells(3,8)=ToDept;//��Ӧ��
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
					xlsheet.cells(Row+4,1)="�ϼ�";//�豸����
					xlsheet.cells(Row+4,4)=sumQty;//����
					xlsheet.cells(Row+4,6)=sumFee;//�ܼ�
				}
				else
				{
				var RLID=RLList[Location];
				var Data=tkMakeServerCall("web.DHCEQReturnList","GetID",RLID); //modify by jyp 2018-
				var List=Data.split("^");
				//xlsheet.Rows(Row+5).Insert();
				xlsheet.cells(Row+4,1)=List[sort+4];//�豸����
				//xlsheet.cells(Row+5,2)=List[1];//��������
				xlsheet.cells(Row+4,2)=List[sort+5];//����
				xlsheet.cells(Row+4,3)=List[sort+8];//��λ
				xlsheet.cells(Row+4,4)=List[4];//����
				xlsheet.cells(Row+4,5)=List[5];//ԭֵ
				var FeeAllm=List[4]*List[5];
				xlsheet.cells(Row+4,6)=FeeAllm;//�ܼ�
				
				//xlsheet.cells(Row+4,7)=List[sort+9];//��Ʊ��
				xlsheet.cells(Row+4,7)=List[sort+10];//�豸���
				
				//xlsheet.cells(Row+4,9)=List[sort+11];//��ͬ��
				//xlsheet.cells(Row+4,10)=List[sort+3];//�˻�ԭ��
				xlsheet.cells(Row+4,8)=List[8];//��ע
				FeeAll=FeeAll+FeeAllm;
				sumFee=sumFee+FeeAllm;
				sumQty=sumQty+List[4]*1;
				}				
	    	}
	    //xlsheet.cells(OnePageRow+7,7)="�Ƶ���:"+Maker;
	    //xlsheet.Rows(OnePageRow+6).Delete();	    
	    //xlsheet.cells(OnePageRow+9,2)=ReturnDate;
	    //xlsheet.cells(OnePageRow+9,6)="��"+(i+1)+"ҳ "+"��"+(Pages+1)+"ҳ";   //ʱ��
	    xlsheet.cells(11,8)="�Ƶ���:"+Maker;
	    xlsheet.cells(12,8)="��"+(i+1)+"ҳ "+"��"+(Pages+1)+"ҳ";     
    	//var obj = new ActiveXObject("PaperSet.GetPrintInfo");
	    //var size=obj.GetPaperInfo("DHCEQInStock");
	    //if (0!=size) xlsheet.PageSetup.PaperSize = size;
	    xlsheet.printout; //��ӡ���
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
//�������
function getInStockList(index,data)
{
	//�����ϸ�����Ѵ��ڸ��豸
	var rowData = $('#DHCEQReturn').datagrid('getSelected');
	//var Length=ObjSources.length
	/*
	var LastSourceType=ObjSources[index].SourceType //�䶯֮ǰ��SourceType
	var LastSourceID=ObjSources[index].SourceID //�䶯֮ǰ��SourceID
	
	if (list[2]==0)
	{
		for (var i=0;i<Length;i++)
		{
			if ((tableList[i]=="0")&&(ObjSources[i].SourceType=="2")&&(ObjSources[i].SourceID==list[1])&&(selectrow!=i)) //add by zx 2015-01-05
			{
				var ObjTRow=document.getElementById("TRowz"+i);
				if (ObjTRow)  var TRow=ObjTRow.innerText;
				alert("ѡ�������"+(TRow)+"�����ظ����豸!")
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
				alert("ѡ�������"+(TRow)+"�����ظ�����ⵥ!")
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
//�½��������ȡ����������
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
	showWindow(url,"�豸��������б�",800,500,"icon-w-paper","modal");
}
function listChange(index,quantity)
{
	var rowData =  $("#DHCEQReturn").datagrid("getRows")[index];
	var objGrid = $("#DHCEQReturn");        // ������
    var quantityEdt = objGrid.datagrid('getEditor', {index:index,field:'RLReturnQtyNum'}); // ����
	$(quantityEdt.target).val(quantity);
	var rowData =  $('#DHCEQReturn').datagrid('getSelected');
	var originalFee=rowData.RLReturnFee;
	rowData.RLTotalFee=quantity*originalFee;
	$('#DHCEQReturn').datagrid('endEdit',editIndex);
	creatToolbar();
}