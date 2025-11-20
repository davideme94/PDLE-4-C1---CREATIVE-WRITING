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
    const horizontalMargin = 0;
    const verticalMargin   = isDesktop ? 40 : 50;

    const maxWidth  = vw - horizontalMargin;
    const maxHeight = vh - verticalMargin;

    let width, height;

    if (isDesktop || isTabletLike) {
      const ratio = 1.6; // ancho = 1.6 * alto (dos páginas)

      width  = maxWidth;
      height = width / ratio;

      if (height > maxHeight) {
        height = maxHeight;
        width  = height * ratio;
      }
    } else {
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
  // Inicializar libro
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

  // ============================
  // Cambio de página
  // ============================
  $book.bind("turned", function (e, page) {
    const vw = window.innerWidth;

    if (page > 1 && !isDouble && vw >= 900) {
      $book.turn("display", "double");
      isDouble = true;
      resizeBook();
    }

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

  // Click en mitades del libro
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

  // Teclado
  $(document).on("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      $book.turn("previous");
    } else if (e.key === "ArrowRight") {
      $book.turn("next");
    }
  });

  // ============================
  // Aviso de orientación
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

  resizeBook();
  updatePageLabel();
  checkOrientation();

  $(window).on("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeBook();
      checkOrientation();
    }, 80);
  });

  window.addEventListener("orientationchange", checkOrientation);

  // =============================================================
  // 🟡 PANTALLA COMPLETA — BLOQUE NUEVO (NO TOCA NADA DEL CÓDIGO)
  // =============================================================

  const fullscreenBtn = document.getElementById("fullscreenBtn");

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn("Error al entrar en fullscreen:", err);
        });
        document.body.classList.add("fullscreen-active");
      } else {
        document.exitFullscreen();
        document.body.classList.remove("fullscreen-active");
      }
    });
  }

  // Auto–fullscreen al girar el celular (opcional)
  function autoFullscreenOnRotate() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w > h && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      document.body.classList.add("fullscreen-active");
    }
  }

  window.addEventListener("orientationchange", autoFullscreenOnRotate);
});

