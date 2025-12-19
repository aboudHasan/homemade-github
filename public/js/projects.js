document.addEventListener("DOMContentLoaded", () => {
  const directoryView = document.getElementById("directory-view");
  const fileList = document.getElementById("file-list");
  const fileView = document.getElementById("file-view");
  const fileContent = document.getElementById("file-content");
  const fileNameHeader = document.getElementById("file-name-header");
  const fileSizeHeader = document.getElementById("file-size-header");
  const breadcrumbs = document.getElementById("breadcrumbs");
  const loading = document.getElementById("loading");
  const errorView = document.getElementById("error-view");
  const errorMsg = document.getElementById("error-message");

  const ICON_FOLDER = `<svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>`;
  const ICON_FILE = `<svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;

  const urlParams = new URLSearchParams(window.location.search);
  const repoName = urlParams.get("repo");
  const currentPath = urlParams.get("path") || "";

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderBreadcrumbs = () => {
    const parts = [{ name: "Projects", link: "/projects" }];

    if (repoName) {
      parts.push({ name: repoName, link: `/projects?repo=${repoName}` });

      if (currentPath) {
        const pathSegments = currentPath.split("/").filter(Boolean);
        let accumulatedPath = "";
        pathSegments.forEach((segment) => {
          accumulatedPath += accumulatedPath ? `/${segment}` : segment;
          parts.push({
            name: segment,
            link: `/projects?repo=${repoName}&path=${accumulatedPath}`,
          });
        });
      }
    }

    breadcrumbs.innerHTML = parts
      .map((part, index) => {
        const isLast = index === parts.length - 1;
        if (isLast) {
          return `<span class="text-white font-medium">${part.name}</span>`;
        }
        return `<a href="${part.link}" class="hover:text-white hover:underline transition-colors">${part.name}</a><span class="text-zinc-600">/</span>`;
      })
      .join("");
  };

  const fetchData = async () => {
    loading.classList.remove("hidden");
    directoryView.classList.add("hidden");
    fileView.classList.add("hidden");
    errorView.classList.add("hidden");

    try {
      let apiUrl = "/api/projects";

      if (repoName) {
        apiUrl += `/${repoName}`;
        if (currentPath) {
          apiUrl += `/${currentPath}`;
        }
      }

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const data = await response.json();

      if (Array.isArray(data)) {
        renderDirectory(data);
      } else if (data.content !== undefined) {
        renderFile(data);
      } else {
        throw new Error("Unknown data format received");
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Could not load project data. " + err.message;
      errorView.classList.remove("hidden");
    } finally {
      loading.classList.add("hidden");
    }
  };

  const renderDirectory = (items) => {
    directoryView.classList.remove("hidden");
    fileList.innerHTML = "";

    items.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "directory" ? -1 : 1;
    });

    if (currentPath) {
      const parentPath = currentPath.split("/").slice(0, -1).join("/");
      const parentLink = `/projects?repo=${repoName}${
        parentPath ? `&path=${parentPath}` : ""
      }`;

      const row = document.createElement("tr");
      row.className =
        "hover:bg-zinc-800/50 transition-colors cursor-pointer group";
      row.innerHTML = `
        <td class="px-4 py-3 text-zinc-500">
           <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H15a1 1 0 100-2H9.414l1.293-1.293z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
        </td>
        <td class="px-4 py-3 font-medium text-blue-400 group-hover:underline"><a href="${parentLink}" class="block w-full">..</a></td>
        <td class="px-4 py-3"></td>
        <td class="px-4 py-3"></td>
      `;
      fileList.appendChild(row);
    }

    items.forEach((item) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-zinc-800/50 transition-colors group";

      let linkUrl = "";
      if (!repoName) {
        linkUrl = `/projects?repo=${item.name}`;
      } else {
        const nextPath = currentPath
          ? `${currentPath}/${item.name}`
          : item.name;
        linkUrl = `/projects?repo=${repoName}&path=${nextPath}`;
      }

      row.innerHTML = `
        <td class="px-4 py-3">${
          item.type === "directory" ? ICON_FOLDER : ICON_FILE
        }</td>
        <td class="px-4 py-3">
          <a href="${linkUrl}" class="text-zinc-300 hover:text-white group-hover:text-blue-400 block w-full">
            ${item.name}
          </a>
        </td>
        <td class="px-4 py-3 text-right text-zinc-500 font-mono text-xs">
          ${item.type === "file" ? formatSize(item.size) : "-"}
        </td>
        <td class="px-4 py-3 text-right text-zinc-500 text-xs hidden sm:table-cell">
          ${formatDate(item.modified)}
        </td>
      `;
      fileList.appendChild(row);
    });
  };

  const renderFile = (fileData) => {
    fileView.classList.remove("hidden");

    fileNameHeader.textContent = fileData.name;
    fileSizeHeader.textContent = formatSize(fileData.size);

    fileContent.textContent = fileData.content;
  };

  renderBreadcrumbs();
  fetchData();
});
