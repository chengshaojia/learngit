var SelectedRow =  -1; ///Modify By QW 2018-10-11 HISUI����
var rowid=0;
//װ��ҳ��  �������ƹ̶�
function BodyLoadHandler() {
	initButtonWidth();///Add By QW 2018-10-11 HISUI����:�޸İ�ť����
	setButtonText();///Add By QW 2018-10-11 HISUI����:��ť���ֹ淶
	InitUserInfo();
	InitEvent();	//��ʼ��
	KeyUp("Model^ResourceType^Unit");
	disabled(true);//�һ�
	Muilt_LookUp("Model^ResourceType^Unit");
	SetElement("SourceType",GetElementValue("SourceTypeDR"))
	EnableModel()
	fillData();
}

function fillData()
{
	var val="";
	if (GetElementValue("SourceTypeDR")==1)
	{
		val=val+"equip=SourceID="+GetElementValue("SourceIDDR")+"^";
	}
	else
	{
		val=val+"masteritem=SourceID="+GetElementValue("SourceIDDR")+"^";
	}
	val=val+"resourcetype=ResourceType="+GetElementValue("ResourceTypeDR")+"^";
	val=val+"model=Model="+GetElementValue("ModelDR");
	var encmeth=GetElementValue("GetDRDesc");
	var result=cspRunServerMethod(encmeth,val);
	var list=result.split("^");
	for (var i=1; i<list.length; i++)
	{
		var Detail=list[i-1].split("=");
		SetElement(Detail[0],Detail[1]);
	}
}

function InitEvent() //��ʼ��
{
	var obj=document.getElementById("BAdd");
	if (obj) obj.onclick=BAdd_Click;
	var obj=document.getElementById("BUpdate");
	if (obj) obj.onclick=BUpdate_Click;
	var obj=document.getElementById("BDelete");
	if (obj) obj.onclick=BDelete_Click;
	var obj=document.getElementById("BClear");
	if (obj) obj.onclick=BClear_Click;
	var obj=document.getElementById("BFind");
	if (obj) obj.onclick=BFind_Click;
	var obj=document.getElementById("Price");
	if (obj) obj.onchange=changeAmount;
	var obj=document.getElementById("Quantity");
	if (obj) obj.onchange=changeAmount;
	//hisui����:�Ŵ󾵴���ǰ��Ӧ add by QW 2018-10-11 
	$('#ResourceType').lookup('options').onBeforeShowPanel= function(){
		ResourceType_change();
	};
	///add by QW 2018-10-11 ������hisui���� ����/�ſ��Ŵ�
	$('#Model').lookup('options').onBeforeShowPanel= function(){
 			return $("#Model").lookup('options').hasDownArrow
	};
}
///add by QW 2018-10-10
///������hisui���� �����б�onchange�¼�����
 $('#SourceType').combobox({
     onSelect:function () {
	   SourceType_change();
    },
     onChange:function () {
	   SourceID_Click();
    }
 })
 
 
function SourceID_keydown()
{
	if (event.keyCode==13)
	{
		SourceID_Click();
	}
}

function ResourceType_change()
{
	SetElement("Unit","");
	SetElement("UnitDR","");
	SetElement("Price","");
	SetElement("Amount","");
	SetElement("ResourceTypeDR","");
}

function SourceType_change()
{
	SetElement("SourceTypeDR",GetElementValue("SourceType"))
	EnableModel()
	SetElement("SourceID","")
	SetElement("SourceIDDR","");
	SetElement("Model","");
	SetElement("ModelDR","");
	SetElement("ResourceType","");
	SetElement("ResourceTypeDR","");
	SetElement("Remark","");
	SetElement("Unit","");
	SetElement("UnitDR","");
	SetElement("Price","");
	SetElement("Amount","");
	SetElement("Quantity","");
}

function EnableModel()
{
	if ((GetElementValue("SourceType")==1)||(GetElementValue("SourceType")==""))
	{
		///add by QW 2018-10-10 ������hisui���� ����/�ſ��Ŵ�
		$("#Model").lookup({hasDownArrow:false,disable:true});
		
	}
	if (GetElementValue("SourceType")==2)
	{
		///add by QW 2018-10-10 ������hisui���� ����/�ſ��Ŵ�
		$("#Model").lookup({hasDownArrow:true,disable:false});
	}
}
///hisui����:�Ŵ󾵲��ܸ��ݲ�ͬ��ֵ���ò�ͬ��query Modified by QW 2018-10-11
function SourceID_Click()
{
	if (GetElementValue("SourceType")==1) //�豸
	{
		singlelookup("SourceID","EM.L.Equip","",GetSourceID);
	}
	if (GetElementValue("SourceType")==2) //�豸��
	{
		singlelookup("SourceID","EM.L.GetMasterItem","",GetSourceID);
	}
}


///Add By QW 2018-10-10 hisui�����������
//modified by csj 20190124
function BFind_Click()
{
	if (!$(this).linkbutton('options').disabled){	
		$('#tDHCEQEquipConsumable').datagrid('load',{ComponentID:getValueById('GetComponentID'),SourceTypeDR:getValueById("SourceTypeDR"),SourceIDDR:getValueById("SourceIDDR"),ModelDR:getValueById("ModelDR"),ResourceTypeDR:getValueById("ResourceTypeDR")});
	}
	
//	var val="&SourceTypeDR="+GetElementValue("SourceTypeDR");
//	val=val+"&SourceIDDR="+GetElementValue("SourceIDDR");
//	val=val+"&ModelDR="+GetElementValue("ModelDR");
//	val=val+"&ResourceTypeDR="+GetElementValue("ResourceTypeDR");
//	window.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQEquipConsumable"+val;
}

function BClear_Click() 
{
	Clear();
	disabled(true);
}
function BDelete_Click() //ɾ��
{
	rowid=GetElementValue("RowID");
	var truthBeTold = window.confirm(t["-4003"]);
    if (!truthBeTold) return;
	var encmeth=GetElementValue("GetUpdate");
	if (encmeth=="") 
	{
	messageShow("","","",t["02"])
	return;
	}
	var result=cspRunServerMethod(encmeth,'','',rowid,'1');
	result=result.replace(/\\n/g,"\n")
	if (result>0) location.reload();	
}
function BUpdate_Click() //�޸�
{
	if (condition()) return;
	if (CheckInvalidData()) return;
	var encmeth=GetElementValue("GetUpdate");
	if (encmeth=="") return;
	changeAmount();
	var plist=CombinData(); //��������
	var result=cspRunServerMethod(encmeth,'','',plist);
	result=result.replace(/\\n/g,"\n")
	if(result=="") 
	{
	messageShow("","","",t["03"]);
	return
	}
	if (result>0) location.reload();	
}
function BAdd_Click() //���
{
	if (condition()) return;
	if (CheckInvalidData()) return;
	var encmeth=GetElementValue("GetUpdate");
	if (encmeth=="") return;
	changeAmount();
	var plist=CombinData(); //��������
	var result=cspRunServerMethod(encmeth,'','',plist,'2');
	result=result.replace(/\\n/g,"\n")
	if(result=="")
	{
		messageShow("","","",t["03"])
		return
	}
	if (result>0)location.reload();	
}

function CombinData()
{
	var combindata="";
    combindata=GetElementValue("RowID") ;//1
	combindata=combindata+"^"+GetElementValue("SourceTypeDR") ;//��Դ����
  	combindata=combindata+"^"+GetElementValue("SourceIDDR") ; //��Դ��
  	combindata=combindata+"^"+GetElementValue("ResourceTypeDR") ; //��Դ
  	combindata=combindata+"^"+GetElementValue("Price") ; //����
  	combindata=combindata+"^"+GetElementValue("UnitDR") ; //��λ
  	combindata=combindata+"^"+GetElementValue("Quantity") ; //����
  	combindata=combindata+"^"+GetElementValue("Amount") ; //���
  	combindata=combindata+"^"+GetElementValue("Remark") ; //��ע  
  	combindata=combindata+"^"+GetElementValue("ModelDR") ; //����
  	return combindata;
}
///ѡ�����д����˷���
//Modify By QW 2018-10-11 HISUI���죺���ѡ���к󣬽����޷������������
///�����������index,rowdata�������������޸��ж��߼�
function SelectRowHandler(index,rowdata)
{
	if(index==SelectedRow)
    {
		Clear();	
		disabled(true)//�һ�
		SelectedRow=-1;	
		SetElement("RowID","");
		$('#tDHCEQEquipConsumable').datagrid('unselectAll');
		return;
	 }
	SelectedRow=index;
	SetData(rowdata.TRowID);//���ú���
	disabled(false);//���һ�
}

function Clear()
{
	SetElement("SourceType","")
	SetElement("SourceTypeDR","");
	SetElement("SourceID","")
	SetElement("SourceIDDR","");
	SetElement("Model","");
	SetElement("ModelDR","");
	SetElement("ResourceType","");
	SetElement("ResourceTypeDR","");
	SetElement("Remark","");
	SetElement("Unit","");
	SetElement("UnitDR","");
	SetElement("Price","");
	SetElement("Amount","");
	SetElement("Quantity","");
}
	
function SetData(rowid)
{
	var encmeth=GetElementValue("GetData");
	if (encmeth=="") return;
	var gbldata=cspRunServerMethod(encmeth,'','',rowid);
	gbldata=gbldata.replace(/\\n/g,"\n"); //"\n"ת��Ϊ�س���
	var list=gbldata.split("^");
	SetElement("RowID",list[0]); //rowid
	SetElement("SourceTypeDR",list[1]);
	SetElement("SourceIDDR",list[2]);
	SetElement("ResourceTypeDR",list[3])
	SetElement("Price",list[4]);
	SetElement("UnitDR",list[5]);
	SetElement("Quantity",list[6]);
	SetElement("Amount",list[7]);	
	SetElement("Remark",list[8]);
	SetElement("ModelDR",list[9]);
	SetElement("SourceType",list[1]);
	SetElement("SourceID",list[11]);
	SetElement("ResourceType",list[12])
	SetElement("Unit",list[13]);
	SetElement("Model",list[14]);
	EnableModel()
}
///add by QW 2018-10-11
///������hisui���� ���������б����¶����豸����������
function GetSourceID(item) {
	SourceType = $("#SourceType").combobox('getValue')
	if(SourceType==1)
	{
		SetElement('SourceIDDR',item.TRowID)
		SetElement('SourceID',item.TName)
		// Add By Qw20181025 �����:725075
		SetElement("Model",item.TModel);
		SetElement("ModelDR",item.TModelDR);
		//End By Qw20181025 �����:725075
	}
	else if(SourceType==2)
	{
		SetElement('SourceIDDR',item.TRowID)
		SetElement('SourceID',item.TName)
	}
}

function GetModel(value) {
	var type=value.split("^");
	var obj=document.getElementById("ModelDR");
	obj.value=type[1];
}

function GetResourceType(value)
{
	var type=value.split("^");
	var obj=document.getElementById("ResourceTypeDR");
	obj.value=type[1];
	SetElement("Unit",type[6]);
	SetElement("UnitDR",type[5]);
	SetElement("Price",type[4]);
	changeAmount()
}

function GetUnit(value) {
	var type=value.split("^");
	var obj=document.getElementById("UnitDR");
	obj.value=type[1];
}

function disabled(value)//�һ�
{
	InitEvent();
	DisableBElement("BUpdate",value)
	DisableBElement("BDelete",value)	
	DisableBElement("BAdd",!value)
}
function condition()//����
{
	if (CheckMustItemNull()) return true;
	return false;
}
function CheckInvalidData()
{
	if (IsValidateNumber(GetElementValue("Price"),1,1,0,1)==0)
	{
		alert("���������쳣,������.");
		//SetElement("Price","");
		return true;
	}
	if (IsValidateNumber(GetElementValue("Quantity"),1,0,0,1)==0)
	{
		alert("�����쳣,������.");
		//SetElement("Quantity","");
		return true;
	}
	
	return false;
}
function changeAmount()
{
	//������
	var Quantity=+GetElementValue("Quantity")
	//Mozy0049	2011-3-30
	if (IsValidateNumber(Quantity,1,0,0,1)==0)
	{
		alert("�����쳣,������.");
		//SetElement("Quantity","");
		return;
	}
	var Price=+GetElementValue("Price")
	//Mozy0049	2011-3-30
	if (IsValidateNumber(Price,1,1,0,1)==0)
	{
		alert("�����쳣,������.");
		//SetElement("Price","");
		return;
	}
	if (Price=="")
	{
		Price=0
	}
	SetElement("Amount",Quantity*Price)
}

//����ҳ����ط���
document.body.onload = BodyLoadHandler;
