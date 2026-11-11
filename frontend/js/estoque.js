const apiBaseUrl = "/api";
const orderStorageKey = "meuestoque_pedido";
const productsBody = document.querySelector("#products-body");
const emptyState = document.querySelector("#empty-state");
const pageMessage = document.querySelector("#page-message");
const dialog = document.querySelector("#product-dialog");
const productForm = document.querySelector("#product-form");
const formError = document.querySelector("#form-error");
const dialogTitle = document.querySelector("#dialog-title");
const orderButton = document.querySelector("#order-button");
const searchForm = document.querySelector("#product-search-form");
const searchInput = document.querySelector("#product-search-input");
const clearSearchButton = document.querySelector("#clear-search-button");
const searchFields = document.querySelectorAll('input[name="search-field"]');

let products = [];
let activeSearch = null;

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
      ...(options.method && options.method !== "GET" ? { "X-CSRF-Token": readCookie("meuestoque_csrf") ?? "" } : {}),
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
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(valueInCents / 100);
}

function getOrder() {
  try {
    const storedOrder = JSON.parse(localStorage.getItem(orderStorageKey) ?? "[]");
    return Array.isArray(storedOrder) ? storedOrder : [];
  } catch {
    localStorage.removeItem(orderStorageKey);
    return [];
  }
}

function updateOrderCount() {
  const count = getOrder().length;
  document.querySelector("#selection-count").textContent = `${count} ${count === 1 ? "item" : "itens"} no pedido`;
}

function selectProduct(product) {
  const order = getOrder();
  const existing = order.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantidadePedido = Math.min(existing.quantidadePedido + 1, product.quantidade);
  } else {
    order.push({ productId: product.id, quantidadePedido: 1, valorUnitario: product.valorCentavos });
  }
  localStorage.setItem(orderStorageKey, JSON.stringify(order));
  updateOrderCount();
  showPageMessage("Produto adicionado ao pedido.", "success");
}

function renderProducts() {
  productsBody.replaceChildren();
  emptyState.hidden = products.length !== 0;
  emptyState.textContent = activeSearch
    ? "Nenhum produto encontrado para a pesquisa."
    : "Nenhum produto cadastrado.";

  for (const product of products) {
    const row = document.createElement("tr");
    const cells = [
      product.id,
      product.referencia,
      product.descricao,
      product.marca,
      product.quantidade,
      formatCurrency(product.valorCentavos),
    ];
    for (const value of cells) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }
    if (product.quantidade === 0) row.children[4].classList.add("stock-zero");

    const actions = document.createElement("td");
    const actionsWrapper = document.createElement("div");
    actionsWrapper.className = "row-actions";
    actionsWrapper.append(
      createActionButton("Selecionar", () => selectProduct(product), product.quantidade === 0),
      createActionButton("Editar", () => openEditDialog(product)),
      createActionButton("Excluir", () => deleteProduct(product)),
    );
    actions.append(actionsWrapper);
    row.append(actions);
    productsBody.append(row);
  }
}

function createActionButton(label, action, disabled = false) {
  const button = document.createElement("button");
  button.className = "action-button";
  button.type = "button";
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener("click", action);
  return button;
}

function showPageMessage(message, type = "error") {
  pageMessage.textContent = message;
  pageMessage.className = `message message-${type}`;
  pageMessage.hidden = false;
}

function clearFormError() {
  formError.textContent = "";
  formError.hidden = true;
}

function openCreateDialog() {
  productForm.reset();
  document.querySelector("#product-id").value = "";
  dialogTitle.textContent = "Cadastrar produto";
  clearFormError();
  dialog.showModal();
}

function openEditDialog(product) {
  document.querySelector("#product-id").value = product.id;
  document.querySelector("#reference").value = product.referencia;
  document.querySelector("#description").value = product.descricao;
  document.querySelector("#brand").value = product.marca;
  document.querySelector("#quantity").value = product.quantidade;
  document.querySelector("#price").value = (product.valorCentavos / 100).toFixed(2).replace(".", ",");
  dialogTitle.textContent = "Editar produto";
  clearFormError();
  dialog.showModal();
}

function parsePrice(value) {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Informe um valor monetário válido.");
  const cents = Math.round(amount * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("Informe um valor monetário válido.");
  return cents;
}

async function saveProduct(event) {
  event.preventDefault();
  clearFormError();
  try {
    const id = document.querySelector("#product-id").value;
    const body = {
      referencia: document.querySelector("#reference").value,
      descricao: document.querySelector("#description").value,
      marca: document.querySelector("#brand").value,
      quantidade: Number(document.querySelector("#quantity").value),
      valorCentavos: parsePrice(document.querySelector("#price").value),
    };
    await apiRequest(id ? `/products/${id}` : "/products", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    dialog.close();
    await loadProducts();
    showPageMessage("Produto salvo com sucesso.", "success");
  } catch (error) {
    formError.textContent = error instanceof Error ? error.message : "Não foi possível salvar o produto.";
    formError.hidden = false;
  }
}

async function deleteProduct(product) {
  if (!window.confirm(`Excluir o produto "${product.descricao}"?`)) return;
  try {
    await apiRequest(`/products/${product.id}`, { method: "DELETE" });
    await loadProducts();
    showPageMessage("Produto excluído com sucesso.", "success");
  } catch (error) {
    showPageMessage(error instanceof Error ? error.message : "Não foi possível excluir o produto.");
  }
}

async function loadProducts(search = activeSearch) {
  const query = new URLSearchParams();
  if (search !== null) {
    query.set("campo", search.campo);
    query.set("termo", search.termo);
  }
  const queryString = query.toString();
  products = await apiRequest(`/products${queryString ? `?${queryString}` : ""}`);
  activeSearch = search;
  renderProducts();
  updateOrderCount();
}

function getSelectedSearchField() {
  const selectedField = document.querySelector('input[name="search-field"]:checked');
  return selectedField.value;
}

function updateSearchPlaceholder() {
  const labels = {
    referencia: "Referência",
    descricao: "Descrição",
    marca: "Marca",
  };
  searchInput.placeholder = `pesquisar por ${labels[getSelectedSearchField()]}`;
}

async function searchProducts(event) {
  event.preventDefault();
  const termo = searchInput.value.trim();
  if (termo.length === 0) {
    showPageMessage("Informe um termo para pesquisar.");
    searchInput.focus();
    return;
  }

  try {
    await loadProducts({ campo: getSelectedSearchField(), termo });
    pageMessage.hidden = true;
  } catch (error) {
    showPageMessage(error instanceof Error ? error.message : "Não foi possível pesquisar os produtos.");
  }
}

async function clearSearch() {
  searchInput.value = "";
  activeSearch = null;
  try {
    await loadProducts(null);
    pageMessage.hidden = true;
  } catch (error) {
    showPageMessage(error instanceof Error ? error.message : "Não foi possível carregar os produtos.");
  }
}

async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    localStorage.removeItem(orderStorageKey);
    window.location.href = "../index.html";
  }
}

document.querySelector("#new-product-button").addEventListener("click", openCreateDialog);
document.querySelector("#close-dialog-button").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-button").addEventListener("click", () => dialog.close());
document.querySelector("#logout-button").addEventListener("click", logout);
productForm.addEventListener("submit", saveProduct);
searchForm.addEventListener("submit", searchProducts);
clearSearchButton.addEventListener("click", clearSearch);
for (const field of searchFields) {
  field.addEventListener("change", updateSearchPlaceholder);
}
orderButton.addEventListener("click", () => {
  window.location.href = "./pedido.html";
});
updateSearchPlaceholder();
loadProducts().catch((error) => showPageMessage(error instanceof Error ? error.message : "Não foi possível carregar os produtos."));
