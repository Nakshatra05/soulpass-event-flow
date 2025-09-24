import { Button } from '@/components/ui/button';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { Wallet, LogOut } from 'lucide-react';

export const WalletButton = () => {
  const { account, isConnecting, connectWallet, disconnectWallet } = useWeb3Auth();

  if (account) {
    return (
      <Button variant="outline" onClick={disconnectWallet} className="gap-2">
        <Wallet className="h-4 w-4" />
        {account.slice(0, 6)}...{account.slice(-4)}
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button 
      onClick={connectWallet} 
      disabled={isConnecting}
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};