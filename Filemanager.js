function Filemanager(done) {
this.fs=null;
this.isOK=false;
this.lastSavedtoSync={};
var _this=this;
// Sync File System

	chrome.syncFileSystem.requestFileSystem(function (fs) {
    if (chrome.runtime.lastError) {
      _this.isOK=false;
     
      if (done) done.call(_this);
    } else {
      _this.fs=fs;
      
      db.open({
          server: 'CalmlyWriter',
          version: 1,
          schema: {
              files: {
                  key: {keyPath: 'id' , autoIncrement: true },
                  // Optionally add indexes
                  indexes: {
                      name: {unique: true }
                  }
              }
          }
      }).then(function ( s ) {
          dblocalfiles=s;
          _this.isOK=true;
          chrome.syncFileSystem.onFileStatusChanged.addListener(_this.syncControl);
          if (done) done.call(_this);
          _this.initialChecking();
      });
       
    }
    
    
	});
	
}

Filemanager.fn=Filemanager.prototype;


Filemanager.fn.initialChecking=function () {

  var dirReader = this.fs.root.createReader();
  var entriesCloud = [];
  var entriesLocal=[];
  var i;
  var toArray=function (list) {
    return Array.prototype.slice.call(list || [], 0);
  }
  var _this=this;
  // Call the reader.readEntries() until no more results are returned.
  var readEntries = function() {
     dirReader.readEntries (function(results) {
      if (!results.length) {
        dblocalfiles.files.query()
          .all()
          .execute()
          .then(function(results) {
            for (i=0;i<results.length;i++) {
              entriesLocal.push(results[i].name);
            }
            _this.resolveLocalCloud(entriesCloud,entriesLocal);
          });
        
      } else {
        var entriesnames=[];
        for (i=0; i<results.length;i++) {
          entriesnames.push(results[i].name);
        }
        entriesCloud = entriesCloud.concat(toArray(entriesnames));
        readEntries();
      }
    }, function () {
      //errorHandler
    });
  };

 

  readEntries(); // Start reading dirs.

}

Filemanager.fn.resolveLocalCloud=function (entriesCloud,entriesLocal) {
  var i;
  for (i=0;i<entriesCloud.length;i++) {
    if (entriesLocal.indexOf(entriesCloud[i])==-1) {
        filemanager.fs.root.getFile(entriesCloud[i], {create:false}, function(fileEntry) {
                fileEntry.file(function(file) {
                   var reader = new FileReader();
                   reader.onloadend = function(e) {
                      //console.log('initial resolve: '+file.name);
                      filemanager.addFile(file.name, this.result, function () {}, true);
                   };
                   reader.readAsText(file);
                }, function (e) {console.log(e);});
        }, function (e) {console.log(e);});
    }
  }

  
}

Filemanager.fn.syncControl=function (detail) {
  if (filemanager.isOK) {
      console.log(detail);
      filemanager.changeStatusIcon(detail.fileEntry.name);
      var local_conflicting=false;

      
      if (detail.status=='synced') {
        // Comprobamos cuando termina de subir el contenido a la nube para volver a intentarlo
        if ((detail.action=='added' || detail.action=='updated') && detail.direction=='local_to_remote') {
          local_conflicting_detector={name:detail.fileEntry.name,time:new Date().getTime()};
            var ind=syncing_files.indexOf(detail.fileEntry.name);
            if (ind!=-1) {
              
              dblocalfiles.files.query('name')
                .only(detail.fileEntry.name)
                .execute()
                .then(function (result) {
                  setTimeout(function () {
                  syncing_files.splice(ind, 1);
                  if (result.length>0 && result[0].changed==true) {
                    filemanager.local2remote_update(result[0].name); 
                  }
                },1000);
                });
              
            }
        } else if ((detail.action=='added' || detail.action=='updated') && detail.direction=='remote_to_local') {
            // Llega un fichero nuevo de la nube
          
            filemanager.fs.root.getFile(detail.fileEntry.name, {create:false}, function(fileEntry) {
                fileEntry.file(function(file) {
                   var reader = new FileReader();
                   reader.onloadend = function(e) {
                      //console.log("["+this.result+"]");

                      filemanager.addFile(detail.fileEntry.name, this.result, function () {
                            if (detail.action=='updated' && detail.fileEntry.name==documenttitle+documentid+'.cml') {
                                      documentid=raceme._generateId();
                                        editor.documentsaved=false;
                                        editor.documentcloudsaved=false;
                                        trytoautosave(false);
                                      
                            // Hay que actualizar el documento que está viendo el usuario en ese momento
                            
                            // Vamos a dejar de actualizar el documento que el usuario se encuentra escribiendo, por seguridad
                              /*
                            var nom_doc=documenttitle;
                            var id_doc=documentid;
                            filemanager.readFile(documenttitle+documentid+'.cml', function (result) {
                                
                                editor.hideTooltip();
                                editor.saveSelection();
                                var parser = new DOMParser();
                                var doc = parser.parseFromString(result, "text/html");
                                var child=doc.getElementsByTagName('body').item(0);

                                documenttitle=nom_doc;
                                documentid=id_doc;
                                editor.mainarea.clear();
                                editor.mainarea.opacity(0);
                                while (child.hasChildNodes()) {
                                  editor.mainarea.seed.appendChild(child.removeChild(child.firstChild));
                                }
                                editor.mainarea.animate(200).opacity(1);
                                
                                updatewordcounter();
                                editor.removeStyles();
                                editor.removeNBSP();
                                resize_window();
                                editor.restoreSelection();
                                editor.saveSelection();

                              });
                            */
                          }
                      }, true);
                      
                   };
                   reader.readAsText(file);
                }, function (e) {console.log(e);});
              }, function (e) {console.log(e);});
          }
      }

      if (detail.status=='synced' && detail.action=='deleted' && detail.direction=='remote_to_local' && detail.fileEntry.name==local_conflicting_detector.name && new Date().getTime()-local_conflicting_detector.time<3000) {
        local_conflicting=true;
      }

      if (detail.status=='conflicting' || local_conflicting) {
        //console.log(detail.status+' '+local_conflicting);
        if (detail.fileEntry.name==documenttitle+documentid+'.cml') {

          // It's the document that the user has opened
          documentid=raceme._generateId();
          editor.documentsaved=true;
          editor.documentcloudsaved=true;
          filemanager.renameFile(detail.fileEntry.name, detail.fileEntry.name.substr(0,detail.fileEntry.name.length-40)+documentid+'.cml',function () {
 
            editor.documentsaved=false;
            editor.documentcloudsaved=false;
            trytoautosave(false);
          });
          
        } else {
          // En otro
          filemanager.renameFile(detail.fileEntry.name, detail.fileEntry.name.substr(0,detail.fileEntry.name.length-40)+raceme._generateId()+'.cml');
        }
      }



      
} 
 
}

Filemanager.fn.changeStatusIcon=function (name) {

if (filemanageropen) {
    filemanager.fs.root.getFile(name, {create:false}, function(fileEntry) {
      chrome.syncFileSystem.getFileStatus(fileEntry, function (status) {
            //console.log(status);
            if (status=='synced' || status=='pending') {
                var childs=by('id:file_list').getChildren();
                for (var i=0;i<childs.length;i++) {
                  if (name==childs.item(i)._calmly_nom_doc+childs.item(i)._calmly_id_doc+'.cml') {
                    if (status=='synced') {
                      childs.item(i).by('class:file_icon').show().stop().animate(100).opacity(0).done(function () {this.hide();});
                    } else if (status=='pending') {
                      childs.item(i).by('class:file_icon').opacity(0).show().stop().animate(100).opacity(1);
                    }
                    break;
                  }
                }
            }
      });
    });
  }

}



Filemanager.fn.getFiles=function (done) {
if (this.isOK==false) return false;
var _this=this;
dblocalfiles.files.query()
      .all()
      .execute()
      .then(function(results) {
        done.call(_this,results);
      });



}

Filemanager.fn.generateGrape=function (name,date,size,fullpath) {
 
  var lin=new Grape('a','html').addClass('file_item');
            lin._calmly_id_doc=name.substr(name.length-40,36);
            lin._calmly_nom_doc=name.substr(0,name.length-40);
            if (documentid==lin._calmly_id_doc && documenttitle==lin._calmly_nom_doc) {
              lin.addClass('current_opened_file');
            }
            var displayed_name=lin._calmly_nom_doc.trim();
            if (displayed_name=='') displayed_name='...';
            lin.addChild(new Grape('div','html').addClass('file_title').text(displayed_name));
            lin.addChild(new Grape('img','html').attr('src','img/sync.png').attr('title',chrome.i18n.getMessage('syncmsg')).opacity(1).addClass('file_icon'));
            filemanager.changeStatusIcon(name);
            if (fullpath) {
              lin.addChild(new Grape('div','html').addClass('hasbeensaved').text(chrome.i18n.getMessage("savedmsg")));
            } else {
              lin.addChild(new Grape('div','html').addClass('hasbeennotsaved').text(chrome.i18n.getMessage("unsavedmsg")));
            }
            lin.addChild(new Grape('div','html').addClass('file_date').text(moment(date).calendar()));
            lin.addChild(new Grape('div','html').addClass('file_bytes').text(formatSizeUnits(size)));
            
            
            lin.clic(function () {
               var _this=this;
              if (this.containsClass('current_selected_file')) {
                wrapper.clic();
              } else {
                checkifdiscard(function() {clic_on_grape.call(_this);});
                /*
                if (!editor.documentcloudsaved && !this.containsClass('current_opened_file')) {
                  alert_window(chrome.i18n.getMessage('documentchanges'),function () {clic_on_grape.call(_this);},chrome.i18n.getMessage('okdiscardmsg'));
                } else {
                  clic_on_grape.call(this);
                }
                */
              }
            });

            return lin;
}

function clic_on_grape() {
  var fil_lis=by('id:file_list');
  var id_doc=this._calmly_id_doc;
              var nom_doc=this._calmly_nom_doc;

              var itm=this;
              filemanager.readFile(nom_doc+id_doc+'.cml', function (result) {
 
                fil_lis.by('class:current_selected_file').removeClass('current_selected_file');

                fil_lis.by('class:current_opened_file').removeClass('current_opened_file');
                itm.addClass('current_selected_file');

                var parser = new DOMParser();
                var doc = parser.parseFromString(result, "text/html");
                var child=doc.getElementsByTagName('body').item(0);

                documenttitle=nom_doc;
                documentid=id_doc;
                entry_persistent=null;
                editor.mainarea.clear();
                editor.mainarea.opacity(0);
                while (child.hasChildNodes()) {
                  editor.mainarea.seed.appendChild(child.removeChild(child.firstChild));
                }

                editor.mainarea.animate(200).opacity(1);
                editor.restoreSelection();
                editor.saveSelection();
                updatewordcounter();
                editor.removeStyles();
                editor.removeNBSP();

                wrapper.scrollTop(26);
                resize_window(false);
                by('id:titletext').value(documenttitle);


                editor.documentsaved=true;
                editor.documentcloudsaved=true;
                deleteandinitautosave();
                make_links_openable();

                by('id:documentremoved_msg').hide();
                by('id:no_remove_button').hide();
                by('id:yes_remove_button').hide();
                by('id:remove_button').show();
                by('id:remove_button').removeEvent();
                by('id:remove_button').removeClass('remove_button_disabled').clic(function () {
                    
                  
                      this.hide();
                      by('id:documentremoved_msg').opacity(0).show().style('bottom','8px').animate(200).ease('in').opacity(1).style('bottom','18px');
                      by('id:yes_remove_button').opacity(0).show().style('bottom','3px').animate(200).ease('in').opacity(1).style('bottom','13px');
                      by('id:yes_remove_button').removeEvent().clic(function () {
          
                          removeFileItem(itm);
                      });
                      by('id:no_remove_button').opacity(0).show().style('bottom','3px').animate(200).ease('in').opacity(1).style('bottom','13px');
                      by('id:no_remove_button').removeEvent().clic(function () {
                          
                          by('id:remove_button').show();
                          by('id:documentremoved_msg').hide();
                          by('id:no_remove_button').hide();
                        by('id:yes_remove_button').hide();
                      });
                });





             });
}

Filemanager.fn.getGrapes=function () {

var _this=this;
this.getFiles(function (entries) {
  
  by('id:file_list').clear();
  entries.sort(function (a,b) {
              if (a.date<b.date) return 1;
              if (a.date>b.date) return -1;
              return 0;
              });
  by('id:remove_button').removeEvent();
  by('id:remove_button').addClass('remove_button_disabled');
  for (var i=0; i<entries.length;i++) {
            var lin=_this.generateGrape(entries[i].name,entries[i].date,entries[i].size,entries[i].fullpath);
            by('id:file_list').addChild(lin);
  }


   
  

}); 


}




Filemanager.fn.addFile=function (name,content,done,remote_new) {
if (typeof remote_new!=='boolean') remote_new=false;
var _this=this;
if (this.isOK==false) return false;

content=content;

dblocalfiles.files.query('name')
  .only(name)
  .execute()
  .then(function (results) {
    var timegr=new Date().getTime();
    var sizegr=byteLength(content);
    if (results.length>0) {
     
      var has_changed=true;
      if (remote_new) has_changed=false;

        dblocalfiles.files.query('name')
          .only(name)
          .modify({'content':content,'date':timegr,'changed':has_changed,'size':sizegr,'fullpath':''})
          .execute()
          .then(function () {
            //console.log('rewriting end');
            if (done) done.call();
            if (remote_new==false) _this.local2remote_update(name);
            _this.addGrape(name, timegr, sizegr);   
          });
      } else {
        if (remote_new) {
            dblocalfiles.files.add({'name':name,'content':content,'date':timegr,'changed':false,'size':sizegr,'fullpath':''})
            .then(function () {
              //console.log('remote_end writing end');
              if (done) done.call();   
              _this.addGrape(name, timegr, sizegr);
            });
        } else {
          dblocalfiles.files.add({'name':name,'content':content,'date':timegr,'changed':true,'size':sizegr,'fullpath':''})
            .then(function () {
              //console.log('first writing end');
              if (done) done.call();   
              _this.local2remote_update(name);
              _this.addGrape(name, timegr, sizegr);
            });
        }
        
    }
  });








 
	

}

Filemanager.fn.local2remote_update=function (name) {
   var _this=this;
  
   var errorHandler=function (e) {
      console.log(e);
      if (fail) fail.call(this,e);
    };  

  if (syncing_files.indexOf(name)==-1) {
      syncing_files.push(name); 
     
    
          dblocalfiles.files.query('name')
          .only(name)
          .modify({'changed':false})
          .execute()
          .then(function (result) {

            if (result.length>0) {
              var content=result[0].content;
              if (typeof _this.lastSavedtoSync[name]===undefined || _this.lastSavedtoSync[name]!=content) {
                            _this.fs.root.getFile(name, {create: true, exclusive:false}, function (fileEntry) {
                              fileEntry.createWriter(function (writer) {
                                    
                                    _this.changeStatusIcon(name);
                                    writer.onerror = errorHandler;
                                    
                                    writer.onwriteend = function(e) {
                                      writer.onwriteend=function (e) {/*console.log(e);*/};
                                      var blob = new Blob([content]);
                                      writer.write(blob); 
                                      _this.lastSavedtoSync[name]=content;
                                    };
                                    writer.truncate(0);
                                   
                                  },errorHandler);      
                              });
              } else {
                //console.log('No se hace local2remote porque no hay cambios');
                // Ya que no se va a producir evento que saque el fichero de la cola syncing_files, lo sacamos directamente
                var ind=syncing_files.indexOf(name);
                if (ind!=-1) syncing_files.splice(ind,1);
              }
            }
          }); 
  
  } else {
    //console.log('local2remote update waiting');
    /*
    _this.fs.root.getFile(name, {create: true, exclusive:false}, function (fileEntry) {
      console.log(fileEntry);
      fileEntry.getMetadata(function (detail) {console.log(detail);});  
    });
    */
  }
}

Filemanager.fn.removeFile=function (name,done) {
var _this=this;
dblocalfiles.files.query('name')
  .only(name)
  .execute()
  .then(function (result) {
    if (result.length>0) {
      var _id=result[0].id;
      dblocalfiles.files.remove(_id).then(function (key) {
        if (_this.lastSavedtoSync[name]) delete _this.lastSavedtoSync[name];
        _this.removeGrape(name);
        if (done) done.call();
        //console.log('File local removed.');
        _this.fs.root.getFile(name, {create: false}, function(fileEntry) {
          fileEntry.remove(function() {
            //console.log('File cloud removed.');
          }, errorHandler);
        }, errorHandler);
        });
    }
  });

  var errorHandler=function (e) {
      console.log('error')
        //alert_window('error');
  };

/*


  
  
*/
}

Filemanager.fn.markAsLocalSaved=function (name, fullpath) {
  var _this=this;
  dblocalfiles.files.query('name')
          .only(name)
          .modify({'fullpath':fullpath})
          .execute()
          .then(function (result) {
             _this.markAsLocalUnsavedAllThat(name,fullpath);
          });
          
}
Filemanager.fn.markAsLocalUnsavedAllThat=function (name_is_not,fullpath_is) {
  var _this=this;
this.getFiles(function (entries) {
  for (var i=0; i<entries.length;i++) { 
      if (entries[i].fullpath && entries[i].fullpath==fullpath_is && entries[i].name!=name_is_not) {
        console.log(entries[i].name);
        console.log(entries[i].fullpath);
        _this.markAsLocalUnsaved(entries[i].name);
        
      }
  }
  
}); 
}
Filemanager.fn.markAsLocalUnsaved=function (name) {
  dblocalfiles.files.query('name')
          .only(name)
          .modify({'fullpath':''})
          .execute()
          .then(function (result) {
             //console.log(result);
          });         
}


Filemanager.fn.removeGrape=function (name) {
  if (filemanageropen) {
    by('id:file_list').getChildren().each(function () {
      if (this._calmly_nom_doc+this._calmly_id_doc+'.cml'==name) {
        this.stop().animate(200).opacity(0).done(function () {
                        this.remove();
        });
      }
    });
  }
}

Filemanager.fn.addGrape=function (name,date,size) {
  if (filemanageropen) {
    var foundgrape=false;
     by('id:file_list').getChildren().each(function () {
      if (this._calmly_nom_doc+this._calmly_id_doc+'.cml'==name) {
        foundgrape=true;
      }
    });

     if (foundgrape==false) {
        var lin=this.generateGrape(name, date, size);
        lin.opacity(0).hide();
        by('id:file_list').addChild(lin);
        lin.toBack();
        lin.show().animate(200).opacity(1);
     }
  }
}

Filemanager.fn.readFile=function (name,done) {
var _this=this;
dblocalfiles.files.query('name')
  .only(name)
  .execute()
  .then(function (result) {
    if (result.length>0) {
      if (done) done.call(_this,result[0].content);
    }
  });


}

Filemanager.fn.searchByFullPath=function (fullpath, name, done) {
var _this=this;
this.getFiles(function (entries) {
  for (var i=0; i<entries.length;i++) { 
      if (entries[i].fullpath && entries[i].fullpath==fullpath && entries[i].name && entries[i].name.substr(0,entries[i].name.length-40)==name) {
        //console.log(name);
        //console.log(entries[i].name);
        if (done) done.call(_this,entries[i]);
        return;
      }
  }
  if (done) done.call(_this,null);
});



}


Filemanager.fn.renameFile=function (name,new_name,done) {

  if (name==new_name) return false;
  dblocalfiles.files.query('name')
    .only(name)
    .modify({'name':new_name,'date':new Date().getTime(),'changed':true,'fullpath':''})
    .execute()
    .then(function () {
      filemanager.fs.root.getFile(name, {}, function(fileEntry) {
        fileEntry.moveTo(filemanager.fs.root, new_name, function() {
          if (done) done.call();
        },errorHandler);
      }, errorHandler);   
    });

var errorHandler=function (e) {
      
      console.log(e); 
      if (done) done.call();
  };



}

function formatSizeUnits(bytes){
        if      (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(1)+' GB';}
        else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(1)+' MB';}
        else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(0)+' KB';}
        else if (bytes>1)           {bytes=bytes+' bytes';}
        else if (bytes==1)          {bytes=bytes+' byte';}
        else                        {bytes='0 byte';}
        return bytes;
}

function byteLength(str) {
  // returns the byte length of an utf8 string
  var s = str.length;
  for (var i=str.length-1; i>=0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s+=2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
  }
  return s;
}
