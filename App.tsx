
import React, { useState, useEffect, useCallback } from 'react';
import { Book, NewsArticle, BorrowRequest, UserRole } from './types';
import Header from './components/Header';
import LibrarianDashboard from './components/LibrarianDashboard';
import StudentCatalog from './components/StudentCatalog';
import LoginPage from './components/LoginPage';
import SchoolNews from './components/SchoolNews';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './services/supabaseClient';
import { initialBooks } from './data/mockBooks'; // Fallback if DB is empty/not connected
import { mockNews } from './data/mockNews'; // Fallback

type View = 'library' | 'news';

function App() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [currentView, setCurrentView] = useState<View>('library');
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Fetch all data from Supabase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (booksError) throw booksError;
      
      // Fallback to mock data if DB is empty (first time run)
      if (!booksData || booksData.length === 0) {
        setBooks(initialBooks); 
      } else {
        setBooks(booksData as Book[]);
        setIsDemoMode(false);
      }

      // 2. Fetch News
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });
        
      if (!newsError && newsData && newsData.length > 0) {
          setNews(newsData as NewsArticle[]);
      } else {
          setNews(mockNews);
      }

      // 3. Fetch Requests
      const { data: reqData, error: reqError } = await supabase
        .from('requests')
        .select('*')
        .order('dateRequested', { ascending: false });

      if (!reqError && reqData) {
          setRequests(reqData as BorrowRequest[]);
      }

    } catch (error) {
      console.warn('Database connection failed or not configured. Switching to Demo Mode with mock data.');
      // Fallback for demo purposes if Supabase keys aren't set yet
      setBooks(initialBooks);
      setNews(mockNews);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user) {
    return <LoginPage />;
  }

  // Filter requests specific to the student for their dashboard
  const studentRequests = requests.filter(r => r.studentId === user.id);

  return (
    <div className="min-h-screen relative bg-slate-50">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      {isDemoMode && (
        <div className="bg-amber-100 text-amber-800 text-xs text-center py-1 px-4 border-b border-amber-200">
            <strong>Demo Mode:</strong> Database not connected. Changes will not be saved. To fix, configure SUPABASE_URL and SUPABASE_KEY.
        </div>
      )}

      <main>
        {currentView === 'library' && (
          user.role === UserRole.Librarian ? (
            <LibrarianDashboard 
                books={books} 
                news={news}
                requests={requests}
                onRefreshData={fetchData}
            />
          ) : (
            <StudentCatalog 
                books={books} 
                user={user}
                myRequests={studentRequests}
                isLoading={isLoading}
                onRefreshData={fetchData}
            />
          )
        )}
        {currentView === 'news' && <SchoolNews news={news} />}
      </main>
    </div>
  );
}

export default App;
