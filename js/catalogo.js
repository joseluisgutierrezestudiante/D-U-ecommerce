document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const categoryIds = CATEGORIES.map((category) => category.id);
  const state = {
    q: params.get('q') || '',
    category: categoryIds.includes(params.get('categoria')) ? params.get('categoria') : 'todas',
    size: '',
    maxPrice: 150,
    sort: 'relevance'
  };

  const categoryFilter = document.getElementById('category-filter');
  const sizeFilter = document.getElementById('size-filter');
  const priceRange = document.getElementById('price-range');
  const priceOutput = document.getElementById('price-output');
  const sortSelect = document.getElementById('sort-select');
  const searchForm = document.getElementById('catalog-search');
  const searchInput = searchForm.querySelector('input');
  const resultsCount = document.getElementById('results-count');
  const activeFilters = document.getElementById('active-filters');
  const emptyState = document.getElementById('catalog-empty');
  const clearButton = document.getElementById('clear-filters');
  const emptyReset = document.getElementById('empty-reset');

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '38', '39', '40', '41', '42', '43', '44', 'Única'];
  let trackedList = false;
  let searchTimer;

  searchInput.value = state.q;
  sortSelect.value = state.sort;
  priceRange.value = state.maxPrice;

  const renderCategoryFilter = () => {
    const options = [{ id: 'todas', name: 'Todas' }].concat(CATEGORIES);
    categoryFilter.innerHTML = options.map((category) => {
      const count = category.id === 'todas'
        ? PRODUCTS.length
        : PRODUCTS.filter((product) => product.category === category.id).length;
      const active = state.category === category.id ? ' is-active' : '';
      return `<button type="button" class="${active.trim()}" data-category="${category.id}">${category.name}<span>${count}</span></button>`;
    }).join('');
  };

  const renderSizeFilter = () => {
    sizeFilter.innerHTML = sizes.map((size) => {
      const active = state.size === size ? ' is-active' : '';
      return `<button type="button" class="size-chip${active}" data-size="${size}">${size}</button>`;
    }).join('');
  };

  const renderActiveFilters = () => {
    const chips = [];
    if (state.category !== 'todas') {
      chips.push(`<span class="active-filter">${categoryName(state.category)}<button type="button" data-remove="category" aria-label="Quitar filtro de categoría">×</button></span>`);
    }
    if (state.size) {
      chips.push(`<span class="active-filter">Talle ${state.size}<button type="button" data-remove="size" aria-label="Quitar filtro de talle">×</button></span>`);
    }
    if (state.q) {
      chips.push(`<span class="active-filter">“${escapeHtml(state.q)}”<button type="button" data-remove="q" aria-label="Quitar búsqueda">×</button></span>`);
    }
    if (state.maxPrice < 150) {
      chips.push(`<span class="active-filter">Hasta ${formatPrice(state.maxPrice)}<button type="button" data-remove="price" aria-label="Quitar filtro de precio">×</button></span>`);
    }
    if (state.sort !== 'relevance') {
      const label = sortSelect.options[sortSelect.selectedIndex].textContent.replace('Ordenar: ', '');
      chips.push(`<span class="active-filter">${label}<button type="button" data-remove="sort" aria-label="Quitar orden">×</button></span>`);
    }
    activeFilters.innerHTML = chips.join('');
    activeFilters.classList.toggle('hidden', chips.length === 0);
  };

  const filteredProducts = () => {
    const query = state.q.trim().toLowerCase();
    let list = PRODUCTS.filter((product) => {
      const matchesCategory = state.category === 'todas' || product.category === state.category;
      const matchesSize = !state.size || product.sizes.includes(state.size);
      const matchesPrice = product.price <= state.maxPrice;
      const haystack = `${product.name} ${categoryName(product.category)} ${product.description}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesCategory && matchesSize && matchesPrice && matchesQuery;
    });

    const sorters = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      name: (a, b) => a.name.localeCompare(b.name, 'es')
    };

    if (sorters[state.sort]) list = list.slice().sort(sorters[state.sort]);
    return list;
  };

  const render = () => {
    const products = filteredProducts();
    grid.innerHTML = products.map(productCard).join('');
    resultsCount.textContent = products.length === 1
      ? '1 producto encontrado'
      : `${products.length} productos encontrados`;
    emptyState.classList.toggle('hidden', products.length > 0);
    grid.classList.toggle('hidden', products.length === 0);
    priceOutput.textContent = `Hasta ${formatPrice(Number(state.maxPrice))}`;
    priceRange.style.setProperty('--range-progress', `${(Number(priceRange.value) / Number(priceRange.max)) * 100}%`);
    renderActiveFilters();
    updateCartCount();
    if (!trackedList && products.length) {
      trackedList = true;
      window.auraTrack?.('view_item_list', {
        item_list_name: 'Catálogo AURA',
        items: products.map((product, index) => ({
          item_id: product.id,
          item_name: product.name,
          item_category: categoryName(product.category),
          price: product.price,
          index
        }))
      });
    }
  };

  const resetFilters = () => {
    state.q = '';
    state.category = 'todas';
    state.size = '';
    state.maxPrice = 150;
    state.sort = 'relevance';
    searchInput.value = '';
    sortSelect.value = 'relevance';
    priceRange.value = 150;
    renderCategoryFilter();
    renderSizeFilter();
    render();
  };

  categoryFilter.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    renderCategoryFilter();
    render();
  });

  sizeFilter.addEventListener('click', (event) => {
    const button = event.target.closest('[data-size]');
    if (!button) return;
    state.size = state.size === button.dataset.size ? '' : button.dataset.size;
    renderSizeFilter();
    render();
  });

  priceRange.addEventListener('input', () => {
    state.maxPrice = Number(priceRange.value);
    render();
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    render();
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.q = searchInput.value.trim();
    render();
  });

  searchInput.addEventListener('input', () => {
    state.q = searchInput.value.trim();
    render();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (state.q) window.auraTrack?.('search', { search_term: state.q });
    }, 600);
  });

  activeFilters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const type = button.dataset.remove;
    if (type === 'category') {
      state.category = 'todas';
      renderCategoryFilter();
    }
    if (type === 'size') {
      state.size = '';
      renderSizeFilter();
    }
    if (type === 'q') {
      state.q = '';
      searchInput.value = '';
    }
    if (type === 'price') {
      state.maxPrice = 150;
      priceRange.value = 150;
    }
    if (type === 'sort') {
      state.sort = 'relevance';
      sortSelect.value = 'relevance';
    }
    render();
  });

  clearButton.addEventListener('click', resetFilters);
  emptyReset.addEventListener('click', resetFilters);

  renderCategoryFilter();
  renderSizeFilter();
  render();
});
