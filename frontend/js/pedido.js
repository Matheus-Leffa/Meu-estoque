const apiBaseUrl = "/api";
const orderStorageKey = "meuestoque_pedido";
const orderBody = document.querySelector("#order-body");
const emptyState = document.querySelector("#empty-state");
const pageMessage = document.querySelector("#page-message");
const totalElement = document.querySelector("#order-total");
const checkoutButton = document.querySelector("#checkout-button");

let products = [];
let order = [];

function readCookie(name) {
  const cookie = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.method && options.method !== "GET"
        ? { "X-CSRF-Token": readCookie("meuestoque_csrf") ?? "" }
        : {}),
      ...(options.headers ?? {}),
    },
  });

  if (response.status === 401) {
    window.location.href = "../index.html";
    throw new Error("Sua sessão expirou.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Não foi possível concluir a operação.");
  }
  return response.status === 204 ? null : response.json();
}

function formatCurrency(valueInCents) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}

function readOrder() {
  try {
    const storedOrder = JSON.parse(localStorage.getItem(orderStorageKey) ?? "[]");
    return Array.isArray(storedOrder) ? storedOrder : [];
  } catch {
    localStorage.removeItem(orderStorageKey);
    return [];
  }
}

function saveOrder() {
  localStorage.setItem(orderStorageKey, JSON.stringify(order));
}

function createIdempotencyKey() {
  return crypto.randomUUID();
}

function showMessage(message, type = "error") {
  pageMessage.textContent = message;
  pageMessage.className = `message message-${type}`;
  pageMessage.hidden = false;
}

function updateCount() {
  const count = order.length;
  document.querySelector("#selection-count").textContent =
    `${count} ${count === 1 ? "item" : "itens"} no pedido`;
}

function getProduct(item) {
  return products.find((product) => product.id === item.productId);
}

function createQuantityInput(item, product) {
  const input = document.createElement("input");
  input.type = "number";
  input.min = "1";
  input.max = String(product.quantidade);
  input.step = "1";
  input.value = String(item.quantidadePedido);
  input.setAttribute("aria-label", `Quantidade de ${product.descricao}`);
  input.addEventListener("change", () => {
    const quantity = Number(input.value);
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || quantity > product.quantidade) {
      input.value = String(item.quantidadePedido);
      showMessage("A quantidade deve ser inteira, positiva e não pode ultrapassar o estoque disponível.");
      return;
    }

    item.quantidadePedido = quantity;
    saveOrder();
    renderOrder();
  });
  return input;
}

function removeItem(item) {
  order = order.filter((currentItem) => currentItem.productId !== item.productId);
  saveOrder();
  renderOrder();
}

function createRemoveButton(item) {
  const button = document.createElement("button");
  button.className = "action-button";
  button.type = "button";
  button.textContent = "Remover";
  button.addEventListener("click", () => removeItem(item));
  return button;
}

function renderOrder() {
  orderBody.replaceChildren();
  emptyState.hidden = order.length !== 0;
  let orderIsValid = order.length > 0;

  let total = 0;
  for (const item of order) {
    const product = getProduct(item);
    if (!product) {
      orderIsValid = false;
      showMessage("Um produto do pedido não está mais cadastrado. Remova-o para continuar.");
      continue;
    }

    if (
      !Number.isSafeInteger(item.quantidadePedido) ||
      item.quantidadePedido <= 0 ||
      item.quantidadePedido > product.quantidade
    ) {
      orderIsValid = false;
      showMessage(
        `A quantidade de "${product.descricao}" excede o estoque atual. Ajuste o pedido para continuar.`,
      );
    }

    const subtotal = item.quantidadePedido * item.valorUnitario;
    total += subtotal;
    const row = document.createElement("tr");
    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = product.descricao;
    const quantityCell = document.createElement("td");
    quantityCell.append(createQuantityInput(item, product));
    const unitValueCell = document.createElement("td");
    unitValueCell.textContent = formatCurrency(item.valorUnitario);
    const subtotalCell = document.createElement("td");
    subtotalCell.textContent = formatCurrency(subtotal);
    const actionsCell = document.createElement("td");
    actionsCell.append(createRemoveButton(item));
    row.append(descriptionCell, quantityCell, unitValueCell, subtotalCell, actionsCell);
    orderBody.append(row);
  }

  totalElement.textContent = formatCurrency(total);
  checkoutButton.disabled = !orderIsValid;
  updateCount();
}

async function loadOrder() {
  products = await apiRequest("/products");
  order = readOrder();
  renderOrder();
}

async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    localStorage.removeItem(orderStorageKey);
    window.location.href = "../index.html";
  }
}

document.querySelector("#back-button").addEventListener("click", () => {
  window.location.href = "./estoque.html";
});
document.querySelector("#logout-button").addEventListener("click", logout);
checkoutButton.addEventListener("click", async () => {
 if (!window.confirm("Tem certeza que quer dar baixa no pedido?")) return;

 checkoutButton.disabled = true;
 try {
   const result = await apiRequest("/checkout", {
     method: "POST",
     body: JSON.stringify({
       chaveIdempotencia: createIdempotencyKey(),
       itens: order.map((item) => ({
         produtoId: item.productId,
         quantidadePedido: item.quantidadePedido,
         valorUnitario: item.valorUnitario,
       })),
     }),
   });
   localStorage.removeItem(orderStorageKey);
   window.location.href = "./estoque.html";
 } catch (error) {
   checkoutButton.disabled = false;
   showMessage(
     "Não foi possível realizar a baixa do pedido. Nenhum produto teve seu estoque alterado.",
   );
 }
});
loadOrder().catch((error) => {
  showMessage(error instanceof Error ? error.message : "Não foi possível carregar o pedido.");
});
