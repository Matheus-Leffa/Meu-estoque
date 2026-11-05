CREATE TABLE produtos (
    id BIGSERIAL PRIMARY KEY,
    referencia VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    marca VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL,
    valor_centavos BIGINT NOT NULL,
    CONSTRAINT produtos_referencia_nao_vazia
        CHECK (length(btrim(referencia)) > 0),
    CONSTRAINT produtos_descricao_nao_vazia
        CHECK (length(btrim(descricao)) > 0),
    CONSTRAINT produtos_marca_nao_vazia
        CHECK (length(btrim(marca)) > 0),
    CONSTRAINT produtos_quantidade_nao_negativa
        CHECK (quantidade >= 0),
    CONSTRAINT produtos_valor_positivo
        CHECK (valor_centavos > 0)
);
