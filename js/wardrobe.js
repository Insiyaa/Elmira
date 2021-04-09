function removeItem(arr, value) {
    var i = 0;
    while (i < arr.length) {
      if (arr[i].link === value) {
          console.log(value)
          console.log(i)
            arr.splice(i, 1);
            break;
      } else {
        ++i;
      }
    }
    return arr;
}


$(document).on('click', '.delete', function(){ 
    console.log('del')

    let value = $(".delete").data("special")


    chrome.storage.local.get({elmira_ext_data: []}, function(result) {
        var elmira_data = result.elmira_ext_data;
        elmira_data = removeItem(elmira_data, value)

        chrome.storage.local.set({elmira_ext_data: elmira_data}, function() {
          console.log('Value is set to:');
          console.log(elmira_data)
        });        
    })   
});

function renderData(data) {
    var i = 0;
    var row = $('<div class="row">')
    data.forEach(product => {
        i += 1

        col = $('<div class="col-md-4 col-sm-6 col-12 column">');

        // make card
        card = $("<div class='card h-100'>");
        image = $('<img class="card-img-top">').attr("src",product.imageLink);

        cardBody = $('<div class="card-body">')
        cardTitle = $('<h5 class="card-title">').html(product.brand)
        cardSubtitle = $('<h6 class="card-subtitle mb-2 text-muted">').html(product.name)
        cardText = $('<p class="card-text">').html(product.description)
        link = $('<a class="card-link">').attr('href', product.link).html("View")
        dellink = $('<a class="card-link delete" onClick="window.location.reload();">').attr('href', "").data("special", product.link).html("Delete")

        cardBody.append(cardTitle);
        cardBody.append(cardSubtitle);
        cardBody.append(cardText);
        cardBody.append(link)
        cardBody.append(dellink)
        
        card.append(image);
        card.append(cardBody)

        col.append(card);
        row.append(col)
    });
    $(".container").append(row)
}


data = chrome.storage.local.get({elmira_ext_data: []}, function(result) {
    elmira_data = result.elmira_ext_data;
    renderData(elmira_data)
});
