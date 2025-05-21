import { getCampaigns } from '@/lib/supabase';

// This function is required for static site generation with dynamic routes
// when using "output: export" in next.config.js
export async function generateStaticParams() {
  try {
    // Get all campaigns to generate static pages for each campaign ID
    const campaigns = await getCampaigns();
    
    // Return an array of params objects with the id property
    return campaigns.map((campaign) => ({
      id: campaign.id,
    }));
  } catch (error) {
    console.error('Error generating static params for campaigns:', error);
    
    // Return a fallback set of params to prevent build failures
    // You can replace these with actual campaign IDs if known
    return [
      { id: '89baebe2-7c99-4f87-b6b1-a2f7d995ded0' }, // Example campaign ID
      { id: 'fallback-campaign-id' },                 // Fallback ID
    ];
  }
}
