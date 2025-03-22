# API Schadule Pro v2

API em TypeScript construída com Express.js para o projeto Schadule Pro v2.

## Tecnologias Utilizadas

- TypeScript
- Express.js
- CORS
- Nodemon (desenvolvimento)

## Instalação

```bash
# Instalar dependências
npm install

# Compilar o projeto
npm run build
```

## Executando o Projeto

### Modo de Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Rotas da API

### Rota Principal
- GET `/` - Verificar se a API está funcionando

### Rotas de Exemplo
- GET `/api/exemplo` - Obter todos os itens
- GET `/api/exemplo/:id` - Obter item por ID
- POST `/api/exemplo` - Criar novo item
- PUT `/api/exemplo/:id` - Atualizar item existente
- DELETE `/api/exemplo/:id` - Excluir item existente 