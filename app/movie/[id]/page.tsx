// app/movie/[id]/page.tsx
import { getMovieDetails } from '@/lib/tmdb';   // make sure this function exists
import Image from 'next/image';

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovieDetails(id);

  console.log("MOVIE DATA:", movie);   // ← check Vercel logs

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : 'https://picsum.photos/id/1015/600/900';

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-12">
      <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
      <Image src={poster} alt={movie.title} width={500} height={750} unoptimized />
      <p className="mt-6 text-zinc-400">{movie.overview}</p>
    </div>
  );
}