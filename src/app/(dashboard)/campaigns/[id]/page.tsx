// This is a server component that will be statically generated
import { getCampaigns } from '@/lib/supabase';
import CampaignDetails from './CampaignDetails';

// Generate static params for all campaign IDs
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
    return [
      { id: '89baebe2-7c99-4f87-b6b1-a2f7d995ded0' }, // Example campaign ID
      { id: 'fallback-campaign-id' },                 // Fallback ID
    ];
  }
}

// This is the server component that renders the client component
export default function CampaignDetailsPage() {
  return <CampaignDetails />;
}
