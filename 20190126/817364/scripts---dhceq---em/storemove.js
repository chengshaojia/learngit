var editIndex=undefined;
var modifyBeforeRow={};
var oneFillData={};
var Columns=getCurColumnsInfo('EM.G.StoreMove.StoreMoveList','','','');
$(function(){
	initDocument();
});

function initDocument()
{
	initUserInfo();
	setElement("SMFromLocDR",curLocID);
	setElement("SMFromLocDR_CTLOCDesc",curLocName);
	//setElement("SMMoveType","0");	//modified by csj 20190125 ����ÿ��ˢ�»�������Ϊ0,���¿���lookup��ѯ�ò�������,��Ϊ��csp����Ĭ��ֵ
	setElement("SMMoveType_Desc","�ⷿ����");	//��ʼ��Ĭ��ֵ
	setElement("SMEquipTypeDR_ETDesc",getElementValue("SMEquipType"));
	initLocLookUp("");
	defindTitleStyle();
	initLookUp();
	initButton(); //��ť��ʼ��
	initButtonWidth();
	setRequiredElements("SMMoveType_Desc^SMFromLocDR_CTLOCDesc^SMToLocDR_CTLOCDesc^SMEquipTypeDR_ETDesc"); //������
	fillData();
	setEnabled();
	initApproveButton();
	$("#BPrintBar").linkbutton({iconCls: 'icon-w-print'});
	$("#BPrintBar").on("click", BPrintBar_Clicked);
	//table���ݼ���
	$HUI.datagrid("#DHCEQStoreMove",{
		url:$URL,
		queryParams:{
			ClassName:"web.DHCEQ.EM.BUSStoreMove",
			QueryName:"GetStoreMoveList",
			StoreMoveID:getElementValue("SMRowID")
		},
		border:false,
	    fit:true,
	    singleSelect:true,
	    rownumbers: true,  //���Ϊtrue������ʾһ���к���
	    toolbar:[
		    {
				iconCls: 'icon-add',
	            text:'����',
	            id:'add',       
	            handler: function(){
	                 insertRow();
	            }
	        },'----------',
	        {
	            iconCls: 'icon-save',
	            text:'ɾ��',
	            id:'delete',
	            handler: function(){
	                 deleteRow();
	            }
	        }
        ],
	    columns:Columns,
		pagination:true,
		pageSize:10,
		pageNumber:1,
		pageList:[10,20,30,40,50],
		onLoadSuccess:function(){
				creatToolbar();
			}
	});
	$("#SMMoveType_Desc").lookup({
        onSelect:function(index,rowData){
            setElement("SMMoveType",rowData.TRowID);
            initLocLookUp(rowData.TRowID);
        },
   });
};

//��ӡ��ϼơ���Ϣ
function creatToolbar()
{
	// Mozy0217  2018-11-01		�޸Ļ����������ܽ��
	var rows = $('#DHCEQStoreMove').datagrid('getRows');
    var totalSMLQuantityNum = 0;
    var totalSMLTotalFee = 0;
    for (var i = 0; i < rows.length; i++)
    {
	    if (rows[i].SMLHold3=="")
	    {
        	var colValue=rows[i]["SMLQuantityNum"];
        	if (colValue=="") colValue=0;
        	totalSMLQuantityNum += parseFloat(colValue);
        	colValue=rows[i]["SMLTotalFee"];
        	if (colValue=="") colValue=0;
        	totalSMLTotalFee += parseFloat(colValue);
    	}
    }
	var lable_innerText='������:'+totalSMLQuantityNum+'&nbsp;&nbsp;&nbsp;�ܽ��:'+totalSMLTotalFee.toFixed(2);
	//var lable_innerText='������:'+totalSum("DHCEQStoreMove","SMLQuantityNum")+'&nbsp;&nbsp;&nbsp;�ܽ��:'+totalSum("DHCEQStoreMove","SMLTotalFee").toFixed(2)
	$("#sumTotal").html(lable_innerText);
	var panel = $("#DHCEQStoreMove").datagrid("getPanel");
	var rows = $("#DHCEQStoreMove").datagrid('getRows');
    for (var i = 0; i < rows.length; i++) {
	    if ((rows[i].SMLEquipDR=="")&&(rows[i].SMLInStockListDR==""))
	    {
		    $("#TEquipList"+"z"+i).hide();
		}
    }
    
	var Status=getElementValue("SMStatus");
	if (Status>0)
	{
		panel.find("#add").hide();
		panel.find("#delete").hide();
	}
	var  job=$('#DHCEQStoreMove').datagrid('getData').rows[0].SMJob;
	setElement("SMJob",job);
}

function fillData()
{
	var SMRowID=getElementValue("SMRowID")
	if (SMRowID=="") return;
	var Action=getElementValue("Action");
	var Step=getElementValue("RoleStep");
	var ApproveRoleDR=getElementValue("ApproveRoleDR");
	jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","GetOneStoreMove",SMRowID,ApproveRoleDR,Action,Step)
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
	var Status=getElementValue("SMStatus");
	var WaitAD=getElementValue("WaitAD");
	if (Status!="0")
	{
		disableElement("BDelete",true);
		disableElement("BSubmit",true);
		if (Status!="")
		{
			disableElement("BUpdate",true);
			disableElement("BSave",true);
			disableElement("BClear",true);			
		}
	}
	if (Status!="2")
	{
		disableElement("BPrint",true);
		disableElement("BPrintBar",true);
	}	
	if (WaitAD!="off")
	{
		disableElement("BUpdate",true);
		disableElement("BDelete",true);
		disableElement("BSubmit",true);
		disableElement("BSave",true);
		disableElement("BClear",true);
	}
}

function onClickRow(index)
{
	if (editIndex!=index) 
	{
		if (endEditing())
		{
			$('#DHCEQStoreMove').datagrid('selectRow', index).datagrid('beginEdit', index);
			editIndex = index;
			modifyBeforeRow = $.extend({},$('#DHCEQStoreMove').datagrid('getRows')[editIndex]);
			bindGridEvent();  //�༭�м�����Ӧ
		} else {
			$('#DHCEQStoreMove').datagrid('selectRow', editIndex);
		}
	}
	else
	{
		endEditing();
	}
}

function endEditing()
{
	if (editIndex == undefined){return true}
	if ($('#DHCEQStoreMove').datagrid('validateRow', editIndex)){
		$('#DHCEQStoreMove').datagrid('endEdit', editIndex);
		editIndex = undefined;
		return true;
	} else {
		return false;
	}
}

// ��������
function insertRow()
{
	if(editIndex>="0"){
		$("#DHCEQStoreMove").datagrid('endEdit', editIndex);//�����༭������֮ǰ�༭����
	}
    var rows = $("#DHCEQStoreMove").datagrid('getRows');
    var lastIndex=rows.length-1;
    var newIndex=rows.length;
    var SMLEquipDR = (typeof rows[lastIndex].SMLEquipDR == 'undefined') ? "" : rows[lastIndex].SMLEquipDR;
    var SMLInStockListDR = (typeof rows[lastIndex].SMLInStockListDR == 'undefined') ? "" : rows[lastIndex].SMLInStockListDR;
    if ((SMLEquipDR=="")&&(SMLInStockListDR==""))
    {
	    messageShow('alert','error','������ʾ','��'+newIndex+'������Ϊ��!������д����.');
	}
	else
	{
		$("#DHCEQStoreMove").datagrid('insertRow', {index:newIndex,row:{}});
		editIndex=0;
		//�������е�ͼ��
		$("#TEquipList"+"z"+newIndex).hide();
	}
}

function deleteRow()
{	
	if (editIndex>"0")
	{
		jQuery("#DHCEQStoreMove").datagrid('endEdit', editIndex);//�����༭������֮ǰ�༭����
		$('#DHCEQStoreMove').datagrid('deleteRow',editIndex);
	}
	else if(editIndex=="0")
	{
		messageShow("alert",'info',"��ʾ","��ǰ�в���ɾ��!");
	}
	else
	{
		messageShow("alert",'info',"��ʾ","��ѡ��һ��!");
	}
}

function setSelectValue(elementID,rowData)
{
	if(elementID=="SMFromLocDR_CTLOCDesc") {setElement("SMFromLocDR",rowData.TRowID);}
	else if(elementID=="SMReciverDR_SSUSRName") {setElement("SMReciverDR",rowData.TRowID);}
	else if(elementID=="SMToLocDR_CTLOCDesc") {setElement("SMToLocDR",rowData.TRowID);}
	else if(elementID=="SMEquipTypeDR_ETDesc") {setElement("SMEquipTypeDR",rowData.TRowID);}
	else if(elementID=="InStock"){saveDataFromInStock(rowData);}
}
function clearData(elementID)
{
	var elementName=elementID.split("_")[0];
	setElement(elementName,"");
	return;
}
function getInStockList(index,data)
{
	var rows = $('#DHCEQStoreMove').datagrid('getRows'); 
	if(data.TEquipID!="")
	{
		for(var i=0;i<rows.length;i++){
			if(rows[i].SMLEquipDR==data.TEquipID)
			{
				messageShow('alert','error','��ʾ','��ǰѡ��������ϸ�е�'+(i+1)+'���ظ�!')
				return;
			}
		}
	}
	else
	{
		for(var i=0;i<rows.length;i++){
			if(rows[i].SMLInStockListDR==data.TInStockListID)
			{
				messageShow('alert','error','��ʾ','��ǰѡ��������ϸ�е�'+(i+1)+'���ظ�!')
				return;
			}
		}
	}
	
	var rowData = $('#DHCEQStoreMove').datagrid('getSelected');
	rowData.SMLEquipDR=data.TEquipID;
	rowData.SMLInStockListDR=data.TInStockListID;
	if (data.TEquipID=="") 
	{
		rowData.SMLBatchFlag="Y";
	}
	else
	{
		rowData.SMLInStockListDR="";
	}
	rowData.SMLManuFactoryDR=data.TManuFactoryDR;
	rowData.SMLManuFactoryDR_MFName=data.TManuFactory;
	rowData.SMLOriginalFee=data.TOriginalFee;
	rowData.SMLTotalFee=data.TQuantity*data.TOriginalFee;
	rowData.SMLModelDR=data.TModelDR;
	rowData.SMLModelDR_MDesc=data.TModel;
	rowData.SMLUnitDR=data.TUnitDR;
	rowData.SMLUnitDR_UOMDesc=data.TUnit;
	rowData.SMLLocationDR=data.TLocationDR;
	rowData.SMLMoveNum=data.TQuantity;
	var objGrid = $("#DHCEQStoreMove");        // ������
	var equipDREQNameEdt = objGrid.datagrid('getEditor', {index:editIndex,field:'SMLEquipDR_EQName'}); // �豸����
	$(equipDREQNameEdt.target).combogrid("setValue",data.TName);
    var quantityEdt = objGrid.datagrid('getEditor', {index:editIndex,field:'SMLQuantityNum'}); // ����
	$(quantityEdt.target).val(data.TQuantity);
	var locationDRLDescEdt = objGrid.datagrid('getEditor', {index:editIndex,field:'SMLLocationDR_LDesc'}); // ��ŵص�
	$(locationDRLDescEdt.target).combogrid("setValue",data.TLocation);
	var equipNameEdt = objGrid.datagrid('getEditor', {index:editIndex,field:'SMLEquipName'}); // ͨ����
	$(equipNameEdt.target).val(data.TCommonName);
	$('#DHCEQStoreMove').datagrid('endEdit',editIndex);
	// �����豸	 Mozy0217  2018-11-01
	if (data.THasConfig=="Y")
	{
		var RetSMLStr="";
		if (data.TInStockListID==0)  //��̨�豸
		{
			RetSMLStr=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","GetSMLForConfig",1,data.TEquipID,getElementValue("SMFromLocDR"),editIndex);	// Mozy  765433	2018-12-12
		}
		else
		{
			RetSMLStr=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","GetSMLForConfig",0,data.TInStockListID,getElementValue("SMFromLocDR"),editIndex);	// Mozy  765433	2018-12-12
		}
		if (RetSMLStr!="")
		{
			///valList=&index+"^^"+EquipDR+"^"+InStockListDR+"^"+TName+"^"+TManuFactoryDR+"^"+TOriginalFee+"^"+TQuantity+"^"+TModelDR+"^"+TUnitDR+"^^"+TLocationDR+"^^^Hold3^^^"+TCommonName
			//alert(RetSMLStr)
			var SMLlist=RetSMLStr.split("&");
			for (var i=0;i<SMLlist.length;i++)
			{
				var SMLInfo=SMLlist[i].split("^");
				/// ����ظ�
				if (SMLInfo[3]=="")  //��̨�豸
				{
					var getRows = $("#DHCEQStoreMove").datagrid("getSelections");
					for(var j=0;j<getRows.length;j++)
					{
						//alert(getRows[j].SMLBatchFlag);
						if ((getRows[j].SMLBatchFlag!="Y")&&(getRows[j].SMLEquipDR==SMLInfo[2])&&(editIndex!=j))
						{
							messageShow('alert','error','��ʾ',"��ǰѡ���е������豸����ϸ�е�"+(editIndex)+"���ظ�,����ɾ���Ѵ��ڵ������豸��ϸ������ѡ�����豸!")
							return;
						}
					}
					insertRow()
				}
				else //�����ϸ
				{
					var getRows = $("#DHCEQStoreMove").datagrid("getSelections");
					for(var j=0;j<getRows.length;j++)
					{
						if ((getRows[j].SMLBatchFlag=="Y")&&(getRows[j].SMLInStockListID==SMLInfo[3])&&(editIndex!=j))
						{
							messageShow('alert','error','��ʾ',"��ǰѡ���е������豸����ϸ�е�"+(editIndex)+"���ظ�,����ɾ���Ѵ��ڵ������豸��ϸ������ѡ�����豸!")
							return;
						}
					}
					insertRow()
				}
				var rows = $("#DHCEQStoreMove").datagrid('getRows');//���������
			    var newIndex=rows.length-1;
				//alert(rows.length)
            	var rowDataNew = rows[newIndex];
            	rowDataNew.SMLEquipDR=SMLInfo[2];
				rowDataNew.SMLInStockListDR=SMLInfo[3];
				if (SMLInfo[2]=="") 
				{
					rowDataNew.SMLBatchFlag="Y";
				}
				else
				{
					rowDataNew.SMLInStockListDR="";
				}
				rowDataNew.SMLEquipDR_EQName=SMLInfo[4];
				rowDataNew.SMLManuFactoryDR=SMLInfo[5];
				rowDataNew.SMLManuFactoryDR_MFName=SMLInfo[19];
				rowDataNew.SMLOriginalFee=SMLInfo[6];
				rowDataNew.SMLQuantityNum=SMLInfo[7];
				rowDataNew.SMLTotalFee=(SMLInfo[6]*SMLInfo[7]).toFixed(2);
				rowDataNew.SMLModelDR=SMLInfo[8];
				rowDataNew.SMLModelDR_MDesc=SMLInfo[18];
				rowDataNew.SMLUnitDR=SMLInfo[9];
				rowDataNew.SMLUnitDR_UOMDesc=SMLInfo[20];
				rowDataNew.SMLLocationDR=SMLInfo[11];
				rowDataNew.SMLHold3=SMLInfo[14];
				rowDataNew.SMLEquipName=SMLInfo[17];
				rowDataNew.SMLLocationDR_LDesc=SMLInfo[21];
				//alert(rowDataNew.SMLEquipName)
				
				$('#DHCEQStoreMove').datagrid('refreshRow', newIndex);
			}
		}
	}
}

function saveDataFromInStock(rowData)
{
	var SMRowID=getElementValue("RowID");
	if (SMRowID!="")
	{
		
	}
	var fromLocDR=getElementValue("SMFromLocDR");  
	var moveType=getElementValue("SMMoveType");
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","GetSMInfoByISL",rowData.TEquipID,rowData.TInStockListID,moveType,curUserID);
	
	jsonData=jQuery.parseJSON(jsonData);
	jsonData.Data["SMJob"]=getElementValue("SMJob");
	jsonData.Data["SMStoreMoveNo"]="";
	jsonData.Data["SMRowID"]="";
	var data = jsonData.Data;
	data = JSON.stringify(data);
	if (rowData.TInStockListID==0)
	{
		var EquipDR=rowData.TEquipID;
		var InStockListDR="";
		var BatchFlag="";
	}
	else
	{
		var EquipDR="";
		var InStockListDR=rowData.TInStockListID;
		var BatchFlag="Y"
	}
	
	var dataList={"SMLRowID":""};
	dataList["SMLEquipDR"]=EquipDR;
	dataList["SMLInStockListDR"]=InStockListDR;
	dataList["SMLBatchFlag"]=BatchFlag;
	dataList["SMLEquipName"]=rowData.TName;		//Mozy	765422	2018-12-12
	dataList["SMLManuFactoryDR"]=rowData.TManuFactoryDR;
	dataList["SMLOriginalFee"]=rowData.TOriginalFee;
	dataList["SMLQuantityNum"]=rowData.TQuantity;
	dataList["SMLModelDR"]=rowData.TModelDR;
	dataList["SMLUnitDR"]=rowData.TUnitDR;
	dataList["SMLLocationDR"]=rowData.TLocationDR;
	dataList["SMLIndex"]=1;
	dataList = JSON.stringify(dataList);
	
	// Mozy0217  2018-11-01		���������豸
	if (rowData.THasConfig=="Y")
	{
		var RetSMLStr="";
		if (rowData.TInStockListID==0)
		{
			RetSMLStr=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","GetSMLForConfig",1,EquipDR,getElementValue("SMFromLocDR"),1);	// Mozy  765433	2018-12-12
		}
		else
		{
			RetSMLStr=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","GetSMLForConfig",0,InStockListDR,getElementValue("SMFromLocDR"),1);	// Mozy  765433	2018-12-12
		}
		if (RetSMLStr!="")
		{
			//alert(RetSMLStr)
			var SMLlist=RetSMLStr.split("&");
			for (var i=0;i<SMLlist.length;i++)
			{
				var SMLlistInfo=SMLlist[i].split("^");
				var ConfigData={"SMLRowID":""};
				ConfigData["SMLEquipDR"]=SMLlistInfo[2];
				ConfigData["SMLInStockListDR"]=SMLlistInfo[3];
				ConfigData["SMLBatchFlag"]="";
				if (SMLlistInfo[3]!=0) ConfigData["SMLBatchFlag"]="Y";
				ConfigData["SMLEquipName"]=SMLlistInfo[17];	// Mozy  765433	2018-12-12
				ConfigData["SMLManuFactoryDR"]=SMLlistInfo[5];
				ConfigData["SMLOriginalFee"]=SMLlistInfo[6];
				ConfigData["SMLQuantityNum"]=SMLlistInfo[7];
				ConfigData["SMLModelDR"]=SMLlistInfo[8];
				ConfigData["SMLUnitDR"]=SMLlistInfo[9];
				ConfigData["SMLLocationDR"]=SMLlistInfo[11];
				ConfigData["SMLIndex"]=i+2;		//Mozy	765422	2018-12-12
				ConfigData["SMLHold3"]=SMLlistInfo[14];
				ConfigData = JSON.stringify(ConfigData);
				if (dataList=="")
				{
					dataList=ConfigData;
				}
				else
				{
					dataList=dataList+"&"+ConfigData;
				}
			}
		}
	}
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","SaveData",data,dataList,"0");
	jsonData=JSON.parse(jsonData);
	if (jsonData.SQLCODE==0)
	{
		var WaitAD=getElementValue("WaitAD"); 
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var moveType = getElementValue("SMMoveType");
		var val="&RowID="+jsonData.Data+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag+"&SMMoveType="+moveType;
		url="dhceq.em.storemove.csp?"+val;
	    window.location.href= url;

	}
	else
    {
		messageShow('alert','error','��ʾ',"������Ϣ:"+jsonData.Data);
		return
    }
}

function BSave_Clicked()
{
	if (editIndex != undefined){ $('#DHCEQStoreMove').datagrid('endEdit', editIndex);}
	if (getElementValue("SMMoveType")=="")
	{
		messageShow('alert','error','��ʾ',"ת�����Ͳ���Ϊ��!")
		return
	}
	if (getElementValue("SMFromLocDR")=="")
	{
		messageShow('alert','error','��ʾ',"�������Ų���Ϊ��!")
		return
	}
	if (getElementValue("SMToLocDR")=="")
	{
		messageShow('alert','error','��ʾ',"���ܲ��Ų���Ϊ��!")
		return
	}
	if (getElementValue("SMEquipTypeDR")=="")
	{
		messageShow('alert','error','��ʾ',"�������鲻��Ϊ��!")
		return
	}
	var data=getInputList();
	data=JSON.stringify(data);
	var dataList="";
	var rows = $('#DHCEQStoreMove').datagrid('getRows');
	for (var i = 0; i < rows.length; i++) 
	{
		var oneRow=rows[i];
		// Mozy  765433	2018-12-12
		if (oneRow.SMLEquipDR_EQName=="")
		{
			messageShow('alert','error','��ʾ',"��"+(i+1)+"�����ݲ���ȷ!");
			return "-1";
		}
		oneRow["SMLIndex"]=i; //indexֵ����
		var RowData=JSON.stringify(oneRow);
		if (dataList=="")
		{
			dataList=RowData;
		}
		else
		{
			dataList=dataList+"&"+RowData;
		}
		
	}
	if (dataList=="")
	{
		messageShow('alert','error','��ʾ',"ת����ϸ����Ϊ��!");
		return;
	}
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","SaveData",data,dataList,"0");
	jsonData=JSON.parse(jsonData);
	if (jsonData.SQLCODE==0)
	{
		var WaitAD=getElementValue("WaitAD"); 
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var val="&RowID="+jsonData.Data+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		url="dhceq.em.storemove.csp?"+val;
	    window.location.href= url;

	}
	else
    {
		messageShow('alert','error','��ʾ',"������Ϣ:"+jsonData.Data);
		return
    }
}

function BDelete_Clicked()
{
	var SMRowID=getElementValue("SMRowID")
	if (SMRowID=="")
	{
		messageShow('alert','error','��ʾ',"û�г��ⵥɾ��!");
		return;
	}
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","SaveData",SMRowID,"","1");
	jsonData=JSON.parse(jsonData)
	
	if (jsonData.SQLCODE==0)
	{
		var WaitAD=getElementValue("WaitAD");
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var val="&RowID="+jsonData.Data+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		url="dhceq.em.storemove.csp?"+val
	    window.location.href= url;
	}
	else
    {
		messageShow('alert','error','��ʾ',"������Ϣ:"+jsonData.Data);
		return
    }
}
function BSubmit_Clicked()
{
	var SMRowID=getElementValue("SMRowID")
	var rtn=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","CheckStoreMoveLoc",SMRowID)
	if (rtn!="")
	{
		messageShow('alert','error','��ʾ',rtn);
		return
	}
	if (SMRowID=="")
	{
		messageShow('alert','error','��ʾ',"û�г��ⵥ��Ϣ!");
		return;
	}
	var data=getValueList();
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","SubmitData",data);
	jsonData=JSON.parse(jsonData)
	
	if (jsonData.SQLCODE==0)
	{
		var WaitAD=getElementValue("WaitAD"); 
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var val="&RowID="+jsonData.Data+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		url="dhceq.em.storemove.csp?"+val
	    window.location.href= url;
	}
	else
    {
		messageShow('alert','error','��ʾ',"������Ϣ:"+jsonData.Data);
		return
    }
}
function BCancelSubmit_Clicked()
{
	var SMRowID=getElementValue("SMRowID");
	if (SMRowID=="")
	{
		messageShow('alert','error','��ʾ',"û�г��ⵥȡ��!");
		return;
	}
	var combindata=getValueList();
  	var CancelReason=getElementValue("CancelReason");
  	combindata=combindata+"^"+CancelReason;
	var Rtn=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","CancelSubmitData",combindata,getElementValue("CurRole"));
    var RtnObj=JSON.parse(Rtn)
    if (RtnObj.SQLCODE<0)
    {
	    messageShow("","","",RtnObj.Data);
	    return;
    }
    else
    {
		var WaitAD=getElementValue("WaitAD"); 
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var val="&RowID="+RtnObj.Data+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		url="dhceq.em.storemove.csp?"+val
	    window.setTimeout(function(){window.location.href=url},50); 
    }
}
function BApprove_Clicked()
{
	var combindata=getValueList();
	var curRole=getElementValue("CurRole");
  	if (curRole=="") return;
	var roleStep=getElementValue("RoleStep");
  	if (roleStep=="") return;
	var objtbl=getParentTable("SMInStockNo")
	var editFieldsInfo=approveEditFieldsInfo(objtbl);
	if (editFieldsInfo=="-1") return;
	
  	var Rtn=tkMakeServerCall("web.DHCEQ.EM.BUSStoreMove","AuditData",combindata,curRole,roleStep,editFieldsInfo);
    var RtnObj=JSON.parse(Rtn)
    if (RtnObj.SQLCODE<0)
    {
	    messageShow("","","",RtnObj.Data);
	    return;
    }
    else
    {
		var WaitAD=getElementValue("WaitAD"); 
		var QXType=getElementValue("QXType");
		var flag=getElementValue("flag");
		var val="&RowID="+RtnObj.Data+"&WaitAD="+WaitAD+"&QXType="+QXType+"&flag="+flag;
		url="dhceq.em.storemove.csp?"+val
	    window.setTimeout(function(){window.location.href=url},50); 
    }
}
/// modified by kdf 2018-01-11
/// ����ϵͳ����PrintFlag������ת�Ƶ���Ǭ��ӡ
function BPrint_Clicked()
{	
	var SMRowID=getElementValue("SMRowID");
	if (SMRowID=="") return;
	var PrintFlag=getElementValue("PrintFlag");
	
	//Excel��ӡ��ʽ
	if(PrintFlag==0)  
	{
		printStoreMove(SMRowID);
	}
	
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
}

function printStoreMove(SMRowID)
{
	
	var moveType=oneFillData["SMMoveType"];
	var gbldata=tkMakeServerCall("web.DHCEQStoreMoveSP","GetList",SMRowID);
	var list=gbldata.split(getElementValue("SplitNumCode"));
	var Listall=list[0];
	rows=list[1];
	
	var PageRows=6;//ÿҳ�̶�����
	var Pages=parseInt(rows / PageRows); //��ҳ��-1  
	var ModRows=rows%PageRows; //���һҳ����
	if (ModRows==0) {Pages=Pages-1;}
	
	var	TemplatePath=tkMakeServerCall("web.DHCEQStoreMoveSP","GetPath");
	
    var xlApp,xlsheet,xlBook;
    var Template;
    if (moveType=="0")
    {	Template=TemplatePath+"DHCEQStoreMoveSP.xls";}
    else
    {	Template=TemplatePath+"DHCEQStoreMoveSP1.xls";}

    xlApp = new ActiveXObject("Excel.Application");
    for (var i=0;i<=Pages;i++)
    {
	    xlBook = xlApp.Workbooks.Add(Template);
    	xlsheet = xlBook.ActiveSheet;
    	xlsheet.PageSetup.TopMargin=0;
    	var sort=27;
    	if (moveType=="3")
    	{
	    	xlsheet.cells(1,2)="[Hospital]�豸�˿ⵥ"
    	}
    	xlsheet.cells.replace("[Hospital]",getElementValue("GetHospitalDesc"))
    	xlsheet.cells(2,2)="��������:"+GetShortName(oneFillData["SMFromLocDR_CTLOCDesc"],"-");//��������
    	xlsheet.cells(3,2)="���ղ���:"+GetShortName(oneFillData["SMToLocDR_CTLOCDesc"],"-");//���ղ���
    	xlsheet.cells(2,7)="��������:"+ChangeDateFormat(oneFillData["SMMakeDate"]);  //ʱ��	
    	xlsheet.cells(3,7)="ת�Ƶ���:"+oneFillData["SMStoreMoveNo"];  //ƾ���� 
    	
    	var OnePageRow=PageRows;
   		if ((i==Pages)&&(ModRows!=0)) OnePageRow=ModRows;
   		
		for (var Row=1;Row<=OnePageRow;Row++)
		{
			//messageShow("","","",Listall);
			var Lists=Listall.split(getElementValue("SplitRowCode"));
			var Listl=Lists[i*PageRows+Row];
			var List=Listl.split("^");
			var cellRow=Row+4;
			if (List[0]=='�ϼ�')
			{					
				Row=6;
				cellRow=Row+4;
				xlsheet.cells(cellRow,2)=List[0];//�豸����
				xlsheet.cells(cellRow,5)=List[4];//����
				xlsheet.cells(cellRow,7)=List[7];//�ܼ�

			}
			else
			{
				xlsheet.cells(cellRow,2)=List[0];//�豸����
				xlsheet.cells(cellRow,3)=List[2];//����
				xlsheet.cells(cellRow,4)=List[3];//��λ
				xlsheet.cells(cellRow,5)=List[4];//����
				xlsheet.cells(cellRow,6)=List[5];//ԭֵ
				xlsheet.cells(cellRow,7)=List[7];//�ܼ�
				xlsheet.cells(cellRow,8)=List[6];//��ע
			}
			
    	}
	    xlsheet.cells(12,7)="��"+(i+1)+"ҳ "+"��"+(Pages+1)+"ҳ";   //ʱ��
	    var obj = new ActiveXObject("PaperSet.GetPrintInfo");
		var size=obj.GetPaperInfo("DHCEQInStock");
		if (0!=size) xlsheet.PageSetup.PaperSize = size;
	    
	    xlsheet.printout; //��ӡ���
	    //xlBook.SaveAs("D:\\StoreMove"+i+".xls");
	    xlBook.Close (savechanges=false);
	    
	    xlsheet.Quit;
	    xlsheet=null;
    }
    xlApp=null;
	
}

function getValueList()
{
	var combindata="";
  	combindata=getElementValue("SMRowID");
  	combindata=combindata+"^"+getElementValue("SMFromLocDR") ;
  	combindata=combindata+"^"+getElementValue("SMToLocDR") ;
  	combindata=combindata+"^"+getElementValue("SMMoveType") ;
  	combindata=combindata+"^"+getElementValue("SMRemark") ;
	combindata=combindata+"^"+getElementValue("SMReciverDR") ;
	combindata=combindata+"^"+getElementValue("SMEquipTypeDR") ;
  	combindata=combindata+"^"+getElementValue("SMStatCatDR") ;
	combindata=combindata+"^"+curUserID;
	combindata=combindata+"^"+getElementValue("CancelToFlowDR");
	combindata=combindata+"^"+getElementValue("ApproveSetDR");
	combindata=combindata+"^"+getElementValue("SMJob");
	return combindata
}

function initLocLookUp(moveType)
{
	if (moveType=="") moveType=getElementValue("SMMoveType");
	if (moveType=="0")
    {
        var paramsFrom=[{"name":"Type","type":"2","value":""},{"name":"LocDesc","type":"1","value":"SMFromLocDR_CTLOCDesc"},{"name":"vgroupid","type":"2","value":""},{"name":"LocType","type":"2","value":"0101"},{"name":"notUseFlag","type":"2","value":""}];
        singlelookup("SMFromLocDR_CTLOCDesc","PLAT.L.Loc",paramsFrom,"");
        var paramsTo=[{"name":"Type","type":"2","value":""},{"name":"LocDesc","type":"1","value":"SMToLocDR_CTLOCDesc"},{"name":"vgroupid","type":"2","value":""},{"name":"LocType","type":"2","value":"0102"},{"name":"notUseFlag","type":"2","value":""}];
        singlelookup("SMToLocDR_CTLOCDesc","PLAT.L.Loc",paramsTo,"");
    }
    else if (moveType=="3")
    {
     	var paramsFrom=[{"name":"Type","type":"2","value":""},{"name":"LocDesc","type":"1","value":"SMFromLocDR_CTLOCDesc"},{"name":"vgroupid","type":"2","value":""},{"name":"LocType","type":"2","value":"0102"},{"name":"notUseFlag","type":"2","value":""}];
        singlelookup("SMFromLocDR_CTLOCDesc","PLAT.L.Loc",paramsFrom,"");
        var paramsTo=[{"name":"Type","type":"2","value":""},{"name":"LocDesc","type":"1","value":"SMToLocDR_CTLOCDesc"},{"name":"vgroupid","type":"2","value":""},{"name":"LocType","type":"2","value":"0101"},{"name":"notUseFlag","type":"2","value":""}];
        singlelookup("SMToLocDR_CTLOCDesc","PLAT.L.Loc",paramsTo,"");   
    }
    else if(moveType=="1")
    {
        var paramsFrom=[{"name":"Type","type":"2","value":""},{"name":"LocDesc","type":"1","value":"SMFromLocDR_CTLOCDesc"},{"name":"vgroupid","type":"2","value":""},{"name":"LocType","type":"2","value":"0102"},{"name":"notUseFlag","type":"2","value":""}];
        singlelookup("SMFromLocDR_CTLOCDesc","PLAT.L.Loc",paramsFrom,"");
        var paramsTo=[{"name":"Type","type":"2","value":""},{"name":"LocDesc","type":"1","value":"SMToLocDR_CTLOCDesc"},{"name":"vgroupid","type":"2","value":""},{"name":"LocType","type":"2","value":"0102"},{"name":"notUseFlag","type":"2","value":""}];
        singlelookup("SMToLocDR_CTLOCDesc","PLAT.L.Loc",paramsTo,"");
    }
    else
    {
        var paramsFrom=[{"name":"Type","type":"2","value":""},{"name":"LocDesc","type":"1","value":""},{"name":"vgroupid","type":"2","value":""},{"name":"LocType","type":"2","value":"0101"},{"name":"notUseFlag","type":"2","value":""}];
        singlelookup("SMFromLocDR_CTLOCDesc","PLAT.L.Loc",paramsFrom,"");
        var paramsTo=[{"name":"Type","type":"2","value":""},{"name":"LocDesc","type":"1","value":""},{"name":"vgroupid","type":"2","value":""},{"name":"LocType","type":"2","value":"0101"},{"name":"notUseFlag","type":"2","value":""}];
        singlelookup("SMToLocDR_CTLOCDesc","PLAT.L.Loc",paramsTo,"");
    }
}

function bindGridEvent()
{
	if (editIndex == undefined){return true}
    try
    {
        var objGrid = $("#DHCEQStoreMove");        // ������
        var invQuantityEdt = objGrid.datagrid('getEditor', {index:editIndex,field:'SMLQuantityNum'});            // ����
        // ����  �� �뿪�¼� 
        $(invQuantityEdt.target).bind("blur",function(){
	        var rowData = $('#DHCEQStoreMove').datagrid('getSelected');
            //
            var moveNum=parseFloat(rowData.SMLMoveNum);
            var quantityNum=parseFloat($(invQuantityEdt.target).val());
            if (parseInt(quantityNum)>parseInt(moveNum))
            {
	            messageShow('alert','error','��ʾ',"ת��������Ч!");
	            $(invQuantityEdt.target).val(moveNum);
	            return;
	        }
            // ���������������� ���
            var originalFee=parseFloat(rowData.SMLOriginalFee);
			rowData.SMLTotalFee=quantityNum*originalFee;
			$('#DHCEQStoreMove').datagrid('endEdit',editIndex);
        });
    }
    catch(e)
    {
        alert(e);
    }
}

//Ԫ�ز������»�ȡֵ
function getParam(ID)
{
	if (ID=="FromLocDR"){return getElementValue("SMFromLocDR")}
	else if (ID=="EquipTypeDR"){return getElementValue("SMEquipTypeDR")}
	else if (ID=="StatCatDR"){return getElementValue("SMStatCatDR")}
	else if (ID=="ProviderDR"){return ""}
}

//������ŵ������
function BUpdateEquipsByList(editIndex)
{
	var rowData =  $("#DHCEQStoreMove").datagrid("getRows")[editIndex];
	var inStockListDR=(typeof rowData.SMLInStockListDR == 'undefined') ? "" : rowData.SMLInStockListDR;
	var equipDR=rowData.SMLEquipDR;
	if ((inStockListDR=="")&&(equipDR=="")) return;
	var quantityNum=(typeof rowData.SMLQuantityNum == 'undefined') ? "" : rowData.SMLQuantityNum;
	if (quantityNum=="") return;
	var url="dhceq.em.updateequipsbylist.csp?";
	url=url+"SourceID="+inStockListDR;
	url=url+"&QuantityNum="+quantityNum;
	url=url+"&Job="+getElementValue("SMJob");
	url=url+"&Index="+editIndex;
	var SMLRowID = (typeof rowData.SMLRowID == 'undefined') ? "" : rowData.SMLRowID;
	url=url+"&MXRowID="+SMLRowID;
	url=url+"&StoreLocDR="+getElementValue("SMFromLocDR");
	url=url+"&Status="+getElementValue("SMStatus");
	url=url+"&Type=1";
	url=url+"&EquipID="+equipDR;
	showWindow(url,"�豸��������б�",800,500,"icon-w-paper","modal");
}

function BPrintBar_Clicked()
{
	storeMovePrintBar();
}

//add by zx 2018-11-22
//�豸������ű��������޸���������
function listChange(index,quantity)
{
	$('#DHCEQStoreMove').datagrid('selectRow', index).datagrid('beginEdit', index);
	var rowData = $('#DHCEQStoreMove').datagrid('getSelected');
	var objGrid = $("#DHCEQStoreMove");        // ������
    var quantityEdt = objGrid.datagrid('getEditor', {index:index,field:'SMLQuantityNum'}); // ����
	$(quantityEdt.target).val(quantity);
	var originalFee=rowData.SMLOriginalFee;
	rowData.SMLTotalFee=quantity*originalFee;
	$('#DHCEQStoreMove').datagrid('endEdit',Number(index));  //add by zx 2019-01-24 ����ʱ�к�ҪΪ���ָ�ʽ
}

// add by zx 2018-11-22
// �豸��ŵص�ѡ��
function getLocation(index,data)
{
	var rowData = $('#DHCEQStoreMove').datagrid('getSelected');
	rowData.SMLLocationDR=data.TRowID;
	var locationDRLDescEdt = $('#DHCEQStoreMove').datagrid('getEditor', {index:editIndex,field:'SMLLocationDR_LDesc'});
	$(locationDRLDescEdt.target).combogrid("setValue",data.TName);
	$('#DHCEQStoreMove').datagrid('endEdit',editIndex);
}