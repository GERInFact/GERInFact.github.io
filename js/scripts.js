(function() {
  // DOM Elements
  var $pokemonList = $(".main-content_pokemon-list");

  // Function to validate an item as object
  function isObject(item) {
    return item !== null && item !== undefined && typeof item === "object";
  }

  // Function to validate object equality
  function isObjectEqual(original, clone) {
    var originalProperties = Object.keys(original);
    var cloneProperties = Object.keys(clone);

    if (!isPropertyCountEqual(originalProperties, cloneProperties))
      return false;

    for (var i = 0; i < originalProperties.length; i++)
      if (originalProperties[i] !== cloneProperties[i]) return false;

    return true;
  }

  // Function to validate property count equality
  function isPropertyCountEqual(originalProperties, cloneProperties) {
    return originalProperties.length === cloneProperties.length;
  }

  // Container for storing pokemon relevant data
  function Pokemon(name, detailsUrl) {
    this.name = name;
    this.details = {};
    this.detailsUrl = detailsUrl;
  }

  var modalBox = (function() {
    var $modalContainer = $("#modal-container");

    // Function to hide pokemon details
    function hide() {
      $modalContainer.removeClass("is-visible");
    }

    // Function to display pokemon details
    function show(pokemon) {
      if (!$modalContainer) return;

      $modalContainer.empty();
      $modalContainer.addClass("is-visible");
      addModal();
      var $modal = $(".modal");
      setModalContent($modal, pokemon);
    }

    // Function to create modal box for pokemon details
    function addModal() {
      $modalContainer.append('<div class="modal"></div>');
    }

    // Function to create modal box content
    function setModalContent($modal, pokemon) {
      if (!pokemon || !$modal) return;

      addHeader($modal, pokemon);
      addImage($modal, pokemon.details);
      addInfos($modal, pokemon.details);
    }

    // Function to create modal header
    function addHeader($modal, pokemon) {
      $modal.append('<div class="modal_header"></div>');
      $modalHeader = $(".modal_header");
      setCloseButton($modalHeader);
      addTitle($modalHeader, pokemon);
    }

    // Function to create close button
    function setCloseButton($modal) {
      $modal.append('<button class="modal_close">Close</button>');
      var $closeButton = $(".modal_close");
      $closeButton.on("click", hide);
    }

    // Function to create modal box title
    function addTitle($modal, pokemon) {
      $modal.append(`<h2 class="modal_title">${pokemon.name}</h2>`);
    }

    // Function to get modal box image
    function addImage($modal, pokemonDetails) {
      $modal.append(
        `<img src="${
          pokemonDetails.sprites.front_default
        }" alt="The front view of ${
          pokemonDetails.species.name
        }" class="modal_image">`
      );
    }

    // Function to get modal box info text
    function addInfos($modal, pokemonDetails) {
      $modal.append(`<div class="modal_text-container"></div>`);

      $textContainer = $(".modal_text-container");

      Object.keys(pokemonDetails).forEach(p => {
        if (!Array.isArray(pokemonDetails[p]) && !isObject(pokemonDetails[p])) {
          addInfoElement(pokemonDetails, p, $textContainer);
        }
      });
    }

    // Function to get info texts subtext
    function addInfoElement(pokemonDetails, property, $textContainer) {
      $textContainer.append(
        `<p class="text-container_item">${property}: ${
          pokemonDetails[property]
        }</p>`
      );
    }

    // Function to close modal on ESCAPE pressed
    window.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;

      hide();
    });

    // Function to close modal, if clicked around it
    $modalContainer.on("click", e => {
      e.preventDefault();

      if ($modalContainer[0] !== e.target) return;

      hide();
    });

    return {
      show: show,
      hide: hide
    };
  })();

  // List which contains all pokemons to display
  var pokemonRepository = (function() {
    var repository = [];
    var apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=150";

    // Function to display pokemon entries
    function renderPokemonCards() {
      loadList().then(() => {
        repository.forEach(p => {
          addListItem(p);
        });
      });
    }

    // Function to load pokemons from an external server
    function loadList() {
      return $.ajax(apiUrl, { dataType: "json" })
        .then(res => {
          res.results.forEach(r => add(new Pokemon(r.name, r.url)));
          addSearchFunctionality();
        })
        .catch(err => console.log(err));
    }

    // Function to display searched pokemon details
    function addSearchFunctionality() {
      var $searchBar = $(".search_bar");
      var $searchSubmit = $(".search_submit");
      if (!($searchBar && $searchSubmit)) return;

      // Function to display found pokemon
      $searchSubmit.on("click", e => {
        e.preventDefault();
        if (!$searchBar.val()) return;

        showFound($searchBar.val(), $searchBar);
      });

      // Function to display found pokemon
      $searchBar.on("keydown", e => {
        if (e.keyCode !== 13) return;

        showFound(e.target.value, $searchBar);
      });
    }

    // Function to show details of pokemon searched for
    function showFound(filter, $searchBar) {
      if (!filter || !$searchBar) return;

      var pokemonFound = getFiltered(filter).shift();
      if (pokemonFound) showDetails(pokemonFound);
      else showNotFoundMessage($searchBar);
    }

    // Function to show pokemon could not be found
    function showNotFoundMessage($searchBar) {
      if (!$searchBar) return;

      $searchBar.parent().append(
        "<p class='not-found-message'>Pokémon not found.<p>"
      );
      setTimeout(() => {
        $(".not-found-message").remove();
      }, 1000);
    }

    // Function to add a new pokemon
    function add(pokemon) {
      if (!isPokemon(pokemon)) return;

      repository.push(pokemon);
    }

    // Function to get all pokemons listed
    function getAll() {
      return repository;
    }

    // Function to get all pokemons with the filter applied
    function getFiltered(filter) {
      if (!filter) return [];

      return repository.filter(c =>
        String(Object.values(c))
          .toLowerCase()
          .includes(String(filter).toLowerCase())
      );
    }

    // Function to remove a certain pokemon
    function remove(pokemon) {
      if (!isPokemon(pokemon)) return;

      repository.splice(repository.indexOf(pokemon), 1);
    }

    // Function to validate an object as pokemon
    function isPokemon(item) {
      return isObject(item) && isObjectEqual(item, new Pokemon());
    }

    // Function to add a pokemon entry
    function addListItem(pokemon) {
      if (!isPokemon(pokemon)) return;

      $pokemonList.append(
        `<li class="pokemon-list_item-${pokemon.name}"></li>`
      );
      addItemButton(pokemon);
    }

    // Function to add an interactable button for the pokemon entry
    function addItemButton(pokemon) {
      var $listItem = $(`.pokemon-list_item-${pokemon.name}`);
      $listItem.append(
        `<button id="${pokemon.name}" class="item_button">${
          pokemon.name
        }</button>`
      );
      addItemButtonEvent(pokemon);
    }

    // Function to add an action for the pokemon entry button
    function addItemButtonEvent(pokemon) {
      var $itemButton = $(`#${pokemon.name}`);
      $itemButton.on("click", e => {
        e.preventDefault();
        showDetails(pokemon);
      });
    }
    // Function to show pokemon details
    function showDetails(pokemon) {
      if (!isPokemon(pokemon)) return;

      loadDetails(pokemon).then(() => modalBox.show(pokemon));
    }

    // Function to load pokemon details form external server
    function loadDetails(pokemon) {
      return $.ajax(pokemon.detailsUrl, { dataType: "json" })
        .then(res => {
          pokemon.details = JSON.parse(JSON.stringify(res));
        })
        .catch(err => console.log(err));
    }

    return {
      add: add,
      getAll: getAll,
      getFiltered: getFiltered,
      remove: remove,
      renderPokemonCards: renderPokemonCards
    };
  })();

  pokemonRepository.renderPokemonCards();
})();
