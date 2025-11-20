$(function () {
  const $book = $("#flipbook");

  // Comprobar que turn.js esté cargado
  if (typeof $book.turn !== "function") {
    console.error("turn.js no está disponible");
    return;
  }

  let isDouble = false;
  let resizeTimer = null;

  // ============================
  // Cálculo de tamaño dinámico
  // ============================
  function getBookSize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const isDesktop = vw >= 1024;   // notebooks + PC
    const isTabletLike = vw >= 900 && vw < 1024;

    // Casi sin márgenes → usamos TODO lo posible
    const horizontalMargin = 0;              // sin margen lateral
    const verticalMargin   = isDesktop ? 40 : 50; // muy poco margen arriba/abajo

    const maxWidth  = vw - horizontalMargin;
    const maxHeight = vh - verticalMargin;

    let width, height;

    if (isDesktop || isTabletLike) {
      // DOBLE página en escritorio / notebook
      const ratio = 1.6; // ancho = 1.6 * alto (dos páginas)

      // Partimos del ancho máximo
      width  = maxWidth;
      height = width / ratio;

      // Si la altura se pasa, reajustamos por alto
      if (height > maxHeight) {
        height = maxHeight;
        width  = height * ratio;
      }
    } else {
      // CELU / TABLET chica → casi todo el espacio
      width  = maxWidth * 0.98;
      height = maxHeight;

      const minHeight = 420;
      if (height < minHeight) height = minHeight;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  const initialSize = getBookSize();

  // ============================
  // Inicializar libro: SOLO tapa
  // ============================
  $book.turn({
    width: initialSize.width,
    height: initialSize.height,
    display: "single",
    autoCenter: true,
    elevation: 80,
    gradients: true,
    duration: 900,
  });

  // ============================
  // Redimensionar libro
  // ============================
  function resizeBook() {
    const size = getBookSize();
    $book.turn("size", size.width, size.height);
  }

  // ============================
  // Actualizar label de página
  // ============================
  function updatePageLabel() {
    const page = $book.turn("page");
    const total = $book.turn("pages");
    $("#pageLabel").text(`Page ${page} of ${total}`);
  }

  // Cuando se da vuelta la página
  $book.bind("turned", function (e, page) {
    const vw = window.innerWidth;

    // En cuanto salís de la tapa => doble página SOLO si hay ancho
    if (page > 1 && !isDouble && vw >= 900) {
      $book.turn("display", "double");
      isDouble = true;
      resizeBook();
    }

    // Si volvés a la tapa, volvemos a single
    if (page === 1 && isDouble) {
      $book.turn("display", "single");
      isDouble = false;
      resizeBook();
    }

    updatePageLabel();
  });

  // ============================
  // Flechas de navegación
  // ============================
  $("#arrowPrev").on("click", function () {
    $book.turn("previous");
  });

  $("#arrowNext").on("click", function () {
    $book.turn("next");
  });

  // Click sobre el libro (izquierda/derecha)
  $book.on("click", function (e) {
    const offset = $book.offset();
    const x = e.pageX - offset.left;
    const width = $book.width();

    if (x < width / 2) {
      $book.turn("previous");
    } else {
      $book.turn("next");
    }
  });

  // Teclas de flecha
  $(document).on("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      $book.turn("previous");
    } else if (e.key === "ArrowRight") {
      $book.turn("next");
    }
  });

  // ============================
  // Overlay de orientación (móvil)
  // ============================
  const rotateNotice = document.querySelector(".rotate-notice");

  function checkOrientation() {
    if (!rotateNotice) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const isPortrait = h > w;
    const isMobile = w < 900;

    if (isMobile && isPortrait) {
      rotateNotice.style.display = "flex";
    } else {
      rotateNotice.style.display = "none";
    }
  }

  // Llamadas iniciales
  resizeBook();
  updatePageLabel();
  checkOrientation();

  // Redimensionar cuando cambia el tamaño de la ventana (con debounce)
  $(window).on("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeBook();
      checkOrientation();
    }, 80);
  });

  window.addEventListener("orientationchange", checkOrientation);
});
