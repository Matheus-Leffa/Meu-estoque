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

## Deploy com HTTPS

Em produção, o backend deverá ser executado atrás de um proxy reverso ou serviço de hospedagem que forneça certificado TLS válido e redirecione HTTP para HTTPS. Os cookies de autenticação deverão permanecer com `HttpOnly`, `Secure` e `SameSite` configurados conforme o domínio e o fluxo de navegação aprovados.

As instruções específicas de infraestrutura e emissão do certificado serão detalhadas durante a etapa de integração e documentação final.
