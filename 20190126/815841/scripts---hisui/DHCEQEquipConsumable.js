var SelectedRow =  -1; ///Modify By QW 2018-10-11 HISUI改造
var rowid=0;
//装载页面  函数名称固定
function BodyLoadHandler() {
	initButtonWidth();///Add By QW 2018-10-11 HISUI改造:修改按钮长度
	setButtonText();///Add By QW 2018-10-11 HISUI改造:按钮文字规范
	InitUserInfo();
	InitEvent();	//初始化
	KeyUp("Model^ResourceType^Unit");
	disabled(true);//灰化
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

function InitEvent() //初始化
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
	//hisui改造:放大镜触发前响应 add by QW 2018-10-11 
	$('#ResourceType').lookup('options').onBeforeShowPanel= function(){
		ResourceType_change();
	};
	///add by QW 2018-10-11 描述：hisui改造 隐藏/放开放大镜
	$('#Model').lookup('options').onBeforeShowPanel= function(){
 			return $("#Model").lookup('options').hasDownArrow
	};
}
///add by QW 2018-10-10
///描述：hisui改造 下拉列表onchange事件更改
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
		///add by QW 2018-10-10 描述：hisui改造 隐藏/放开放大镜
		$("#Model").lookup({hasDownArrow:false,disable:true});
		
	}
	if (GetElementValue("SourceType")==2)
	{
		///add by QW 2018-10-10 描述：hisui改造 隐藏/放开放大镜
		$("#Model").lookup({hasDownArrow:true,disable:false});
	}
}
///hisui改造:放大镜不能根据不同的值调用不同的query Modified by QW 2018-10-11
function SourceID_Click()
{
	if (GetElementValue("SourceType")==1) //设备
	{
		singlelookup("SourceID","EM.L.Equip","",GetSourceID);
	}
	if (GetElementValue("SourceType")==2) //设备项
	{
		singlelookup("SourceID","EM.L.GetMasterItem","",GetSourceID);
	}
}


///Add By QW 2018-10-10 hisui组件调整步骤
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
function BDelete_Click() //删除
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
function BUpdate_Click() //修改
{
	if (condition()) return;
	if (CheckInvalidData()) return;
	var encmeth=GetElementValue("GetUpdate");
	if (encmeth=="") return;
	changeAmount();
	var plist=CombinData(); //函数调用
	var result=cspRunServerMethod(encmeth,'','',plist);
	result=result.replace(/\\n/g,"\n")
	if(result=="") 
	{
	messageShow("","","",t["03"]);
	return
	}
	if (result>0) location.reload();	
}
function BAdd_Click() //添加
{
	if (condition()) return;
	if (CheckInvalidData()) return;
	var encmeth=GetElementValue("GetUpdate");
	if (encmeth=="") return;
	changeAmount();
	var plist=CombinData(); //函数调用
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
	combindata=combindata+"^"+GetElementValue("SourceTypeDR") ;//来源类型
  	combindata=combindata+"^"+GetElementValue("SourceIDDR") ; //来源名
  	combindata=combindata+"^"+GetElementValue("ResourceTypeDR") ; //资源
  	combindata=combindata+"^"+GetElementValue("Price") ; //单价
  	combindata=combindata+"^"+GetElementValue("UnitDR") ; //单位
  	combindata=combindata+"^"+GetElementValue("Quantity") ; //数量
  	combindata=combindata+"^"+GetElementValue("Amount") ; //金额
  	combindata=combindata+"^"+GetElementValue("Remark") ; //备注  
  	combindata=combindata+"^"+GetElementValue("ModelDR") ; //机型
  	return combindata;
}
///选择表格行触发此方法
//Modify By QW 2018-10-11 HISUI改造：点击选择行后，界面无法正常填充数据
///解决方法传入index,rowdata两个参数，并修改判断逻辑
function SelectRowHandler(index,rowdata)
{
	if(index==SelectedRow)
    {
		Clear();	
		disabled(true)//灰化
		SelectedRow=-1;	
		SetElement("RowID","");
		$('#tDHCEQEquipConsumable').datagrid('unselectAll');
		return;
	 }
	SelectedRow=index;
	SetData(rowdata.TRowID);//调用函数
	disabled(false);//反灰化
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
	gbldata=gbldata.replace(/\\n/g,"\n"); //"\n"转换为回车符
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
///描述：hisui改造 根据下拉列表重新定义设备名称下拉框
function GetSourceID(item) {
	SourceType = $("#SourceType").combobox('getValue')
	if(SourceType==1)
	{
		SetElement('SourceIDDR',item.TRowID)
		SetElement('SourceID',item.TName)
		// Add By Qw20181025 需求号:725075
		SetElement("Model",item.TModel);
		SetElement("ModelDR",item.TModelDR);
		//End By Qw20181025 需求号:725075
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

function disabled(value)//灰化
{
	InitEvent();
	DisableBElement("BUpdate",value)
	DisableBElement("BDelete",value)	
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
	if (IsValidateNumber(GetElementValue("Quantity"),1,0,0,1)==0)
	{
		alert("数量异常,请修正.");
		//SetElement("Quantity","");
		return true;
	}
	
	return false;
}
function changeAmount()
{
	//计算金额
	var Quantity=+GetElementValue("Quantity")
	//Mozy0049	2011-3-30
	if (IsValidateNumber(Quantity,1,0,0,1)==0)
	{
		alert("数量异常,请修正.");
		//SetElement("Quantity","");
		return;
	}
	var Price=+GetElementValue("Price")
	//Mozy0049	2011-3-30
	if (IsValidateNumber(Price,1,1,0,1)==0)
	{
		alert("单价异常,请修正.");
		//SetElement("Price","");
		return;
	}
	if (Price=="")
	{
		Price=0
	}
	SetElement("Amount",Quantity*Price)
}

//定义页面加载方法
document.body.onload = BodyLoadHandler;
