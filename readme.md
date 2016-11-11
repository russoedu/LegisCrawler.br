![](./public/logo.svg)

> Crawler completo para a legislação brasileira

##Sobre
LegisCrawler.br foi criado para capturar e organizar a legislação brasileira encontrada no [site do Planalto](planalto.gov.br) e entregar uma API com seus dados.

A ferramenta é formada por duas partes, o crawler – que lê, captura e organiza os dados das legislações – e a API – que entrega os separados por legislação e artigo.

##Instalação

O sistema foi criado em [Node.js](https://nodejs.org/en/) utilizando ECMA 6, portanto deve usar [Node.js 6.5](https://kangax.github.io/compat-table/es6/#node65) em diante para funcionar corretamente.

Para instalar, siga os próximos passos:

```bash
git clone git@github.com:russoedu/LegisCrawler.br.git
cd LegisCrawler.br
```

Caso use o [Yarn](https://yarnpkg.com/), execute

```bash
yarn
```
Caso utilize [NPM](https://www.npmjs.com), execute

```bash
npm install
```

Esses comandos instalarão as dependências do projeto.

##Configuração

TODO
Variáveis de ambiente
Mongo / File
Lista de legislações

##Debug

##Crawler
node crawl

##API
npm start





###Crawler


##Configuration

###Database

The crawler gets the data and can be stored in files or on Mongo DB. Choose on of these options in the config/db/type.

##Debugging
LegisCrawler uses (debug)[https://github.com/visionmedia/debug] for debugging.

To debug the scrap utility, run:

```bash
$ DEBUG=scrap,scrap-parser node scrap/index.js
```
The following debug options are set:
1. scrap
1. scrap-cleaner
1. scrap-parser
1. scrap-getter
1. split

To debug the API, run:

```bash
$ DEBUG=api,DB npm start
```

The following debug options are set:
1. api
1. DB

Most debugs are commented in the code and you must uncomment the ones you want to debug.
