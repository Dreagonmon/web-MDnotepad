/*添加窗口加载方法*/
function addWindowLoadEvent(func) {
	var oldonload = window.onload;
	if(typeof window.onload != "function") {
		window.onload = func;
	} else {
		window.onload = function() {
			oldonload();
			func();
		}
	}
}

/*生成编辑器*/
var mde;
function init(){
	mde = new SimpleMDE({
		element: $("#me_editor")[0],
		spellChecker: false,
		tabSize: 4,
		status: false,
		indentWithTabs: false,
		autofocus: true,
		toolbar: [{
				name: "bold",
				action: SimpleMDE.toggleBold,
				className: "fa fa-bold",
				title: "Bold",
			},
			{
				name: "italic",
				action: SimpleMDE.toggleItalic,
				className: "fa fa-italic",
				title: "Italic",
			},
			{
				name: "heading",
				action: SimpleMDE.toggleHeadingSmaller,
				className: "fa fa-header",
				title: "Heading",
			},
			"|",
			{
				name: "horizontal-rule",
				action: SimpleMDE.drawHorizontalRule,
				className: "fa fa-minus",
				title: "Insert Horizontal Line",
			},
			{
				name: "strikethrough",
				action: SimpleMDE.toggleStrikethrough,
				className: "fa fa-strikethrough",
				title: "Strikethrough",
			},
			{
				name: "code",
				action: SimpleMDE.toggleCodeBlock,
				className: "fa fa-code",
				title: "Code",
			},
			{
				name: "quote",
				action: SimpleMDE.toggleBlockquote,
				className: "fa fa-quote-left",
				title: "Quote",
			},
			"|",
			{
				name: "preview",
				action: SimpleMDE.togglePreview,
				className: "fa fa-eye no-disable",
				title: "Preview",
			},
			{
				name: "guide",
				action: "Markdown Guide.html",
				className: "fa fa-question-circle",
				title: "Markdown Guide",
			},
		],
		shortcuts: {
			"toggleSideBySide":null,
			"toggleFullScreen":null,
		}
	});
	if (localStorage.getItem("lastSave")!=undefined){
		mde.value(localStorage.getItem("lastSave"));
	}
	if (localStorage.getItem("lastCoding")!=undefined){
		$("#me_decoding")[0].value = localStorage.getItem("lastCoding");
	}
	if (localStorage.getItem("lastName")!=undefined){
		$("#me_filename")[0].value = localStorage.getItem("lastName");
		changedTitle();
	}
	if (localStorage.getItem("lastTheme")!=undefined){
		$("body")[0].className = localStorage.getItem("lastTheme");
	}
	$(".me_menuclass").click(toggleMenu);
	window.onresize = adjust;
    window.onbeforeunload = autosave;
	document.body.onblur = autosave;
	document.onkeydown = multiKey;
	adjust();
}
/*调整页面元素大小*/
function adjust(){
	menubarOffset = $(".me_menubar").height();
	toolbarOffset = $(".editor-toolbar").height();
	$("#me_toast_frame")[0].style.top = (menubarOffset+toolbarOffset) + "px";
	$("#me_toast_frame")[0].style.display = "none";
	$(".CodeMirror")[0].style.top = (menubarOffset+toolbarOffset) + "px";
}
/*弹出菜单事件*/
function toggleMenu(){
	mlist = $(this).children(".me_menulist")[0];
	if (mlist.style.display != "block"){
		mlist.style.display = "block";
	}else {
		mlist.style.display = "none";
	}
}
/*浮动通知框*/
function toast(msg){
	$("#me_toast_text")[0].innerText = msg;
	$("#me_toast_frame")[0].style.display = "block";
	setTimeout(function(){$("#me_toast_frame")[0].style.display = "none";},2000);
}
addWindowLoadEvent(init);
/*自动存档事件*/
function autosave(){
	localStorage.setItem("lastSave",mde.value());
	localStorage.setItem("lastCoding",$("#me_decoding")[0].value);
	localStorage.setItem("lastName",$("#me_filename")[0].value);
	localStorage.setItem("lastTheme",$("body")[0].className);
}
/*自动改变标题*/
function changedTitle(){
	document.title = $("#me_filename")[0].value;
}
//自定义快捷键
function multiKey(e){
	ctrlKey = e.ctrlKey || e.metaKey;
	//Ctrl + S Save
	if (ctrlKey && e.keyCode == 83){
		e.preventDefault();
		e.returnValue = false;
		mtmpsave();
	}
}

//菜单方法
res_str_newfname = "新建文本文档.md";
res_str_ifwinn = "是否保存为Windows格式的换行符?";
res_str_ifstmp = "是否临时保存文本? 当前临时保存的文本将会被覆盖!";
res_str_ifltmp = "是否加载临时保存的文本? 当前修改不会被保存!";
res_str_ifropen = "是否重新加载最后打开的文件? 当前修改不会被保存!\n\n注意!!!\n不是重载临时保存的文本!";
res_str_ifopen = "是否打开新文件? 当前修改不会被保存!";
res_str_ifcnew = "是否创建新文件? 当前修改不会被保存!";
res_str_icoding = "请输入自定义的编码名称:";
res_str_winname = "Markdown编辑器";
res_str_cantreopen = "未选择过文件，无法重新打开!";
res_str_loads = "加载成功!";
res_str_saves = "保存成功!";
/*新建文本*/
function mnew(){
	if (confirm(res_str_ifcnew)){
		mde.value("");
		$("#me_filename")[0].value = res_str_newfname;
		changedTitle();
	}
}
/*读取本地文件*/
var readyToRead = false;
function onFileSelected(){
	if (readyToRead){
		readyToRead = false;
		fr = new FileReader();
		fr.onload = onFileReaded;
		fr.readAsText($(this)[0].files[0],$("#me_decoding")[0].value);
		//如果文件后缀名是.md，则标题不显示后缀
		fname = $(this)[0].files[0].name;
		fext = fname.substr(fname.length-3,3);
		if (fext.toLowerCase() == ".md")
			$("#me_filename")[0].value = fname.substr(0,fname.length-3);
		else
			$("#me_filename")[0].value = fname;
		changedTitle();
	}
}
function onFileReaded(){
	mde.value(this.result);
}
function mopen(){
	if (mde.value()==""||confirm(res_str_ifopen)){
		$("#me_selectfile").change(onFileSelected);
		$("#me_selectfile").click();
		readyToRead = true;
	}
}
/*重新打开文件*/
function mreopen(){
	file = $("#me_selectfile")[0].files[0];
	if (file == undefined){
		toast(res_str_cantreopen);
	}
	if (file != undefined && confirm(res_str_ifropen)){
		fr = new FileReader();
		fr.onload = onFileReaded;
		fr.readAsText(file,$("#me_decoding")[0].value);
		$("#me_filename")[0].value = file.name;
		changedTitle();
	}
}
/*临时保存*/
function mtmpsave(){
	localStorage.setItem("tmpSave",mde.value());
	localStorage.setItem("tmpCoding",$("#me_decoding")[0].value);
	localStorage.setItem("tmpName",$("#me_filename")[0].value);
	toast(res_str_saves);
}
/*读取临时保存*/
function mtmpload(){
	if (localStorage.getItem("tmpSave")!=undefined){
		mde.value(localStorage.getItem("tmpSave"));
	}
	if (localStorage.getItem("tmpCoding")!=undefined){
		$("#me_decoding")[0].value = localStorage.getItem("tmpCoding");
	}
	if (localStorage.getItem("tmpName")!=undefined){
		$("#me_filename")[0].value = localStorage.getItem("tmpName");
		changedTitle();
	}
	toast(res_str_loads);
}
/*撤消，重做*/
function mundo(){
	mde.undo();
}
function mredo(){
	mde.redo();
}
/*设置编码*/
function mdecoding(coding){
	oldcoding = $("#me_decoding")[0].value;
	$("#me_decoding")[0].value = coding;
}
function minputdecoding(){
	coding = prompt(res_str_icoding);
	if (coding!=null && coding!=""){
		mdecoding(coding);
	}
}
/*保存文本文件到本地*/
function msave(){
	datastr = mde.value();
	if (confirm(res_str_ifwinn)){
		datastr = datastr.replace("\n","\r\n");
	}
	dataarray = new TextEncoder($("#me_decoding")[0].value.toLowerCase(), { NONSTANDARD_allowLegacyEncoding: true }).encode(datastr);
	blob = new Blob([dataarray],{type:"text/plain;charset="+$("#me_decoding")[0].value.toLowerCase()});
	saveAs(blob,$("#me_filename")[0].value+'.md');
}
/*桌面端新窗口打开，便于调整窗口大小*/
function mnwindow(){
	window.open(window.location,res_str_winname,'height=640,width=480,top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no,status=no')
}
/*切换主题，主题通过css定义*/
function mtheme(){
	body = $("body")[0];
	if (body.className == "dark"){
		body.className = "";
	}else {
		body.className = "dark";
	}
}
