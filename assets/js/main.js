const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')
const loadStatus = document.getElementById('loadStatus')

const maxRecords = 151
const limit = 10
let offset = 0;
let loading = false;

function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.type}">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>

                <img src="${pokemon.photo}"
                     alt="${pokemon.name}">
            </div>
        </li>
    `
}

async function loadPokemonItens() {
    if (loading || offset >= maxRecords) return
    loading = true
    loadMoreButton.disabled = true
    loadMoreButton.textContent = 'Carregando...'
    loadStatus.textContent = 'Carregando Pokémon...'
    try {
        const pageLimit = Math.min(limit, maxRecords - offset)
        const pokemons = await pokeApi.getPokemons(offset, pageLimit)
        if (pokemons.length !== pageLimit) throw new Error('Página incompleta')
        const newHtml = pokemons.map(convertPokemonToLi).join('')
        pokemonList.insertAdjacentHTML('beforeend', newHtml)
        offset += pokemons.length
        loadStatus.textContent = `${offset} de ${maxRecords} Pokémon carregados.`
        loadMoreButton.hidden = offset >= maxRecords
        loadMoreButton.textContent = 'Carregar mais'
    } catch {
        loadStatus.textContent = 'Não foi possível carregar. Verifique a conexão e tente novamente.'
        loadMoreButton.textContent = 'Tentar novamente'
    } finally {
        loading = false
        loadMoreButton.disabled = false
    }
}

loadPokemonItens()

loadMoreButton.addEventListener('click', loadPokemonItens)
