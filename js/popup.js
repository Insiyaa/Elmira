
$(function () {
  $('[data-toggle="popover"]').popover()
})

$('.popover-dismiss').popover({
  trigger: 'focus'
})

function isEmptyOrSpaces(str){
  return str === null || str.match(/^\s*$/) !== null;
}

$(document).on('click', '#export', function(){ 
  var el =  this
  chrome.storage.local.get({elmira_ext_data: []}, function(result) {
    var elmira_data = result.elmira_ext_data;
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(elmira_data));
    // console.log(el);
    el.setAttribute("href", "data:"+data);
    el.setAttribute("download", "wardrobe.json");
  })
});

$(document).on('click', '#blacklist', function(){ 
  let propertyEl = $(this).parent().siblings()[0];
  let valueEl = $(this).parent().siblings()[1]; 

  let property = $(propertyEl).val().toLowerCase();
  let value = $(valueEl).val().toLowerCase();
  
  // check for null or empty values
  if (!isEmptyOrSpaces(property) && !isEmptyOrSpaces(value)) {
    // if not null or empty, save in blacklist_data
    chrome.storage.local.get({blacklist_data: {}}, function(result) {
      var blacklist_data = result.blacklist_data;
      blacklist_data[property] = value
      chrome.storage.local.set({blacklist_data: blacklist_data}, function() {
        // console.log('Value is set to:');
        // console.log(blacklist_data)
      }); 
    })
  }


  
});



$('#addToWardrobe').click(function(){
  //alert("added")
  chrome.runtime.sendMessage({
    action: "addToWardrobe"
  });
});

$('#showWardrobe').click(function(){
  var newURL = chrome.extension.getURL('wardrobe.html')
  chrome.tabs.create({ url: newURL })
});

$(".openMyn").click(function(){
  chrome.tabs.create({ url: "https://www.myntra.com/" })
})

$('#getScore').click(function() {
  chrome.runtime.sendMessage({
    action: "getScore"
  }, function(response) {
    console.log(response);
    let score = (parseFloat(response.response.score) * 100).toFixed(2) ;
    let messages = response.response.messages.slice(0, 5)
    $('#info').attr('data-content', messages);
    $('#score').html(`${score} %`)
    if (score > 70) $('#score').addClass('text-success')
    else if (score < 40) $('#score').addClass('text-danger')
    else $('#score').addClass('text-warning')
    
  });
})