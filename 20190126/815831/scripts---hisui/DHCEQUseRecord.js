var SelectedRow = 0;
var rowid=0;
//װ��ҳ��  �������ƹ̶�
function BodyLoadHandler() {
	initButtonWidth();///Add By QW 2018-10-11 HISUI����:�޸İ�ť����
	setButtonText();///Add By QW 2018-10-11 HISUI����:��ť���ֹ淶
	InitUserInfo();
	InitEvent();	//��ʼ��
	KeyUp("Model^ServiceItem");
	Muilt_LookUp("Model^ServiceItem");
	filldata();
	SetEnabled();
}

function InitEvent() //��ʼ��
{
	var obj=document.getElementById("BAdd");
	if (obj) obj.onclick=BUpdate_Click;
	var obj=document.getElementById("BUpdate");
	if (obj) obj.onclick=BUpdate_Click;
	var obj=document.getElementById("BDelete");
	if (obj) obj.onclick=BDelete_Click;
	var obj=document.getElementById("BSubmit");
	if (obj) obj.onclick=BSubmit_Click;
	var obj=document.getElementById("BCancelSubmit");
	if (obj) obj.onclick=BCancelSubmit_Click;
	var obj=document.getElementById("BAudit");
	if (obj) obj.onclick=BAudit_Click;
	var obj=document.getElementById("BCancel");
	if (obj) obj.onclick=BCancel_Click;
	var obj=document.getElementById("WorkLoadNum");
	if (obj) obj.onchange=Amount_change;
	var obj=document.getElementById("Price");
	if (obj) obj.onchange=Amount_change;
	///Modified By QW 2018-10-11 HISUI����:�Ŵ����غ󴥷�
	$('#SourceID').lookup('options').onHidePanel= function(){
		SourceID_change();
	};
}



function SourceID_change()
{
	SetElement("ServiceItemDR","")
	SetElement("ServiceItem","")
}

function Amount_change()
{
	var WrokLoadNum=0
	var Price=0
	if (GetElementValue("WorkLoadNum")!="")
	{
		WrokLoadNum=GetElementValue("WorkLoadNum")
	}
	if (GetElementValue("Price")!="")
	{
		Price=GetElementValue("Price")
	}
	SetElement("TotalFee",WrokLoadNum*Price)
}

function filldata()
{
	if (GetElementValue("RowID")=="")
	{
		var curdate=new Date()
		var WorkLoadNum=0
		var Price=0
		SetElement("WorkLoadNum",1)
		SetElement("Year",curdate.getFullYear())
		SetElement("Month",curdate.getMonth() + 1)
		//SetChkElement("IsInputFlag",true); modified by csj 20190124 �����ֹ�¼����,jdlԭ��:����Ӧֻ�����ֹ�¼��ġ�
		if (GetElementValue("SourceIDDR")!="")
		{
			var encmeth=GetElementValue("GetSourceInfo");
			if (encmeth=="") return;
			var gbldata=cspRunServerMethod(encmeth,'','',GetElementValue("SourceIDDR"));
			gbldata=gbldata.replace(/\\n/g,"\n"); //"\n"ת��Ϊ�س���
			var list=gbldata.split("^");
			var sort=EquipGlobalLen;
			SetElement("ModelDR",list[2])
			SetElement("Model",list[sort])
			SetElement("UseLocDR",list[18])
			SetElement("UseLoc",list[sort+7])
			SetElement("SourceID",list[0])
			SetElement("SourceType",1)
			SetElement("EquipNo",list[70])
		}
		if (GetElementValue("ServiceItemDR")!="")
		{
			var encmeth=GetElementValue("GetServiceItemInfo");
			if (encmeth=="") return;
			var gbldata=cspRunServerMethod(encmeth,'','',GetElementValue("ServiceItemDR"));
			gbldata=gbldata.replace(/\\n/g,"\n"); //"\n"ת��Ϊ�س���
			var list=gbldata.split("^");
			SetElement("WorkLoadUnit",list[15])
			SetElement("WorkLoadUnitDR",list[3])
			SetElement("Price",list[4])
			SetElement("ServiceItem",list[1])
			SetElement("ExType",list[5])   //ExType  add by czf 378181
			SetElement("ExID",list[6])   //ExID
		}
		Amount_change();
	}
	else
	{

		var encmeth=GetElementValue("GetData");
		if (encmeth=="") return;
		var gbldata=cspRunServerMethod(encmeth,'','',GetElementValue("RowID"));
		gbldata=gbldata.replace(/\\n/g,"\n"); //"\n"ת��Ϊ�س���
		var list=gbldata.split("^");
		SetElement("SourceType",list[1]) ; //��Դ����
	  	SetElement("SourceIDDR",list[2]) ; //��Դ��
	  	SetElement("UseDate",list[3]) ; //��ʼ����
	  	SetElement("StartTime",list[4]) ; //��ʼʱ��
	  	SetElement("EndDate",list[5]) ; //��������
	  	SetElement("EndTime",list[6]) ; //����ʱ��
	  	SetElement("WorkLoadNum",list[7]) ; //������  
	  	SetElement("WorkLoadUnitDR",list[8]) ; //��������λ
	  	SetElement("UseLocDR",list[9]) ; //ʹ�ÿ���
	  	SetElement("PatientInfo",list[10]) ; //������Ϣ
	  	SetElement("Price",list[11]) ; //����
	  	SetElement("TotalFee",list[12]) ; //����
	  	SetElement("Year",list[13]) ; //��
	  	SetElement("Month",list[14]) ; //��
	  	SetElement("ServiceItemDR",list[15]) ; //����
	  	SetElement("ExType",list[16]) ; //��չ����
	  	SetElement("ExID",list[17]) ; //��չID
	  	//SetChkElement("IsInputFlag",list[18]) ; //�ֹ�¼���ʶ modified by csj 20190124 �����ֹ�¼����,jdlԭ��:����Ӧֻ�����ֹ�¼��ġ�
	  	SetElement("Status",list[19]);	//״̬
	  	SetElement("Remark",list[21]) ; //��ע
	  	SetElement("ModelDR",list[28]) ; //����
			//modified by zy 2011-02-15 zy0053	
	  	SetElement("SourceID",list[53]) ; //��Դ��             //modified by czf 386584 begin
	  	SetElement("WorkLoadUnit",list[54]) ; //��������λ
	  	SetElement("UseLoc",list[55]) ; //ʹ�ÿ���
	  	SetElement("ServiceItem",list[56]) ; //����
	  	SetElement("Model",list[57]) ; //����                   //modified by czf 386584 end
  		var encmeth=GetElementValue("GetSourceInfo");
		if (encmeth=="") return;
		var gbldata=cspRunServerMethod(encmeth,'','',GetElementValue("SourceIDDR"));
		gbldata=gbldata.replace(/\\n/g,"\n"); //"\n"ת��Ϊ�س���
		var list=gbldata.split("^");
		var sort=EquipGlobalLen;
		SetElement("EquipNo",list[70]) ;//�豸���
		//end zy0053	
	}
}

function SetEnabled()
{
	if (GetElementValue("Status")=="")
	{
		DisableBElement("BUpdate",true)
		DisableBElement("BSubmit",true)
		DisableBElement("BCancelSubmit",true)
		DisableBElement("BDelete",true)
	}
	if (GetElementValue("Status")=="0")
	{
		DisableBElement("BAdd",true)
		DisableBElement("BCancelSubmit",true)
	}
	if (GetElementValue("Status")=="1")
	{
		DisableBElement("BAdd",true)
		DisableBElement("BUpdate",true)
		DisableBElement("BSubmit",true)
		DisableBElement("BDelete",true)
	}
	if ((GetElementValue("Status")=="2")||(GetElementValue("Status")=="3")) //||(GetChkElementValue("IsInputFlag")==false) modified by csj 20190124 �����ֹ�¼����,jdlԭ��:����Ӧֻ�����ֹ�¼��ġ�
	{
		DisableBElement("BAdd",true)
		DisableBElement("BUpdate",true)
		DisableBElement("BSubmit",true)
		DisableBElement("BCancelSubmit",true)
		DisableBElement("BDelete",true)
	}
}

function BAudit_Click()
{
	rowid=GetElementValue("RowID");
	var encmeth=GetElementValue("AuditUseRecord");
	if (encmeth=="")  return;
	var result=cspRunServerMethod(encmeth,rowid,GetElementValue("UserDR")); 
	var obj=parent.document.frames["DHCEQEquipOperatorFind"].document.getElementById("EquipDR")
	var SourceID=obj.value
	var obj=parent.document.frames["DHCEQEquipServiceFind"].document.getElementById("ServiceDR")
	var ServiceDR=obj.value
	var today=GetElementValue("Today")
	var userdr=GetElementValue("UserDR")
	result=result.replace(/\\n/g,"\n")
	if (result>0)
	{
		parent.DHCEQUseRecord.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecord&SourceIDDR="+SourceID+"&ServiceItemDR="+ServiceDR
		parent.DHCEQUseRecordList.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecordList&StartDate="+today+"&EndDate="+today+"&UserDR="+userdr+"&QXType=0"
	}
	else
	{
		messageShow("","","",t["01"]);
		return
	}
}

function BCancel_Click()
{
	rowid=GetElementValue("RowID");
	var encmeth=GetElementValue("OperUseRecord");
	if (encmeth=="") return;
	var result=cspRunServerMethod(encmeth,rowid,"3"); 
	var obj=parent.document.frames["DHCEQEquipOperatorFind"].document.getElementById("EquipDR")
	var SourceID=obj.value
	var obj=parent.document.frames["DHCEQEquipServiceFind"].document.getElementById("ServiceDR")
	var ServiceDR=obj.value
	var today=GetElementValue("Today")
	var userdr=GetElementValue("UserDR")
	result=result.replace(/\\n/g,"\n")
	if (result>0)
	{
		parent.DHCEQUseRecord.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecord&SourceIDDR="+SourceID+"&ServiceItemDR="+ServiceDR
		parent.DHCEQUseRecordList.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecordList&StartDate="+today+"&EndDate="+today+"&UserDR="+userdr+"&QXType=0"
	}
	else
	{
		messageShow("","","",t["01"]);
		return
	}
}

function BCancelSubmit_Click()
{
	rowid=GetElementValue("RowID");
	var today=GetElementValue("Today")
	var userdr=GetElementValue("UserDR")
	var encmeth=GetElementValue("OperUseRecord"); //1:�ύ,2:ȡ���ύ,3:����,4:ɾ��
	if (encmeth=="")  return;
	var result=cspRunServerMethod(encmeth,rowid,"2");
	result=result.replace(/\\n/g,"\n")
	if (result>0)
	{
		parent.DHCEQUseRecord.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecord&RowID="+result
		parent.DHCEQUseRecordList.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecordList&StartDate="+today+"&EndDate="+today+"&UserDR="+userdr+"&QXType=0"
	}
	else
	{
		messageShow("","","",t["01"]);
		return
	}
}

function BSubmit_Click()
{
	//�Ƿ��Զ����
	if (GetElementValue("AutoAuditFlag")=="1")
	{
		BAudit_Click()
		return
	}
	rowid=GetElementValue("RowID");
	var encmeth=GetElementValue("OperUseRecord");
	if (encmeth=="")  return;
	var result=cspRunServerMethod(encmeth,rowid,"1"); 
	var obj=parent.document.frames["DHCEQEquipOperatorFind"].document.getElementById("EquipDR")
	var SourceID=obj.value
	var obj=parent.document.frames["DHCEQEquipServiceFind"].document.getElementById("ServiceDR")
	var ServiceDR=obj.value
	var today=GetElementValue("Today")
	var userdr=GetElementValue("UserDR")
	result=result.replace(/\\n/g,"\n")
	if (result>0)
	{
		parent.DHCEQUseRecord.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecord&SourceIDDR="+SourceID+"&ServiceItemDR="+ServiceDR
		parent.DHCEQUseRecordList.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecordList&StartDate="+today+"&EndDate="+today+"&UserDR="+userdr+"&QXType=0"
	}
	else
	{
		messageShow("","","",t["01"]);
		return
	}
}

function BDelete_Click() //ɾ��
{
	rowid=GetElementValue("RowID");
	var truthBeTold = window.confirm(t["-4003"]);
    if (!truthBeTold) return;
	var encmeth=GetElementValue("OperUseRecord");
	if (encmeth=="") return;
	var result=cspRunServerMethod(encmeth,rowid,"4"); 
	var obj=parent.document.frames["DHCEQEquipOperatorFind"].document.getElementById("EquipDR")
	var SourceID=obj.value
	var obj=parent.document.frames["DHCEQEquipServiceFind"].document.getElementById("ServiceDR")
	var ServiceDR=obj.value
	var today=GetElementValue("Today")
	var userdr=GetElementValue("UserDR")
	result=result.replace(/\\n/g,"\n")
	if (result>0)
	{
		parent.DHCEQUseRecord.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecord&SourceIDDR="+SourceID+"&ServiceItemDR="+ServiceDR
		parent.DHCEQUseRecordList.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecordList&StartDate="+today+"&EndDate="+today+"&UserDR="+userdr+"&QXType=0"
	}
	else
	{
		messageShow("","","",t["01"]);
		return
	}
}

function BUpdate_Click() //���
{
	if (condition()) return;
	if (CheckInvalidData()) return;
	var encmeth=GetElementValue("GetUpdate");
	if (encmeth=="") return;
	var plist=CombinData(); //��������
  	var flag="Y"	//GetChkElementValue("IsInputFlag") modified by csj 20190124 �����ֹ�¼����,jdlԭ��:����Ӧֻ�����ֹ�¼��ġ�
//  	if (flag==false)
//  	{
//	  	flag="N"
//  	}
//  	else
//  	{
//	  	flag="Y"
//  	}
  	var rowid=GetElementValue("RowID")
  	var user=GetElementValue("UserDR")
  	var today=GetElementValue("Today")
	var result=cspRunServerMethod(encmeth,rowid,flag,user,plist);
	result=result.replace(/\\n/g,"\n")
	if(result<0)
	{
		messageShow("","","",t["01"])
		return
	}
	if (result>0)
	{
		parent.DHCEQUseRecord.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecord&RowID="+result
		parent.DHCEQUseRecordList.location.href="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQUseRecordList&StartDate="+today+"&EndDate="+today+"&UserDR="+user+"&QXType=0"
	}	
}

function CombinData()
{
  	var flag="Y"	//GetChkElementValue("IsInputFlag") modified by csj 20190124 �����ֹ�¼����,jdlԭ��:����Ӧֻ�����ֹ�¼��ġ�
//  	if (flag==false)
//  	{
//	  	flag="N"
//  	}
//  	else
//  	{
//	  	flag="Y"
//  	}
	var combindata="";
	combindata="1" ;//��Դ����
  	combindata=combindata+"^"+GetElementValue("SourceIDDR") ; //��Դ��
  	combindata=combindata+"^"+GetElementValue("UseDate") ; //��ʼ����
  	combindata=combindata+"^"+GetElementValue("StartTime") ; //��ʼʱ��
  	combindata=combindata+"^"+GetElementValue("EndDate") ; //��������
  	combindata=combindata+"^"+GetElementValue("EndTime") ; //����ʱ��
  	combindata=combindata+"^"+GetElementValue("WorkLoadNum") ; //������  
  	combindata=combindata+"^"+GetElementValue("WorkLoadUnitDR") ; //��������λ
  	combindata=combindata+"^"+GetElementValue("UseLocDR") ; //ʹ�ÿ���
  	combindata=combindata+"^"+GetElementValue("PatientInfo") ; //������Ϣ
  	combindata=combindata+"^"+GetElementValue("Price") ; //����
  	combindata=combindata+"^"+GetElementValue("TotalFee") ; //����
  	combindata=combindata+"^"+GetElementValue("Year") ; //��
  	combindata=combindata+"^"+GetElementValue("Month") ; //��
  	combindata=combindata+"^"+GetElementValue("ServiceItemDR") ; //����
  	combindata=combindata+"^"+GetElementValue("ExType") ; //��չ����
  	combindata=combindata+"^"+GetElementValue("ExID") ; //��չID
  	combindata=combindata+"^"+flag ; //�ֹ�¼���ʶ	
  	combindata=combindata+"^^^"+GetElementValue("Remark") ; //��ע
  	combindata=combindata+"^^^^^^^"+GetElementValue("ModelDR") ; //����
  	
  	return combindata;
}

function GetModel(value) {
	var type=value.split("^");
	var obj=document.getElementById("ModelDR");
	obj.value=type[1];
}

function GetEquip(value) {
	var type=value.split("^");
	var obj=document.getElementById("SourceID");
	obj.value=type[0];
	var obj=document.getElementById("SourceIDDR");
	obj.value=type[1];
}

function GetEquipService(value) {
	var type=value.split("^");
	var obj=document.getElementById("ServiceItemDR");
	obj.value=type[1];
}

function disabled(value)//�һ�
{
	InitEvent();
	DisableBElement("BUpdate",value)
	DisableBElement("BDelete",value)
	DisableBElement("BSubmit",value)
	DisableBElement("BCancelSubmit",value)
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
	if (IsValidateNumber(GetElementValue("WorkLoadNum"),1,0,0,0)==0)
	{
		alert("�������쳣,������.");
		//SetElement("WorkLoadNum","");
		return true;
	}
	return false;
}
//����ҳ����ط���
document.body.onload = BodyLoadHandler;
