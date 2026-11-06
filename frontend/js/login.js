const apiBaseUrl = "http://localhost:3000/api";
const form = document.querySelector("#login-form");
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login-button");
const errorMessage = document.querySelector("#login-error");

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

async function requestCsrfToken() {
  const response = await fetch(`${apiBaseUrl}/auth/csrf-token`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível preparar o acesso.");
  }
}

function readCookie(name) {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

async function handleSubmit(event) {
  event.preventDefault();
  clearError();

  if (!passwordInput.value) {
    showError("Informe a senha para acessar o sistema.");
    passwordInput.focus();
    return;
  }

  loginButton.disabled = true;

  try {
    await requestCsrfToken();
    const csrfToken = readCookie("meuestoque_csrf");
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken ?? "",
      },
      body: JSON.stringify({ password: passwordInput.value }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? "Não foi possível realizar o acesso.");
    }

    window.location.href = "./pages/estoque.html";
  } catch (error) {
    showError(
      error instanceof Error
        ? error.message
        : "Não foi possível realizar o acesso.",
    );
  } finally {
    loginButton.disabled = false;
  }
}

form.addEventListener("submit", handleSubmit);
