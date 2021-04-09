let color = '#3aa757';
var productDetail = null;


function parseHTMLString(data, url) {
  html = $.parseHTML(data);
  Jhtml = $(html)

  let isProductPage = Jhtml.find(".pdp-description-container").length > 0;
  // console.log(isProductPage)
  let detail = null;
  if (isProductPage){
    detail = getProductDetails (Jhtml, url)
    console.log(detail)
  } 

  return detail;
}

function getProductDetails (data, url) {
  let pdpInfo = data.find(".pdp-price-info");

  let brand = pdpInfo.find(".pdp-title")[0].innerText;
  let name = pdpInfo.find(".pdp-name")[0].innerText;

  let description = data.find(".pdp-product-description-content")[0].innerText;

  let specificationsKeys = data.find(".index-rowKey").map(function(){
    return this.innerText
  }).get();
  let specificationsVals = data.find(".index-rowValue").map(function(){
    return this.innerText
  }).get();

  let specifications = Object.assign({}, ...specificationsKeys.map((n, index) => ({[n]: specificationsVals[index]})))

  let imageLink = $(data.find(".image-grid-image")[0]).css("background-image").split('"')[1];

  let link = url;

  let productDetailModel = {
    brand: brand,
    name: name,
    description: description,
    specifications: specifications,
    link: link,
    imageLink: imageLink
  }

  // console.log(productDetailModel)
  return productDetailModel;
}

async function getScore(ext_data, detail) {
  let messages = []
  let score = 0;
  let matches = 0;
  let mismatches = 0;
  var flag = false;


  // blacklisted product
    
  function blacklistReturn() {
    return new Promise(function(resolve, reject) {
      let bkey;
      let bvalue;
      let flag = false;
      chrome.storage.local.get({blacklist_data: {}}, function(result) {
        var blacklist_data = result.blacklist_data;
        // console.log('inside blacklist')
        console.log(blacklist_data);
        // check with lower case
        for (const [key, value] of Object.entries(detail.specifications)) {
          let lowerKey = key.toLowerCase();
          let lowerVal = value.toLowerCase();
          // console.log(key, value);

          if ((blacklist_data[lowerKey] || "") === lowerVal) {
            flag = true;
            bkey = key;
            bvalue = value;
            break;
          }
        }
        resolve([flag, bkey, bvalue]);
      });
    });
  }
  
  let bkey, bvalue;
  [flag, bkey, bvalue] = await blacklistReturn()
  // console.log(flag, bkey, bvalue)
  if (flag) {
    return {score: 0, messages: [`You have blacklisted <i> ${bvalue} ${bkey} </i>`]}
  }


  // no data
  if (ext_data.length == 0) {
    return {score: 1, messages: ["Your wardrobe is empty, go ahead and buy something!"]}
  }

  flag = false;
  // duplicate product
  ext_data.forEach(product => {
    if (product.link == detail.link) {
      // console.log("yay")
      flag = true;
    }
  });
  
  if (flag) {
    return {score: 0, messages: ["You already own one."]}
  }

  
  
  messages_detail = {}

  for (const [key, value] of Object.entries(detail.specifications)) {
    // console.log(key, value);
    ext_data.forEach(element => {
      if (element.specifications[key] === value) {
        matches += 1
        messages_detail[key] = (messages_detail[key] || 0) + 1;
      } else {
        mismatches += 1
      }
    });
  }

  for (const [key, value] of Object.entries(messages_detail)) {
    messages.push(`You have ${value} items with ${key} as ${detail.specifications[key]}.`);
  }

  score = mismatches / (matches + mismatches);

  // console.log(messages)

  return {score: score, messages:messages}

}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if (request.action == "getSource") {
    let data = request.source;

    productDetail = parseHTMLString(...data);  
  }

  if (request.action == "addToWardrobe") {
    console.log("Add to wardrobe clicked!");
    if (productDetail)
    {
      // var productDetailString = JSON.stringify(productDetail);
      chrome.storage.local.get({elmira_ext_data: []}, function(result) {
        var elmira_data = result.elmira_ext_data;
        elmira_data.push(productDetail)

        chrome.storage.local.set({elmira_ext_data: elmira_data}, function() {
          console.log('Value is set to:');
          console.log(elmira_data)
        });        
      })      
    }    
  }

  if(request.action == "getScore") {
    // var score = 0;
    // var messages = []
    if (productDetail == null) {
      console.log('nahi aya')
    }

    function getScoreMessages() {
      return new Promise(function(resolve, reject) {
        chrome.storage.local.get({elmira_ext_data: []}, function(result) {
          var elmira_data = result.elmira_ext_data;
          resolve(getScore(elmira_data, productDetail));
        })
      });
    }
       
    getScoreMessages().then((result) => {
      sendResponse({"response": result});
    })
    return true;
    
  }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.sendMessage(activeInfo.tabId, {action: "ResendDOM"}, function(response) {
    if (response === undefined) {
      productDetail = null;
      console.log('antitab')
    } else {
      productDetail = parseHTMLString(...response.DOM);
      console.log("tab switch");
    }
  });  
});

