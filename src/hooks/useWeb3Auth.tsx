import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrowserProvider, Signer } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3AuthContextType {
  account: string | null;
  signer: Signer | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  user: any;
  profile: any;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
};

interface Web3AuthProviderProps {
  children: ReactNode;
}

export const Web3AuthProvider = ({ children }: Web3AuthProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (account) {
      authenticateWithSupabase();
    }
  }, [account]);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          setAccount(accounts[0].address);
          setSigner(signer);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const authenticateWithSupabase = async () => {
    if (!account) return;

    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', account)
        .single();

      if (existingUser) {
        setUser({ id: account });
        setProfile(existingUser);
      } else {
        // Create new user profile
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: account,
              full_name: `User ${account.slice(0, 6)}...${account.slice(-4)}`,
              reputation_score: 0,
              events_attended: 0,
              events_approved: 0,
            }
          ])
          .select()
          .single();

        if (error) throw error;

        setUser({ id: account });
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication Error',
        description: 'Failed to authenticate with database',
        variant: 'destructive',
      });
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: 'Metamask Required',
        description: 'Please install Metamask to continue',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Sign message to prove ownership
      const message = `Sign this message to authenticate with SoulPass: ${Date.now()}`;
      await signer.signMessage(message);
      
      setAccount(address);
      setSigner(signer);
      
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setUser(null);
    setProfile(null);
    toast({
      title: 'Wallet Disconnected',
      description: 'Successfully disconnected wallet',
    });
  };

  return (
    <Web3AuthContext.Provider
      value={{
        account,
        signer,
        isConnecting,
        connectWallet,
        disconnectWallet,
        user,
        profile,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};