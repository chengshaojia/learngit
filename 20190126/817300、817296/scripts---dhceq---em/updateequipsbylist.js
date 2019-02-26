var editIndex=undefined;
var Columns=getCurColumnsInfo('EM.G.Equip.UpdateEquipsByList','','','');
$(function(){
	initDocument();
});
function initDocument()
{
	$HUI.datagrid("#DHCEQUpdateEquipsByList",{
		url:$URL,
		queryParams:{
			ClassName:"web.DHCEQ.EM.BUSUpdateEquipByList",
			QueryName:"GetEquipsByMove",
			SourceID:getElementValue("SourceID"),
			QuantityNum:getElementValue("QuantityNum"),
			Job:getElementValue("Job"),
			index:getElementValue("Index"),
			MXRowID:getElementValue("MXRowID"),
			StoreLocDR:getElementValue("StoreLocDR"),
			Type:getElementValue("Type"),
			EquipID:getElementValue("EquipID")
		},
	    fit:true,
	    singleSelect:true,
	    rownumbers: true,  //���Ϊtrue������ʾһ���к���
	    toolbar:[
		    {
				iconCls: 'icon-save',
	            text:'����',
	            id:'update',       
	            handler: function(){
	                 updateRow();
	            }
	        }
        ],
	    columns:Columns,
		pagination:true,
		pageSize:10,
		pageNumber:1,
		pageList:[10,20,30,40,50]
	});
	//add by csj 20190126 �Ѿ��ύ�ĵ��ݲ��ɸ���
	if(getElementValue("Status")>0){
		$('#update').linkbutton("disable"); 
	}
}
function onClickRow(index)
{
	if (editIndex!=index) 
	{
		if (endEditing())
		{
			$('#DHCEQUpdateEquipsByList').datagrid('selectRow', index).datagrid('beginEdit', index);
			editIndex = index;
			modifyBeforeRow = $.extend({},$('#DHCEQUpdateEquipsByList').datagrid('getRows')[editIndex]);
		} else {
			$('#DHCEQUpdateEquipsByList').datagrid('selectRow', editIndex);
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
	if ($('#DHCEQUpdateEquipsByList').datagrid('validateRow', editIndex)){
		$('#DHCEQUpdateEquipsByList').datagrid('endEdit', editIndex);
		editIndex = undefined;
		return true;
	} else {
		return false;
	}
}
/*
function updateRow()
{
	if (editIndex != undefined){ $('#DHCEQUpdateEquipsByList').datagrid('endEdit', editIndex);}
	var rows = $("#DHCEQUpdateEquipsByList").datagrid("getRows");
	var listInfos="";
	for(var i=0;i<rows.length;i++)
	{
		var listInfo=rows[i].TRowID+"^"+rows[i].TLeaveFactoryNo;
		if(rows[i].TSelect=="Y")
		{
			if (listInfos=="")
			{
				listInfos=listInfo;
			}
			else 
			{
				listInfos=","+listInfos+",";
				if (listInfos.indexOf(","+listInfo+",")<0)
				{
					listInfos=listInfos+listInfo+",";
				}
				listInfos=listInfos.substring(1,listInfos.length - 1);
			}
		}
	}
	if (listInfos=="") return;
	var rtn=CheckLeaveFactoryNo(listInfos);
	if (rtn!="1") return;
	var result=tkMakeServerCall("web.DHCEQ.EM.BUSUpdateEquipByList","UpdateLeaveFactoryNo",listInfos);
	if (result==0)
	{
		location.reload();
	}
	else
	{
		messageShow('alert','error','��ʾ',"����ʧ��!");
	}
}
*/
function updateRow()
{	
	if (editIndex != undefined){ $('#DHCEQUpdateEquipsByList').datagrid('endEdit', editIndex);}
	var SourceID=getElementValue("SourceID");
	if (SourceID=="") 
	{
		messageShow('alert','error','��ʾ',"�豸����Ϊ1�������޸�");
		return;
	}
	var rows = $("#DHCEQUpdateEquipsByList").datagrid("getRows");
	var TJob=rows[0].TJob;
	setElement("Job",TJob);
	
	var job=getElementValue("Job");
	var index=getElementValue("Index");
	var mXRowID=getElementValue("MXRowID");
	var type=getElementValue("Type");
	var sourceID=getElementValue("SourceID");
	var storeLocDR=getElementValue("StoreLocDR");
	var quantityNum=getElementValue("QuantityNum");
	
	var listInfos=tkMakeServerCall("web.DHCEQ.EM.BUSUpdateEquipByList","GetEquipIDsInfo",type,mXRowID,storeLocDR,sourceID,quantityNum,job,index);
	var list=listInfos.split("&");
	listInfos=list[1];
	var totalNum=0
	var UpdateLeaveFactoryNoVals = "" //add by csj 20190125
	var UpdateLeaveFactoryNoVal = "" //add by csj 20190125
	for (i=0;i<rows.length;i++)
	{
		$('#DHCEQUpdateEquipsByList').datagrid('endEdit', i) //add by csj 20190125
		var TRowID=rows[i].TRowID;
		var listInfo=TRowID;
		var TSelect=rows[i].TSelect;
		var TLeaveFactoryNo=rows[i].TLeaveFactoryNo; //add by csj 20190125
		UpdateLeaveFactoryNoVal = TRowID+"^"+TLeaveFactoryNo
		if(UpdateLeaveFactoryNoVals == ""){
			UpdateLeaveFactoryNoVals = UpdateLeaveFactoryNoVal //add by csj 20190125
		}else{
			UpdateLeaveFactoryNoVals = UpdateLeaveFactoryNoVals + "," + UpdateLeaveFactoryNoVal //add by csj 20190125
		}
		if(TSelect=="Y") totalNum++;
		var tmp=","+listInfos+",";
		if (tmp.indexOf(","+listInfo+",")==-1)
		{
			if (TSelect=="Y")
			{
				if (listInfos!="") listInfos=listInfos+",";
				listInfos=listInfos+listInfo;
			}			
		}
		else
		{
			if (TSelect=="N")
			{
				tmp=tmp.replace(","+listInfo+",",",")
				//ת�Ƶ���?���������ϸת��ʱ?ѡ���豸��ʱ��ʾ���������?ֻѡ��һ̨�豸?Ȼ��ȡ����ѡ����������
				if (tmp==",")
				{	listInfos="";	}
				else
				{	listInfos=tmp.substring(1,tmp.length - 1) }
			}
		}		
	}	
	var Num=0
	if ((listInfos!="")&&(listInfos!=","))
	{
		var list=listInfos.split(",")
		Num=list.length
	}
	var truthBeTold = true;
	var Rnt=Num-quantityNum;
	if (Rnt<0)
	{
		var truthBeTold = window.confirm("ѡ����豸��������"+-Rnt+"̨,�Ƿ��޸�?");
	}
	else if (Rnt>0)
	{
		var truthBeTold = window.confirm("ѡ����豸��������"+Rnt+"̨,�Ƿ��޸�?");
	}
	if(truthBeTold)
	{
		//satrt by csj 20190125 ��������ţ��޸ĳ������
		var rtn=CheckLeaveFactoryNo(UpdateLeaveFactoryNoVals);
		if (rtn!="1") return;
		var result=tkMakeServerCall("web.DHCEQ.EM.BUSUpdateEquipByList","UpdateLeaveFactoryNo",UpdateLeaveFactoryNoVals);
		if (result!=0){
			messageShow('alert','error','��ʾ',"������Ÿ���ʧ��!");
		}
		//end by csj 20190126 �޸ĳ������
		var MXInfo=job+"^"+index+"^"+Num+"^"+mXRowID+"^"+type;
		var result=tkMakeServerCall("web.DHCEQ.EM.BUSUpdateEquipByList","UpdateEquipsByList",listInfos,MXInfo);
		if (result==0)
		{
			if (type==1)
			{
				$(window.parent.listChange(index,totalNum));
			}
			else if (type==2)
			{
				$(window.parent.listChange(index,totalNum));  //modify by jyp 2018-12-12
			}
			else if (type==5)
			{
				
			}
			else if (type==6)
			{
				
			}

			var val="&Job="+job;
			val=val+"&Index="+index;
			val=val+"&SourceID="+sourceID;
			val=val+"&MXRowID="+mXRowID;
			val=val+"&QuantityNum="+Num;
			val=val+"&StoreLocDR="+storeLocDR;
			val=val+"&Status="+getElementValue("Status");
			val=val+"&Type="+type;
			val=val+"&EquipID="+getElementValue("EquipID");
			window.location.href= 'dhceq.em.updateequipsbylist.csp?'+val;
		}
		else
		{
			messageShow('alert','error','��ʾ',"����ʧ��!");
		}
	}
}

function CheckLeaveFactoryNo(value)
{
	var result=tkMakeServerCall("web.DHCEQ.EM.BUSUpdateEquipByList","CheckLeaveFactoryNo",value);
	if (result!=0)
	{
		var list=result.split("^");
		var msg="";
		if (list[0]=="1")
		{	msg="�����µĳ�����������ظ����:"+list[1];}
		else
		{	msg="�����豸ʹ�ô˳������:"+list[1];		}
		
		var truthBeTold = window.confirm(msg+",�Ƿ�������±���?");
    	if (!truthBeTold) return 0;
	}
	return 1;
}