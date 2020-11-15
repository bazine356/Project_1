var submitButton = document.getElementById("get-movie");

//Initialize localStorage items when the app first starts
localStorage.setItem("actors", "");
localStorage.setItem("myName", "");
// Initializing max compatibility
if (localStorage.getItem("maxComp") === null) {
  localStorage.setItem("maxComp", JSON.stringify({ myName: "", actor: "", percentage: "" }));
}

//Given an actor's full name and percentage, if the percentage is greater than or 
//equal to the max compatibility percentage, set the actor to maxCompatibilty 
function checkMaxComp(actorName, percentage) {
  var maxCompability = JSON.parse(localStorage.getItem("maxComp"));

  if (parseFloat(maxCompability.percentage) <= parseFloat(percentage) || maxCompability.percentage == "") {
    maxCompability.actor = actorName;
    maxCompability.percentage = percentage
    localStorage.setItem("maxComp", JSON.stringify(maxCompability));
  }
}

// Love Calculator API (Albert)
// Appends the compatibility percentage to the actors' names
function getCompatibility(fname, sname) {

  fetch("https://love-calculator.p.rapidapi.com/getPercentage?fname=" + fname + "&sname=" + sname, {
    "method": "GET",
    "headers": {
      "x-rapidapi-key": "72c1a1d3c8msh9e36717d571537fp101167jsn0ba82bbeba67",
      "x-rapidapi-host": "love-calculator.p.rapidapi.com"
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //Loop through the list
      console.log($(".actorsFullName").length);
      for (i = 0; i < $(".actorsFullName").length; i++) {
        var actorName = $(".actorsFullName")[i];
        //If the first name of the actor is equal to the first name of the dataset
        //assign the percentages next to the actors' name
        if (($(actorName).text().split(" ")[0]) === data.fname) {
          var progressBar = document.createElement("div");
          var maxHistory = localStorage.getItem("maxComp");
          var match = JSON.parse(maxHistory).actor;
          var matchPercent = JSON.parse(maxHistory).percentage;

          //Check max compatbility first before modifying the list
          checkMaxComp($(actorName).text(), data.percentage);

          //Modify the actors list with compatibility progress bars (Kieren)
          $(actorName).text($(actorName).text() + " - " + data.percentage + "%");
          progressBar.setAttribute("class", "progress-bar");
          progressBar.innerHTML = '<progress class="progress is-danger" value="' + data.percentage + '" max="100">' + data.percentage + '%</progress>';
          $(actorName).after(progressBar);
          $("#matches").text("Your Best Match!")
          $("#max").addClass("best-match");
          $("#history").text(match + ' with ' + matchPercent + '% love compatability!');
          $("#love-btn").hide();
        };
      }
    })
    .catch(err => {
      console.error(err);
    })
}

//OMDB API Code (Bryan)

// Shows the error message box when called
function showError() {
  $("#error-msg").removeAttr("hidden");
}

$("#close-btn").on("click", function () {
  $("#error-msg").hide();
})

//Get Movie when called 
function getMovie() {

  //Get form data and store username in local sorage
  var movieName = document.getElementById("movie-input").value;
  var movieYear = document.getElementById("year-input").value;
  var userName = document.getElementById("name-input").value;
  var requestURL = "https://www.omdbapi.com/?apikey=716bc5f5&t=" + movieName + "&y=" + movieYear

  //store max compatibilty 
  var maxComp = JSON.parse(localStorage.getItem("maxComp"))

  //Validate form is not empty
  if (movieName === "" || userName === "") {
    $("#error-msg").show()
    showError();
    return
  }

  //Need to check maxComp local storage to initialize and reset
  //if a different person's name is entered (Albert)
  if (maxComp.myName == "") {
    maxComp.myName = userName;
    localStorage.setItem("maxComp", JSON.stringify(maxComp));
  } else if (userName != maxComp.myName) {
    maxComp.myName = userName;
    maxComp.actor = "";
    maxComp.percentage = "";
    localStorage.setItem("maxComp", JSON.stringify(maxComp));

  }

  localStorage.setItem("myName", userName);


  //Changes the DOM to render results
  switchToResults();

  //begin API call
  fetch(requestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data)

      if (data.Response == "False") {
        $("#error-msg").show()
        return
      }

      var actors = data.Actors.split(", ");
      localStorage.setItem("actors", actors);
      $("#movie-title").text(`${data.Title}`)
      $("#movie-post").append(`<img src=${data.Poster}>`)
      $("#movie-desc").text(data.Plot)
      console.log(actors);

      for (i = 0; i < actors.length; i++) {
        $("#actors-list").append(`<li class="actorsFullName">${actors[i]}</li>`);
      }

    })
    .catch(err => {
      console.log(err + "error!!!")
    })
}

submitButton.addEventListener("click", getMovie)
// END OMDB API Code (Bryan)

// BEGIN Albert switchToResults Code
//This function switches the result from the initial input screen to the results screen
function switchToResults() {
  var resultContainerText = '<nav class="navbar" role="navigation" aria-label="main navigation">\
  <div class="navbar-brand">\
    <a class="navbar-item" id="home-btn">\
      Movie Love Calculator\
    </a>\
  </div>\
</nav>\
<div class="results-container">\
  <div class="columns">\
  <div hidden class="section" id="error-msg">\
      <div class="level">\
        <div class="level-right">\
          <div class="notification is-danger">\
            <button class="delete" id="close-btn"></button>\
            Oops! Something went wrong. Click the reset button.\
          </div>\
        </div>\
    </div>\
</div>\
    <div class="column is-one-quarter">\
      <div class="content" id="movie-post"></div>\
    </div>\
    <div class="column is-half">\
      <div class="content">\
        <h1 id="movie-title"></h1>\
        <p id="movie-desc"></p>\
      </div>\
      <div class="content">\
        <h3 id="movie-title">Actors</h3>\
        <ul id="actors-list"></ul>\
      </div>\
      <div class="btns">\
        <div class="field is-grouped">\
          <div class="control">\
            <button class="button is-danger" id="love-btn">Get Compatibility</button>\
            <button class="button is-info" id="reset-btn">Reset</button>\
          </div>\
        </div>\
      </div>\
    </div>\
<div class="column">\
  <div class="content" id="max">\
    <h3 id="matches"></h3>\
    <div id="history">\
    </div>\
      </div>\
</div>\
  </div>'
  $(".hero").remove();
  $(".index-container").remove();
  $(document.body).append(resultContainerText);

  //When the Get Compatibility button is clicked
  $("#love-btn").on("click", function () {
    var actorArray = localStorage.getItem("actors").split(",");
    var myName = localStorage.getItem("myName");

    // loop through the actorArray to go through and get each of the percentages
    // then assign those percentages to the different names
    for (i = 0; i < actorArray.length; i++) {
      getCompatibility(actorArray[i].split(" ")[0], myName);
    }
  })

  //resets the window by refreshing the page
  $("#reset-btn").on("click", function () {
    window.location.reload();
  })
  $("#home-btn").on("click", function () {
    window.location.reload();
  })
}
