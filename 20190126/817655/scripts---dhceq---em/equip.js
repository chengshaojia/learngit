var curYear=""; //记录生命周期生成时年限节点
$(function(){
	initDocument();
});

function initDocument(){
	//综合查询时影藏编辑按钮
	if (getElementValue("ReadOnly")==1) {$('#EquipInfo').layout('panel', 'center').panel({ title: '信息总览' });}
	//隐藏头部按钮
	if(getElementValue("ToolBarFlag")!=1){$("#EquipShow").layout('remove','north');}
	//隐藏其他信息查看
	if(getElementValue("DetailListFlag")!=1)
	{
		$("#EquipCard").layout('remove','center');
		$("#LifeInfoFind").hide();
	}
	else {initCardInfo();}
	//隐藏生命周期
	if(getElementValue("LifeInfoFlag")!=1){$('#EquipInfo').layout('remove','east');}
	else {
		lifeInfoKeywords();
		initLifeInfo("");
	}
	initUserInfo();
	fillData();
	initImage();
};

///Creator: zx
///CreatDate: 2018-08-23
///Description: 生命周期筛选项关键字加载
function lifeInfoKeywords()
{
	$("#LifeInfoItemDetail").keywords({
	    items:[
	        {
	            text:"",
	            type:"chapter", //章
	            items:[
	                {
	                    text:'购置信息',
	                    type:"section", //节
	                    items:[
	                        {text:'申请',id:"91",selected:true},{text:'计划',id:"92",selected:true},{text:'合同',id:'94',selected:true},{text:'验收',id:'11',selected:true}
	                    ]
	                },
	                {
	                    text:"库房变动",
	                    type:'section', //节
	                    items:[
	                        {text:'入库',id:"21",selected:true},{text:'转移',id:"22",selected:true}
	                    ]
	                },
	                {
	                    text:"维护信息",
	                    type:'section', //节
	                    items:[
	                        {text:'维修',id:"31",selected:true},{text:'计量',id:"72-1",selected:true},{text:'巡检',id:'73',selected:true},{text:'保养',id:'71',selected:true}
	                    ]
	                },
	                {
	                    text:"处置信息",
	                    type:'section', //节
	                    items:[
	                        {text:'报废',id:"34",selected:true},{text:'退货及减少',id:'23',selected:true}
	                    ]
	                },
	                {
	                    text:"其他信息",
	                    type:'section', //节
	                    items:[
	                        {text:'折旧',id:"35",selected:true},{text:'调账',id:"51",selected:true},{text:'启用及停用',id:'41',selected:true}
	                    ]
	                }
	            ]
	        }
	    ],
	});
	
}

///Creator: zx
///CreatDate: 2018-08-23
//按钮绑定事件
$("#LifeInfoSeach").click(function(){
		curYear="";
		var keyObj=$HUI.keywords("#LifeInfoItemDetail").getSelected();
		var sourceTypeDRs="";
		for (i=0;i<keyObj.length;i++)
		{
			//关键字列表获取id串
			if (sourceTypeDRs!="") sourceTypeDRs=sourceTypeDRs+",";
			sourceTypeDRs=sourceTypeDRs+keyObj[i].id;
		}
		initLifeInfo(sourceTypeDRs);
		$('#LifeInfoFind').webuiPopover('hide');  //弹框影藏
	});
///Creator: zx
///CreatDate: 2018-08-23
///Description: 生命周期加载样式控制
$('#LifeInfoFind').webuiPopover({width:255});

///Creator: zx
///CreatDate: 2018-08-23
///Description: 获取台账信息并加载
function fillData()
{
	var RowID=getElementValue("RowID");
	if (RowID=="") return;
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSEquip","GetOneEquip",RowID);
	jsonData=jQuery.parseJSON(jsonData);
	if (jsonData.SQLCODE<0) {messageShow('alert','error','提示',jsonData.Data,'','','');return;}
	setElementByJson(jsonData.Data); // hisui通用方法只能给input元素赋值,此方法被重写
	showFieldsTip(jsonData.Data); // 详细字段提示工具ToolTip
	showFundsTip(jsonData.Data);  // 资金来源信息tooltip
}

///Creator: zx
///CreatDate: 2018-08-23
///Description: 元素赋值
///Input: vJsonInfo 后台获取的json数据
///Other: 平台统一方法此处不适用
function setElementByJson(vJsonInfo)
{
	for (var key in vJsonInfo)
	{
		var str=getShortString(vJsonInfo[key]);
		if (key=="EQAdvanceDisFlagDesc") str=getShortString(vJsonInfo[key]+"("+vJsonInfo["EQHold1"]+")");
		$("#"+key).text(str);
		if((key=="EQComputerFlag")||(key=="EQCommonageFlag")||(key=="EQRaditionFlag"))
		{
			if (vJsonInfo[key]=="1") $("#"+key).text("是");
			else $("#"+key).text("否");
		}
		if((key=="EQGuaranteePeriodNum")&&(vJsonInfo["EQGuaranteePeriodNum"]!="")) $("#"+key).text(vJsonInfo[key]+"月");
		if(vJsonInfo["EQAddDepreMonths"]!="")
		{
			var AddDepreMonths=parseInt(vJsonInfo["EQAddDepreMonths"]);
			if(AddDepreMonths>0) $("#EQLimitYearsNum").text(vJsonInfo["EQLimitYearsNum"]+" (增"+AddDepreMonths+"月)");
			else $("#EQLimitYearsNum").text(vJsonInfo["EQLimitYearsNum"]+" (减"+AddDepreMonths+"月)");
		}
		//alert(vJsonInfo["EQHold1"])
		//if(vJsonInfo["EQHold1"]!="") $("#EQAdvanceDisFlagDesc").text(vJsonInfo["EQAdvanceDisFlagDesc"]+" （"+vJsonInfo["EQHold1"]+"）");
	}
	setElement("EQStatus",vJsonInfo.EQStatus)
	setElement("EQStatusDisplay",vJsonInfo.EQStatusDisplay)
}

///Creator: zx
///CreatDate: 2018-08-23
///Description: 根据字符长度截取过长信息并拼接"..."
///Input: string 需要截取的字符串
function getShortString(string)
{
	string=string.toString(); //部分int需要转为string
	var result = ""; //返回结果
	var j = 0;  //字节数作为控制参数
	for(var i = 0;i < string.length; i++){
		if(string.charCodeAt(i) > 255) //如果是汉字，则字符串长度加2
		{
			j+=2;
		}
		else  //数字或字母长度加1
		{
			j++;
		}
		if (j>12) return result+"..."; //设置最大可显示字节数为12,遍历超过这个值直接退出并返回结果
		result=result+string[i];
	}
	return result;
}

///Creator: zx
///CreatDate: 2018-08-24
///Description: 生命周期数据信息获取
function initLifeInfo(SourceTypeDRs)
{
	$.cm({
		ClassName:"web.DHCEQ.EM.BUSLifeInfo",
		QueryName:"LifeInfo",
		EquipDR:$("#RowID").val(),
		LocDR:"",
		EquipTypeDR:"",
		LifeTypeDR:"",
		StartDate:"",
		EndDate:"",
		SourceTypeDR:SourceTypeDRs,
		QXType:""
	},function(jsonData){
		createLifeInfo(jsonData);
	});
}

///Creator: zx
///CreatDate: 2018-08-24
///Description: 生命周期数据解析加载
///Input: 生命周期数据集
function createLifeInfo(jsonData)
{
	$("#LifeInfoView").empty(); //每次加载之前移除样式
	//按时间倒序,从最大值遍历
	for (var i=jsonData.rows.length-1;i>=0;i--)
	{
		var changeDate=jsonData.rows[i].TChangeDate; //变动日期
		var appendType=jsonData.rows[i].TAppendType;	//变动类型
		var sourceTypeDR=jsonData.rows[i].TSourceTypeDR;
		var sourceID=jsonData.rows[i].TSourceID;
		var usedFee=jsonData.rows[i].TUsedFee;
		var year=jsonData.rows[i].TYear;
		var keyInfo=jsonData.rows[i].TKeyInfo;
		
		var section="";
		var flag="";
		if(i==0) flag=1;
		if (curYear!=year)
		{
			curYear=year;
			section="eq-lifeinfo-lock.png^"+year;
		}
		var url='href="#" onclick="javascript:lifeInfoDetail('+sourceTypeDR+','+sourceID+')"';
		opt={
			id:'LifeInfoView',
			section:section,
			item:'^^'+changeDate+'%^'+url+'^'+appendType+':'+usedFee+'%^^'+keyInfo,
			lastFlag:flag
		}
		
		createTimeLine(opt);
	}
}

///Creator: zx
///CreatDate: 2018-08-24
///Description: 生命周期超链接点击
///Input: sourceTypeDR 业务代码  sourceID 业务id
function lifeInfoDetail(sourceType,sourceID)
{
	if (sourceType=="35")
	{
		messageShow('alert','info','提示','折旧无业务数据！','','','')
		return;
	}
	var url="dhceqlifeinfo.csp?&SourceType="+sourceType+"&SourceID="+sourceID;
	showWindow(url,"业务详情",1100,550,"icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-08-23
///Description: 页面相关信息左滑动按钮
$('#moveLeft').click(function(){
	moveView(1);
});

///Creator: zx
///CreatDate: 2018-08-23
///Description: 页面相关信息右滑动按钮
$('#moveRight').click(function(){
	moveView(2);
});

///Creator: zx
///CreatDate: 2018-08-23
///Description: 滑动控制,控制内部div显示影藏,滑动到底后禁止点击
///Input: type 滑动方向 1左 2右
function moveView(type)
{
	var arry=new Array();
	var arryView= new Array();
	var viewLen=0; //滑动内容模块数量
	var stopFlag=0; //是否停止此方向滑动
	$(".eq-card").each(function(index){
		viewLen=viewLen+1;
	 	if($(this).hasClass("eq-card-active")){arry.push(index)}; //当前可见内容模块放置数组arry中
	});
	if (type==1)
	{
		if (arry[0]-1<0) return;
		for(j=0,len=arry.length;j<len;j++) {
			arryView.push(arry[j]-1);  //左移时内容模块位置减一
			if (arry[j]-1==0) stopFlag=1; //存在最左内容模块在数组中时需要设置停止标志
		}
	}
	else
	{
		var len=arry.length;
		if (arry[len-1]+1>=viewLen) return;
		for(j=0;j<len;j++) {
			arryView.push(arry[j]+1); //右移时内容模块位置加一
			if (arry[j]+2>=viewLen) stopFlag=1; //存在最右内容模块在数组中时需要设置停止标志
		}
	}
	if(stopFlag==1)
	{
		//停止标志时相关按钮样式改变
		if(type==1)
		{
			$("#moveLeft").removeClass("eq-card-move");
		 	$("#moveLeft").addClass("eq-card-stop");
		}
		else
		{
			$("#moveRight").removeClass("eq-card-move");
		 	$("#moveRight").addClass("eq-card-stop");
		}
	}
	else
	{
		// 不存在停止时样式按钮恢复
		$("#moveLeft").addClass("eq-card-move");
		$("#moveLeft").removeClass("eq-card-stop");
		$("#moveRight").addClass("eq-card-move");
		$("#moveRight").removeClass("eq-card-stop");
	}
	//在可显示数组中时显示内容模块,其余做隐藏处理
	$(".eq-card").each(function(index){
		if (arryView.indexOf(index)==-1)
		{$(this).removeClass("eq-card-active");}
		else{$(this).addClass("eq-card-active");}
	});
}

///Creator: zx
///CreatDate: 2018-08-23
///Description filldata详细字段提示工具ToolTip
///Input: data 后台请求台账数据
function showFieldsTip(data)
{
	$(".eq-table-info").each(function(index){
		var id=$(this).attr("id");
		if (!id) return;  //占位元素不处理
		if ((id=="EQComputerFlag")||(id=="EQCommonageFlag")||(id=="EQRaditionFlag")) var stringDate=$("#"+id).text();
		else if (id=="EQAdvanceDisFlagDesc") var stringDate=data[id]+"("+data["EQHold1"]+")";
		else if (id=="EQLimitYearsNum") 
		{
			if (data["EQAddDepreMonths"]>0) var stringDate=data[id]+" (增"+data["EQAddDepreMonths"]+"月)";
			else if (data["EQAddDepreMonths"]<0) var stringDate=data[id]+" (减"+data["EQAddDepreMonths"]+"月)";
			else var stringDate=data[id];
		}
		else var stringDate=data[id];
		if (stringDate=="") return; //值为空元素不处理
		$HUI.tooltip('#'+id,{
			position: 'bottom',
			content: function(){
					return stringDate; //显示值从返回数据中获取
				},
			onShow: function(){
				$(this).tooltip('tip').css({
					backgroundColor: '#88a8c9',
					borderColor: '#4f75aa',
					boxShadow: '1px 1px 3px #4f75aa'
				});
			 },
			onPosition: function(){
				$(this).tooltip('tip').css('bottom', $(this).offset().bottom);
				$(this).tooltip('arrow').css('bottom', 20);
			}
		});
	});
}

///Creator: zx
///CreatDate: 2018-08-23
///Description 资金来源详细信息ToolTip
///Input: data 后台请求台账数据
function showFundsTip(data)
{
	var RowID=$("#RowID").val();
	//异步处理
	var jsonData = $.cm({
		ClassName:"web.DHCEQFunds",
		QueryName:"GetFunds",
		FromType:"1",
		FromID:RowID,
		FundsAmount:data["EQOriginalFee"]
	},false);
	$HUI.tooltip('#EQFunds',{
		position: 'bottom',
		content: function(){
			var content='<div style="padding:5px;font-size:16px;color:#ffffff"><ul>';
			for (var i=0;i<jsonData.rows.length;i++)
			{
				var TFundsTypeDR=jsonData.rows[i].TFundsTypeDR;
				var TFundsType=jsonData.rows[i].TFundsType;
				var TFee=jsonData.rows[i].TFee;
				if (TFundsTypeDR==data["EQSelfFundsFlag"]) continue;
				content=content+'<li>'+TFundsType+'：'+TFee+'</li>';
			}
			content=content+'</ul></div>';
			return content;
		},
		onShow: function(){
			$(this).tooltip('tip').css({
				backgroundColor: '#88a8c9',
				borderColor: '#4f75aa',
				boxShadow: '1px 1px 3px #4f75aa'
			});
		 },
		onPosition: function(){
			$(this).tooltip('tip').css('bottom', $(this).offset().bottom);
			$(this).tooltip('arrow').css('bottom', 20);
		}
	});
}

///Creator: zx
///CreatDate: 2018-08-24
///Description 台账信息编辑弹框
function equipEdit()
{
	var RowID=$("#RowID").val();
	var url="dhceq.em.equipedit.csp?RowID="+RowID;
	showWindow(url,"资产信息编辑",1000,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-09-20
///Description 台账底部信息显示
function initCardInfo()
{
	$cm({
		ClassName:"web.DHCEQ.EM.BUSEquip",
		MethodName:"EquipRelatedInfo",
		Type:"",
		EquipDR:getElementValue("RowID"),
		CheckListDR:""
	},function(jsonData){
		if (jsonData.SQLCODE<0) {messageShow('alert','error','提示',jsonData.Data,'','','');return;}
		$("#AffixNum").text("("+jsonData.Data["AffixNum"]+")");
		$("#PicNum").text("("+jsonData.Data["PicNum"]+")");
		$("#DocNum").text("("+jsonData.Data["DocNum"]+")");
		$("#ContractNum").text("("+jsonData.Data["ContractNum"]+")");
		$("#ConfigNum").text("("+jsonData.Data["ConfigNum"]+")");
		$("#EquipConfigNum").text("("+jsonData.Data["EquipConfigNum"]+")");
		$("#TreeNum").text("("+jsonData.Data["TreeNum"]+")");
		if(jsonData.Data["AffixInfo"]!="")
		{
			$("#AffixContent").empty();
			var data=jsonData.Data["AffixInfo"];
			var dataDetail=data.split("^");
			for(i=0;i<dataDetail.length;i++)
			{
				var dataItem=dataDetail[i].split("&");
				var nameText=dataItem[0];
				var numText=dataItem[1];
				var unit=dataItem[2];
				if (i>3)
				{
					$("#AffixMore").css('display','block');
					continue;
				}
				makeCardItemInfo("AffixContent",nameText,numText,unit)
			}
		}
		if(jsonData.Data["PicInfo"]!="")
		{
			$("#PicContent").empty();
			var data=jsonData.Data["PicInfo"];
			var dataDetail=data.split("^");
			for(i=0;i<dataDetail.length;i++)
			{
				var dataItem=dataDetail[i].split("&");
				var nameText=dataItem[0];
				var numText=dataItem[1];
				var unit=dataItem[2];
				if (i>3)
				{
					$("#PicMore").css('display','block');
					continue;
				}
				makeCardItemInfo("PicContent",nameText,numText,unit)
			}
		}
		if(jsonData.Data["DocInfo"]!="")
		{
			$("#DocContent").empty();
			var data=jsonData.Data["DocInfo"];
			var dataDetail=data.split("^");
			for(i=0;i<dataDetail.length;i++)
			{
				var dataItem=dataDetail[i].split("&");
				var nameText=dataItem[0];
				var numText=dataItem[1];
				var unit=dataItem[2];
				if (i>3)
				{
					$("#DocMore").css('display','block');
					continue;
				}
				makeCardItemInfo("DocContent",nameText,numText,unit)
			}
		}
		if(jsonData.Data["ContractInfo"]!="")
		{
			$("#ContractContent").empty();
			var data=jsonData.Data["ContractInfo"];
			var dataDetail=data.split("^");
			for(i=0;i<dataDetail.length;i++)
			{
				var dataItem=dataDetail[i].split("&");
				var nameText=dataItem[0];
				var numText=dataItem[1];
				var linkID=dataItem[2];
				if (i>3)
				{
					$("#ContractMore").css('display','block');
					continue;
				}
				makeContractDetailInfo("ContractContent",nameText,numText,linkID);
			}
		}
		if(jsonData.Data["ConfigInfo"]!="")
		{
			$("#ConfigContent").empty();
			var data=jsonData.Data["ConfigInfo"];
			var dataDetail=data.split("^");
			for(i=0;i<dataDetail.length;i++)
			{
				var dataItem=dataDetail[i].split("&");
				var nameText=dataItem[0];
				var numText=dataItem[1];
				if (i>3)
				{
					$("#ConfigMore").css('display','block');
					continue;
				}
				makeCardItemInfo("ConfigContent",nameText,numText,"")
			}
		}
		if(jsonData.Data["EquipConfigInfo"]!="")
		{
			$("#EquipConfigContent").empty();
			var data=jsonData.Data["EquipConfigInfo"];
			var dataDetail=data.split("^");
			for(i=0;i<dataDetail.length;i++)
			{
				var dataItem=dataDetail[i].split("&");
				var nameText=dataItem[0];
				var numText=dataItem[1];
				if (i>3)
				{
					$("#EquipConfigMore").css('display','block');
					continue;
				}
				makeCardItemInfo("EquipConfigContent",nameText,numText,"")
			}
		}
		if(jsonData.Data["TreeInfo"]!="")
		{
			$("#TreeContent").empty();
			var data=jsonData.Data["TreeInfo"];
			var dataDetail=data.split("^");
			for(i=0;i<dataDetail.length;i++)
			{
				var dataItem=dataDetail[i].split("&");
				var nameText=dataItem[0];
				var numText=dataItem[1];
				if (i>3)
				{
					$("#TreeMore").css('display','block');
					continue;
				}
				makeCardItemInfo("TreeContent",nameText,numText,"")
			}
		}
	});
}

function makeCardItemInfo(id,nameText,numText,unit)
{
	var html='<div class="eq-card-item"><span class="eq-card-item-text">'+nameText+'</span><span class="eq-card-item-num">'+numText+unit+'</span></div>';
	$("#"+id).append(html);
}

function makeContractDetailInfo(id,nameText,numText,linkID)
{
	var html='<div class="eq-card-item"><span class="eq-card-item-text"><a href="#" onclick="javascript:contractDetail('+linkID+')">'+nameText+'</a></span><span class="eq-card-item-num">'+numText+'</span></div>';
	$("#"+id).append(html);
}

function contractDetail(linkID)
{
	var val="&RowID="+linkID+"&Type=1&QXType=1&ContractType=1";
	var url="dhceq.con.contract.csp?"+val;
	showWindow(url,"合同信息",1000,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-08-24
///Description 调账弹出框
function changeAccount()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var url="dhceqchangeaccount.csp?RowID="+RowID+"&ReadOnly="+ReadOnly;
	showWindow(url,"调账信息",1200,"96%","icon-w-paper","modal");  //modify by lmm 2018-12-10 771499
}

///Creator: zx
///CreatDate: 2018-09-13
///Description 设备启用弹出框
function equipStart()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var Status=getElementValue("EQStatus");
	if (Status<"2")
	{
		ReadOnly=1;
	}
	var StatusDisplay=getElementValue("EQStatusDisplay");
	var url='websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQEquipStart&EquipID='+RowID+"&ReadOnly="+ReadOnly+"&FromStatusDR="+Status+"&FromStatus="+StatusDisplay+"&StartFlag=Y";
	showWindow(url,"资产启用",1100,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-09-13
///Description 设备停用弹出框
function equipStop()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var Status=getElementValue("EQStatus");
	if (Status=="2")
	{
		ReadOnly=1;
	}
	var StatusDisplay=getElementValue("EQStatusDisplay");
	var url='websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQEquipStop&EquipID='+RowID+"&ReadOnly="+ReadOnly+"&FromStatusDR="+Status+"&FromStatus="+StatusDisplay+"&StopFlag=Y";
	showWindow(url,"资产停用",1100,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-09-13
///Description 设备报修弹出框
function maintRequest()
{
	//modified by csj 20190125 
	var RowID=getElementValue("RowID");
	var url="dhceq.em.mmaintrequestsimple.csp?ExObjDR="+RowID+"&QXType=&WaitAD=off&Status=0&RequestLocDR="+curLocID+"&StartDate=&EndDate=&InvalidFlag=N&vData=^Action=^SubFlag=&LocFlag="+curLocID;
	showWindow(url,"维修申请",1000,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-09-13
///Description 设备计量记录弹出框
function meterage()
{
	var RowID=getElementValue("RowID");
	var url="dhceq.em.meterage.csp?BussType=3&EquipDR="+RowID+"&RowID=";
	showWindow(url,"计量记录",1000,"80%","icon-w-paper","modal");
	
}

///Creator: zx
///CreatDate: 2018-09-13
///Description 设备巡检记录弹出框
function inspect()
{
	var RowID=getElementValue("RowID");
	var url="dhceq.em.inspect.csp?BussType=2&EquipDR="+RowID+"&RowID=";
	showWindow(url,"检查记录",1000,"80%","icon-w-paper","modal");
}

function returnRequest()
{
	//modified by csj 20190125 
	var RowID=getElementValue("RowID");
	url="dhceq.em.return.csp?EquipDR="+RowID+"&ROutTypeDR=1&WaitAD=off&QXType=2";
	showWindow(url,"资产退货",1150,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-09-13
///Description 设备报废弹出框
function disuseRequest()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var url='websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQBatchDisuseRequest&DType=1&Type=0&EquipDR='+RowID+"&RequestLocDR="+curLocID+"&ReadOnly="+ReadOnly; //session值需要替换
	showWindow(url,"资产报废",1000,"96%","icon-w-paper","modal");
	
}

///Creator: zx
///CreatDate: 2018-08-29
///Description 附件编辑弹出框
function affixEdit()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var url='websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQAffix&EquipDR='+RowID+"&ReadOnly="+ReadOnly;
	showWindow(url,"设备附件",1100,"96%","icon-w-paper","modal");  //modify by lmm 2018-12-10 771534
}

///Creator: zx
///CreatDate: 2018-08-29
///Description 图片资料编辑弹出框
function picEdit()
{
	var RowID=getElementValue("RowID");
	var url='dhceq.process.picturemenu.csp?&CurrentSourceType=52&CurrentSourceID='+RowID+'&EquipDR='+RowID;
	showWindow(url,"图片资料",1000,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-08-29
///Description 相关文件编辑弹出框
function docEdit()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var url='websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQDoc&EquipDR='+RowID+"&ReadOnly="+ReadOnly;
	showWindow(url,"相关文件",1000,"96%","icon-w-paper","modal");
}

///Modify: Mozy		770799
///CreatDate: 2018-12-18
///Description 保修合同编辑弹框
function contractEdit()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var url="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQContractMaintEquipList&ContractType=1&QXType=1&EquipDR="+RowID;
	showWindow(url,"保修合同","70%","70%","icon-w-paper","modal");
}

///Modify: Mozy
///ModifyDate: 2018-11-25
///Description 设备配置编辑弹出框
function configEdit()
{
	var RowID=getElementValue("RowID");
	var url='dhceq.em.config.csp?&Flag=1&ReadOnly=1&SourceType=2&SourceID='+RowID;
	showWindow(url,"设备配置",1000,"96%","icon-w-paper","modal");
}

///Creator: Mozy
///CreatDate: 2018-11-25
///Description 附属设备弹出框
function equipconfigEdit()
{
	var RowID=getElementValue("RowID");
	var url='dhceq.em.equipconfiginfo.csp?&EquipDR='+RowID;
	showWindow(url,"附属设备",1000,"96%","icon-w-paper","modal");
}

///Description 设备树编辑弹出框
function treeEdit()
{
	var RowID=getElementValue("RowID");
	var url='dhceqassociated.csp?ParEquipDR='+RowID;
	showWindow(url,"设备树",1000,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-08-29
///Description 图片加载
function initImage()
{
	var RowID=getElementValue("RowID");
	$.m({
			ClassName:"web.DHCEQ.Plat.LIBPicture",
			MethodName:"GetPictureByEquip",
			RowID:RowID
		},function(data){
		if(data!="")
		{
			var imageUrl="web.DHCEQ.Lib.DHCEQStreamServer.cls?PICLISTROWID="+data;
			$("#Image").attr("src",imageUrl);
			$("#Image").css("display","block");
			$("#DefaultImage").css("display","none");
		}
	});
}

/// Excel打印PrintFlag==0,润乾打印PrintFlag==1
function printCard()
{
	var RowID=getElementValue("RowID");	
    var PrintFlag=getElementValue("PrintFlag");
    if ((RowID=="")||(RowID<1))	return;
    
    if(PrintFlag==0)
	{
	    PrintEQCard(RowID); //add by zx 2018-12-18 打印调用
	}
	if(PrintFlag==1)
	{
        var d=new Date()
        var day=d.getDate()
        var month=d.getMonth() + 1
        var year=d.getFullYear()
        var CurrentDate = year + "-" + month + "-" + day

      fileName="DHCEQCardPrint.raq&RowId="+RowID ;
	  DHCCPM_RQPrint(fileName);   	
    }
}

/// 增加系统参数控制润乾打印
function printCardVerso()
{
	var PrintFlag=getElementValue("PrintFlag");
	var RowID=getElementValue("RowID");	
	if ((RowID=="")||(RowID<1))	return;
	 
    if(PrintFlag==0)
	{
	    PrintEQCardVerso(RowID);  //add by zx 2018-12-18 打印调用
	}
	if(PrintFlag==1)
	{
		fileName="DHCEQCardVersoPrint.raq&RowID="+RowID ;
		DHCCPM_RQPrint(fileName);  
	}		
}