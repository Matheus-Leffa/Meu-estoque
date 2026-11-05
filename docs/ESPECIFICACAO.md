# MEUESTOQUE — DOCUMENTO DE ESPECIFICAÇÃO DO PROJETO

**Empresa:** Decor Prime
**Versão:** 1.0
**Status:** Especificação aprovada para planejamento e implementação
**Tipo:** Aplicação Web de gerenciamento e consulta de estoque

---

# 1. CONTEXTO

## 1.1. Descrição do projeto

O MeuEstoque é uma aplicação Web desenvolvida para a loja de iluminação Decor Prime.

Seu objetivo é disponibilizar aos funcionários uma ferramenta simples e acessível para consultar e administrar o estoque de produtos da empresa.

A aplicação será utilizada principalmente por vendedores que precisam consultar rapidamente a disponibilidade e o preço de determinado produto durante o atendimento a clientes.

Atualmente, os vendedores não possuem acesso ao sistema ERP principal da empresa. O MeuEstoque funcionará como uma ferramenta auxiliar e independente para consulta e atualização das informações de estoque.

## 1.2. Público-alvo

Funcionários da Decor Prime, inicialmente duas pessoas.

## 1.3. Cenário de utilização

O funcionário acessará o MeuEstoque através de um computador, tablet ou telefone celular.

Após realizar a autenticação, poderá:

- Consultar todos os produtos cadastrados.
- Verificar a quantidade disponível de cada produto.
- Consultar preços.
- Cadastrar novos produtos.
- Editar produtos existentes.
- Excluir produtos.
- Elaborar pedidos e calcular seus valores.
- Dar baixa no estoque após a confirmação de um pedido.

---

# 2. OBJETIVOS

## 2.1. Objetivo principal

Desenvolver uma aplicação Web que funcione como visualizador e editor do estoque atual da Decor Prime.

## 2.2. Objetivos específicos

- Facilitar a consulta de produtos disponíveis.
- Permitir a administração dos produtos cadastrados.
- Permitir a elaboração de orçamentos.
- Calcular automaticamente o valor total de um pedido.
- Permitir a atualização do estoque através de uma operação de baixa.
- Disponibilizar acesso à aplicação em diferentes dispositivos.

## 2.3. Resultado esperado

Uma aplicação Web responsiva, minimalista e intuitiva, que permita aos vendedores consultar o estoque e elaborar pedidos sem depender do acesso ao ERP principal.

O sistema não será responsável por processar pagamentos ou controlar transações financeiras reais.

---

# 3. TECNOLOGIAS

As seguintes tecnologias deverão ser utilizadas:

| Camada            | Tecnologia         |
| ----------------- | ------------------ |
| Frontend          | HTML5              |
| Estilização       | CSS3               |
| Interatividade    | JavaScript         |
| Backend           | Node.js            |
| Linguagem backend | TypeScript         |
| Framework backend | Express            |
| Banco de dados    | PostgreSQL         |
| Autenticação      | Passport.js        |
| Tokens            | JWT                |
| Hash de senha     | bcrypt             |
| Versionamento     | Git e GitHub       |
| Editor            | Visual Studio Code |

## 3.1. Bibliotecas adicionais

A utilização de bibliotecas adicionais deverá ser justificada tecnicamente.

Bibliotecas poderão ser utilizadas quando contribuírem para segurança, precisão dos cálculos, manutenção ou funcionamento da aplicação.

Não adicionar dependências desnecessárias.

---

# 4. REGRAS DE NEGÓCIO

## 4.1. Produto

A entidade Produto deverá possuir os seguintes atributos:

| Atributo   | Tipo   | Regra                                           |
| ---------- | ------ | ----------------------------------------------- |
| id         | number | Identificador único, gerado automaticamente     |
| referencia | string | Obrigatório                                     |
| descricao  | string | Obrigatório                                     |
| marca      | string | Obrigatório                                     |
| quantidade | number | Inteiro maior ou igual a zero                   |
| valor      | number | Valor monetário em centavos inteiros no backend |

Regras:

1. Todos os campos, exceto o identificador gerado automaticamente, devem ser preenchidos.
2. Nenhum campo obrigatório poderá receber valores nulos ou vazios.
3. A quantidade deverá ser um número inteiro maior ou igual a zero.
4. O valor deverá ser maior que zero.
5. Todos os campos do produto poderão ser editados.
6. Um produto com quantidade zero continuará cadastrado.
7. Produtos com quantidade zero não poderão ser adicionados a pedidos.
8. A exclusão de produtos será uma decisão administrativa explícita.
9. Não haverá exclusão automática de produtos quando o estoque chegar a zero.

## 4.2. Controle de estoque

O sistema deverá manter a quantidade atual de cada produto.

A quantidade poderá ser alterada através da edição do produto ou através da funcionalidade Dar Baixa.

O estoque nunca poderá apresentar quantidade negativa.

## 4.3. Pedido

O pedido será composto por produtos selecionados pelo funcionário.

Os produtos selecionados serão tratados conceitualmente como `Produto_Pedido`.

A entidade Produto_Pedido deverá possuir:

| Atributo          | Descrição                                                    |
| ----------------- | ------------------------------------------------------------ |
| produto           | Referência ao produto selecionado                            |
| quantidade_pedido | Quantidade desejada pelo vendedor                            |
| valor_unitario    | Cópia do valor do produto no momento da inclusão no pedido   |
| subtotal          | Resultado da multiplicação da quantidade pelo valor unitário |

Regras:

1. Um produto não poderá aparecer duplicado no mesmo pedido. Caso seja selecionado novamente, sua quantidade deverá ser atualizada.
2. A quantidade solicitada não poderá ser maior que a quantidade disponível no estoque.
3. A quantidade solicitada deverá ser um número inteiro positivo.
4. O valor unitário deverá ser copiado do cadastro do produto no momento de sua inclusão no pedido.
5. Alterações posteriores no preço do produto não deverão modificar o valor unitário já registrado no pedido em andamento.
6. O pedido será temporário e não será armazenado no PostgreSQL.
7. O pedido não deverá modificar o estoque durante sua elaboração.
8. O estoque somente será atualizado quando o funcionário utilizar a funcionalidade Dar Baixa.
9. Após a baixa bem-sucedida, o pedido será encerrado e não poderá receber uma segunda baixa.

## 4.4. Cálculo do pedido

O subtotal de cada produto será calculado através da seguinte fórmula:

**Subtotal:**

quantidade_pedido × valor_unitario

**Valor total:**

Soma dos subtotais de todos os produtos selecionados.

O cálculo deverá utilizar centavos inteiros no backend, evitando problemas de precisão de ponto flutuante.

Exemplo:

| Produto     | Quantidade | Valor unitário |      Subtotal |
| ----------- | ---------: | -------------: | ------------: |
| Pendente A  |          2 |      R$ 150,90 |     R$ 301,80 |
| Arandela B  |          3 |       R$ 89,50 |     R$ 268,50 |
| Luminária C |          1 |      R$ 220,00 |     R$ 220,00 |
| **Total**   |            |                | **R$ 790,30** |

Os valores deverão ser apresentados ao usuário no formato brasileiro de moeda (R$ 0,00).

## 4.5. Integridade monetária

A aplicação deverá utilizar centavos inteiros para representar valores monetários nas operações realizadas pelo backend.

Exemplo:

- R$ 10,50 será representado internamente por 1050.
- R$ 25,99 será representado internamente por 2599.
- R$ 100,00 será representado internamente por 10000.

Regras:

1. Não realizar operações financeiras utilizando valores decimais comuns sem controle de precisão.
2. O backend deverá receber, armazenar e processar os valores monetários em centavos inteiros.
3. O PostgreSQL deverá utilizar um tipo inteiro apropriado para armazenar os centavos.
4. A conversão para reais deverá ocorrer somente quando necessária para apresentação.
5. O frontend deverá apresentar os valores utilizando formatação monetária brasileira.

## 4.6. Funcionalidade Dar Baixa

A funcionalidade Dar Baixa será responsável por atualizar o estoque de todos os produtos envolvidos em um pedido.

Funcionamento:

1. O funcionário elabora um pedido.
2. O sistema apresenta os produtos, quantidades, valores unitários, subtotais e valor total.
3. O funcionário pressiona o botão Dar Baixa.
4. O sistema apresenta um alerta de confirmação com a seguinte mensagem:

"Tem certeza que quer dar baixa no pedido?"

5. Caso o funcionário cancele, nenhuma alteração será realizada.
6. Caso confirme, o backend deverá iniciar uma operação atômica no PostgreSQL.
7. O sistema deverá verificar novamente a disponibilidade de todos os produtos.
8. O sistema deverá atualizar a quantidade de todos os produtos envolvidos.
9. Caso todas as atualizações sejam realizadas corretamente, a transação será confirmada.
10. Após o sucesso, o pedido será encerrado e o usuário retornará à tela de estoque.

### Integridade da operação

A baixa deverá ser realizada através de uma transação do PostgreSQL.

**A operação deverá ser totalmente atômica.**

Isso significa:

- Se todos os produtos forem atualizados corretamente, a operação será confirmada.
- Se qualquer produto apresentar erro durante a operação, toda a transação deverá ser revertida (ROLLBACK).
- Nenhum produto daquele pedido poderá ter sua quantidade alterada caso ocorra uma falha.

Quando houver erro, o sistema deverá apresentar uma mensagem informando explicitamente:

"Não foi possível realizar a baixa do pedido. Nenhum produto teve seu estoque alterado."

A mensagem deverá ser apresentada somente após o backend confirmar que a transação foi revertida.

Também deverá existir proteção contra baixas duplicadas, impedindo que o mesmo pedido seja processado duas vezes acidentalmente.

---

# 5. AUTENTICAÇÃO E SEGURANÇA

## 5.1. Modelo de autenticação

A aplicação utilizará uma senha única compartilhada pelos funcionários.

Não haverá cadastro de usuários individuais nesta primeira versão.

## 5.2. Regras de autenticação

1. O funcionário deverá informar a senha para acessar o sistema.
2. A senha deverá ser armazenada exclusivamente em formato hash utilizando bcrypt.
3. A senha original não poderá ficar armazenada em texto puro.
4. O backend será responsável por validar a senha.
5. Após a autenticação bem-sucedida, deverá ser emitido um JWT.
6. O JWT deverá possuir prazo de expiração.
7. O segredo utilizado para assinar o JWT deverá estar armazenado em variável de ambiente.
8. A senha e o segredo JWT nunca poderão ser enviados ao frontend.
9. As rotas protegidas deverão exigir autenticação.
10. A comunicação em produção deverá utilizar HTTPS.

## 5.3. Proteção das rotas

Todas as operações relacionadas aos produtos deverão exigir autenticação.

A validação do JWT deverá ocorrer através de middleware apropriado.

O Passport.js deverá ser utilizado para estruturar a estratégia de autenticação.

## 5.4. Variáveis de ambiente

Informações sensíveis deverão ser armazenadas em variáveis de ambiente.

Exemplos:

- Segredo JWT.
- Hash da senha de acesso.
- Configurações de conexão com o PostgreSQL.

O arquivo `.env` não deverá ser versionado no Git.

Um arquivo `.env.example` poderá ser disponibilizado com os nomes das variáveis necessárias, sem valores secretos.

---

# 6. REQUISITOS FUNCIONAIS

| Código | Descrição                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| RF01   | O sistema deve exigir uma senha única para permitir o acesso.                                                                   |
| RF02   | O sistema deve permitir o cadastro de produtos.                                                                                 |
| RF03   | O sistema deve permitir o cálculo do valor total de um pedido.                                                                  |
| RF04   | O sistema deve permitir a listagem de todos os produtos cadastrados.                                                            |
| RF05   | O sistema deve permitir a atualização de todos os dados de um produto.                                                          |
| RF06   | O sistema deve permitir a exclusão de um produto.                                                                               |
| RF07   | O sistema deve permitir a seleção de produtos para composição de um pedido.                                                     |
| RF08   | O sistema deve permitir informar e alterar a quantidade desejada de cada produto no pedido.                                     |
| RF09   | O sistema deve permitir dar baixa no estoque de todos os produtos envolvidos em um pedido, mediante confirmação do funcionário. |

---

# 7. REQUISITOS NÃO FUNCIONAIS

| Código | Descrição                                                                                                  |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| RNF01  | O cálculo total de um pedido deverá ser realizado em no máximo 1 segundo.                                  |
| RNF02  | A senha deverá ser armazenada utilizando hash bcrypt.                                                      |
| RNF03  | O JWT deverá possuir prazo de expiração.                                                                   |
| RNF04  | A aplicação deverá ser responsiva para notebooks, tablets e celulares.                                     |
| RNF05  | O segredo JWT deverá ser armazenado em variável de ambiente.                                               |
| RNF06  | As rotas protegidas deverão exigir autenticação.                                                           |
| RNF07  | O backend deverá validar os dados recebidos, independentemente das validações do frontend.                 |
| RNF08  | Senhas e segredos não poderão ser enviados ao frontend.                                                    |
| RNF09  | A comunicação em produção deverá utilizar HTTPS.                                                           |
| RNF10  | Os cálculos monetários deverão preservar a precisão decimal através da representação em centavos inteiros. |
| RNF11  | A operação Dar Baixa deverá garantir atomicidade e consistência do estoque.                                |

---

# 8. DESIGN E INTERFACE

## 8.1. Identidade visual

Estilo minimalista, priorizando facilidade de utilização, legibilidade e agilidade na consulta de informações.

### Paleta de cores

| Cor          | Utilização                                  | Proporção |
| ------------ | ------------------------------------------- | --------: |
| Cinza claro  | Fundo principal e áreas de conteúdo         |       60% |
| Azul marinho | Elementos principais, navegação e destaques |       30% |
| Cinza escuro | Textos e detalhes                           |       10% |

## 8.2. Referência visual

[https://tabley.online/pt/](https://tabley.online/pt/)

O Tabley poderá ser utilizado como referência de organização e apresentação de tabelas, mantendo obrigatoriamente a paleta de cores definida para o MeuEstoque.

## 8.3. Telas da aplicação

### Primeira tela — Login

Tela inicial da aplicação.

Deverá possuir:

- Identificação visual do MeuEstoque.
- Campo para digitação da senha.
- Botão de acesso.
- Mensagem de erro caso a autenticação falhe.

### Segunda tela — Estoque

Será a tela principal da aplicação.

Deverá apresentar uma tabela contendo todos os produtos cadastrados.

Colunas:

- ID.
- Referência.
- Descrição.
- Marca.
- Quantidade disponível.
- Valor unitário.
- Ações.

Ações disponíveis:

- Editar produto.
- Excluir produto.
- Selecionar produto para pedido.
- Cadastrar novo produto.
- Visualizar pedido.

O funcionário deverá conseguir selecionar vários produtos para compor um mesmo pedido.

### Terceira tela — Pedido

Deverá apresentar os produtos selecionados pelo funcionário.

Colunas:

- Descrição.
- Quantidade solicitada.
- Valor unitário.
- Subtotal.

A quantidade deverá ser editável.

O sistema deverá apresentar abaixo da tabela o valor total do pedido.

Também deverá disponibilizar:

- Botão para remover produtos do pedido.
- Botão para voltar ao estoque.
- Botão Dar Baixa.

O botão Dar Baixa deverá apresentar a confirmação especificada na seção 4.6.

Após uma baixa bem-sucedida, o pedido será encerrado e o usuário retornará à tela de estoque.

Em caso de falha, o pedido deverá permanecer disponível para consulta ou nova tentativa, sem alteração parcial do estoque.

## 8.4. Responsividade

A interface deverá se adaptar a:

- Notebooks e desktops.
- Tablets.
- Telefones celulares.

A tabela deverá possuir uma apresentação adequada em telas menores, sem comprometer a leitura ou as ações disponíveis.

## 8.5. Tratamento visual de erros

Erros deverão ser apresentados ao usuário através de pequenas caixas de mensagem em vermelho.

Mensagens de sucesso poderão utilizar elementos visuais em verde.

As mensagens deverão ser claras e compreensíveis, evitando apresentar detalhes internos da aplicação.

---

# 9. ARQUITETURA E ORGANIZAÇÃO DO PROJETO

## 9.1. Arquitetura

O projeto deverá utilizar arquitetura em camadas, mantendo a separação entre frontend e backend.

O frontend deverá se comunicar com o backend através de uma API REST, utilizando JSON.

## 9.2. Responsabilidades das camadas

**Model**

Representa as entidades e estruturas de dados do sistema.

**Repository**

Responsável pela comunicação com o PostgreSQL, realizando consultas, inserções, atualizações e exclusões.

**Service**

Responsável pelas regras de negócio e validações relacionadas ao funcionamento da aplicação.

**Controller**

Responsável por receber as requisições HTTP, acionar os serviços e devolver as respostas apropriadas.

**Routes**

Responsável por mapear os endpoints da API para seus respectivos controllers.

**Middlewares**

Responsáveis por funcionalidades intermediárias, como autenticação JWT, validações e tratamento de requisições.

## 9.3. Separação do frontend e backend

Os projetos deverão possuir separação física e lógica.

O frontend não deverá acessar diretamente o PostgreSQL.

Toda comunicação com o banco de dados deverá acontecer através do backend.

## 9.4. Tratamento de erros

Os erros deverão ser tratados adequadamente nas diferentes camadas.

O backend deverá retornar respostas HTTP apropriadas e mensagens em formato JSON.

O frontend deverá interpretar essas respostas e apresentar mensagens amigáveis ao funcionário.

Não apresentar stack traces ou informações sensíveis na interface.

---

# 10. BANCO DE DADOS

O PostgreSQL será responsável por armazenar os produtos e suas respectivas informações.

## 10.1. Entidade Produto

Tabela principal:

**produtos**

| Coluna         | Tipo sugerido         |
| -------------- | --------------------- |
| id             | BIGSERIAL PRIMARY KEY |
| referencia     | VARCHAR               |
| descricao      | VARCHAR ou TEXT       |
| marca          | VARCHAR               |
| quantidade     | INTEGER               |
| valor_centavos | BIGINT                |

Restrições:

- Campos obrigatórios devem utilizar NOT NULL.
- Quantidade deverá possuir restrição CHECK para impedir valores negativos.
- Valor deverá possuir restrição CHECK para exigir valores positivos.
- O identificador deverá ser gerado automaticamente.

A referência deverá possuir uma política de unicidade definida durante o planejamento da implementação, considerando que ela identifica comercialmente o produto.

## 10.2. Pedidos

Os pedidos não serão armazenados no PostgreSQL.

A composição de um pedido será temporária e existirá somente durante sua elaboração e utilização.

A operação Dar Baixa receberá os dados necessários para atualizar o estoque, mas não deverá criar uma tabela permanente de pedidos.

---

# 11. IMPEDITIVOS E RESTRIÇÕES

Durante o desenvolvimento, deverão ser respeitadas as seguintes restrições:

1. Não armazenar senhas em texto puro.
2. Não enviar senhas ou segredos ao frontend.
3. Não utilizar tecnologias fora da stack definida sem autorização.
4. Não implementar processamento de pagamentos.
5. Não implementar funcionalidades fora do escopo.
6. Não modificar arquivos ou estruturas existentes sem autorização.
7. Não adicionar dependências sem justificativa.
8. Não ignorar regras de negócio ou validações.
9. Não concentrar toda a lógica em um único arquivo.
10. Não permitir que o estoque fique negativo.
11. Não modificar o estoque durante a elaboração de um pedido.
12. Não permitir baixas duplicadas.
13. Não permitir atualizações parciais durante uma operação de baixa.
14. Não armazenar pedidos permanentemente no PostgreSQL.
15. Não implementar funcionalidades de fotografia de produtos nesta versão.
16. Não substituir tecnologias definidas por alternativas sem autorização.

Dados fictícios poderão ser utilizados exclusivamente em ambiente de desenvolvimento e testes, sem substituir os dados reais no ambiente de produção.

---

# 12. DIRETRIZES PARA O GITHUB COPILOT

Esta seção possui caráter obrigatório e deverá orientar todo o trabalho realizado pelo GitHub Copilot.

## 12.1. Análise inicial obrigatória

Antes de escrever qualquer código, o Copilot deverá:

1. Analisar a estrutura atual do repositório.
2. Identificar arquivos e pastas existentes.
3. Identificar tecnologias e dependências já configuradas.
4. Verificar se existe alguma implementação anterior.
5. Identificar possíveis conflitos entre a estrutura existente e a especificação.
6. Avaliar a arquitetura necessária.
7. Identificar riscos técnicos e possíveis dificuldades de implementação.

## 12.2. Relatório de implementação obrigatório

**ANTES DE EXECUTAR QUALQUER IMPLEMENTAÇÃO, O COPILOT DEVERÁ APRESENTAR UM RELATÓRIO DE IMPLEMENTAÇÃO.**

O relatório deverá conter:

1. Resumo do entendimento do projeto.
2. Análise da estrutura atual do repositório.
3. Arquitetura proposta.
4. Estrutura de pastas proposta.
5. Dependências necessárias e justificativas.
6. Modelo de dados e estrutura do banco PostgreSQL.
7. Estratégia de autenticação e segurança.
8. Estratégia de representação monetária em centavos inteiros.
9. Estratégia para a operação atômica Dar Baixa.
10. Planejamento das etapas de implementação.
11. Possíveis riscos técnicos e suas respectivas soluções.
12. Dúvidas ou informações que ainda precisam ser esclarecidas.

O relatório deverá ser apresentado em linguagem clara, organizada e técnica.

Caso existam decisões arquiteturais que não estejam explicitamente definidas neste documento, o Copilot deverá apresentar suas recomendações e aguardar aprovação.

**O Copilot NÃO deverá criar arquivos, instalar dependências, modificar códigos ou executar comandos que alterem o projeto antes da aprovação do relatório.**

## 12.3. Desenvolvimento incremental

O desenvolvimento deverá ocorrer por etapas.

Cada etapa deverá possuir uma única responsabilidade principal.

O Copilot deverá:

- Trabalhar exclusivamente na etapa autorizada.
- Não antecipar funcionalidades de etapas futuras.
- Não modificar partes não relacionadas ao objetivo da etapa.
- Explicar decisões técnicas relevantes.
- Informar todos os arquivos criados ou modificados.
- Apresentar os resultados e testes realizados.
- Informar eventuais problemas encontrados.
- Aguardar autorização antes de iniciar a próxima etapa.

## 12.4. Relatório ao final de cada etapa

Ao concluir cada etapa, o Copilot deverá apresentar:

**RELATÓRIO DE IMPLEMENTAÇÃO**

- Objetivo da etapa.
- O que foi implementado.
- Arquivos criados.
- Arquivos modificados.
- Dependências adicionadas, caso existam.
- Decisões técnicas tomadas.
- Testes executados.
- Resultados dos testes.
- Problemas encontrados.
- Pendências identificadas.
- Instruções para validação manual, quando necessário.

O relatório deverá ser apresentado antes de qualquer avanço para a etapa seguinte.

## 12.5. Controle de autorização

O Copilot não deverá interpretar a conclusão de uma etapa como autorização automática para iniciar a próxima.

Somente deverá avançar mediante autorização explícita do desenvolvedor.

Caso uma etapa apresente problemas, deverá aguardar orientação antes de tentar implementar soluções que alterem o escopo autorizado.

---

# 13. PLANO DE IMPLEMENTAÇÃO

A implementação deverá seguir a sequência abaixo.

Cada etapa possui uma responsabilidade específica e deverá ser validada individualmente.

| Etapa | Responsabilidade                                                                                |
| ----- | ----------------------------------------------------------------------------------------------- |
| 0     | Análise do projeto e apresentação do relatório de implementação.                                |
| 1     | Estruturação inicial do projeto e configuração dos ambientes frontend e backend.                |
| 2     | Modelagem e configuração do banco de dados PostgreSQL.                                          |
| 3     | Implementação das entidades, repositories e operações básicas de produtos.                      |
| 4     | Implementação das regras de negócio e services de produtos.                                     |
| 5     | Implementação dos controllers, routes e API REST de produtos.                                   |
| 6     | Implementação da autenticação com bcrypt, Passport.js e JWT.                                    |
| 7     | Desenvolvimento da interface de login.                                                          |
| 8     | Desenvolvimento da interface de estoque e gerenciamento de produtos.                            |
| 9     | Desenvolvimento da interface de composição e visualização de pedidos.                           |
| 10    | Implementação da funcionalidade Dar Baixa, com transação atômica e proteção contra duplicidade. |
| 11    | Integração frontend/backend e validação geral.                                                  |
| 12    | Testes, correções e documentação de execução.                                                   |

A ordem poderá receber ajustes justificados durante o planejamento, desde que o desenvolvedor aprove as alterações.

**Importante:** não iniciar uma etapa sem a aprovação da anterior.

---

# 14. CRITÉRIOS DE ACEITAÇÃO

O projeto será considerado concluído quando atender aos seguintes critérios:

## Autenticação

- [ ] O sistema exige senha para acesso.
- [ ] A senha é armazenada utilizando bcrypt.
- [ ] O JWT possui expiração.
- [ ] As rotas protegidas exigem autenticação.
- [ ] Segredos não são expostos ao frontend.

## Produtos

- [ ] É possível cadastrar produtos.
- [ ] É possível listar produtos.
- [ ] É possível editar todos os campos.
- [ ] É possível excluir produtos.
- [ ] Produtos com estoque zero continuam cadastrados.
- [ ] O sistema impede quantidades negativas.
- [ ] Os campos obrigatórios são validados.

## Pedidos

- [ ] É possível selecionar vários produtos.
- [ ] É possível alterar as quantidades solicitadas.
- [ ] A quantidade solicitada não pode ultrapassar o estoque.
- [ ] O valor unitário é preservado no pedido.
- [ ] Os subtotais são calculados corretamente.
- [ ] O valor total é calculado corretamente.
- [ ] O pedido não altera o estoque durante sua elaboração.
- [ ] Os pedidos não são persistidos no PostgreSQL.

## Dar Baixa

- [ ] Existe um botão Dar Baixa.
- [ ] O sistema solicita confirmação antes de atualizar o estoque.
- [ ] O estoque de todos os produtos é atualizado corretamente.
- [ ] A operação utiliza transação atômica.
- [ ] Falhas provocam ROLLBACK.
- [ ] Nenhum produto sofre alteração parcial em caso de falha.
- [ ] O usuário recebe uma mensagem informando que nenhum produto foi alterado quando a operação falha.
- [ ] O pedido é encerrado após uma baixa bem-sucedida.
- [ ] Não é possível realizar uma segunda baixa acidental.
- [ ] O usuário retorna à tela de estoque após o sucesso.

## Interface

- [ ] A interface respeita a identidade visual definida.
- [ ] A aplicação é responsiva.
- [ ] A navegação entre as três telas funciona corretamente.
- [ ] Os erros são apresentados de maneira compreensível.
- [ ] Os valores monetários são exibidos no formato brasileiro.

## Qualidade geral

- [ ] O código respeita a arquitetura definida.
- [ ] As responsabilidades estão separadas.
- [ ] Não existem erros críticos de execução.
- [ ] Os testes essenciais foram executados.
- [ ] Existe documentação para instalação e execução.

---

# 15. INSTRUÇÃO FINAL AO GITHUB COPILOT

Você deverá atuar como um desenvolvedor de software experiente, respeitando integralmente esta especificação.

Seu objetivo não é apenas produzir código funcional, mas construir uma aplicação organizada, segura, modular e de fácil manutenção.

**Sua primeira tarefa NÃO é implementar o sistema.**

Sua primeira tarefa é analisar o projeto existente, compreender integralmente esta especificação e produzir o RELATÓRIO DE IMPLEMENTAÇÃO descrito na seção 12.2.

Após apresentar o relatório, aguarde minha autorização.

O desenvolvimento deverá acontecer de maneira incremental, com uma única responsabilidade por etapa, relatórios de conclusão e validação individual.

Não avance por iniciativa própria.

Não presuma decisões que não foram definidas.

Não implemente funcionalidades fora do escopo.

A prioridade é a qualidade, a integridade dos dados e a correção das regras de negócio.

**Aguarde minha aprovação do relatório de implementação para iniciar a Etapa 1.**
