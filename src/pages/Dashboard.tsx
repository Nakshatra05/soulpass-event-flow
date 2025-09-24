import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { WalletButton } from '@/components/WalletButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Award, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { account, profile } = useWeb3Auth();

  if (!account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary">Welcome to SoulPass</h1>
            <p className="text-xl text-muted-foreground">
              The decentralized event platform powered by Web3
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Connect your wallet to start discovering events, building your reputation, 
              and joining the SoulPass community.
            </p>
            <WalletButton />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Discover Events</h3>
                <p className="text-xs text-muted-foreground">Find amazing events in your area</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Build Connections</h3>
                <p className="text-xs text-muted-foreground">Network with like-minded people</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Earn Reputation</h3>
                <p className="text-xs text-muted-foreground">Build trust through attendance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Connected as {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>
        
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.reputation_score.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {profile.reputation_score >= 0.8 ? 'Excellent' : 
                   profile.reputation_score >= 0.6 ? 'Good' : 
                   profile.reputation_score >= 0.4 ? 'Fair' : 'Poor'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{profile.events_attended}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Approved</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{profile.events_approved}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to="/events">
                    <Button variant="outline" size="sm" className="w-full">
                      Browse Events
                    </Button>
                  </Link>
                  <Link to="/create-event">
                    <Button size="sm" className="w-full">
                      Create Event
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Ready to get started?</p>
          <div className="flex justify-center gap-4">
            <Link to="/events">
              <Button className="gap-2">
                <Calendar className="h-4 w-4" />
                Explore Events
              </Button>
            </Link>
            <Link to="/create-event">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Event
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;