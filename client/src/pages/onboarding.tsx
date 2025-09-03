import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { LocalStorage } from '@/lib/storage';
import { useUpdateUserSettings } from '@/hooks/use-streaks';

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [simpleMode, setSimpleMode] = useState(false);
  const updateSettings = useUpdateUserSettings();

  const steps = [
    {
      title: "Welcome to Tasks Ahead!",
      description: "Your friendly companion for managing tasks and building productive habits.",
      icon: CheckIcon,
    },
    {
      title: "Choose Your Experience",
      description: "Select the interface that works best for you.",
      icon: UserIcon,
    },
    {
      title: "You're All Set!",
      description: "Start by adding your first task and building your streak.",
      icon: Cog6ToothIcon,
    },
  ];

  const currentStepData = steps[currentStep - 1];

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save settings and complete onboarding
      try {
        await updateSettings.mutateAsync({ simpleMode });
        LocalStorage.setOnboardingCompleted();
        LocalStorage.saveUserSettings({ simpleMode, theme: 'light' });
        setLocation('/');
      } catch (error) {
        console.error('Failed to save settings:', error);
        // Continue anyway
        LocalStorage.setOnboardingCompleted();
        setLocation('/');
      }
    }
  };

  const handleSkip = () => {
    LocalStorage.setOnboardingCompleted();
    setLocation('/');
  };

  return (
    <div 
      className="min-h-screen bg-background flex items-center justify-center p-4"
      data-testid="page-onboarding"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <currentStepData.icon className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-step-title">
            {currentStepData.title}
          </CardTitle>
          <CardDescription data-testid="text-step-description">
            {currentStepData.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index + 1 === currentStep
                    ? 'bg-primary'
                    : index + 1 < currentStep
                    ? 'bg-primary/60'
                    : 'bg-border'
                }`}
                data-testid={`indicator-step-${index + 1}`}
              />
            ))}
          </div>

          {/* Step 2: Simple Mode Toggle */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="simple-mode" className="text-sm font-medium">
                    Simple Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Larger buttons and simplified interface
                  </p>
                </div>
                <Switch
                  id="simple-mode"
                  checked={simpleMode}
                  onCheckedChange={setSimpleMode}
                  data-testid="switch-simple-mode"
                />
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                You can change this anytime in Settings
              </div>
            </div>
          )}

          {/* Step 3: Features highlight */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm">Create and organize tasks</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm">Build daily streaks</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm">Earn achievement badges</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm">Stay organized with projects</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
                data-testid="button-previous"
              >
                Previous
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="flex-1"
              disabled={updateSettings.isPending}
              data-testid="button-next"
            >
              {updateSettings.isPending
                ? 'Setting up...'
                : currentStep === steps.length
                ? 'Get Started'
                : 'Next'}
            </Button>
          </div>

          {currentStep === 1 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full"
              data-testid="button-skip"
            >
              Skip tour
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
