import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    preferredCurrency: 'USD',
    avatarUrl: '',
  });
  
  const { updateProfile, profile, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already completed onboarding
  if (profile?.onboarding_completed) {
    navigate('/');
    return null;
  }

  // Redirect if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleNext = () => {
    if (step === 1 && !formData.displayName) {
      toast.error('Please enter your name');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    setIsLoading(true);

    const { error } = await updateProfile({
      display_name: formData.displayName,
      preferred_currency: formData.preferredCurrency as any,
      avatar_url: formData.avatarUrl || null,
      onboarding_completed: true,
    });

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile setup complete!');
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-background">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-[hsl(var(--success))] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-3xl p-8 shadow-lg">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome to Finance! 👋</h2>
                <p className="text-muted-foreground">Let's set up your profile to get started</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">What should we call you?</Label>
                  <Input
                    id="displayName"
                    placeholder="Your name"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Profile Picture URL (optional)</Label>
                  <Input
                    id="avatarUrl"
                    placeholder="https://..."
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can add this later in settings
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Choose Your Currency 💰</h2>
                <p className="text-muted-foreground">Select your preferred currency for displaying finances</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Currency</Label>
                  <Select value={formData.preferredCurrency} onValueChange={(value) => setFormData({ ...formData, preferredCurrency: value })}>
                    <SelectTrigger className="text-lg h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    You can change this anytime in settings. All amounts will be displayed in this currency.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">You're All Set! 🎉</h2>
                <p className="text-muted-foreground">Ready to start managing your finances</p>
              </div>

              <div className="bg-muted rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Name:</span>
                  <span className="text-muted-foreground">{formData.displayName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Currency:</span>
                  <span className="text-muted-foreground">
                    {currencies.find(c => c.code === formData.preferredCurrency)?.name}
                  </span>
                </div>
              </div>

              <div className="bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20 rounded-2xl p-6">
                <h3 className="font-semibold mb-2 text-[hsl(var(--success))]">What's next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Add your bank accounts and cards</li>
                  <li>• Track your assets and liabilities</li>
                  <li>• Set financial goals</li>
                  <li>• Use our calculators for planning</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button onClick={handleNext} className="ml-auto">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isLoading} className="ml-auto">
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
