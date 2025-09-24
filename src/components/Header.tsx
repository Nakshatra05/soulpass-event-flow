import { Link } from 'react-router-dom';
import { WalletButton } from './WalletButton';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { Button } from '@/components/ui/button';
import { Calendar, User, Plus } from 'lucide-react';

export const Header = () => {
  const { account } = useWeb3Auth();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          SoulPass
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link to="/events">
            <Button variant="ghost" className="gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </Button>
          </Link>
          
          {account && (
            <>
              <Link to="/profile">
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Link to="/create-event">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </>
          )}
          
          <WalletButton />
        </nav>
      </div>
    </header>
  );
};