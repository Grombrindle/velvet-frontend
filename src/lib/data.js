export const clothingItems = Array.from({ length: 24 }).map((_, index) => {
  const id = index + 1;

  // Rotating some titles for variety
  const types = [
    "Classic Hoodie",
    "Slim Fit Chinos",
    "Oversized Tee",
    "Denim Jacket",
    "Knit Sweater",
    "Cargo Pants",
  ];
  const colors = [
    "Midnight Black",
    "Sage Green",
    "Slate Grey",
    "Ocean Blue",
    "Sand Beige",
    "Deep Crimson",
  ];

  const num = Math.floor(Math.random() * 4) + 1;

  return {
    id: String(id),
    title: `${colors[index % colors.length]} ${types[index % types.length]}`,
    // Using Unsplash for realistic placeholder images
    // image: `https://images.unsplash.com/photo-${1500000000000 + id}?auto=format&fit=crop&q=80&w=500`,
    image: `/gc${num}.jpg`,
    sizes: [34, 36, 38, 40, 42, 44],
    price: (Math.random() * (8000 - 200) + 200).toFixed(0), // Random price between 20 and 80
  };
});

const arr = [1, 3, 5, 7, 2, 4, 2, 2, 3, 4, 8, 9];

const arr2 = arr.filter((num) => num > 7);

