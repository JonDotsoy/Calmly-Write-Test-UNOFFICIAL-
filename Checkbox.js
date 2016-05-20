function Checkbox(title) {
	this._state=false;	
	this._title=title;
	this.gr=new Grape('a','html').addClass('option').style('padding-left','45px');

	this.gr.addChild(new Grape('img','html').attr('src','img/check_off.png').addClass('check_option_off'));
	this.gr.addChild(new Grape('img','html').attr('src','img/check_on.png').addClass('check_option_on'));
	if (preferencesobj[this._title] && preferencesobj[this._title]=='pron') {
		this._state=true;
		this.gr.addClass('option_state_true');
	}
	this.gr.addChild(new Grape('span','html').text(chrome.i18n.getMessage(title)));
	var _this=this;
	this.gr.clic(function () {_this.setState(!_this._state);});
}
Checkbox.fn=Checkbox.prototype;

Checkbox.fn.getGrape=function () {
	return this.gr;
}
Checkbox.fn.setState=function (state) {

	if (typeof state==='boolean') {
		if (state==true) {
			this.gr.addClass('option_state_true');
			preferencesobj[this._title]='pron';
		} else {
			this.gr.removeClass('option_state_true');
			preferencesobj[this._title]='proff';
		}
		this._state=state;
		applyPreferences();
        chrome.storage.local.set({'preferencesobj': preferencesobj});
	}
}
Checkbox.fn.clic=function () {
	this.gr.clic();
	console.log('ye');
}