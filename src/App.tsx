import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { SwapsPage } from './pages/SwapsPage';
import { MessagesPage } from './pages/MessagesPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { CreateListingModal } from './components/items/CreateListingModal';
import { SwapProposalModal } from './components/swaps/SwapProposalModal';
import { AiChatWidget } from './components/chat/AiChatWidget';
import { Sparkles } from 'lucide-react';
import { onUnauthorized } from './services/api';

const AppContent: React.FC = () => {
  const { activeSwapModalItem, closeSwapModal, toastMessage, isAuthenticated } = useApp();

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedItemId, setSelectedItemId] = useState<string>('item_1');
  const [selectedSwapId, setSelectedSwapId] = useState<string>('swap_01');
  const [isCreateListingOpen, setIsCreateListingOpen] = useState<boolean>(false);

  const handleNavigate = (view: string, itemId?: string) => {
    const protectedViews = ['dashboard', 'swaps', 'messages', 'admin'];
    if (protectedViews.includes(view) && !isAuthenticated) {
      if (itemId) {
        setSelectedItemId(itemId);
      }
      setCurrentView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (itemId) {
      setSelectedItemId(itemId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Automatically navigate to login page and dismiss modals when backend returns 401 Unauthorized
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsCreateListingOpen(false);
      closeSwapModal();
      handleNavigate('login');
    };

    const unsub = onUnauthorized(() => {
      handleUnauthorized();
    });

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      unsub();
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [closeSwapModal, isAuthenticated]);

  const handleSelectSwapForChat = (swapId: string) => {
    setSelectedSwapId(swapId);
  };

  const handleOpenCreateListing = () => {
    if (!isAuthenticated) {
      handleNavigate('login');
    } else {
      setIsCreateListingOpen(true);
    }
  };

  const renderView = () => {
    const protectedViews = ['dashboard', 'swaps', 'messages', 'admin'];
    if (protectedViews.includes(currentView) && !isAuthenticated) {
      return <LoginPage onNavigate={handleNavigate} />;
    }

    switch (currentView) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onOpenCreateListing={handleOpenCreateListing}
          />
        );
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'logout':
        return <LogoutPage onNavigate={handleNavigate} />;
      case 'explore':
        return <ExplorePage onNavigate={handleNavigate} />;
      case 'item_detail':
        return <ItemDetailPage itemId={selectedItemId} onNavigate={handleNavigate} />;
      case 'swaps':
        return (
          <SwapsPage
            onNavigate={handleNavigate}
            onSelectSwapForChat={handleSelectSwapForChat}
          />
        );
      case 'messages':
        return (
          <MessagesPage
            selectedSwapId={selectedSwapId}
            onNavigate={handleNavigate}
          />
        );
      case 'calculator':
        return <CalculatorPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={handleNavigate}
            onOpenCreateListing={handleOpenCreateListing}
          />
        );
      case 'admin':
        return <AdminPage />;
      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onOpenCreateListing={handleOpenCreateListing}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-900 font-sans selection:bg-forest-100 selection:text-forest-900">
      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCreateListing={() => setIsCreateListingOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onCreated={(newItemId) => {
          handleNavigate('item_detail', newItemId);
        }}
      />

      {/* Swap Proposal Modal (Triggered globally from any item card/page) */}
      {activeSwapModalItem && (
        <SwapProposalModal
          targetItem={activeSwapModalItem}
          onClose={closeSwapModal}
          onSuccess={(newSwapId) => {
            setSelectedSwapId(newSwapId);
            handleNavigate('messages');
          }}
        />
      )}

      {/* In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-22 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs max-w-sm">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="font-medium leading-tight flex-1">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Global AI Chat Assistant */}
      <AiChatWidget onNavigate={handleNavigate} />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
