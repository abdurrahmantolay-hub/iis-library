
import React, { useState, useMemo, useEffect } from 'react';
import { Book, BookStatus, User, BorrowRequest } from '../types';
import { SearchIcon, StarIcon, XIcon, FlameIcon, BookOpenIcon, CheckCircleIcon, AlertTriangleIcon, SpinnerIcon, PlusIcon } from './Icons';
import { supabase } from '../services/supabaseClient';

// --- Types & Interfaces ---

interface StudentCatalogProps {
  books: Book[];
  user: User;
  myRequests: BorrowRequest[];
  isLoading: boolean;
  onRefreshData: () => void;
}

const MOTIVATIONAL_QUOTES = [
    { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
    { text: "A book is a dream that you hold in your hand.", author: "Neil Gaiman" },
    { text: "Reading gives us someplace to go when we have to stay where we are.", author: "Mason Cooley" },
    { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
    { text: "Books are a uniquely portable magic.", author: "Stephen King" },
    { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" }
];

// --- Helper Functions ---

const getStringHash = (str: string): number => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// --- Helper Components ---

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center px-6 py-4 rounded-xl shadow-2xl transform transition-all animate-fadeIn ${
            type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'
        }`}>
            {type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-3 text-emerald-400" /> : <AlertTriangleIcon className="w-5 h-5 mr-3" />}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><XIcon className="w-4 h-4" /></button>
        </div>
    );
};

// --- Book Detail Modal ---
const BookModal: React.FC<{ book: Book | null; isOpen: boolean; onClose: () => void; onBorrow: (book: Book) => void; isProcessing: boolean }> = ({ book, isOpen, onClose, onBorrow, isProcessing }) => {
    if (!isOpen || !book) return null;
    const isAvailable = book.status === BookStatus.Available;
    
    // Generate deterministic rating based on hash of ID
    const hash = getStringHash(book.id);
    const rating = (hash % 20) / 10 + 3; // Generates number between 3.0 and 5.0

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-fadeIn">
                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors">
                    <XIcon className="w-6 h-6 text-slate-800" />
                </button>
                <div className="w-full md:w-2/5 bg-slate-100 relative h-64 md:h-auto overflow-hidden group">
                    <img src={`https://picsum.photos/seed/${book.id}/500/750`} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-6 left-6 text-white">
                        <div className="flex items-center text-yellow-400 mb-2">
                             {[...Array(5)].map((_, i) => (
                                 <StarIcon key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-current' : 'text-slate-600'}`} />
                             ))}
                             <span className="ml-2 font-bold text-white text-lg">{rating.toFixed(1)}</span>
                        </div>
                        <p className="text-sm opacity-80">Based on student reviews</p>
                    </div>
                </div>

                <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col overflow-y-auto bg-white">
                    <div className="mb-3">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary tracking-wide uppercase">{book.category}</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">{book.title}</h2>
                    <p className="text-lg text-slate-500 mb-6 font-medium">by {book.author}</p>
                    
                    <div className="prose prose-slate mb-8 text-slate-600 leading-relaxed">
                        {book.description ? (
                            <p>{book.description}</p>
                        ) : (
                            <p>Dive into the world of <strong>{book.title}</strong>. This compelling {book.category.toLowerCase()} book by {book.author} is a must-read for this semester. It explores themes relevant to today's youth and provides a captivating narrative.</p>
                        )}
                        <ul className="mt-4 space-y-2 text-sm">
                            <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-2"></span>{book.pageCount} pages of content</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-2"></span>Standard English Difficulty</li>
                        </ul>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status</span>
                            <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {book.status}
                                </span>
                            </div>
                        </div>
                        <button 
                            disabled={!isAvailable || isProcessing}
                            onClick={() => onBorrow(book)}
                            className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all transform active:scale-95 flex items-center shadow-lg ${
                                isAvailable 
                                ? 'bg-slate-900 text-white hover:bg-primary hover:shadow-primary/40' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {isProcessing ? <SpinnerIcon className="w-5 h-5" /> : (isAvailable ? 'Request to Borrow' : 'Currently Unavailable')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- My Shelf Drawer ---
const MyShelfDrawer: React.FC<{ isOpen: boolean; onClose: () => void; requests: BorrowRequest[] }> = ({ isOpen, onClose, requests }) => {
    return (
        <>
            {isOpen && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />}
            <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <BookOpenIcon className="w-6 h-6 mr-3 text-primary" /> My Shelf
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><XIcon className="w-6 h-6 text-slate-500" /></button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6 space-y-6">
                        {requests.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium">Your shelf is empty.</p>
                                <p className="text-sm text-slate-400">Time to find your next adventure!</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${
                                        req.status === 'Approved' ? 'bg-emerald-500' : req.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
                                    }`} />
                                    <div className="pl-3">
                                        <h4 className="font-bold text-slate-800">{req.bookTitle}</h4>
                                        <p className="text-xs text-slate-500 mt-1">Requested: {req.dateRequested}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {req.status}
                                            </span>
                                            {req.status === 'Approved' && <span className="text-xs text-slate-400">Due in 14 days</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <div className="bg-primary/5 rounded-lg p-4">
                            <h5 className="font-bold text-primary text-sm mb-1">Library Rules</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                You can borrow up to 3 books at a time. Please return books within 14 days to avoid penalties.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- Book Card (Classic Style) ---
const BookCard: React.FC<{ book: Book; onClick: (book: Book) => void }> = ({ book, onClick }) => {
    const isAvailable = book.status === BookStatus.Available;
    
    // Generate a consistent "random" color for the placeholder based on the book ID hash
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-rose-100', 'bg-teal-100'];
    const hash = getStringHash(book.id);
    const colorIndex = hash % colors.length;
    const bgColor = colors[colorIndex];

    return (
        <div 
            onClick={() => onClick(book)}
            className="group flex flex-col bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer overflow-hidden transform hover:-translate-y-1 h-full"
        >
            {/* Image Container */}
            <div className={`relative aspect-[2/3] w-full overflow-hidden ${bgColor}`}>
                <img 
                    src={`https://picsum.photos/seed/${book.id}/300/450`} 
                    alt={book.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                     <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md shadow-sm backdrop-blur-md ${
                        isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
                    }`}>
                        {book.status === BookStatus.OnLoan ? 'Loaned' : 'Available'}
                    </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-slate-900 font-bold px-4 py-2 rounded-full text-xs shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        View Details
                    </span>
                </div>
            </div>

            {/* Info Container */}
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {book.title}
                </h3>
                <p className="text-xs text-slate-500 mb-2 line-clamp-1">{book.author}</p>
                
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                        {book.category.substring(0, 12)}{book.category.length > 12 ? '...' : ''}
                    </span>
                    <div className="flex items-center text-[10px] text-yellow-500">
                        <StarIcon className="w-3 h-3 fill-current" />
                        <span className="ml-0.5 text-slate-600">4.5</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Catalog ---
const StudentCatalog: React.FC<StudentCatalogProps> = ({ books, user, myRequests, isLoading, onRefreshData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShelfOpen, setIsShelfOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [randomQuote, setRandomQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  useEffect(() => {
      setRandomQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  // Spotlight Book (Randomly selected from available)
  const spotlightBook = useMemo(() => {
      const available = books.filter(b => b.status === BookStatus.Available);
      return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : books[0];
  }, [books]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(books.map(b => b.category).filter(c => c)))], [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || book.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchTerm, categoryFilter]);
  
  const handleBorrowRequest = async (book: Book) => {
      setIsProcessing(true);
      try {
          // Check if already requested
          const existing = myRequests.find(r => r.bookId === book.id && r.status === 'Pending');
          if (existing) {
              setToast({ message: "You already have a pending request for this book.", type: 'error' });
              setIsModalOpen(false);
              return;
          }

          const { error } = await supabase.from('requests').insert([{
              bookId: book.id,
              bookTitle: book.title,
              studentName: user.name,
              studentId: user.id,
              dateRequested: new Date().toLocaleDateString(),
              status: 'Pending'
          }]);

          if (error) throw error;

          setToast({ message: `Request sent for "${book.title}"`, type: 'success' });
          onRefreshData(); // Refresh app state
          setIsModalOpen(false);
          setIsShelfOpen(true); // Open shelf to show new request
      } catch (e) {
          console.error(e);
          setToast({ message: "Failed to submit request. Try again.", type: 'error' });
      } finally {
          setIsProcessing(false);
      }
  };

  const handleSurpriseMe = () => {
      const available = books.filter(b => b.status === BookStatus.Available);
      if(available.length > 0) {
          const random = available[Math.floor(Math.random() * available.length)];
          setSelectedBook(random);
          setIsModalOpen(true);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <BookModal 
        book={selectedBook} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onBorrow={handleBorrowRequest}
        isProcessing={isProcessing}
      />

      <MyShelfDrawer 
        isOpen={isShelfOpen} 
        onClose={() => setIsShelfOpen(false)} 
        requests={myRequests}
      />

      {/* Spotlight Hero */}
      {!isLoading && spotlightBook && (
          <div className="relative bg-slate-900 text-white overflow-hidden shadow-2xl">
            <div className="absolute inset-0">
                <img src={`https://picsum.photos/seed/${spotlightBook.id}/1920/1080`} className="w-full h-full object-cover opacity-20 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
            </div>
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10 flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/2 space-y-5">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                        <FlameIcon className="w-3 h-3 mr-2" /> Book of the Day
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
                        <span className="block text-slate-300 text-lg font-medium mb-1">Welcome back, {user.name.split(' ')[0]}</span>
                        {spotlightBook.title}
                    </h1>
                    <p className="text-base sm:text-lg text-slate-400 max-w-lg line-clamp-2">
                        {spotlightBook.description || `Discover ${spotlightBook.title} by ${spotlightBook.author}. A top pick for students this week.`}
                    </p>
                    <div className="flex gap-4 pt-2">
                        <button onClick={() => { setSelectedBook(spotlightBook); setIsModalOpen(true); }} className="px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors shadow-lg shadow-white/10 text-sm">
                            View Book
                        </button>
                        <button onClick={() => setIsShelfOpen(true)} className="px-6 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg font-bold hover:bg-slate-700 transition-colors flex items-center text-sm">
                            My Shelf <span className="ml-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{myRequests.filter(r => r.status === 'Pending' || r.status === 'Approved').length}</span>
                        </button>
                    </div>
                </div>
                {/* 3D Book Effect for Hero Only */}
                <div className="w-full md:w-1/2 mt-8 md:mt-0 flex justify-center perspective-1000">
                    <div 
                        className="relative w-40 sm:w-56 aspect-[2/3] rounded-r-lg shadow-2xl transform rotate-y-12 rotate-z-2 hover:rotate-y-0 hover:rotate-z-0 transition-transform duration-500 cursor-pointer"
                        style={{ transformStyle: 'preserve-3d', boxShadow: '20px 20px 60px rgba(0,0,0,0.5)' }}
                        onClick={() => { setSelectedBook(spotlightBook); setIsModalOpen(true); }}
                    >
                        <img src={`https://picsum.photos/seed/${spotlightBook.id}/500/750`} className="w-full h-full object-cover rounded-r-lg" />
                         <div className="absolute left-0 top-0 bottom-0 w-3 bg-white/20 backdrop-blur-sm -translate-x-full origin-right transform skew-y-6" />
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        
        {/* Interesting Search Bar */}
        <div className="relative -mt-16 mb-8 z-30">
            <div className="bg-white rounded-2xl shadow-xl p-2 sm:p-3 flex items-center gap-2 border border-slate-100">
                <div className="flex-grow relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-lg"
                        placeholder="Search for adventures, authors, or knowledge..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleSurpriseMe}
                    className="hidden sm:flex items-center px-6 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold hover:shadow-lg hover:brightness-110 transition-all active:scale-95 whitespace-nowrap"
                >
                    <StarIcon className="w-5 h-5 mr-2 animate-spin-slow" />
                    Surprise Me!
                </button>
            </div>
        </div>

        {/* Motivational Quote Banner */}
        <div className="mb-10 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
                <h3 className="text-emerald-800 font-bold text-lg flex items-center justify-center sm:justify-start gap-2">
                     Daily Inspiration
                </h3>
                <p className="text-emerald-700/80 italic mt-1 text-base">"{randomQuote.text}"</p>
                <p className="text-emerald-600 text-xs mt-1 font-semibold">— {randomQuote.author}</p>
            </div>
            <div className="flex gap-3">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl" title="Read more!">🚀</div>
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl" title="Grow your mind">🧠</div>
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl" title="Discover magic">✨</div>
            </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
             <div className="flex gap-2">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                            categoryFilter === cat 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-baseline justify-between border-b border-slate-200 pb-2">
             <h3 className="text-2xl font-bold text-slate-800">
                {searchTerm || categoryFilter !== 'All' ? 'Search Results' : 'All Books'}
             </h3>
             <span className="text-sm text-slate-500 font-medium">{filteredBooks.length} titles available</span>
        </div>

        {/* --- BOOK GRID (Classic Library Style) --- */}
        {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                 {/* Simple Skeleton for loading */}
                 {[...Array(12)].map((_, i) => (
                     <div key={i} className="aspect-[2/3] bg-slate-200 rounded-lg animate-pulse" />
                 ))}
            </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => { setSelectedBook(book); setIsModalOpen(true); }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="inline-block p-4 rounded-full bg-slate-50 mb-4"><SearchIcon className="w-8 h-8 text-slate-300" /></div>
            <h3 className="text-lg font-bold text-slate-800">No books found</h3>
            <p className="text-slate-500">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCatalog;
