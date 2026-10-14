const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const flush = () => new Promise(resolve => setImmediate(resolve));
const source = name => fs.readFileSync(path.join(__dirname, '../assets/js/', name), 'utf8');

function iniciar(getPokemons) {
    const list = { html: '', insertAdjacentHTML(position, html) { this.html += html; } };
    const button = { hidden: false, addEventListener(event, fn) { this.click = fn; } };
    const status = { textContent: '' };
    vm.runInNewContext(source('main.js'), {
        document: { getElementById: id => ({ pokemonList: list, loadMoreButton: button, loadStatus: status })[id] },
        pokeApi: { getPokemons }
    });
    return { list, button, status };
}
const pagina = (offset, limit) => Array.from({ length: limit }, (_, i) => ({
    number: offset + i + 1, name: 'pokemon', type: 'normal', types: ['normal'], photo: 'sprite.png'
}));

test('bloqueia cliques simultâneos e só avança após sucesso', async () => {
    const chamadas = [];
    let resolver;
    const app = iniciar((offset, limit) => { chamadas.push([offset, limit]); return new Promise(resolve => { resolver = resolve; }); });
    app.button.click();
    assert.equal(chamadas.length, 1);
    assert.equal(app.button.disabled, true);
    resolver(pagina(0, 10));
    await flush();
    app.button.click();
    assert.deepEqual(chamadas, [[0, 10], [10, 10]]);
});

test('falha preserva a página para tentar novamente', async () => {
    const chamadas = [];
    const app = iniciar((offset, limit) => {
        chamadas.push([offset, limit]);
        return chamadas.length === 1 ? Promise.reject(Error('offline')) : Promise.resolve(pagina(offset, limit));
    });
    await flush();
    assert.equal(app.button.textContent, 'Tentar novamente');
    assert.equal(app.button.disabled, false);
    await app.button.click();
    assert.deepEqual(chamadas, [[0, 10], [0, 10]]);
    assert.equal(app.status.textContent, '10 de 151 Pokémon carregados.');
});

test('última página carrega apenas um item e encerra em 151', async () => {
    const chamadas = [];
    const app = iniciar((offset, limit) => { chamadas.push([offset, limit]); return Promise.resolve(pagina(offset, limit)); });
    await flush();
    for (let i = 0; i < 15; i++) await app.button.click();
    assert.deepEqual(chamadas.at(-1), [150, 1]);
    assert.equal(app.button.hidden, true);
    assert.equal((app.list.html.match(/class="number"/g) || []).length, 151);
    await app.button.click();
    assert.equal(chamadas.length, 16);
});

test('página incompleta não avança nem adiciona itens', async () => {
    const chamadas = [];
    const app = iniciar((offset, limit) => { chamadas.push([offset, limit]); return Promise.resolve([]); });
    await flush();
    await app.button.click();
    assert.deepEqual(chamadas, [[0, 10], [0, 10]]);
    assert.equal(app.list.html, '');
});

test('resposta HTTP inválida falha antes de interpretar JSON', async () => {
    let jsonCalled = false;
    const context = vm.createContext({
        Pokemon: class {}, AbortSignal,
        fetch: async () => ({ ok: false, status: 503, json() { jsonCalled = true; } })
    });
    vm.runInContext(source('poke-api.js'), context);
    await assert.rejects(vm.runInContext('pokeApi.getPokemons()', context), /503/);
    assert.equal(jsonCalled, false);
});
