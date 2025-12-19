document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbar-actions");
  const heroBtn = document.getElementById("hero-action-btn");
  const storedUser = localStorage.getItem("git_user");

  window.handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      localStorage.removeItem("git_user");
      window.location.reload();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (storedUser) {
    navbarContainer.innerHTML = `
      <div class="flex items-center gap-4">
        <span class="text-zinc-400 text-sm">Hello, <span class="text-white font-medium">${storedUser}</span></span>
        <button onclick="handleLogout()" class="text-sm text-red-400 hover:text-red-300 transition-colors">
          Logout
        </button>
      </div>
    `;

    if (heroBtn) {
      heroBtn.textContent = "Create Repository";
      heroBtn.href = "/create-project";
    }
  } else {
    navbarContainer.innerHTML = `
      <a href="/login" class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-sm text-zinc-100 transition-colors">
        Login
      </a>
    `;
    if (heroBtn) {
      heroBtn.textContent = "Login";
      heroBtn.href = "/login";
    }
  }

  try {
    const response = await fetch("/api/authenticate");
    if (!response.ok) {
      localStorage.removeItem("git_user");
      if (storedUser) window.location.reload();
    }
  } catch (e) {
    console.error("Auth check failed");
  }
});
