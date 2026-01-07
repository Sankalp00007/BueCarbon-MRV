
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Submission, User, SubmissionStatus, CreditRecord } from './types';
import LandingPage from './pages/LandingPage';
import FishermanDashboard from './pages/FishermanDashboard';
import NGODashboard from './pages/NGODashboard';
import AdminDashboard from './pages/AdminDashboard';
import CorporateDashboard from './pages/CorporateDashboard';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import { supabase } from './services/supabaseClient';
import { MOCK_USERS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [credits, setCredits] = useState<CreditRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardKey, setDashboardKey] = useState(0);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Setup initial mock users immediately so the app is usable without DB
        const initialUsers: User[] = MOCK_USERS.map(u => ({
          ...u,
          status: u.role === UserRole.FISHERMAN ? 'PENDING_KYC' : 'ACTIVE',
          trustScore: u.role === UserRole.FISHERMAN ? 45 : 100,
          earnings: 0,
          creditsPurchased: 0
        })) as User[];
        setAllUsers(initialUsers);

        // Check if Supabase is connected
        const isSupabaseConfigured = supabase && !supabase.supabaseUrl.includes('placeholder');

        if (isSupabaseConfigured) {
          const { data: subData, error: subError } = await supabase
            .from('submissions')
            .select('*')
            .order('timestamp', { ascending: false });
          
          const { data: creditData, error: creditError } = await supabase
            .from('credits')
            .select('*');

          if (subData) setSubmissions(subData as Submission[]);
          if (creditData) setCredits(creditData as CreditRecord[]);
          
          if (subError || creditError) {
            console.warn("Supabase fetch warning:", subError || creditError);
          }
        } else {
          console.info("Supabase connection not fully configured. Operating in local mode.");
        }
      } catch (err) {
        console.error("Critical sync error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogin = (loggedUser: User) => {
    const enhancedUser = allUsers.find(u => u.id === loggedUser.id) || loggedUser;
    setUser(enhancedUser);
    setShowAuth(false);
    setDashboardKey(prev => prev + 1);
  };

  const handleLogout = () => {
    setUser(null);
    setDashboardKey(0);
  };

  const handleGoHome = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDashboardKey(prev => prev + 1);
  }, []);

  const addSubmission = async (sub: Submission) => {
    setSubmissions(prev => [sub, ...prev]);
    const isSupabaseConfigured = supabase && !supabase.supabaseUrl.includes('placeholder');
    if (isSupabaseConfigured) {
      try {
        await supabase.from('submissions').insert([sub]);
      } catch (e) {
        console.error("Failed to sync new submission:", e);
      }
    }
  };

  const updateSubmission = async (id: string, updates: Partial<Submission>) => {
    // 1. Find the target submission first from the current local state to avoid race conditions
    const currentSub = submissions.find(s => s.id === id);
    if (!currentSub) {
      console.warn("Could not find submission to update:", id);
      return;
    }

    const updatedSub = { ...currentSub, ...updates };

    // 2. Update local submissions state immediately for UI responsiveness
    setSubmissions(prev => prev.map(s => s.id === id ? updatedSub : s));

    // 3. If the status is changing to APPROVED, create and persist a credit record
    if (updates.status === SubmissionStatus.APPROVED) {
      const newCredit: CreditRecord = {
        id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        submissionId: id,
        amount: updatedSub.creditsGenerated || 1.0,
        vintage: updatedSub.timestamp ? new Date(updatedSub.timestamp).getFullYear().toString() : new Date().getFullYear().toString(),
        status: 'AVAILABLE'
      };
      
      // Update local credits state - THIS ENSURES IT SHOWS ON CORPORATE DASHBOARD INSTANTLY
      setCredits(prev => [...prev, newCredit]);

      // Sync Credit to Supabase
      const isSupabaseConfigured = supabase && !supabase.supabaseUrl.includes('placeholder');
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('credits').insert([newCredit]);
          if (error) throw error;
          console.info("Credit successfully minted to the registry.");
        } catch (err) {
          console.error("Failed to sync new credit to database:", err);
        }
      }
    }
    
    // 4. Sync Submission status update to Supabase
    const isSupabaseConfigured = supabase && !supabase.supabaseUrl.includes('placeholder');
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('submissions').update(updates).eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Database submission update failed:", err);
      }
    }
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (user && user.id === userId) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const purchaseCredit = async (creditId: string) => {
    if (!user || user.role !== UserRole.CORPORATE) return;
    const updates = { status: 'SOLD' as const, ownerId: user.id, purchaseDate: new Date().toISOString() };
    
    // Update local state
    setCredits(prev => prev.map(c => c.id === creditId ? { ...c, ...updates } : c));
    
    // Update user stats locally
    const purchasedAmount = credits.find(c => c.id === creditId)?.amount || 0;
    handleUpdateUser(user.id, { 
      creditsPurchased: (user.creditsPurchased || 0) + purchasedAmount 
    });

    const isSupabaseConfigured = supabase && !supabase.supabaseUrl.includes('placeholder');
    if (isSupabaseConfigured) {
      try {
        await supabase.from('credits').update(updates).eq('id', creditId);
      } catch (e) {
        console.error("Failed to record purchase:", e);
      }
    }
  };

  const renderDashboard = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Initializing Protocol...</p>
      </div>
    );

    if (!user) return <LandingPage onStart={() => setShowAuth(true)} />;

    switch (user.role) {
      case UserRole.FISHERMAN:
        return <FishermanDashboard key={dashboardKey} user={user} submissions={submissions.filter(s => s.userId === user.id)} onAddSubmission={addSubmission} />;
      case UserRole.NGO:
        return <NGODashboard key={dashboardKey} user={user} submissions={submissions} onUpdateStatus={updateSubmission} />;
      case UserRole.ADMIN:
        return (
          <AdminDashboard 
            key={dashboardKey}
            submissions={submissions} 
            credits={credits} 
            users={allUsers}
            onUpdateStatus={updateSubmission} 
            onUpdateUser={handleUpdateUser}
          />
        );
      case UserRole.CORPORATE:
        return <CorporateDashboard key={dashboardKey} user={user} credits={credits} onPurchase={purchaseCredit} />;
      default:
        return <LandingPage onStart={() => setShowAuth(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onLogout={handleLogout} onLoginClick={() => setShowAuth(true)} onGoHome={handleGoHome} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderDashboard()}</main>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
    </div>
  );
};

export default App;
