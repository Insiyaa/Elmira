function removeItem(arr, value) {
    var i = 0;
    while (i < arr.length) {
      if (arr[i].link === value) {
            break;
      } else {
        ++i;
      }
    }
    arr.splice(i, 1);
    return arr;
}


$(document).on('click', '.delete', function(e){ 
    let value = $(this).data("special")


    chrome.storage.local.get({elmira_ext_data: []}, function(result) {
        var elmira_data = result.elmira_ext_data;
        elmira_data = removeItem(elmira_data, value)

        chrome.storage.local.set({elmira_ext_data: elmira_data}, function() {
          console.log('Value is set to:');
          console.log(elmira_data)
        });        
    })   
});

$(document).on('click', '.bl_delete', function(e){ 
  var value = $(this).data("special")

  chrome.storage.local.get({blacklist_data: {}}, function(result) {
    var blacklist_data = result.blacklist_data;
    delete blacklist_data[value]
    chrome.storage.local.set({blacklist_data: blacklist_data}, function() {
      // console.log('Value is set to:');
      // console.log(blacklist_data)
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
        //onClick="window.location.reload();"
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

    chrome.storage.local.get({blacklist_data: {}}, function(result) {
      let  blacklist_data = result.blacklist_data;
      let row = $('<div class="row">')
    
      let bl_button = $('<button class="btn btn-light" type="button" data-toggle="collapse" data-target="#blacklistData" aria-expanded="false" aria-controls="blacklistData">')
                      .html('Show Blacklist');
      let bl_div = $('<div class="collapse" id="blacklistData">')

      let table = $(`
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Value</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
          </table>
      `);

      let tbody = $('<tbody>');
      for (const [key, value] of Object.entries(blacklist_data)) {
        let tr = $(`
          <tr>
            <td class="titlecase">${key}</td>
            <td class="titlecase">${value}</td>
            <td><a class="card-link bl_delete" href='' onClick="window.location.reload();" data-special='${key}'>Delete</a></td>
          </tr>
        `);
        tbody.append(tr);
      }

      table.append(tbody);

      bl_div.append(table);

      // row.append(bl_button);
      row.append(bl_div);

      $('.container').append(bl_button);
      $(".container").append(row)
    })

    

    // render black list

}


data = chrome.storage.local.get({elmira_ext_data: []}, function(result) {
    elmira_data = result.elmira_ext_data;
    renderData(elmira_data)
});
