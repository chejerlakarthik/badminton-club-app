import { useState, useEffect, JSX } from 'react';
import {Clock, CheckCircle, XCircle, AlertCircle, Clock5} from 'lucide-react';
import {User, Poll, Member, SessionExpense, InviteForm, ExpenseForm, Availability} from './types';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Expenses from './components/Expenses';
import Settings from './components/Settings';
import InviteModal from './components/InviteModal';
import ExpenseModal from './components/ExpenseModal';
import Auth from './components/Auth';

const BACKEND_HOSTNAME = 'https://mock-e16128858bd34b25bb1f4d9155c66cdd.mock.insomnia.rest';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [members] = useState<Member[]>([
    { id: 1, name: 'John Smith', email: 'john@email.com', phone: '+61400123456', role: 'member', status: 'active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+61400123457', role: 'member', status: 'active' },
    { id: 3, name: 'Mike Chen', email: 'mike@email.com', phone: '+61400123458', role: 'member', status: 'active' },
    { id: 4, name: 'Lisa Wong', email: 'lisa@email.com', phone: '+61400123459', role: 'member', status: 'active' },
  ]);
  // const [_pollHistory, _setPollHistory] = useState<Poll[]>([]);
  const [sessionExpenses, setSessionExpenses] = useState<SessionExpense[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>({ email: '', phone: '', message: '' });
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({ sessionDate: '', shuttles: '', courtCost: '', additionalCosts: '', notes: '' });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch(`${BACKEND_HOSTNAME}/auth/login`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem('authToken');
      })
      .finally(() => setIsInitializing(false));
    } else {
      setIsInitializing(false);
    }

    const samplePoll: Poll = {
      id: 1,
      sessionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      freezeTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'active',
      responses: [
        { memberId: 1, availability: 'available' as const, timestamp: new Date() },
        { memberId: 2, availability: 'unavailable' as const, timestamp: new Date() },
        { memberId: 3, availability: 'tentative' as const, timestamp: new Date() },
        { memberId: 4, availability: 'pending' as const, timestamp: new Date() },
      ]
    };
    setCurrentPoll(samplePoll);

    const sampleExpense = {
      id: 1,
      sessionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      shuttles: 6,
      courtCost: 120,
      additionalCosts: 0,
      attendees: 8,
      perHeadCost: 15,
      notes: 'Regular weekly session'
    };
    setSessionExpenses([sampleExpense]);
  }, []);

  const handleRSVP = (availability: Availability) => {
    if (!currentPoll || currentPoll.status === 'frozen' || !user) return;

    const updatedPoll = {
      ...currentPoll,
      responses: [
        ...currentPoll.responses.filter(r => r.memberId !== user.id),
        { memberId: user.id, availability, timestamp: new Date() }
      ]
    };
    setCurrentPoll(updatedPoll);
  };

  const handleInvite = () => {
    if (!inviteForm.email && !inviteForm.phone) return;
    console.log('Sending invite:', inviteForm);
    setShowInviteModal(false);
    setInviteForm({ email: '', phone: '', message: '' });
    alert('Invitation sent successfully!');
  };

  const handleExpenseSubmit = () => {
    const additionalCosts = expenseForm.additionalCosts || '0';
    const perHeadCost = (parseFloat(expenseForm.courtCost) + parseFloat(additionalCosts)) / 8;

    const newExpense = {
      id: sessionExpenses.length + 1,
      sessionDate: new Date(expenseForm.sessionDate),
      shuttles: parseInt(expenseForm.shuttles),
      courtCost: parseFloat(expenseForm.courtCost),
      additionalCosts: parseFloat(additionalCosts),
      attendees: 8,
      perHeadCost: perHeadCost,
      notes: expenseForm.notes
    };

    setSessionExpenses([newExpense, ...sessionExpenses]);
    setShowExpenseModal(false);
    setExpenseForm({ sessionDate: '', shuttles: '', courtCost: '', additionalCosts: '', notes: '' });
  };

  const getAvailabilityIcon = (availability?: Availability): JSX.Element => {
    switch (availability) {
      case 'available': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unavailable': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'tentative': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'pending': return <Clock5 className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getResponseSummary = () => {
    if (!currentPoll) return { available: 0, unavailable: 0, tentative: 0, pending: members.length };

    const summary: Record<Availability, number> = { available: 0, unavailable: 0, tentative: 0, pending: 0 };
    const respondedIds = new Set(currentPoll.responses.map(r => r.memberId));

    currentPoll.responses.forEach(response => {
      summary[response.availability]++;
    });

    summary.pending = members.length - respondedIds.size;
    return summary;
  };

  const isExpired = (date: Date) => new Date() > new Date(date);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <>
          <Header user={user} onLogout={() => setUser(null)} />
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {activeTab === 'dashboard' &&
              <Dashboard 
                currentPoll={currentPoll} 
                members={members} 
                handleRSVP={handleRSVP} 
                setShowInviteModal={setShowInviteModal} 
                setShowExpenseModal={setShowExpenseModal}
                isExpired={isExpired}
                getResponseSummary={getResponseSummary}
                getAvailabilityIcon={getAvailabilityIcon}
              />}
            {activeTab === 'members' && <Members members={members} setShowInviteModal={setShowInviteModal} />}
            {activeTab === 'expenses' && <Expenses sessionExpenses={sessionExpenses} setShowExpenseModal={setShowExpenseModal} />}
            {activeTab === 'settings' && <Settings />}
          </main>
          <InviteModal 
            showInviteModal={showInviteModal} 
            setShowInviteModal={setShowInviteModal} 
            inviteForm={inviteForm} 
            setInviteForm={setInviteForm} 
            handleInvite={handleInvite} 
          />
          <ExpenseModal 
            showExpenseModal={showExpenseModal} 
            setShowExpenseModal={setShowExpenseModal} 
            expenseForm={expenseForm} 
            setExpenseForm={setExpenseForm} 
            handleExpenseSubmit={handleExpenseSubmit} 
          />
        </>
      ) : (
        <Auth onLogin={setUser} />
      )}
    </div>
  );
};

export default App;
