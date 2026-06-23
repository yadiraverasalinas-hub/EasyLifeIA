// Base de datos local de recetas para EasyLife AI MVP
// Contiene recetas con ingredientes, tiempos, porciones y pasos

export interface Recipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  timeMinutes: number;
  servings: number;
  difficulty: "Fácil" | "Medio" | "Difícil";
  category: string;
  requiredIngredients: string[]; // Nombres de ingredientes clave (lowercase)
  optionalIngredients: string[];
  steps: string[];
  tips?: string;
  nutrition?: {
    calories: number; // por porción
    protein: number; // gramos
    carbs: number; // gramos
    fat: number; // gramos
  };
}

export const RECIPES: Recipe[] = [
  {
    id: "r1",
    name: "Arroz Chaufa",
    description: "El clásico arroz frito peruano con sabor a soya y aceite de ajonjolí.",
    emoji: "🍚",
    timeMinutes: 20,
    servings: 2,
    difficulty: "Fácil",
    category: "Arroz",
    requiredIngredients: ["arroz", "huevo", "aceite"],
    optionalIngredients: ["cebolla china", "pollo", "jamón", "soya"],
    steps: [
      "Cocinar el arroz con anticipación y dejar enfriar.",
      "Calentar aceite en un wok o sartén grande a fuego alto.",
      "Añadir el arroz frío y mezclar bien.",
      "Hacer espacio en el centro y agregar los huevos batidos. Revolver constantemente.",
      "Incorporar la cebolla china picada y soya al gusto.",
      "Mezclar todo por 3–4 minutos hasta integrar bien. Servir caliente."
    ],
    tips: "El truco está en usar arroz frío del día anterior para que quede graneado.",
    nutrition: { calories: 350, protein: 12, carbs: 45, fat: 14 }
  },
  {
    id: "r2",
    name: "Tortilla de Huevo con Tomate",
    description: "Una tortilla esponjosa con tomate fresco, perfecta para cualquier momento del día.",
    emoji: "🍳",
    timeMinutes: 10,
    servings: 1,
    difficulty: "Fácil",
    category: "Huevos",
    requiredIngredients: ["huevo", "tomate"],
    optionalIngredients: ["cebolla", "sal", "aceite", "queso"],
    steps: [
      "Batir 2–3 huevos con sal y pimienta.",
      "Picar el tomate en cubos pequeños.",
      "Calentar aceite en una sartén a fuego medio.",
      "Verter los huevos y cuando empiecen a cuajar, agregar el tomate.",
      "Doblar la tortilla por la mitad y cocinar 1 minuto más.",
      "Servir caliente."
    ],
    nutrition: { calories: 280, protein: 18, carbs: 8, fat: 20 }
  },
  {
    id: "r3",
    name: "Pollo a la Plancha con Arroz",
    description: "Pollo jugoso y bien sazonado acompañado de arroz blanco esponjoso.",
    emoji: "🍗",
    timeMinutes: 30,
    servings: 2,
    difficulty: "Fácil",
    category: "Pollo",
    requiredIngredients: ["pollo", "arroz"],
    optionalIngredients: ["ajo", "limón", "sal", "pimienta", "aceite"],
    steps: [
      "Sazonar el pollo con sal, pimienta y ajo al gusto.",
      "Dejar marinar por al menos 10 minutos.",
      "Calentar aceite en una plancha o sartén a fuego medio-alto.",
      "Cocinar el pollo 7–8 min por cada lado hasta dorar.",
      "Mientras tanto, cocer el arroz con sal al gusto.",
      "Servir el pollo sobre el arroz con rodajas de limón."
    ],
    nutrition: { calories: 450, protein: 35, carbs: 50, fat: 12 }
  },
  {
    id: "r4",
    name: "Sopa de Pollo Casera",
    description: "Reconfortante sopa con verduras frescas y pollo tierno.",
    emoji: "🍲",
    timeMinutes: 45,
    servings: 4,
    difficulty: "Medio",
    category: "Sopas",
    requiredIngredients: ["pollo", "zanahoria", "papa"],
    optionalIngredients: ["apio", "cebolla", "ajo", "fideos", "sal"],
    steps: [
      "Hervir el pollo en agua con sal por 20 minutos.",
      "Retirar el pollo, deshebrar y reservar el caldo.",
      "En el mismo caldo, agregar zanahoria y papa en cubos.",
      "Cocinar por 15 minutos a fuego medio.",
      "Añadir los fideos y el pollo deshebrado.",
      "Cocinar 5 minutos más. Rectificar sal y servir."
    ],
    tips: "Añade unas gotas de limón al servir para darle frescura.",
    nutrition: { calories: 320, protein: 28, carbs: 35, fat: 10 }
  },
  {
    id: "r5",
    name: "Ensalada Fresca de Tomate",
    description: "Ensalada colorida y nutritiva lista en minutos.",
    emoji: "🥗",
    timeMinutes: 10,
    servings: 2,
    difficulty: "Fácil",
    category: "Ensaladas",
    requiredIngredients: ["tomate", "cebolla"],
    optionalIngredients: ["lechuga", "limón", "aceite", "sal", "pepino"],
    steps: [
      "Cortar el tomate en rodajas o gajos.",
      "Cortar la cebolla en julianas finas.",
      "Mezclar en un bowl.",
      "Aderezar con limón, aceite de oliva y sal.",
      "Servir fresco."
    ],
    nutrition: { calories: 120, protein: 3, carbs: 12, fat: 7 }
  },
  {
    id: "r6",
    name: "Huevos Revueltos con Jamón",
    description: "Desayuno rápido y proteico para empezar el día con energía.",
    emoji: "🥚",
    timeMinutes: 8,
    servings: 1,
    difficulty: "Fácil",
    category: "Desayuno",
    requiredIngredients: ["huevo", "jamón"],
    optionalIngredients: ["sal", "pimienta", "mantequilla", "queso"],
    steps: [
      "Batir los huevos con sal y pimienta.",
      "Cortar el jamón en trozos pequeños.",
      "Derretir mantequilla en sartén a fuego bajo.",
      "Agregar los huevos y remover suavemente con espátula.",
      "Antes de que cuajen del todo, añadir el jamón.",
      "Servir inmediatamente."
    ],
    nutrition: { calories: 320, protein: 22, carbs: 4, fat: 24 }
  },
  {
    id: "r7",
    name: "Pasta con Salsa de Tomate",
    description: "Pasta italiana con salsa de tomate casera y hierbas aromáticas.",
    emoji: "🍝",
    timeMinutes: 25,
    servings: 2,
    difficulty: "Fácil",
    category: "Pastas",
    requiredIngredients: ["pasta", "tomate"],
    optionalIngredients: ["ajo", "cebolla", "aceite", "albahaca", "queso parmesano"],
    steps: [
      "Hervir agua con sal y cocinar la pasta al dente.",
      "Sofreír ajo y cebolla en aceite de oliva.",
      "Agregar tomate picado o triturado.",
      "Cocinar la salsa por 15 minutos a fuego bajo.",
      "Mezclar la pasta escurrida con la salsa.",
      "Servir con queso rallado y albahaca."
    ],
    nutrition: { calories: 380, protein: 14, carbs: 65, fat: 8 }
  },
  {
    id: "r8",
    name: "Puré de Papa",
    description: "Cremoso puré de papa, perfecto como acompañamiento.",
    emoji: "🥔",
    timeMinutes: 25,
    servings: 4,
    difficulty: "Fácil",
    category: "Guarniciones",
    requiredIngredients: ["papa"],
    optionalIngredients: ["mantequilla", "leche", "sal", "pimienta"],
    steps: [
      "Pelar y cortar las papas en cubos.",
      "Hervir las papas en agua con sal hasta que estén blandas (15 min).",
      "Escurrir y aplastar con un aplastador de papas.",
      "Añadir mantequilla y leche caliente.",
      "Mezclar hasta obtener una consistencia cremosa.",
      "Salpimentar al gusto y servir."
    ],
    nutrition: { calories: 180, protein: 4, carbs: 30, fat: 6 }
  },
  {
    id: "r9",
    name: "Lomo Saltado",
    description: "El emblemático salteado peruano con carne, tomate y papa.",
    emoji: "🥩",
    timeMinutes: 30,
    servings: 2,
    difficulty: "Medio",
    category: "Carnes",
    requiredIngredients: ["carne", "tomate", "papa", "cebolla"],
    optionalIngredients: ["ajo", "soya", "vinagre", "perejil", "arroz"],
    steps: [
      "Cortar la carne en tiras. Sazonar con sal, pimienta y ajo.",
      "Freír las papas en bastones hasta dorar. Reservar.",
      "En wok o sartén caliente con aceite, sellar la carne a fuego alto.",
      "Agregar cebolla y tomate en gajos. Saltear 2 minutos.",
      "Añadir soya y vinagre. Mezclar bien.",
      "Incorporar las papas. Espolvorear perejil picado. Servir con arroz."
    ],
    tips: "El secreto es el fuego muy alto para que los ingredientes se 'chamusquen' ligeramente.",
    nutrition: { calories: 520, protein: 32, carbs: 45, fat: 22 }
  },
  {
    id: "r10",
    name: "Avena con Fruta",
    description: "Desayuno nutritivo con avena cocida y frutas frescas de temporada.",
    emoji: "🥣",
    timeMinutes: 10,
    servings: 1,
    difficulty: "Fácil",
    category: "Desayuno",
    requiredIngredients: ["avena"],
    optionalIngredients: ["leche", "plátano", "manzana", "miel", "canela"],
    steps: [
      "Hervir 1 taza de agua o leche.",
      "Agregar ½ taza de avena y revolver.",
      "Cocinar a fuego bajo 3–5 minutos hasta espesar.",
      "Servir en un bowl.",
      "Decorar con rodajas de fruta y miel."
    ],
    nutrition: { calories: 280, protein: 8, carbs: 50, fat: 6 }
  },
  {
    id: "r11",
    name: "Cebiche de Pollo",
    description: "Versión rápida del cebiche peruano usando pollo cocido en lugar de pescado.",
    emoji: "🍋",
    timeMinutes: 15,
    servings: 2,
    difficulty: "Fácil",
    category: "Ensaladas",
    requiredIngredients: ["pollo", "cebolla", "limón"],
    optionalIngredients: ["ají", "cilantro", "sal", "pimienta"],
    steps: [
      "Cocinar el pollo y deshebrar.",
      "Cortar la cebolla en julianas finas.",
      "Mezclar el pollo con cebolla y jugo de limón.",
      "Añadir ají y cilantro picados.",
      "Sazonar con sal y pimienta.",
      "Marinar 5 minutos antes de servir."
    ],
    nutrition: { calories: 220, protein: 25, carbs: 8, fat: 10 }
  },
  {
    id: "r12",
    name: "Sándwich de Jamón y Queso",
    description: "Sándwich clásico y satisfactorio listo en minutos.",
    emoji: "🥪",
    timeMinutes: 5,
    servings: 1,
    difficulty: "Fácil",
    category: "Snacks",
    requiredIngredients: ["pan", "jamón", "queso"],
    optionalIngredients: ["mayonesa", "lechuga", "tomate", "mostaza"],
    steps: [
      "Tostar el pan si se desea.",
      "Untar mayonesa o mostaza al gusto.",
      "Colocar las rebanadas de jamón y queso.",
      "Agregar lechuga y tomate opcional.",
      "Cerrar y servir."
    ],
    nutrition: { calories: 350, protein: 18, carbs: 30, fat: 18 }
  }
];
