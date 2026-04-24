import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatCoach from './components/ChatCoach';
import ItineraryDisplay from './components/ItineraryDisplay';
import SettingsModal from './components/SettingsModal';
import ErrorBoundary from './components/ErrorBoundary';
import LoginView from './components/views/LoginView';
import HomeView from './components/views/HomeView';
import ExploreView from './components/views/ExploreView';
import ProfileView from './components/views/ProfileView';
import PlannerView from './components/views/PlannerView';
import DivineView from './components/views/DivineView';
import DestinationDetailView from './components/views/DestinationDetailView';
import { TravelPlan, TravelMood, TravelerType } from './types';
import { generateTravelPlan, generateDestinationImage } from './services/geminiService';
import { auth, db, signInWithGoogle, logout, OperationType, handleFirestoreError, getRedirectResult } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Compass, MessageSquare, User as UserIcon, Wand2 } from 'lucide-react';

type activeView = 'HOME' | 'PLAN' | 'EXPLORE' | 'CHAT' | 'PROFILE' | 'ITINERARY' | 'DIVINE' | 'DESTINATION_DETAIL';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<activeView>('HOME');
  const [selectedDestinationName, setSelectedDestinationName] = useState<string | null>(null);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState<number | ''>(3);
  const [budget, setBudget] = useState<number | ''>('');
  const [currencyInfo, setCurrencyInfo] = useState('');
  const [mood, setMood] = useState<TravelMood>(TravelMood.ADVENTUROUS);
  const [travelerType, setTravelerType] = useState<TravelerType>(TravelerType.COUPLE);
  const [travelerCount, setTravelerCount] = useState<number | ''>(2);
  const [activitiesPerDay, setActivitiesPerDay] = useState<number | ''>(3);
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [heroImage, setHeroImage] = useState('');
  const [isViewingSavedPlan, setIsViewingSavedPlan] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Consulting local experts...');
  const [showSettings, setShowSettings] = useState(false);
  const [savedPlans, setSavedPlans] = useState<TravelPlan[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<{ photoURL?: string } | null>(null);

  const hasApiKey = () => {
    const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (envKey && envKey !== 'undefined') return true;
    if (typeof window !== 'undefined' && localStorage.getItem('GEMINI_API_KEY')) return true;
    return false;
  };

  const loadingMessages = [
    'Initializing AI Architect...',
    'Curating local experiences...',
    'Optimizing travel routes...',
    'Drafting final itinerary...',
    'Polishing your journey...',
  ];

  useEffect(() => {
    let unsubscribePlans: (() => void) | null = null;
    let unsubscribeUser: (() => void) | null = null;

    const checkRedirect = async () => {
      try {
        await getRedirectResult(auth);
      } catch (err: any) {
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
          console.error("Redirect login error:", err);
          setError('Login failed. Please try again.');
        }
      } finally {
        setIsAuthReady(true);
        setIsLoggingIn(false);
      }
    };
    
    // Non-blocking redirect check to speed up perceived boot
    setTimeout(checkRedirect, 0);

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      // If we got a user, we can immediately say auth is ready
      if (currentUser) setIsAuthReady(true);
      
      // Cleanup previous plans and userProfile subscription if it exists
      if (unsubscribePlans) {
        unsubscribePlans();
        unsubscribePlans = null;
      }
      
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }
      
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);

        // Listen for user document changes
        unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          }
        });

        // Initialize/Sync user document
        getDoc(userRef).then((docSnap) => {
          let userData: any = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            updatedAt: serverTimestamp()
          };

          if (!docSnap.exists()) {
            userData.createdAt = serverTimestamp();
          }
          
          setDoc(userRef, userData, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`));
        }).catch(err => handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`));

        const plansQuery = query(
          collection(db, 'users', currentUser.uid, 'plans'),
          orderBy('createdAt', 'desc')
        );

        unsubscribePlans = onSnapshot(plansQuery, (snapshot) => {
          const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as TravelPlan));
          setSavedPlans(plans);
        }, (err) => {
          // Only report error if we still have a user (prevents reporting errors during logout)
          if (auth.currentUser) {
            handleFirestoreError(err, OperationType.LIST, `users/${currentUser.uid}/plans`);
          }
        });
      } else {
        setSavedPlans([]);
        setCurrentView('HOME');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePlans) unsubscribePlans();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || duration === '' || budget === '' || travelerCount === '' || !currencyInfo) {
      setError('Please fill in all required fields');
      return;
    }

    if (!hasApiKey()) {
      setError('API Key is missing. Check settings.');
      setShowSettings(true);
      return;
    }

    setIsGenerating(true);
    setError('');
    setSaveCount(0);
    setIsViewingSavedPlan(false);
    setHeroImage(`https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80`);
    
    try {
      const planPromise = generateTravelPlan(
        destination, 
        duration as number, 
        mood, 
        travelerType, 
        travelerCount as number, 
        activitiesPerDay as number, 
        notes, 
        budget as number, 
        currencyInfo
      );
      const imagePromise = generateDestinationImage(destination, mood);

      const newPlan = await planPromise;

      if (newPlan.isBudgetValid === false) {
        setError(`Budget too low. Need at least ${newPlan.minimumBudget} ${newPlan.currencyCode}.`);
        setIsGenerating(false);
        return;
      }

      setPlan(newPlan);
      // Stay in PLAN view for vertical row experience
      setCurrentView('PLAN');
      
      imagePromise.then(imageUrl => {
        setHeroImage(imageUrl);
      }).catch(() => {
        setHeroImage(`https://picsum.photos/seed/${destination}/1200/600`);
      });

    } catch (err: any) {
      setError('Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      if (!user) {
        // User probably closed the popup, handle silently
        setIsLoggingIn(false);
        return;
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain not authorized. Add "${window.location.hostname}" to authorized domains in Firebase Console.`);
      } else if (err.code === 'auth/popup-blocked') {
        setError('Login window was blocked. Enable popups or use "Open in new tab".');
      } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // Just in case it still throws instead of returning null
        setError('');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleNewTrip = () => {
    setDestination('');
    setDuration(3);
    setBudget('');
    setMood(TravelMood.ADVENTUROUS);
    setTravelerType(TravelerType.COUPLE);
    setTravelerCount(2);
    setActivitiesPerDay(3);
    setNotes('');
    setPlan(null);
    setSaveCount(0);
    setIsViewingSavedPlan(false);
    setCurrentView('PLAN');
  };

  const handleDeletePlan = async (id: string) => {
    if (!user) return;
    try {
      const planRef = doc(db, 'users', user.uid, 'plans', id);
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(planRef);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/plans/${id}`);
    }
  };

  const renderView = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="relative">
            <div className="w-32 h-32 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin shadow-inner"></div>
          </div>
          <div className="text-center space-y-4 px-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">CRAFTING ADVENTURE</h3>
            <p className="text-blue-600 font-bold italic tracking-wide">{loadingMessage}</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'HOME': return (
        <HomeView 
          onViewDetails={(dest) => { 
            setSelectedDestinationName(dest); 
            setCurrentView('DESTINATION_DETAIL'); 
          }} 
          onSetMood={(m) => {
            if (m === TravelMood.CULTURAL) {
              setCurrentView('DIVINE');
            } else {
              setMood(m);
              setCurrentView('PLAN');
            }
          }} 
          onExplore={() => setCurrentView('EXPLORE')} 
        />
      );
      case 'EXPLORE': return (
        <ExploreView 
          onViewDetails={(dest) => { 
            setSelectedDestinationName(dest); 
            setCurrentView('DESTINATION_DETAIL'); 
          }} 
        />
      );
      case 'DESTINATION_DETAIL': return selectedDestinationName ? (
        <DestinationDetailView 
          destinationName={selectedDestinationName}
          onBack={() => setCurrentView('EXPLORE')}
          onPlanTrip={() => {
            setDestination(selectedDestinationName);
            setCurrentView('PLAN');
          }}
        />
      ) : null;
      case 'PLAN': return (
        <PlannerView 
          {...{ 
            destination, setDestination, duration, setDuration, budget, setBudget, 
            currencyInfo, setCurrencyInfo, mood, setMood, travelerType, setTravelerType, 
            travelerCount, setTravelerCount, activitiesPerDay, setActivitiesPerDay,
            notes, setNotes, isGenerating, error, plan, heroImage 
          }} 
          onGenerate={handleGenerate}
          onNewTrip={handleNewTrip}
          isViewingSavedPlan={isViewingSavedPlan}
          saveCount={saveCount}
          onSavePlan={() => {
            if (!user) {
              alert('Please login to save trips');
              return;
            }
            if (saveCount >= 2) {
              alert('You can only save this trip up to 2 times.');
              return;
            }
            const planRef = collection(db, 'users', user!.uid, 'plans');
            setDoc(doc(planRef), {
              ...plan,
              uid: user!.uid,
              heroImage,
              createdAt: serverTimestamp()
            }).then(() => {
              setSaveCount(prev => prev + 1);
              alert('Trip saved!');
            }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'plans'));
          }}
        />
      );
      case 'DIVINE': return (
        <DivineView 
          onStartJourney={() => {
            setMood(TravelMood.CULTURAL);
            setCurrentView('PLAN');
          }} 
        />
      );
      case 'CHAT': return (
        <div className="max-w-6xl mx-auto px-0 sm:px-4 h-[calc(100vh-11rem)] md:h-[calc(100vh-5rem)] flex flex-col items-stretch">
          <div className="flex-1 min-h-0 sm:py-6">
            <ChatCoach fullPage destination={plan?.destination || destination} />
          </div>
        </div>
      );
      case 'PROFILE': return (
        <ProfileView 
          user={user} 
          userProfile={userProfile}
          onLogout={logout} 
          savedPlans={savedPlans} 
          onOpenSettings={() => setShowSettings(true)} 
          onUpdateAvatar={(url) => {
            if (user) {
              const userRef = doc(db, 'users', user.uid);
              setDoc(userRef, { 
                photoURL: url,
                updatedAt: serverTimestamp()
              }, { merge: true })
                .catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
            }
          }}
          onViewPlan={(p) => { 
            setPlan(p); 
            setHeroImage(p.heroImage || ''); 
            setIsViewingSavedPlan(true);
            setSaveCount(2); // Since it's already saved, we don't want to show save button
            setCurrentView('PLAN'); 
          }}
          onDeletePlan={handleDeletePlan}
        />
      );
      case 'ITINERARY': return plan ? (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
          <div className="mb-6 flex justify-between items-center">
             <button 
              onClick={() => setCurrentView('PLAN')}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 rotate-180" /> Back to Planner
            </button>
            {!isViewingSavedPlan && saveCount < 2 && (
              <button 
                onClick={() => {
                  if (saveCount >= 2) return;
                  const planRef = collection(db, 'users', user!.uid, 'plans');
                  setDoc(doc(planRef), {
                    ...plan,
                    uid: user!.uid,
                    heroImage,
                    createdAt: serverTimestamp()
                  }).then(() => {
                    setSaveCount(prev => prev + 1);
                    alert('Trip saved!');
                  }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'plans'));
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2"
              >
                Save Trip
              </button>
            )}
          </div>
          <ItineraryDisplay plan={plan} heroImage={heroImage} />
        </div>
      ) : (
        <HomeView 
          onViewDetails={(dest) => { 
            setSelectedDestinationName(dest); 
            setCurrentView('DESTINATION_DETAIL'); 
          }} 
          onSetMood={(m) => {
            if (m === TravelMood.CULTURAL) {
              setCurrentView('DIVINE');
            } else {
              setMood(m);
              setCurrentView('PLAN');
            }
          }} 
          onExplore={() => setCurrentView('EXPLORE')} 
        />
      );
      default: return (
        <HomeView 
          onViewDetails={(dest) => { 
            setSelectedDestinationName(dest); 
            setCurrentView('DESTINATION_DETAIL'); 
          }} 
          onSetMood={(m) => {
            if (m === TravelMood.CULTURAL) {
              setCurrentView('DIVINE');
            } else {
              setMood(m);
              setCurrentView('PLAN');
            }
          }} 
          onExplore={() => setCurrentView('EXPLORE')} 
        />
      );
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView onGoogleLogin={handleGoogleLogin} isLoggingIn={isLoggingIn} error={error} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700">
        <Header 
          user={user} 
          userProfile={userProfile}
          onLogout={logout} 
          onOpenProfile={() => setCurrentView('PROFILE')}
          onOpenSettings={() => setShowSettings(true)}
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
        />
        
        <main className="flex-grow pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (isGenerating ? '_gen' : '')}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center py-4 px-2 z-[60] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-[32px]">
          {[
            { id: 'HOME', icon: Home, label: 'Home' },
            { id: 'EXPLORE', icon: Compass, label: 'Explore' },
            { id: 'PLAN', icon: Wand2, label: 'Build' },
            { id: 'CHAT', icon: MessageSquare, label: 'Coach' },
            { id: 'PROFILE', icon: UserIcon, label: 'Profile' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as activeView)}
              className={`flex flex-col items-center gap-1 transition-all ${currentView === item.id ? 'text-blue-600 scale-110' : 'text-slate-400'}`}
            >
              <item.icon className={`w-6 h-6 ${currentView === item.id ? 'fill-blue-600/10' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{item.label}</span>
            </button>
          ))}
        </nav>

        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </div>
    </ErrorBoundary>
  );
};

export default App;
