document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("projectName");
  const btn = e.target.querySelector("button");
  const msgDiv = document.getElementById("status-msg");

  input.disabled = true;
  btn.disabled = true;
  btn.classList.add("opacity-50", "cursor-not-allowed");
  btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-zinc-600 border-t-zinc-900 rounded-full"></span> Creating...`;

  msgDiv.className = "hidden";

  try {
    const response = await fetch("/api/createProject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName: input.value }),
    });

    const data = await response.json();

    if (response.ok) {
      msgDiv.innerHTML = `
        <div class="space-y-3">
          <p class="font-medium text-green-400">Repository created successfully!</p>
          <div class="bg-zinc-900 border border-green-900/30 rounded p-3">
            <code class="text-xs text-zinc-200 break-all">${data.gitUrl}</code>
          </div>
          <div class="flex gap-2 justify-center mt-4">
            <a href="/projects/${input.value}" class="text-sm text-blue-400 hover:text-blue-300 underline">
              View Repository
            </a>
            <span class="text-zinc-600">|</span>
            <a href="/create-project" class="text-sm text-zinc-400 hover:text-white underline">
              Create Another
            </a>
          </div>
        </div>
      `;
      msgDiv.className =
        "p-4 rounded text-sm text-center bg-green-900/20 text-green-400 border border-green-900/50";
      msgDiv.classList.remove("hidden");
      input.value = "";
      input.disabled = false;
      btn.disabled = false;
      btn.classList.remove("opacity-50", "cursor-not-allowed");
      btn.innerHTML = `<span>Create Repository</span>`;
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
