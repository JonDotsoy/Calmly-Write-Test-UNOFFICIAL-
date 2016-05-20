function Selector (title,options) {
this._title=title;
this._options=options;

}
Selector.fn=Selector.prototype;
Selector.fn.getGrape=function () {
var _this=this;
var dv=new Grape('div','html').style('margin-bottom','15px').style('margin-top','15px');
var leftdv=new Grape('div','html').text(chrome.i18n.getMessage(this._title)).addClass("prevSelector").addTo(dv);
var rightdv=new Grape('div','html').addClass('prSelector').addTo(dv);
var rul=new Grape('ul','html').addTo(rightdv);
for (var i=0; i<this._options.length; i++) {
    var rli=new Grape('li','html');
    rli.seed.innerHTML=chrome.i18n.getMessage(this._options[i]);
    //if (this._options[i]=='prdroid') rli.style('font-family','Droid').style('font-size','13px');
    //if (this._options[i]=='prcousine') rli.style('font-family','Cousine').style('font-size','14px');
    if (this._options[i]=='prdroid') rli.id('dr_droid_selector');
    if (this._options[i]=='prcousine') rli.id('dr_cousine_selector');
    if (this._options[i]=='propensans') rli.id('dr_opensans_selector');
    if (this._options[i]=='pron' || this._options[i]=='proff') rli.style('min-width','34px');
    if (preferencesobj[this._title]==this._options[i]) rli.addClass('prSelected');
    rli.preference_option=this._options[i];
    rli.preference_group=this._title;
    rli.clic(function () {
        var par=this.getParent();
        par.by('li').removeClass('prSelected');
        this.addClass('prSelected');
        preferencesobj[this.preference_group]=this.preference_option;
        applyPreferences();
        chrome.storage.local.set({'preferencesobj': preferencesobj});
    });
    rli.addTo(rul);
}

return dv;

}

function ColorSelector () {
    var dv=new Grape('div','html').style('margin-bottom','15px').style('margin-top','15px');
    var leftdv=new Grape('div','html').text(chrome.i18n.getMessage('prtextcaret')).addClass("prevSelector").addTo(dv);
    var defaultcolor=new Grape('div','html').addClass('colorpicker').addClass('default_colorpicker').addTo(dv);
    if (preferencesobj['prtextcaret']=='default') defaultcolor.addClass('selected_colorpicker');
    defaultcolor.clic(function () {
        preferencesobj['prtextcaret']='default';
        applyPreferences();
         chrome.storage.local.set({'preferencesobj': preferencesobj});
    });
    
    var bluecolor=new Grape('div','html').addClass('colorpicker').addClass('blue_colorpicker').addTo(dv);
    if (preferencesobj['prtextcaret']=='blue') bluecolor.addClass('selected_colorpicker');
    bluecolor.clic(function () {
        preferencesobj['prtextcaret']='blue';
        applyPreferences();
         chrome.storage.local.set({'preferencesobj': preferencesobj});
    });

    var pinkcolor=new Grape('div','html').addClass('colorpicker').addClass('pink_colorpicker').addTo(dv);
    if (preferencesobj['prtextcaret']=='pink') pinkcolor.addClass('selected_colorpicker');
    pinkcolor.clic(function () {
        preferencesobj['prtextcaret']='pink';
        applyPreferences();
         chrome.storage.local.set({'preferencesobj': preferencesobj});
    });

    var greencolor=new Grape('div','html').addClass('colorpicker').addClass('green_colorpicker').addTo(dv);
    if (preferencesobj['prtextcaret']=='green') greencolor.addClass('selected_colorpicker');
    greencolor.clic(function () {
        preferencesobj['prtextcaret']='green';
        applyPreferences();
         chrome.storage.local.set({'preferencesobj': preferencesobj});
    });

    var orangecolor=new Grape('div','html').addClass('colorpicker').addClass('orange_colorpicker').addTo(dv);
    if (preferencesobj['prtextcaret']=='orange') orangecolor.addClass('selected_colorpicker');
    orangecolor.clic(function () {
        preferencesobj['prtextcaret']='orange';
        applyPreferences();
         chrome.storage.local.set({'preferencesobj': preferencesobj});
    });

    return dv;
}

