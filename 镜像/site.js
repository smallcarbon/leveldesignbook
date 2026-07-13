(function () {
  const data = window.LDB_SITE_DATA || { pages: [] };
  const body = document.body;
  const page = body.dataset.page;
  const sidebar = document.querySelector("[data-sidebar]");
  const outline = document.querySelector("[data-outline]");
  const searchModal = document.querySelector("[data-search-modal]");
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");

  function closePanels() {
    body.classList.remove("sidebar-open", "outline-open");
  }

  document.querySelectorAll("[data-open-sidebar]").forEach((button) => {
    button.addEventListener("click", () => {
      body.classList.toggle("sidebar-open");
      body.classList.remove("outline-open");
    });
  });

  document.querySelectorAll("[data-open-outline], [data-toggle-outline]").forEach((button) => {
    button.addEventListener("click", () => {
      body.classList.toggle("outline-open");
      body.classList.remove("sidebar-open");
    });
  });

  document.querySelectorAll("[data-close-panels]").forEach((el) => {
    el.addEventListener("click", closePanels);
  });

  document.querySelectorAll(".gb-nav-section").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") !== "false";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
    });
  });

  const activeNav = document.querySelector(".gb-nav-link.active");
  if (activeNav && sidebar) {
    const scroller = sidebar.querySelector(".gb-sidebar-scroll");
    if (scroller) {
      setTimeout(() => {
        scroller.scrollTop = Math.max(0, activeNav.offsetTop - scroller.clientHeight / 2);
      }, 60);
    }
  }

  function headingText(heading) {
    const clone = heading.cloneNode(true);
    clone.querySelectorAll("a[href^='#']").forEach((a) => a.remove());
    return clone.textContent.trim().replace(/\s+/g, " ");
  }

  function slugify(text) {
    return text.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "section";
  }

  function buildOutline() {
    const list = document.querySelector("[data-outline-list]");
    const article = document.querySelector("article");
    if (!list || !article) return;
    const headings = Array.from(article.querySelectorAll("h2, h3, h4"));
    if (!headings.length) {
      list.innerHTML = '<span class="gb-search-empty">本页没有子标题</span>';
      return;
    }
    const used = new Set();
    list.innerHTML = "";
    headings.forEach((heading) => {
      let text = headingText(heading);
      if (!text) return;
      let anchor = heading.querySelector("a[href^='#']");
      let id = heading.id || (anchor ? anchor.getAttribute("href").slice(1) : "");
      if (!id) id = slugify(text);
      let unique = id;
      let count = 2;
      while (used.has(unique)) unique = `${id}-${count++}`;
      used.add(unique);
      heading.id = unique;
      if (anchor) anchor.setAttribute("href", `#${unique}`);
      const link = document.createElement("a");
      link.href = `#${unique}`;
      link.textContent = text;
      link.style.setProperty("--depth", heading.tagName === "H2" ? 0 : heading.tagName === "H3" ? 1 : 2);
      link.addEventListener("click", () => closePanels());
      list.appendChild(link);
    });
  }

  buildOutline();

  function enhanceHints() {
    const article = document.querySelector("article");
    if (!article) return;
    Array.from(article.querySelectorAll("div")).forEach((box) => {
      if (box.classList.contains("gb-hint")) return;
      const children = Array.from(box.children);
      if (children.length !== 2) return;
      const marker = children[0];
      const content = children[1];
      const text = content.textContent.trim();
      if (marker.tagName === "A" || box.querySelector("img")) return;
      if (marker.textContent.trim() !== "" || text.length < 8 || !content.querySelector("p")) return;
      if (box.closest(".gb-home-card")) return;
      const directParent = box.parentElement;
      if (!directParent || directParent.closest(".gb-home-card-grid")) return;
      box.classList.add("gb-hint");
      marker.classList.add("gb-hint-icon");
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = "⚠";
    });
  }

  function enhanceHomeCards() {
    if (!body.classList.contains("gb-home")) return;
    const homeCardImages = {
      "introduction.html": "https://book.leveldesignbook.com/~gitbook/image?url=https%3A%2F%2F1666186240-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-legacy-files%2Fo%2Fassets%252F-LtVT8pJjInrrHVCovzy%252F-MaE772K0MViEPpgnix1%252F-MaE7KkewAoItNRLzmYC%252FLDB_AndrewYoder_doorproblem_foothold_mapcontrol.png%3Falt%3Dmedia%26token%3D760dc20b-ee3d-407b-ae72-6db411790c6f&width=490&dpr=3&quality=100&sign=82cd4d4d&sv=2",
      "process__overview.html": "https://book.leveldesignbook.com/~gitbook/image?url=https%3A%2F%2F1666186240-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-legacy-files%2Fo%2Fassets%252F-LtVT8pJjInrrHVCovzy%252F-LtwoKZ58xOGNTn9g_Qy%252F-Ltwq-JcDDEN7UHH9OLR%252Funcharted4_blockout_em_schatz.jpg%3Falt%3Dmedia%26token%3Dfe61470c-d734-4540-ab8e-a83eb330da7d&width=490&dpr=3&quality=100&sign=944be663&sv=2",
      "studies__overview.html": "https://book.leveldesignbook.com/~gitbook/image?url=https%3A%2F%2F1666186240-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-LtVT8pJjInrrHVCovzy%252Fuploads%252F71IOKqvDrGKYrwOpgaAA%252FLDB_DarkSouls_UndeadBurgDiagram1_path1-2.jpg%3Falt%3Dmedia%26token%3D12284585-6d1e-4d0c-9e37-223372bf79f8&width=490&dpr=3&quality=100&sign=4a1d7ae6&sv=2",
      "appendix__tools.html": "https://book.leveldesignbook.com/~gitbook/image?url=https%3A%2F%2F1666186240-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-legacy-files%2Fo%2Fassets%252F-LtVT8pJjInrrHVCovzy%252F-M2UXP5KgHS8jIc1HmOj%252F-M2UpvIOHBKtFSvq_cGL%252FLDB_ValveHammerEditor35_ValveWiki.png%3Falt%3Dmedia%26token%3Dffaee266-e14a-4007-af38-539663a2a5fa&width=490&dpr=3&quality=100&sign=b8917de7&sv=2",
      "appendix__resources.html": "https://book.leveldesignbook.com/~gitbook/image?url=https%3A%2F%2F1666186240-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-legacy-files%2Fo%2Fassets%252F-LtVT8pJjInrrHVCovzy%252F-MbP02oa-qIyy5tjCgbG%252F-MbP6Rdo6HOddzlUrPo1%252FLDB_ModularGraybox_Transparent_JoelBurgess_Skyrim.png%3Falt%3Dmedia%26token%3D4a1cd17d-c36a-4edd-bb5f-2c457385153c&width=490&dpr=3&quality=100&sign=95e431ed&sv=2",
      "learning__notes.html": "https://book.leveldesignbook.com/~gitbook/image?url=https%3A%2F%2F1666186240-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-LtVT8pJjInrrHVCovzy%252Fuploads%252FUZYFaPCUFEvOrKvMlMSe%252FLDB_PinupPhoto_SarahLeClerc_PrattArchitecture.jpg%3Falt%3Dmedia%26token%3D4d449dba-77c8-41e5-9257-5d87ba76dba9&width=490&dpr=3&quality=100&sign=153a6fa2&sv=2"
    };
    const headings = Array.from(document.querySelectorAll("article h2"));
    const readHeading = headings.find((heading) => headingText(heading).includes("读这本书") || headingText(heading).toLowerCase().includes("read the book"));
    if (!readHeading) return;
    const grid = readHeading.nextElementSibling;
    if (!grid) return;
    grid.classList.add("gb-home-card-grid");
    const anchors = Array.from(grid.querySelectorAll("a[href]")).filter((anchor) => {
      const card = anchor.parentElement;
      return card && card.querySelector("img") && card.textContent.trim().length > 0;
    });
    anchors.forEach((anchor) => {
      const card = anchor.parentElement;
      card.classList.add("gb-home-card");
      const href = anchor.getAttribute("href");
      const img = card.querySelector("img");
      if (img && homeCardImages[href]) {
        img.src = homeCardImages[href];
      }
      let node = card.parentElement;
      while (node && node !== grid) {
        node.classList.add("gb-display-contents");
        node = node.parentElement;
      }
      card.setAttribute("role", "link");
      card.setAttribute("tabindex", "0");
      card.addEventListener("click", (event) => {
        if (event.target.closest("a") && event.target !== anchor) return;
        window.location.href = href;
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          window.location.href = href;
        }
      });
    });
  }

  function enhanceRichLinks() {
    const article = document.querySelector("article");
    if (!article) return;

    const richCards = [];
    Array.from(article.querySelectorAll("a[href]")).forEach((anchor) => {
      const card = anchor.parentElement;
      if (!card || card.classList.contains("gb-home-card") || card.classList.contains("gb-rich-card")) return;
      if (anchor.textContent.trim() !== "") return;
      if (card.closest("picture, figure, figcaption, .gb-home-card-grid")) return;
      const img = card.querySelector("img");
      if (!img || img.closest("picture, figure")) return;
      if (card.textContent.trim().length < 2) return;
      card.classList.add("gb-rich-card");
      card.setAttribute("role", "link");
      card.setAttribute("tabindex", "0");
      richCards.push({ card, anchor });
    });

    function childHasCard(child) {
      return child.classList.contains("gb-rich-card") || !!child.querySelector(".gb-rich-card");
    }

    richCards.forEach(({ card, anchor }) => {
      const href = anchor.getAttribute("href");
      let grid = card.parentElement;
      let cursor = card.parentElement;
      for (let depth = 0; cursor && cursor !== article && depth < 5; depth += 1) {
        const count = Array.from(cursor.children).filter(childHasCard).length;
        if (count >= 2) {
          grid = cursor;
          break;
        }
        cursor = cursor.parentElement;
      }
      if (grid) {
        grid.classList.add("gb-rich-card-grid");
        let node = card.parentElement;
        while (node && node !== grid) {
          node.classList.add("gb-display-contents");
          node = node.parentElement;
        }
      }
      card.addEventListener("click", (event) => {
        if (event.target.closest("a") && event.target !== anchor) return;
        window.location.href = href;
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          window.location.href = href;
        }
      });
    });

    Array.from(article.querySelectorAll("a[href]")).forEach((anchor) => {
      if (anchor.classList.contains("gb-rich-link")) return;
      if (anchor.closest("p, li, h1, h2, h3, h4, figcaption, .gb-rich-card, .gb-home-card, .page-links")) return;
      if (anchor.querySelector("img")) return;
      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;
      const text = anchor.textContent.trim().replace(/\s+/g, " ");
      if (!text || text.length > 100) return;
      const parent = anchor.parentElement;
      if (!parent || parent.closest("p, li, h1, h2, h3, h4, figcaption")) return;
      if (/^(上一页|下一页|下一步)/.test(text)) {
        anchor.classList.add("gb-source-page-link");
        return;
      }
      anchor.classList.add("gb-rich-link");
    });
  }

  enhanceHints();
  enhanceHomeCards();
  enhanceRichLinks();

  function openSearch() {
    if (!searchModal) return;
    searchModal.classList.add("open");
    closePanels();
    setTimeout(() => searchInput && searchInput.focus(), 30);
    renderSearch(searchInput ? searchInput.value : "");
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove("open");
  }

  document.querySelectorAll("[data-open-search]").forEach((button) => button.addEventListener("click", openSearch));
  document.querySelectorAll("[data-close-search]").forEach((button) => button.addEventListener("click", closeSearch));
  if (searchModal) {
    searchModal.addEventListener("click", (event) => {
      if (event.target === searchModal) closeSearch();
    });
  }
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape") {
      closeSearch();
      closePanels();
    }
  });

  function renderSearch(query) {
    if (!searchResults) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      searchResults.innerHTML = '<div class="gb-search-empty">输入关键词搜索 94 个页面</div>';
      return;
    }
    const terms = q.split(/\s+/).filter(Boolean);
    const matches = data.pages
      .map((item) => {
        const haystack = `${item.title || ""} ${item.description || ""} ${item.searchText || ""}`.toLowerCase();
        let score = 0;
        for (const term of terms) {
          if ((item.title || "").toLowerCase().includes(term)) score += 8;
          if ((item.description || "").toLowerCase().includes(term)) score += 4;
          if (haystack.includes(term)) score += 1;
        }
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    if (!matches.length) {
      searchResults.innerHTML = '<div class="gb-search-empty">没有找到匹配页面</div>';
      return;
    }

    searchResults.innerHTML = matches.map(({ item }) => {
      const crumbs = (item.breadcrumbs || []).filter(Boolean).join(" / ");
      const desc = item.description || (item.searchText || "").slice(0, 100);
      return `<a class="gb-search-result" href="${item.href}">
        <strong>${escapeHtml(item.title || item.href)}</strong>
        <small>${escapeHtml(crumbs || "The Level Design Book 中文版")}</small>
        <span>${escapeHtml(desc || "")}</span>
      </a>`;
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => renderSearch(searchInput.value));
  }

  if (location.hash) {
    setTimeout(() => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }, 100);
  }
})();