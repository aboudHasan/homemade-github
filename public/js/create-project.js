document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("projectName");
  const btn = e.target.querySelector("button");
  const msgDiv = document.getElementById("status-msg");

  input.disabled = true;
  btn.disabled = true;
  btn.classList.add("opacity-50", "cursor-not-allowed");
  btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-zinc-600 border-t-zinc-900 rounded-full animate-spin"></span> Creating...`;

  msgDiv.className = "hidden";

  try {
    const response = await fetch("/api/createProject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName: input.value }),
    });

    const data = await response.json();

    if (response.ok) {
      msgDiv.textContent = "Success! Redirecting...";
      msgDiv.className =
        "p-4 rounded text-sm text-center bg-green-900/20 text-green-400 border border-green-900/50";
      msgDiv.classList.remove("hidden");

      setTimeout(() => {
        window.location.href = "/projects";
      }, 1000);
    } else {
      throw new Error(data.error || "Failed to create project");
    }
  } catch (error) {
    msgDiv.textContent = error.message;
    msgDiv.className =
      "p-4 rounded text-sm text-center bg-red-950/20 text-red-400 border border-red-900/50";
    msgDiv.classList.remove("hidden");

    input.disabled = false;
    btn.disabled = false;
    btn.classList.remove("opacity-50", "cursor-not-allowed");
    btn.textContent = "Create Repository";
  }
});
