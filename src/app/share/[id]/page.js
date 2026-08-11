import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = params;

  // The base URL of your application
  // Ideally this should be an environment variable like process.env.NEXT_PUBLIC_APP_URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jamphy.com';
  const imageUrl = `${baseUrl}/api/share/${id}/image`;

  return {
    title: 'Attempt this question on Jamphy!',
    description: 'Practice more IIT JAM Physics questions for free.',
    openGraph: {
      title: 'Attempt this question on Jamphy!',
      description: 'Practice more IIT JAM Physics questions for free.',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Jamphy Question',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Attempt this question on Jamphy!',
      description: 'Practice more IIT JAM Physics questions for free.',
      images: [imageUrl],
    },
  };
}

export default function ShareRedirectPage() {
  // Automatically redirect users who click this link directly to the questions page.
  // In the future, we can change this to redirect to a specific question ID.
  redirect('/questions');
  
  return null;
}
