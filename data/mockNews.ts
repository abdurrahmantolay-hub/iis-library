
export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
}

export const mockNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Annual Science Fair Showcases Incredible Student Talent',
    excerpt: 'This year\'s science fair was a massive success, with projects ranging from renewable energy solutions to AI-powered robotics. See the winners!',
    imageUrl: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?q=80&w=2070',
    date: 'October 26, 2024',
  },
  {
    id: 'news-2',
    title: 'Our Basketball Team "The Bosphorus Bulls" Wins City Championship!',
    excerpt: 'A thrilling final match ended with a last-minute victory for our team. Congratulations to all the players and coaches for their hard work and dedication.',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2070',
    date: 'October 24, 2024',
  },
  {
    id: 'news-3',
    title: 'School Theater Presents: "A Midsummer Night\'s Dream"',
    excerpt: 'Tickets are now on sale for the drama club\'s fall production. Don\'t miss this magical performance filled with laughter, love, and enchanting sets.',
    imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=2070',
    date: 'October 22, 2024',
  },
  {
    id: 'news-4',
    title: 'International Day Celebration: A Festival of Cultures',
    excerpt: 'Join us for a vibrant celebration of our diverse community with food, music, and performances from around the world. A day of unity and learning.',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6538cb3f344d?q=80&w=2070',
    date: 'October 20, 2024',
  },
   {
    id: 'news-5',
    title: 'Parent-Teacher Conferences Scheduled for Next Month',
    excerpt: 'Please sign up for a slot to discuss your child\'s progress this semester. We look forward to collaborating with you for their success.',
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070',
    date: 'October 18, 2024',
  },
   {
    id: 'news-6',
    title: 'Library Receives New Shipment of Bestselling Books',
    excerpt: 'Thanks to our successful book drive, the library is now stocked with hundreds of new titles. Come check them out!',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1887',
    date: 'October 15, 2024',
  },
];
