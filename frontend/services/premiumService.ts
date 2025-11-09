import { supabase } from './supabaseClient';

export interface FreeTrialState {
  isActive: boolean;
  daysRemaining: number;
  generationsRemaining: number;
  totalGenerations: number;
}

const FREE_TRIAL_DAYS = 7;
const FREE_TRIAL_GENERATIONS = 5;

class PremiumService {
  async getFreeTrialState(): Promise<FreeTrialState> {
    try {
      console.log('PremiumService: Getting free trial state...');

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('PremiumService: User not authenticated');
        return {
          isActive: false,
          daysRemaining: 0,
          generationsRemaining: 0,
          totalGenerations: FREE_TRIAL_GENERATIONS,
        };
      }

      console.log('PremiumService: Checking trial for user:', user.id);

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscription && subscription.tier !== 'free') {
        return {
          isActive: false,
          daysRemaining: 0,
          generationsRemaining: 0,
          totalGenerations: FREE_TRIAL_GENERATIONS,
        };
      }

      const accountCreated = new Date(user.created_at);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, FREE_TRIAL_DAYS - daysSinceCreation);
      const isActive = daysRemaining > 0;

      const aiGenerationsUsed = subscription?.ai_generations_used || 0;
      const generationsRemaining = Math.max(0, FREE_TRIAL_GENERATIONS - aiGenerationsUsed);

      const trialState = {
        isActive: isActive && generationsRemaining > 0,
        daysRemaining,
        generationsRemaining,
        totalGenerations: FREE_TRIAL_GENERATIONS,
      };

      console.log('PremiumService: Trial state:', trialState);
      return trialState;
    } catch (error) {
      console.error('PremiumService: Error:', error);
      return {
        isActive: false,
        daysRemaining: 0,
        generationsRemaining: 0,
        totalGenerations: FREE_TRIAL_GENERATIONS,
      };
    }
  }
}

export const premiumService = new PremiumService();
