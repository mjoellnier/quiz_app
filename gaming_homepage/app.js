const gameNameInput = document.getElementById("gamename_input");
const gameNameSearchBtn = document.getElementById("gameNameSearchBtn");
const noGameFoundWarning = document.getElementById("noGameWarning");
const gameTitle = document.getElementById("gameTitle");
const gameDescription = document.getElementById("gameDescription");
const userRating = document.getElementById("userRating");
const userRatingScore = document.getElementById("userRatingScore");
const metaCritic = document.getElementById("metaCritic");
const metaCriticScore = document.getElementById("metaCriticScore");
const scores = document.getElementById("scores");

const headers = new Headers({
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "gaming-test-app"
});

//  Enable button only when name is entered
gameNameInput.addEventListener("keyup", () => {
  gameNameSearchBtn.disabled = !gameNameInput.value;
});

const searchGame = async event => {
  event.preventDefault();
  findGameId(gameNameInput.value).then(result => {
    if (result === undefined) {
      noGameFoundWarning.innerHTML = `No game found for ${gameNameInput.value}`;
    } else {
      searchGameDetails(result.slug)
        .then(result => {
          localStorage.setItem("loadedGame", JSON.stringify(result));
        })
        .then(result => setGameDetails(result));
    }
  });
};

const setGameDetails = game => {
  let localGame;
  if (!game) {
    localGame = JSON.parse(localStorage.getItem("loadedGame"));
    if (!localGame) return;
  } else {
    localGame = game;
  }
  document.body.style.background = `url(${localGame.background_image}) no-repeat center center
    fixed`;
  gameTitle.innerHTML = localGame.name;
  gameDescription.innerHTML = localGame.description;
  if (localGame.metacritic) {
    metaCriticScore.innerHTML = localGame.metacritic;
  } else {
    metaCriticScore.innerHTML = "-";
  }
  if (localGame.rating) {
    userRatingScore.innerHTML = Math.floor((localGame.rating / 5) * 100);
  } else {
    userRatingScore.innerHTML = "-";
  }
  let metaCriticBackground = LinearColorInterpolator.findColorBetween(
    l,
    r,
    localGame.metacritic
  ).asRgbCss();
  metaCritic.style.backgroundColor = metaCriticBackground;
  let userCriticBackground = LinearColorInterpolator.findColorBetween(
    l,
    r,
    Math.floor((localGame.rating / 5) * 100)
  ).asRgbCss();
  userRating.style.backgroundColor = userCriticBackground;
  scores.classList.remove("hidden");
};

const findGameId = async gameName => {
  let url =
    "https://api.rawg.io/api/games?page_size=5&search=" +
    gameName.replace(" ", "%20");

  return await fetch(url, {
    method: "GET",
    headers: headers
  })
    .then(response => {
      return response.json();
    })
    .then(response => {
      return response.results[0];
    })
    .catch(err => {
      console.error(err);
    });
};

const searchGameDetails = async slug => {
  let url = "https://api.rawg.io/api/games/" + slug;

  return await fetch(url, {
    method: "GET",
    headers: headers
  })
    .then(response => {
      return response.json();
    })
    .then(response => {
      return response;
    })
    .catch(err => {
      console.error(err);
    });
};

// COLOR CODE FROM https://gist.github.com/maxwells/8251275

Color = function(hexOrObject) {
  var obj;
  if (hexOrObject instanceof Object) {
    obj = hexOrObject;
  } else {
    obj = LinearColorInterpolator.convertHexToRgb(hexOrObject);
  }
  this.r = obj.r;
  this.g = obj.g;
  this.b = obj.b;
};
Color.prototype.asRgbCss = function() {
  return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
};

var LinearColorInterpolator = {
  // convert 6-digit hex to rgb components;
  // accepts with or without hash ("335577" or "#335577")
  convertHexToRgb: function(hex) {
    match = hex.replace(/#/, "").match(/.{1,2}/g);
    return new Color({
      r: parseInt(match[0], 16),
      g: parseInt(match[1], 16),
      b: parseInt(match[2], 16)
    });
  },
  // left and right are colors that you're aiming to find
  // a color between. Percentage (0-100) indicates the ratio
  // of right to left. Higher percentage means more right,
  // lower means more left.
  findColorBetween: function(left, right, percentage) {
    newColor = {};
    components = ["r", "g", "b"];
    for (var i = 0; i < components.length; i++) {
      c = components[i];
      newColor[c] = Math.round(
        left[c] + ((right[c] - left[c]) * percentage) / 100
      );
    }
    return new Color(newColor);
  }
};

var l = new Color("#4f1010");
var r = new Color("#104f10");
