var curYear=""; //��¼������������ʱ���޽ڵ�
$(function(){
	initDocument();
});

function initDocument(){
	//�ۺϲ�ѯʱӰ�ر༭��ť
	if (getElementValue("ReadOnly")==1) {$('#EquipInfo').layout('panel', 'center').panel({ title: '��Ϣ����' });}
	//����ͷ����ť
	if(getElementValue("ToolBarFlag")!=1){$("#EquipShow").layout('remove','north');}
	//����������Ϣ�鿴
	if(getElementValue("DetailListFlag")!=1)
	{
		$("#EquipCard").layout('remove','center');
		$("#LifeInfoFind").hide();
	}
	else {initCardInfo();}
	//������������
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
///Description: ��������ɸѡ��ؼ��ּ���
function lifeInfoKeywords()
{
	$("#LifeInfoItemDetail").keywords({
	    items:[
	        {
	            text:"",
	            type:"chapter", //��
	            items:[
	                {
	                    text:'������Ϣ',
	                    type:"section", //��
	                    items:[
	                        {text:'����',id:"91",selected:true},{text:'�ƻ�',id:"92",selected:true},{text:'��ͬ',id:'94',selected:true},{text:'����',id:'11',selected:true}
	                    ]
	                },
	                {
	                    text:"�ⷿ�䶯",
	                    type:'section', //��
	                    items:[
	                        {text:'���',id:"21",selected:true},{text:'ת��',id:"22",selected:true}
	                    ]
	                },
	                {
	                    text:"ά����Ϣ",
	                    type:'section', //��
	                    items:[
	                        {text:'ά��',id:"31",selected:true},{text:'����',id:"72-1",selected:true},{text:'Ѳ��',id:'73',selected:true},{text:'����',id:'71',selected:true}
	                    ]
	                },
	                {
	                    text:"������Ϣ",
	                    type:'section', //��
	                    items:[
	                        {text:'����',id:"34",selected:true},{text:'�˻�������',id:'23',selected:true}
	                    ]
	                },
	                {
	                    text:"������Ϣ",
	                    type:'section', //��
	                    items:[
	                        {text:'�۾�',id:"35",selected:true},{text:'����',id:"51",selected:true},{text:'���ü�ͣ��',id:'41',selected:true}
	                    ]
	                }
	            ]
	        }
	    ],
	});
	
}

///Creator: zx
///CreatDate: 2018-08-23
//��ť���¼�
$("#LifeInfoSeach").click(function(){
		curYear="";
		var keyObj=$HUI.keywords("#LifeInfoItemDetail").getSelected();
		var sourceTypeDRs="";
		for (i=0;i<keyObj.length;i++)
		{
			//�ؼ����б��ȡid��
			if (sourceTypeDRs!="") sourceTypeDRs=sourceTypeDRs+",";
			sourceTypeDRs=sourceTypeDRs+keyObj[i].id;
		}
		initLifeInfo(sourceTypeDRs);
		$('#LifeInfoFind').webuiPopover('hide');  //����Ӱ��
	});
///Creator: zx
///CreatDate: 2018-08-23
///Description: �������ڼ�����ʽ����
$('#LifeInfoFind').webuiPopover({width:255});

///Creator: zx
///CreatDate: 2018-08-23
///Description: ��ȡ̨����Ϣ������
function fillData()
{
	var RowID=getElementValue("RowID");
	if (RowID=="") return;
	var jsonData=tkMakeServerCall("web.DHCEQ.EM.BUSEquip","GetOneEquip",RowID);
	jsonData=jQuery.parseJSON(jsonData);
	if (jsonData.SQLCODE<0) {messageShow('alert','error','��ʾ',jsonData.Data,'','','');return;}
	setElementByJson(jsonData.Data); // hisuiͨ�÷���ֻ�ܸ�inputԪ�ظ�ֵ,�˷�������д
	showFieldsTip(jsonData.Data); // ��ϸ�ֶ���ʾ����ToolTip
	showFundsTip(jsonData.Data);  // �ʽ���Դ��Ϣtooltip
}

///Creator: zx
///CreatDate: 2018-08-23
///Description: Ԫ�ظ�ֵ
///Input: vJsonInfo ��̨��ȡ��json����
///Other: ƽ̨ͳһ�����˴�������
function setElementByJson(vJsonInfo)
{
	for (var key in vJsonInfo)
	{
		var str=getShortString(vJsonInfo[key]);
		if (key=="EQAdvanceDisFlagDesc") str=getShortString(vJsonInfo[key]+"("+vJsonInfo["EQHold1"]+")");
		$("#"+key).text(str);
		if((key=="EQComputerFlag")||(key=="EQCommonageFlag")||(key=="EQRaditionFlag"))
		{
			if (vJsonInfo[key]=="1") $("#"+key).text("��");
			else $("#"+key).text("��");
		}
		if((key=="EQGuaranteePeriodNum")&&(vJsonInfo["EQGuaranteePeriodNum"]!="")) $("#"+key).text(vJsonInfo[key]+"��");
		if(vJsonInfo["EQAddDepreMonths"]!="")
		{
			var AddDepreMonths=parseInt(vJsonInfo["EQAddDepreMonths"]);
			if(AddDepreMonths>0) $("#EQLimitYearsNum").text(vJsonInfo["EQLimitYearsNum"]+" (��"+AddDepreMonths+"��)");
			else $("#EQLimitYearsNum").text(vJsonInfo["EQLimitYearsNum"]+" (��"+AddDepreMonths+"��)");
		}
		//alert(vJsonInfo["EQHold1"])
		//if(vJsonInfo["EQHold1"]!="") $("#EQAdvanceDisFlagDesc").text(vJsonInfo["EQAdvanceDisFlagDesc"]+" ��"+vJsonInfo["EQHold1"]+"��");
	}
	setElement("EQStatus",vJsonInfo.EQStatus)
	setElement("EQStatusDisplay",vJsonInfo.EQStatusDisplay)
}

///Creator: zx
///CreatDate: 2018-08-23
///Description: �����ַ����Ƚ�ȡ������Ϣ��ƴ��"..."
///Input: string ��Ҫ��ȡ���ַ���
function getShortString(string)
{
	string=string.toString(); //����int��ҪתΪstring
	var result = ""; //���ؽ��
	var j = 0;  //�ֽ�����Ϊ���Ʋ���
	for(var i = 0;i < string.length; i++){
		if(string.charCodeAt(i) > 255) //����Ǻ��֣����ַ������ȼ�2
		{
			j+=2;
		}
		else  //���ֻ���ĸ���ȼ�1
		{
			j++;
		}
		if (j>12) return result+"..."; //����������ʾ�ֽ���Ϊ12,�����������ֱֵ���˳������ؽ��
		result=result+string[i];
	}
	return result;
}

///Creator: zx
///CreatDate: 2018-08-24
///Description: ��������������Ϣ��ȡ
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
///Description: �����������ݽ�������
///Input: �����������ݼ�
function createLifeInfo(jsonData)
{
	$("#LifeInfoView").empty(); //ÿ�μ���֮ǰ�Ƴ���ʽ
	//��ʱ�䵹��,�����ֵ����
	for (var i=jsonData.rows.length-1;i>=0;i--)
	{
		var changeDate=jsonData.rows[i].TChangeDate; //�䶯����
		var appendType=jsonData.rows[i].TAppendType;	//�䶯����
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
///Description: �������ڳ����ӵ��
///Input: sourceTypeDR ҵ�����  sourceID ҵ��id
function lifeInfoDetail(sourceType,sourceID)
{
	if (sourceType=="35")
	{
		messageShow('alert','info','��ʾ','�۾���ҵ�����ݣ�','','','')
		return;
	}
	var url="dhceqlifeinfo.csp?&SourceType="+sourceType+"&SourceID="+sourceID;
	showWindow(url,"ҵ������",1100,550,"icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-08-23
///Description: ҳ�������Ϣ�󻬶���ť
$('#moveLeft').click(function(){
	moveView(1);
});

///Creator: zx
///CreatDate: 2018-08-23
///Description: ҳ�������Ϣ�һ�����ť
$('#moveRight').click(function(){
	moveView(2);
});

///Creator: zx
///CreatDate: 2018-08-23
///Description: ��������,�����ڲ�div��ʾӰ��,�������׺��ֹ���
///Input: type �������� 1�� 2��
function moveView(type)
{
	var arry=new Array();
	var arryView= new Array();
	var viewLen=0; //��������ģ������
	var stopFlag=0; //�Ƿ�ֹͣ�˷��򻬶�
	$(".eq-card").each(function(index){
		viewLen=viewLen+1;
	 	if($(this).hasClass("eq-card-active")){arry.push(index)}; //��ǰ�ɼ�����ģ���������arry��
	});
	if (type==1)
	{
		if (arry[0]-1<0) return;
		for(j=0,len=arry.length;j<len;j++) {
			arryView.push(arry[j]-1);  //����ʱ����ģ��λ�ü�һ
			if (arry[j]-1==0) stopFlag=1; //������������ģ����������ʱ��Ҫ����ֹͣ��־
		}
	}
	else
	{
		var len=arry.length;
		if (arry[len-1]+1>=viewLen) return;
		for(j=0;j<len;j++) {
			arryView.push(arry[j]+1); //����ʱ����ģ��λ�ü�һ
			if (arry[j]+2>=viewLen) stopFlag=1; //������������ģ����������ʱ��Ҫ����ֹͣ��־
		}
	}
	if(stopFlag==1)
	{
		//ֹͣ��־ʱ��ذ�ť��ʽ�ı�
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
		// ������ֹͣʱ��ʽ��ť�ָ�
		$("#moveLeft").addClass("eq-card-move");
		$("#moveLeft").removeClass("eq-card-stop");
		$("#moveRight").addClass("eq-card-move");
		$("#moveRight").removeClass("eq-card-stop");
	}
	//�ڿ���ʾ������ʱ��ʾ����ģ��,���������ش���
	$(".eq-card").each(function(index){
		if (arryView.indexOf(index)==-1)
		{$(this).removeClass("eq-card-active");}
		else{$(this).addClass("eq-card-active");}
	});
}

///Creator: zx
///CreatDate: 2018-08-23
///Description filldata��ϸ�ֶ���ʾ����ToolTip
///Input: data ��̨����̨������
function showFieldsTip(data)
{
	$(".eq-table-info").each(function(index){
		var id=$(this).attr("id");
		if (!id) return;  //ռλԪ�ز�����
		if ((id=="EQComputerFlag")||(id=="EQCommonageFlag")||(id=="EQRaditionFlag")) var stringDate=$("#"+id).text();
		else if (id=="EQAdvanceDisFlagDesc") var stringDate=data[id]+"("+data["EQHold1"]+")";
		else if (id=="EQLimitYearsNum") 
		{
			if (data["EQAddDepreMonths"]>0) var stringDate=data[id]+" (��"+data["EQAddDepreMonths"]+"��)";
			else if (data["EQAddDepreMonths"]<0) var stringDate=data[id]+" (��"+data["EQAddDepreMonths"]+"��)";
			else var stringDate=data[id];
		}
		else var stringDate=data[id];
		if (stringDate=="") return; //ֵΪ��Ԫ�ز�����
		$HUI.tooltip('#'+id,{
			position: 'bottom',
			content: function(){
					return stringDate; //��ʾֵ�ӷ��������л�ȡ
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
///Description �ʽ���Դ��ϸ��ϢToolTip
///Input: data ��̨����̨������
function showFundsTip(data)
{
	var RowID=$("#RowID").val();
	//�첽����
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
				content=content+'<li>'+TFundsType+'��'+TFee+'</li>';
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
///Description ̨����Ϣ�༭����
function equipEdit()
{
	var RowID=$("#RowID").val();
	var url="dhceq.em.equipedit.csp?RowID="+RowID;
	showWindow(url,"�ʲ���Ϣ�༭",1000,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-09-20
///Description ̨�˵ײ���Ϣ��ʾ
function initCardInfo()
{
	$cm({
		ClassName:"web.DHCEQ.EM.BUSEquip",
		MethodName:"EquipRelatedInfo",
		Type:"",
		EquipDR:getElementValue("RowID"),
		CheckListDR:""
	},function(jsonData){
		if (jsonData.SQLCODE<0) {messageShow('alert','error','��ʾ',jsonData.Data,'','','');return;}
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
	showWindow(url,"��ͬ��Ϣ",1000,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-08-24
///Description ���˵�����
function changeAccount()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var url="dhceqchangeaccount.csp?RowID="+RowID+"&ReadOnly="+ReadOnly;
	showWindow(url,"������Ϣ",1200,"96%","icon-w-paper","modal");  //modify by lmm 2018-12-10 771499
}

///Creator: zx
///CreatDate: 2018-09-13
///Description �豸���õ�����
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
	showWindow(url,"�ʲ�����",1100,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-09-13
///Description �豸ͣ�õ�����
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
	showWindow(url,"�ʲ�ͣ��",1100,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-09-13
///Description �豸���޵�����
function maintRequest()
{
	//modified by csj 20190125 
	var RowID=getElementValue("RowID");
	var url="dhceq.em.mmaintrequestsimple.csp?ExObjDR="+RowID+"&QXType=&WaitAD=off&Status=0&RequestLocDR="+curLocID+"&StartDate=&EndDate=&InvalidFlag=N&vData=^Action=^SubFlag=&LocFlag="+curLocID;
	showWindow(url,"ά������",1000,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-09-13
///Description �豸������¼������
function meterage()
{
	var RowID=getElementValue("RowID");
	var url="dhceq.em.meterage.csp?BussType=3&EquipDR="+RowID+"&RowID=";
	showWindow(url,"������¼",1000,"80%","icon-w-paper","modal");
	
}

///Creator: zx
///CreatDate: 2018-09-13
///Description �豸Ѳ���¼������
function inspect()
{
	var RowID=getElementValue("RowID");
	var url="dhceq.em.inspect.csp?BussType=2&EquipDR="+RowID+"&RowID=";
	showWindow(url,"����¼",1000,"80%","icon-w-paper","modal");
}

function returnRequest()
{
	//modified by csj 20190125 
	var RowID=getElementValue("RowID");
	url="dhceq.em.return.csp?EquipDR="+RowID+"&ROutTypeDR=1&WaitAD=off&QXType=2";
	showWindow(url,"�ʲ��˻�",1150,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-09-13
///Description �豸���ϵ�����
function disuseRequest()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var url='websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQBatchDisuseRequest&DType=1&Type=0&EquipDR='+RowID+"&RequestLocDR="+curLocID+"&ReadOnly="+ReadOnly; //sessionֵ��Ҫ�滻
	showWindow(url,"�ʲ�����",1000,"96%","icon-w-paper","modal");
	
}

///Creator: zx
///CreatDate: 2018-08-29
///Description �����༭������
function affixEdit()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var url='websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQAffix&EquipDR='+RowID+"&ReadOnly="+ReadOnly;
	showWindow(url,"�豸����",1100,"96%","icon-w-paper","modal");  //modify by lmm 2018-12-10 771534
}

///Creator: zx
///CreatDate: 2018-08-29
///Description ͼƬ���ϱ༭������
function picEdit()
{
	var RowID=getElementValue("RowID");
	var url='dhceq.process.picturemenu.csp?&CurrentSourceType=52&CurrentSourceID='+RowID+'&EquipDR='+RowID;
	showWindow(url,"ͼƬ����",1000,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-08-29
///Description ����ļ��༭������
function docEdit()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var url='websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQDoc&EquipDR='+RowID+"&ReadOnly="+ReadOnly;
	showWindow(url,"����ļ�",1000,"96%","icon-w-paper","modal");
}

///Modify: Mozy		770799
///CreatDate: 2018-12-18
///Description ���޺�ͬ�༭����
function contractEdit()
{
	var RowID=getElementValue("RowID");
	var ReadOnly=getElementValue("ReadOnly");
	var url="websys.default.hisui.csp?WEBSYS.TCOMPONENT=DHCEQContractMaintEquipList&ContractType=1&QXType=1&EquipDR="+RowID;
	showWindow(url,"���޺�ͬ","70%","70%","icon-w-paper","modal");
}

///Modify: Mozy
///ModifyDate: 2018-11-25
///Description �豸���ñ༭������
function configEdit()
{
	var RowID=getElementValue("RowID");
	var url='dhceq.em.config.csp?&Flag=1&ReadOnly=1&SourceType=2&SourceID='+RowID;
	showWindow(url,"�豸����",1000,"96%","icon-w-paper","modal");
}

///Creator: Mozy
///CreatDate: 2018-11-25
///Description �����豸������
function equipconfigEdit()
{
	var RowID=getElementValue("RowID");
	var url='dhceq.em.equipconfiginfo.csp?&EquipDR='+RowID;
	showWindow(url,"�����豸",1000,"96%","icon-w-paper","modal");
}

///Description �豸���༭������
function treeEdit()
{
	var RowID=getElementValue("RowID");
	var url='dhceqassociated.csp?ParEquipDR='+RowID;
	showWindow(url,"�豸��",1000,"96%","icon-w-paper","modal");
}

///Creator: zx
///CreatDate: 2018-08-29
///Description ͼƬ����
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

/// Excel��ӡPrintFlag==0,��Ǭ��ӡPrintFlag==1
function printCard()
{
	var RowID=getElementValue("RowID");	
    var PrintFlag=getElementValue("PrintFlag");
    if ((RowID=="")||(RowID<1))	return;
    
    if(PrintFlag==0)
	{
	    PrintEQCard(RowID); //add by zx 2018-12-18 ��ӡ����
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

/// ����ϵͳ����������Ǭ��ӡ
function printCardVerso()
{
	var PrintFlag=getElementValue("PrintFlag");
	var RowID=getElementValue("RowID");	
	if ((RowID=="")||(RowID<1))	return;
	 
    if(PrintFlag==0)
	{
	    PrintEQCardVerso(RowID);  //add by zx 2018-12-18 ��ӡ����
	}
	if(PrintFlag==1)
	{
		fileName="DHCEQCardVersoPrint.raq&RowID="+RowID ;
		DHCCPM_RQPrint(fileName);  
	}		
}