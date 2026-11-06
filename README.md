# MeuEstoque

Aplicação Web de gerenciamento e consulta de estoque da Decor Prime.

## Estrutura

- `backend/`: API Node.js com TypeScript.
- `frontend/`: interface HTML, CSS e JavaScript.
- `database/migrations/`: migrations do PostgreSQL.
- `docs/`: especificação oficial do projeto.

## Execução local

### Backend

```powershell
Set-Location .\backend
npm install
npm run build
npm start
```

### Frontend

Em outro terminal:

```powershell
Set-Location .\frontend
npm run dev
```

O frontend será servido em `http://localhost:5173`.

As variáveis do backend devem ser configuradas a partir de `.env.example`.
Para processos separados, mantenha `FRONTEND_URL=http://localhost:5173` no
ambiente do backend. O frontend usa `http://localhost:3000` por padrão; em
outro ambiente, defina `globalThis.MEUESTOQUE_API_URL` antes dos scripts das
páginas.

## Banco de dados

O PostgreSQL deve estar disponível antes da execução do backend. As migrations SQL
devem ser aplicadas em ordem, a partir da raiz do projeto:

```powershell
psql $env:DATABASE_URL -f .\database\migrations\001_create_produtos.sql
psql $env:DATABASE_URL -f .\database\migrations\002_create_baixas_processadas.sql
```

`produtos` armazena somente os dados do estoque. `baixas_processadas` armazena
apenas as chaves de idempotência das baixas concluídas; pedidos não são
persistidos.

A baixa autenticada é realizada por `POST /api/checkout` dentro de uma
transação PostgreSQL. O corpo contém uma chave UUID de idempotência e os itens
do pedido. Falhas provocam `ROLLBACK` integral.

## Deploy com HTTPS

Em produção:

1. Configure `NODE_ENV=production`, `FRONTEND_URL` com a origem HTTPS pública,
   `DATABASE_URL`, `JWT_SECRET` e `PASSWORD_HASH`.
2. Publique o frontend em um domínio HTTPS.
3. Execute o backend em uma rede privada ou atrás de um proxy reverso.
4. Configure o proxy para encaminhar a API ao backend e redirecionar HTTP para
   HTTPS.
5. Instale e renove um certificado TLS válido no proxy ou serviço de hospedagem.
6. Mantenha os cookies com `HttpOnly`, `Secure` e `SameSite` configurados
   conforme o domínio e o fluxo de navegação aprovados.

Nunca versione o arquivo `.env` nem exponha o `JWT_SECRET` ou o hash da senha.

## Testes

No backend:

```powershell
Set-Location .\backend
npm test
npm run test:coverage
```

Os testes unitários não exigem uma instância PostgreSQL, pois utilizam mocks
para validar as regras de produtos e o fluxo transacional da baixa. Para
validação integrada, configure o PostgreSQL, aplique as migrations e execute o
backend com um `.env` preenchido.
