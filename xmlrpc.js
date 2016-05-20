
function sayHello() {
	sendRPC('human-computer.net/blog/',method2xml('demo.addTwoNumbers',3.4,2),function () {console.log('yea');},function () {console.log('no');});
}

function sendRPC(urlsend,method,donefn,failfn) {
	if (!urlsend.match("^(http://|https://)")) urlsend = "http://" + urlsend;
	if (urlsend.slice(-1)!='/') {
		urlsend+='/xmlrpc.php';
	} else {
		urlsend+='xmlrpc.php';
	}
	raceme.ajax({
		url:urlsend,
		method:'POST',
		format:'XML',
		data:method,
		done:function (resultado) {
			console.log(resultado);
			donefn.call(this,resultado);
		},
		fail:function () {
			failfn.call(this);
		}
	});
}

function method2xml() {
	var dev='';
	if (arguments.length>0) {
		dev="<?xml version='1.0' encoding='utf-8'?>";
		dev+="<methodCall><methodName>"+arguments[0]+"</methodName><params>";
		for (var i=1;i<arguments.length;i++) {
			dev+="<param><value>";
			dev+=arguments[i];
			dev+="</value></param>";
		}
		dev+="</params></methodCall>";
	} 
	return dev;
}

function xml2method(xml) {
	var dev=[];
	var res=xml.getElementsByTagName('params').item(0);
	var params=new Grape(res).by('param');
	for (var i=0; i<params.length;i++) {
		var current_param=params.item(i).firstChild();
		if (current_param.by('string').length>0) {
			dev.push(current_param.by('string').item(0).text());	
		} else if (current_param.by('int').length>0) {
			dev.push(parseInt(current_param.by('int').item(0).text()));	
		} else if (current_param.by('i4').length>0) {
			dev.push(parseInt(current_param.by('i4').item(0).text()));	
		} else if (current_param.by('double').length>0) {
			dev.push(parseFloat(current_param.by('double').item(0).text()));	
		} else {
			dev.push(current_param.text());	
		}
	}
	console.log(dev);
	return dev;

}