document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorDiv = document.getElementById("error-msg");
  const submitBtn = e.target.querySelector("button");

  errorDiv.classList.add("hidden");
  errorDiv.textContent = "";
  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-50", "cursor-not-allowed");

  const credentials = {
    username: usernameInput.value,
    password: passwordInput.value,
  };

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("git_user", data.username);
      window.location.href = "/";
    } else {
      errorDiv.textContent = data.message || "Login failed. Please try again.";
      errorDiv.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Login error:", error);
    errorDiv.textContent =
      "An unexpected error occurred. Is the server running?";
    errorDiv.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
  }
});
