CREATE TABLE baixas_processadas (
    chave_idempotencia UUID PRIMARY KEY,
    processada_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
