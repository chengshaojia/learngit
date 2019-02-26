var SelectedRow = 0;
var rowid=0;
//装载页面  函数名称固定
function BodyLoadHandler() {
	initButtonWidth();///Add By QW 2018-10-11 HISUI改造:修改按钮长度
	setButtonText();///Add By QW 2018-10-11 HISUI改造:按钮文字规范
	InitUserInfo();
	InitEvent();	//初始化
	KeyUp("Model^ServiceItem");
	Muilt_LookUp("Model^ServiceItem");
	filldata();
	SetEnabled();
}

function InitEvent() //初始化
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
	///Modified By QW 2018-10-11 HISUI改造:放大镜隐藏后触发
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
		//SetChkElement("IsInputFlag",true); modified by csj 20190124 隐藏手工录入标记,jdl原话:这里应只处理手工录入的。
		if (GetElementValue("SourceIDDR")!="")
		{
			var encmeth=GetElementValue("GetSourceInfo");
			if (encmeth=="") return;
			var gbldata=cspRunServerMethod(encmeth,'','',GetElementValue("SourceIDDR"));
			gbldata=gbldata.replace(/\\n/g,"\n"); //"\n"转换为回车符
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
			gbldata=gbldata.replace(/\\n/g,"\n"); //"\n"转换为回车符
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
		gbldata=gbldata.replace(/\\n/g,"\n"); //"\n"转换为回车符
		var list=gbldata.split("^");
		SetElement("SourceType",list[1]) ; //来源类型
	  	SetElement("SourceIDDR",list[2]) ; //来源名
	  	SetElement("UseDate",list[3]) ; //开始日期
	  	SetElement("StartTime",list[4]) ; //开始时间
	  	SetElement("EndDate",list[5]) ; //结束日期
	  	SetElement("EndTime",list[6]) ; //结束时间
	  	SetElement("WorkLoadNum",list[7]) ; //工作量  
	  	SetElement("WorkLoadUnitDR",list[8]) ; //工作量单位
	  	SetElement("UseLocDR",list[9]) ; //使用科室
	  	SetElement("PatientInfo",list[10]) ; //患者信息
	  	SetElement("Price",list[11]) ; //单价
	  	SetElement("TotalFee",list[12]) ; //费用
	  	SetElement("Year",list[13]) ; //年
	  	SetElement("Month",list[14]) ; //月
	  	SetElement("ServiceItemDR",list[15]) ; //服务
	  	SetElement("ExType",list[16]) ; //扩展类型
	  	SetElement("ExID",list[17]) ; //扩展ID
	  	//SetChkElement("IsInputFlag",list[18]) ; //手工录入标识 modified by csj 20190124 隐藏手工录入标记,jdl原话:这里应只处理手工录入的。
	  	SetElement("Status",list[19]);	//状态
	  	SetElement("Remark",list[21]) ; //备注
	  	SetElement("ModelDR",list[28]) ; //机型
			//modified by zy 2011-02-15 zy0053	
	  	SetElement("SourceID",list[53]) ; //来源名             //modified by czf 386584 begin
	  	SetElement("WorkLoadUnit",list[54]) ; //工作量单位
	  	SetElement("UseLoc",list[55]) ; //使用科室
	  	SetElement("ServiceItem",list[56]) ; //服务
	  	SetElement("Model",list[57]) ; //机型                   //modified by czf 386584 end
  		var encmeth=GetElementValue("GetSourceInfo");
		if (encmeth=="") return;
		var gbldata=cspRunServerMethod(encmeth,'','',GetElementValue("SourceIDDR"));
		gbldata=gbldata.replace(/\\n/g,"\n"); //"\n"转换为回车符
		var list=gbldata.split("^");
		var sort=EquipGlobalLen;
		SetElement("EquipNo",list[70]) ;//设备编号
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
	if ((GetElementValue("Status")=="2")||(GetElementValue("Status")=="3")) //||(GetChkElementValue("IsInputFlag")==false) modified by csj 20190124 隐藏手工录入标记,jdl原话:这里应只处理手工录入的。
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
	var encmeth=GetElementValue("OperUseRecord"); //1:提交,2:取消提交,3:报废,4:删除
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
	//是否自动审核
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

function BDelete_Click() //删除
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

function BUpdate_Click() //添加
{
	if (condition()) return;
	if (CheckInvalidData()) return;
	var encmeth=GetElementValue("GetUpdate");
	if (encmeth=="") return;
	var plist=CombinData(); //函数调用
  	var flag="Y"	//GetChkElementValue("IsInputFlag") modified by csj 20190124 隐藏手工录入标记,jdl原话:这里应只处理手工录入的。
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
  	var flag="Y"	//GetChkElementValue("IsInputFlag") modified by csj 20190124 隐藏手工录入标记,jdl原话:这里应只处理手工录入的。
//  	if (flag==false)
//  	{
//	  	flag="N"
//  	}
//  	else
//  	{
//	  	flag="Y"
//  	}
	var combindata="";
	combindata="1" ;//来源类型
  	combindata=combindata+"^"+GetElementValue("SourceIDDR") ; //来源名
  	combindata=combindata+"^"+GetElementValue("UseDate") ; //开始日期
  	combindata=combindata+"^"+GetElementValue("StartTime") ; //开始时间
  	combindata=combindata+"^"+GetElementValue("EndDate") ; //结束日期
  	combindata=combindata+"^"+GetElementValue("EndTime") ; //结束时间
  	combindata=combindata+"^"+GetElementValue("WorkLoadNum") ; //工作量  
  	combindata=combindata+"^"+GetElementValue("WorkLoadUnitDR") ; //工作量单位
  	combindata=combindata+"^"+GetElementValue("UseLocDR") ; //使用科室
  	combindata=combindata+"^"+GetElementValue("PatientInfo") ; //患者信息
  	combindata=combindata+"^"+GetElementValue("Price") ; //单价
  	combindata=combindata+"^"+GetElementValue("TotalFee") ; //费用
  	combindata=combindata+"^"+GetElementValue("Year") ; //年
  	combindata=combindata+"^"+GetElementValue("Month") ; //月
  	combindata=combindata+"^"+GetElementValue("ServiceItemDR") ; //服务
  	combindata=combindata+"^"+GetElementValue("ExType") ; //扩展类型
  	combindata=combindata+"^"+GetElementValue("ExID") ; //扩展ID
  	combindata=combindata+"^"+flag ; //手工录入标识	
  	combindata=combindata+"^^^"+GetElementValue("Remark") ; //备注
  	combindata=combindata+"^^^^^^^"+GetElementValue("ModelDR") ; //机型
  	
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

function disabled(value)//灰化
{
	InitEvent();
	DisableBElement("BUpdate",value)
	DisableBElement("BDelete",value)
	DisableBElement("BSubmit",value)
	DisableBElement("BCancelSubmit",value)
	DisableBElement("BAdd",!value)
}
function condition()//条件
{
	if (CheckMustItemNull()) return true;
	return false;
}
function CheckInvalidData()
{
	if (IsValidateNumber(GetElementValue("Price"),1,1,0,1)==0)
	{
		alert("单价数据异常,请修正.");
		//SetElement("Price","");
		return true;
	}
	if (IsValidateNumber(GetElementValue("WorkLoadNum"),1,0,0,0)==0)
	{
		alert("工作量异常,请修正.");
		//SetElement("WorkLoadNum","");
		return true;
	}
	return false;
}
//定义页面加载方法
document.body.onload = BodyLoadHandler;
