interface MockBlog {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  category: string;
}

export const mockBlogs: MockBlog[] = [
  {
    id: '1',
    title: 'Explore the World: Travel Adventures Await You!',
    excerpt:
      'Discover hidden gems and breathtaking destinations that will take you away. From exhilarating backpacking to luxury retreats, every journey has a story to tell.',
    author: 'Emily Johnson',
    date: 'Jan 16, 2023',
    image: '/images/travel.jpg',
    category: 'Travel Tips',
  },
  {
    id: '2',
    title: 'Wanderlust: Discover Hidden Gems',
    excerpt:
      'Traveling opens up a world of experiences that enrich our lives. From breathtaking landscapes to vibrant cultures, every journey has a story to tell.',
    author: 'Jane Smith',
    date: 'Jan 15, 2023',
    image: '/images/wanderlust.jpg',
    category: 'Lifestyle Hacks',
  },
  {
    id: '3',
    title: 'Delicious Recipes for Every Occasion',
    excerpt:
      "Cooking is an art, and the kitchen is your canvas. Whether you're looking for quick weeknight meals or elaborate dinner party dishes, we've got you covered.",
    author: 'Michael Chen',
    date: 'Jan 14, 2023',
    image: '/images/cooking.jpg',
    category: 'Cooking Recipes',
  },
];
