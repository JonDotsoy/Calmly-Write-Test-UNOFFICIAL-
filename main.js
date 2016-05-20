
chrome.app.runtime.onLaunched.addListener(function() {
 
  
  var screenWidth = screen.availWidth;
  var screenHeight = screen.availHeight;
  var width = 700;
  var height = 500;
  
  chrome.app.window.create('index.html', {
    id: "CalmlyID",
    bounds: {
      width: width,
      height: height,
      left: Math.round((screenWidth-width)/2),
      top: Math.round((screenHeight-height)/2)
    },
    frame: "none"
  });
  
 

  
  
});

