const CATEGORIES = [
  { id: 'mujer', name: 'Mujer', image: 'assets/img/cat-mujer.webp', description: 'Prendas con carácter y sofisticación cotidiana.' },
  { id: 'hombre', name: 'Hombre', image: 'assets/img/jacket.webp', description: 'Básicos urbanos, cortes limpios y comodidad.' },
  { id: 'accesorios', name: 'Accesorios', image: 'assets/img/bag.webp', description: 'El detalle final que transforma cualquier look.' }
];

const PRODUCTS = [
  {
    id: 'camiseta-oversize',
    name: 'Camiseta Oversize Essential',
    category: 'hombre',
    price: 29.9,
    oldPrice: 39.9,
    image: 'assets/img/tshirt.webp',
    badge: 'Nuevo',
    rating: 4.6,
    reviews: 128,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Negro', hex: '#22201f' }, { name: 'Arena', hex: '#ded3c2' }, { name: 'Terracota', hex: '#a8503a' }],
    featured: true,
    description: 'Confeccionada en algodón peinado de 220 g/m² con corte relajado y hombros caídos. Una prenda versátil que se adapta a cualquier plan y mejora con cada lavado.',
    details: ['100% algodón peinado', 'Corte oversize unisex', 'Cuello reforzado', 'Lavado a máquina en frío']
  },
  {
    id: 'jeans-rectos',
    name: 'Jeans Rectos Clásicos',
    category: 'hombre',
    price: 59.9,
    oldPrice: 74.9,
    image: 'assets/img/jeans.webp',
    badge: 'Top ventas',
    rating: 4.7,
    reviews: 96,
    sizes: ['28', '30', '32', '34', '36'],
    colors: [{ name: 'Azul medio', hex: '#4d6b8a' }, { name: 'Azul oscuro', hex: '#2c3e50' }],
    featured: true,
    description: 'Denim rígido de algodón con tiro medio y pierna recta. Un clásico atemporal que estructura cualquier outfit y gana personalidad con el uso.',
    details: ['98% algodón, 2% elastano', 'Tiro medio', 'Pierna recta', 'Cierre con botón y cremallera']
  },
  {
    id: 'chaqueta-bomber',
    name: 'Chaqueta Bomber Urbana',
    category: 'hombre',
    price: 89.9,
    oldPrice: 119.9,
    image: 'assets/img/jacket.webp',
    badge: '-25%',
    rating: 4.8,
    reviews: 74,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Negro', hex: '#1d1d1f' }, { name: 'Verde oliva', hex: '#5a6248' }],
    featured: true,
    description: 'Silueta bomber contemporánea con tejido técnico resistente al viento. Forro interior suave y puños acanalados para un ajuste impecable.',
    details: ['Exterior de poliéster reciclado', 'Forro interior suave', 'Bolsillos laterales con cierre', 'Resistente al viento']
  },
  {
    id: 'vestido-midi',
    name: 'Vestido Midi Elegance',
    category: 'mujer',
    price: 69.9,
    oldPrice: 89.9,
    image: 'assets/img/dress.webp',
    badge: 'Nuevo',
    rating: 4.9,
    reviews: 143,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Marfil', hex: '#e9e1d3' }, { name: 'Negro', hex: '#1a1a1a' }, { name: 'Vino', hex: '#6d2230' }],
    featured: true,
    description: 'Vestido midi de caída fluida con escote cruzado y cintura marcada. Un diseño elegante y ligero, ideal para eventos de día o noche.',
    details: ['Tejido fluido con caída', 'Escote cruzado', 'Forro interior', 'Cierre invisible lateral']
  },
  {
    id: 'zapatillas-motion',
    name: 'Zapatillas Urbanas Motion',
    category: 'accesorios',
    price: 79.9,
    oldPrice: 99.9,
    image: 'assets/img/sneakers.webp',
    badge: 'Top ventas',
    rating: 4.5,
    reviews: 210,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: [{ name: 'Rojo', hex: '#b3392f' }, { name: 'Blanco', hex: '#f0ede8' }, { name: 'Negro', hex: '#232323' }],
    featured: true,
    description: 'Sneakers de perfil deportivo con suela ultraligera y plantilla acolchada. Diseñadas para acompañarte durante todo el día sin sacrificar estilo.',
    details: ['Upper de malla y sintético', 'Suela de goma antideslizante', 'Plantilla acolchada extraíble', 'Cordones planos']
  },
  {
    id: 'bolso-milan',
    name: 'Bolso de Cuero Milán',
    category: 'accesorios',
    price: 99.9,
    oldPrice: null,
    image: 'assets/img/bag.webp',
    badge: 'Edición limitada',
    rating: 4.8,
    reviews: 58,
    sizes: ['Única'],
    colors: [{ name: 'Camel', hex: '#a8774f' }, { name: 'Negro', hex: '#1c1c1c' }],
    featured: true,
    description: 'Bolso estructurado en cuero de grano fino con herrajes dorados. Espacioso, elegante y pensado para durar toda la vida.',
    details: ['Cuero de grano fino', 'Herrajes dorados', 'Interior forrado con bolsillo', 'Asa y correa ajustable']
  },
  {
    id: 'sudadera-cozy',
    name: 'Sudadera con Capucha Cozy',
    category: 'hombre',
    price: 54.9,
    oldPrice: 64.9,
    image: 'assets/img/hoodie.webp',
    badge: null,
    rating: 4.7,
    reviews: 187,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Gris', hex: '#8c8c8c' }, { name: 'Crema', hex: '#e6ddcd' }, { name: 'Negro', hex: '#242424' }],
    featured: true,
    description: 'Sudadera de felpa cepillada con capucha ajustable y bolsillo canguro. El equilibrio perfecto entre abrigo y comodidad para los días frescos.',
    details: ['Felpa de algodón cepillada', 'Capucha con cordón', 'Bolsillo canguro', 'Puños y bajo acanalados']
  },
  {
    id: 'gorra-logo',
    name: 'Gorra Clásica Logo',
    category: 'accesorios',
    price: 24.9,
    oldPrice: null,
    image: 'assets/img/cap.webp',
    badge: 'Agotado',
    rating: 4.4,
    reviews: 64,
    sizes: ['Única'],
    stock: false,
    colors: [{ name: 'Negro', hex: '#212121' }, { name: 'Beige', hex: '#cbbd9f' }],
    featured: true,
    description: 'Gorra de seis paneles con bordado frontal y cierre ajustable. Un accesorio sencillo que aporta carácter a cualquier look casual.',
    details: ['100% algodón', 'Bordado frontal', 'Cierre ajustable', 'Visera curva']
  },
  {
    id: 'camisa-lino',
    name: 'Camisa de Lino Riviera',
    category: 'hombre',
    price: 49.9,
    oldPrice: 59.9,
    image: 'assets/img/shirt.webp',
    badge: null,
    rating: 4.6,
    reviews: 82,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Celeste', hex: '#9db6c9' }, { name: 'Blanco', hex: '#f2efe8' }],
    featured: false,
    description: 'Camisa de lino fresco y transpirable con cuello italiano. Ligera, elegante y perfecta para climas cálidos o capas de entretiempo.',
    details: ['55% lino, 45% algodón', 'Cuello italiano', 'Bolsillo frontal', 'Corte regular']
  },
  {
    id: 'falda-plisada',
    name: 'Falda Plisada Satin',
    category: 'mujer',
    price: 44.9,
    oldPrice: null,
    image: 'assets/img/skirt.webp',
    badge: null,
    rating: 4.5,
    reviews: 51,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Champagne', hex: '#d8c3a5' }, { name: 'Negro', hex: '#1b1b1b' }],
    featured: false,
    description: 'Falda midi plisada en satén con caída fluida y cintura elástica. Un toque de brillo sutil que eleva los básicos del día a día.',
    details: ['Tejido satinado', 'Plisado permanente', 'Cintura elástica', 'Forro interior']
  },
  {
    id: 'mochila-trek',
    name: 'Mochila Urbana Trek',
    category: 'accesorios',
    price: 64.9,
    oldPrice: null,
    image: 'assets/img/backpack.webp',
    badge: null,
    rating: 4.6,
    reviews: 73,
    sizes: ['Única'],
    colors: [{ name: 'Negro', hex: '#242424' }, { name: 'Gris', hex: '#6f7377' }],
    featured: false,
    description: 'Mochila versátil con compartimento acolchado para portátil, bolsillos organizadores y tejido resistente al agua. Diseñada para la ciudad y más allá.',
    details: ['Tejido resistente al agua', 'Compartimento para portátil 15"', 'Bolsillos organizadores', 'Espalda acolchada']
  },
  {
    id: 'blazer-minimal',
    name: 'Blazer Sastre Minimal',
    category: 'mujer',
    price: 109.9,
    oldPrice: 139.9,
    image: 'assets/img/blazer.webp',
    badge: '-21%',
    rating: 4.9,
    reviews: 39,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Beige', hex: '#c2b29a' }, { name: 'Negro', hex: '#202020' }],
    featured: false,
    description: 'Blazer de sastrería ligera con solapa clásica y hombros estructurados. Una pieza clave para elevar cualquier conjunto con una elegancia sobria.',
    details: ['Tejido de sastrería', 'Solapa clásica', 'Forro interior', 'Bolsillos con solapa']
  }
];

const SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 5.9;

function findProduct(id) {
  return PRODUCTS.find((product) => product.id === id);
}

function categoryName(id) {
  const category = CATEGORIES.find((item) => item.id === id);
  return category ? category.name : '';
}
