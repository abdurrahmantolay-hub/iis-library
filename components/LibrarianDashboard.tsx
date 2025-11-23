
import React, { useState, useCallback, useMemo } from 'react';
import { Book, BookStatus, NewsArticle, BorrowRequest } from '../types';
import { parseBookListFromImage } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { 
    UploadCloudIcon, SpinnerIcon, CheckCircleIcon, AlertTriangleIcon, 
    UsersIcon, BookOpenIcon, EditIcon, TrashIcon, PlusIcon, 
    SearchIcon, FileTextIcon, XIcon 
} from './Icons';

interface LibrarianDashboardProps {
  books: Book[];
  news: NewsArticle[];
  requests: BorrowRequest[];
  onRefreshData: () => void;
}

type Tab = 'books' | 'news' | 'requests';

const LibrarianDashboard: React.FC<LibrarianDashboardProps> = ({ 
    books, news, requests, onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('books');

  // --- Book Management State ---
  const [bookSearch, setBookSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null); 
  const [bookFormData, setBookFormData] = useState<Partial<Book>>({});
  const [isSaving, setIsSaving] = useState(false);

  // --- News Management State ---
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [newsFormData, setNewsFormData] = useState<Partial<NewsArticle>>({});

  // --- Handlers: Book List AI Parsing ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setParseResult(null);
    }
  };

  const handleParseBooks = useCallback(async () => {
    if (!selectedFile) return;
    setIsParsing(true);
    setParseResult(null);
    try {
      const parsedData = await parseBookListFromImage(selectedFile);
      
      // Batch insert into Supabase
      const newBooks = parsedData.map(book => ({
          title: book.title,
          author: book.author,
          category: book.category,
          pageCount: book.pageCount,
          status: BookStatus.Available,
          description: '', // Default empty description for auto-imported books
      }));

      const { error } = await supabase.from('books').insert(newBooks);

      if (error) throw error;

      onRefreshData();
      setParseResult({ status: 'success', message: `${newBooks.length} books imported successfully!` });
      setSelectedFile(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Database error during import.";
      setParseResult({ status: 'error', message: errorMessage });
      console.error(error);
    } finally {
      setIsParsing(false);
    }
  }, [selectedFile, onRefreshData]);

  // --- Handlers: Book CRUD ---
  const handleOpenBookModal = (book?: Book) => {
      if (book) {
          setEditingBook(book);
          setBookFormData({ ...book }); // Create a copy
      } else {
          setEditingBook(null);
          setBookFormData({ 
              status: BookStatus.Available,
              category: 'General Library',
              pageCount: 0,
              description: ''
          });
      }
      setIsBookModalOpen(true);
  };

  const handleSaveBook = async () => {
      if (!bookFormData.title || !bookFormData.author) {
          alert("Title and Author are required.");
          return;
      }
      setIsSaving(true);
      try {
          const bookData = {
              title: bookFormData.title,
              author: bookFormData.author,
              category: bookFormData.category || 'General',
              pageCount: bookFormData.pageCount || 0,
              status: bookFormData.status || BookStatus.Available,
              description: bookFormData.description || ''
          };

          if (editingBook) {
              const { error } = await supabase
                .from('books')
                .update(bookData)
                .eq('id', editingBook.id);
              if (error) throw error;
          } else {
              const { error } = await supabase
                .from('books')
                .insert([bookData]);
              if (error) throw error;
          }
          await onRefreshData(); // Wait for data refresh
          setIsBookModalOpen(false);
      } catch (e) {
          console.error(e);
          // Don't alert if it's likely a demo mode issue, but log it
          alert('Note: If you are in Demo Mode, changes are not saved to a database.');
          // Even if it fails (Demo mode), close modal to simulate success
          setIsBookModalOpen(false); 
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteBook = async (id: string) => {
      if(window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
          try {
              const { error } = await supabase.from('books').delete().eq('id', id);
              if (error) throw error;
              onRefreshData();
          } catch(e) {
              console.error(e);
              // Optimistic UI update simulation for demo mode would happen here in a real Redux setup, 
              // but for now we just rely on the refresh.
              if (!process.env.SUPABASE_URL) {
                   alert("In Demo Mode: Delete simulated (data resets on reload).");
              }
          }
      }
  };

  const filteredBooks = useMemo(() => {
      return books.filter(b => 
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) || 
        b.author.toLowerCase().includes(bookSearch.toLowerCase())
      );
  }, [books, bookSearch]);


  // --- Handlers: News CRUD ---
  const handleOpenNewsModal = (article?: NewsArticle) => {
      if (article) {
          setEditingNews(article);
          setNewsFormData({ ...article });
      } else {
          setEditingNews(null);
          setNewsFormData({ 
              date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              imageUrl: ''
          });
      }
      setIsNewsModalOpen(true);
  };

  const handleSaveNews = async () => {
      if (!newsFormData.title || !newsFormData.excerpt) {
          alert("Headline and content are required.");
          return;
      }
      setIsSaving(true);

      try {
          const newsData = {
               title: newsFormData.title,
               excerpt: newsFormData.excerpt,
               imageUrl: newsFormData.imageUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071',
               date: newsFormData.date
          };

          if (editingNews) {
               const { error } = await supabase.from('news').update(newsData).eq('id', editingNews.id);
               if (error) throw error;
          } else {
               const { error } = await supabase.from('news').insert([newsData]);
               if (error) throw error;
          }
          await onRefreshData();
          setIsNewsModalOpen(false);
      } catch (e) {
          console.error(e);
          alert('Note: If you are in Demo Mode, changes are not saved to a database.');
          setIsNewsModalOpen(false);
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteNews = async (id: string) => {
      if(window.confirm('Delete this news article?')) {
           const { error } = await supabase.from('news').delete().eq('id', id);
           if (!error) onRefreshData();
           else console.error("Error deleting news", error);
      }
  };

  // --- Handlers: Requests ---
  const handleApproveRequest = async (request: BorrowRequest) => {
      try {
        // 1. Update request status
        await supabase.from('requests').update({ status: 'Approved' }).eq('id', request.id);
        // 2. Update Book Status
        await supabase.from('books').update({ status: BookStatus.OnLoan }).eq('id', request.bookId);
        onRefreshData();
      } catch (e) {
          console.error(e);
      }
  };

  const handleRejectRequest = async (id: string) => {
      const { error } = await supabase.from('requests').update({ status: 'Rejected' }).eq('id', id);
      if (!error) onRefreshData();
  };


  // --- Render Functions ---

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Librarian Dashboard</h1>
                <p className="text-slate-500">Manage inventory, content, and student services.</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                <button 
                    onClick={() => setActiveTab('books')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'books' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BookOpenIcon className="w-4 h-4 mr-2" />
                    Inventory
                </button>
                <button 
                    onClick={() => setActiveTab('news')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'news' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    News
                </button>
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'requests' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Requests
                    {requests.filter(r => r.status === 'Pending').length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {requests.filter(r => r.status === 'Pending').length}
                        </span>
                    )}
                </button>
            </div>
        </div>

        {/* --- BOOKS TAB --- */}
        {activeTab === 'books' && (
            <div className="space-y-6 animate-fadeIn">
                
                {/* AI Import Section */}
                <div className="bg-gradient-to-r from-slate-50 to-white p-6 rounded-xl border border-slate-200 border-dashed">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center">
                                <UploadCloudIcon className="w-5 h-5 mr-2 text-primary" />
                                Smart Import (Gemini AI)
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Upload a photo of a book list to automatically populate the catalog.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer bg-white border border-slate-300 hover:border-primary text-slate-600 hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
                                Choose Image
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                            {selectedFile && (
                                <button 
                                    onClick={handleParseBooks}
                                    disabled={isParsing}
                                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 flex items-center disabled:opacity-50"
                                >
                                    {isParsing ? <SpinnerIcon className="w-4 h-4 mr-2" /> : 'Process & Upload'}
                                </button>
                            )}
                        </div>
                    </div>
                    {selectedFile && <p className="text-xs text-slate-500 mt-2">Selected: {selectedFile.name}</p>}
                    {parseResult && (
                         <div className={`mt-3 text-sm flex items-center ${parseResult.status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                             {parseResult.status === 'success' ? <CheckCircleIcon className="w-4 h-4 mr-2" /> : <AlertTriangleIcon className="w-4 h-4 mr-2" />}
                             {parseResult.message}
                         </div>
                    )}
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800">Book Catalog</h2>
                        <div className="flex w-full sm:w-auto gap-3">
                             <div className="relative flex-grow sm:flex-grow-0">
                                <input 
                                    type="text" 
                                    placeholder="Search books..." 
                                    value={bookSearch}
                                    onChange={(e) => setBookSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-full"
                                />
                                <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                            <button 
                                onClick={() => handleOpenBookModal()}
                                className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 flex items-center shadow-sm whitespace-nowrap"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Book
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Author</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBooks.slice(0, 50).map((book) => (
                                    <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{book.title}</td>
                                        <td className="px-6 py-4">{book.author}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{book.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                book.status === BookStatus.Available 
                                                ? 'bg-emerald-100 text-emerald-700' 
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {book.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenBookModal(book)}
                                                    className="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-primary transition-colors"
                                                >
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteBook(book.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600 transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredBooks.length === 0 && (
                            <div className="p-8 text-center text-slate-400">
                                No books found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- NEWS TAB --- */}
        {activeTab === 'news' && (
            <div className="space-y-6 animate-fadeIn">
                 <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">School News Management</h2>
                        <button 
                            onClick={() => handleOpenNewsModal()}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 flex items-center shadow-sm"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Post News
                        </button>
                    </div>
                    
                    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                        {news.map(article => (
                            <div key={article.id} className="border border-slate-200 rounded-lg p-4 flex flex-col group hover:shadow-md transition-all bg-white">
                                <div className="h-32 bg-slate-100 rounded-md mb-4 overflow-hidden relative">
                                    <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenNewsModal(article)} className="p-1 bg-white rounded shadow text-slate-700 hover:text-primary"><EditIcon className="w-4 h-4"/></button>
                                        <button onClick={() => handleDeleteNews(article.id)} className="p-1 bg-white rounded shadow text-slate-700 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400 mb-1">{article.date}</span>
                                <h3 className="font-bold text-slate-800 mb-2 leading-tight">{article.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-grow">{article.excerpt}</p>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        )}

         {/* --- REQUESTS TAB --- */}
         {activeTab === 'requests' && (
            <div className="space-y-6 animate-fadeIn">
                 <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800">Loan Requests</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Book Requested</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                            No active borrow requests at the moment.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{request.studentName}</div>
                                                <div className="text-xs text-slate-400">{request.studentId}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-primary">{request.bookTitle}</td>
                                            <td className="px-6 py-4">{request.dateRequested}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    request.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                    request.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {request.status === 'Pending' && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleApproveRequest(request)}
                                                            className="flex items-center px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-xs transition-colors"
                                                            title="Admit Request"
                                                        >
                                                            <CheckCircleIcon className="w-3 h-3 mr-1" /> Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectRequest(request.id)}
                                                            className="flex items-center px-3 py-1 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 text-xs transition-colors"
                                                            title="Reject Request"
                                                        >
                                                            <XIcon className="w-3 h-3 mr-1" /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>
        )}


        {/* --- BOOK MODAL --- */}
        {isBookModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
                        <button onClick={() => setIsBookModalOpen(false)}><XIcon className="w-5 h-5 text-slate-500 hover:text-red-500" /></button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                <input 
                                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none transition-shadow" 
                                    value={bookFormData.title || ''}
                                    onChange={e => setBookFormData({...bookFormData, title: e.target.value})}
                                    placeholder="e.g. Harry Potter"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Author</label>
                                <input 
                                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none transition-shadow" 
                                    value={bookFormData.author || ''}
                                    onChange={e => setBookFormData({...bookFormData, author: e.target.value})}
                                    placeholder="e.g. J.K. Rowling"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                                <input 
                                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none transition-shadow" 
                                    value={bookFormData.category || ''}
                                    onChange={e => setBookFormData({...bookFormData, category: e.target.value})}
                                    placeholder="e.g. Fantasy"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Page Count</label>
                                <input 
                                    type="number"
                                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none transition-shadow" 
                                    value={bookFormData.pageCount || ''}
                                    onChange={e => setBookFormData({...bookFormData, pageCount: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Book Description / Summary</label>
                            <textarea 
                                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none transition-shadow h-24 resize-none" 
                                value={bookFormData.description || ''}
                                onChange={e => setBookFormData({...bookFormData, description: e.target.value})}
                                placeholder="Enter a brief summary of the book content to display to students..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                            <select 
                                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                value={bookFormData.status}
                                onChange={e => setBookFormData({...bookFormData, status: e.target.value as BookStatus})}
                            >
                                {Object.values(BookStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                        <button onClick={() => setIsBookModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleSaveBook} disabled={isSaving} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:brightness-110 shadow-sm disabled:opacity-50 transition-all transform active:scale-95 flex items-center">
                            {isSaving && <SpinnerIcon className="w-4 h-4 mr-2" />}
                            {isSaving ? 'Saving...' : 'Save Book'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- NEWS MODAL --- */}
        {isNewsModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">{editingNews ? 'Edit Article' : 'Post News'}</h3>
                        <button onClick={() => setIsNewsModalOpen(false)}><XIcon className="w-5 h-5 text-slate-500 hover:text-red-500" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Headline</label>
                            <input 
                                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none" 
                                value={newsFormData.title || ''}
                                onChange={e => setNewsFormData({...newsFormData, title: e.target.value})}
                                placeholder="Article Headline"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                            <input 
                                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none text-sm" 
                                placeholder="https://..."
                                value={newsFormData.imageUrl || ''}
                                onChange={e => setNewsFormData({...newsFormData, imageUrl: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content / Excerpt</label>
                            <textarea 
                                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none h-32 resize-none" 
                                value={newsFormData.excerpt || ''}
                                onChange={e => setNewsFormData({...newsFormData, excerpt: e.target.value})}
                                placeholder="Write the main content here..."
                            />
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                        <button onClick={() => setIsNewsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleSaveNews} disabled={isSaving} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:brightness-110 shadow-sm disabled:opacity-50 transition-all transform active:scale-95 flex items-center">
                             {isSaving && <SpinnerIcon className="w-4 h-4 mr-2" />}
                            {isSaving ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default LibrarianDashboard;
