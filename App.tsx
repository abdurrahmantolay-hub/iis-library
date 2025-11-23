
import React, { useState, useEffect, useCallback } from 'react';
import { Book, NewsArticle, BorrowRequest, UserRole } from './types';
import Header from './components/Header';
import LibrarianDashboard from './components/LibrarianDashboard';
import StudentCatalog from './components/StudentCatalog';
import LoginPage from './components/LoginPage';
import SchoolNews from './components/SchoolNews';
import { useAuth } from './contexts/AuthContext';
import { supabase, isConfigured } from './services/supabaseClient';
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
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Fetch all data from Supabase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setConnectionError(null);

    // 1. Check Configuration
    if (!isConfigured) {
        console.warn('Supabase credentials missing. Switching to Demo Mode.');
        setBooks(initialBooks);
        setNews(mockNews);
        setIsDemoMode(true);
        setIsLoading(false);
        return;
    }

    try {
      // 2. Fetch Books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (booksError) {
        // Special handling for missing table error (Postgres code 42P01)
        if (booksError.code === '42P01') {
           throw new Error("Tables not found. Please run the commands in 'db_schema.sql' in the Supabase SQL Editor.");
        }
        throw booksError;
      }
      
      // If connection succeeds:
      if (booksData && booksData.length > 0) {
        setBooks(booksData as Book[]);
        setIsDemoMode(false);
      } else if (booksData && booksData.length === 0) {
        // Connected but empty DB.
        console.log("Database connected but empty.");
        setBooks([]); 
        setIsDemoMode(false);
      }

      // 3. Fetch News
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!newsError && newsData) {
          setNews(newsData as NewsArticle[]);
      } 

      // 4. Fetch Requests
      const { data: reqData, error: reqError } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!reqError && reqData) {
          setRequests(reqData as BorrowRequest[]);
      }

    } catch (error: any) {
      console.error('Supabase Data Fetch Error:', error);
      
      // Format error for display
      const errorMessage = error.message || JSON.stringify(error);
      setConnectionError(errorMessage);

      console.warn('Falling back to demo data due to error.');
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
        <div className="bg-amber-100 text-amber-900 text-xs text-center py-2 px-4 border-b border-amber-200 animate-fadeIn">
            <div className="font-bold flex items-center justify-center gap-2">
               <span>⚠️ Demo Mode Active</span>
            </div>
            <div className="mt-1 opacity-90">
                {connectionError ? (
                  <span><strong>Error:</strong> {connectionError}</span>
                ) : (
                  <span>Ensure API keys are set in <code>.env</code>. Data changes won't save.</span>
                )}
            </div>
        </div>
      )}

      {/* Helper message for empty DB */}
      {!isDemoMode && books.length === 0 && !isLoading && (
        <div className="bg-blue-50 text-blue-800 text-xs text-center py-2 px-4 border-b border-blue-100">
           Database is connected but empty. <strong>Sign in as Librarian</strong> to import books via AI or add them manually.
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
