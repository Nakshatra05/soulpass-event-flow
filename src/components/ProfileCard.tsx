import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, Github, Linkedin, Twitter, Award, Calendar, CheckCircle } from 'lucide-react';

interface ProfileCardProps {
  profile: {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    reputation_score: number;
    events_attended: number;
    events_approved: number;
    linkedin_url?: string;
    twitter_url?: string;
    github_url?: string;
  };
  compact?: boolean;
}

export const ProfileCard = ({ profile, compact = false }: ProfileCardProps) => {
  const getReputationColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getReputationLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback>
            {profile.full_name?.slice(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-grow min-w-0">
          <div className="font-medium truncate">{profile.full_name}</div>
          <div className="text-xs text-muted-foreground">
            {profile.user_id.slice(0, 6)}...{profile.user_id.slice(-4)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Award className="h-3 w-3" />
            {profile.reputation_score.toFixed(2)}
          </Badge>
          <div className={`w-2 h-2 rounded-full ${getReputationColor(profile.reputation_score)}`} />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="text-2xl">
            {profile.full_name?.slice(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <CardTitle>{profile.full_name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {profile.user_id.slice(0, 6)}...{profile.user_id.slice(-4)}
        </p>
        
        {profile.bio && (
          <p className="text-sm">{profile.bio}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{profile.reputation_score.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Reputation</div>
            <Badge 
              variant="secondary" 
              className={`mt-1 ${getReputationColor(profile.reputation_score)} text-white`}
            >
              {getReputationLabel(profile.reputation_score)}
            </Badge>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-600">{profile.events_attended}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Attended
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-blue-600">{profile.events_approved}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3" />
              Approved
            </div>
          </div>
        </div>
        
        {(profile.linkedin_url || profile.twitter_url || profile.github_url) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Social Profiles</h4>
            <div className="flex gap-2">
              {profile.linkedin_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              
              {profile.twitter_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              
              {profile.github_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};