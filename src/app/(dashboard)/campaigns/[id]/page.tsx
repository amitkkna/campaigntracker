// This is a server component that will be statically generated
import { getCampaigns } from '@/lib/supabase';
import CampaignDetails from './CampaignDetails';

// Generate static params for all campaign IDs
export async function generateStaticParams() {
  // For static export, we need to provide a list of campaign IDs
  // This function is called at build time by Next.js

  // Check if we're in a build environment (like Netlify)
  // If environment variables are missing, use hardcoded IDs
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not found during static export. Using hardcoded campaign IDs.');

    // Return hardcoded campaign IDs for static export
    // These should be real IDs from your database
    return [
      { id: '89baebe2-7c99-4f87-b6b1-a2f7d995ded0' }, // Example campaign ID
      { id: 'fallback-campaign-id' },                 // Fallback ID
      { id: 'campaign-1' },
      { id: 'campaign-2' },
      { id: 'campaign-3' },
    ];
  }

  try {
    // Get all campaigns to generate static pages for each campaign ID
    const campaigns = await getCampaigns();

    if (!campaigns || campaigns.length === 0) {
      console.warn('No campaigns found during static export. Using hardcoded campaign IDs.');
      return [
        { id: '89baebe2-7c99-4f87-b6b1-a2f7d995ded0' }, // Example campaign ID
        { id: 'fallback-campaign-id' },                 // Fallback ID
      ];
    }

    console.log(`Generating static pages for ${campaigns.length} campaigns`);

    // Return an array of params objects with the id property
    return campaigns.map((campaign) => ({
      id: String(campaign.id), // Ensure ID is a string
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
