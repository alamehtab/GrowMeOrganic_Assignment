import type { Artwork } from './types';

export interface ArtworksResponse {
    data: any[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
    };
}

export async function fetchArtworks(page = 1, limit = 10): Promise<{ artworks: Artwork[]; pagination: ArtworksResponse['pagination'] }> {
    const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch artworks');
    const json: ArtworksResponse = await res.json();
    const artworks: Artwork[] = json.data.map((item: any) => ({
        id: item.id,
        title: item.title ?? '',
        place_of_origin: item.place_of_origin ?? '',
        artist_display: item.artist_display ?? '',
        inscriptions: item.inscriptions ?? '',
        date_start: item.date_start ?? null,
        date_end: item.date_end ?? null,
    }));

    return { artworks, pagination: json.pagination };
}
