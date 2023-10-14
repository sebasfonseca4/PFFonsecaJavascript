// Iniciamos con la el array de peliculas vacio 
let peliculas = [];

// Realizar una solicitud GET utilizando la libreria Axios
axios
  .get("./peliculas.json")
  .then((response) => {
    const peliculas = response.data;
    principal(peliculas);
  })
  .catch((error) => {
    console.error(error);
  });
  
const verCarritoBtn = document.getElementById("ver-carrito");
const carritoBtn = document.getElementById("carrito");
const cerrarCarritoBtn = document.getElementById("cerrar-carrito");

function principal(peliculas) {

  verCarritoBtn.addEventListener("click", function () {
    carritoBtn.classList.add("active");
  });

  cerrarCarritoBtn.addEventListener("click", function () {
    carritoBtn.classList.remove("active");
  });

  const botonVerTodas = document.getElementById("ver-todas");
  botonVerTodas.addEventListener("click", () => {
    renderizarProductos(peliculas, carrito);
  });

  const campoBusqueda = document.getElementById("busqueda");

  campoBusqueda.addEventListener("input", () => {
  const textoBusqueda = document.getElementById("busqueda").value;
  const peliculasFiltradas = peliculas.filter((pelicula) =>
      pelicula.titulo.toLowerCase().includes(textoBusqueda.toLowerCase())
    );
    renderizarProductos(peliculasFiltradas, carrito);
  });

  let carritoRecuperado = localStorage.getItem("carrito");
  let carrito = carritoRecuperado ? JSON.parse(carritoRecuperado) : [];

  const cartItemCountLabel = document.getElementById("cart-item-count");
  cartItemCountLabel.textContent = carrito.length;

  
  renderizarProductos(peliculas);
  renderizarCarrito(carrito);
  renderizarProductos(peliculas, carrito);
  renderizarCategorias(peliculas);
}

function renderizarProductos(peliculas, carrito) {
  let contenedor = document.getElementById("peliculas");
  contenedor.innerHTML = "";

  peliculas.forEach(({ titulo, imagen, precioCompra, id }) => {
    let tarjeta = document.createElement("div");
    tarjeta.className = "col-12 col-md-6 col-lg-3 card-movie";
    tarjeta.id = "tarjeta" + id;

    tarjeta.innerHTML = `
      <div class="card" style="width: 20rem;">
        <img src=${imagen} class="card-img-top" alt="...">
        <div class="card-body">
          <h5 class="card-title">${titulo}</h5>
          <p>Precio: $ ${precioCompra} </p>
          <div class="row d-flex justify-content-center">
            <div class="col-12 text-center">
            <button class="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#productoAgregadoAlCarrito"
              id="${id}">
                Agregar al carrito
            </button>
            </div>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(tarjeta);

    let botonAgregarAlCarrito = document.getElementById(id);
    botonAgregarAlCarrito.addEventListener("click", (e) =>
      agregarProductoAlCarrito(peliculas, carrito, e)
    );
  });
}

function agregarProductoAlCarrito(peliculas, carrito, e) {
  let peliculaBuscada = peliculas.find(
    (peliculas) => peliculas.id === Number(e.target.id)
  );
  let productoEnCarrito = carrito.find(
    (peliculas) => peliculas.id === peliculaBuscada.id
  );

  if (peliculaBuscada.stock > 0) {
    if (productoEnCarrito) {
      productoEnCarrito.unidades++;
      productoEnCarrito.subtotal =
        productoEnCarrito.unidades * productoEnCarrito.precioUnitario;
    } else {
      carrito.push({
        id: peliculaBuscada.id,
        nombre: peliculaBuscada.titulo,
        imagen: peliculaBuscada.imagen,
        precioUnitario: peliculaBuscada.precioCompra,
        unidades: 1,
        subtotal: peliculaBuscada.precioCompra,
      });
    }
    peliculaBuscada.stock--;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    Swal.fire(
      'Producto agregado al carrito',
      '',
      'success'
    )
  } else {
    Swal.fire(
      'No hay más stock del producto seleccionado',
      '',
      'error'
    )
  }
  const cartItemCountLabel = document.getElementById("cart-item-count");
  cartItemCountLabel.textContent = carrito.length;
  renderizarCarrito(carrito);
}

function renderizarCarrito(productosEnCarrito) {
  console.log(productosEnCarrito);
  if (productosEnCarrito.length > 0) {
    let divCarrito = document.getElementById("lista-carrito");
    divCarrito.innerHTML = "";
    productosEnCarrito.forEach(
      ({ nombre, precioUnitario, unidades, subtotal, imagen }) => {
        let tarjProdCarrito = document.createElement("div");
        tarjProdCarrito.className = "tarjProdCarrito";
        tarjProdCarrito.innerHTML = `
        <div class="row my-5">
          <div class="col-4">
            <img src=${imagen} class="card-img-top img-fluid" alt="...">
          </div> 
          <div class="col-8 d-flex flex-column">
            <h5 class="mb-0 fw-bold">${nombre}</h5>
            <span>Precio unitario: $${precioUnitario}</span>
            <span>Unidades: ${unidades}</span>
            <span>Subtotal: $${subtotal}</span>
          </div>
        </div>
      `;

        divCarrito.appendChild(tarjProdCarrito);
      }
    );

    let boton = document.createElement("button");
    boton.innerHTML = "Finalizar compra";
    boton.className = "mx-auto btn btn-primary d-flex";
    boton.setAttribute("data-bs-toggle", "modal");
    boton.setAttribute("data-bs-target", "#finalizarCompra");
    boton.addEventListener("click", finalizarCompra);
    divCarrito.appendChild(boton);
  } else {
    let divCarrito = document.getElementById("lista-carrito");
    divCarrito.innerHTML = "";
    let textCarrito = document.createElement("div");
    textCarrito.className = "mt-5";
    textCarrito.innerHTML = `
      <h3>No hay productos en el carrito</h3>
    `
    divCarrito.appendChild(textCarrito);
  }
}

function finalizarCompra() {  
  Swal.fire({
    title: '¿Quieres finalizar la compra?',
    showDenyButton: true,
    confirmButtonText: 'Si, finalizar',
    denyButtonText: `No, volver`,
  }).then((result) => {
    if (result.isConfirmed) {
      let carrito = document.getElementById("lista-carrito");
      carrito.innerHTML = "";
      localStorage.removeItem("carrito");
      const cartItemCountLabel = document.getElementById("cart-item-count");
      cartItemCountLabel.textContent = 0;
      carritoBtn.classList.remove("active");
      Swal.fire(
        'Compra finalizada',
        'Gracias por tu compra',
        'success'
      )
    } else if (result.isDenied) {
      carritoBtn.classList.remove("active");
    }
  })
}

function renderizarCategorias(peliculas) {
  let categoriasContainer = document.getElementById("categorias");
  const categoriasUnicas = [
    ...new Set(peliculas.map((pelicula) => pelicula.genero)),
  ];

  categoriasUnicas.forEach((categoria) => {
    const botonCategoria = document.createElement("button");
    botonCategoria.classList.add("btn", "btn-primary", "mx-2");
    botonCategoria.textContent = categoria;

    botonCategoria.addEventListener("click", () => {
      const peliculasFiltradas = peliculas.filter(
        (pelicula) => pelicula.genero === categoria
      );
      renderizarProductos(peliculasFiltradas, carrito);
    });

    categoriasContainer.appendChild(botonCategoria);
  });
}


