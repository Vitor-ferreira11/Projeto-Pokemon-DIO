# Pokédex — primeira geração

Projeto educacional em HTML, CSS e JavaScript que consulta a PokéAPI e exibe os primeiros 151 Pokémon, com nome, número, tipos e imagem.

## Executar

Sirva a pasta com um servidor estático local ou hospedagem estática. Abra `index.html` pelo servidor. Os caminhos relativos permitem publicar em um subdiretório, como um site de projeto no GitHub Pages. Não são necessárias dependências de aplicação ou chave de API. Fontes, Normalize CSS e dados da PokéAPI dependem de acesso à internet.

## Carregamento

A primeira página e as seguintes carregam 10 itens; a última contém apenas um. O botão fica desativado durante a requisição. Em falhas HTTP, rede, timeout de 15 segundos ou página incompleta, aparece uma mensagem e é possível tentar novamente sem pular itens. A imagem padrão da API é usada quando a imagem Dream World está ausente.

## Testes

Com Node.js 22 ou superior, execute `node --test tests/pagination.test.cjs`. Os testes simulam a API e cobrem cliques simultâneos, falha e tentativa novamente, página incompleta, limite de 151 e resposta HTTP inválida. Eles não substituem a verificação da API real no navegador.

## Estrutura

- `assets/js/pokemon-model.js`: modelo de Pokémon.
- `assets/js/poke-api.js`: consulta e conversão de dados.
- `assets/js/main.js`: renderização e paginação.

Requer navegador moderno com suporte a `AbortSignal.timeout`. Projeto desenvolvido como exercício da trilha JavaScript da DIO; não é um produto oficial Pokémon.
