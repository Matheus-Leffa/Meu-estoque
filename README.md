# MeuEstoque

Aplicação web para consulta e gerenciamento de estoque, desenvolvida para apoiar
as atividades de uma empresa do setor de iluminação.

## Contexto e objetivo

Após a perda de acesso ao ERP utilizado anteriormente, tornou-se necessário
preservar o acesso às informações dos produtos e permitir a consulta e atualização
do estoque sem depender daquele sistema. O MeuEstoque oferece uma ferramenta
independente para consultar produtos, administrar quantidades e preparar pedidos.

## Funcionalidades

- Cadastrar, consultar, editar e excluir produtos.
- Visualizar os dados e as quantidades disponíveis em estoque.
- Pesquisar produtos por referência, descrição ou marca.
- Montar pedidos temporários, ajustar quantidades e remover itens.
- Calcular automaticamente os subtotais e o valor total de um pedido.
- Dar baixa no estoque após a confirmação do pedido.
- Evitar baixas duplicadas e manter a operação de baixa atômica: se houver falha,
  a transação é revertida.
- Restringir o acesso por autenticação com uma senha compartilhada.

> O pedido é temporário e não é persistido no PostgreSQL.

## Tecnologias utilizadas

| Responsabilidade | Tecnologias |
| --- | --- |
| Backend e API | Node.js, TypeScript, Express e API REST |
| Banco de dados | PostgreSQL e driver `pg` |
| Frontend | HTML, CSS e JavaScript |
| Autenticação e segurança | Passport.js (`passport-jwt`), JWT, bcrypt, proteção CSRF, cookies e CORS |
| Testes | Jest e `ts-jest`; testes unitários dos serviços |
| Versionamento e CI | Git, GitHub e GitHub Actions |

## Arquitetura

O backend organiza o fluxo da API em camadas: as **routes** definem os endpoints;
os **controllers** recebem as requisições e encaminham o trabalho; os **services**
concentram validações e regras de negócio; os **repositories** executam consultas
ao PostgreSQL; e os **models** descrevem os tipos usados pela aplicação. Acesso à
autenticação, configuração e middlewares ficam em módulos próprios. As consultas
ao banco usam o driver `pg`, sem ORM.

O Express serve os arquivos estáticos do frontend. A estrutura principal do
repositório é:

```text
.
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── services/
│   └── tests/
├── database/
│   └── migrations/
├── docs/
├── frontend/
│   ├── css/
│   ├── js/
│   └── pages/
└── .github/
    └── workflows/
```

## Como executar localmente

### Pré-requisitos

- Node.js 22 (versão usada pelo workflow de CI).
- npm, incluído na instalação do Node.js.
- PostgreSQL.
- Git.

### 1. Clonar o repositório

Informe o URL HTTPS do repositório:

```powershell
$repoUrl = Read-Host "URL HTTPS do repositório"
git clone $repoUrl
Set-Location .\MeuEstoque
```

O comando pressupõe que o clone criou uma pasta chamada `MeuEstoque`; ajuste o
caminho se o diretório tiver outro nome.

### 2. Criar e preparar o banco de dados

Com o PostgreSQL instalado e em execução, crie o banco. Os comandos abaixo
pressupõem que o usuário local `postgres` está disponível:

```powershell
psql -U postgres -c "CREATE DATABASE meuestoque;"
psql -U postgres -d meuestoque -f .\database\migrations\001_create_produtos.sql
psql -U postgres -d meuestoque -f .\database\migrations\002_create_baixas_processadas.sql
```

As migrations SQL devem ser aplicadas na ordem apresentada. O repositório não
configura uma ferramenta ou script automatizado de migrations.

### 3. Configurar as variáveis de ambiente

Copie o arquivo de exemplo para o diretório do backend:

```powershell
Copy-Item .\.env.example .\backend\.env
```

Edite `backend/.env` com os parâmetros locais. Exemplo com valores fictícios:

```dotenv
PORT=3000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:senha_local_ficticia@localhost:5432/meuestoque
JWT_SECRET=segredo_local_ficticio
JWT_EXPIRES_IN=1h
PASSWORD_HASH=hash_bcrypt_local_a_substituir
NODE_ENV=development
```

`DATABASE_URL` deve apontar para o banco criado. `JWT_SECRET` é o segredo local
usado para assinar tokens, e `PASSWORD_HASH` deve conter um hash bcrypt da senha
compartilhada usada no ambiente local — não a senha em texto puro. Substitua os
valores de exemplo por valores próprios; não reutilize credenciais de produção
nem versione o arquivo `.env`.

### 4. Instalar, compilar e iniciar

O Express serve a interface e a API na mesma origem; não é necessário iniciar um
servidor separado para o frontend neste fluxo:

```powershell
Set-Location .\backend
npm ci
node -e "require('bcrypt').hash('senha_local_de_teste', 12).then(console.log)"
npm run build
npm start
```

O comando Node.js imprime um hash bcrypt de exemplo; substitua
`senha_local_de_teste` por uma senha local e copie o hash resultante para
`PASSWORD_HASH` em `.env` antes de iniciar o servidor. Não use essa senha de
exemplo em produção.

Com o servidor em execução, acesse [http://localhost:3000](http://localhost:3000)
no navegador. Se alterar `PORT`, use a porta correspondente no endereço.

## Testes automatizados

Os testes usam Jest e podem ser executados a partir do diretório `backend`:

```powershell
npm test
npm run test:coverage
```

Os testes unitários dos serviços usam mocks, sem exigir uma instância PostgreSQL.
Os testes de produtos verificam validações e regras de cadastro e pesquisa; os
testes de checkout verificam a transação, o rollback por estoque insuficiente e
a prevenção de processamento duplicado.

## Integração contínua

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) é executado em
pull requests e pushes para as branches `develop` e `main`, e também pode ser
acionado manualmente. Ele configura Node.js 22 e, no backend, executa:

1. Instalação reprodutível das dependências com `npm ci`.
2. Compilação do TypeScript com `npm run build`.
3. Testes automatizados com `npm test`.
4. Auditoria das dependências de produção com `npm audit --omit=dev`.

## Deploy e segurança

Para produção, configure `NODE_ENV=production`, `FRONTEND_URL` com a origem HTTPS
pública, `DATABASE_URL`, `JWT_SECRET` e `PASSWORD_HASH` por meio do ambiente de
hospedagem. Publique o frontend em HTTPS e encaminhe as chamadas da API ao backend
por uma rede privada ou proxy reverso. Configure o redirecionamento de HTTP para
HTTPS e mantenha certificados TLS válidos. Os cookies de autenticação usam
`HttpOnly` e `SameSite=Lax`; em produção, também usam `Secure`.

Nunca versione `.env` nem exponha o segredo JWT, o hash da senha ou credenciais
reais.

## Autor

- **Nome:** Matheus Santos Leffa
- **GitHub:** https://github.com/Matheus-Leffa
- **LinkedIn:** https://www.linkedin.com/in/matheus-santos-leffa/
