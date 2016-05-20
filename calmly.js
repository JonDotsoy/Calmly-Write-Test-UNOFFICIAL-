main(function () {
  
  //if (chrome.syncFileSystem.setConflictResolutionPolicy) chrome.syncFileSystem.setConflictResolutionPolicy('manual');
  //if (chrome.syncFileSystem.getServiceStatus) chrome.syncFileSystem.getServiceStatus(function (detail) {console.log(detail);});
  

  preferencesobj={
    prtextwidth:'prmedium',
    prfont:'prdroid',
    prdark:'proff',
    prsmartquotes:'pron',
    prsmartdash:'pron',
    prsmartellipses:'pron',
    prtoolbar:'pron',
    prfocusmode:'proff',
    prasterisk:'pron',
    prnumbered:'pron',
    prfontsize:'prfontmedium',
    prmarginparagraphs:'pron',
    prdyslexic:'proff',
    prcloudsaving:'pron',
    prtypesound:'proff',
    prtextcaret:'default',
    prdefaultformat:'cml',
    prautocapitalization:'proff',
    prwordcounter:'proff'
  };
  preventhidetooltip=false;
  menuvisible=true;
  lastmousex=0;
  lastmousey=0;
  menuopen=false;
  filemanageropen=false;
  preferencesopen=false;
  documenttitle=chrome.i18n.getMessage("untitledmsg");
  documentid=raceme._generateId();
  entry_persistent=null;
  fullscreen=false;
  mainarea=by('id:main');
  wrapper=by('id:wrapper');
  editor=new Editor(mainarea,wrapper);
  marcas=new GrapeGroup();
  current_mark=0;
  topshadow=by('id:topshadow');
  bottomshadow=by('id:bottomshadow');
  wrappergroup=new GrapeGroup();
  wrappergroup.push(wrapper);
  wrappergroup.push(topshadow);
  wrappergroup.push(bottomshadow);
  calmlylogo=by('id:calmlylogo');
  options=by('id:options');
  distancia_wheel=100;
  direccion_wheel=0;
  menuanimation=null;
  scrollanimation=null;
  dbautosave=null;
  dbcurrent=null;
  dblocalfiles=null;
  syncing_files=[];
  canautosave=false;
  isMac=false;
  useruilanguage=chrome.i18n.getUILanguage();
  timer_links_openable=null;
  timer_links_enter=null;
  countertimeout=null;

  //sonidos
  mp3_backspace=by('id:mp3-backspace').seed;
  mp3_key_01=by('id:mp3-key-01').seed;
  mp3_key_02=by('id:mp3-key-02').seed;
  mp3_key_03=by('id:mp3-key-03').seed;
  mp3_key_04=by('id:mp3-key-04').seed;
  mp3_sound_keys=[by('id:mp3-key-new-01').seed,by('id:mp3-key-new-02').seed,by('id:mp3-key-new-03').seed,by('id:mp3-key-new-04').seed,by('id:mp3-key-new-05').seed];
  mp3_whatsound=[]
  var currsound=0;
  for (var h=0;h<300;h++) {
    mp3_whatsound.push(mp3_sound_keys[currsound]);
    currsound++;
    if (currsound==5) currsound=0;
  }
  mp3_return=by('id:mp3-return').seed;
  mp3_return_new=by('id:mp3-return-new').seed;
  mp3_scrollDown=by('id:mp3-scrollDown').seed;
  mp3_scrollUp=by('id:mp3-scrollUp').seed;
  mp3_space=by('id:mp3-space').seed;
  mp3_space_new=by('id:mp3-space-new').seed;
  
  
  local_conflicting_detector={name:'',time:new Date().getTime()};
  
  markdowntextext=['txt','text','markdown','mdown','mkdn','md','mkd','mdwn','mdtxt','mdtext'];
  ctrlfinput=by('id:ctrlfinput');
  searchfilemanagerinput=by('id:searchfilemanagerinput');
  // i18n  -----------------------------
  options.by('class:menumsg').each(function() {this.text(chrome.i18n.getMessage(this.id()));});
  by('id:file_manager_tab_recent').text(chrome.i18n.getMessage('recentmsg'));
  by('id:file_manager_tab_drafts').text(chrome.i18n.getMessage('backupmsg'));
  if (chrome.i18n.getUILanguage) {
    moment.locale(chrome.i18n.getUILanguage());
  }

  var defaultdirection="ltr";
  	try {
  		if (document.defaultView.getComputedStyle(document.documentElement,null).direction) {
  			defaultdirection=document.defaultView.getComputedStyle(document.documentElement,null).direction;
  		}
  		mainarea.style('direction',defaultdirection);
	} catch(e) {

	}
  
 

  by('id:titletext').value(documenttitle);
  by('id:save_msg').text(chrome.i18n.getMessage('savedmsg'));
  by('id:open_local_file').text(chrome.i18n.getMessage('openmsg'));
  by('id:remove_button').text(chrome.i18n.getMessage('removelocalfile'));
  by('id:yes_remove_button').text(chrome.i18n.getMessage('yesmsg'));
  by('id:no_remove_button').text(chrome.i18n.getMessage('nomsg'));
  by('id:documentremoved_msg').text(chrome.i18n.getMessage('areyousuremsg'));

  // resize window
  window.onresize=resize_window;
  chrome.app.window.current().onBoundsChanged.addListener(resize_window);
  chrome.app.window.current().onMaximized.addListener(function () {by('id:max_b').hide(); by('id:res_b').show(); });
  chrome.app.window.current().onRestored.addListener(function () {
    if (chrome.app.window.current().isMaximized()) {by('id:res_b').show();by('id:max_b').hide();} else {by('id:res_b').hide(); by('id:max_b').show();}
  });



  filemanager=new Filemanager(function () {
            by('id:splash_screen').animate(200).opacity(0).done(function () {this.remove();});
            if (this.isOK && preferencesobj['prcloudsaving']=='pron') {
              //by('id:opsavedirect').hide();
              documenttitle=chrome.i18n.getMessage("untitledmsg");
              by('id:titletext').value(documenttitle);
            }
            by('body').item(0).addChild(new Grape('input','html').id('filebt').attr('name','filebt').attr('type','file').style('display','none').clic(abrir_fichero));
            by('body').item(0).addChild(new Grape('input','html').id('insertbt').attr('name','insertbt').attr('type','file').style('display','none').clic(insertar_imagen));

            by('id:min_b').clic(function () {chrome.app.window.current().minimize();});
            by('id:max_b').clic(function () {
              chrome.app.window.current().setAlwaysOnTop(true);
             chrome.app.window.current().maximize();
            });



            by('id:close_b').clic(function () {

            		checkifdiscard(function () {closeapp();},8000);

/*
                  if (editor.documentsaved || (filemanager.isOK && preferencesobj['prcloudsaving']=='pron' && editor.documentcloudsaved)) 
                  	{
                  		closeapp();
                  	} else if (filemanager.isOK && preferencesobj['prcloudsaving']=='pron' && !editor.documentcloudsaved) {
                  		block_screen();
                  		setTimeout(function () {
                  			closeapp();
                  		},5000);
                  	} else {alert_window(chrome.i18n.getMessage('documentchanges'),closeapp,chrome.i18n.getMessage('discardmsg'));}
                  	*/
            });
            by('id:opexit').clic(function () {by('id:close_b').clic();});
            by('id:oppreferences').clic(preferences_window);
            by('id:res_b').clic(function () {chrome.app.window.current().restore();});

            if (chrome.app.window.current().isMaximized()) {
                by('id:max_b').hide();
            } else {
                by('id:res_b').hide();
            }

            by('body').item(0).mousemove(showmenus);

            checkifRestoreBackup();




            window.onkeydown=function (e) {window_onkeydown(e);}

            wrapper
              .mousedown(function (e) {
                if (e.button && e.button!=0) return false; // Para que no pase cuando se presiona el boton derecho o central
                
                editor.restoreSelection();
                editor.disableZoomOut(e);
                 
                  
                
                
              })
              .click(function (e) {
                 hide_tooltip_links_openable();
                 
                 if (!e.target) {
                    editor.unfocusmode();
                  } else {
                    if (!isDescendant(mainarea.seed,e.target) && e.target!=mainarea.seed) {
                      editor.unfocusmode();
                    } else {
                      editor.focusmode();
                    }
                }
                 if (menuopen) calmlylogo.click();
                      var ob=new Grape(e.target);
                      if (ob.tagName()=='DIV' && (ob.id()=='wrapper' || ob.id()=='frame_options' || ob.id()=='main')) {
                        editor.removeStyles();
                        if (window.getSelection().toString()=='') editor.hideTooltip();
                      }
                      if (window.getSelection().toString()=='') editor.restoreSelection();

                      mainarea.focus();

              },'wrclic',false)
              .mouseup(function (e) {
                if (mainarea.seed===document.activeElement) editor.showtooltip(e);
              });

            checkPlatform();



            by('id:opback').click(function () {wrapper.click();});

            by('id:opnew').click(function () {
            	checkifdiscard(function () {new_doc.call();});
            	/*
                  if ((editor.documentsaved===false && (!filemanager.isOK || preferencesobj['prcloudsaving']=='prof')) || (filemanager.isOK && preferencesobj['prcloudsaving']=='pron' && editor.documentcloudsaved==false)) {
                  alert_window(chrome.i18n.getMessage('documentchanges'),new_doc,chrome.i18n.getMessage('okdiscardmsg'));
                  } else {
                  new_doc.call();
                  }
                  */
            });



            by('id:opopen').click(function () {
                if (filemanager.isOK==false || preferencesobj['prcloudsaving']=='proff') {
                  if (editor.documentsaved===false || (filemanager.isOK && preferencesobj['prcloudsaving']=='pron' && editor.documentcloudsaved==false)) {
                    alert_window(chrome.i18n.getMessage('documentchanges'),function () {by('id:filebt').clic();},chrome.i18n.getMessage('okdiscardmsg'));
                  } else {
                    by('id:filebt').clic();
                  }
                } else {
                  if (menuopen) {
                    if (filemanageropen==false) showhidefilemanager();  
                  } else {
                    setTimeout(function () {calmlylogo_clic();showhidefilemanager();},400);
                    //setTimeOut(function () {showhidefilemanager();},300);  
                  }
                  
                }
            });
            by('id:open_local_file').clic(function () {by('id:filebt').clic()});


            by('id:opsave').click(opsave_clic);

            by('id:opsavedirect').click(function (e) {
              //if (filemanager.isOK==false || preferencesobj['prcloudsaving']=='proff') {
                opsavedirect_clic(e);
              //} 
            });

            by('id:opinsert')
              .clic(function () {
                hidefilemanager();
                by('id:insertbt').clic();
              });






            by('id:opfull').click(function () {
              if (is_full()==false) {
                 chrome.app.window.current().fullscreen();
                 setTimeout(_showmenus,500);
                 //_showmenus();
              } else {
                 chrome.app.window.current().restore();
                 if (menuopen) forceclosemenu(true);
                 setTimeout(_showmenus,500);
              }
            });

            by('id:full_b').clic(function (e) {e.preventDefault(); e.cancelBubble=true; by('id:opfull').clic(); return false;});

            by('id:opprint')
              .clic(function () {
              if (is_full()==true) by('id:opfull').clic();
              window.print();
              });


            wrapper.scroll(scrollEffect);
            by('body').item(0).scroll(function (e) {forceclosemenu(true);});
            wrapper.mousewheel(function (e) {/*editor.unfocusmode();*/ wrapper.removeClass('disablescroll');});


            ctrlfinput
                .input(ctrlfinput_input)
                .keydown(function (e) {if (e.keyCode=='13' || e.keyCode=='114') {ctrlmove('next');} else if (e.keyCode=='27') {by('id:endb').clic();}})
                .focus(function () {editor.hideTooltip();})
                .blur(function (e) { this.style('outline','none'); editor.removeStyles(); editor.unfocusmode(true);});

            searchfilemanagerinput
                .input(dosearchfilemanager)
                .focus(function () {editor.hideTooltip();})

            by('id:stopsearchfilemanager').clic(function () {
              searchfilemanagerinput.value('').input().focus();

            });


            var trytorename=function (inp) {
              if (filemanager.isOK && preferencesobj['prcloudsaving']=='pron' && inp.value()!=documenttitle) {
                      var old_t=documenttitle;
                      var old_i=documentid;
                      documenttitle=inp.value();
                      documentid=raceme._generateId();
                      filemanager.renameFile(old_t+old_i+'.cml', documenttitle+documentid+'.cml', function () {
                        
                      });
              }
            }
            by('id:titletext')
                .focus(function () {
                  editor.hideTooltip();
                  if (menuopen) calmlylogo.click();
                  if (this.value()==chrome.i18n.getMessage("untitledmsg")) this.value('');
                })
                .keydown(function (e) {
                    if (e.keyCode===9 || e.keyCode===13) {
                      if (this.value().trim()=='') this.value(chrome.i18n.getMessage("untitledmsg"));
                      trytorename(this);
                      e.preventDefault();
                      wrapper.clic();
                      }
                })
                .input(function () {
                 
                  if (this.value()!=documenttitle && (filemanager.isOK==false || preferencesobj['prcloudsaving']=='proff')) {
                    documenttitle=this.value(); entry_persistent=null; editor.documentsaved=false; editor.documentcloudsaved=false; trytoautosave();
                  }
                })
                .blur(function () {
                  if (this.value().trim()=='') this.value(chrome.i18n.getMessage("untitledmsg"));
                  trytorename(this);
                });




            by('id:previousb').clic(function () {ctrlmove('prev');});
            by('id:nextb').clic(function () {ctrlmove('next');});
            by('id:endb').clic(function () {editor.restoreSelection();mainarea.focus();});

            by('id:file_manager_tab_recent').clic(function () {
            	this.removeClass('file_manager_tab_disabled').addClass('file_manager_tab_enabled');
            	by('id:file_manager_tab_drafts').removeClass('file_manager_tab_enabled').addClass('file_manager_tab_disabled');
            	by('id:file_manager_recent_div').show();
            	by('id:file_manager_drafts_div').hide();
            });
            by('id:file_manager_tab_drafts').clic(function () {
            	this.removeClass('file_manager_tab_disabled').addClass('file_manager_tab_enabled');
            	by('id:file_manager_tab_recent').removeClass('file_manager_tab_enabled').addClass('file_manager_tab_disabled');
            	by('id:file_manager_recent_div').hide();
            	by('id:file_manager_drafts_div').show();
            })

            by('id:menucalmly').clic(function () {calmlylogo.clic();});

            calmlylogo.clic(calmlylogo_clic);



            mainarea.focus(function () {
                current_mark=0;
                by('id:ctrlf').animate(300).ease('out').style('top','-45px');
            });
            _showmenus();
            mainarea.focus();

            document.execCommand("outdent");
            document.execCommand("formatBlock", false, "p");
            editor.documentsaved=true;
            editor.documentcloudsaved=true;
            updatewordcounter();
            if (is_full()==true) {showcalmlylogo(true);} else {showcalmlylogo(false);}

            chrome.storage.local.get('preferencesobj', function(result){
                    if (result.preferencesobj) preferencesobj=result.preferencesobj;
                    applyPreferences();
            });
            var dropZone = document.getElementById('wrapper');
            dropZone.addEventListener('dragover', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                evt.dataTransfer.dropEffect = 'copy';
            }
              , false);
            dropZone.addEventListener('drop', function (evt) {
              evt.stopPropagation();
              evt.preventDefault();
              var files = evt.dataTransfer.items;
              if (files[0] && files[0].kind=='file') {
              	
                if (editor.documentsaved===false || (filemanager.isOK && editor.documentcloudsaved===false)) {
                    alert_window(chrome.i18n.getMessage('documentchanges'),function () {
                    	var readEntry=files[0].webkitGetAsEntry();
                    	if (readEntry) {
                    		readEntry.file(function(file) {
      							leer_contenido_fichero(file,readEntry);
    						});
                    	}
                    },chrome.i18n.getMessage('okdiscardmsg'));
                  } else {
                    //leer_contenido_fichero(files[0]);
                    var readEntry=files[0].webkitGetAsEntry();
                    if (readEntry) {
                    	readEntry.file(function(file) {
      						leer_contenido_fichero(file,readEntry);
    					});
                    }
                    
                  }
              }
            }, false);



            /*
            chrome.identity.getAuthToken({'interactive': true}, function(token) {
        				// Use the token.
        				var CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';
        				var req = new XMLHttpRequest();

        				req.open('GET', CWS_LICENSE_API_URL + chrome.runtime.id);
        				req.setRequestHeader('Authorization', 'Bearer ' + token);

        				req.onreadystatechange = function() {
        					
        				  if (req.readyState == 4) {
        				    var license = JSON.parse(req.responseText);
        				    verifyAndSaveLicense(license);
        				  }
        				}
        				req.send();
			       });
            */

             var CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/'; 
             xhrWithAuth('GET', CWS_LICENSE_API_URL + chrome.runtime.id, true, function (error, status, response) {
                if (status === 200) {
                  response = JSON.parse(response);
                  verifyAndSaveLicense(response);
                } else {
                 
                }            
                
             });
            
  });



});

// Helper Util for making authenticated XHRs
function xhrWithAuth(method, url, interactive, callback) {
  var retry = true;
  getToken();

  function getToken() {
    chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
      if (chrome.runtime.lastError) {
        callback(chrome.runtime.lastError);
        return;
      }
      access_token = token;
      requestStart();
    });
  }

  function requestStart() {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.onload = requestComplete;
    xhr.send();
  }

  function requestComplete() {
    if (this.status == 401 && retry) {
      retry = false;
      chrome.identity.removeCachedAuthToken({ token: access_token },
                                            getToken);
    } else {
      callback(null, this.status, this.response);
    }
  }
}


function verifyAndSaveLicense(license) {
	var TRIAL_PERIOD_DAYS=7;
 
	chrome.storage.sync.get('isreallyfulllicense',function (result) {
   
		if (result.isreallyfulllicense && result.isreallyfulllicense=='true') return;
		var beforetime=new Date(2015,10,27).getTime();
		if (license.createdTime && parseInt(license.createdTime, 10)<beforetime) {
			chrome.storage.sync.set({'isreallyfulllicense':'true'});
		} else {

			console.log(license)

			if (license.result && license.accessLevel == "FULL") {
			  //console.log("Fully paid & properly licensed.");
			  chrome.storage.sync.set({'isreallyfulllicense':'true'});
			  //licenseStatus = "FULL";
			} else if (license.result && license.accessLevel == "FREE_TRIAL") {
			  var daysAgoLicenseIssued = Date.now() - parseInt(license.createdTime, 10);
			  daysAgoLicenseIssued = daysAgoLicenseIssued / 1000 / 60 / 60 / 24;
			  if (daysAgoLicenseIssued <= TRIAL_PERIOD_DAYS) {
			    //console.log("Free trial, still within trial period");
			    //licenseStatus = "FREE_TRIAL";
			  } else {
			    //console.log("Free trial, trial period expired.");
			    //licenseStatus = "FREE_TRIAL_EXPIRED";
			    //trialexpired();
			  }
			} else {
			  //console.log("No license ever issued.");
			  //licenseStatus = "NONE";
       
			}
		}
		
		
		
	});

	
}

function trialexpired() {
	/*
	by('id:oppreferences').hide();
	by('id:opprint').hide();
	by('id:opfull').hide();
	by('id:opinsert').hide();
	by('id:opnew').hide();
	by('id:countdiv').hide();
	by('id:open_local_file').hide();
	by('id:opsavedirect').hide();
	by('id:main').attr('contenteditable','false');
	*/
	by('id:trialexpired').style('display','block');

}












function checkPlatform() {
  chrome.runtime.getPlatformInfo(function (plat) {
                
                if (plat.os=='win') {
                    wrapper.mousewheel(function (e) {
                      var wh=raceme.wheelValue(e);
                      if ((wh<0 && direccion_wheel>0) || (wh>0 && direccion_wheel<0)) {
                        direccion_wheel=wh;
                      } else {
                        direccion_wheel+=wh;
                      }
                      var recorrido=Math.abs(50*direccion_wheel);
                      var ea='out';
                      var time_s=300;
                      if (recorrido>300) {time_s=160; ea='lin';}
                      if (wh>0) {
                          this.stop().animate(time_s).ease(ea,'quad').scrollTop(this.scrollTop()-recorrido).done(function () {direccion_wheel=0;});
                      } else if (wh<0) {
                          this.stop().animate(time_s).ease(ea,'quad').scrollTop(this.scrollTop()+recorrido).done(function () {direccion_wheel=0;});;
                      }
                      e.preventDefault();
                      return false;
                    });
                }
                if (plat.os!='mac') {
                    by('id:full_b').style('display','none');
                    by('id:close_b').style('display','inherit');
                    //by('id:opexit').style('display','none');
                    by('id:opfull').style('display','inherit');
                } else {
                    isMac=true;
                }
            });
}



function checkifRestoreBackup() {
      db.open({
                name: 'CalmlyDB',
                version: 2,
                schema: {
                    documents: {
                        key: {
                            keyPath: 'id',
                            autoIncrement: true
                        },indexes: {
                            id: { }
                        }
                    }
                }
            }).then(function (server) {
                dbautosave=server;
                dbautosave.documents
                      .query()
                      .all()
                      .desc()
                      .execute()
                      .then(function (records) {

                        if (records.length>0) {
                            mainarea.seed.innerHTML=records[0].content;
                            documenttitle=records[0].title;
                            by('id:titletext').value(documenttitle);
                            editor.hideTooltip(); editor.removeStyles(); editor.removeNBSP(); editor.marginImgs(); editor.interactionImgs();
                            editor.documentsaved=false;
                            editor.documentcloudsaved=false;
                            dbcurrent=records[0].id;
                            wrapper.click();

                            canautosave=true;
                            trytoautosave();
                        } else {
                        canautosave=true;
                        initunsaved();
                        }
                      });

            });
}



function closeapp() {
  if (dbcurrent!=null && dbautosave) {
      canautosave=false;
      dbautosave.documents.remove(dbcurrent).then(function () {
        dbautosave.close();
        if (dblocalfiles) dblocalfiles.close();
        window.close();
      });
  } else {
    if (dblocalfiles) dblocalfiles.close();
    window.close();
  }
}





function new_doc (close_menu) {
      editor.documentsaved=true;
      editor.documentcloudsaved=true;
      canautosave=false;
      editor.mainarea.clear();
      documenttitle=chrome.i18n.getMessage("untitledmsg");
      if (filemanager.isOK && preferencesobj['prcloudsaving']=='pron') {
      documentid=raceme._generateId();
      canautosave=true;
      } 
      entry_persistent=null;
      by('id:titletext').value(documenttitle);
      if (typeof close_menu!=='boolean' || close_menu!==false) {
        wrapper.click();
      } else {
        updatewordcounter();
      }
      mainarea.focus();

      document.execCommand("outdent");
      document.execCommand("formatBlock", false, "p");
      wrapper.style('top','0px');
      editor.documentsaved=true;
      editor.documentcloudsaved=true;
      deleteandinitautosave();
}



function resize_window (closemenu) {
hide_tooltip_links_openable();
wrapper.removeClass('disablescroll');
setTimeout(function () {

      editor.hideTooltip();
      if (menuopen && (typeof closemenu==='undefined' || closemenu==true)) forceclosemenu(true);



      if (is_full()==false) {

            if (isMac==false) by('id:opexit').style('display','none');
            by('id:opback').style('display','none');
            showcalmlylogo(false);
            by('id:titlebar').show();
            by('body').item(0).style('border-width','1px');
            if (wrapper.seed.clientHeight!=wrapper.seed.scrollHeight)  {
              if (wrapper.style('top')=='0px') wrapper.style('top','26px').scrollTop(wrapper.scrollTop()+26);
            } else {
              wrapper.style('top','0px');
            }
            options.style('top','28px');
            by('id:preferences_window').style('top','28px');
            by('id:file_manager').style('top','28px');
            topshadow.style('top','9px');
            by('id:titlebar').stop().style('top','0px');
            menuvisible=true;
            by('id:save_msg').style('top','30px');
          } else {
           
            by('id:opback').style('display','block');
            by('body').item(0).style('border-width','0px');
            if (menuopen==false) showcalmlylogo(true);
            by('id:titlebar').hide();
            wrapper.style('top','0px');
            by('id:save_msg').style('top','15px');
            options.style('top','0px');
            by('id:preferences_window').style('top','0px');
            by('id:file_manager').style('top','0px');
            topshadow.style('top','-15px');


          }
          editor.marginImgs();
          editor.interactionImgs();

    scrollEffect();
   
},0);

}

function make_links_openable() {
  hide_tooltip_links_openable();
  var tool_open=by('id:tooltip_make_links_openable');
  tool_open.removeEvent();
  tool_open.mouseenter(function () {
    if (menuopen==false) tool_open._is_hover_openable_link=true;
  },'enter_tool_open');
  tool_open.mouseleave(function () {
    tool_open._is_hover_openable_link=false;
        if (timer_links_openable) clearTimeout(timer_links_openable);
        timer_links_openable=setTimeout(function () {
          if (tool_open._is_hover_openable_link==false) {
            tool_open.animate(200).opacity(0).done(function () {this.style('display','none');});
          }
        },1800);
  },'leave_tool_open');
  tool_open.clic(function () {
    window.open(this._url_openable_link);
  },'clic_links_openable')
  
  mainarea.by('a').removeEvent();
  mainarea.by('a').each(function () {
      this.mousemove(function () {
        if (editor.editor_tooltip.style('display')=='none' && menuopen==false) {
          if (timer_links_openable) clearTimeout(timer_links_openable);
          if (tool_open._is_hover_openable_link==false) {
            tool_open._is_hover_openable_link=true;
            if (timer_links_enter) clearTimeout(timer_links_enter);
            tool_open._url_openable_link=this.attr('href');
            tool_open.attr('title',this.attr('href'));
            var _this=this;
            timer_links_enter=setTimeout(function () {
              if (editor.editor_tooltip.style('display')=='none' && menuopen==false) {
                var bbb=_this.getBBox();
                var t_wrapper=parseInt(wrapper.style('top'));
                tool_open.style('top',Math.max(bbb.y-24-wrapper.scrollTop()+t_wrapper,52)+'px');
                tool_open.style('left',(bbb.x)+'px');
                tool_open.style('display','block');
                if (tool_open.opacity()==0) tool_open.animate(200).opacity(1);   
              } else {
                hide_tooltip_links_openable();
              } 
            },300);
            
          }
          
        } else {
          hide_tooltip_links_openable();
        }
        
      },'move_links_openable')
      .mouseleave(function () {
        if (timer_links_enter) clearTimeout(timer_links_enter);
        tool_open._is_hover_openable_link=false;
        if (timer_links_openable) clearTimeout(timer_links_openable);
        timer_links_openable=setTimeout(function () {
          if (tool_open._is_hover_openable_link==false) {
            tool_open.animate(200).opacity(0).done(function () {this.style('display','none');});
          }
        },1800);

      },'leave_links_openable')

  });
}
function hide_tooltip_links_openable() {
  if (timer_links_openable) clearTimeout(timer_links_openable);
  timer_links_openable=null;
  if (timer_links_enter) clearTimeout(timer_links_enter);
  timer_links_enter=null;
  var tool_open=by('id:tooltip_make_links_openable');
  tool_open._is_hover_openable_link=false;
  tool_open.opacity(0).style('display','none');
}

function window_onkeydown (e) {

  if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70 && e.shiftKey==false)) {

      if (menuopen) calmlylogo.clic();
      ctrlfinput.focus();
       by('id:ctrlf').animate(300).ease('out').style('top','34px');
    } else if (e.keyCode === 122 || (e.metaKey && e.shiftKey && e.keyCode==70)) {
       
       by('id:opfull').clic();

    } else if ((e.ctrlKey) && e.keyCode===80) {
      by('id:opprint').clic();
    } else if ((e.ctrlKey) && (e.keyCode=='79' || e.keyCode=='111')) {
          e.preventDefault();
          e.cancelBubble = true;
          raceme.by('id:opopen').click();
          return false;
       } else if ((e.ctrlKey) && (e.keyCode=='115' || e.keyCode=='83')) {
          e.preventDefault();
          e.cancelBubble = true;
          editor.saveSelection();
          by('id:opsavedirect').click();
         return false
       }
}


function opsave_clic () {
        hidefilemanager();
        var file_ext=getFileExtension(documenttitle);
        
       	var acceptsFormats;
       
       	if ((file_ext && markdowntextext.indexOf(file_ext)!=-1 && file_ext!='text' && file_ext!='txt') || (!file_ext && preferencesobj['prdefaultformat'] && preferencesobj['prdefaultformat']=='md')) {
       		acceptsFormats=[
							{'description': 'Markdown', 'extensions': ['md','markdown','mdown','mkdn','mkd','mdwn','mdtxt','mdtext']},
           					{'description': 'Calmly files', 'extensions': ['cml']},
           					{'description': 'HTML', 'extensions': ['htm','html']},
          					{'description': 'Plain text', 'extensions': ['txt']},
                    {'description': 'Microsoft Word .docx', 'extensions': ['docx']}
          					
        	];

       	} else if ((file_ext && (file_ext=='htm' || file_ext=='html')) || (!file_ext && preferencesobj['prdefaultformat'] && preferencesobj['prdefaultformat']=='html')) {
			acceptsFormats=[
							{'description': 'HTML', 'extensions': ['htm','html']},
           					{'description': 'Plain text', 'extensions': ['txt']},
           					{'description': 'Calmly files', 'extensions': ['cml']},
          					{'description': 'Markdown', 'extensions': ['md','markdown','mdown','mkdn','mkd','mdwn','mdtxt','mdtext']},
                    {'description': 'Microsoft Word .docx', 'extensions': ['docx']}
        	];

       	} else if ((file_ext && (file_ext=='text' || file_ext=='txt')) || (!file_ext && preferencesobj['prdefaultformat'] && preferencesobj['prdefaultformat']=='txt')) {
			acceptsFormats=[
           					{'description': 'Plain text', 'extensions': ['txt']},
           					{'description': 'Calmly files', 'extensions': ['cml']},
           					{'description': 'HTML', 'extensions': ['htm','html']},
          					{'description': 'Markdown', 'extensions': ['md','markdown','mdown','mkdn','mkd','mdwn','mdtxt','mdtext']},
                    {'description': 'Microsoft Word .docx', 'extensions': ['docx']}
        	];
       	} else if ((file_ext && file_ext=='docx') || (!file_ext && preferencesobj['prdefaultformat'] && preferencesobj['prdefaultformat']=='docx')) {
      acceptsFormats=[
                    {'description': 'Microsoft Word .docx', 'extensions': ['docx']},
                    {'description': 'Plain text', 'extensions': ['txt']},
                    {'description': 'Calmly files', 'extensions': ['cml']},
                    {'description': 'HTML', 'extensions': ['htm','html']},
                    {'description': 'Markdown', 'extensions': ['md','markdown','mdown','mkdn','mkd','mdwn','mdtxt','mdtext']}
                    
          ];
        }  else {
       		acceptsFormats=[
           					{'description': 'Calmly files', 'extensions': ['cml']},
           					{'description': 'HTML', 'extensions': ['htm','html']},
          					{'description': 'Plain text', 'extensions': ['txt']},
          					{'description': 'Markdown', 'extensions': ['md','markdown','mdown','mkdn','mkd','mdwn','mdtxt','mdtext']},
                    {'description': 'Microsoft Word .docx', 'extensions': ['docx']}
        	];
       	}

        chrome.fileSystem.chooseEntry({type: 'saveFile', suggestedName: documenttitle, 'accepts': acceptsFormats}, function(writableFileEntry) {


                  writableFileEntry.createWriter(function(writer) {
                  writer.onerror = errorHandler;
                  writer.onwrite = function(e) {
                    writer.onwrite=null;
                    writer.truncate(writer.position);
                    
                    if (filemanager.isOK==false || preferencesobj['prcloudsaving']=='proff') {
                      documenttitle=writableFileEntry.name;
                      by('id:titletext').value(documenttitle);
                      if (preferencesobj['prcloudsaving']=='proff') {
                        editor.documentsaved=true;
                      }
                    } else {
                      editor.documentsaved=true;
                    }
                    entry_persistent=writableFileEntry;
                    deleteandinitautosave();
                    wrapper.click();
                    if (filemanager.isOK) {
                              	chrome.fileSystem.getDisplayPath(writableFileEntry, function (displayPath) {
                              		filemanager.markAsLocalSaved(documenttitle+documentid+'.cml',displayPath);
                              	});
                              }

                    	file_ext=getFileExtension(writableFileEntry.name);
                    	//console.log(file_ext);
						if (file_ext!=null && markdowntextext.indexOf(file_ext)!=-1) {
   							if (file_ext=='txt' || file_ext=='text') {
      							preferencesobj['prdefaultformat']='txt';
	   						} else {
	 						    preferencesobj['prdefaultformat']='md';
	   						}
						} else if (file_ext!=null && (file_ext=='htm' || file_ext=='html')) {
							preferencesobj['prdefaultformat']='html';
						} else if (file_ext!=null && file_ext=='docx') {
			              preferencesobj['prdefaultformat']='docx';
			              //entry_persistent=null;
			            }  else {
							preferencesobj['prdefaultformat']='cml';
						}
						chrome.storage.local.set({'preferencesobj': preferencesobj});
						addEntryToRecentEntries(writableFileEntry);

                  };


                var content=getContenttoSave(writableFileEntry.name);

                  writer.write(new Blob(content, {type: 'text/html;charset=UTF-8'}));
                  }, errorHandler);

        });
         var errorHandler=function (e) {
                 alert_window(chrome.i18n.getMessage("errorsavingmsg"));
                };
}


function opsavedirect_clic () {
    if (entry_persistent===null) {
      by('id:opsave').clic();
    } else {
       var errorCallback=function (e) {
                 by('id:opsave').clic();
                };
                    chrome.fileSystem.getWritableEntry(entry_persistent, function(writableFileEntry) {
                        writableFileEntry.createWriter(function(writer) {
                          writer.onerror = errorCallback;
                          writer.onwrite = function (e) {
                              writer.onwrite=null;
                              writer.truncate(writer.position);
                              entry_persistent=writableFileEntry;
                              editor.documentsaved=true;
                              by('id:save_msg').stop().opacity(0.9).show().animate(200,1000).opacity(0).done(function () {this.hide()});
                              deleteandinitautosave();
                              if (filemanager.isOK) {
                              	chrome.fileSystem.getDisplayPath(writableFileEntry, function (displayPath) {
                              		filemanager.markAsLocalSaved(documenttitle+documentid+'.cml',displayPath);
                              	});
                              }
                              wrapper.click();
                              };
                        entry_persistent.file(function(file) {
                        var content=getContenttoSave(file.name);
                        writer.write(new Blob(content, {type: 'text/html; charset=UTF-8'}));

                        });
                      }, errorCallback);
                    });

    }
}




function ctrlfinput_input() {
  marcas=new GrapeGroup();
  current_mark=0;
  editor.unfocusmode(true);
  this.style('outline','none');
  editor.removeStyles();

  var val=this.value().trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
   if (val.length>0) {
        var rxp=make_pattern(val);
       findAndReplaceDOMText(mainarea.seed, {
        find: rxp,
        wrap: 'mark'
      });
      mainarea.addClass("focusmodeon");
      marcas=by('mark');
      if (marcas.length==0) {
        this.style('outline','rgb(185,84,84) solid 1px');
      } else {
        for (var i=current_mark; i<marcas.length; i++) {
            var posiy=marcas.item(i).topOffset();

            if (posiy>0 && posiy<raceme.window.height()) {
              current_mark=i;

              break;
            }
        }
        if (preferencesobj['prdark'] && preferencesobj['prdark']=='pron') {
        marcas.item(current_mark).style('background-color','rgba(255,255,255,0.2)').topOffset(100);
        } else {
        marcas.item(current_mark).style('background-color','rgba(0,0,0,0.2)').topOffset(100);
        }

      }
   } else {
   current_mark=0;
   }
}

function dosearchfilemanager() {
  by('id:remove_button').removeEvent();
  by('id:remove_button').addClass('remove_button_disabled');
  by('class:current_selected_file').removeClass('current_selected_file');
  var val=this.value().trim();
  if (val=='') {
    by('id:lupasearchfilemanager').show();
    by('id:stopsearchfilemanager').hide();
  } else {
    by('id:lupasearchfilemanager').hide();
    by('id:stopsearchfilemanager').show();
  }
  var vals=val.split(" ");
  by('id:file_list').getChildren().each(function () {
      if (val=='') {
        this.show();
      } else {
        var coincide=true;
        for (var g=0; g<vals.length;g++) {
          if (this._calmly_nom_doc.toUpperCase().indexOf(vals[g].toUpperCase())==-1) {
            coincide=false; break;
          }
        }
        if (coincide==false) {
          this.hide();
        } else {
          this.show();
        }
      }
  });
}



function getWords(elm) {
var words='';
var hijos=elm.childNodes;
for (var i=0; i<hijos.length;i++) {
    if (hijos[i].nodeType==3) {
     words+=hijos[i].nodeValue.split('\n').join(' ');
    } else if (hijos[i].nodeType==1) {
      words+=getWords(hijos[i]);
    }

}
name=elm.tagName;
if (name=='P' || name=='BLOCKQUOTE' || name=='UL' || name=='OL' || name=='LI' || editor.HTMLheaders.indexOf(name)!=-1 || name=='DIV' || name=='TR' || name=='TABLE' || name=='TD' || name=='THEAD' || name=='TBODY' || name=='TH' || name=='BR' || name=='HR') words+=' ';
return words;
}





function calmlylogo_clic(e) {
  editor.disableZoomOut();
  hide_tooltip_links_openable();
  current_mark=0;
  by('id:ctrlf').animate(300).ease('out').style('top','-45px');
  editor.unfocusmode();
  editor.hideTooltip();
  hidefilemanager();
  hidepreferences_window();
  if (menuopen==false) {
      menuopen=true;
      updatewordcounter();
      by('id:countdiv').remove().removeClass('alwaysvisible').addTo(by('id:options'));
      if (is_full()==true) {
            showcalmlylogo(false);
            options.opacity(1).style('left','0px');
            if (menuanimation) menuanimation.stop();
            menuanimation=wrappergroup.animate(150,200).ease('out').style('left','300px').style('right','-'+getRightDisplacement(300)+'px');


      } else {

          options.opacity(1).style('left','0px');
          if (menuanimation) menuanimation.stop();
          menuanimation=wrappergroup.animate(150).ease('out').style('left','300px').style('right','-'+getRightDisplacement(300)+'px');
      }


  } else {
      forceclosemenu();


  }
};

function getRightDisplacement(right_mov) {
      var mainareawidth=parseInt(mainarea.style('width'))+66;

      var wininner=window.innerWidth;
      if (wininner-right_mov>mainareawidth) {
        return 0;
      }

      return mainareawidth-(wininner-right_mov);
}

function updatewordcounter() {
      var seltext=window.getSelection().toString();
      var splittext;
      if (seltext=='') {
        splittext=getWords(mainarea.seed).trim();
      } else {
        splittext=seltext.split('\n').join(' ');
      }
      var regex_1 = /\s+([;–—:….,!‘’“”"'-?¿¡:={}\(\)_\[\]])/g;
      var regex_2 = /([;–—:….,!‘’“”"'-?¿¡:={}\(\)_\[\]])+\s/g;
      var regex_3=/([;–—:….,!‘’“”"'-?¿¡:={}\(\)_\[\]])/g;
      var splitwords=splittext.replace(regex_1, ' ').replace(regex_2,' ').replace(regex_3,'').replace(/\s{2,}/g, ' ').split(' ');
      for (var h=0; h<splitwords.length; h++) {
        if (splitwords[h]=='') {
            splitwords.splice(h,1);
            h--;
        }
      }
      var splitchars=splittext.split(' ').join('');
      var numchars=splitchars.length;
      var numwords;
      numwords=splitwords.length;

      // 270 word per minute

      var inforeading='<span class="countline">'+numwords.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+' '+chrome.i18n.getMessage("words")+'</span><span class="countline">'+numchars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+' '+chrome.i18n.getMessage("characters")+'</span><span class="countline">'+getReadingTime((numwords/270)*60)+' '+chrome.i18n.getMessage("readingtime")+'</span>';
      if (seltext!='') inforeading='<span style="opacity:0.7" class="countline">'+chrome.i18n.getMessage("selectedtext")+'</span><br />'+inforeading;

      by('id:countdiv').seed.innerHTML=inforeading;
}
function callwordcounter() {
  if (preferencesobj['prwordcounter'] && preferencesobj['prwordcounter']=='pron') {
    if (countertimeout) clearTimeout(countertimeout);
        countertimeout=setTimeout(function () {
          updatewordcounter();
        },50);
      }
}

function showhidefilemanager() {
  hidepreferences_window();
  if (menuopen) {
    if (filemanageropen==false) {
        showfilemanager();
    } else {
        hidefilemanager();
    }
  }
}

function showfilemanager() {

 if (filemanageropen==false) {
 	
 	
 	updateRecentEntries();
    by('id:stopsearchfilemanager').clic();
    by('id:documentremoved_msg').hide();
    by('id:yes_remove_button').hide();
    by('id:no_remove_button').hide();
    by('id:remove_button').show();
     if (menuanimation) menuanimation.stop();
     var fil_lis=by('id:file_list');
     fil_lis.clear();
     new Grape('img','html').attr('src','img/loading.png').opacity(0.5).style('display','block').style('margin','auto').style('margin-top','20px').addTo(fil_lis);
     
     filemanager.getGrapes();

      by('id:file_manager').show();
      by('id:preferences_window').hide();


      menuanimation=wrappergroup.style('left','300px').animate(150).ease('out').style('left','785px').style('right','-'+getRightDisplacement(785)+'px');
      filemanageropen=true;
      by('id:opopen').addClass('selected_option');
      by('id:file_manager_recent_list').scrollTop(0);
  }

}

function removeFileItem(gr) {
 

 filemanager.removeFile(gr._calmly_nom_doc+gr._calmly_id_doc+'.cml', function () {
                      
                      by('id:remove_button').removeEvent();
                      by('id:remove_button').addClass('remove_button_disabled').show();
                       by('id:documentremoved_msg').hide();
                      by('id:no_remove_button').hide();
                     by('id:yes_remove_button').hide();
                      new_doc(false);
                      editor.mainarea.blur();

                     
  })
}

function hidefilemanager() {

  if (filemanageropen) {
     by('id:opopen').removeClass('selected_option');
      if (menuanimation) menuanimation.stop();
      menuanimation=wrappergroup.animate(150).ease('out').style('left','300px').style('right','-'+getRightDisplacement(300)+'px').done(function () {by('id:file_manager').hide();});
      filemanageropen=false;

  }
  by('id:opopen').removeClass('selected_option');
}

function ctrlmove (direc) {
     marcas=new GrapeGroup();
      editor.removeStyles();
       var val=ctrlfinput.value().trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
       if (val!='') {
            var rxp=make_pattern(val);
           findAndReplaceDOMText(mainarea.seed, {
            find: rxp,
            wrap: 'mark'
          });
          mainarea.addClass("focusmodeon");
          marcas=by('mark');
           if (marcas.length>0) {
            if (direc=='next') {
                current_mark++;
                } else {
                current_mark--;
                }
            if (current_mark<0) current_mark=marcas.length-1;
            if (current_mark>marcas.length-1) current_mark=0;
            ctrlfinput.focus();
            if (preferencesobj['prdark'] && preferencesobj['prdark']=='pron') {
            marcas.item(current_mark).style('background-color','rgba(255,255,255,0.2)').animate(300).ease('inout','quad').topOffset(100).done(function () { ctrlfinput.focus();});
            } else {
            marcas.item(current_mark).style('background-color','rgba(0,0,0,0.2)').animate(300).ease('inout','quad').topOffset(100).done(function () { ctrlfinput.focus();});
            }
          }
       }


}

function showcalmlylogo (sh) {
if (is_full()==true) {
    if (sh==true) {
    wrapper.removeClass('disablescroll');
    calmlylogo.stop().show().animate(200).ease('out').opacity(1).done(function () {});
    } else {

    calmlylogo.stop().animate(200).ease('out').opacity(0).done(function () {this.hide();});
    }
} else {
calmlylogo.hide();
}


}

function forceclosemenu(instant) {

  menuopen=false;
  if (menuanimation) menuanimation.stop();
  if (typeof instant==='undefined' || instant==false) {
    menuanimation=wrappergroup.animate(150).ease('out').style('left','0px').style('right','0px').done(function () {
      if (preferencesobj['prwordcounter'] && preferencesobj['prwordcounter']=='pron') by('id:countdiv').remove().addClass('alwaysvisible').addTo(by('id:wrapper'));
      options.style('left','-300px'); showcalmlylogo(true); by('id:file_manager').hide(); editor.marginImgs();});
  } else {
  wrappergroup.style('left','0px').style('right','0px');
  options.style('left','-300px'); showcalmlylogo(true); by('id:file_manager').hide();
  editor.marginImgs();
  if (preferencesobj['prwordcounter'] && preferencesobj['prwordcounter']=='pron') by('id:countdiv').remove().addClass('alwaysvisible').addTo(by('id:wrapper')); 
  }
}




function scrollEffect(e) {


    hide_tooltip_links_openable();


    if (preventhidetooltip==false) editor.hideTooltip();
    preventhidetooltip=false;

    if (wrapper.seed.scrollTop>0) {
      if (topshadow.style('display')=='none') {

          topshadow.stop().style('display','block').animate(300).style('opacity','1');


      }

    } else  {
      if (topshadow.style('display')=='block') {

        topshadow.stop().style('opacity','0').style('display','none');


     }
    }

    if (wrapper.seed.scrollTop+window.innerHeight<mainarea.seed.clientHeight-45) {
      if (bottomshadow.style('display')=='none') {
        bottomshadow.stop().style('display','block').animate(300).style('opacity','1');


        }
    } else {
      if (bottomshadow.style('display')=='block') {
        bottomshadow.stop().style('opacity','0').style('display','none');
      }
    }



}

function ajustarImg() {
  var ratio=1;
  if ((window.innerWidth/this.seed.width)>(window.innerHeight/this.seed.height)) {
  ratio=window.innerWidth/this.seed.width;
  } else {
  ratio=window.innerHeight/this.seed.height;
  }

  var nuevo_width=this.seed.width*ratio;
  var nuevo_height=this.seed.height*ratio;
  this.style('position','absolute').style('left','-'+((nuevo_width-window.innerWidth)/2)+'px').style('top','-'+((nuevo_height-window.innerHeight)/2)+'px');
 this.width(nuevo_width);
 this.height(nuevo_height);
 if (this.opacity()==0) {
    this.animate(500).ease('out').opacity(0.8);
 }

}


function alert_window(text, confn, contxt) {
editor.mainarea.blur();
if (by('id:alert_window')!=null) by('id:alert_window').remove();
var al=new Grape('div','html').id('alert_window');
al.style('overflow','hidden').style('width','100%').style('height','100%').style('position','absolute').style('top','0px').style('left','0px').style('background-color','rgba(0,0,0,0.7)').style('z-index','2000');

by('body').item(0).addChild(al);
var wn=new Grape('div','html')
  .style('max-width','600px')
  .style('margin','auto')
  .style('position','relative')
  .opacity(0)
  .style('background-color','rgb(245,245,245)')
  .style('padding','20px')
  .style('box-shadow','0px 0px 7px rgb(0, 0, 0)')
  .style('min-height','150px')
  .style('font-size','16px')
  .text(text)
  .addTo(al);
var bt=new Grape('div','html')
  .style('display','block')
   .style('width','200px')
  .style('margin-top','20px')
  .style('text-align','center')
  .style('border-radius','2px')
  .style('background-color','rgb(0,179,114)')
  .style('color','white')
  .style('padding','8px')
  .style('position','absolute')
  .style('right','20px')
  .style('bottom','20px')
  .addTo(wn);

if (typeof confn==='undefined') {
  bt.text(chrome.i18n.getMessage("acceptmsg")).style('right','20px');
} else {
  bt.text(chrome.i18n.getMessage("cancelmsg")).style('left','20px');
  var oklink=new Grape('a','html')

  .style('display','block')

  .style('text-align','right')
  .addClass('oklink')
  .style('margin-bottom','8px')
  .style('position','absolute')
  .style('right','20px')
  .style('bottom','20px')
  .text(contxt)
  .addTo(wn);
  oklink.clic(function () { bt.click(); confn.call();});
}

wn.style('top',((window.innerHeight/2)-(wn.seed.clientHeight/2))+'px');
wn.animate(500).ease('out').opacity(1).style('top','-=40px');
by('id:titletext').focus().blur();
bt.click(function () {
    al.remove();
    wrapper.clic();
});
al.click(function (e) {
if (e.target==e.currentTarget) bt.click();
},'alclick',false);
al.mousemove(function (e) {
e.preventDefault();
});



}

function code_window() {
if (by('id:alert_window')!=null) by('id:alert_window').remove();
var al=new Grape('div','html').id('alert_window');
al.style('overflow','hidden').style('width','100%').style('height','100%').style('position','absolute').style('top','0px').style('left','0px').style('background-color','rgba(0,0,0,0.7)').style('z-index','2000');

by('body').item(0).addChild(al);
var wn=new Grape('div','html')
  .style('left','40px')
  .style('top','70px')
  .style('bottom','10px')
  .style('right','40px')
  .style('position','absolute')
  .opacity(0)
  .style('background-color','rgb(245,245,245)')
  .style('padding','20px')
  .style('box-shadow','0px 0px 7px rgb(0, 0, 0)')
  .style('font-size','16px')
  .addTo(al);
var bt=new Grape('div','html')
  .style('display','block')
  .style('width','200px')
  .style('margin-top','20px')
  .style('text-align','center')
  .style('border-radius','2px')
  .style('background-color','rgb(0,179,114)')
  .style('color','white')
  .style('padding','8px')
  .style('position','absolute')
  .style('left','20px')
  .style('bottom','20px')
  .text(chrome.i18n.getMessage('htmlsourceclosemsg'))
  .addTo(wn);
var code=new Grape('div','html')
  .style('left','20px')
  .style('top','20px')
  .style('bottom','80px')
  .style('right','20px')
  .style('position','absolute')
  .style('overflow','auto')
  .style('border-width','1px')
  .style('border-color','rgb(240,240,240)')
  .style('border-style','solid')
  .style('background-color','rgb(250,250,250)')
  .style('padding','10px')
  .style('-webkit-user-select','text')
  .style('user-select','text')


  .addTo(wn);

  code.seed.innerHTML='<pre><code>'+(editor.htmlCode().split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;'))+'</code></pre>';
  var range = document.createRange();
  range.selectNodeContents(code.seed);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

wn.animate(320).ease('out').opacity(1).style('top','40px').style('bottom','40px');

bt.click(function () {
    al.remove();
    wrapper.clic();
});






}

function hidepreferences_window() {

  if (preferencesopen) {
     by('id:oppreferences').removeClass('selected_option');
      if (menuanimation) menuanimation.stop();
      menuanimation=wrappergroup.animate(150).ease('out').style('left','300px').style('right','-'+getRightDisplacement(300)+'px').done(function () {by('id:preferences_window').hide();});
      preferencesopen=false;
  }
}

function showpreferences_window() {

  if (preferencesopen==false) {
     if (menuanimation) menuanimation.stop();
     var pwin=by('id:preferences_window');
     by('id:file_manager').hide();
     focusmode_checkbox=new Checkbox('prfocusmode');
     pwin.clear()
      .addChild(new Grape('div','html').text(chrome.i18n.getMessage('prscreen')).addClass('prTitle'))
      .addChild(focusmode_checkbox.getGrape())
      .addChild(new Checkbox('prdark').getGrape())
      .addChild(new Selector('prtextwidth',['prnarrow','prmedium','prwide']).getGrape())
      .addChild(new Selector('prfont',['prdroid','prcousine','propensans']).getGrape())
      .addChild(new Selector('prfontsize',['prfontsmall','prfontmedium','prfontlarge']).getGrape())
      .addChild(ColorSelector())
      .addChild(new Checkbox('prmarginparagraphs').getGrape())
      .addChild(new Grape('div','html').text(chrome.i18n.getMessage('prsmartpunctuation')).addClass('prTitle'))
      .addChild(new Checkbox('prsmartquotes').getGrape())
      .addChild(new Checkbox('prsmartdash').getGrape())
      .addChild(new Checkbox('prsmartellipses').getGrape())
      .addChild(new Checkbox('prautocapitalization').getGrape())
      .addChild(new Grape('div','html').text(chrome.i18n.getMessage('prformatting')).addClass('prTitle'))
      .addChild(new Checkbox('prtoolbar').getGrape())
      .addChild(new Checkbox('prasterisk').getGrape())
      .addChild(new Checkbox('prnumbered').getGrape());
    //if (useruilanguage!='ru' || filemanager.isOK || mp3_return.play) {
      pwin.addChild(new Grape('div','html').text(chrome.i18n.getMessage('customizationmsg')).addClass('prTitle'));
    //}  
    
    if (filemanager.isOK) {
      pwin.addChild(new Checkbox('prcloudsaving').getGrape());
    }
    if (mp3_return.play) {
      pwin.addChild(new Checkbox('prtypesound').getGrape());
    }
    pwin.addChild(new Checkbox('prwordcounter').getGrape());
    if (useruilanguage!='ru') {
      pwin.addChild(new Checkbox('prdyslexic').getGrape());
    }

      

      pwin.show();

      //if (preferencesobj['prdyslexic'] && preferencesobj['prdyslexic']=='pron' && useruilanguage!='ru') {
      //  by('id:dr_droid_selector').text(chrome.i18n.getMessage("prdyslexicregular"));
      //  by('id:dr_cousine_selector').text(chrome.i18n.getMessage("prdyslexicmono"));
      //} else {
        by('id:dr_droid_selector').text(chrome.i18n.getMessage("prdroid"));
        by('id:dr_cousine_selector').text(chrome.i18n.getMessage("prcousine"));
        by('id:dr_opensans_selector').text("Open Sans");
      //}




      menuanimation=wrappergroup.style('left','300px').animate(150).ease('out').style('left','785px').style('right','-'+getRightDisplacement(785)+'px');
      preferencesopen=true;
      by('id:oppreferences').addClass('selected_option');

  }

}

function preferences_window() {
      hidefilemanager();
      if (preferencesopen==false) {
        showpreferences_window();
      } else {
        hidepreferences_window();
      }
}

function applyPreferences() {

  if (preferencesobj['prdark'] && preferencesobj['prdark']=='pron') {
    by('body').item(0).addClass("darkmode");
  } else {
    by('body').item(0).removeClass("darkmode");
    preferencesobj['prdark']='proff';
  }

  if (preferencesobj['prfont'] && preferencesobj['prfont']=='prcousine') {
    mainarea.removeClass('droid').removeClass('opensans').addClass('cousine');
  } else if (preferencesobj['prfont'] && preferencesobj['prfont']=='propensans') { 
    mainarea.removeClass('cousine').removeClass('droid').addClass('opensans');
  } else {
    mainarea.removeClass('cousine').removeClass('opensans').addClass('droid');
    preferencesobj['prfont']='prdroid';
  }

  if (preferencesobj['prtypesound'] && preferencesobj['prtypesound']=='pron') {
    preferencesobj['prtypesound']='pron';
  } else {
    preferencesobj['prtypesound']='proff';
  }
  if (preferencesobj['prautocapitalization'] && preferencesobj['prautocapitalization']=='pron') {
    preferencesobj['prautocapitalization']='pron';
  } else {
    preferencesobj['prautocapitalization']='proff';
  }

  if (preferencesobj['prtoolbar'] && preferencesobj['prtoolbar']=='proff') {
    preferencesobj['prtoolbar']='proff';
  } else {
    preferencesobj['prtoolbar']='pron';
  }
  if (preferencesobj['prcloudsaving'] && preferencesobj['prcloudsaving']=='proff') {
    preferencesobj['prcloudsaving']='proff';
    by('id:opsavedirect').show();
  } else {
    preferencesobj['prcloudsaving']='pron';
    by('id:opsavedirect').show();
    /*
    if (filemanager && filemanager.isOK) {
    	by('id:opsavedirect').hide();
    }
    */
    trytoautosave();
  }

  if (!preferencesobj['prtextcaret']) preferencesobj['prtextcaret']='default';
  if (!preferencesobj['prdefaultformat']) preferencesobj['prdefaultformat']='cml';
  if (preferencesobj['prtextcaret']=='default') {
    mainarea.removeClass('pinkcaret').removeClass('orangecaret').removeClass('greencaret').removeClass('bluecaret');
    by('class:colorpicker').removeClass('selected_colorpicker');
    by('class:default_colorpicker').addClass('selected_colorpicker');
  } else if (preferencesobj['prtextcaret']=='blue') {
    mainarea.removeClass('pinkcaret').removeClass('orangecaret').removeClass('greencaret').addClass('bluecaret');
    by('class:colorpicker').removeClass('selected_colorpicker');
    by('class:blue_colorpicker').addClass('selected_colorpicker');
  } else if (preferencesobj['prtextcaret']=='pink') {
    mainarea.removeClass('pinkcaret').removeClass('orangecaret').removeClass('greencaret').addClass('bluecaret').addClass('pinkcaret');
    by('class:colorpicker').removeClass('selected_colorpicker');
    by('class:pink_colorpicker').addClass('selected_colorpicker');
  } else if (preferencesobj['prtextcaret']=='orange') {
    mainarea.removeClass('pinkcaret').removeClass('orangecaret').removeClass('greencaret').addClass('bluecaret').addClass('orangecaret');
    by('class:colorpicker').removeClass('selected_colorpicker');
    by('class:orange_colorpicker').addClass('selected_colorpicker');
  } else if (preferencesobj['prtextcaret']=='green') {
    mainarea.removeClass('pinkcaret').removeClass('orangecaret').removeClass('greencaret').addClass('bluecaret').addClass('greencaret');
    by('class:colorpicker').removeClass('selected_colorpicker');
    by('class:green_colorpicker').addClass('selected_colorpicker');
  }

  if (preferencesobj['prtextwidth'] && preferencesobj['prtextwidth']=='prnarrow') {
     mainarea.style('max-width','550px');
     if (preferencesopen) {
        wrappergroup.style('right','-'+wrapper.style('left'));
        editor.marginImgs(); editor.interactionImgs();
        wrappergroup.style('right','-'+getRightDisplacement(785)+'px');
        editor.marginImgs(); editor.interactionImgs();
      }

  } else if (preferencesobj['prtextwidth'] && preferencesobj['prtextwidth']=='prwide') {
     mainarea.style('max-width','975px');
      if (preferencesopen) {
        wrappergroup.style('right','-'+wrapper.style('left'));
        editor.marginImgs(); editor.interactionImgs();
        wrappergroup.style('right','-'+getRightDisplacement(785)+'px');
        editor.marginImgs(); editor.interactionImgs();
      }
  } else {
   preferencesobj['prtextwidth']='prmedium';
   mainarea.style('max-width','750px');
    if (preferencesopen) {
        wrappergroup.style('right','-'+wrapper.style('left'));
        editor.marginImgs(); editor.interactionImgs();
        wrappergroup.style('right','-'+getRightDisplacement(785)+'px');
        editor.marginImgs(); editor.interactionImgs();
      }
  }

  if (preferencesobj['prfontsize'] && preferencesobj['prfontsize']=='prfontsmall') {
      by('body').item(0).removeClass("prfontsize_large").addClass('prfontsize_small');
  } else if (preferencesobj['prfontsize'] && preferencesobj['prfontsize']=='prfontlarge') {
      by('body').item(0).removeClass("prfontsize_small").addClass('prfontsize_large');
  } else {
      preferencesobj['prfontsize']='prfontmedium';
      by('body').item(0).removeClass("prfontsize_large").removeClass('prfontsize_small');
  }
  if (preferencesobj['prmarginparagraphs'] && preferencesobj['prmarginparagraphs']=='proff') {
    by('body').item(0).addClass("nomarginsbetweenP");
  } else {
    preferencesobj['prmarginparagraphs']='pron';
    by('body').item(0).removeClass("nomarginsbetweenP");
  }
  if (preferencesobj['prdyslexic'] && preferencesobj['prdyslexic']=='pron' && useruilanguage!='ru') {
    by('body').item(0).addClass("opendyslexicfont"); 
    //by('id:dr_droid_selector').text(chrome.i18n.getMessage("prdyslexicregular"));
    //by('id:dr_cousine_selector').text(chrome.i18n.getMessage("prdyslexicmono"));
  } else {
    by('body').item(0).removeClass("opendyslexicfont"); 
    //by('id:dr_droid_selector').text(chrome.i18n.getMessage("prdroid"));
    //by('id:dr_cousine_selector').text(chrome.i18n.getMessage("prcousine"));
  }

  if (preferencesobj['prwordcounter'] && preferencesobj['prwordcounter']=='pron' && !menuopen) {
    by('id:countdiv').remove().addClass('alwaysvisible').addTo(by('id:wrapper'));
  } else {
    by('id:countdiv').remove().removeClass('alwaysvisible').addTo(by('id:options'));
  }

  if (preferencesobj['prfocusmode'] && preferencesobj['prfocusmode']=='pron') {

    editor.focusmodeon=true;
    editor.unfocusmode(true);


  } else {
    preferencesobj['prfocusmode']='proff';
    editor.focusmodeon=false;
    editor.unfocusmode(false);
  }

  if (preferencesobj['prasterisk'] && preferencesobj['prasterisk']=='proff') {
    preferencesobj['prasterisk']='proff';
  } else {
    preferencesobj['prasterisk']='pron';
  }

  if (preferencesobj['prnumbered'] && preferencesobj['prnumbered']=='proff') {
    preferencesobj['prnumbered']='proff';
  } else {
    preferencesobj['prnumbered']='pron';
  }

  editor.marginImgs();



}




function abrir_fichero(e) {
 
var fileformats=markdowntextext.slice(0);
fileformats.push('cml');
fileformats.push('htm');
fileformats.push('html');
fileformats.push('docx');

chrome.fileSystem.chooseEntry({type: 'openWritableFile','accepts': [
          {'description': 'Calmly Writer, HTML, Plain text, Markdown, Microsoft Word .docx', 'extensions': fileformats}
        ]}, function(readEntry) {

    readEntry.file(function(file) {

      leer_contenido_fichero(file,readEntry);
      
      
    });
	});


}
function leer_contenido_fichero(file,readEntry) {
      var reader = new FileReader();

      reader.onerror = function () {invalid_file();};
      reader.onloadend = function(e) {

        var parser;
        var doc;
        var child;

       try {
               var filetype=file.type;
               var file_ext=getFileExtension(file.name);
               if (file_ext=='docx') {
                 filetype='docx';
               }  else if (filetype=='') {   
                  if (file_ext!=null && markdowntextext.indexOf(file_ext)!=-1) filetype='text/plain';
               }
               
               addEntryToRecentEntries(readEntry);
               
              
                if (filetype=='docx') {
                   
                     mammoth.convertToHtml({arrayBuffer: e.target.result},{styleMap: ["p[style-name='blockQuote'] => blockquote:fresh"]})
                          .then(function(result){
                              var html = '<html><body>'+result.value+'</body></html>'; 
                              unblock_screen();
                              content_2_editor(html, 'text/html',file,readEntry);
                          }).done();
                
                }  else {
                  unblock_screen();
                  if (file_ext!='docx' && file_ext!='cml' && file_ext!='html' && file_ext!='htm' && markdowntextext.indexOf(file_ext)==-1) {
                  	content_2_editor(e.target.result, filetype,file,readEntry,false);
                  } else {
                  	content_2_editor(e.target.result, filetype,file,readEntry);
                  }
                  
                  
               }




        } catch (err) {
          unblock_screen();
          console.log(err);
          invalid_file();

        }










      };
      var fi_ex=getFileExtension(file.name);
      if (fi_ex=='docx') {
         block_screen();
        reader.readAsArrayBuffer(file);
      } else {
         block_screen();
        reader.readAsText(file);  
      }
}

function block_screen() {
  by('id:loader_block_screen').show();
  by('id:loader_input_block').value('').focus();
  
  


}
function unblock_screen() {
  by('id:loader_block_screen').hide();
}

function content_2_editor(result,filetype,file,readEntry,makeEntryPersistent) {
                        if (typeof makeEntryPersistent!=='boolean') makeEntryPersistent=true;
                       if (filetype!='text/plain') {
                          parser = new DOMParser();
                          doc = parser.parseFromString(result, "text/html");
                          child=doc.getElementsByTagName('body').item(0);
                          }

                       editor.mainarea.clear();
                       var tipo;

                       if (filetype=='text/html') {
                          tipo='html';

                       } else if (filetype=='text/plain') {
                          tipo='texto';
                       } else {
                         tipo='texto';
                         for (var d=0; d<child.childNodes.length;d++) {
                            if (child.childNodes.item(d).nodeType!=3 && !(child.childNodes.item(d) instanceof HTMLUnknownElement)) {
                              tipo='html';
                              break;
                            }
                         }
                       }
                       if (tipo=='texto') {
                       // Texto plano
                           var contenido=marked(result.split(String.fromCharCode(160)).join('&nbsp;'));
                           editor.mainarea.seed.innerHTML=contenido;
                       } else {
                       // html
                          while (child.hasChildNodes()) {
                            editor.mainarea.seed.appendChild(child.removeChild(child.firstChild));
                          }
                       }

                      editor.removeStyles();
                      editor.removeNBSP();
                      resize_window();
                      wrapper.scrollTop(26);
                      documenttitle=file.name;

                      if (filemanager.isOK && preferencesobj['prcloudsaving']=='pron') {
                      	//if (documenttitle.lastIndexOf('.')) documenttitle=documenttitle.substr(0,documenttitle.lastIndexOf('.')); 
                        if (documenttitle.length>4 && documenttitle.substr(documenttitle.length-4,4).toUpperCase()=='.CML') documenttitle=documenttitle.substr(0,documenttitle.length-4);
                      }
                      by('id:titletext').value(documenttitle);
                      if (makeEntryPersistent && readEntry) {
                        entry_persistent=readEntry;
                      } else {
                        entry_persistent=null;
                      }

                      wrapper.click();

                      editor.documentsaved=true;
                      make_links_openable();
                      deleteandinitautosave();
                      if (filemanager.isOK && preferencesobj['prcloudsaving']=='pron') {
                        setTimeout(function () {
                        	// Hay que esperar un poco para que resize_window (y su marginImgs) se ejecute antes
                        	chrome.fileSystem.getDisplayPath(readEntry, function (displayPath) {
                        		console.log(displayPath);
                              		filemanager.searchByFullPath(displayPath, documenttitle, function (result) {
                              			if (result && result.name.substr(0,result.name.length-40)==documenttitle) {
                              				documentid=result.name.substr(result.name.length-40,36);
                              				editor.documentsaved=true;
				                          	editor.documentcloudsaved=false;
				                          	trytoautosave(false,true);
                              			} else {
                              				if (result) {
                              				console.log(result);
                              				console.log(result.name.substr(0,result.name.length-40));
                              				console.log(documenttitle);
                              				}
				                          documentid=raceme._generateId();
				                          //editor.documentsaved=false;
				                          editor.documentcloudsaved=false;
				                          trytoautosave(false,true);    				
                              			}
                              		});
                             });
                        	
                          
                          
                        },500);
                      }
}

function insertar_imagen() {
chrome.fileSystem.chooseEntry({type: 'openFile'}, function(readEntry) {

    readEntry.file(function(file) {
      var reader = new FileReader();

      reader.onerror = function (e) {console.log(e); invalid_file();};
      reader.onloadend = function(e) {
        var parser;
    		var doc;

        try {





             if (e.target.result.substring(0,10)=='data:image') {
                wrapper.click();
                document.execCommand('insertHTML',false,"<img src='"+e.target.result+"'>");
                editor.documentsaved=false;
                editor.documentcloudsaved=false;
               editor.marginImgs();
               editor.interactionImgs();
                trytoautosave();
              } else {
                 wrapper.click();
                 alert_window(chrome.i18n.getMessage("pictureformatmsg"));
              }


        } catch (err) {
          console.log(err);
          invalid_file();

        }









      };

      reader.readAsDataURL(file);
    });
	});


}




function invalid_file() {
alert_window(chrome.i18n.getMessage("invalidfilemsg"));
}

function HtmlEncode(s)
{
  var el = document.createElement("div");
  el.innerText = el.textContent = s;
  s = el.innerHTML;
  return s;
}

function getReadingTime(segundos) {
    var s = parseInt(segundos,10);
    var h = Math.floor(s/3600);
    var m = Math.floor((s-(h * 3600))/60);
    var sec = s-(h*3600)-(m*60);

    if (h<10) h="0"+h;
    if (m<10) m="0"+m;
    if (sec<10) sec="0"+sec;
    return h+":"+m+':'+sec;

}
function make_pattern(search_string) {
    // split into words
    var words = search_string.split(/\s+/);

    // replace characters by their compositors
    var accent_replacer = function(chr) {
        return accented[chr.toUpperCase()] || chr;
    }
    for (var i = 0; i < words.length; i++) {
        words[i] = words[i].replace(/\S/g,accent_replacer);
    }

    // join as alternatives
    var regexp = words.join(" ");
    return new RegExp(regexp,'g');
}

function ValidURL(str) {
var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;
var pattern=new RegExp(urlRegEx);
 /*
 var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
*/
  return pattern.test(str);
}

var accented = {
    'A': '[Aa\xaa\xc0-\xc5\xe0-\xe5\u0100-\u0105\u01cd\u01ce\u0200-\u0203\u0226\u0227\u1d2c\u1d43\u1e00\u1e01\u1e9a\u1ea0-\u1ea3\u2090\u2100\u2101\u213b\u249c\u24b6\u24d0\u3371-\u3374\u3380-\u3384\u3388\u3389\u33a9-\u33af\u33c2\u33ca\u33df\u33ff\uff21\uff41]',
    'B': '[Bb\u1d2e\u1d47\u1e02-\u1e07\u212c\u249d\u24b7\u24d1\u3374\u3385-\u3387\u33c3\u33c8\u33d4\u33dd\uff22\uff42]',
    'C': '[Cc\xc7\xe7\u0106-\u010d\u1d9c\u2100\u2102\u2103\u2105\u2106\u212d\u216d\u217d\u249e\u24b8\u24d2\u3376\u3388\u3389\u339d\u33a0\u33a4\u33c4-\u33c7\uff23\uff43]',
    'D': '[Dd\u010e\u010f\u01c4-\u01c6\u01f1-\u01f3\u1d30\u1d48\u1e0a-\u1e13\u2145\u2146\u216e\u217e\u249f\u24b9\u24d3\u32cf\u3372\u3377-\u3379\u3397\u33ad-\u33af\u33c5\u33c8\uff24\uff44]',
    'E': '[Ee\xc8-\xcb\xe8-\xeb\u0112-\u011b\u0204-\u0207\u0228\u0229\u1d31\u1d49\u1e18-\u1e1b\u1eb8-\u1ebd\u2091\u2121\u212f\u2130\u2147\u24a0\u24ba\u24d4\u3250\u32cd\u32ce\uff25\uff45]',
    'F': '[Ff\u1da0\u1e1e\u1e1f\u2109\u2131\u213b\u24a1\u24bb\u24d5\u338a-\u338c\u3399\ufb00-\ufb04\uff26\uff46]',
    'G': '[Gg\u011c-\u0123\u01e6\u01e7\u01f4\u01f5\u1d33\u1d4d\u1e20\u1e21\u210a\u24a2\u24bc\u24d6\u32cc\u32cd\u3387\u338d-\u338f\u3393\u33ac\u33c6\u33c9\u33d2\u33ff\uff27\uff47]',
    'H': '[Hh\u0124\u0125\u021e\u021f\u02b0\u1d34\u1e22-\u1e2b\u1e96\u210b-\u210e\u24a3\u24bd\u24d7\u32cc\u3371\u3390-\u3394\u33ca\u33cb\u33d7\uff28\uff48]',
    'I': '[Ii\xcc-\xcf\xec-\xef\u0128-\u0130\u0132\u0133\u01cf\u01d0\u0208-\u020b\u1d35\u1d62\u1e2c\u1e2d\u1ec8-\u1ecb\u2071\u2110\u2111\u2139\u2148\u2160-\u2163\u2165-\u2168\u216a\u216b\u2170-\u2173\u2175-\u2178\u217a\u217b\u24a4\u24be\u24d8\u337a\u33cc\u33d5\ufb01\ufb03\uff29\uff49]',
    'J': '[Jj\u0132-\u0135\u01c7-\u01cc\u01f0\u02b2\u1d36\u2149\u24a5\u24bf\u24d9\u2c7c\uff2a\uff4a]',
    'K': '[Kk\u0136\u0137\u01e8\u01e9\u1d37\u1d4f\u1e30-\u1e35\u212a\u24a6\u24c0\u24da\u3384\u3385\u3389\u338f\u3391\u3398\u339e\u33a2\u33a6\u33aa\u33b8\u33be\u33c0\u33c6\u33cd-\u33cf\uff2b\uff4b]',
    'L': '[Ll\u0139-\u0140\u01c7-\u01c9\u02e1\u1d38\u1e36\u1e37\u1e3a-\u1e3d\u2112\u2113\u2121\u216c\u217c\u24a7\u24c1\u24db\u32cf\u3388\u3389\u33d0-\u33d3\u33d5\u33d6\u33ff\ufb02\ufb04\uff2c\uff4c]',
    'M': '[Mm\u1d39\u1d50\u1e3e-\u1e43\u2120\u2122\u2133\u216f\u217f\u24a8\u24c2\u24dc\u3377-\u3379\u3383\u3386\u338e\u3392\u3396\u3399-\u33a8\u33ab\u33b3\u33b7\u33b9\u33bd\u33bf\u33c1\u33c2\u33ce\u33d0\u33d4-\u33d6\u33d8\u33d9\u33de\u33df\uff2d\uff4d]',
    'N': '[Nn\xd1\xf1\u0143-\u0149\u01ca-\u01cc\u01f8\u01f9\u1d3a\u1e44-\u1e4b\u207f\u2115\u2116\u24a9\u24c3\u24dd\u3381\u338b\u339a\u33b1\u33b5\u33bb\u33cc\u33d1\uff2e\uff4e]',
    'O': '[Oo\xba\xd2-\xd6\xf2-\xf6\u014c-\u0151\u01a0\u01a1\u01d1\u01d2\u01ea\u01eb\u020c-\u020f\u022e\u022f\u1d3c\u1d52\u1ecc-\u1ecf\u2092\u2105\u2116\u2134\u24aa\u24c4\u24de\u3375\u33c7\u33d2\u33d6\uff2f\uff4f]',
    'P': '[Pp\u1d3e\u1d56\u1e54-\u1e57\u2119\u24ab\u24c5\u24df\u3250\u3371\u3376\u3380\u338a\u33a9-\u33ac\u33b0\u33b4\u33ba\u33cb\u33d7-\u33da\uff30\uff50]',
    'Q': '[Qq\u211a\u24ac\u24c6\u24e0\u33c3\uff31\uff51]',
    'R': '[Rr\u0154-\u0159\u0210-\u0213\u02b3\u1d3f\u1d63\u1e58-\u1e5b\u1e5e\u1e5f\u20a8\u211b-\u211d\u24ad\u24c7\u24e1\u32cd\u3374\u33ad-\u33af\u33da\u33db\uff32\uff52]',
    'S': '[Ss\u015a-\u0161\u017f\u0218\u0219\u02e2\u1e60-\u1e63\u20a8\u2101\u2120\u24ae\u24c8\u24e2\u33a7\u33a8\u33ae-\u33b3\u33db\u33dc\ufb06\uff33\uff53]',
    'T': '[Tt\u0162-\u0165\u021a\u021b\u1d40\u1d57\u1e6a-\u1e71\u1e97\u2121\u2122\u24af\u24c9\u24e3\u3250\u32cf\u3394\u33cf\ufb05\ufb06\uff34\uff54]',
    'U': '[Uu\xd9-\xdc\xf9-\xfc\u0168-\u0173\u01af\u01b0\u01d3\u01d4\u0214-\u0217\u1d41\u1d58\u1d64\u1e72-\u1e77\u1ee4-\u1ee7\u2106\u24b0\u24ca\u24e4\u3373\u337a\uff35\uff55]',
    'V': '[Vv\u1d5b\u1d65\u1e7c-\u1e7f\u2163-\u2167\u2173-\u2177\u24b1\u24cb\u24e5\u2c7d\u32ce\u3375\u33b4-\u33b9\u33dc\u33de\uff36\uff56]',
    'W': '[Ww\u0174\u0175\u02b7\u1d42\u1e80-\u1e89\u1e98\u24b2\u24cc\u24e6\u33ba-\u33bf\u33dd\uff37\uff57]',
    'X': '[Xx\u02e3\u1e8a-\u1e8d\u2093\u213b\u2168-\u216b\u2178-\u217b\u24b3\u24cd\u24e7\u33d3\uff38\uff58]',
    'Y': '[Yy\xdd\xfd\xff\u0176-\u0178\u0232\u0233\u02b8\u1e8e\u1e8f\u1e99\u1ef2-\u1ef9\u24b4\u24ce\u24e8\u33c9\uff39\uff59]',
    'Z': '[Zz\u0179-\u017e\u01f1-\u01f3\u1dbb\u1e90-\u1e95\u2124\u2128\u24b5\u24cf\u24e9\u3390-\u3394\uff3a\uff5a]'
};

function lengthInUtf8Bytes(str) {
   var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}


function deleteandinitautosave() {
  if (dbcurrent!=null && dbautosave) {
      canautosave=false;
      dbautosave.documents.remove(dbcurrent).then(function () {
       initunsaved();
      });

  } else {
    canautosave=true;
  }

}

function initunsaved() {

  dbcurrent=null;
  canautosave=true;
  trytoautosave();
}

function trytoautosave(delayed,local_opened_now) {
make_links_openable();
if (filemanager.isOK==false || preferencesobj['prcloudsaving']=='proff') {
      if (canautosave && dbcurrent==null) {

        if (editor.documentsaved==false) {
        var fec=new Date();

            canautosave=false;
            dbautosave.documents.add({date:fec,title:documenttitle,content:editor.htmlCode()}).then(function (records, server) {
              dbcurrent=records[0].id;
              canautosave=true;
              trytoautosave(false);
            });
        }
      } else if (canautosave && dbcurrent!==null) {

         canautosave=false;
         setTimeout(function () {
          if (editor.documentsaved==false && dbcurrent!==null) {
               var tim=new Date();
               dbautosave.documents
                .query('id')
                .only(dbcurrent)
                .modify({date:tim,title:documenttitle,content:editor.htmlCode()})
                .execute()
                .then(function (rec) {
                    dbcurrent=rec[0].id;
                    canautosave=true;

                });
            } else {
            canautosave=true;
            }
          },1000);
      }
  } else {

    if (canautosave && editor.documentcloudsaved==false) {
      
     
      canautosave=false;
      
      //if (typeof delayed=='boolean' && delayed==false) {
      //    filemanager.addFile(documenttitle+documentid+'.cml', editor.htmlCode(), function () {
            // done
      //      canautosave=true;
      //      editor.documentsaved=true;
      //    });
      //} else {

      	if (!local_opened_now) filemanager.markAsLocalUnsaved(documenttitle+documentid+'.cml');
        var waiting_time=3500;
        if (typeof delayed=='boolean' && delayed===false) waiting_time=0;
        setTimeout(function () {
          filemanager.addFile(documenttitle+documentid+'.cml', editor.htmlCode(), function () {
            // done
            canautosave=true;
            editor.documentcloudsaved=true;

            if (local_opened_now && entry_persistent) {
            	chrome.fileSystem.getDisplayPath(entry_persistent, function (displayPath) {
                    filemanager.markAsLocalSaved(documenttitle+documentid+'.cml',displayPath);
                });
            }
           
          });
        },waiting_time);
      //}   
    }
  }
}

function hidemenus(e) {
  if (menuopen==false) {
  wrapper.addClass('disablescroll');
      if (menuvisible) {

        if (is_full()==false) {

            by('id:titlebar').style('top','0px').stop().animate(300,300).ease('out').style('top','-28px');
            wrapper.style('top','0px');

            if ((wrapper.scrollTop()+wrapper.seed.clientHeight)<wrapper.seed.scrollHeight) wrapper.scrollTop(wrapper.scrollTop()-26);
            topshadow.stop().animate(300,300).ease('out').style('top','-15px');
            menuvisible=false;


        } else {
             calmlylogo.stop().animate(800,1000).ease('out').opacity(0);
             topshadow.stop().style('top','-15px');
             menuvisible=false;

        }




      }
  }

}

function showmenus (e) {

  if (menuvisible==false && (lastmousex!=e.clientX || lastmousey!=e.clientY)) {
    _showmenus();


  }

  lastmousex=e.clientX;
  lastmousey=e.clientY;


}

function _showmenus() {
 
  if (is_full()==false) {
    if (isMac==false) by('id:opexit').style('display','none');
     by('id:titlebar').stop().animate(300).ease('out').style('top','0px').done(function () {
      wrapper.removeClass('disablescroll');
      if (wrapper.seed.clientHeight!=wrapper.seed.scrollHeight)  {
            wrapper.style('top','26px');
            preventhidetooltip=true;

            if (wrapper.seed.scrollHeight-(wrapper.seed.clientHeight+wrapper.scrollTop())>25) {

            wrapper.scrollTop(wrapper.scrollTop()+26);
            } else {
            wrapper.scrollTop(wrapper.seed.scrollHeight);
            }




            } else {
            wrapper.style('top','0px');
            }

      });
      topshadow.stop().style('top','-15px').animate(300).ease('out').style('top','9px');
  } else {
      resize_window();
      by('id:opexit').style('display','block');
       mainarea.style('padding-top','50px');

       if (menuopen==false) showcalmlylogo(true);
       topshadow.stop().style('top','-15px');
  }

  menuvisible=true;

}
function is_full() {
if (window.innerHeight!=screen.height || window.innerWidth!=screen.width || (chrome.app.window.current().isMaximized() && isMac==false)) {
  return false;
}

return true;

}
function getFileExtension(name) {
  if (name.lastIndexOf('.')==-1) return null;
  return name.substr(name.lastIndexOf('.') + 1).toLowerCase();
}
function getContenttoSave(name) {


  var file_ext=getFileExtension(name);

  if (file_ext!=null && markdowntextext.indexOf(file_ext)!=-1) {
     if (file_ext=='txt' || file_ext=='text') {
        return [md(editor.htmlCode(),{inline:true}).split(String.fromCharCode(160)).join(' ')];
     }  else {
      
        var ccc=md(editor.htmlCode(),{inline:true});
        ccc=ccc.replace(/\\\[\^(.*?)\\\]/g,function (str, p1) {return "[^"+p1+"]";}); // Para que no se 'escapen' los footnotes tipo [^1] o [^hola]
        return [ccc];
     }
  } else if (file_ext!=null && file_ext=='docx') {
        
        
        return [generateDocx('<html>\n<body>\n'+editor.htmlCode(true)+'</body>\n</html>')]; 
     }

  return ['<html>\n<body>\n'+editor.htmlCode()+'</body>\n</html>'];

}

function isDescendant(parent, child) {
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");
    return dataURL;
}
function addEntryToRecentEntries(readEntry) {
	var retEnt=chrome.fileSystem.retainEntry(readEntry);
	if (retEnt) {
		chrome.fileSystem.getDisplayPath(readEntry, function (displayPath) {
			
			chrome.storage.local.get('recentfiles', function(result){
				
                    if (result.recentfiles && result.recentfiles.length) {
                    	for (var i=0; i<result.recentfiles.length;i++) {
                    		if (result.recentfiles[i].displayPath==displayPath) {
                    			result.recentfiles.splice(i,1);
                    			i--;
                    		}
                    	}
                    } else {
                    	result.recentfiles=[];
                    	
                    }
                    result.recentfiles.unshift({'retEnt':retEnt,'displayPath':displayPath});
                    while (result.recentfiles.length>20) {
                    	result.recentfiles.pop();
                    }
                    chrome.storage.local.set({'recentfiles': result.recentfiles});
                    updateRecentEntries();
            });
		});
	}
}
function updateRecentEntries() {
	chrome.storage.local.get('recentfiles',function (result) {
		var divlist=by('id:file_manager_recent_list');
		if (divlist) divlist.clear();
    	if (result.recentfiles && result.recentfiles.length && divlist) {
    		for (var i=0;i<result.recentfiles.length;i++) {
    			
    			var filename = result.recentfiles[i].displayPath.replace(/^.*[\\\/]/, '');
    			var directory=result.recentfiles[i].displayPath.substring(0,result.recentfiles[i].displayPath.lastIndexOf('\\'+filename)); 
    			directory=directory.split('\\').join(' › ');
    			var recitem=new Grape('a','html').attr('href','#');
    			recitem.addClass('recent_list_item');
    			recitem.addChild(new Grape('p','html').text(filename).addClass('firstP_recent'));
    			recitem.addChild(new Grape('p','html').text(directory).addClass('secondP_recent'));
    			recitem.retEnt=result.recentfiles[i].retEnt;
    			recitem.addTo(divlist);
    			recitem.clic(function () {
    				var _this=this;
    				chrome.fileSystem.isRestorable(this.retEnt,function (isRestorable) {
    					if (isRestorable) {

    						chrome.fileSystem.restoreEntry(_this.retEnt, function (entry) {

    							if ((editor.documentsaved===false && !filemanager.isOK) || (filemanager.isOK && editor.documentcloudsaved===false)) {
				                    alert_window(chrome.i18n.getMessage('documentchanges'),function () {
				                    	var readEntry=entry;
				                    	if (readEntry) {
				                    		readEntry.file(function(file) {
				      							leer_contenido_fichero(file,readEntry);
				    						});
				                    	}
				                    },chrome.i18n.getMessage('okdiscardmsg'));
				                  } else {
				                    
				                    var readEntry=entry;
				                    if (readEntry) {

				                    	readEntry.file(function(file) {
				                    		
				      						leer_contenido_fichero(file,readEntry);
				    					});
				                    }
				                    
				                  }
    						});
    					} else {
    						invalid_file();
    					}
    				});
    			});
    		}
    	}   
    });
}

function checkifdiscard(done,time) {
	if (typeof time==='undefined') time=4000;
	 if (editor.documentsaved || (filemanager.isOK && preferencesobj['prcloudsaving']=='pron' && editor.documentcloudsaved)) 
                  	{
                  		done.call();
                  	} else if (filemanager.isOK && preferencesobj['prcloudsaving']=='pron' && !editor.documentcloudsaved) {
                  		block_screen();
                  		setTimeout(function () {
                  			unblock_screen();
                  			done.call();
                  		},time);
                  	} else {alert_window(chrome.i18n.getMessage('documentchanges'),function () {done.call();},chrome.i18n.getMessage('discardmsg'));}
}