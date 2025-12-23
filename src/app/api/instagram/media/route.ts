import { NextResponse } from 'next/server';

const GRAPH_BASE = 'https://graph.instagram.com';
const MEDIA_FIELDS = [
  'id',
  'caption',
  'media_url',
  'thumbnail_url',
  'permalink',
  'timestamp',
  'media_type',
].join(',');

type GraphResponse = {
  data?: unknown;
  error?: { message?: string };
};

async function fetchGraph(endpoint: string, fields: string, accessToken: string) {
  const requestUrl = `${GRAPH_BASE}/${endpoint}?fields=${fields}&access_token=${accessToken}`;
  const response = await fetch(requestUrl, { next: { revalidate: 60 } });
  const payload = await response.json().catch(() => ({} as GraphResponse));
  return { response, payload };
}

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Instagram access token is not configured.' },
      { status: 400 }
    );
  }

  try {
    // Try to fetch profile fields including profile_picture_url when available
    const user = await fetchGraph('me', 'id,username,profile_picture_url', accessToken);
    if (!user.response.ok) {
      return NextResponse.json(
        { error: 'Unable to resolve Instagram user ID.', details: user.payload },
        { status: 502 }
      );
    }

    const userId = (user.payload as { id?: string; data?: { id?: string } })?.id ??
      (user.payload as { data?: { id?: string } })?.data?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Instagram user ID is missing from the response.' },
        { status: 502 }
      );
    }

    const posts = await fetchGraph('me/media', MEDIA_FIELDS, accessToken);
    if (!posts.response.ok) {
      return NextResponse.json(
        { error: 'Unable to fetch Instagram posts.', details: posts.payload },
        { status: 502 }
      );
    }

    const postData = Array.isArray(posts.payload.data) ? posts.payload.data : [];

    // If the user payload includes a profile picture, surface it to the client.
    const profileImage = ((user.payload as Record<string, unknown>)['profile_picture_url'] as string | undefined) ?? null;

    return NextResponse.json({
      posts: postData,
      profileImage,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Instagram request failed.',
        details: error instanceof Error ? error.message : 'unknown',
      },
      { status: 502 }
    );
  }
}
