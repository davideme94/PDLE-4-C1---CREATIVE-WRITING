$(function () {
  const $book = $("#flipbook");

  if (typeof $book.turn !== "function") {
    console.error("turn.js no está disponible");
    return;
  }

  let isDouble = false;

  // Inicializar libro: SOLO tapa (single)
  $book.turn({
    display: "single",
    autoCenter: true,
    elevation: 80,
    gradients: true,
    duration: 900
  });

  // Ajustar tamaño: casi toda la pantalla
  function resizeBook() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const maxWidth = vw * 0.96;
    const maxHeight = vh * 0.82;

    const ratio = 1.6;

    let width = maxWidth;
    let height = width / ratio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }

    $book.turn("size", width, height);
  }

  function updatePageLabel() {
    const page = $book.turn("page");
    const total = $book.turn("pages");
    $("#pageLabel").text(`Page ${page} of ${total}`);
  }

  $book.bind("turned", function (e, page) {
    // en cuanto salís de la tapa => doble página
    if (page > 1 && !isDouble) {
      $book.turn("display", "double");
      isDouble = true;
      resizeBook();
    }
    updatePageLabel();
  });

  $("#arrowPrev").on("click", function () {
    $book.turn("previous");
  });

  $("#arrowNext").on("click", function () {
    $book.turn("next");
  });

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

  $(document).on("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      $book.turn("previous");
    } else if (e.key === "ArrowRight") {
      $book.turn("next");
    }
  });

  resizeBook();
  updatePageLabel();

  $(window).on("resize", resizeBook);
});
