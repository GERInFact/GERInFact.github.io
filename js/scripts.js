/* eslint-disable no-undef */
(function() {
  // DOM Elements
  var $pokemonList = $('.main-content_pokemon-list');

  // Function to validate an item as object
  function isObject(item) {
    return item !== null && item !== undefined && typeof item === 'object';
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
    var $modalLabel = $('#exampleModalLabel');
    var $modalContent = $('.modal-body');

    // Function to display pokemon details
    function show(pokemon) {
      if (!$modalLabel || !$modalContent) return;

      $modalLabel.empty();
      setModalContent(pokemon);
    }

    // Function to create modal box content
    function setModalContent(pokemon) {
      if (!pokemon) return;
      $modalContent.empty();

      addTitle(pokemon);
      addImage(pokemon.details);
      addInfos(pokemon.details);
    }

    // Function to create modal box title
    function addTitle(pokemon) {
      $modalLabel.text(pokemon.name);
    }

    // Function to get modal box image
    function addImage(pokemonDetails) {
      $modalContent.append(
        `<img src="${
          pokemonDetails.sprites.front_default
        }" alt="The front view of ${
          pokemonDetails.species.name
        }" class="modal_image img-fluid">`
      );
    }

    // Function to get modal box info text
    function addInfos(pokemonDetails) {
      $modalContent.append('<div class="modal_text-container"></div>');

      $textContainer = $('.modal_text-container');

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

    return {
      show: show
    };
  })();

  // List which contains all pokemons to display
  var pokemonRepository = (function() {
    var repository = [];
    var apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';

    // Function to display pokemon entries
    function renderPokemonCards() {
      loadList().then(() => {
        repository.forEach(p => {
          addItemButton(p);
        });
      });
    }

    // Function to load pokemons from an external server
    function loadList() {
      return $.ajax(apiUrl, { dataType: 'json' })
        .then(res => {
          res.results.forEach(r => add(new Pokemon(r.name, r.url)));
          addSearchFunctionality();
        })
        .catch(err => console.log(err));
    }

    // Function to display searched pokemon details
    function addSearchFunctionality() {
      var $searchBar = $('.search_bar');
      var $searchSubmit = $('.search_submit');
      if (!($searchBar && $searchSubmit)) return;

      // Function to display found pokemon
      $searchSubmit.on('click', e => {
        e.preventDefault();
        if (!$searchBar.val()) return;

        showFound($searchBar.val(), $searchBar);
      });

      // Function to display found pokemon
      $searchBar.on('keydown', e => {
        if (e.keyCode !== 13) return;

        showFound(e.target.value, $searchBar);
      });
    }

    // Function to show details of pokemon searched for
    function showFound(filter, $searchBar) {
      if (!filter || !$searchBar) return;

      var pokemonFound = getFiltered(filter).shift();
      if (pokemonFound) $(`#${pokemonFound.name}`).click();
      else showNotFoundMessage($searchBar);
    }

    // Function to show pokemon could not be found
    function showNotFoundMessage($searchBar) {
      if (!$searchBar) return;

      $searchBar
        .parent()
        .append('<p class=\'not-found-message\'>Pokémon not found.<p>');
      setTimeout(() => {
        $('.not-found-message').remove();
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

    // Function to add an intractable button for the pokemon entry
    function addItemButton(pokemon) {
      $pokemonList.append(
        `<button id="${
          pokemon.name
        }" class="list-group-item list-group-item-dark list-group-item-action" data-toggle="modal" data-target="#exampleModal" role="listitem">${
          pokemon.name
        }</button>`
      );
      addItemButtonEvent(pokemon);
    }

    // Function to add an action for the pokemon entry button
    function addItemButtonEvent(pokemon) {
      var $itemButton = $(`#${pokemon.name}`);
      $itemButton.on('click', e => {
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
      return $.ajax(pokemon.detailsUrl, { dataType: 'json' })
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
